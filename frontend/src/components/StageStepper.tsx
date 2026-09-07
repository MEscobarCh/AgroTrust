import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import type { EtapaFenologica } from '../types/api';

interface StageStepperProps {
  currentStage: string;
  loading: boolean;
  onAdvanceStage: (nextStage: 'germinacion' | 'floracion' | 'fructificacion') => void;
}

const STAGES: { key: EtapaFenologica; label: string; desc: string }[] = [
  { key: 'germinacion', label: 'Germinación', desc: 'Riego y fertilizante base' },
  { key: 'floracion', label: 'Floración', desc: 'Abono P/K y refuerzo foliar' },
  { key: 'fructificacion', label: 'Fructificación', desc: 'Engorde y maduración' },
  { key: 'cosechado', label: 'Cosechado', desc: 'Lote y QR emitido' },
];

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  loading,
  onAdvanceStage,
}) => {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  // Siguiente etapa posible para avanzar
  const nextStage =
    activeIndex === 0
      ? 'floracion'
      : activeIndex === 1
      ? 'fructificacion'
      : null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Ciclo Fenológico y Nutricional</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Etapa: {STAGES[activeIndex]?.label || currentStage}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cada etapa desbloquea automáticamente tareas de nutrición específicas en el cronograma.
          </p>
        </div>

        {nextStage && (
          <button
            onClick={() => onAdvanceStage(nextStage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Avanzar a {STAGES.find((s) => s.key === nextStage)?.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stepper visual */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={stage.key}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : isPassed
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">PASO 0{idx + 1}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isPassed ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
              </div>
              <p className={`text-sm font-bold ${isCurrent ? 'text-emerald-900' : 'text-slate-800'}`}>
                {stage.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{stage.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageStepper;
