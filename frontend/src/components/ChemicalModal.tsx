import React, { useState } from 'react';
import { X, FlaskConical, AlertCircle } from 'lucide-react';
import type { TipoQuimico } from '../types/api';

interface ChemicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre_producto: string; tipo: TipoQuimico; dias_carencia: number }) => Promise<void>;
}

export const ChemicalModal: React.FC<ChemicalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [producto, setProducto] = useState('');
  const [tipo, setTipo] = useState<TipoQuimico>('pesticida');
  const [diasCarencia, setDiasCarencia] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }
    if (diasCarencia < 0) {
      setError('Los días de carencia deben ser iguales o mayores a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        nombre_producto: producto.trim(),
        tipo,
        dias_carencia: Number(diasCarencia),
      });
      setProducto('');
      setDiasCarencia(7);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar la aplicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Registrar Aplicación Fitosanitaria</h3>
            <p className="text-xs text-slate-500">Cálculo inmutable de carencia para certificación de inocuidad</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombre Comercial del Producto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Fungicida Cobre, Mancozeb, Bio-Insumo"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-400 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Insumo *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoQuimico)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-400 text-xs bg-white text-slate-800 cursor-pointer"
              >
                <option value="pesticida">Pesticida / Fitosanitario</option>
                <option value="fertilizante">Fertilizante Químico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Días de Carencia *
              </label>
              <input
                type="number"
                min="0"
                required
                value={diasCarencia}
                onChange={(e) => setDiasCarencia(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-400 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Advertencia / Explicación contenida en tono ámbar */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Período de Carencia Fitosanitaria:</span>
            Días obligatorios entre la aplicación y la cosecha para que la planta degrade residuos químicos bajo el Límite Máximo de Residuos (LMR).
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            {/* Botón secundario outline neutro */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            {/* Botón primario sólido */}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registrando...' : 'Guardar Aplicación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChemicalModal;
