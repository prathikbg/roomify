// Trigger a real file download for any image URL — works for data: URLs,
// blob: URLs, and remote http(s) URLs (the latter via fetch → blob, since
// the plain <a download> attribute is ignored on cross-origin resources).
export async function downloadImage(url: string, filename: string): Promise<void> {
  if (!url) return;

  // data:/blob: URLs can use the direct anchor path — no network needed.
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    triggerAnchor(url, filename);
    return;
  }

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchor(objectUrl, filename);
    // Defer revoke so the browser has time to start the download.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  } catch {
    // CORS or network failure — fall back to opening the image in a new tab
    // so the user can save it manually via the browser context menu.
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function triggerAnchor(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Build a stable, filesystem-safe filename for a saved makeover.
export function makeoverFilename(style: string | null | undefined, ext = 'png'): string {
  const safe = (style || 'makeover')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const stamp = new Date()
    .toISOString()
    .replace(/[:T]/g, '-')
    .slice(0, 16);
  return `roomify-${safe}-${stamp}.${ext}`;
}
