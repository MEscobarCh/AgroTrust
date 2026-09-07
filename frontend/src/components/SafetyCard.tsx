import React from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { VerificarCosechaResponse } from '../types/api';

interface SafetyCardProps {
  status: VerificarCosechaResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onHarvestClick: () => void;
}

export const SafetyCard: React.FC<SafetyCardProps> = ({
  status,
  loading,
  onRefresh,
  onHarvestClick,
}) => {
  const isSafe = status?.es_seguro ?? false;
  const alerts = status?.alertas ?? [];

  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-200 ${
        isSafe
          ? 'bg-gradient-to-br from-emerald-500/10 via-white to-emerald-50 border-emerald-300 shadow-sm'
          : 'bg-gradient-to-br from-amber-500/10 via-white to-rose-50 border-rose-300 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${
              isSafe ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {isSafe ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Semáforo de Inocuidad Fitosanitaria
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isSafe
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800 animate-pulse'
                }`}
              >
                {isSafe ? 'APTO PARA COSECHA' : 'RIESGO DE CARENCIA'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              {isSafe
                ? 'Todos los agroquímicos aplicados han cumplido su período de degradación segura.'
                : 'Se detectaron aplicaciones químicas activas que aún no cumplen el tiempo de retiro seguro.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          title="Verificar estado de carencia nuevamente"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Verificar</span>
        </button>
      </div>

      {/* Alertas de Toxicidad / Riesgo */}
      {alerts.length > 0 ? (
        <div className="mt-5 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Alertas de toxicidad activas ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alerta, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 text-sm bg-rose-50 border border-rose-200 rounded-xl text-rose-900"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <p className="leading-snug">{alerta}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No existen residuos químicos por encima de los límites tolerables en este momento.</span>
        </div>
      )}

      {/* Barra de acción para cosechar */}
      <div className="mt-5 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          * Al cosechar, el sistema validará la fecha actual y emitirá el sello del lote en el QR.
        </span>

        <button
          onClick={onHarvestClick}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-xs transition-all ${
            isSafe
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-md'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>{isSafe ? '🌾 Cosechar y Generar Lote QR' : '🌾 Cosechar (Generar con Advertencia)'}</span>
        </button>
      </div>
    </div>
  );
};

export default SafetyCard;
