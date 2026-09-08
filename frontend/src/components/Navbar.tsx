import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, QrCode, PlusCircle } from 'lucide-react';
import type { Cultivo } from '../types/api';

interface NavbarProps {
  crops: Cultivo[];
  activeCropId: number;
  onSelectCrop: (id: number) => void;
  onOpenNewCropModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  crops,
  activeCropId,
  onSelectCrop,
  onOpenNewCropModal,
}) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Marca (Verde Esmeralda reservado para identidad) */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Agro<span className="text-emerald-600">Trust</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Inocuidad & QR
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Trazabilidad Agrícola Certificada</p>
          </div>
        </Link>

        {/* Acciones y Selector de Cultivo */}
        <div className="flex items-center gap-2.5">
          {isDashboard && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={activeCropId}
                  onChange={(e) => onSelectCrop(Number(e.target.value))}
                  className="appearance-none bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer shadow-2xs"
                  title="Seleccionar cultivo activo"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      Cultivo #{c.id}: {c.nombre} {c.variedad ? `(${c.variedad})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Botón secundario en estilo outline neutro */}
              <button
                onClick={onOpenNewCropModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                title="Registrar nuevo cultivo"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Nuevo Cultivo</span>
              </button>
            </div>
          )}

          {/* Botón secundario outline neutro para la vista de consumidor */}
          <Link
            to="/trazabilidad/LOTE-DEMO"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
            title="Ver simulación de escaneo QR de comprador"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Vista Consumidor</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
