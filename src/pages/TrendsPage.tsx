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

// ── Static fallback trend data ──────────────────────────────
interface FallbackTrend {
  keyword: string;
  score: number;
  redditScore: number;
  googleScore: number;
  unsplashScore: number;
  growthRate: number;
  roomCategory: string;
  styleTag: string;
}

const fallbackTrends: FallbackTrend[] = [
  { keyword: 'japandi bedroom', score: 96, redditScore: 95, googleScore: 98, unsplashScore: 92, growthRate: 145, roomCategory: 'bedroom', styleTag: 'Japandi' },
  { keyword: 'boho living room', score: 91, redditScore: 92, googleScore: 90, unsplashScore: 88, growthRate: 120, roomCategory: 'living-room', styleTag: 'Boho' },
  { keyword: 'modern minimalist kitchen', score: 88, redditScore: 85, googleScore: 92, unsplashScore: 82, growthRate: 110, roomCategory: 'kitchen', styleTag: 'Modern' },
  { keyword: 'scandinavian bedroom', score: 87, redditScore: 88, googleScore: 86, unsplashScore: 85, growthRate: 105, roomCategory: 'bedroom', styleTag: 'Scandinavian' },
  { keyword: 'luxury bathroom', score: 84, redditScore: 80, googleScore: 88, unsplashScore: 82, growthRate: 130, roomCategory: 'bathroom', styleTag: 'Luxury' },
  { keyword: 'industrial loft', score: 82, redditScore: 86, googleScore: 78, unsplashScore: 80, growthRate: 95, roomCategory: 'living-room', styleTag: 'Industrial' },
  { keyword: 'home office setup', score: 81, redditScore: 90, googleScore: 75, unsplashScore: 72, growthRate: 115, roomCategory: 'home-office', styleTag: 'Modern' },
  { keyword: 'traditional indian living', score: 79, redditScore: 82, googleScore: 76, unsplashScore: 76, growthRate: 100, roomCategory: 'living-room', styleTag: 'Traditional' },
  { keyword: 'smart home automation', score: 77, redditScore: 72, googleScore: 88, unsplashScore: 65, growthRate: 140, roomCategory: 'living-room', styleTag: 'Smart Home' },
  { keyword: 'coastal beach house', score: 76, redditScore: 78, googleScore: 74, unsplashScore: 74, growthRate: 90, roomCategory: 'living-room', styleTag: 'Coastal' },
  { keyword: 'farmhouse kitchen', score: 74, redditScore: 76, googleScore: 72, unsplashScore: 72, growthRate: 85, roomCategory: 'kitchen', styleTag: 'Farmhouse' },
  { keyword: 'small bedroom ideas', score: 73, redditScore: 80, googleScore: 68, unsplashScore: 68, growthRate: 125, roomCategory: 'bedroom', styleTag: 'Modern' },
  { keyword: 'mid century modern', score: 72, redditScore: 74, googleScore: 70, unsplashScore: 70, growthRate: 88, roomCategory: 'living-room', styleTag: 'Mid-Century' },
  { keyword: 'moroccan interior', score: 70, redditScore: 72, googleScore: 68, unsplashScore: 68, growthRate: 92, roomCategory: 'living-room', styleTag: 'Moroccan' },
  { keyword: 'zen minimalist', score: 69, redditScore: 70, googleScore: 66, unsplashScore: 70, growthRate: 80, roomCategory: 'bedroom', styleTag: 'Zen' },
  { keyword: 'tropical paradise room', score: 67, redditScore: 68, googleScore: 64, unsplashScore: 68, growthRate: 95, roomCategory: 'living-room', styleTag: 'Tropical' },
  { keyword: 'art deco glamour', score: 66, redditScore: 65, googleScore: 68, unsplashScore: 64, growthRate: 78, roomCategory: 'living-room', styleTag: 'Art Deco' },
  { keyword: 'french country style', score: 64, redditScore: 66, googleScore: 62, unsplashScore: 62, growthRate: 75, roomCategory: 'living-room', styleTag: 'French' },
  { keyword: 'kids room design', score: 63, redditScore: 70, googleScore: 56, unsplashScore: 60, growthRate: 110, roomCategory: 'kids-room', styleTag: 'Playful' },
  { keyword: 'biophilic design', score: 62, redditScore: 60, googleScore: 68, unsplashScore: 55, growthRate: 135, roomCategory: 'living-room', styleTag: 'Biophilic' },
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
  const [apiEnabled, setApiEnabled] = useState(false);

  const trendsQuery = trpc.trends.current.useQuery(
    { room: selectedRoom || undefined },
    { retry: 1, enabled: apiEnabled }
  );

  const refreshMutation = trpc.trends.refresh.useMutation({
    onSuccess: () => {
      trendsQuery.refetch();
    },
  });

  // Use API data only when backend is available, otherwise show static fallback
  const hasApiData = trendsQuery.data && trendsQuery.data.topTrends.length > 0;
  const showFallback = !apiEnabled || trendsQuery.isError || (!trendsQuery.isLoading && !hasApiData);

  const topTrends = showFallback
    ? (selectedRoom ? (fallbackByRoom[selectedRoom] || []) : fallbackTrends)
    : (trendsQuery.data?.topTrends || []);

  const byRoom = showFallback ? fallbackByRoom : (trendsQuery.data?.byRoom || {});
  const sources = showFallback
    ? { reddit: { postCount: 96, subreddits: ['r/InteriorDesign', 'r/HomeDecorating', 'r/AmateurRoomPorn', 'r/DesignMyRoom'] }, google: { keywordsChecked: 25 }, unsplash: { queriesChecked: 9 } }
    : trendsQuery.data?.sources;
  const lastUpdated = showFallback
    ? 'Static data (no backend)'
    : (trendsQuery.data?.lastUpdated ? new Date(trendsQuery.data.lastUpdated).toLocaleString() : 'Never');

  const roomKeys = Object.keys(byRoom);

  function getScoreColor(score: number): string {
    if (score >= 80) return '#f25b29';
    if (score >= 60) return '#d4a017';
    if (score >= 40) return '#4682b4';
    return '#666';
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
            {showFallback && (
              <button
                onClick={() => { setApiEnabled(true); trendsQuery.refetch(); }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '6px',
                  border: '1px solid rgba(242,91,41,0.4)',
                  background: 'transparent',
                  color: '#f25b29',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Try Live API
              </button>
            )}
            <button
              onClick={() => {
                if (!apiEnabled) setApiEnabled(true);
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

        {/* Fallback badge */}
        {showFallback && (
          <div style={{
            padding: '10px 18px',
            background: 'rgba(242,91,41,0.08)',
            border: '1px solid rgba(242,91,41,0.2)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#f25b29',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f25b29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Showing curated trend data. Click "Try Live API" or "Refresh Trends" to fetch real-time data from Reddit, Google Trends, and Unsplash when the backend is running.
          </div>
        )}

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
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Reddit</span> &middot; {sources.reddit.postCount} posts from {sources.reddit.subreddits.length} subreddits
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
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Google Trends</span> &middot; {sources.google.keywordsChecked} keywords
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
              <span style={{ color: '#f25b29', fontWeight: 500 }}>Unsplash</span> &middot; {sources.unsplash.queriesChecked} searches
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

        {/* Top Trends Table */}
        {topTrends.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 100px 100px 100px 100px 80px',
              gap: '8px',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              <div>#</div>
              <div>Style / Keyword</div>
              <div style={{ textAlign: 'center' }}>Score</div>
              <div style={{ textAlign: 'center' }}>Reddit</div>
              <div style={{ textAlign: 'center' }}>Google</div>
              <div style={{ textAlign: 'center' }}>Unsplash</div>
              <div style={{ textAlign: 'center' }}>Growth</div>
            </div>

            {/* Trend rows */}
            {topTrends.map((trend, i) => (
              <div
                key={trend.keyword}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 100px 100px 100px 100px 80px',
                  gap: '8px',
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: i < 3 ? '#f25b29' : '#666',
                  fontWeight: i < 3 ? 600 : 400,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    color: '#fff',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}>
                    {trend.keyword}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: '2px',
                  }}>
                    {ROOM_LABELS[trend.roomCategory] || trend.roomCategory}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: getScoreColor(trend.score),
                  }}>
                    {trend.score}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888' }}>
                    {trend.redditScore}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888' }}>
                    {trend.googleScore}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888' }}>
                    {trend.unsplashScore}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: trend.growthRate > 100 ? '#4ade80' : '#888',
                  }}>
                    {trend.growthRate > 100 ? '+' : ''}{trend.growthRate - 100}%
                  </span>
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
