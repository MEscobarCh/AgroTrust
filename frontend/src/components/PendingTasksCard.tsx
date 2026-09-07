import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Check,
  Search,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { TareaPendiente, CreateTareaPayload } from '../types/api';
import { NewTaskModal } from './NewTaskModal';

interface PendingTasksCardProps {
  tasks: TareaPendiente[];
  loading: boolean;
  diasVentana: number;
  onChangeDias: (dias: number) => void;
  onToggleTask?: (taskId: number, currentCompleted: boolean) => Promise<void>;
  onAddTask?: (task: CreateTareaPayload) => Promise<void>;
  currentStage?: string;
  onRefresh?: () => void;
}

const CATEGORY_STYLES: Record<string, { label: string; icon: string; badge: string }> = {
  foliar: {
    label: 'Foliar',
    icon: '🧪',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  fertirriego: {
    label: 'Fertirriego',
    icon: '💧',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  riego: {
    label: 'Riego',
    icon: '🌿',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  enmienda: {
    label: 'Suelo / Enmienda',
    icon: '🌾',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  bioestimulante: {
    label: 'Bioestimulante',
    icon: '✨',
    badge: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  otro: {
    label: 'Manejo',
    icon: '📌',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const inferCategory = (desc: string): string => {
  const lower = desc.toLowerCase();
  if (lower.includes('foliar') || lower.includes('boro') || lower.includes('zinc')) return 'foliar';
  if (lower.includes('riego') && !lower.includes('abono') && !lower.includes('fertiliz')) return 'riego';
  if (
    lower.includes('abono') ||
    lower.includes('fertiliz') ||
    lower.includes('npk') ||
    lower.includes('engorde') ||
    lower.includes('potasio') ||
    lower.includes('fosforo')
  ) {
    return 'fertirriego';
  }
  if (lower.includes('enmienda') || lower.includes('humus') || lower.includes('suelo') || lower.includes('compost')) {
    return 'enmienda';
  }
  if (lower.includes('bioestimulante') || lower.includes('aminoacid') || lower.includes('alga')) {
    return 'bioestimulante';
  }
  return 'fertirriego';
};

export const PendingTasksCard: React.FC<PendingTasksCardProps> = ({
  tasks,
  loading,
  diasVentana,
  onChangeDias,
  onToggleTask,
  onAddTask,
  currentStage = 'germinacion',
  onRefresh,
}) => {
  const [filterTab, setFilterTab] = useState<'pendientes' | 'completadas' | 'todas'>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null);

  // Cálculos de resumen
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completada).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtrado de tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtro por pestaña
      if (filterTab === 'pendientes' && task.completada) return false;
      if (filterTab === 'completadas' && !task.completada) return false;

      // Filtro por búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = task.descripcion.toLowerCase().includes(term);
        const stageMatch = (task.etapa || '').toLowerCase().includes(term);
        if (!descMatch && !stageMatch) return false;
      }

      return true;
    });
  }, [tasks, filterTab, searchTerm]);

  // Manejo de alternancia de tarea
  const handleToggle = async (task: TareaPendiente) => {
    if (!onToggleTask) return;
    try {
      setTogglingTaskId(task.id);
      await onToggleTask(task.id, Boolean(task.completada));
    } catch (err) {
      console.error('Error toggling task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Cálculo de tiempo relativo
  const getRelativeTimeBadge = (fechaStr: string, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
          <Check className="w-3 h-3" />
          Aplicada / Completada
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(fechaStr + 'T00:00:00');
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Atrasada ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
          ¡Para Hoy!
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
          Mañana
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          En {diffDays} días
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col h-full space-y-4">
      {/* Cabecera Principal */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Cronograma Nutricional</h3>
            <p className="text-xs text-slate-500">Plan de fertilización y labores agronómicas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Actualizar labores"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}

          {onAddTask && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              title="Agregar labor nutricional personalizada"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Labor</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso de cumplimiento */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Cumplimiento Nutricional
          </span>
          <span className="font-bold text-slate-900">
            {completedCount} de {totalCount} tareas aplicadas ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controles: Pestañas de estado, Filtro de Días y Buscador */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Pestañas de estado */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterTab('pendientes')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterTab === 'pendientes'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('completadas')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterTab === 'completadas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Aplicadas ({completedCount})
            </button>
            <button
              onClick={() => setFilterTab('todas')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterTab === 'todas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({totalCount})
            </button>
          </div>

          {/* Ventana de días */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[3, 7, 14, 30].map((dias) => (
              <button
                key={dias}
                onClick={() => onChangeDias(dias)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  diasVentana === dias
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Ver tareas de los próximos ${dias} días`}
              >
                {dias}d
              </button>
            ))}
          </div>
        </div>

        {/* Buscador de tareas */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar labor por nutriente o palabra clave..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Lista de Tareas Nutricionales */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-96 pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Consultando labores nutricionales...</span>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = Boolean(task.completada);
            const categoryKey = task.categoria || inferCategory(task.descripcion);
            const catMeta = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.fertirriego;
            const isToggling = togglingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : 'bg-white hover:bg-emerald-50/30 border-slate-200/90 shadow-2xs hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox interactivo */}
                  <button
                    onClick={() => handleToggle(task)}
                    disabled={isToggling}
                    className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-300 hover:text-emerald-600 hover:bg-slate-100'
                    }`}
                    title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {/* Detalle de la tarea */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catMeta.badge}`}
                      >
                        {catMeta.icon} {catMeta.label}
                      </span>

                      {task.etapa && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                          {task.etapa}
                        </span>
                      )}

                      {getRelativeTimeBadge(task.fecha, isCompleted)}
                    </div>

                    <p
                      className={`text-xs font-bold leading-snug ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task.descripcion}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        Programada: {task.fecha}
                      </span>
                      {isCompleted && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Registrada en Trazabilidad
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 px-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2.5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div className="max-w-xs">
              <p className="font-bold text-slate-700">Sin labores pendientes</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {searchTerm
                  ? 'No se encontraron labores con ese criterio de búsqueda.'
                  : `No hay tareas en la ventana de ${diasVentana} días. Puedes programar una labor manual o ampliar el rango de días.`}
              </p>
            </div>
            {onAddTask && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Nueva Labor</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tip Agronómico Contextual */}
      <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold">Recomendación Agronómica: </span>
          <span className="text-slate-600">
            Realiza aplicaciones foliares preferiblemente a primera hora de la mañana (antes de las 9:00 AM) o al caer la tarde para asegurar máxima apertura estomática y evitar fotólisis.
          </span>
        </div>
      </div>

      {/* Modal para Agregar Labor */}
      {onAddTask && (
        <NewTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onAddTask}
          currentStage={currentStage}
        />
      )}
    </div>
  );
};

export default PendingTasksCard;
