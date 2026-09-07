/**
 * Módulo de servicio para gestión de cultivos, inocuidad y labores agronómicas
 */

import { api } from './api';
import type {
  CreateCultivoPayload,
  CreateCultivoResponse,
  CreateAplicacionPayload,
  CreateAplicacionResponse,
  VerificarCosechaResponse,
  AvanzarEtapaResponse,
  TareaPendiente,
  CreateLoteResponse,
} from '../types/api';

export const cropService = {
  /**
   * Registra un nuevo cultivo agrícola
   * Endpoint: POST /cultivos
   */
  async createCrop(payload: CreateCultivoPayload): Promise<CreateCultivoResponse> {
    return api.crearCultivo(payload);
  },

  /**
   * Registra una aplicación de agroquímico (pesticida o fertilizante) con días de carencia
   * Endpoint: POST /cultivos/<id>/aplicaciones
   */
  async addChemicalApplication(
    cultivoId: number,
    payload: CreateAplicacionPayload
  ): Promise<CreateAplicacionResponse> {
    return api.registrarAplicacion(cultivoId, payload);
  },

  /**
   * Consulta el motor de inocuidad para determinar si el cultivo es seguro para cosecha hoy
   * Endpoint: GET /cultivos/<id>/verificar-cosecha
   */
  async checkHarvestSafety(cultivoId: number): Promise<VerificarCosechaResponse> {
    return api.verificarCosecha(cultivoId);
  },

  /**
   * Realiza la transición de etapa fenológica y genera automáticamente el cronograma nutricional
   * Endpoint: POST /cultivos/<id>/avanzar-etapa
   */
  async advanceCropStage(
    cultivoId: number,
    etapa: 'germinacion' | 'floracion' | 'fructificacion'
  ): Promise<AvanzarEtapaResponse> {
    return api.avanzarEtapa(cultivoId, { etapa });
  },

  /**
   * Obtiene la lista de tareas nutricionales pendientes dentro de una ventana de días
   * Endpoint: GET /cultivos/<id>/tareas-pendientes?dias=X
   */
  async getPendingTasks(
    cultivoId: number,
    diasVentana: number = 7
  ): Promise<TareaPendiente[]> {
    return api.obtenerTareasPendientes(cultivoId, diasVentana);
  },

  /**
   * Realiza la cosecha del cultivo, validando inocuidad y asignando código de lote único
   * Endpoint: POST /cultivos/<id>/lotes
   */
  async createHarvestLot(cultivoId: number): Promise<CreateLoteResponse> {
    return api.crearLote(cultivoId);
  },
};

export default cropService;
