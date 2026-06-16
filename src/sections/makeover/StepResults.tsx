import { useState } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import { designStyles, furnitureRecommendations } from '../../data/makeoverData';
import { generatePinterestImage } from '../../utils/imageGenerator';
import { downloadImage, makeoverFilename } from '../../utils/downloadImage';

// Lightweight category → emoji mapping for furniture cards.
// Keeps the card visual without depending on remote product images.
function furnitureIcon(name: string): string {
  const n = name.toLowerCase();
  if (/bed|mattress|bunk/.test(n)) return '🛏️';
  if (/sofa|couch|seater/.test(n)) return '🛋️';
  if (/chair|stool/.test(n)) return '🪑';
  if (/lamp|light|chandelier|pendant|led/.test(n)) return '💡';
  if (/table|desk|island|console|sideboard|bistro/.test(n)) return '🪟';
  if (/rug|mat|carpet/.test(n)) return '🧶';
  if (/mirror/.test(n)) return '🪞';
  if (/cushion|pillow|throw/.test(n)) return '🛌';
  if (/art|wall|decal|painting|canvas/.test(n)) return '🖼️';
  if (/plant|garden|planter/.test(n)) return '🪴';
  if (/curtain|drape|blind/.test(n)) return '🪟';
  if (/shelf|bookshelf|rack|cabinet|wardrobe|closet|organizer|storage|hutch/.test(n)) return '🗄️';
  if (/dinner|plate|thali|tray|cup|set/.test(n)) return '🍽️';
  if (/mandir|temple|diya|incense|pooja/.test(n)) return '🕉️';
  if (/towel|shower|bath|vanity/.test(n)) return '🚿';
  if (/key|hook/.test(n)) return '🔑';
  return '🏷️';
}

