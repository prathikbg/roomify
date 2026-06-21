import { useState } from 'react';
import { useMakeover } from '../../contexts/MakeoverContext';
import { designStyles, furnitureRecommendations } from '../../data/makeoverData';
import { generatePinterestImage } from '../../utils/imageGenerator';

export default function StepResults() {
  const { state, dispatch } = useMakeover();
  const [showPinterest, setShowPinterest] = useState(false);
  const [pinterestUrl, setPinterestUrl] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const styleLabel = designStyles.find((s) => s.value === state.designStyle)?.label || '';
  const pinTitle = `${styleLabel} Room Makeover`;
  const pinDescription = `Transformed my space with Roomify AI — a ${styleLabel} ${state.roomType?.replace('-', ' ') || 'room'} redesign. Get your own AI room makeover at roomify.online`;

  const handleDownloadPinterest = async () => {
    if (!state.uploadedImage || !state.generatedImage) {
      setPinError('Missing before/after images. Please regenerate your makeover.');
      setShowPinterest(true);
      return;
    }
    setPinError(null);
    setPinLoading(true);
    setShowPinterest(true);
    try {
      const url = await generatePinterestImage(state.uploadedImage, state.generatedImage, pinTitle, styleLabel);
      setPinterestUrl(url);
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Could not build the pin image.');
    } finally {
      setPinLoading(false);
    }
  };

  // Convert a data: URL into a File so we can use the native share sheet on mobile.
  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  };

  const handleNativeShare = async () => {
    if (!pinterestUrl) return;
    try {
      const file = await dataUrlToFile(pinterestUrl, 'roomify-pin.png');
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: pinTitle, text: pinDescription });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: pinTitle, text: pinDescription, url: 'https://roomify.online' });
        return;
      }
      // Desktop fallback: trigger a download.
      const a = document.createElement('a');
      a.href = pinterestUrl;
      a.download = 'roomify-pinterest-pin.png';
      a.click();
    } catch (err) {
      // User cancelled or share failed — no UI noise needed unless it's a real error.
      if (err instanceof Error && err.name !== 'AbortError') {
        setPinError(err.message);
      }
    }
  };

  const handlePinToPinterest = () => {
    // Pinterest's pin-creator needs a public URL for the media; data: URLs aren't
    // accepted. Until we host the composite, send users to their pin-builder with
    // the description prefilled — they paste their downloaded image there.
    const shareUrl = `https://www.pinterest.com/pin-builder/?description=${encodeURIComponent(pinDescription)}&url=${encodeURIComponent('https://roomify.online')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=750,height=720');
  };

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(pinDescription);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setPinError('Clipboard blocked by browser.');
    }
  };

  const handleClosePinterest = () => {
    setShowPinterest(false);
    setPinterestUrl(null);
    setPinError(null);
    setCopyStatus('idle');
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
          Your original room above, the {styleLabel} redesign below — both shown in full
        </p>
      </div>

      {/* Before/After stacked vertically — each image displayed at its natural
          aspect ratio so the full frame is visible without cropping. */}
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto 3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Before */}
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src={state.uploadedImage || ''}
            alt="Original room"
            draggable={false}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
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
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#0a0a0a',
            border: '1px solid rgba(242,91,41,0.25)',
          }}
        >
          <img
            src={state.generatedImage || ''}
            alt={`${styleLabel} redesigned room`}
            draggable={false}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
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
          disabled={pinLoading}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '14px 32px',
            borderRadius: '4px',
            border: 'none',
            cursor: pinLoading ? 'wait' : 'pointer',
            background: pinLoading ? '#9a1218' : '#E60023',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: pinLoading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => { if (!pinLoading) e.currentTarget.style.background = '#cc001f'; }}
          onMouseLeave={(e) => { if (!pinLoading) e.currentTarget.style.background = '#E60023'; }}
        >
          {pinLoading ? (
            <span
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
          )}
          {pinLoading ? 'Building Pin…' : 'Create Pinterest Pin'}
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
      {showPinterest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem',
            overflowY: 'auto',
          }}
          onClick={handleClosePinterest}
          data-lenis-prevent
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#121214',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
              position: 'relative',
              marginTop: '4vh',
              marginBottom: '4vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button (top-right) */}
            <button
              onClick={handleClosePinterest}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: '#b0b2b5',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  color: '#E60023',
                  textTransform: 'uppercase',
                }}
              >
                Step 1 of 3 · Save → Share → Pin
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  color: '#fff',
                  margin: '0.5rem 0 0.5rem',
                  fontWeight: 400,
                  lineHeight: 1.3,
                }}
              >
                {pinLoading ? 'Building your pin…' : pinError ? 'Something went wrong' : 'Your Pinterest pin is ready'}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: '#9a9c9f',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {pinLoading
                  ? 'Combining your before & after into a 1000×1500 vertical pin.'
                  : pinError
                    ? pinError
                    : 'Download the image, then open Pinterest to publish it.'}
              </p>
            </div>

            {pinLoading && (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#E60023',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.9s linear infinite',
                  }}
                />
              </div>
            )}

            {!pinLoading && pinterestUrl && (
              <>
                {/* Pin preview — capped so the whole modal fits in view */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <img
                    src={pinterestUrl}
                    alt="Pinterest Pin Preview"
                    style={{
                      width: '100%',
                      maxWidth: '260px',
                      maxHeight: '40vh',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>

                {/* Three-step actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <a
                    href={pinterestUrl}
                    download="roomify-pinterest-pin.png"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      padding: '13px 20px',
                      borderRadius: '4px',
                      border: 'none',
                      textDecoration: 'none',
                      background: '#f25b29',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    1 · Download Pin Image
                  </a>
                  <button
                    onClick={handlePinToPinterest}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      padding: '13px 20px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#E60023',
                      color: '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    2 · Open Pinterest & Paste
                  </button>
                  <button
                    onClick={handleCopyDescription}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      padding: '13px 20px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: 'transparent',
                      color: copyStatus === 'copied' ? '#7fffa1' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    {copyStatus === 'copied' ? '✓ Description Copied' : '3 · Copy Description'}
                  </button>
                </div>

                {/* Native share — mobile only */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={handleNativeShare}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '6px 12px',
                        border: 'none',
                        background: 'transparent',
                        color: '#9a9c9f',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Or use device share sheet
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
