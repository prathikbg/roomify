import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useLenis } from './hooks/useLenis';
import Navigation from './components/Navigation';
import FullScreenMenu from './components/FullScreenMenu';
import HeroRoomGallery from './sections/HeroRoomGallery';
import ParticleSculpture from './sections/ParticleSculpture';
import LighthouseVideo from './sections/LighthouseVideo';
import ImageGallery from './sections/ImageGallery';
import WavesVideo from './sections/WavesVideo';
import FooterTicker from './sections/FooterTicker';
import MakeoverFlow from './sections/makeover/MakeoverFlow';
import GalleryManage from './pages/GalleryManage';
import TrendsPage from './pages/TrendsPage';

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useLenis();

  const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (el && lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: 0 });
      } else if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lenisRef]
  );

  return (
    <div className="relative">
      <Navigation onMenuOpen={handleMenuOpen} />
      <FullScreenMenu
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />

      <main>
        <HeroRoomGallery />
        <ParticleSculpture />
        <LighthouseVideo />
        <ImageGallery />
        <WavesVideo />
      </main>

      <FooterTicker onNavigate={handleNavigate} />
    </div>
  );
}

function MakeoverPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      // On makeover page, navigate to home first, then scroll to section
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    },
    [navigate]
  );

  return (
    <div className="relative">
      <Navigation onMenuOpen={handleMenuOpen} />
      <FullScreenMenu
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
      <MakeoverFlow />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/makeover" element={<MakeoverPage />} />
      <Route path="/manage-gallery" element={<GalleryManage />} />
      <Route path="/trends" element={<TrendsPage />} />
    </Routes>
  );
}

export default App;
