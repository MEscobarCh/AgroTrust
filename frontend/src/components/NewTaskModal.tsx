import React, { useState } from 'react';
import { X, Calendar, Plus, Sparkles, Tag, Layers } from 'lucide-react';
import type { CreateTareaPayload } from '../types/api';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTareaPayload) => Promise<void>;
  currentStage?: string;
}

const PRESET_TASKS = [
  { label: '🧪 Refuerzo Calcio-Boro', desc: 'Refuerzo foliar de Calcio y Boro', cat: 'foliar' },
  { label: '💧 Fertirriego NPK 10-20-20', desc: 'Fertirriego con fórmula balanceada NPK', cat: 'fertirriego' },
  { label: '🌿 Bioestimulante Aminoácidos', desc: 'Aplicación de bioestimulante a base de aminoácidos', cat: 'bioestimulante' },
  { label: '🌾 Ácidos Húmicos al Suelo', desc: 'Enmienda de suelo con ácidos húmicos y fúlvicos', cat: 'enmienda' },
  { label: '🎯 Abono Potásico de Engorde', desc: 'Abono soluble alto en Potasio (K) para llenado de fruto', cat: 'fertirriego' },
  { label: '💧 Riego con Enraizante', desc: 'Riego localizado con promotor de raíz', cat: 'riego' },
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStage = 'germinacion',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(todayStr);
  const [etapa, setEtapa] = useState(currentStage);
  const [categoria, setCategoria] = useState<string>('foliar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_TASKS[0]) => {
    setDescripcion(preset.desc);
    setCategoria(preset.cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError('Por favor describe la labor nutricional.');
      return;
    }
    if (!fecha) {
      setError('Por favor selecciona una fecha programada.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        descripcion: descripcion.trim(),
        fecha,
        etapa,
        categoria,
      });
      setDescripcion('');
      setFecha(todayStr);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar la labor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-2xs">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Programar Labor Nutricional</h2>
            <p className="text-xs text-slate-500">Agrega una tarea o fertilización al cronograma</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Sugerencias rápidas en estilo outline neutro */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Sugerencias Agronómicas Rápidas
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TASKS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 border border-slate-200 transition-all text-slate-700 text-left font-medium cursor-pointer shadow-2xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción de la labor agronómica *
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Aplicación foliar de Calcio y Boro al 0.3%"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="foliar">🧪 Aplicación Foliar</option>
                <option value="fertirriego">💧 Fertirriego / Abono</option>
                <option value="riego">🌿 Riego Específico</option>
                <option value="enmienda">🌾 Enmienda / Suelo</option>
                <option value="bioestimulante">✨ Bioestimulante</option>
                <option value="otro">📌 Otro manejo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Etapa asociada
              </label>
              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="germinacion">Germinación</option>
                <option value="floracion">Floración</option>
                <option value="fructificacion">Fructificación</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha programada de aplicación *
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            {/* Botón secundario en estilo outline neutro */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            {/* Botón primario de acción nutricional en índigo sobrio */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Programando...' : 'Programar en Cronograma'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
