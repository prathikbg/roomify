import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

// Sample before/after pair shown in the floating mini preview.
// Using existing assets in /public/images/ — swap freely.
const BEFORE_SRC = '/images/rooms/room1-back.jpg';
const AFTER_SRC = '/images/gallery/contemporary.jpg';

export default function HeroOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showAfter, setShowAfter] = useState(false);

  // GSAP staggered entrance — fires once on mount.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('[data-anim]');
    gsap.fromTo(
      items,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.3 }
    );
  }, []);

  // Auto-swap the preview card between BEFORE / AFTER every 2.5s.
  useEffect(() => {
    const id = setInterval(() => setShowAfter((s) => !s), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={rootRef} className="hero-overlay">
      {/* Centered hero stack */}
      <div className="hero-overlay__stack">
        <span data-anim className="hero-overlay__eyebrow">
          <span className="hero-overlay__dot" /> AI-POWERED INTERIOR DESIGN
        </span>

        <h1 data-anim className="hero-overlay__headline">
          Redesign any room.<br />
          <em>In 15 seconds.</em>
        </h1>

        <p data-anim className="hero-overlay__sub">
          Upload a photo. Pick a style. Watch AI transform your space — instantly.
        </p>

        <div data-anim className="hero-overlay__cta-row">
          <Link to="/makeover" className="hero-overlay__cta-primary">
            Try Free — Upload Your Room
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="#waves-gallery"
            className="hero-overlay__cta-secondary"
            onClick={(e) => {
              // HashRouter owns the URL hash, so a plain hash anchor would
              // break routing. Intercept and scroll to the gallery section
              // directly, preferring Lenis if it's wired up.
              e.preventDefault();
              const el = document.getElementById('waves-gallery');
              if (!el) return;
              const lenis = (window as any).__lenis;
              if (lenis && typeof lenis.scrollTo === 'function') {
                lenis.scrollTo(el, { offset: 0 });
              } else {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            or browse 21 styles
          </a>
        </div>

        <div data-anim className="hero-overlay__trust">
          <span>● No sign-up</span>
          <span>● Free 10 generations / hour</span>
          <span>● Preserves your room's layout</span>
        </div>

      </div>

      {/* Floating before/after mini preview (auto-swaps) */}
      <div className="hero-overlay__preview" data-anim>
        <div className="hero-overlay__preview-frame">
          <img src={BEFORE_SRC} alt="Before redesign" className="hero-overlay__preview-img" />
          <img
            src={AFTER_SRC}
            alt="After AI redesign"
            className="hero-overlay__preview-img hero-overlay__preview-img--after"
            style={{ opacity: showAfter ? 1 : 0 }}
          />
          <span
            className="hero-overlay__preview-label"
            style={{ background: showAfter ? 'rgba(242,91,41,0.92)' : 'rgba(0,0,0,0.72)' }}
          >
            {showAfter ? 'AFTER' : 'BEFORE'}
          </span>
        </div>
        <span className="hero-overlay__preview-caption">Live demo • auto-swap</span>
      </div>

      {/* Scroll-down cue */}
      <div className="hero-overlay__scroll-cue" aria-hidden="true">
        <span>SCROLL</span>
        <div className="hero-overlay__scroll-line" />
      </div>
    </div>
  );
}
