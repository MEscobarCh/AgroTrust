import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CropProvider } from './context/CropContext';
import { MainLayout } from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import TraceabilityPage from './pages/TraceabilityPage';
import LotQrPage from './pages/LotQrPage';
import NotFoundPage from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CropProvider>
        <Routes>
          {/* Rutas con Layout Principal (Navbar, Banner, Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/lotes/:codigoLote" element={<LotQrPage />} />
          </Route>

          {/* Ruta pública para escaneo QR de consumidores (diseño enfocado en móvil/comprador) */}
          <Route path="/trazabilidad/:codigoLote" element={<TraceabilityPage />} />

          {/* Ruta fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CropProvider>
    </BrowserRouter>
  );
};

export default App;
