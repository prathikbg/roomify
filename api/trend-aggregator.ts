/**
 * Trend Aggregator Engine
 * ========================
 * Pulls interior design trends from free, no-key sources,
 * combines them with weighted scoring, and returns ranked results.
 *
 * Sources:
 * - Wikipedia Pageviews (50%): real growth signal per style article
 * - Openverse (30%): CC-licensed image popularity + sample images
 * - Reddit RSS    (20%): best-effort top posts from interior subreddits
 */

import { getDb } from "./queries/connection";
import { trends } from "@db/schema";
import { desc, sql } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────

export interface TrendScore {
  keyword: string;
  score: number;
  redditScore: number;
  wikiScore: number;
  openverseScore: number;
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

// ── Reddit RSS Fetcher (no auth, best-effort) ────────────────
// Reddit's JSON endpoints 403 generic UAs; the RSS feeds accept browser-style
// UAs but rate-limit to ~1 req/min. We use the multi-subreddit URL to grab
// 50 top posts from all four subs in a single request.

interface RedditPost {
  title: string;
  ups: number;
  url: string;
  thumbnail: string;
  subreddit: string;
}

const REDDIT_SUBS = ["InteriorDesign", "HomeDecorating", "AmateurRoomPorn", "DesignMyRoom"];
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchRedditTrends(): Promise<{
  posts: RedditPost[];
  keywordScores: Record<string, number>;
}> {
  const allPosts: RedditPost[] = [];
  const keywordScores: Record<string, number> = {};

  try {
    const url = `https://www.reddit.com/r/${REDDIT_SUBS.join("+")}/top.rss?t=week&limit=50`;
    const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
    if (!res.ok) return { posts: [], keywordScores: {} };

    const xml = await res.text();
    // Atom <entry>...</entry> blocks
    const entries = xml.split("<entry>").slice(1);

    for (const block of entries) {
      // Last <title>...</title> within the entry is the post title (first is feed root)
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const thumbMatch = block.match(/<media:thumbnail\s+url="([^"]+)"/);
      const catMatch = block.match(/<category\s+term="([^"]+)"/);
      const linkMatch = block.match(/<link\s+href="([^"]+)"/);
      if (!titleMatch) continue;

      const title = decodeXmlEntities(titleMatch[1]).trim();
      const thumbnail = thumbMatch ? decodeXmlEntities(thumbMatch[1]) : "";
      const subreddit = catMatch ? catMatch[1] : "";
      const url = linkMatch ? decodeXmlEntities(linkMatch[1]) : "";

      allPosts.push({ title, ups: 1, url, thumbnail, subreddit });

      const titleLower = title.toLowerCase();
      for (const kw of INTERIOR_KEYWORDS) {
        if (titleLower.includes(kw.toLowerCase())) {
          keywordScores[kw] = (keywordScores[kw] || 0) + 1;
        }
      }
    }
  } catch {
    // Reddit is best-effort — fall through with empty results
  }

  return { posts: allPosts, keywordScores };
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

// ── Wikipedia Pageviews Fetcher (no key, real growth signal) ─

/**
 * Maps our internal keyword to a Wikipedia article slug. Keywords missing here
 * get a neutral score and no growth signal — they can still rank via Reddit /
 * Openverse but won't appear as "rising".
 */
const WIKI_ARTICLE_MAP: Record<string, string> = {
  japandi: "Japandi",
  boho: "Bohemianism",
  scandinavian: "Scandinavian_design",
  "modern minimalist": "Minimalism_(visual_arts)",
  industrial: "Industrial_style",
  "mid century modern": "Mid-century_modern",
  "art deco": "Art_Deco",
  coastal: "Coastal_New_England",
  farmhouse: "Farmhouse",
  luxury: "Luxury_goods",
  "traditional indian": "Indian_architecture",
  moroccan: "Moroccan_riad",
  zen: "Japanese_rock_garden",
  tropical: "Tropical_architecture",
  contemporary: "Contemporary_architecture",
  rustic: "Rustic_architecture",
  "french country": "French_provincial",
  mediterranean: "Mediterranean_Revival_architecture",
  "biophilic design": "Biophilic_design",
  "dark academia": "Dark_academia",
  "warm minimalism": "Minimalism",
  "organic modern": "Organic_architecture",
  terrazzo: "Terrazzo",
  "accent wall": "Accent_wall",
};

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function fetchWikipediaTrends(): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startStr = ymd(start);
  const endStr = ymd(end);

  for (const [kw, article] of Object.entries(WIKI_ARTICLE_MAP)) {
    try {
      const url =
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/` +
        `all-access/user/${encodeURIComponent(article)}/daily/${startStr}/${endStr}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Roomify/1.0 (contact: dev@roomify.local)" },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as { items?: Array<{ views: number }> };
      const views = (data.items || []).map((i) => i.views || 0);
      if (views.length < 14) {
        scores[kw] = 100;
        continue;
      }
      const recent = views.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const prior = views.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
      scores[kw] = prior > 0 ? Math.round((recent / prior) * 100) : 100;
    } catch {
      // skip — leaves keyword unscored (defaults to neutral in combineScores)
    }
  }

  return scores;
}

