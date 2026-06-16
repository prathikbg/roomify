import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '@/providers/trpc';

const WEEK_LABELS: Record<string, string> = {
  W1: 'Trending',
  W2: 'Global',
  W3: 'Classic',
  W4: 'Nature',
};

const EMPTY_ITEM = {
  caption: '',
  description: '',
  image: '',
  style: '',
  weekSlot: 'W1',
  totalBudget: 0,
  timeEstimate: '',
  difficulty: 'Medium' as 'Easy' | 'Medium' | 'Advanced',
  products: [{ name: '', price: 0, link: '', category: '' }],
  changes: [{ title: '', description: '' }],
  colors: [{ name: '', hex: '#000000' }],
};

export default function GalleryManage() {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const utils = trpc.useUtils();
  const itemsQuery = trpc.gallery.listAll.useQuery();
  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      setMessage('Item created successfully!');
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    },
  });
  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      setMessage('Item updated successfully!');
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    },
  });
  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      setMessage('Item deleted!');
      setTimeout(() => setMessage(''), 3000);
    },
  });


  const items = itemsQuery.data ?? [];

  function resetForm() {
    setForm({ ...EMPTY_ITEM });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: any) {
    setForm({
      caption: item.caption,
      description: item.description ?? '',
      image: item.image,
      style: item.style,
      weekSlot: item.weekSlot,
      totalBudget: Number(item.totalBudget),
      timeEstimate: item.timeEstimate ?? '',
      difficulty: item.difficulty ?? 'Medium',
      products: Array.isArray(item.products) ? item.products : [{ name: '', price: 0, link: '', category: '' }],
      changes: Array.isArray(item.changes) ? item.changes : [{ title: '', description: '' }],
      colors: Array.isArray(item.colors) ? item.colors : [{ name: '', hex: '#000000' }],
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      products: form.products.filter((p) => p.name.trim()),
      changes: form.changes.filter((c) => c.title.trim()),
      colors: form.colors.filter((c) => c.name.trim()),
    };
    if (editingId) {
      updateMutation.mutate({ ...data, id: editingId, isActive: 1 });
    } else {
      createMutation.mutate(data);
    }
  }

  function addProduct() {
    setForm((f) => ({ ...f, products: [...f.products, { name: '', price: 0, link: '', category: '' }] }));
  }
  function updateProduct(i: number, field: string, value: string | number) {
    setForm((f) => ({
      ...f,
      products: f.products.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    }));
  }
  function removeProduct(i: number) {
    setForm((f) => ({ ...f, products: f.products.filter((_, idx) => idx !== i) }));
  }

  function addChange() {
    setForm((f) => ({ ...f, changes: [...f.changes, { title: '', description: '' }] }));
  }
  function updateChange(i: number, field: string, value: string) {
    setForm((f) => ({
      ...f,
      changes: f.changes.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }
  function removeChange(i: number) {
    setForm((f) => ({ ...f, changes: f.changes.filter((_, idx) => idx !== i) }));
  }

  function addColor() {
    setForm((f) => ({ ...f, colors: [...f.colors, { name: '', hex: '#000000' }] }));
  }
  function updateColor(i: number, field: string, value: string) {
    setForm((f) => ({
      ...f,
      colors: f.colors.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }
  function removeColor(i: number) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#b0b2b5',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', padding: '80px 1.5rem' }}>
      {/* Header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                color: '#ffffff',
                fontWeight: 400,
              }}
            >
              Gallery Manager
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#888', marginTop: '0.5rem' }}>
              {items.length} styles in database &middot; Add, edit, or remove gallery items
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#b0b2b5',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Back to Site
            </button>
            <button
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                background: '#f25b29',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {showForm ? 'Cancel' : '+ Add New Style'}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              padding: '12px 20px',
              background: 'rgba(242,91,41,0.1)',
              border: '1px solid rgba(242,91,41,0.3)',
              borderRadius: '8px',
              color: '#f25b29',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              marginBottom: '1.5rem',
            }}
          >
            {message}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff', marginBottom: '1.5rem' }}>
              {editingId ? 'Edit Style' : 'Add New Style'}
            </h3>

            {/* Basic Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Caption / Title *</label>
                <input
                  style={inputStyle}
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  placeholder="e.g. Modern Living Room"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Style Name *</label>
                <input
                  style={inputStyle}
                  value={form.style}
                  onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                  placeholder="e.g. Modern"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe this interior design style..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Image Path *</label>
                <input
                  style={inputStyle}
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="images/gallery/item1.jpg"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Week Slot</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.weekSlot}
                  onChange={(e) => setForm((f) => ({ ...f, weekSlot: e.target.value }))}
                >
                  <option value="W1">W1 - Trending</option>
                  <option value="W2">W2 - Global</option>
                  <option value="W3">W3 - Classic</option>
                  <option value="W4">W4 - Nature</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget (Rs.)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalBudget}
                  onChange={(e) => setForm((f) => ({ ...f, totalBudget: Number(e.target.value) }))}
                  placeholder="35000"
                />
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as 'Easy' | 'Medium' | 'Advanced' }))}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Time Estimate</label>
              <input
                style={{ ...inputStyle, maxWidth: '300px' }}
                value={form.timeEstimate}
                onChange={(e) => setForm((f) => ({ ...f, timeEstimate: e.target.value }))}
                placeholder="e.g. 2-3 weekends"
              />
            </div>

            {/* Products */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Products</label>
                <button type="button" onClick={addProduct} style={{ fontSize: '12px', color: '#f25b29', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Add Product
                </button>
              </div>
              {form.products.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Product name" value={p.name} onChange={(e) => updateProduct(i, 'name', e.target.value)} />
                  <input style={inputStyle} type="number" placeholder="Price" value={p.price || ''} onChange={(e) => updateProduct(i, 'price', Number(e.target.value))} />
                  <input style={inputStyle} placeholder="Amazon link" value={p.link} onChange={(e) => updateProduct(i, 'link', e.target.value)} />
                  <input style={inputStyle} placeholder="Category" value={p.category} onChange={(e) => updateProduct(i, 'category', e.target.value)} />
                  <button type="button" onClick={() => removeProduct(i)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                </div>
              ))}
            </div>

            {/* Changes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Change Guides</label>
                <button type="button" onClick={addChange} style={{ fontSize: '12px', color: '#f25b29', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Add Change
                </button>
              </div>
              {form.changes.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
                  <input style={inputStyle} placeholder="Title" value={c.title} onChange={(e) => updateChange(i, 'title', e.target.value)} />
                  <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Description" value={c.description} onChange={(e) => updateChange(i, 'description', e.target.value)} />
                  <button type="button" onClick={() => removeChange(i)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Colors</label>
                <button type="button" onClick={addColor} style={{ fontSize: '12px', color: '#f25b29', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Add Color
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {form.colors.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(i, 'hex', e.target.value)}
                      style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      style={{ ...inputStyle, width: '120px', border: 'none', background: 'transparent', padding: '4px 0' }}
                      placeholder="Color name"
                      value={c.name}
                      onChange={(e) => updateColor(i, 'name', e.target.value)}
                    />
                    <button type="button" onClick={() => removeColor(i)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '12px 36px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#f25b29',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  opacity: createMutation.isPending || updateMutation.isPending ? 0.6 : 1,
                }}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Update Style' : 'Create Style'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#b0b2b5',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        {itemsQuery.isLoading && (
          <p style={{ color: '#888', fontFamily: 'var(--font-sans)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
        )}

        {!itemsQuery.isLoading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', marginBottom: '1rem' }}>No gallery items in database yet.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ color: '#f25b29', background: 'none', border: '1px solid rgba(242,91,41,0.4)', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Add Your First Style
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {items.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#fff', fontWeight: 500 }}>
                      {item.caption}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: item.isActive ? '#f25b29' : '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        border: `1px solid ${item.isActive ? 'rgba(242,91,41,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {WEEK_LABELS[item.weekSlot] || item.weekSlot} &middot; {item.style} &middot; Rs.{(Number(item.totalBudget) / 1000).toFixed(0)}k &middot; {item.difficulty}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent',
                      color: '#b0b2b5',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${item.caption}"?`)) {
                        deleteMutation.mutate({ id: item.id });
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,50,50,0.2)',
                      background: 'transparent',
                      color: '#ff4444',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
