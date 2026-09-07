/**
 * Módulo de servicio para trazabilidad, códigos QR e historial de lote
 */

import { api } from './api';
import type { HistorialLoteResponse } from '../types/api';

export const traceabilityService = {
  /**
   * Obtiene el historial completo de auditoría y trazabilidad del lote (consumidor final)
   * Endpoint: GET /trazabilidad/<codigo_lote>
   */
  async getLotHistory(codigoLote: string): Promise<HistorialLoteResponse> {
    return api.obtenerHistorialLote(codigoLote);
  },

  /**
   * Retorna la URL del código QR para renderizar en etiquetas o elementos <img>
   * Endpoint: GET /lotes/<codigo_lote>/qr
   */
  getLotQrImageUrl(codigoLote: string): string {
    return api.obtenerQrUrl(codigoLote);
  },

  /**
   * Descarga la imagen del código QR directamente al dispositivo del usuario
   */
  async downloadLotQrImage(codigoLote: string): Promise<void> {
    const url = this.getLotQrImageUrl(codigoLote);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No se pudo descargar el código QR (status: ${response.status})`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `QR-${codigoLote}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default traceabilityService;
