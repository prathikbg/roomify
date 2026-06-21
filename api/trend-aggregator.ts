/**
 * Trend Aggregator Engine
 * ========================
 * Pulls interior design trends from multiple free sources,
 * combines them with weighted scoring, and returns ranked results.
 * 
 * Sources:
 * - Reddit (40%): r/InteriorDesign, r/HomeDecorating top posts
 * - Google Trends (40%): Interest over time for keywords
 * - Unsplash (20%): Popular search results for style queries
 */

import { getDb } from "./queries/connection";
import { trends } from "@db/schema";
import { desc, sql } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────

export interface TrendScore {
  keyword: string;
  score: number;
  redditScore: number;
  googleScore: number;
  unsplashScore: number;
  mentions: number;
  growthRate: number;
  roomCategory: string;
  styleTag: string;
  sampleImage: string | null;
}

// ── Keyword Bank ─────────────────────────────────────────────

const INTERIOR_KEYWORDS = [
  // Styles
  "japandi", "boho", "scandinavian", "modern minimalist", "industrial",
  "mid century modern", "art deco", "coastal", "farmhouse", "luxury",
  "traditional indian", "moroccan", "zen", "tropical", "contemporary",
  "rustic", "french country", "korean minimalist", "mediterranean",
  "biophilic design", "dark academia", "warm minimalism", "organic modern",
  " maximalist",
  // Room + Style combos
  "japandi bedroom", "boho living room", "scandinavian kitchen",
  "modern bathroom", "luxury bedroom", "industrial loft",
  "small bedroom ideas", "tv wall design", "home office setup",
  "kids room design", "pooja room design", "entryway decor",
  // Elements
  "accent wall", "floating shelves", "statement lighting",
  "indoor plants decor", "wall paneling", "terrazzo",
  "rattan furniture", "velvet sofa", "marble countertop",
];

const ROOM_CATEGORIES: Record<string, string> = {
  "bedroom": "bedroom",
  "living room": "living-room",
  "kitchen": "kitchen",
  "bathroom": "bathroom",
  "home office": "home-office",
  "dining room": "dining-room",
  "entryway": "entryway",
  "kids room": "kids-room",
  "pooja room": "pooja-room",
  "tv wall": "living-room",
  "loft": "living-room",
  "accent wall": "living-room",
  "floating shelves": "living-room",
};

// ── Reddit Fetcher ───────────────────────────────────────────

interface RedditPost {
  title: string;
  ups: number;
  url: string;
  thumbnail: string;
  subreddit: string;
}

