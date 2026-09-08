import { X, Download, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CreateLoteResponse } from '../types/api';
import { traceabilityService } from '../services/traceabilityService';

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotData: CreateLoteResponse | null;
}

export const HarvestModal: React.FC<HarvestModalProps> = ({ isOpen, onClose, lotData }) => {
  if (!isOpen || !lotData) return null;

  const isSafe = lotData.apto_para_consumo;
  const qrUrl = traceabilityService.getLotQrImageUrl(lotData.codigo_lote);

  const handleDownload = () => {
    traceabilityService.downloadLotQrImage(lotData.codigo_lote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge de Inocuidad Fitosanitaria */}
        <div className="inline-flex items-center gap-2 mb-3">
          {isSafe ? (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Lote Apto para Consumo (LMR Cumplido)
            </span>
          ) : (
            <span className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Lote No Apto (Riesgo Fitosanitario)
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900">¡Cosecha Registrada con Éxito!</h3>
        <p className="text-xs text-slate-500 mt-1">
          Se ha emitido el código QR criptográfico para este lote de producción.
        </p>

        {/* Código de Lote destacado */}
        <div className="mt-4 p-2.5 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-800 tracking-wider border border-slate-200">
          {lotData.codigo_lote}
        </div>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-2xs">
          <img
            src={qrUrl}
            alt={`Código QR Lote ${lotData.codigo_lote}`}
            className="w-44 h-44 sm:w-52 sm:h-52 mx-auto object-contain"
          />
          <span className="block text-[10px] text-slate-400 font-medium mt-2">
            Escanea para verificar trazabilidad e inocuidad
          </span>
        </div>

        {/* Alertas si no era seguro */}
        {lotData.alertas && lotData.alertas.length > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 space-y-1">
            <span className="font-bold block">Advertencias registradas en el QR:</span>
            {lotData.alertas.map((a, i) => (
              <p key={i}>• {a}</p>
            ))}
          </div>
        )}

        {/* Acciones: Botón secundario outline neutro + Botón primario sólido esmeralda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Descargar QR (PNG)</span>
          </button>

          <Link
            to={`/trazabilidad/${lotData.codigo_lote}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Ficha Comprador</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HarvestModal;
