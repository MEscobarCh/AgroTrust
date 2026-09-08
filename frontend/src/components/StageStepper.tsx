import React, { useState } from 'react';
import {
  Sprout,
  Flower2,
  Citrus,
  Award,
  Check,
  Sparkles,
  ArrowRight,
  Droplets,
  Calendar,
  ShieldCheck,
  X,
  ChevronDown,
  ChevronUp,
  Leaf,
  Layers,
  Target,
  Clock,
} from 'lucide-react';
import type { EtapaFenologica } from '../types/api';

interface StageStepperProps {
  currentStage: string;
  loading: boolean;
  onAdvanceStage: (nextStage: 'germinacion' | 'floracion' | 'fructificacion') => void;
  fechaSiembra?: string;
  cropName?: string;
  variedad?: string;
  onHarvestClick?: () => void;
}

interface StageDetail {
  key: EtapaFenologica;
  stepNumber: string;
  label: string;
  tagline: string;
  duracionEstimada: string;
  icon: React.ElementType;
  objetivoAgronomico: string;
  nutrientesClave: {
    elemento: string;
    nombre: string;
    rol: string;
    nivel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    nivelColor: string;
    esDestacado?: boolean;
  }[];
  pildorasRecomendacion: string[];
  manejoHidrico: {
    frecuencia: string;
    phRecomendado: string;
    consejo: string;
  };
  fitosanitario: {
    enfoque: string;
    cuidadoPrincipal: string;
  };
  laboresAutomaticas: { descripcion: string; tiempo: string }[];
  puntosClave: string[];
}

