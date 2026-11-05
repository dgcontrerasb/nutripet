import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { PetProvider } from './context/PetContext.tsx';
import './index.css';

const App = lazy(() => import('./App.tsx'));
const PublicPetProfile = lazy(() =>
  import('./components/PublicPetProfile').then((m) => ({ default: m.PublicPetProfile }))
);
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));

const RouteFallback = () => (
  <div className="min-h-screen bg-stone-100 dark:bg-[#0f1712] flex items-center justify-center p-4">
    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Rutas para código QR público y carnet de emergencia (carga ultrarrápida aislada) */}
          <Route path="/qr/:publicToken" element={<PublicPetProfile />} />
          <Route path="/pet/:publicToken" element={<PublicPetProfile />} />
          <Route path="/public/:publicToken" element={<PublicPetProfile />} />

          {/* Rutas dedicadas de autenticación y bienvenida oficial */}
          <Route
            path="/sign-in"
            element={
              <AuthProvider>
                <LoginPage />
              </AuthProvider>
            }
          />
          <Route
            path="/sing-in"
            element={
              <AuthProvider>
                <LoginPage />
              </AuthProvider>
            }
          />
          <Route
            path="/login"
            element={
              <AuthProvider>
                <LoginPage />
              </AuthProvider>
            }
          />

          {/* Todas las demás rutas de la app interna cargan App con sus proveedores */}
          <Route
            path="/*"
            element={
              <AuthProvider>
                <PetProvider>
                  <App />
                </PetProvider>
              </AuthProvider>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
