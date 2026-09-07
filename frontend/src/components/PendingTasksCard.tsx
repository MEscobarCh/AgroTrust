import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import type { TareaPendiente } from '../types/api';

interface PendingTasksCardProps {
  tasks: TareaPendiente[];
  loading: boolean;
  diasVentana: number;
  onChangeDias: (dias: number) => void;
}

export const PendingTasksCard: React.FC<PendingTasksCardProps> = ({
  tasks,
  loading,
  diasVentana,
  onChangeDias,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cronograma Nutricional</h3>
            <p className="text-[11px] text-slate-500">Labores agronómicas por vencer</p>
          </div>
        </div>

        {/* Filtro de ventana de días */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[3, 7, 14].map((dias) => (
            <button
              key={dias}
              onClick={() => onChangeDias(dias)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                diasVentana === dias
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {dias}d
            </button>
          ))}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 pr-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Consultando tareas...</span>
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {task.descripcion}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Programada: {task.fecha}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <span>Sin labores nutricionales pendientes para los próximos {diasVentana} días.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTasksCard;
