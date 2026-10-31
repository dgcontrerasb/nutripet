import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { PetProvider } from './context/PetContext.tsx';
import { PublicPetProfile } from './components/PublicPetProfile';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PetProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas para código QR público y carnet de emergencia */}
            <Route path="/qr/:publicToken" element={<PublicPetProfile />} />
            <Route path="/pet/:publicToken" element={<PublicPetProfile />} />
            <Route path="/public/:publicToken" element={<PublicPetProfile />} />

            {/* Todas las demás rutas de la app interna cargan App */}
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </PetProvider>
    </AuthProvider>
  </StrictMode>,
);