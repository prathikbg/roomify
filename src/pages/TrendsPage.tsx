import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DesignStyle } from '../types/makeover';

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

// ── Curated editorial trend catalog ──────────────────────────
// Hand-tuned for the "what's in this week" feel. Each entry maps
// to a DesignStyle so the "Try this look" CTA can preselect it.
interface TrendStyle {
  id: DesignStyle;
  rank: number;
  name: string;
  room: string;
  tagline: string;
  image: string;
  score: number;
  growth: number; // % week-over-week
}

const RISING: TrendStyle[] = [
  { id: 'japandi', rank: 1, name: 'Japandi', room: 'bedroom', image: '/images/gallery/zen.jpg',
    tagline: 'Bamboo, rice paper, ink-stone calm — the antidote to maximalism.', score: 96, growth: 45 },
  { id: 'boho', rank: 2, name: 'Boho Revival', room: 'living-room', image: '/images/gallery/item1.jpg',
    tagline: 'Earth-tone rattan, layered textiles, plants treated as architecture.', score: 91, growth: 20 },
  { id: 'modern', rank: 3, name: 'Quiet Modern', room: 'kitchen', image: '/images/gallery/contemporary.jpg',
    tagline: 'Stone counters, handleless cabinets, one statement light.', score: 88, growth: 10 },
  { id: 'scandinavian', rank: 4, name: 'New Scandi', room: 'bedroom', image: '/images/gallery/coastal.jpg',
    tagline: 'Warmer woods, softer whites, a hint of moss.', score: 87, growth: 5 },
  { id: 'luxury', rank: 5, name: 'Italian Luxe', room: 'bathroom', image: '/images/gallery/artdeco.jpg',
    tagline: 'Travertine, brushed brass, sculptural pendants.', score: 84, growth: 30 },
  { id: 'industrial', rank: 6, name: 'Industrial Soft', room: 'living-room', image: '/images/gallery/midcentury.jpg',
    tagline: 'Loft bones — but with linen, leather, and clay.', score: 82, growth: -5 },
  { id: 'traditional-indian', rank: 7, name: 'Modern Heritage', room: 'living-room', image: '/images/gallery/mediterranean.jpg',
    tagline: 'Carved jaali, brass inlays, deep teal & marigold.', score: 79, growth: 8 },
  { id: 'smart-home', rank: 8, name: 'Ambient Tech', room: 'home-office', image: '/images/gallery/item7.jpg',
    tagline: 'Invisible automation, warm screens, voice-first interiors.', score: 77, growth: 40 },
  { id: 'japandi', rank: 9, name: 'Wabi-Sabi Bath', room: 'bathroom', image: '/images/gallery/korean.jpg',
    tagline: 'Imperfect stone, raw wood, candlelight rituals.', score: 74, growth: 18 },
];

const COOLING: { name: string; reason: string; decline: number }[] = [
  { name: 'All-grey everything', reason: 'Too cold, too 2018', decline: 32 },
  { name: 'Farmhouse shiplap', reason: 'Shiplap fatigue is real', decline: 22 },
  { name: 'Open shelving', reason: 'Dust + decision fatigue', decline: 24 },
  { name: 'Edison bulb chandeliers', reason: 'Replaced by warm LED rings', decline: 41 },
  { name: 'Live-edge dining tables', reason: 'Hard to coordinate', decline: 15 },
  { name: 'Barn doors indoors', reason: 'Privacy gaps people noticed', decline: 28 },
];

const PALETTE_OF_WEEK = {
  name: 'Riverbed Calm',
  description: 'Pulled from the top 3 rising styles. Wears like cashmere.',
  colors: [
    { name: 'Rice Paper', hex: '#F0EDE5' },
    { name: 'Moss Ink', hex: '#7A8B6F' },
    { name: 'Travertine', hex: '#D4C5A5' },
    { name: 'Bamboo', hex: '#C8A951' },
    { name: 'Charcoal', hex: '#2C2C2C' },
  ],
};

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}

