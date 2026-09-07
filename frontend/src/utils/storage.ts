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

// Helpers para estado de tareas completadas y tareas manuales
const COMPLETED_TASKS_KEY = 'agrotrust_completed_tasks';
const CUSTOM_TASKS_KEY = 'agrotrust_custom_tasks';

export function getCompletedTaskIds(cropId: number): number[] {
  try {
    const raw = localStorage.getItem(`${COMPLETED_TASKS_KEY}_${cropId}`);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function toggleCompletedTaskId(cropId: number, taskId: number, forceState?: boolean): boolean {
  try {
    const key = `${COMPLETED_TASKS_KEY}_${cropId}`;
    const list = getCompletedTaskIds(cropId);
    const isCompleted = list.includes(taskId);
    const targetState = forceState !== undefined ? forceState : !isCompleted;

    let updated: number[];
    if (targetState && !isCompleted) {
      updated = [...list, taskId];
    } else if (!targetState && isCompleted) {
      updated = list.filter((id) => id !== taskId);
    } else {
      updated = list;
    }
    localStorage.setItem(key, JSON.stringify(updated));
    return targetState;
  } catch {
    return false;
  }
}

export function getCustomTasks(cropId: number): import('../types/api').TareaPendiente[] {
  try {
    const raw = localStorage.getItem(`${CUSTOM_TASKS_KEY}_${cropId}`);
    return raw ? (JSON.parse(raw) as import('../types/api').TareaPendiente[]) : [];
  } catch {
    return [];
  }
}

export function addCustomTask(cropId: number, task: import('../types/api').TareaPendiente): void {
  try {
    const key = `${CUSTOM_TASKS_KEY}_${cropId}`;
    const current = getCustomTasks(cropId);
    const updated = [task, ...current.filter((t) => t.id !== task.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving custom task', err);
  }
}

