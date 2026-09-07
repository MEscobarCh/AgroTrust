import { Sprout, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-700">AgroTrust</span>
            <span>•</span>
            <span>Inocuidad, Carencia y Trazabilidad QR</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Inocuidad Certificada
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Hackathon 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
