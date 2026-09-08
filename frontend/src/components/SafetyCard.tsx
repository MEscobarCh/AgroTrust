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
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Indicador de estado: Verde esmeralda exclusivo para seguro; Ámbar/Rojo contenido para alertas */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${
              isSafe ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
          >
            {isSafe ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                Semáforo de Inocuidad Fitosanitaria
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isSafe
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSafe ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
                  }`}
                />
                {isSafe ? 'APTO PARA COSECHA (LMR CUMPLIDO)' : 'CARENCIA ACTIVA • RIESGO'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              {isSafe
                ? 'Todos los agroquímicos aplicados han cumplido su período de degradación segura. Cero residuos sobre el Límite Máximo de Residuos (LMR).'
                : 'Se detectaron aplicaciones químicas con período de carencia activo que aún no cumplen el tiempo de retiro seguro antes de corte.'}
            </p>
          </div>
        </div>

        {/* Botón secundario en estilo outline neutro */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors disabled:opacity-50 cursor-pointer shrink-0 self-start"
          title="Verificar estado de carencia nuevamente"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
          <span>Verificar</span>
        </button>
      </div>

      {/* Alertas Fitosanitarias Contenidas */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Alertas de carencia y toxicidad ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alerta, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 text-xs bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <p className="leading-snug font-medium">{alerta}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 text-xs text-emerald-900 bg-emerald-50/70 border border-emerald-200 px-4 py-3 rounded-xl font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No existen residuos químicos por encima de los límites tolerables. Inocuidad certificable para comercialización.</span>
        </div>
      )}

      {/* Barra de acción para cosechar */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500 text-center sm:text-left">
          * Al cosechar, el sistema valida la fecha actual y emite el sello del lote inmutable en el código QR.
        </span>

        {/* Botón primario sólido para estado seguro, o botón de precaución si hay carencia */}
        <button
          onClick={onHarvestClick}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 ${
            isSafe
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>{isSafe ? '🌾 Cosechar y Generar Lote QR' : '🌾 Cosechar (Con Advertencia de Carencia)'}</span>
        </button>
      </div>
    </div>
  );
};

export default SafetyCard;
