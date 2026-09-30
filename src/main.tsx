import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
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
            <Route path="/" element={<App />} />
            {/* Ruta única para código QR público sin expone uid ni petId */}
            <Route path="/qr/:publicToken" element={<PublicPetProfile />} />
            <Route path="/pet/:publicToken" element={<PublicPetProfile />} />
            {/* Redirección/Retrocompatibilidad con URLs antiguas /public/:petId */}
            <Route path="/public/:publicToken" element={<PublicPetProfile />} />
          </Routes>
        </BrowserRouter>
      </PetProvider>
    </AuthProvider>
  </StrictMode>,
);