// ── Openverse Fetcher (no key, CC-licensed images + popularity) ──

async function fetchOpenverseTrends(): Promise<{
  keywordScores: Record<string, number>;
  images: Record<string, string>;
}> {
  const keywordScores: Record<string, number> = {};
  const images: Record<string, string> = {};

  // Force interior-design context on every query. Quote multi-word style names
  // so Openverse phrase-matches instead of OR-splitting (which returns NASA
  // satellites for "industrial loft", etc.).
  const queries: Array<{ keyword: string; query: string }> = [
    // Style-only (default to living-room)
    { keyword: "japandi", query: `"japandi" interior` },
    { keyword: "scandinavian", query: `"scandinavian" interior design` },
    { keyword: "boho", query: `"boho" interior room` },
    { keyword: "modern minimalist", query: `"minimalist" interior room` },
    { keyword: "industrial", query: `"industrial" loft interior` },
    { keyword: "mid century modern", query: `"mid century" interior living room` },
    { keyword: "art deco", query: `"art deco" interior room` },
    { keyword: "luxury", query: `"luxury" bedroom interior` },
    { keyword: "moroccan", query: `"moroccan" interior decor` },
    { keyword: "biophilic design", query: `"biophilic" interior plants` },
    { keyword: "industrial loft", query: `"industrial loft" interior` },
    // Bedroom combos
    { keyword: "japandi bedroom", query: `"japandi" bedroom interior` },
    { keyword: "scandinavian bedroom", query: `"scandinavian" bedroom interior` },
    { keyword: "modern bedroom", query: `"modern" bedroom interior` },
    { keyword: "luxury bedroom", query: `"luxury" bedroom interior` },
    { keyword: "boho bedroom", query: `"boho" bedroom interior` },
    { keyword: "minimalist bedroom", query: `"minimalist" bedroom interior` },
    // Living-room combos
    { keyword: "boho living room", query: `"boho" living room interior` },
    { keyword: "modern living room", query: `"modern" living room interior` },
    { keyword: "scandinavian living room", query: `"scandinavian" living room interior` },
    // Kitchen combos
    { keyword: "scandinavian kitchen", query: `"scandinavian" kitchen interior` },
    { keyword: "modern kitchen", query: `"modern" kitchen interior` },
    { keyword: "farmhouse kitchen", query: `"farmhouse" kitchen interior` },
    { keyword: "minimalist kitchen", query: `"minimalist" kitchen interior` },
    { keyword: "industrial kitchen", query: `"industrial" kitchen interior` },
    // Bathroom combos
    { keyword: "modern bathroom", query: `"modern" bathroom interior` },
    { keyword: "luxury bathroom", query: `"luxury" bathroom interior` },
    { keyword: "scandinavian bathroom", query: `"scandinavian" bathroom interior` },
    { keyword: "minimalist bathroom", query: `"minimalist" bathroom interior` },
    // Home-office combos
    { keyword: "home office setup", query: `"home office" interior desk` },
    { keyword: "modern home office", query: `"modern" "home office" interior` },
    { keyword: "minimalist home office", query: `"minimalist" "home office" interior` },
    { keyword: "scandinavian home office", query: `"scandinavian" "home office" interior` },
  ];

  // Scoring filter: a result must (a) not mention an obvious non-interior
  // subject and (b) contain both the style keyword AND at least one interior
  // term in its title or tags. Higher score = stronger match.
  const INTERIOR_TERMS = [
    "interior", "room", "bedroom", "living room", "kitchen", "bathroom",
    "decor", "apartment", "studio", "loft", "sofa", "couch",
  ];
  const REJECT_TERMS = [
    "satellite", "spacecraft", "rocket", "nasa", "ladee", "engine",
    "ship", "vehicle", "aircraft", "building exterior", "factory",
    "dry dock", "machinery", "warehouse exterior", "facade", "street",
    "post office", "church", "cathedral", "museum exterior", "park",
    "landscape", "portrait", "wedding", "food", "car", "boat",
  ];

  function pickInteriorImage(
    results: Array<{ url?: string; thumbnail?: string; title?: string; tags?: Array<{ name: string }> }>,
    keywordTokens: string[]
  ): string | null {
    let best: { score: number; url: string } | null = null;
    for (const r of results) {
      const title = (r.title || "").toLowerCase();
      const tagText = (r.tags || []).map((t) => t.name).join(" ").toLowerCase();
      const haystack = `${title} ${tagText}`;
      if (REJECT_TERMS.some((t) => haystack.includes(t))) continue;

      const interiorHits = INTERIOR_TERMS.filter((t) => haystack.includes(t)).length;
      const keywordHits = keywordTokens.filter((t) => haystack.includes(t)).length;
      const titleKeywordHits = keywordTokens.filter((t) => title.includes(t)).length;

      // Require at least one keyword hit AND one interior term
      if (keywordHits === 0 || interiorHits === 0) continue;

      const url = r.url || r.thumbnail;
      if (!url) continue;

      // Title hits weigh more than tag hits
      const score = titleKeywordHits * 3 + keywordHits * 1 + interiorHits;
      if (!best || score > best.score) best = { score, url };
    }
    return best ? best.url : null;
  }

  for (const { keyword, query } of queries) {
    try {
      const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=10&category=photograph`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = (await res.json()) as {
        result_count?: number;
        results?: Array<{ url?: string; thumbnail?: string; title?: string; tags?: Array<{ name: string }> }>;
      };
      const total = data.result_count || 0;
      // Tokenize the keyword for the filter (split on spaces, ignore stopwords)
      const tokens = keyword
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 2 && !["the", "and", "for"].includes(t));
      const picked = pickInteriorImage(data.results || [], tokens);

      // Normalize: 0 → 0, 1000+ → 200 (cap). Sqrt-ish curve.
      keywordScores[keyword] = Math.min(Math.round(Math.sqrt(total) * 6), 200);
      if (picked) images[keyword] = picked;
    } catch {
      // Skip
    }
  }

  return { keywordScores, images };
}

// ── Scoring Engine ───────────────────────────────────────────

function combineScores(
  redditScores: Record<string, number>,
  wikiScores: Record<string, number>,
  openverseScores: Record<string, number>,
  openverseImages: Record<string, string>,
  redditPosts: RedditPost[]
): TrendScore[] {
  const allKeywords = new Set([
    ...Object.keys(redditScores),
    ...Object.keys(wikiScores),
    ...Object.keys(openverseScores),
  ]);

  const maxReddit = Math.max(...Object.values(redditScores), 1);
  const maxWiki = Math.max(...Object.values(wikiScores), 100);
  const maxOpenverse = Math.max(...Object.values(openverseScores), 1);

  const results: TrendScore[] = [];

  for (const kw of allKeywords) {
    const rNorm = ((redditScores[kw] || 0) / maxReddit) * 100;
    const wNorm = ((wikiScores[kw] || 100) / maxWiki) * 100;
    const oNorm = ((openverseScores[kw] || 0) / maxOpenverse) * 100;

    // Weighted: Wikipedia 50% (real growth), Openverse 30%, Reddit 20%
    const weighted = wNorm * 0.5 + oNorm * 0.3 + rNorm * 0.2;

    // Determine room category
    let roomCategory = "living-room";
    for (const [roomKey, cat] of Object.entries(ROOM_CATEGORIES)) {
      if (kw.includes(roomKey)) {
        roomCategory = cat;
        break;
      }
    }

    // Prefer Openverse image; fall back to a matching Reddit thumbnail.
    let sampleImage = openverseImages[kw] || null;
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
      wikiScore: Math.round(wNorm),
      openverseScore: Math.round(oNorm),
      mentions: redditScores[kw] || 0,
      growthRate: wikiScores[kw] || 100,
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
    wikipedia: { articlesChecked: number };
    openverse: { queriesChecked: number };
  };
}

/**
 * Fetch fresh trends from all sources and cache them.
 * This is the main entry point.
 */
export async function fetchAndCacheTrends(): Promise<TrendResult> {
  // 1. Fetch from all sources in parallel
  const [
    { posts, keywordScores: redditScores },
    wikiScores,
    { keywordScores: openverseScores, images: openverseImages },
  ] = await Promise.all([
    fetchRedditTrends(),
    fetchWikipediaTrends(),
    fetchOpenverseTrends(),
  ]);

  // 2. Combine scores
  const ranked = combineScores(redditScores, wikiScores, openverseScores, openverseImages, posts);

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
          wikiScore: t.wikiScore,
          openverseScore: t.openverseScore,
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
        subreddits: REDDIT_SUBS.map((s) => `r/${s}`),
      },
      wikipedia: { articlesChecked: Object.keys(wikiScores).length },
      openverse: { queriesChecked: Object.keys(openverseScores).length },
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

    const topTrends: TrendScore[] = cached.map((c) => {
      const d = (c.data as Record<string, number>) || {};
      return {
        keyword: c.keyword,
        score: c.score || 0,
        redditScore: d.redditScore || 0,
        wikiScore: d.wikiScore ?? d.googleScore ?? 0,
        openverseScore: d.openverseScore ?? d.unsplashScore ?? 0,
        mentions: c.mentions || 0,
        growthRate: c.growthRate || 0,
        roomCategory: c.roomCategory || "living-room",
        styleTag: c.styleTag || "",
        sampleImage: c.sampleImage,
      };
    });

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
        wikipedia: { articlesChecked: 0 },
        openverse: { queriesChecked: 0 },
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
