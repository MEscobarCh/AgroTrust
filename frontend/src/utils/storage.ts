import type { Cultivo } from '../types/api';

const CROPS_STORAGE_KEY = 'agrotrust_crops';
const ACTIVE_CROP_ID_KEY = 'agrotrust_active_crop_id';

// Cultivo inicial por defecto (alineado con la demo del backend) para que la app tenga datos al abrirse
const DEFAULT_INITIAL_CROPS: Cultivo[] = [
  {
    id: 1,
    nombre: 'Tomate',
    variedad: 'Cherry',
    fecha_siembra: '2026-01-01',
    etapa_actual: 'floracion',
  },
];

export function getStoredCrops(): Cultivo[] {
  try {
    const raw = localStorage.getItem(CROPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_CROPS));
      return DEFAULT_INITIAL_CROPS;
    }
    return JSON.parse(raw) as Cultivo[];
  } catch {
    return DEFAULT_INITIAL_CROPS;
  }
}

export function saveStoredCrops(crops: Cultivo[]): void {
  try {
    localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(crops));
  } catch (err) {
    console.error('Error saving crops to localStorage', err);
  }
}

export function addCropToStorage(crop: Cultivo): void {
  const current = getStoredCrops();
  const exists = current.some((c) => c.id === crop.id);
  const updated = exists
    ? current.map((c) => (c.id === crop.id ? { ...c, ...crop } : c))
    : [...current, crop];
  saveStoredCrops(updated);
}

export function updateCropInStorage(cropId: number, partial: Partial<Cultivo>): void {
  const current = getStoredCrops();
  const updated = current.map((c) => (c.id === cropId ? { ...c, ...partial } : c));
  saveStoredCrops(updated);
}

export function getActiveCropId(): number {
  try {
    const raw = localStorage.getItem(ACTIVE_CROP_ID_KEY);
    if (raw) {
      const id = parseInt(raw, 10);
      if (!isNaN(id)) return id;
    }
  } catch {
    // fallback
  }
  const crops = getStoredCrops();
  return crops.length > 0 ? crops[0].id : 1;
}

export function setActiveCropId(id: number): void {
  try {
    localStorage.setItem(ACTIVE_CROP_ID_KEY, id.toString());
  } catch (err) {
    console.error('Error saving active crop id', err);
  }
}
