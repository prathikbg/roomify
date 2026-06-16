import type { RoomType, DesignStyle, ColorSwatch, FurnitureItem } from '../types/makeover';

// Browser-local persistence for completed makeovers — no auth required.
// Backed by IndexedDB so we can store generated/uploaded image data URLs without
// hitting the ~5MB localStorage cap.

const DB_NAME = 'roomify-designs';
const STORE = 'designs';
const VERSION = 1;

export interface SavedDesign {
  id: string;
  createdAt: number;
  roomType: RoomType | null;
  designStyle: DesignStyle | null;
  styleLabel: string;
  uploadedImage: string;
  generatedImage: string;
  colorPalette: ColorSwatch[];
  furniture: FurnitureItem[];
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export async function saveDesign(design: Omit<SavedDesign, 'id' | 'createdAt'>): Promise<SavedDesign> {
  const record: SavedDesign = {
    ...design,
    id: `dsn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  await tx('readwrite', (s) => s.put(record));
  return record;
}

export async function listDesigns(): Promise<SavedDesign[]> {
  try {
    const all = await tx<SavedDesign[]>('readonly', (s) => s.getAll() as IDBRequest<SavedDesign[]>);
    return [...all].sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function deleteDesign(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

export async function getDesign(id: string): Promise<SavedDesign | undefined> {
  return tx<SavedDesign | undefined>('readonly', (s) => s.get(id) as IDBRequest<SavedDesign | undefined>);
}

export async function clearDesigns(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
}