async function fetchRedditTrends(): Promise<{
  posts: RedditPost[];
  keywordScores: Record<string, number>;
}> {
  const subreddits = ["InteriorDesign", "HomeDecorating", "AmateurRoomPorn", "DesignMyRoom"];
  const allPosts: RedditPost[] = [];
  const keywordScores: Record<string, number> = {};

  for (const sub of subreddits) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/top.json?t=week&limit=25`,
        { headers: { "User-Agent": "Roomify-TrendBot/1.0" } }
      );
      if (!res.ok) continue;

      const data = (await res.json()) as {
        data: { children: Array<{ data: { title: string; ups: number; url: string; thumbnail: string; subreddit: string } }> };
      };

      for (const child of data.data.children) {
        const post = child.data;
        allPosts.push({
          title: post.title,
          ups: post.ups,
          url: post.url,
          thumbnail: post.thumbnail?.startsWith("http") ? post.thumbnail : "",
          subreddit: post.subreddit,
        });

        // Score keywords found in title
        const titleLower = post.title.toLowerCase();
        for (const kw of INTERIOR_KEYWORDS) {
          if (titleLower.includes(kw.toLowerCase())) {
            keywordScores[kw] = (keywordScores[kw] || 0) + post.ups;
          }
        }
      }
    } catch {
      // Skip failing subreddits
    }
  }

  return { posts: allPosts, keywordScores };
}

// ── Google Trends Fetcher ────────────────────────────────────

// google-trends-api uses CommonJS, handle the import
let googleTrendsApi: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  googleTrendsApi = require("google-trends-api");
} catch {
  googleTrendsApi = null;
}

async function fetchGoogleTrends(): Promise<Record<string, number>> {
  if (!googleTrendsApi) return {};

  const scores: Record<string, number> = {};
  // Check top keywords, limit to avoid rate limits
  const keywordsToCheck = INTERIOR_KEYWORDS.slice(0, 10);

  for (const kw of keywordsToCheck) {
    try {
      const result = await googleTrendsApi.interestOverTime({
        keyword: kw,
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        geo: "",
        category: 44, // Home & Garden
      });

      const data = JSON.parse(result) as {
        default: {
          timelineData: Array<{
            value: number[];
            formattedValue: string[];
          }>;
        };
      };

      const values = data.default.timelineData.map((t) => t.value[0] || 0);
      if (values.length >= 2) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
        // Growth = how much recent beats average
        const growth = avg > 0 ? (recent / avg) * 100 : 50;
        scores[kw] = Math.round(growth);
      } else {
        scores[kw] = 50;
      }
    } catch {
      scores[kw] = 50; // neutral score on error
    }
  }

  return scores;
}

// ── Unsplash Fetcher ─────────────────────────────────────────

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

async function fetchUnsplashTrends(): Promise<{
  keywordScores: Record<string, number>;
  images: Record<string, string>;
}> {
  const keywordScores: Record<string, number> = {};
  const images: Record<string, string> = {};

  if (!UNSPLASH_ACCESS_KEY) {
    // Still try to search without auth (limited)
    return { keywordScores: {}, images: {} };
  }

  const queries = [
    "interior-design", "scandinavian-bedroom", "modern-living-room",
    "japandi-interior", "boho-room", "minimalist-kitchen",
    "luxury-bedroom", "industrial-loft", "farmhouse-decor",
  ];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=5&order_by=popular`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (!res.ok) continue;

      const data = (await res.json()) as {
        total: number;
        results: Array<{ likes: number; urls: { small: string }; alt_description: string | null }>;
      };

      // Score based on total results + avg likes
      const avgLikes = data.results.reduce((s, r) => s + r.likes, 0) / Math.max(data.results.length, 1);
      const score = Math.min(data.total / 100 + avgLikes, 200);

      // Map query to keyword
      const keyword = q.replace(/-/g, " ");
      keywordScores[keyword] = Math.round(score);

      // Store first image as sample
      if (data.results[0]) {
        images[keyword] = data.results[0].urls.small;
      }
    } catch {
      // Skip
    }
  }

  return { keywordScores, images };
}

// ── Scoring Engine ───────────────────────────────────────────

