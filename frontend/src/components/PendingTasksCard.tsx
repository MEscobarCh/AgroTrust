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
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  fertirriego: {
    label: 'Fertirriego',
    icon: '💧',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  riego: {
    label: 'Riego',
    icon: '🌿',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  enmienda: {
    label: 'Suelo / Enmienda',
    icon: '🌾',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  bioestimulante: {
    label: 'Bioestimulante',
    icon: '✨',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
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

  // Cálculo de tiempo relativo con acentos sobrios
  const getRelativeTimeBadge = (fechaStr: string, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Check className="w-3 h-3" />
          Aplicada
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(fechaStr + 'T00:00:00');
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3" />
          Atrasada ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          ¡Para Hoy!
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          Mañana
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          En {diffDays} días
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col h-full space-y-4 overflow-hidden">
      {/* Cabecera Principal con acento índigo sobrio para nutrición */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shadow-2xs shrink-0">
            <Calendar className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
              Cronograma Nutricional
            </h3>
            <p className="text-xs text-slate-500 truncate">Fertilización y bioestimulación</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Actualizar labores"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          {onAddTask && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-indigo-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Agregar labor nutricional manual"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>+ Nueva Labor</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso de cumplimiento nutricional (acento índigo sobrio) */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">Cumplimiento Nutricional</span>
          </span>
          <span className="font-bold text-slate-800 shrink-0 text-xs">
            {completedCount}/{totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controles: Pestañas de estado en grilla de 3 columnas para evitar desbordamiento */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('pendientes')}
            className={`py-1 px-1 rounded-lg transition-colors cursor-pointer text-center truncate ${
              filterTab === 'pendientes'
                ? 'bg-white text-indigo-950 border border-slate-300 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`Pendientes (${pendingCount})`}
          >
            Pendientes <span className="text-[11px] opacity-80">({pendingCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('completadas')}
            className={`py-1 px-1 rounded-lg transition-colors cursor-pointer text-center truncate ${
              filterTab === 'completadas'
                ? 'bg-white text-indigo-950 border border-slate-300 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`Aplicadas (${completedCount})`}
          >
            Aplicadas <span className="text-[11px] opacity-80">({completedCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('todas')}
            className={`py-1 px-1 rounded-lg transition-colors cursor-pointer text-center truncate ${
              filterTab === 'todas'
                ? 'bg-white text-indigo-950 border border-slate-300 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`Todas (${totalCount})`}
          >
            Todas <span className="text-[11px] opacity-80">({totalCount})</span>
          </button>
        </div>

        {/* Fila compacta de Buscador y Ventana de Días */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar labor..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
            {[3, 7, 14, 30].map((dias) => (
              <button
                key={dias}
                onClick={() => onChangeDias(dias)}
                className={`px-1.5 sm:px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  diasVentana === dias
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Ver tareas de los próximos ${dias} días`}
              >
                {dias}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Tareas Nutricionales */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-96 pr-1">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-indigo-600" />
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
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : 'bg-white hover:bg-indigo-50/30 border-slate-200 shadow-2xs hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox interactivo */}
                  <button
                    onClick={() => handleToggle(task)}
                    disabled={isToggling}
                    className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
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
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize border border-slate-200">
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

                    <div className="flex items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Programada: {task.fecha}
                      </span>
                      {isCompleted && (
                        <span className="text-indigo-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Registrada en Lote
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
            <CheckCircle2 className="w-8 h-8 text-indigo-500" />
            <div className="max-w-xs">
              <p className="font-bold text-slate-700">Sin labores en este período</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {searchTerm
                  ? 'No se encontraron labores con ese criterio de búsqueda.'
                  : `No hay tareas pendientes en la ventana de ${diasVentana} días.`}
              </p>
            </div>
            {onAddTask && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programar Labor Manual</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tip Nutricional Contextual */}
      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold">Recomendación Nutricional: </span>
          <span className="text-slate-600">
            Aplica fertilizaciones foliares temprano en la mañana para optimizar la asimilación estomática sin causar estrés hídrico.
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
