import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GalleryDetail } from '../data/galleryDetailData';

interface StyleDetailModalProps {
  detail: GalleryDetail;
  onClose: () => void;
}

export default function StyleDetailModal({ detail, onClose }: StyleDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'changes' | 'colors'>('products');

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Animate in
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });

    // Lock page scroll by adding a class to html element
    const html = document.documentElement;
    const originalClass = html.className;
    html.className = originalClass + ' modal-open';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      html.className = originalClass;
    };
  }, []);

  const handleClose = () => {
    const overlay = overlayRef.current;
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const tabs = [
    { key: 'products' as const, label: `Products (${detail.products.length})` },
    { key: 'changes' as const, label: `Changes (${detail.changes.length})` },
    { key: 'colors' as const, label: 'Colors' },
  ];

  return (
    <div
      ref={overlayRef}
      className="style-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Close button - fixed */}
      <button
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 1001,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(242,91,41,0.9)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
      >
        &times;
      </button>

      {/* Scrollable content
          data-lenis-prevent: tells the global Lenis smooth-scroll instance to
          ignore wheel/touch events inside this container, so the modal scrolls
          natively from the first wheel tick instead of requiring a click to
          transfer focus away from Lenis's window-level wheel listener. */}
      <div ref={scrollRef} className="style-modal-scroll" data-lenis-prevent>
        {/* Hero Image */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <img
            src={detail.image}
            alt={detail.caption}
            style={{
              width: '100%',
              display: 'block',
              aspectRatio: '3/2',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '3rem 1.5rem 1rem',
              background: 'linear-gradient(to top, #0a0a0b 0%, transparent 100%)',
              borderRadius: '0 0 8px 8px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              {detail.caption}
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Tag text={detail.difficulty} color="#f25b29" />
              <Tag text={detail.timeEstimate} color="#888" />
              <Tag text={`Est. ₹${detail.totalBudget.toLocaleString('en-IN')}`} color="#f25b29" />
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: '#b0b2b5',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}
        >
          {detail.description}
        </p>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '1.5rem',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '4px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab.key ? 'rgba(242,91,41,0.15)' : 'transparent',
                color: activeTab === tab.key ? '#f25b29' : '#888',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeTab === tab.key ? 500 : 400,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '300px' }}>
          {activeTab === 'products' && (
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {detail.products.map((product, i) => (
                <ProductRow key={i} product={product} isLast={i === detail.products.length - 1} />
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: 'rgba(242,91,41,0.08)',
                  borderTop: '1px solid rgba(242,91,41,0.2)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Budget
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#f25b29', fontWeight: 600 }}>
                  ₹{detail.totalBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'changes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {detail.changes.map((change, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f25b29', fontWeight: 500 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#fff' }}>
                      {change.title}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#999', lineHeight: 1.5, margin: 0, paddingLeft: '28px' }}>
                    {change.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'colors' && (
            <div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {detail.colors.map((color) => (
                  <div key={color.hex} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: color.hex,
                        border: '2px solid rgba(255,255,255,0.1)',
                        marginBottom: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                      onClick={() => navigator.clipboard?.writeText(color.hex)}
                      title="Click to copy hex"
                    />
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#fff' }}>{color.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#666' }}>{color.hex}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '60px' }} />
      </div>

      <style>{`
        .style-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: #0a0a0b;
          z-index: 1000;
          opacity: 0;
          display: flex;
          flex-direction: column;
        }
        .style-modal-scroll {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          padding: 16px;
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        /* Hide scrollbar */
        .style-modal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .style-modal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .style-modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        html.modal-open {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed;
          width: 100%;
        }
        html.modal-open body {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed;
          width: 100%;
          top: 0;
        }
      `}</style>
    </div>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      {text}
    </span>
  );
}

function ProductRow({ product, isLast }: { product: { name: string; price: number; link: string; category: string }; isLast: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
          {product.category}
        </span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#d0d0d0' }}>
          {product.name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: '#f25b29',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View
        </a>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#f25b29', fontWeight: 500, whiteSpace: 'nowrap' }}>
          ₹{product.price.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