function combineScores(
  redditScores: Record<string, number>,
  googleScores: Record<string, number>,
  unsplashScores: Record<string, number>,
  unsplashImages: Record<string, string>,
  redditPosts: RedditPost[]
): TrendScore[] {
  const allKeywords = new Set([
    ...Object.keys(redditScores),
    ...Object.keys(googleScores),
    ...Object.keys(unsplashScores),
  ]);

  const maxReddit = Math.max(...Object.values(redditScores), 1);
  const maxGoogle = Math.max(...Object.values(googleScores), 100);
  const maxUnsplash = Math.max(...Object.values(unsplashScores), 1);

  const results: TrendScore[] = [];

  for (const kw of allKeywords) {
    const rNorm = ((redditScores[kw] || 0) / maxReddit) * 100;
    const gNorm = ((googleScores[kw] || 50) / maxGoogle) * 100;
    const uNorm = ((unsplashScores[kw] || 0) / maxUnsplash) * 100;

    // Weighted: Reddit 40%, Google 40%, Unsplash 20%
    const weighted = rNorm * 0.4 + gNorm * 0.4 + uNorm * 0.2;

    // Determine room category
    let roomCategory = "living-room";
    for (const [roomKey, cat] of Object.entries(ROOM_CATEGORIES)) {
      if (kw.includes(roomKey)) {
        roomCategory = cat;
        break;
      }
    }

    // Find sample image from Reddit posts mentioning this keyword
    let sampleImage = unsplashImages[kw] || null;
    if (!sampleImage) {
      const kwLower = kw.toLowerCase();
      const matchingPost = redditPosts.find((p) =>
        p.title.toLowerCase().includes(kwLower) && p.thumbnail
      );
      if (matchingPost) sampleImage = matchingPost.thumbnail;
    }

    results.push({
      keyword: kw,
      score: Math.round(weighted),
      redditScore: Math.round(rNorm),
      googleScore: Math.round(gNorm),
      unsplashScore: Math.round(uNorm),
      mentions: redditScores[kw] || 0,
      growthRate: googleScores[kw] || 50,
      roomCategory,
      styleTag: kw.split(" ")[0],
      sampleImage,
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

// ── Public API ───────────────────────────────────────────────

export interface TrendResult {
  topTrends: TrendScore[];
  byRoom: Record<string, TrendScore[]>;
  lastUpdated: string;
  sources: {
    reddit: { postCount: number; subreddits: string[] };
    google: { keywordsChecked: number };
    unsplash: { queriesChecked: number };
  };
}

/**
 * Fetch fresh trends from all sources and cache them.
 * This is the main entry point.
 */
export async function fetchAndCacheTrends(): Promise<TrendResult> {
  // 1. Fetch from all sources in parallel
  const [{ posts, keywordScores: redditScores }, googleScores, { keywordScores: unsplashScores, images: unsplashImages }] =
    await Promise.all([
      fetchRedditTrends(),
      fetchGoogleTrends(),
      fetchUnsplashTrends(),
    ]);

  // 2. Combine scores
  const ranked = combineScores(redditScores, googleScores, unsplashScores, unsplashImages, posts);

  // 3. Group by room category
  const byRoom: Record<string, TrendScore[]> = {};
  for (const t of ranked) {
    if (!byRoom[t.roomCategory]) byRoom[t.roomCategory] = [];
    byRoom[t.roomCategory].push(t);
  }
  // Sort each room category
  for (const cat of Object.keys(byRoom)) {
    byRoom[cat] = byRoom[cat].sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // 4. Cache in database
  try {
    const db = getDb();
    // Clear old cached trends (keep last 3 days)
    await db.delete(trends).where(
      sql`fetched_at < DATE_SUB(NOW(), INTERVAL 3 DAY)`
    );

    // Insert new trends
    const top30 = ranked.slice(0, 30);
    for (const t of top30) {
      await db.insert(trends).values({
        keyword: t.keyword,
        source: "aggregated",
        score: t.score,
        mentions: t.mentions,
        growthRate: t.growthRate,
        roomCategory: t.roomCategory,
        styleTag: t.styleTag,
        sampleImage: t.sampleImage,
        data: {
          redditScore: t.redditScore,
          googleScore: t.googleScore,
          unsplashScore: t.unsplashScore,
        },
      });
    }
  } catch {
    // DB caching is optional — don't fail if DB unavailable
  }

  // 5. Return result
  return {
    topTrends: ranked.slice(0, 20),
    byRoom,
    lastUpdated: new Date().toISOString(),
    sources: {
      reddit: {
        postCount: posts.length,
        subreddits: ["r/InteriorDesign", "r/HomeDecorating", "r/AmateurRoomPorn", "r/DesignMyRoom"],
      },
      google: { keywordsChecked: Object.keys(googleScores).length },
      unsplash: { queriesChecked: Object.keys(unsplashScores).length },
    },
  };
}

/**
 * Get cached trends from the database.
 * Returns null if no recent data exists.
 */
export async function getCachedTrends(): Promise<TrendResult | null> {
  try {
    const db = getDb();
    const cached = await db
      .select()
      .from(trends)
      .orderBy(desc(trends.fetchedAt))
      .limit(30);

    if (cached.length === 0) return null;

    const topTrends: TrendScore[] = cached.map((c) => ({
      keyword: c.keyword,
      score: c.score || 0,
      redditScore: (c.data as Record<string, number>)?.redditScore || 0,
      googleScore: (c.data as Record<string, number>)?.googleScore || 0,
      unsplashScore: (c.data as Record<string, number>)?.unsplashScore || 0,
      mentions: c.mentions || 0,
      growthRate: c.growthRate || 0,
      roomCategory: c.roomCategory || "living-room",
      styleTag: c.styleTag || "",
      sampleImage: c.sampleImage,
    }));

    const byRoom: Record<string, TrendScore[]> = {};
    for (const t of topTrends) {
      if (!byRoom[t.roomCategory]) byRoom[t.roomCategory] = [];
      byRoom[t.roomCategory].push(t);
    }

    return {
      topTrends,
      byRoom,
      lastUpdated: cached[0]?.fetchedAt?.toISOString?.() || new Date().toISOString(),
      sources: {
        reddit: { postCount: 0, subreddits: [] },
        google: { keywordsChecked: 0 },
        unsplash: { queriesChecked: 0 },
      },
    };
  } catch {
    return null;
  }
}

/**
 * Get trends (cached or fresh).
 * If cached data is < 6 hours old, use it. Otherwise fetch fresh.
 */
export async function getTrends(useFresh = false): Promise<TrendResult> {
  if (!useFresh) {
    const cached = await getCachedTrends();
    if (cached) {
      const age = Date.now() - new Date(cached.lastUpdated).getTime();
      if (age < 6 * 60 * 60 * 1000) {
        // Less than 6 hours old
        return cached;
      }
    }
  }

  return fetchAndCacheTrends();
}
