import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { siteConfig, navigationConfig } from '../config';

interface NavigationProps {
  onMenuOpen: () => void;
}

export default function Navigation({ onMenuOpen }: NavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isMakeoverPage = location.pathname === '/makeover';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const letters = logo.querySelectorAll('.logo-letter');

    const handleMouseEnter = () => {
      gsap.to(letters, {
        rotationY: 15,
        duration: 0.3,
        ease: 'power2.inOut',
        stagger: {
          each: 0.05,
          yoyo: true,
          repeat: 1,
        },
      });
    };

    logo.addEventListener('mouseenter', handleMouseEnter);
    return () => logo.removeEventListener('mouseenter', handleMouseEnter);
  }, []);

  if (!siteConfig.brandName && !navigationConfig.menuLabel) return null;

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 py-6"
      style={{
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        mixBlendMode: scrolled ? 'difference' : 'normal',
        transition: 'mix-blend-mode 0.5s ease',
      }}
    >
      <Link
        ref={logoRef}
        to="/"
        onClick={(e) => {
          if (!isMakeoverPage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="no-underline"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: '24px',
          color: '#ffffff',
          display: 'inline-flex',
          perspective: '200px',
        }}
      >
        {siteConfig.brandName.split('').map((char, i) => (
          <span
            key={i}
            className="logo-letter inline-block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {char}
          </span>
        ))}
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isMakeoverPage && (
          <Link
            to="/makeover"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#f25b29',
              background: 'none',
              border: '1px solid rgba(242,91,41,0.4)',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(242,91,41,0.8)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(242,91,41,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(242,91,41,0.4)';
              (e.currentTarget as HTMLAnchorElement).style.background = 'none';
            }}
          >
            Start Makeover
          </Link>
        )}

        {navigationConfig.menuLabel && (
          <button
            onClick={onMenuOpen}
            className="cursor-pointer bg-transparent"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              padding: '8px 20px',
              transition: 'border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#f25b29';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            {navigationConfig.menuLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
