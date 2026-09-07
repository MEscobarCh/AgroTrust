import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Sprout,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { traceabilityService } from '../services/traceabilityService';
import type { HistorialLoteResponse } from '../types/api';

export const TraceabilityPage: React.FC = () => {
  const { codigoLote } = useParams<{ codigoLote: string }>();
  const [history, setHistory] = useState<HistorialLoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigoLote) return;

    // Si es demo, podemos cargar datos de demostración o intentar consultar la API
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await traceabilityService.getLotHistory(codigoLote);
        setHistory(data);
      } catch (err: unknown) {
        console.error(err);
        // Si el lote no existe en BD (ej. al abrir el botón demo directo), ofrecemos datos de ejemplo claros
        if (codigoLote === 'LOTE-DEMO') {
          setHistory({
            codigo_lote: 'LOTE-DEMO-2026',
            fecha_cosecha: new Date().toISOString(),
            apto_para_consumo: true,
            aplicaciones_quimicas: [
              {
                producto: 'Fungicida Cobre Bio',
                tipo: 'pesticida',
                fecha_aplicacion: '2026-08-20T10:00:00',
                cosecha_segura_desde: '2026-08-27T10:00:00',
                carencia_respetada: true,
              },
              {
                producto: 'Fertilizante Orgánico NPK',
                tipo: 'fertilizante',
                fecha_aplicacion: '2026-08-15T08:30:00',
                cosecha_segura_desde: '2026-08-15T08:30:00',
                carencia_respetada: true,
              },
            ],
            manejo_nutricional: [
              {
                etapa: 'floracion',
                descripcion: 'Abono secundario (fósforo/potasio)',
                fecha: '2026-08-10',
              },
              {
                etapa: 'fructificacion',
                descripcion: 'Abono de engorde de fruto',
                fecha: '2026-08-25',
              },
            ],
          });
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'No se encontró el lote especificado o la API no está disponible.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [codigoLote]);

  const isSafe = history?.apto_para_consumo ?? false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header móvil / desktop */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-black tracking-tight text-slate-900 text-sm">
              Agro<span className="text-emerald-600">Trust</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-600 font-medium">Verificando autenticidad del lote...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lote No Encontrado</h2>
            <p className="text-xs text-slate-600">{error}</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Ir al Panel Principal
            </Link>
          </div>
        ) : history ? (
          <>
            {/* Sello Certificado de Inocuidad */}
            <div
              className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden ${
                isSafe
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-rose-600 to-amber-700 shadow-rose-500/20'
              }`}
            >
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
                <Award className="w-72 h-72" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                    {isSafe ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    <span>{isSafe ? 'Certificación de Inocuidad' : 'Alerta Fitosanitaria'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {isSafe ? 'APTO PARA CONSUMO HUMANO' : 'NO APTO / RIESGO DE RESIDUOS'}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-50/90 max-w-xl leading-relaxed">
                    {isSafe
                      ? 'Este lote cuenta con trazabilidad completa. Todos los períodos de carencia de pesticidas y fertilizantes han sido rigurosamente respetados antes de la cosecha.'
                      : 'Atención: Este lote fue recolectado antes de cumplirse los días mínimos de carencia legalmente requeridos para los agroquímicos aplicados.'}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 text-center">
                  <span className="text-[11px] text-white/70 block uppercase tracking-wider font-semibold">
                    Código de Lote
                  </span>
                  <span className="font-mono text-lg font-black tracking-widest text-white block mt-0.5">
                    {history.codigo_lote}
                  </span>
                  <span className="text-[10px] text-white/80 block mt-1">
                    Cosecha: {new Date(history.fecha_cosecha).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de Aplicaciones Químicas */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Historial Fitosanitario y Químico
                    </h2>
                    <p className="text-xs text-slate-500">
                      Registro de pesticidas y fertilizantes aplicados al cultivo
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {history.aplicaciones_quimicas.length} registro(s)
                </span>
              </div>

              {history.aplicaciones_quimicas.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {history.aplicaciones_quimicas.map((app, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{app.producto}</span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                              app.tipo === 'pesticida'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {app.tipo}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Aplicado: {new Date(app.fecha_aplicacion).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Seguro desde: {new Date(app.cosecha_segura_desde).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {app.carencia_respetada ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Carencia Cumplida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            No Cumplida
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 italic">
                  No se registraron aplicaciones químicas industriales para este lote (cultivo 100% orgánico o sin químicos).
                </p>
              )}
            </div>

            {/* Manejo Nutricional / Agronómico */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Manejo y Nutrición Vegetal
                  </h2>
                  <p className="text-xs text-slate-500">
                    Prácticas agrícolas y abonamiento ejecutado durante el ciclo
                  </p>
                </div>
              </div>

              {history.manejo_nutricional.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.manejo_nutricional.map((nutri, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          {nutri.etapa}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {nutri.fecha}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 pt-1">
                        {nutri.descripcion}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 italic">
                  Las tareas nutricionales completadas aparecerán aquí una vez certificadas.
                </p>
              )}
            </div>

            {/* Footer de Transparencia */}
            <div className="text-center py-4 space-y-1">
              <p className="text-xs text-slate-400">
                Certificado emitido digitalmente por AgroTrust • Sistema Inmutable de Inocuidad
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default TraceabilityPage;
