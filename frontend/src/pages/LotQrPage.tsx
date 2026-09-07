import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, ExternalLink } from 'lucide-react';
import { traceabilityService } from '../services/traceabilityService';

export const LotQrPage: React.FC = () => {
  const { codigoLote } = useParams<{ codigoLote: string }>();
  const qrUrl = codigoLote ? traceabilityService.getLotQrImageUrl(codigoLote) : '';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (codigoLote) {
      traceabilityService.downloadLotQrImage(codigoLote);
    }
  };

  if (!codigoLote) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5 print:shadow-none print:border-none">
        <div className="flex items-center justify-between print:hidden">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Etiqueta de Lote
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900">Etiqueta QR AgroTrust</h1>
          <p className="text-xs text-slate-500 mt-1">Escaneable para control de inocuidad en góndola</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
          <img
            src={qrUrl}
            alt={`Código QR Lote ${codigoLote}`}
            className="w-56 h-56 mx-auto object-contain"
          />
        </div>

        <div className="font-mono text-sm font-bold bg-slate-100 p-2 rounded-xl text-slate-800">
          {codigoLote}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 print:hidden">
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>

        <div className="print:hidden">
          <Link
            to={`/trazabilidad/${codigoLote}`}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>Ver cómo lo ve el consumidor final</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LotQrPage;
