import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NewCropModal } from '../components/NewCropModal';
import { useCrop } from '../context/CropContext';
import { AlertCircle } from 'lucide-react';
import type { CreateCultivoPayload } from '../types/api';

export const MainLayout: React.FC = () => {
  const { crops, activeCropId, selectCrop, createCrop, backendError } = useCrop();
  const [isNewCropModalOpen, setIsNewCropModalOpen] = useState(false);

  const handleCreateCrop = async (payload: CreateCultivoPayload) => {
    await createCrop(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        crops={crops}
        activeCropId={activeCropId}
        onSelectCrop={selectCrop}
        onOpenNewCropModal={() => setIsNewCropModalOpen(true)}
      />

      {backendError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold">Aviso de conexión:</strong> {backendError}. Las consultas locales utilizan el proxy hacia el puerto 5000.
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <Footer />

      <NewCropModal
        isOpen={isNewCropModalOpen}
        onClose={() => setIsNewCropModalOpen(false)}
        onSubmit={handleCreateCrop}
      />
    </div>
  );
};

export default MainLayout;
