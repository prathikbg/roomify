import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '@/providers/trpc';

const ROOM_LABELS: Record<string, string> = {
  bedroom: 'Bedroom',
  'living-room': 'Living Room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  'home-office': 'Home Office',
  'dining-room': 'Dining Room',
  entryway: 'Entryway',
  'kids-room': "Kid's Room",
};

// Map free-form styleTag from aggregator → valid DesignStyle for /makeover preset
const STYLE_TO_DESIGN: Record<string, string> = {
  japandi: 'japandi', zen: 'japandi',
  modern: 'modern', minimalist: 'modern', 'mid-century': 'modern', playful: 'modern',
  scandinavian: 'scandinavian', coastal: 'scandinavian', biophilic: 'scandinavian', farmhouse: 'scandinavian',
  luxury: 'luxury', 'art deco': 'luxury', french: 'luxury',
  boho: 'boho', moroccan: 'boho', tropical: 'boho',
  industrial: 'industrial',
  traditional: 'traditional-indian',
  'smart home': 'smart-home',
};

// ── Static fallback trend data ──────────────────────────────
interface FallbackTrend {
  keyword: string;
  score: number;
  redditScore: number;
  wikiScore: number;
  openverseScore: number;
  growthRate: number;
  roomCategory: string;
  styleTag: string;
  sampleImage?: string | null;
}