export default function StepResults() {
  const { state, dispatch } = useMakeover();
  const [showPinterest, setShowPinterest] = useState(false);
  const [pinterestUrl, setPinterestUrl] = useState<string | null>(null);

  const styleLabel = designStyles.find((s) => s.value === state.designStyle)?.label || '';

  const handleDownloadPinterest = async () => {
    if (!state.uploadedImage || !state.generatedImage) return;
    const title = `${styleLabel} Room Makeover`;
    const url = await generatePinterestImage(state.uploadedImage, state.generatedImage, title, styleLabel);
    setPinterestUrl(url);
    setShowPinterest(true);
  };

  const handleDownloadGenerated = async () => {
    if (!state.generatedImage) return;
    await downloadImage(state.generatedImage, makeoverFilename(state.designStyle));
  };

  const getFurnitureItems = () => {
    const items = state.roomType ? furnitureRecommendations[state.roomType]?.default : [];
    return items || [];
  };

  const furnitureItems = getFurnitureItems();
  const totalBudget = furnitureItems.reduce((sum, item) => sum + item.price, 0);
  const featuredIdx = furnitureItems.reduce(
    (best, item, idx, arr) => (item.price > arr[best].price ? idx : best),
    0
  );

  // Build a single Amazon India search URL covering every recommended item.
  // We pull the first two words of each item name (so "Wooden Queen Bed Frame" → "wooden queen")
  // and join them — Amazon's keyword search handles this well and the affiliate tag is preserved.
  const buyAllUrl = (() => {
    if (furnitureItems.length === 0) return '';
    const keywords = furnitureItems
      .map((item) => item.name.toLowerCase().split(/\s+/).slice(0, 2).join(' '))
      .join(' ');
    return `https://www.amazon.in/s?k=${encodeURIComponent(keywords)}&tag=5010b3-21`;
  })();

  return (
    <div className="makeover-step">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 400,
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Your Makeover is Ready
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: '#b0b2b5',
            marginTop: '0.75rem',
            maxWidth: '480px',
            margin: '0.75rem auto 0',
            lineHeight: 1.6,
          }}
        >
          Your original room next to the {styleLabel} redesign
        </p>
      </div>

      {/* Before/After side-by-side — both images shown in full (no cropping, no slider) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto 3rem',
        }}
      >
        {/* Before */}
        <div
          style={{
            position: 'relative',
            background: '#0a0a0a',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src={state.uploadedImage || ''}
            alt="Original room"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.65)',
              padding: '6px 14px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Before
          </div>
        </div>

        {/* After */}
        <div
          style={{
            position: 'relative',
            background: '#0a0a0a',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(242,91,41,0.4)',
          }}
        >
          <img
            src={state.generatedImage || ''}
            alt={`${styleLabel} redesigned room`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(242,91,41,0.85)',
              padding: '6px 14px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            After — {styleLabel}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      {state.colorPalette.length > 0 && (
        <div style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 400,
              color: '#b0b2b5',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1.25rem',
            }}
          >
            Color Palette
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {state.colorPalette.map((color, i) => (
              <div
                key={color.hex}
                className="palette-swatch"
                style={{ textAlign: 'center', animationDelay: `${i * 70}ms` }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: color.hex,
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onClick={() => navigator.clipboard?.writeText(color.hex)}
                  title="Click to copy hex"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${color.hex}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 500,
                  }}
                >
                  {color.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#888',
                    marginTop: '2px',
                  }}
                >
                  {color.hex}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Furniture Recommendations — card grid */}
      {furnitureItems.length > 0 && (
        <div className="furniture-section">
          <div className="furniture-section__header">
            <div>
              <div className="furniture-section__eyebrow">Shop the look</div>
              <h3 className="furniture-section__title">Furniture & Decor</h3>
            </div>
            <div className="furniture-section__count">
              {furnitureItems.length} curated picks
            </div>
          </div>

          <div className="furniture-grid">
            {furnitureItems.map((item, i) => (
              <a
                key={i}
                href={item.affiliateLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`furniture-card${i === featuredIdx ? ' furniture-card--featured' : ''}`}
              >
                <div className="furniture-card__icon" aria-hidden>
                  {furnitureIcon(item.name)}
                </div>
                <div className="furniture-card__body">
                  <div className="furniture-card__name">{item.name}</div>
                  <div className="furniture-card__meta">
                    <span className="furniture-card__price">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    {i === featuredIdx && furnitureItems.length > 1 && (
                      <span className="furniture-card__badge">Statement piece</span>
                    )}
                  </div>
                </div>
                <div className="furniture-card__cta" aria-label="Open on Amazon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          <div className="furniture-summary">
            <div className="furniture-summary__left">
              <div className="furniture-summary__label">Total estimate</div>
              <div className="furniture-summary__hint">
                Prices via Amazon India · affiliate links
              </div>
            </div>
            <div className="furniture-summary__right">
              <div className="furniture-summary__total">
                ₹{totalBudget.toLocaleString('en-IN')}
              </div>
              {buyAllUrl && (
                <a
                  href={buyAllUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="furniture-summary__cta"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Shop all on Amazon
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pinterest & Actions */}
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto 3rem',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {state.generatedImage && (
          <button
            type="button"
            onClick={handleDownloadGenerated}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '14px 32px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: '#f25b29',
              color: '#ffffff',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(242,91,41,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#d94e22'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f25b29'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Image
          </button>
        )}
        <button
          onClick={handleDownloadPinterest}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '14px 32px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: '#E60023',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#cc001f'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#E60023'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
          Create Pinterest Pin
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '14px 32px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            background: 'transparent',
            color: '#b0b2b5',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = '#b0b2b5';
          }}
        >
          Start Over
        </button>
      </div>

      {/* Pinterest Preview Modal */}
      {showPinterest && pinterestUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setShowPinterest(false)}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                color: '#fff',
                marginBottom: '1.5rem',
              }}
            >
              Your Pinterest Pin is Ready
            </h3>
            <img
              src={pinterestUrl}
              alt="Pinterest Pin"
              style={{
                width: '100%',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a
                href={pinterestUrl}
                download="roomify-pinterest-pin.png"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '12px 28px',
                  borderRadius: '4px',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-block',
                  background: '#f25b29',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Download Image
              </a>
              <button
                onClick={() => setShowPinterest(false)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '12px 28px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#b0b2b5',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
