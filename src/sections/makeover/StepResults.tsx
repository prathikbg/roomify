import { useState, useRef, useCallback } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import { designStyles, furnitureRecommendations } from '../../data/makeoverData';
import { generatePinterestImage } from '../../utils/imageGenerator';

export default function StepResults() {
  const { state, dispatch } = useMakeover();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showPinterest, setShowPinterest] = useState(false);
  const [pinterestUrl, setPinterestUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const styleLabel = designStyles.find((s) => s.value === state.designStyle)?.label || '';

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percent = (x / rect.width) * 100;
      setSliderPosition(Math.max(2, Math.min(98, percent)));
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );
  const handleTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.slider-handle')) return;
    handleMove(e.clientX);
  };

  const handleDownloadPinterest = async () => {
    if (!state.uploadedImage || !state.generatedImage) return;
    const title = `${styleLabel} Room Makeover`;
    const url = await generatePinterestImage(state.uploadedImage, state.generatedImage, title, styleLabel);
    setPinterestUrl(url);
    setShowPinterest(true);
  };

  const getFurnitureItems = () => {
    const items = state.roomType ? furnitureRecommendations[state.roomType]?.default : [];
    return items || [];
  };

  const totalBudget = getFurnitureItems().reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="makeover-step">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: '#f25b29',
            textTransform: 'uppercase',
          }}
        >
          Your Makeover is Ready
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 400,
            color: '#ffffff',
            marginTop: '1rem',
            lineHeight: 1.2,
          }}
        >
          Before & After
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
          Drag the slider to compare your original room with the {styleLabel} redesign
        </p>
      </div>

      {/* Before/After Slider - Using <img> tags for full visibility */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onClick={handleTrackClick}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto 3rem',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* After image (full width, bottom layer) */}
        <img
          src={state.generatedImage || ''}
          alt={`${styleLabel} redesigned room`}
          draggable={false}
          style={{
            width: '100%',
            display: 'block',
            aspectRatio: '3/2',
            objectFit: 'cover',
          }}
        />

        {/* Before image (clipped overlay) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${sliderPosition}%`,
            height: '100%',
            overflow: 'hidden',
            borderRight: '2px solid #f25b29',
          }}
        >
          <img
            src={state.uploadedImage || ''}
            alt="Original room"
            draggable={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${10000 / sliderPosition}px`,
              maxWidth: 'none',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="slider-handle"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)',
            width: '40px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#f25b29',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(0,0,0,0.6)',
            padding: '6px 14px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            zIndex: 5,
          }}
        >
          Before
        </div>
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(242,91,41,0.8)',
            padding: '6px 14px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            zIndex: 5,
          }}
        >
          After — {styleLabel}
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
            {state.colorPalette.map((color) => (
              <div key={color.hex} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: color.hex,
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onClick={() => navigator.clipboard?.writeText(color.hex)}
                  title="Click to copy hex"
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
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

      {/* Furniture Recommendations with Product Links */}
      {getFurnitureItems().length > 0 && (
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
            Furniture Recommendations
          </h3>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {getFurnitureItems().map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: i < getFurnitureItems().length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: '#d0d0d0',
                      display: 'block',
                    }}
                  >
                    {item.name}
                  </span>
                  <a
                    href={item.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: '#f25b29',
                      textDecoration: 'none',
                      marginTop: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: 0.8,
                      transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View Product
                  </a>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    color: '#f25b29',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                background: 'rgba(242,91,41,0.08)',
                borderTop: '1px solid rgba(242,91,41,0.2)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Total Budget
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  color: '#f25b29',
                  fontWeight: 600,
                }}
              >
                ₹{totalBudget.toLocaleString('en-IN')}
              </span>
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