export default function TrendsPage() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const hero = RISING[0];
  const tier2 = RISING.slice(1, 4);

  const trendsByRoom = useMemo(() => {
    const byRoom: Record<string, TrendStyle[]> = {};
    for (const t of RISING) {
      if (!byRoom[t.room]) byRoom[t.room] = [];
      byRoom[t.room].push(t);
    }
    return byRoom;
  }, []);

  const filteredRoomTrends = selectedRoom ? trendsByRoom[selectedRoom] || [] : RISING;

  const applyStyle = (styleId: DesignStyle) => {
    sessionStorage.setItem('makeoverPresetStyle', styleId);
    navigate('/makeover');
  };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  const weekNum = getWeekNumber();
  const year = new Date().getFullYear();

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff' }}>
      {/* ── Editorial masthead ────────────────────────────────── */}
      <header style={{ padding: '80px 1.5rem 32px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#f25b29', textTransform: 'uppercase', marginBottom: '14px' }}>
              The Trend Report · Week {weekNum} · {year}
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 6vw, 4.4rem)', fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0 }}>
              What rooms<br />actually look like<br /><em style={{ color: '#f25b29', fontStyle: 'italic' }}>right now</em>.
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#9a9a9a', marginTop: '20px', maxWidth: '560px', lineHeight: 1.6 }}>
              A weekly digest of the styles, palettes, and details that designers, Pinterest boards, and our own AI generations keep coming back to. Tap any look to try it on your own room.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/')} style={btnGhost}>Back</button>
          </div>
        </div>
      </header>

      {/* ── Hero: the #1 trend this week ──────────────────────── */}
      <section style={{ padding: '40px 1.5rem 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '36px', alignItems: 'stretch' }}>
          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', minHeight: '520px', background: '#1a1a1a' }}>
            <img src={hero.image} alt={hero.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.75) 100%)' }} />
            <div style={{ position: 'absolute', top: '24px', left: '24px', padding: '6px 12px', background: '#f25b29', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              #1 This Week
            </div>
            <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {ROOM_LABELS[hero.room] || hero.room} · +{hero.growth}% this week
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, margin: 0, color: '#fff' }}>{hero.name}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 4px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#f25b29', textTransform: 'uppercase', marginBottom: '16px' }}>
                Editor's Pick
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', lineHeight: 1.45, color: '#e8e8e8', margin: 0 }}>
                "{hero.tagline}"
              </p>
              <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Stat label="Trend Score" value={String(hero.score)} accent />
                <Stat label="Weekly Growth" value={`+${hero.growth}%`} />
              </div>
            </div>
            <button onClick={() => applyStyle(hero.id)} style={{ ...btnPrimary, marginTop: '32px', width: '100%' }}>
              Try {hero.name} on my room →
            </button>
          </div>
        </div>

        {/* Tier 2 — three runners-up under the hero */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {tier2.map((t) => (
            <button key={t.rank} onClick={() => applyStyle(t.id)} style={{ position: 'relative', textAlign: 'left', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', minHeight: '260px' }}>
              <img src={t.image} alt={t.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
              <div style={{ position: 'absolute', top: '14px', left: '14px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>
                #{t.rank}
              </div>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {ROOM_LABELS[t.room] || t.room} · +{t.growth}%
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', lineHeight: 1.2 }}>{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Palette of the Week ───────────────────────────────── */}
      <section style={{ padding: '40px 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#f25b29', textTransform: 'uppercase', marginBottom: '10px' }}>
              Palette of the Week
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400, margin: 0 }}>{PALETTE_OF_WEEK.name}</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#888', marginTop: '8px', maxWidth: '480px' }}>{PALETTE_OF_WEEK.description}</p>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Tap a swatch to copy hex
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', borderRadius: '12px', overflow: 'hidden' }}>
          {PALETTE_OF_WEEK.colors.map((c) => (
            <button key={c.hex} onClick={() => copyHex(c.hex)} style={{ position: 'relative', height: '180px', background: c.hex, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: isDark(c.hex) ? '#fff' : '#0d0d0d' }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isDark(c.hex) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', marginTop: '2px' }}>
                {copiedHex === c.hex ? 'Copied ✓' : c.hex}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Filter by room + full grid ────────────────────────── */}
      <section style={{ padding: '60px 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#f25b29', textTransform: 'uppercase', marginBottom: '10px' }}>
              The Full Index
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400, margin: 0 }}>
              Every rising style, by room
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedRoom('')} style={pill(selectedRoom === '')}>All</button>
            {Object.keys(trendsByRoom).map((room) => (
              <button key={room} onClick={() => setSelectedRoom(room)} style={pill(selectedRoom === room)}>
                {ROOM_LABELS[room] || room}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredRoomTrends.map((t) => (
            <article key={`${t.rank}-${t.name}`} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#1a1a1a' }}>
                <img src={t.image} alt={t.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(8px)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>
                  Rank #{t.rank}
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', background: t.growth >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(244,114,114,0.2)', border: `1px solid ${t.growth >= 0 ? 'rgba(74,222,128,0.4)' : 'rgba(244,114,114,0.4)'}`, fontFamily: 'var(--font-mono)', fontSize: '10px', color: t.growth >= 0 ? '#4ade80' : '#f47272' }}>
                  {t.growth >= 0 ? '↑' : '↓'} {Math.abs(t.growth)}%
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {ROOM_LABELS[t.room] || t.room}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: '#fff', margin: '0 0 8px' }}>{t.name}</h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#9a9a9a', lineHeight: 1.55, margin: '0 0 20px', flex: 1 }}>{t.tagline}</p>
                <button onClick={() => applyStyle(t.id)} style={btnSubtle}>Try this look →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Cooling off ───────────────────────────────────────── */}
      <section style={{ padding: '40px 1.5rem 100px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', marginBottom: '10px' }}>
                Cooling Off
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, margin: 0, color: '#9a9a9a' }}>
                Quietly leaving the conversation
              </h2>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#666', maxWidth: '320px', textAlign: 'right' }}>
              Not bad — just done. Skip these unless you genuinely love them.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
            {COOLING.map((c) => (
              <div key={c.name} style={{ padding: '20px', background: '#0d0d0d', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: '#d0d0d0' }}>{c.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f47272' }}>−{c.decline}%</div>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#777', lineHeight: 1.5 }}>{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: accent ? '#f25b29' : '#fff', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '14px 24px', borderRadius: '8px', border: 'none', background: '#f25b29', color: '#fff',
  fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.1em',
};
const btnGhost: React.CSSProperties = {
  padding: '10px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)',
  background: 'transparent', color: '#d0d0d0', fontFamily: 'var(--font-sans)', fontSize: '12px',
  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
};
const btnSubtle: React.CSSProperties = {
  padding: '10px 16px', borderRadius: '6px', border: '1px solid rgba(242,91,41,0.4)',
  background: 'transparent', color: '#f25b29', fontFamily: 'var(--font-sans)', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
  alignSelf: 'flex-start',
};

function pill(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: '20px',
    border: active ? '1px solid #f25b29' : '1px solid rgba(255,255,255,0.12)',
    background: active ? 'rgba(242,91,41,0.12)' : 'transparent',
    color: active ? '#f25b29' : '#888',
    fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: '0.1em',
  };
}

// rough perceptual luminance — pick light/dark text against a swatch
function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.55;
}