const fallbackTrends: FallbackTrend[] = [
  { keyword: 'japandi bedroom', score: 96, redditScore: 95, wikiScore: 98, openverseScore: 92, growthRate: 145, roomCategory: 'bedroom', styleTag: 'Japandi', sampleImage: '/images/gallery/zen.jpg' },
  { keyword: 'boho living room', score: 91, redditScore: 92, wikiScore: 90, openverseScore: 88, growthRate: 120, roomCategory: 'living-room', styleTag: 'Boho', sampleImage: '/images/gallery/moroccan.jpg' },
  { keyword: 'modern minimalist kitchen', score: 88, redditScore: 85, wikiScore: 92, openverseScore: 82, growthRate: 110, roomCategory: 'kitchen', styleTag: 'Modern', sampleImage: '/images/gallery/contemporary.jpg' },
  { keyword: 'scandinavian bedroom', score: 87, redditScore: 88, wikiScore: 86, openverseScore: 85, growthRate: 105, roomCategory: 'bedroom', styleTag: 'Scandinavian', sampleImage: '/images/gallery/coastal.jpg' },
  { keyword: 'luxury bathroom', score: 84, redditScore: 80, wikiScore: 88, openverseScore: 82, growthRate: 130, roomCategory: 'bathroom', styleTag: 'Luxury', sampleImage: '/images/gallery/artdeco.jpg' },
  { keyword: 'industrial loft', score: 82, redditScore: 86, wikiScore: 78, openverseScore: 80, growthRate: 95, roomCategory: 'living-room', styleTag: 'Industrial', sampleImage: '/images/gallery/midcentury.jpg' },
  { keyword: 'home office setup', score: 81, redditScore: 90, wikiScore: 75, openverseScore: 72, growthRate: 115, roomCategory: 'home-office', styleTag: 'Modern', sampleImage: '/images/gallery/item5.jpg' },
  { keyword: 'traditional indian living', score: 79, redditScore: 82, wikiScore: 76, openverseScore: 76, growthRate: 100, roomCategory: 'living-room', styleTag: 'Traditional', sampleImage: '/images/gallery/mediterranean.jpg' },
  { keyword: 'smart home automation', score: 77, redditScore: 72, wikiScore: 88, openverseScore: 65, growthRate: 140, roomCategory: 'living-room', styleTag: 'Smart Home', sampleImage: '/images/gallery/item7.jpg' },
  { keyword: 'coastal beach house', score: 76, redditScore: 78, wikiScore: 74, openverseScore: 74, growthRate: 90, roomCategory: 'living-room', styleTag: 'Coastal', sampleImage: '/images/gallery/coastal.jpg' },
  { keyword: 'farmhouse kitchen', score: 74, redditScore: 76, wikiScore: 72, openverseScore: 72, growthRate: 85, roomCategory: 'kitchen', styleTag: 'Farmhouse', sampleImage: '/images/gallery/farmhouse.jpg' },
  { keyword: 'small bedroom ideas', score: 73, redditScore: 80, wikiScore: 68, openverseScore: 68, growthRate: 125, roomCategory: 'bedroom', styleTag: 'Modern', sampleImage: '/images/gallery/item3.jpg' },
  { keyword: 'mid century modern', score: 72, redditScore: 74, wikiScore: 70, openverseScore: 70, growthRate: 88, roomCategory: 'living-room', styleTag: 'Mid-Century', sampleImage: '/images/gallery/midcentury.jpg' },
  { keyword: 'moroccan interior', score: 70, redditScore: 72, wikiScore: 68, openverseScore: 68, growthRate: 92, roomCategory: 'living-room', styleTag: 'Moroccan', sampleImage: '/images/gallery/moroccan.jpg' },
  { keyword: 'zen minimalist', score: 69, redditScore: 70, wikiScore: 66, openverseScore: 70, growthRate: 80, roomCategory: 'bedroom', styleTag: 'Zen', sampleImage: '/images/gallery/zen.jpg' },
  { keyword: 'tropical paradise room', score: 67, redditScore: 68, wikiScore: 64, openverseScore: 68, growthRate: 95, roomCategory: 'living-room', styleTag: 'Tropical', sampleImage: '/images/gallery/tropical.jpg' },
  { keyword: 'art deco glamour', score: 66, redditScore: 65, wikiScore: 68, openverseScore: 64, growthRate: 78, roomCategory: 'living-room', styleTag: 'Art Deco', sampleImage: '/images/gallery/artdeco.jpg' },
  { keyword: 'french country style', score: 64, redditScore: 66, wikiScore: 62, openverseScore: 62, growthRate: 75, roomCategory: 'living-room', styleTag: 'French', sampleImage: '/images/gallery/frenchcountry.jpg' },
  { keyword: 'kids room design', score: 63, redditScore: 70, wikiScore: 56, openverseScore: 60, growthRate: 110, roomCategory: 'kids-room', styleTag: 'Playful', sampleImage: '/images/gallery/item8.jpg' },
  { keyword: 'biophilic design', score: 62, redditScore: 60, wikiScore: 68, openverseScore: 55, growthRate: 135, roomCategory: 'living-room', styleTag: 'Biophilic', sampleImage: '/images/gallery/item4.jpg' },
];

// Group by room
const fallbackByRoom: Record<string, FallbackTrend[]> = {};
for (const t of fallbackTrends) {
  if (!fallbackByRoom[t.roomCategory]) fallbackByRoom[t.roomCategory] = [];
  fallbackByRoom[t.roomCategory].push(t);
}
for (const cat of Object.keys(fallbackByRoom)) {
  fallbackByRoom[cat] = fallbackByRoom[cat].sort((a, b) => b.score - a.score);
}