const STAGES_DATA: StageDetail[] = [
  {
    key: 'germinacion',
    stepNumber: '01',
    label: 'Germinación',
    tagline: 'Desarrollo radicular y vigor vegetativo inicial',
    duracionEstimada: '~15 a 20 días',
    icon: Sprout,
    objetivoAgronomico:
      'Lograr un enraizamiento vigoroso y profundo, división celular activa en meristemos apicales y desarrollo temprano de cotiledones y hojas verdaderas sin ahilamiento ni etiolación.',
    nutrientesClave: [
      { elemento: 'P', nombre: 'Fósforo', rol: 'Desarrollo y elongación radicular profunda (energía ATP celular)', nivel: 'Crítico', nivelColor: 'bg-emerald-500', esDestacado: true },
      { elemento: 'Ca', nombre: 'Calcio', rol: 'División celular en meristemos de raíces jóvenes', nivel: 'Alto', nivelColor: 'bg-teal-500', esDestacado: true },
      { elemento: 'N', nombre: 'Nitrógeno', rol: 'Vigor foliar moderado sin provocar tallos débiles', nivel: 'Medio', nivelColor: 'bg-blue-400' },
      { elemento: 'Zn', nombre: 'Zinc', rol: 'Precursor de auxinas para inducción de raíces', nivel: 'Medio', nivelColor: 'bg-amber-400' },
    ],
    pildorasRecomendacion: [
      '🌱 Riego frecuente y ligero',
      '🛡️ Prevención de Damping-off',
      '🌡️ Temperatura de sustrato 20-24°C',
    ],
    manejoHidrico: {
      frecuencia: 'Riegos cortos y frecuentes',
      phRecomendado: '6.0 - 6.5',
      consejo: 'Mantener humedad constante en el bulbo radicular sin encharcar para evitar anoxia y asfixia radicular.',
    },
    fitosanitario: {
      enfoque: 'Prevención de Damping-off',
      cuidadoPrincipal: 'Inoculación de bioestimulantes/Trichoderma al trasplante para proteger raíces jóvenes.',
    },
    laboresAutomaticas: [
      { descripcion: 'Riego inicial + fertilizante base', tiempo: 'Día 0 de la etapa' },
      { descripcion: 'Refuerzo foliar temprano', tiempo: 'Día 10 de la etapa' },
    ],
    puntosClave: [
      'Inoculación de enraizantes biológicos',
      'Monitoreo diario de emergencia foliar',
      'Temperatura óptima de sustrato: 20°C - 24°C',
    ],
  },
  {
    key: 'floracion',
    stepNumber: '02',
    label: 'Floración',
    tagline: 'Inducción, cuajado y fertilidad floral',
    duracionEstimada: '~20 a 30 días',
    icon: Flower2,
    objetivoAgronomico:
      'Estimular la inducción floral, asegurar la viabilidad del polen y el cuajado óptimo de las flores evitando el aborto prematuro por estrés hídrico o exceso vegetativo.',
    nutrientesClave: [
      { elemento: 'P', nombre: 'Fósforo', rol: 'Inducción floral y fuente de energía (ATP) para la antesis', nivel: 'Crítico', nivelColor: 'bg-emerald-500', esDestacado: true },
      { elemento: 'B', nombre: 'Boro', rol: 'Germinación del tubo polínico y fijación efectiva del cuajado', nivel: 'Crítico', nivelColor: 'bg-amber-500', esDestacado: true },
      { elemento: 'Zn', nombre: 'Zinc', rol: 'Viabilidad de anteras y desarrollo floral equilibrado', nivel: 'Alto', nivelColor: 'bg-teal-500', esDestacado: true },
      { elemento: 'N', nombre: 'Nitrógeno', rol: 'Regulado (un exceso provoca aborto y vicio vegetativo)', nivel: 'Bajo', nivelColor: 'bg-slate-400' },
    ],
    pildorasRecomendacion: [
      '💧 Riego regular sin encharcar',
      '🐝 Protección de polinizadores',
      '🍃 Refuerzo foliar con Fósforo y Boro',
      '⚠️ Cero insecticidas residuales en antesis',
    ],
    manejoHidrico: {
      frecuencia: 'Riego uniforme y regular',
      phRecomendado: '6.2 - 6.7',
      consejo: 'Evitar estrés hídrico extremo: tanto el exceso como el déficit provocan aborto masivo de flores.',
    },
    fitosanitario: {
      enfoque: 'Protección de polinizadores',
      cuidadoPrincipal: 'Cero aplicaciones de insecticidas de amplio espectro en horas de pecoreo de abejas.',
    },
    laboresAutomaticas: [
      { descripcion: 'Abono secundario (fósforo/potasio)', tiempo: 'Día 0 de la etapa' },
      { descripcion: 'Refuerzo foliar de floración', tiempo: 'Día 15 de la etapa' },
    ],
    puntosClave: [
      'Aplicación foliar de Calcio y Boro prefloración',
      'Ventilación adecuada para favorecer polinización',
      'Monitoreo estricto de trips y oídio',
    ],
  },
  {
    key: 'fructificacion',
    stepNumber: '03',
    label: 'Fructificación',
    tagline: 'Llenado de fruto, calibre y acumulación de °Brix',
    duracionEstimada: '~30 a 50 días',
    icon: Citrus,
    objetivoAgronomico:
      'Maximizar el llenado y calibre del fruto, promover la translocación de carbohidratos (°Brix) y aportar firmeza a la pared celular para prevenir fisiopatías (pudrición apical o cracking) y alargar la vida postcosecha.',
    nutrientesClave: [
      { elemento: 'K', nombre: 'Potasio', rol: 'Llenado de fruto, calibre, translocación de azúcares y °Brix', nivel: 'Crítico', nivelColor: 'bg-orange-500', esDestacado: true },
      { elemento: 'Ca', nombre: 'Calcio', rol: 'Firmeza de la pared celular y prevención de pudrición apical / cracking', nivel: 'Crítico', nivelColor: 'bg-teal-500', esDestacado: true },
      { elemento: 'Mg', nombre: 'Magnesio', rol: 'Mantenimiento de fotosíntesis activa en hojas maduras', nivel: 'Medio', nivelColor: 'bg-blue-400' },
      { elemento: 'N', nombre: 'Nitrógeno', rol: 'Mínimo para no retrasar maduración ni ablandar fruto', nivel: 'Bajo', nivelColor: 'bg-slate-400' },
    ],
    pildorasRecomendacion: [
      '💧 Riego controlado',
      '🔍 Monitoreo de plagas de fruto',
      '🛑 Respetar período de carencia',
      '🍅 Refuerzo de Potasio (K) y Calcio (Ca)',
    ],
    manejoHidrico: {
      frecuencia: 'Riego decreciente y controlado',
      phRecomendado: '6.0 - 6.5',
      consejo: 'Oscilaciones hídricas bruscas en este punto causan rajado de fruto (cracking) o pudrición apical.',
    },
    fitosanitario: {
      enfoque: 'Respeto de Períodos de Carencia',
      cuidadoPrincipal: 'No aplicar pesticidas residuales cerca a la cosecha; verificar siempre el Semáforo de Inocuidad.',
    },
    laboresAutomaticas: [
      { descripcion: 'Abono de engorde de fruto', tiempo: 'Día 0 de la etapa' },
      { descripcion: 'Último refuerzo antes de cosecha', tiempo: 'Día 12 de la etapa' },
    ],
    puntosClave: [
      'Refuerzo de potasio soluble en fertirriego',
      'Calcio quelatado para prevenir desórdenes fisiológicos',
      'Monitoreo del índice de madurez y color',
    ],
  },
  {
    key: 'cosechado',
    stepNumber: '04',
    label: 'Cosechado',
    tagline: 'Inocuidad verificada y emisión de lote con QR',
    duracionEstimada: 'Cierre de ciclo',
    icon: Award,
    objetivoAgronomico:
      'Recolección en madurez comercial óptima garantizando inocuidad fitosanitaria (cero residuos de agroquímicos sobre el LMR) y registro inmutable del lote cosechado con certificado QR para trazabilidad del consumidor.',
    nutrientesClave: [
      { elemento: 'LMR', nombre: 'Inocuidad', rol: 'Cero residuos químicos activos por encima de norma', nivel: 'Crítico', nivelColor: 'bg-emerald-600', esDestacado: true },
      { elemento: '°Bx', nombre: 'Calidad', rol: 'Grados Brix y firmeza ideales para el comprador final', nivel: 'Alto', nivelColor: 'bg-amber-500', esDestacado: true },
    ],
    pildorasRecomendacion: [
      '☀️ Cosecha en horas frescas',
      '🧼 Desinfección de herramientas',
      '📱 Emisión de trazabilidad QR',
    ],
    manejoHidrico: {
      frecuencia: 'Suspensión 48-72h previas al corte',
      phRecomendado: 'N/A',
      consejo: 'El retiro hídrico previo concentra los azúcares y evita frutos aguados con baja vida de anaquel.',
    },
    fitosanitario: {
      enfoque: 'Buenas Prácticas de Cosecha (BPA)',
      cuidadoPrincipal: 'Desinfección de herramientas y cajas limpias; emisión de trazabilidad AgroTrust.',
    },
    laboresAutomaticas: [
      { descripcion: 'Validación del semáforo de carencia', tiempo: 'Previo al corte' },
      { descripcion: 'Generación del código de lote QR', tiempo: 'Al cosechar' },
    ],
    puntosClave: [
      'Corte en horas frescas de la mañana',
      'Inspección visual de calidad de fruto',
      'Generación de certificado QR inmutable',
    ],
  },
];

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStage,
  loading,
  onAdvanceStage,
  fechaSiembra,
  cropName,
  variedad,
  onHarvestClick,
}) => {
  const currentIdx = STAGES_DATA.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  // Etapa que se está inspeccionando detalladamente (por defecto la activa)
  const [inspectedKey, setInspectedKey] = useState<EtapaFenologica>(
    (currentStage as EtapaFenologica) || 'germinacion'
  );
  const [showDetails, setShowDetails] = useState(true);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  // Siguiente etapa posible
  const nextStage: 'floracion' | 'fructificacion' | null =
    activeIndex === 0 ? 'floracion' : activeIndex === 1 ? 'fructificacion' : null;

  const nextStageData = nextStage ? STAGES_DATA.find((s) => s.key === nextStage) : null;
  const currentStageData = STAGES_DATA[activeIndex] || STAGES_DATA[0];
  const inspectedData = STAGES_DATA.find((s) => s.key === inspectedKey) || currentStageData;

  // Cálculo de progreso porcentual del ciclo
  const progressPercentage =
    currentStage === 'cosechado'
      ? 100
      : activeIndex === 2
      ? 75
      : activeIndex === 1
      ? 50
      : 25;

  // Cálculo de días transcurridos si existe fecha de siembra
  const getDaysElapsed = (): number | null => {
    if (!fechaSiembra) return null;
    const planted = new Date(fechaSiembra);
    if (isNaN(planted.getTime())) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  };
  const daysElapsed = getDaysElapsed();

  const handleConfirmAdvance = () => {
    if (!nextStage) return;
    setIsAdvanceModalOpen(false);
    onAdvanceStage(nextStage);
    setInspectedKey(nextStage);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs transition-all space-y-6 overflow-hidden">
      {/* Encabezado con estado activo y progreso general */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Ciclo Fenológico y Requerimientos</span>
              {cropName && (
                <span className="text-xs font-normal text-slate-500 hidden md:inline">
                  • {cropName} {variedad ? `(${variedad})` : ''}
                </span>
              )}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Etapa Activa: {currentStageData.label}
            </span>
            {daysElapsed !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Día {daysElapsed} de cultivo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Progreso agronómico continuo del cultivo con requerimientos nutricionales ajustados a cada fase fenológica.
          </p>
        </div>

        {/* Acciones principales de avance (Botón primario sólido esmeralda) */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {nextStage && (
            <button
              onClick={() => setIsAdvanceModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
              title={`Avanzar a ${nextStageData?.label}`}
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Avanzar Etapa</span>
              <span className="text-emerald-100 font-medium hidden sm:inline">➔ {nextStageData?.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStage === 'fructificacion' && onHarvestClick && (
            <button
              onClick={onHarvestClick}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Cosechar Cultivo</span>
            </button>
          )}

          {currentStage === 'cosechado' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 shrink-0">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Ciclo Completado</span>
            </span>
          )}
        </div>
      </div>

      {/* LÍNEA CONECTORA HORIZONTAL CONTINUA (Ley de Gestalt: Continuidad) */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Línea de Progresión Temporal Continua
          </span>
          <span className="text-xs font-bold text-emerald-700">
            {progressPercentage}% del ciclo
          </span>
        </div>

        <div className="relative pt-2 pb-1">
          {/* Pista conectora continua de fondo (Gris Slate neutro) */}
          <div className="absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-0" />

          {/* Segmento de progreso activo continuo (Verde Esmeralda) */}
          <div
            className="absolute top-7 left-[12.5%] h-1 bg-emerald-600 transition-all duration-500 -z-0"
            style={{
              width: `${(Math.min(activeIndex, 3) / 3) * 75}%`,
            }}
          />

          {/* Nodos de las 4 Fases alineados sobre la línea continua */}
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {STAGES_DATA.map((stage, idx) => {
              const isPassed = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isInspected = inspectedKey === stage.key;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => setInspectedKey(stage.key)}
                  className={`flex flex-col items-center text-center group cursor-pointer transition-all p-2 rounded-xl border ${
                    isInspected
                      ? 'bg-white border-slate-300 shadow-2xs ring-1 ring-slate-300'
                      : 'border-transparent hover:bg-white/80'
                  }`}
                  title={`Ver ficha técnica de ${stage.label}`}
                >
                  {/* Nodo circular sobre la pista */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all mb-2 shadow-2xs ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Metadatos de la fase */}
                  <div className="space-y-0.5 w-full">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fase {stage.stepNumber}
                    </span>
                    <span
                      className={`text-xs font-bold block truncate ${
                        isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-800'
                          : isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? 'Completada' : isCurrent ? 'En Curso' : 'Pendiente'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. FICHA RESUMEN DE LA ETAPA ACTIVA (Región Común & Proximidad) */}
      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-2xs space-y-4">
        {/* Barra superior de la ficha resumen */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <currentStageData.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ficha de la Etapa Activa
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {currentStageData.label}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{currentStageData.tagline}</h3>
            </div>
          </div>

          {/* Indicador de "Días desde la siembra" */}
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block leading-tight">
                  Días desde siembra
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {daysElapsed !== null ? `${daysElapsed} días acumulados` : '0 días'}
                </span>
              </div>
            </div>

            {fechaSiembra && (
              <div className="hidden lg:flex flex-col text-right text-[11px] text-slate-500 pr-1">
                <span className="text-slate-400">Fecha siembra:</span>
                <span className="font-semibold text-slate-700">{fechaSiembra}</span>
              </div>
            )}
          </div>
        </div>

        {/* Píldoras de Recomendación Técnica Preventiva */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Píldoras de Manejo Preventivo:
          </span>
          <div className="flex flex-wrap gap-2">
            {currentStageData.pildorasRecomendacion.map((pill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* 2 Columnas: Objetivo Agronómico y Requerimientos Nutricionales */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
          {/* Objetivo Agronómico */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Target className="w-4 h-4 text-slate-700" />
              <span>Objetivo Agronómico</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {currentStageData.objetivoAgronomico}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
              <span>Duración estimada:</span>
              <span className="font-semibold text-slate-700">{currentStageData.duracionEstimada}</span>
            </div>
          </div>

          {/* Requerimientos Nutricionales */}
          <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-slate-700" />
                <span>Elementos y Nutrientes Clave</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                Prioridad de Asimilación
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentStageData.nutrientesClave.map((nutriente, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">
                      [{nutriente.elemento}] {nutriente.nombre}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                        nutriente.nivel === 'Crítico'
                          ? 'bg-slate-900 text-white'
                          : nutriente.nivel === 'Alto'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {nutriente.nivel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{nutriente.rol}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 Fases con botón de alternar detalles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Detalle por Fases del Cultivo
          </span>
          {/* Botón secundario en estilo outline neutro */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>{showDetails ? 'Ocultar Ficha Técnica' : 'Ver Ficha Técnica'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES_DATA.map((stage, idx) => {
            const isPassed = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isInspected = inspectedKey === stage.key;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                onClick={() => setInspectedKey(stage.key)}
                className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer select-none group ${
                  isCurrent
                    ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : isPassed
                    ? 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    : 'bg-white border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
                } ${isInspected ? 'ring-2 ring-slate-400/40' : ''}`}
              >
                {/* Cabecera de la tarjeta con icono y estado */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPassed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Completada
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        En Curso
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        PASO {stage.stepNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Título y descripción breve */}
                <h3 className="text-sm font-bold leading-tight text-slate-900">
                  {stage.label}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {stage.tagline}
                </p>

                {/* Duración aproximada y estado de inspección */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">{stage.duracionEstimada}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      isInspected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isInspected ? 'Inspeccionando' : 'Ver ficha'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ficha Técnica Agronómica Expandida de la Etapa Inspeccionada */}
      {showDetails && inspectedData && (
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <inspectedData.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Ficha Técnica: {inspectedData.label}</span>
                  {inspectedData.key === currentStage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Etapa Actual
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-500">{inspectedData.tagline}</p>
              </div>
            </div>

            {/* Si la etapa inspeccionada es la siguiente, botón para avanzar rápido */}
            {inspectedData.key === nextStage && (
              <button
                onClick={() => setIsAdvanceModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Avanzar a esta etapa</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna 1: Demanda Nutricional */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                Demanda Nutricional
              </span>
              <div className="space-y-2">
                {inspectedData.nutrientesClave.map((nutriente, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-800">
                        <strong>[{nutriente.elemento}]</strong> {nutriente.nombre}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {nutriente.nivel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{nutriente.rol}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: Manejo Hídrico y Suelo */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-slate-700" />
                Manejo Hídrico y Suelo
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold block">Régimen de Riego:</span>
                  <p className="text-slate-800 font-medium">{inspectedData.manejoHidrico.frecuencia}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold block">pH Recomendado:</span>
                  <p className="text-slate-800 font-medium">{inspectedData.manejoHidrico.phRecomendado}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  {inspectedData.manejoHidrico.consejo}
                </div>
              </div>
            </div>

            {/* Columna 3: Labores Automáticas del Cronograma */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                Labores Nutricionales Asociadas
              </span>
              <div className="space-y-2">
                {inspectedData.laboresAutomaticas.map((labor, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 leading-snug">{labor.descripcion}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{labor.tiempo}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                    <span>{inspectedData.fitosanitario.cuidadoPrincipal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Avanzar de Etapa */}
      {isAdvanceModalOpen && nextStageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsAdvanceModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirmar Avance de Etapa</h3>
                <p className="text-xs text-slate-500">Transición del ciclo fenológico del cultivo</p>
              </div>
            </div>

            {/* Comparativa de Etapas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 mb-4">
              <div className="text-center flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Etapa Actual</span>
                <p className="text-sm font-bold text-slate-700">{currentStageData.label}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="text-center flex-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Nueva Etapa</span>
                <p className="text-sm font-bold text-emerald-900">{nextStageData.label}</p>
              </div>
            </div>

            {/* Previsualización de Labores a Generar */}
            <div className="mb-5 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                Labores nutricionales que se activarán automáticamente:
              </span>
              <div className="space-y-1.5">
                {nextStageData.laboresAutomaticas.map((labor, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                  >
                    <span className="font-semibold text-slate-800">{labor.descripcion}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                      {labor.tiempo}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                * Estas tareas aparecerán inmediatamente en el Cronograma Nutricional con sus fechas calculadas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              {/* Botón secundario en estilo outline neutro */}
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Cancelar
              </button>
              {/* Botón primario sólido en verde esmeralda */}
              <button
                type="button"
                onClick={handleConfirmAdvance}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Avanzando...' : `Confirmar y Pasar a ${nextStageData.label}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageStepper;
