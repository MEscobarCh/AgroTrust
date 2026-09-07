import React, { useState, useEffect, useCallback } from 'react';
import { Sprout, Calendar, FlaskConical, Plus, Sparkles } from 'lucide-react';
import { SafetyCard } from '../components/SafetyCard';
import { StageStepper } from '../components/StageStepper';
import { PendingTasksCard } from '../components/PendingTasksCard';
import { ChemicalModal } from '../components/ChemicalModal';
import { NewCropModal } from '../components/NewCropModal';
import { HarvestModal } from '../components/HarvestModal';
import { cropService } from '../services/cropService';
import { useCrop } from '../context/CropContext';
import type {
  TareaPendiente,
  CreateTareaPayload,
  TipoQuimico,
  CreateLoteResponse,
  CreateCultivoPayload,
} from '../types/api';
import {
  getCompletedTaskIds,
  toggleCompletedTaskId,
  getCustomTasks,
  addCustomTask,
} from '../utils/storage';

export const DashboardPage: React.FC = () => {
  const {
    activeCrop,
    safetyStatus,
    loadingSafety,
    refreshSafety,
    updateStage,
    createCrop,
  } = useCrop();

  const [tasks, setTasks] = useState<TareaPendiente[]>([]);
  const [diasVentana, setDiasVentana] = useState<number>(7);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingStage, setLoadingStage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modales
  const [isChemicalModalOpen, setIsChemicalModalOpen] = useState(false);
  const [isNewCropModalOpen, setIsNewCropModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestResult, setHarvestResult] = useState<CreateLoteResponse | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Cargar tareas (del backend + almacenamiento local resiliente)
  const fetchTasks = useCallback(async (cropId: number, dias: number) => {
    try {
      setLoadingTasks(true);
      let loadedTasks: TareaPendiente[] = [];

      try {
        // Intentar obtener labores desde el endpoint ampliado
        loadedTasks = await cropService.getAllTasks(cropId, dias > 0 ? dias : undefined);
      } catch {
        try {
          // Fallback al endpoint estándar de pendientes
          loadedTasks = await cropService.getPendingTasks(cropId, dias);
        } catch {
          loadedTasks = [];
        }
      }

      // Sincronizar con almacenamiento local (tareas custom y estado de completadas)
      const localCustom = getCustomTasks(cropId);
      const completedIds = new Set(getCompletedTaskIds(cropId));

      const map = new Map<number, TareaPendiente>();
      for (const t of loadedTasks) {
        const isComp = t.completada !== undefined ? Boolean(t.completada) : completedIds.has(t.id);
        map.set(t.id, {
          ...t,
          completada: isComp,
        });
      }

      for (const t of localCustom) {
        if (!map.has(t.id)) {
          const isComp = t.completada !== undefined ? Boolean(t.completada) : completedIds.has(t.id);
          map.set(t.id, {
            ...t,
            completada: isComp,
          });
        }
      }

      setTasks(Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha)));
    } catch (err: unknown) {
      console.error('Error al consultar labores:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (activeCrop) {
      fetchTasks(activeCrop.id, diasVentana);
    }
  }, [activeCrop, diasVentana, fetchTasks]);

  // Registrar agroquímico
  const handleAddChemical = async (data: {
    nombre_producto: string;
    tipo: TipoQuimico;
    dias_carencia: number;
  }) => {
    if (!activeCrop) return;
    const res = await cropService.addChemicalApplication(activeCrop.id, data);
    showToast(`Aplicación registrada: ${res.producto}. Inocuidad recalculada.`);
    await refreshSafety();
  };

  // Avanzar etapa fenológica
  const handleAdvanceStage = async (nextStage: 'germinacion' | 'floracion' | 'fructificacion') => {
    if (!activeCrop) return;
    try {
      setLoadingStage(true);
      const res = await cropService.advanceCropStage(activeCrop.id, nextStage);
      updateStage(res.etapa);
      showToast(`¡Etapa avanzada a ${res.etapa}! Se generaron ${res.tareas_generadas.length} labores nutricionales.`);
      await fetchTasks(activeCrop.id, diasVentana);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al avanzar etapa');
    } finally {
      setLoadingStage(false);
    }
  };

  // Alternar completado de labor nutricional
  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    if (!activeCrop) return;
    const nextState = !currentCompleted;

    // Actualización optimista de UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completada: nextState } : t))
    );
    toggleCompletedTaskId(activeCrop.id, taskId, nextState);

    try {
      await cropService.toggleTask(activeCrop.id, taskId, nextState);
    } catch (err) {
      console.warn('Backend toggle offline, guardado en almacenamiento local:', err);
    }

    if (nextState) {
      showToast('✅ ¡Labor completada! Se registrará en la trazabilidad del lote.');
    } else {
      showToast('Labor marcada como pendiente.');
    }
  };

  // Agregar labor manual al cronograma
  const handleAddTask = async (newTaskData: CreateTareaPayload) => {
    if (!activeCrop) return;
    try {
      let createdTask: TareaPendiente;
      try {
        createdTask = await cropService.createTask(activeCrop.id, newTaskData);
      } catch {
        // Fallback en caso de que backend esté desconectado
        createdTask = {
          id: Date.now(),
          descripcion: newTaskData.descripcion,
          fecha: newTaskData.fecha,
          etapa: newTaskData.etapa || activeCrop.etapa_actual || 'germinacion',
          categoria: (newTaskData.categoria as TareaPendiente['categoria']) || 'foliar',
          completada: false,
        };
      }

      addCustomTask(activeCrop.id, createdTask);
      setTasks((prev) => [...prev, createdTask].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      showToast(`✨ Labor "${createdTask.descripcion}" programada en el cronograma.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar la labor');
    }
  };

  // Cosechar cultivo
  const handleHarvest = async () => {
    if (!activeCrop) return;
    try {
      const res = await cropService.createHarvestLot(activeCrop.id);
      setHarvestResult(res);
      setIsHarvestModalOpen(true);
      updateStage('cosechado');
      await refreshSafety();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al generar el lote de cosecha');
    }
  };

  const handleCreateCrop = async (payload: CreateCultivoPayload) => {
    const newCrop = await createCrop(payload);
    showToast(`¡Cultivo #${newCrop.id} (${newCrop.nombre}) creado con éxito!`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-in slide-in-from-bottom">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Encabezado del Cultivo Activo */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {activeCrop?.nombre || 'Cultivo Principal'}
              </h1>
              {activeCrop?.variedad && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Var: {activeCrop.variedad}
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                ID #{activeCrop?.id || 1}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sembrado: {activeCrop?.fecha_siembra || '2026-01-01'}
              </span>
              <span>•</span>
              <span className="capitalize font-medium text-slate-700">
                Etapa: {activeCrop?.etapa_actual || 'germinacion'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsChemicalModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors shadow-2xs"
          >
            <FlaskConical className="w-4 h-4 text-amber-700" />
            <span>+ Registrar Agroquímico</span>
          </button>

          <button
            onClick={() => setIsNewCropModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Cultivo</span>
          </button>
        </div>
      </div>

      {/* Semáforo de Inocuidad Fitosanitaria */}
      <SafetyCard
        status={safetyStatus}
        loading={loadingSafety}
        onRefresh={refreshSafety}
        onHarvestClick={handleHarvest}
      />

      {/* Grid de 2 Columnas: Ciclo Fenológico y Tareas Nutricionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <StageStepper
            currentStage={activeCrop?.etapa_actual || 'germinacion'}
            loading={loadingStage}
            onAdvanceStage={handleAdvanceStage}
            fechaSiembra={activeCrop?.fecha_siembra}
            cropName={activeCrop?.nombre}
            variedad={activeCrop?.variedad}
            onHarvestClick={handleHarvest}
          />
        </div>

        <div className="lg:col-span-1">
          <PendingTasksCard
            tasks={tasks}
            loading={loadingTasks}
            diasVentana={diasVentana}
            onChangeDias={(dias) => setDiasVentana(dias)}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            currentStage={activeCrop?.etapa_actual || 'germinacion'}
            onRefresh={() => activeCrop && fetchTasks(activeCrop.id, diasVentana)}
          />
        </div>
      </div>

      {/* Modales */}
      <ChemicalModal
        isOpen={isChemicalModalOpen}
        onClose={() => setIsChemicalModalOpen(false)}
        onSubmit={handleAddChemical}
      />

      <NewCropModal
        isOpen={isNewCropModalOpen}
        onClose={() => setIsNewCropModalOpen(false)}
        onSubmit={handleCreateCrop}
      />

      <HarvestModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        lotData={harvestResult}
      />
    </main>
  );
};

export default DashboardPage;