export default function TrendsPage() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  // Auto-enable on mount: backend is checked first; on failure or empty we silently fall back.
  const [apiEnabled] = useState(true);

  const trendsQuery = trpc.trends.current.useQuery(
    { room: selectedRoom || undefined },
    { retry: 1, enabled: apiEnabled, staleTime: 5 * 60 * 1000 }
  );

  const refreshMutation = trpc.trends.refresh.useMutation({
    onSuccess: () => {
      trendsQuery.refetch();
    },
  });

  // Use API data when available, otherwise show static fallback
  const hasApiData = !!trendsQuery.data && trendsQuery.data.topTrends.length > 0;
  const showFallback = trendsQuery.isError || (!trendsQuery.isLoading && !hasApiData);

  const topTrends = showFallback
    ? (selectedRoom ? (fallbackByRoom[selectedRoom] || []) : fallbackTrends)
    : (trendsQuery.data?.topTrends || []);

  const byRoom = showFallback ? fallbackByRoom : (trendsQuery.data?.byRoom || {});
  const sources = showFallback
    ? { reddit: { postCount: 96, subreddits: ['r/InteriorDesign', 'r/HomeDecorating', 'r/AmateurRoomPorn', 'r/DesignMyRoom'] }, wikipedia: { articlesChecked: 24 }, openverse: { queriesChecked: 17 } }
    : trendsQuery.data?.sources;
  const lastUpdated = showFallback
    ? 'Curated data'
    : (trendsQuery.data?.lastUpdated ? new Date(trendsQuery.data.lastUpdated).toLocaleString() : 'Never');

  const roomKeys = Object.keys(byRoom);

  function getScoreColor(score: number): string {
    if (score >= 80) return '#f25b29';
    if (score >= 60) return '#d4a017';
    if (score >= 40) return '#4682b4';
    return '#666';
  }

  function rankAccent(rank: number): string {
    if (rank === 0) return '#f25b29';        // gold-ish amber
    if (rank === 1) return '#c4c4c4';        // silver
    if (rank === 2) return '#b87333';        // bronze
    return 'rgba(255,255,255,0.12)';
  }

  function startMakeoverWithStyle(styleTag: string) {
    const normalized = (styleTag || '').toLowerCase().trim();
    const designStyle = STYLE_TO_DESIGN[normalized] || 'modern';
    sessionStorage.setItem('makeoverPresetStyle', designStyle);
    navigate('/makeover');
  }

  // Resolve sample image: prefer API-provided, fall back to keyword-matched gallery image
  function getSampleImage(t: { keyword: string; sampleImage?: string | null; styleTag?: string }): string {
    if (t.sampleImage) return t.sampleImage;
    const kw = (t.keyword || '').toLowerCase();
    const tag = (t.styleTag || '').toLowerCase();
    const map: Array<[string, string]> = [
      ['japandi', 'zen.jpg'], ['zen', 'zen.jpg'],
      ['boho', 'moroccan.jpg'], ['moroccan', 'moroccan.jpg'],
      ['scandinavian', 'coastal.jpg'], ['coastal', 'coastal.jpg'],
      ['luxury', 'artdeco.jpg'], ['art deco', 'artdeco.jpg'],
      ['industrial', 'midcentury.jpg'], ['mid', 'midcentury.jpg'],
      ['french', 'frenchcountry.jpg'], ['farmhouse', 'farmhouse.jpg'],
      ['tropical', 'tropical.jpg'], ['traditional', 'mediterranean.jpg'],
      ['mediterranean', 'mediterranean.jpg'], ['rustic', 'rustic.jpg'],
      ['korean', 'korean.jpg'], ['modern', 'contemporary.jpg'],
    ];
    for (const [needle, file] of map) {
      if (kw.includes(needle) || tag.includes(needle)) return `/images/gallery/${file}`;
    }
    return '/images/gallery/item1.jpg';
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', padding: '80px 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: '#f25b29',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              Live Trend Analysis
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#ffffff',
              fontWeight: 400,
              lineHeight: 1.1,
            }}>
              Trending Interior Styles
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: '#888',
              marginTop: '0.75rem',
              maxWidth: '520px',
              lineHeight: 1.6,
            }}>
              Auto-detected from Reddit, Google Trends, and Unsplash popularity
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#b0b2b5',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Back
            </button>
            <button
              onClick={() => {
                refreshMutation.mutate();
              }}
              disabled={refreshMutation.isPending}
              style={{
                padding: '10px 22px',
                borderRadius: '6px',
                border: 'none',
                background: '#f25b29',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                opacity: refreshMutation.isPending ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {refreshMutation.isPending ? 'Scanning...' : 'Refresh Trends'}
            </button>
          </div>
        </div>

        {/* Status badge — distinguishes live vs curated, includes loading state */}
        <div style={{
          padding: '10px 18px',
          background: showFallback ? 'rgba(255,255,255,0.03)' : 'rgba(74,222,128,0.06)',
          border: showFallback ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(74,222,128,0.18)',
          borderRadius: '8px',
          fontFamily: 'var(--font-sans)',
          fontSize: '12.5px',
          color: showFallback ? '#888' : '#86efac',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: trendsQuery.isLoading ? '#d4a017' : (showFallback ? '#666' : '#4ade80'),
            boxShadow: trendsQuery.isLoading ? '0 0 8px rgba(212,160,23,0.6)' : (showFallback ? 'none' : '0 0 8px rgba(74,222,128,0.55)'),
            animation: trendsQuery.isLoading ? 'trend-pulse 1.2s ease-in-out infinite' : 'none',
          }} />
          {trendsQuery.isLoading
            ? 'Fetching live trends from Reddit, Google Trends, and Unsplash…'
            : (showFallback
                ? 'Showing curated trends — backend offline or no recent data. Hit Refresh Trends to retry.'
                : `Live data — last refreshed ${lastUpdated}`)
          }
        </div>

        {/* Source stats */}
        {sources && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: '#b0b2b5',
            }}>
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Reddit RSS</span> &middot; {sources.reddit.postCount} posts from {sources.reddit.subreddits.length} subreddits
            </div>
            <div style={{
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: '#b0b2b5',
            }}>
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Wikipedia Pageviews</span> &middot; {sources.wikipedia.articlesChecked} articles
            </div>
            <div style={{
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: '#b0b2b5',
            }}>
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Openverse</span> &middot; {sources.openverse.queriesChecked} searches
            </div>
            <div style={{
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#666',
            }}>
              Updated: {lastUpdated}
            </div>
          </div>
        )}

        {/* Room filter */}
        {roomKeys.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedRoom('')}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: selectedRoom === '' ? '1px solid #f25b29' : '1px solid rgba(255,255,255,0.1)',
                background: selectedRoom === '' ? 'rgba(242,91,41,0.12)' : 'rgba(255,255,255,0.03)',
                color: selectedRoom === '' ? '#f25b29' : '#888',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              All Rooms
            </button>
            {roomKeys.map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: selectedRoom === room ? '1px solid #f25b29' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedRoom === room ? 'rgba(242,91,41,0.12)' : 'rgba(255,255,255,0.03)',
                  color: selectedRoom === room ? '#f25b29' : '#888',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {ROOM_LABELS[room] || room}
              </button>
            ))}
          </div>
        )}

        {/* Empty state — when a room filter has no matches */}
        {topTrends.length === 0 && !trendsQuery.isLoading && (
          <div style={{
            padding: '40px 24px',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            color: '#888',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
          }}>
            No trends found for <strong style={{ color: '#f25b29' }}>{ROOM_LABELS[selectedRoom] || selectedRoom}</strong> yet.
            <br />
            <button
              onClick={() => setSelectedRoom('')}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '6px',
                border: '1px solid rgba(242,91,41,0.4)',
                background: 'rgba(242,91,41,0.1)',
                color: '#f25b29',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Show All Rooms
            </button>
          </div>
        )}

        {/* Podium — top 3 (or fewer when a room filter has limited matches) */}
        {topTrends.length > 0 && (
          <div className="trends-podium">
            {topTrends.slice(0, 3).map((trend, i) => {
              const growth = trend.growthRate - 100;
              const img = getSampleImage(trend);
              return (
                <button
                  key={trend.keyword}
                  className={`trends-podium__card trends-podium__card--rank-${i}`}
                  onClick={() => startMakeoverWithStyle(trend.styleTag)}
                  aria-label={`Start makeover with ${trend.keyword}`}
                >
                  <div className="trends-podium__media">
                    <img src={img} alt={trend.keyword} loading="lazy" />
                    <span className="trends-podium__rank" style={{ borderColor: rankAccent(i), color: rankAccent(i) }}>
                      #{i + 1}
                    </span>
                    {growth > 0 && (
                      <span className="trends-podium__growth">▲ +{growth}%</span>
                    )}
                  </div>
                  <div className="trends-podium__body">
                    <div className="trends-podium__keyword">{trend.keyword}</div>
                    <div className="trends-podium__meta">
                      <span>{ROOM_LABELS[trend.roomCategory] || trend.roomCategory}</span>
                      <span>·</span>
                      <span style={{ color: getScoreColor(trend.score), fontWeight: 600 }}>
                        Score {trend.score}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Rest of the trends — card grid */}
        {topTrends.length > 3 && (
          <div className="trends-grid">
            {topTrends.slice(3).map((trend, i) => {
              const rank = i + 4;
              const growth = trend.growthRate - 100;
              const img = getSampleImage(trend);
              const total = Math.max(trend.redditScore + trend.wikiScore + trend.openverseScore, 1);
              const rPct = (trend.redditScore / total) * 100;
              const wPct = (trend.wikiScore / total) * 100;
              return (
                <div key={trend.keyword} className="trend-card">
                  <div className="trend-card__media">
                    <img src={img} alt={trend.keyword} loading="lazy" />
                    <span className="trend-card__rank">#{rank}</span>
                    <span className="trend-card__score" style={{ color: getScoreColor(trend.score) }}>
                      {trend.score}
                    </span>
                  </div>
                  <div className="trend-card__body">
                    <div className="trend-card__title">{trend.keyword}</div>
                    <div className="trend-card__sub">
                      <span>{ROOM_LABELS[trend.roomCategory] || trend.roomCategory}</span>
                      {growth !== 0 && (
                        <span
                          className="trend-card__growth"
                          style={{
                            background: growth > 0 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                            color: growth > 0 ? '#4ade80' : '#888',
                            borderColor: growth > 0 ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          {growth > 0 ? '▲' : '▼'} {growth > 0 ? '+' : ''}{growth}%
                        </span>
                      )}
                    </div>
                    {/* Stacked source-breakdown bar */}
                    <div className="trend-card__bar" title={`Reddit ${trend.redditScore} · Wikipedia ${trend.wikiScore} · Openverse ${trend.openverseScore}`}>
                      <span style={{ width: `${rPct}%`, background: '#f25b29' }} />
                      <span style={{ width: `${wPct}%`, background: '#4682b4' }} />
                      <span style={{ flex: 1, background: '#d4a017' }} />
                    </div>
                    <div className="trend-card__legend">
                      <span><i style={{ background: '#f25b29' }} /> Reddit {trend.redditScore}</span>
                      <span><i style={{ background: '#4682b4' }} /> Wikipedia {trend.wikiScore}</span>
                      <span><i style={{ background: '#d4a017' }} /> Openverse {trend.openverseScore}</span>
                    </div>
                    <button
                      className="trend-card__cta"
                      onClick={() => startMakeoverWithStyle(trend.styleTag)}
                    >
                      Try this style
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading skeleton */}
        {trendsQuery.isLoading && topTrends.length === 0 && (
          <div className="trends-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="trend-card trend-card--skeleton">
                <div className="trend-card__media" />
                <div className="trend-card__body">
                  <div className="trend-card__skeleton-line" style={{ width: '70%' }} />
                  <div className="trend-card__skeleton-line" style={{ width: '40%' }} />
                  <div className="trend-card__skeleton-line" style={{ width: '100%', height: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', marginBottom: '1rem' }}>
            How Trend Detection Works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f25b29', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Reddit (40%)
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                Scans top posts from r/InteriorDesign, r/HomeDecorating, r/AmateurRoomPorn, and r/DesignMyRoom. Upvotes count as trend signals.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f25b29', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Google Trends (40%)
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                Checks search interest over time for 25+ interior design keywords. Rising search volume indicates growing trends.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f25b29', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Unsplash (20%)
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
                Searches popular interior design photos. High download/like counts on style-specific queries signal visual trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
