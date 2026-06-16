import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lighthouseVideoConfig } from '../config';
import { trpc } from '@/providers/trpc';
import type { DesignStyle } from '../types/makeover';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedTransformation {
  id: string;
  title: string;
  roomType: string;
  style: DesignStyle;
  styleLabel: string;
  budget: string;
  image: string;
  description: string;
  growthRate?: number;
}

const featuredTransformations: FeaturedTransformation[] = [
  {
    id: 'scandi-bedroom',
    title: 'Scandinavian Bedroom Retreat',
    roomType: 'Bedroom',
    style: 'scandinavian',
    styleLabel: 'Scandinavian',
    budget: 'Rs.25,000 - Rs.50,000',
    image: 'images/gallery/item5.jpg',
    description: 'Light woods, cozy textures, and natural light transform a compact bedroom into a serene retreat.',
  },
  {
    id: 'modern-living',
    title: 'Modern Minimalist Living Room',
    roomType: 'Living Room',
    style: 'modern',
    styleLabel: 'Modern',
    budget: 'Rs.50,000 - Rs.1,00,000',
    image: 'images/gallery/item2.jpg',
    description: 'Clean lines, neutral tones, and functional beauty for the ultimate contemporary living space.',
  },
  {
    id: 'japandi-office',
    title: 'Japandi Home Office',
    roomType: 'Home Office',
    style: 'japandi',
    styleLabel: 'Japandi',
    budget: 'Rs.25,000 - Rs.50,000',
    image: 'images/gallery/item7.jpg',
    description: 'Japanese simplicity meets Scandinavian warmth - a productive sanctuary with natural materials.',
  },
];

// ── Live-trend → FeaturedTransformation mapping helpers ──────────────────
// The aggregator emits free-form keywords/tags; we normalise them into the
// small enum the /makeover wizard accepts so a click pre-selects the style.
const STYLE_TO_DESIGN: Record<string, DesignStyle> = {
  japandi: 'japandi', zen: 'japandi',
  modern: 'modern', minimalist: 'modern', 'mid-century': 'modern', mid: 'modern', playful: 'modern', contemporary: 'modern',
  scandinavian: 'scandinavian', coastal: 'scandinavian', biophilic: 'scandinavian', farmhouse: 'scandinavian',
  luxury: 'luxury', 'art deco': 'luxury', french: 'luxury',
  boho: 'boho', moroccan: 'boho', tropical: 'boho', bohemian: 'boho',
  industrial: 'industrial',
  traditional: 'traditional-indian', indian: 'traditional-indian',
  'smart home': 'smart-home', smart: 'smart-home',
};

