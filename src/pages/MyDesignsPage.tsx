import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FullScreenMenu from '../components/FullScreenMenu';
import { listDesigns, deleteDesign, type SavedDesign } from '../utils/savedDesigns';
import { downloadImage, makeoverFilename } from '../utils/downloadImage';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function MyDesignsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await listDesigns();
    setDesigns(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Delete this saved design? This cannot be undone.')) return;
      await deleteDesign(id);
      refresh();
    },
    [refresh]
  );

  const handleDownload = useCallback(async (d: SavedDesign) => {
    await downloadImage(d.generatedImage, makeoverFilename(d.designStyle || d.styleLabel));
  }, []);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    },
    [navigate]
  );

  return (
    <div className="my-designs-page">
      <Navigation onMenuOpen={() => setMenuOpen(true)} />
      <FullScreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavigate} />

      <div className="my-designs-container">
        <header className="my-designs-header">
          <div>
            <div className="my-designs-eyebrow">SAVED LOCALLY · IN THIS BROWSER</div>
            <h1 className="my-designs-title">My Designs</h1>
            <p className="my-designs-sub">
              Every makeover you generate is auto-saved here. Stored privately in your browser — never uploaded.
            </p>
          </div>
          <Link to="/makeover" className="my-designs-cta">+ New Makeover</Link>
        </header>

        {loading ? (
          <div className="my-designs-empty">Loading saved designs…</div>
        ) : designs.length === 0 ? (
          <div className="my-designs-empty">
            <div className="my-designs-empty__icon" aria-hidden>🪞</div>
            <div className="my-designs-empty__title">No saved designs yet</div>
            <p className="my-designs-empty__sub">
              Generate your first room makeover and it will appear here automatically.
            </p>
            <Link to="/makeover" className="my-designs-cta">Start Your First Makeover</Link>
          </div>
        ) : (
          <div className="my-designs-grid">
            {designs.map((d) => (
              <article key={d.id} className="design-card">
                <div className="design-card__media">
                  <img src={d.generatedImage} alt={d.styleLabel} loading="lazy" />
                  {d.uploadedImage && (
                    <img
                      src={d.uploadedImage}
                      alt="Original room"
                      className="design-card__thumb"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="design-card__body">
                  <div className="design-card__meta">
                    <span className="design-card__style">{d.styleLabel || d.designStyle}</span>
                    <span className="design-card__date">{formatDate(d.createdAt)}</span>
                  </div>
                  <div className="design-card__room">{d.roomType?.replace('-', ' ')}</div>
                  {d.colorPalette.length > 0 && (
                    <div className="design-card__palette" aria-label="Color palette">
                      {d.colorPalette.slice(0, 5).map((c, i) => (
                        <span
                          key={i}
                          className="design-card__swatch"
                          style={{ background: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                  <div className="design-card__actions">
                    <button
                      type="button"
                      onClick={() => handleDownload(d)}
                      className="design-card__download"
                      aria-label="Download generated image"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="design-card__delete"
                      aria-label="Delete design"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
