import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cultivo, VerificarCosechaResponse, CreateCultivoPayload } from '../types/api';
import { cropService } from '../services/cropService';
import {
  getStoredCrops,
  addCropToStorage,
  updateCropInStorage,
  getActiveCropId,
  setActiveCropId,
} from '../utils/storage';

interface CropContextType {
  crops: Cultivo[];
  activeCrop: Cultivo | null;
  activeCropId: number;
  safetyStatus: VerificarCosechaResponse | null;
  loadingSafety: boolean;
  backendError: string | null;
  selectCrop: (id: number) => void;
  createCrop: (payload: CreateCultivoPayload) => Promise<Cultivo>;
  updateStage: (stage: string) => void;
  refreshSafety: () => Promise<void>;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export const CropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crops, setCrops] = useState<Cultivo[]>([]);
  const [activeCropId, setActiveCropIdState] = useState<number>(1);
  const [safetyStatus, setSafetyStatus] = useState<VerificarCosechaResponse | null>(null);
  const [loadingSafety, setLoadingSafety] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Cargar cultivos iniciales
  useEffect(() => {
    const stored = getStoredCrops();
    setCrops(stored);
    const activeId = getActiveCropId();
    if (stored.some((c) => c.id === activeId)) {
      setActiveCropIdState(activeId);
    } else if (stored.length > 0) {
      setActiveCropIdState(stored[0].id);
    }
  }, []);

  const activeCrop = crops.find((c) => c.id === activeCropId) || (crops.length > 0 ? crops[0] : null);

  // Actualizar verificación de inocuidad
  const refreshSafety = useCallback(async () => {
    if (!activeCrop) return;
    try {
      setLoadingSafety(true);
      setBackendError(null);
      const res = await cropService.checkHarvestSafety(activeCrop.id);
      setSafetyStatus(res);
    } catch (err: unknown) {
      console.error('Error al consultar inocuidad:', err);
      setBackendError('Backend desconectado o no disponible en http://127.0.0.1:5000');
    } finally {
      setLoadingSafety(false);
    }
  }, [activeCrop]);

  useEffect(() => {
    if (activeCrop) {
      refreshSafety();
    }
  }, [activeCrop, refreshSafety]);

  const selectCrop = (id: number) => {
    setActiveCropIdState(id);
    setActiveCropId(id);
  };

  const createCrop = async (payload: CreateCultivoPayload): Promise<Cultivo> => {
    const created = await cropService.createCrop(payload);
    const newCrop: Cultivo = {
      id: created.id,
      nombre: created.nombre,
      variedad: payload.variedad,
      fecha_siembra: payload.fecha_siembra,
      etapa_actual: 'germinacion',
    };
    addCropToStorage(newCrop);
    const updated = getStoredCrops();
    setCrops(updated);
    setActiveCropIdState(newCrop.id);
    setActiveCropId(newCrop.id);
    return newCrop;
  };

  const updateStage = (stage: string) => {
    if (!activeCrop) return;
    updateCropInStorage(activeCrop.id, { etapa_actual: stage });
    setCrops(getStoredCrops());
  };

  return (
    <CropContext.Provider
      value={{
        crops,
        activeCrop,
        activeCropId,
        safetyStatus,
        loadingSafety,
        backendError,
        selectCrop,
        createCrop,
        updateStage,
        refreshSafety,
      }}
    >
      {children}
    </CropContext.Provider>
  );
};

export const useCrop = (): CropContextType => {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error('useCrop debe ser utilizado dentro de un CropProvider');
  }
  return context;
};