const ROOM_LABELS: Record<string, string> = {
  bedroom: 'Bedroom', 'living-room': 'Living Room', kitchen: 'Kitchen',
  bathroom: 'Bathroom', 'home-office': 'Home Office', 'dining-room': 'Dining Room',
  'kids-room': 'Kids Room',
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveDesignStyle(tag: string, keyword: string): DesignStyle {
  const t = (tag || '').toLowerCase().trim();
  const k = (keyword || '').toLowerCase();
  if (STYLE_TO_DESIGN[t]) return STYLE_TO_DESIGN[t];
  for (const needle of Object.keys(STYLE_TO_DESIGN)) {
    if (k.includes(needle)) return STYLE_TO_DESIGN[needle];
  }
  return 'modern';
}

function resolveImage(sampleImage: string | null | undefined, keyword: string, tag: string): string {
  if (sampleImage) return sampleImage;
  const kw = (keyword || '').toLowerCase();
  const t = (tag || '').toLowerCase();
  const map: Array<[string, string]> = [
    ['japandi', 'zen.jpg'], ['zen', 'zen.jpg'],
    ['boho', 'moroccan.jpg'], ['moroccan', 'moroccan.jpg'],
    ['scandinavian', 'coastal.jpg'], ['coastal', 'coastal.jpg'],
    ['luxury', 'artdeco.jpg'], ['art deco', 'artdeco.jpg'],
    ['industrial', 'midcentury.jpg'], ['mid', 'midcentury.jpg'],
    ['french', 'frenchcountry.jpg'], ['farmhouse', 'farmhouse.jpg'],
    ['tropical', 'tropical.jpg'], ['traditional', 'mediterranean.jpg'],
    ['mediterranean', 'mediterranean.jpg'], ['rustic', 'rustic.jpg'],
    ['modern', 'contemporary.jpg'],
  ];
  for (const [needle, file] of map) {
    if (kw.includes(needle) || t.includes(needle)) return `images/gallery/${file}`;
  }
  return 'images/gallery/item1.jpg';
}

function budgetForScore(score: number): string {
  if (score >= 85) return 'Rs.50,000 - Rs.1,00,000';
  if (score >= 70) return 'Rs.25,000 - Rs.50,000';
  return 'Rs.10,000 - Rs.25,000';
}

interface TrendLike {
  keyword: string;
  score: number;
  growthRate: number;
  roomCategory: string;
  styleTag: string;
  sampleImage: string | null;
}

function trendToFeatured(t: TrendLike): FeaturedTransformation {
  const style = resolveDesignStyle(t.styleTag, t.keyword);
  return {
    id: t.keyword.toLowerCase().replace(/\s+/g, '-'),
    title: titleCase(t.keyword),
    roomType: ROOM_LABELS[t.roomCategory] || titleCase(t.roomCategory.replace(/-/g, ' ')),
    style,
    styleLabel: t.styleTag ? titleCase(t.styleTag) : titleCase(style),
    budget: budgetForScore(t.score),
    image: resolveImage(t.sampleImage, t.keyword, t.styleTag),
    description: `Trending across Reddit, Google, and Unsplash this week — score ${t.score}/100.`,
    growthRate: t.growthRate,
  };
}

export default function LighthouseVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Pull the top trends; if the backend is offline or returns nothing we
  // silently fall back to the curated static cards above.
  const trendsQuery = trpc.trends.current.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { cards, isLive } = useMemo(() => {
    const top = (trendsQuery.data?.topTrends ?? []).slice(0, 3);
    if (top.length === 3) {
      return { cards: top.map(trendToFeatured), isLive: true };
    }
    return { cards: featuredTransformations, isLive: false };
  }, [trendsQuery.data]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const content = contentRef.current;
    if (!section || !video || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
      },
    });

    tl.fromTo(video, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.out' });
    tl.fromTo(
      content,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
      '-=0.8'
    );

    const dataPoints = content.querySelectorAll('.data-point');
    tl.fromTo(
      dataPoints,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.12 },
      '-=0.3'
    );

    // Animate cards in with stagger
    const cardEls = cardsRef.current?.querySelectorAll('.transform-card');
    if (cardEls) {
      tl.fromTo(
        cardEls,
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.15 },
        '-=0.2'
      );
    }

    return () => {
      tl.kill();
    };
  }, [cards]);

  const handleTryStyle = (style: DesignStyle) => {
    sessionStorage.setItem('makeoverPresetStyle', style);
    navigate('/makeover');
  };

  if (!lighthouseVideoConfig.videoPath && !lighthouseVideoConfig.sectionLabel) return null;

  return (
    <section
      id="lighthouse"
      ref={sectionRef}
      className="relative"
      style={{ width: '100vw', minHeight: '100vh' }}
    >
      {lighthouseVideoConfig.videoPath && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', opacity: 0, zIndex: 1 }}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={lighthouseVideoConfig.videoPath} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)', zIndex: 2 }}
      />

      {/* Content - positioned relatively so it can grow */}
      <div
        ref={contentRef}
        className="relative"
        style={{
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(80px, 10vh, 120px) 1rem',
          opacity: 0,
        }}
      >
        <div
          className="liquid-glass"
          style={{
            width: 'min(1100px, 92vw)',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
          }}
        >
          {/* Section Header */}
          <div className="data-point" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {lighthouseVideoConfig.sectionLabel && (
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '1rem',
                }}
              >
                {lighthouseVideoConfig.sectionLabel}
              </div>
            )}

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              Featured Room Transformations
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 auto',
              }}
            >
              Click any style to start your makeover with that look pre-selected
            </p>

            {/* Live-data indicator: green when API delivered fresh top-3 trends,
                grey when we're showing the curated fallback. */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isLive ? '#3fc97a' : 'rgba(255,255,255,0.4)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isLive ? '#3fc97a' : 'rgba(255,255,255,0.35)',
                  boxShadow: isLive ? '0 0 8px rgba(63,201,122,0.6)' : 'none',
                  animation: isLive ? 'trend-pulse 2s ease-in-out infinite' : 'none',
                }}
              />
              {isLive ? 'Live trends — Reddit, Google, Unsplash' : 'Curated picks'}
            </div>
          </div>

          {/* Transformation Cards */}
          <div
            ref={cardsRef}
            className="data-point"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              maxWidth: '960px',
              margin: '0 auto',
            }}
          >
            {cards.map((t) => (
              <div
                key={t.id}
                className="transform-card"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.35s ease',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(242,91,41,0.35)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Card Image */}
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img
                    src={t.image}
                    alt={t.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLImageElement).style.transform = 'scale(1.06)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLImageElement).style.transform = 'scale(1)';
                    }}
                  />
                  {/* Style badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(242,91,41,0.9)',
                      color: '#fff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '5px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    {t.styleLabel}
                  </div>
                  {/* Room type badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(8px)',
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '5px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    {t.roomType}
                  </div>
                  {/* Growth pill — only shown for rising live trends */}
                  {isLive && typeof t.growthRate === 'number' && t.growthRate >= 100 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(63,201,122,0.92)',
                        color: '#0a0a0b',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      ▲ +{Math.round(t.growthRate)}%
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '17px',
                      fontWeight: 400,
                      color: '#ffffff',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {t.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      flex: 1,
                    }}
                  >
                    {t.description}
                  </p>

                  {/* Budget */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    Est. Budget: {t.budget}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleTryStyle(t.style)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      background: 'transparent',
                      border: '1px solid rgba(242,91,41,0.5)',
                      borderRadius: '6px',
                      color: '#f25b29',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f25b29';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#f25b29';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#f25b29';
                      e.currentTarget.style.borderColor = 'rgba(242,91,41,0.5)';
                    }}
                  >
                    Try This Style
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="data-point"
            style={{
              width: '60%',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              margin: '2rem auto 0',
            }}
          />

          {/* Bottom description */}
          {lighthouseVideoConfig.description && (
            <p
              className="data-point"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                textAlign: 'center',
                marginTop: '1.5rem',
              }}
            >
              {lighthouseVideoConfig.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
