/**
 * Definiciones de tipos e interfaces de TypeScript para AgroTrust
 * Mapean con precisión los modelos y respuestas del backend Flask
 */

export type EtapaFenologica = 'germinacion' | 'floracion' | 'fructificacion' | 'cosechado';

export type TipoQuimico = 'pesticida' | 'fertilizante';

// Modelo Cultivo
export interface Cultivo {
  id: number;
  nombre: string;
  variedad?: string;
  fecha_siembra: string; // Formato YYYY-MM-DD
  etapa_actual?: EtapaFenologica | string;
}

// Payload para crear cultivo: POST /cultivos
export interface CreateCultivoPayload {
  nombre: string;
  variedad?: string;
  fecha_siembra: string; // YYYY-MM-DD
}

// Respuesta al crear cultivo: POST /cultivos
export interface CreateCultivoResponse {
  id: number;
  nombre: string;
}

// Payload para registrar aplicación: POST /cultivos/<id>/aplicaciones
export interface CreateAplicacionPayload {
  nombre_producto: string;
  tipo: TipoQuimico;
  dias_carencia: number;
}

// Respuesta de registrar aplicación: POST /cultivos/<id>/aplicaciones
export interface CreateAplicacionResponse {
  id: number;
  producto: string;
  cosecha_segura_desde: string; // ISO DateTime string
}

// Respuesta de verificación de cosecha: GET /cultivos/<id>/verificar-cosecha
export interface VerificarCosechaResponse {
  es_seguro: boolean;
  alertas: string[];
}

// Payload de avanzar etapa: POST /cultivos/<id>/avanzar-etapa
export interface AvanzarEtapaPayload {
  etapa: 'germinacion' | 'floracion' | 'fructificacion';
}

export interface TareaGenerada {
  descripcion: string;
  fecha: string; // YYYY-MM-DD
}

// Respuesta de avanzar etapa: POST /cultivos/<id>/avanzar-etapa
export interface AvanzarEtapaResponse {
  etapa: string;
  tareas_generadas: TareaGenerada[];
}

// Modelo de tarea del cronograma nutricional
export interface TareaPendiente {
  id: number;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  etapa?: string;
  completada?: boolean;
  categoria?: 'foliar' | 'fertirriego' | 'riego' | 'enmienda' | 'bioestimulante' | 'otro';
}

// Payload para registrar una labor manual en el cronograma
export interface CreateTareaPayload {
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  etapa?: string;
  categoria?: string;
}

// Respuesta de crear lote de cosecha: POST /cultivos/<id>/lotes
export interface CreateLoteResponse {
  codigo_lote: string;
  apto_para_consumo: boolean;
  alertas: string[];
  qr_url: string;
}

// Elementos de la respuesta de trazabilidad: GET /trazabilidad/<codigo_lote>
export interface AplicacionHistorial {
  producto: string;
  tipo: string;
  fecha_aplicacion: string; // ISO DateTime
  cosecha_segura_desde: string; // ISO DateTime
  carencia_respetada: boolean;
}

export interface TareaNutricionalHistorial {
  etapa: string;
  descripcion: string;
  fecha: string; // ISO DateTime
}

// Respuesta completa de trazabilidad de lote para el consumidor
export interface HistorialLoteResponse {
  codigo_lote: string;
  fecha_cosecha: string; // ISO DateTime
  apto_para_consumo: boolean;
  aplicaciones_quimicas: AplicacionHistorial[];
  manejo_nutricional: TareaNutricionalHistorial[];
}
