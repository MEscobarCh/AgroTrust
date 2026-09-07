/**
 * Cliente API central para AgroTrust
 * Soporta VITE_API_BASE_URL (para despliegue en Vercel) y fallback '/api' para desarrollo local con proxy Vite.
 */

import type {
  CreateCultivoPayload,
  CreateCultivoResponse,
  CreateAplicacionPayload,
  CreateAplicacionResponse,
  VerificarCosechaResponse,
  AvanzarEtapaPayload,
  AvanzarEtapaResponse,
  TareaPendiente,
  CreateTareaPayload,
  CreateLoteResponse,
  HistorialLoteResponse,
} from '../types/api';

// En producción (Vercel) utiliza VITE_API_BASE_URL configurada en el panel.
// En desarrollo local con Vite proxy, se usa el fallback '/api' para evitar problemas de CORS.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === 'object') {
        errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Registra un nuevo cultivo
   * POST /cultivos
   */
  crearCultivo: (data: CreateCultivoPayload): Promise<CreateCultivoResponse> => {
    return request<CreateCultivoResponse>('/cultivos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Registra una aplicación química (pesticida o fertilizante)
   * POST /cultivos/<id>/aplicaciones
   */
  registrarAplicacion: (
    cultivoId: number,
    data: CreateAplicacionPayload
  ): Promise<CreateAplicacionResponse> => {
    return request<CreateAplicacionResponse>(`/cultivos/${cultivoId}/aplicaciones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Evalúa si es seguro cosechar el cultivo en base a períodos de carencia
   * GET /cultivos/<id>/verificar-cosecha
   */
  verificarCosecha: (cultivoId: number): Promise<VerificarCosechaResponse> => {
    return request<VerificarCosechaResponse>(`/cultivos/${cultivoId}/verificar-cosecha`, {
      method: 'GET',
    });
  },

  /**
   * Avanza la etapa fenológica del cultivo y autogenera su cronograma nutricional
   * POST /cultivos/<id>/avanzar-etapa
   */
  avanzarEtapa: (
    cultivoId: number,
    data: AvanzarEtapaPayload
  ): Promise<AvanzarEtapaResponse> => {
    return request<AvanzarEtapaResponse>(`/cultivos/${cultivoId}/avanzar-etapa`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Consulta las tareas nutricionales pendientes que vencen en los próximos días
   * GET /cultivos/<id>/tareas-pendientes?dias=X
   */
  obtenerTareasPendientes: (
    cultivoId: number,
    dias: number = 7
  ): Promise<TareaPendiente[]> => {
    return request<TareaPendiente[]>(`/cultivos/${cultivoId}/tareas-pendientes?dias=${dias}`, {
      method: 'GET',
    });
  },

  /**
   * Consulta todas las tareas nutricionales (pendientes y completadas)
   * GET /cultivos/<id>/tareas
   */
  obtenerTodasTareas: (
    cultivoId: number,
    dias?: number,
    soloPendientes: boolean = false
  ): Promise<TareaPendiente[]> => {
    const params = new URLSearchParams();
    if (dias) params.append('dias', dias.toString());
    if (soloPendientes) params.append('solo_pendientes', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<TareaPendiente[]>(`/cultivos/${cultivoId}/tareas${query}`, {
      method: 'GET',
    });
  },

  /**
   * Registra una labor agronómica personalizada en el cronograma
   * POST /cultivos/<id>/tareas
   */
  crearTarea: (
    cultivoId: number,
    data: CreateTareaPayload
  ): Promise<TareaPendiente> => {
    return request<TareaPendiente>(`/cultivos/${cultivoId}/tareas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cambia el estado de completada de una labor nutricional
   * PATCH /cultivos/<id>/tareas/<tarea_id>/toggle
   */
  toggleTarea: (
    cultivoId: number,
    tareaId: number,
    completada?: boolean
  ): Promise<TareaPendiente> => {
    return request<TareaPendiente>(`/cultivos/${cultivoId}/tareas/${tareaId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify(completada !== undefined ? { completada } : {}),
    });
  },

  /**
   * Cierra el ciclo del cultivo y genera el lote de cosecha con validación de inocuidad
   * POST /cultivos/<id>/lotes
   */
  crearLote: (cultivoId: number): Promise<CreateLoteResponse> => {
    return request<CreateLoteResponse>(`/cultivos/${cultivoId}/lotes`, {
      method: 'POST',
    });
  },

  /**
   * Retorna la URL directa para la imagen QR del lote
   * GET /lotes/<codigo_lote>/qr
   */
  obtenerQrUrl: (codigoLote: string): string => {
    return `${BASE_URL}/lotes/${codigoLote}/qr`;
  },

  /**
   * Obtiene el historial completo de trazabilidad e inocuidad del lote (vista del comprador)
   * GET /trazabilidad/<codigo_lote>
   */
  obtenerHistorialLote: (codigoLote: string): Promise<HistorialLoteResponse> => {
    return request<HistorialLoteResponse>(`/trazabilidad/${codigoLote}`, {
      method: 'GET',
    });
  },
};

export default api;
