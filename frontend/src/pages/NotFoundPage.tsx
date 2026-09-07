import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 max-w-sm w-full shadow-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <Sprout className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Página No Encontrada</h1>
        <p className="text-xs text-slate-500">
          La ruta solicitada no existe o el código ingresado no es válido.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors w-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
