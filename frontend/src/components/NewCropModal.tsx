import React, { useState } from 'react';
import { X, Sprout, AlertCircle } from 'lucide-react';
import type { CreateCultivoPayload } from '../types/api';

interface NewCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCultivoPayload) => Promise<void>;
}

export const NewCropModal: React.FC<NewCropModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [nombre, setNombre] = useState('');
  const [variedad, setVariedad] = useState('');
  const [fechaSiembra, setFechaSiembra] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del cultivo es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        nombre: nombre.trim(),
        variedad: variedad.trim() || undefined,
        fecha_siembra: fechaSiembra,
      });
      setNombre('');
      setVariedad('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar el cultivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Cultivo</h3>
            <p className="text-xs text-slate-500">Inicia el seguimiento agronómico y de trazabilidad</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombre del Cultivo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Tomate, Café, Fresa, Maíz"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Variedad / Genotipo
            </label>
            <input
              type="text"
              placeholder="Ej. Cherry, Hass, Caturra, Chonto"
              value={variedad}
              onChange={(e) => setVariedad(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fecha de Siembra *
            </label>
            <input
              type="date"
              required
              value={fechaSiembra}
              onChange={(e) => setFechaSiembra(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Comenzar Cultivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCropModal;
