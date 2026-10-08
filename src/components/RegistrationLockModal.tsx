import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, X } from 'lucide-react';
import { usePets } from '../context/PetContext';
import { NutriPetLogo } from './NutriPetLogo';

interface RegistrationLockModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const RegistrationLockModal: React.FC<RegistrationLockModalProps> = ({ forceOpen = false, onClose }) => {
  const { user, loginWithGoogle } = usePets();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showModalInternal, setShowModalInternal] = useState<boolean>(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithGoogle();
      setShowModalInternal(false);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      setLoginError(
        err.code === 'auth/popup-closed-by-user'
          ? 'Ventana de inicio de sesión cerrada. Intenta de nuevo cuando lo desees.'
          : 'No se pudo completar el inicio de sesión. Revisa tu conexión a internet.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleClose = () => {
    setShowModalInternal(false);
    if (onClose) onClose();
  };

  const isModalVisible = forceOpen || showModalInternal;

  useEffect(() => {
    if (isModalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalVisible]);

  // Si el usuario ya está conectado, no mostrar nada
  if (user) {
    return null;
  }

  return (
    <>
      {/* Modal Amigable de Registro con Google */}
      {isModalVisible && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-sm no-print animate-fade-in"
          onClick={handleClose}
        >
          <div 
            className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

            {/* Botón para cerrar la ventana */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 font-bold text-sm cursor-pointer transition-colors z-10"
              title="Cerrar y continuar explorando"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6 text-center pt-2">
              
              {/* Logo Oficial de NutriPet */}
              <div className="flex justify-center pb-1">
                <NutriPetLogo size="lg" />
              </div>

              {/* Títulos */}
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Prueba Gratuita NutriPet Pro
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-900 dark:text-stone-100 leading-tight">
                  Guarda la Ficha de tu Mascota y obtén <span className="text-emerald-700 dark:text-emerald-400">15 Días Pro Gratis</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                  Conecta tu cuenta de Google en 1 clic para que los expedientes de tu mascota queden guardados de forma segura en la nube.
                </p>
              </div>

              {/* Beneficios de Registrarse */}
              <div className="text-left bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-snug">
                    <strong>15 Días Pro Gratis:</strong> Disfruta de Ficha Técnica PDF con QR, recetas caseras/BARF y carnet de vacunas completo.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-snug">
                    <strong>Respaldo Multi-Dispositivo:</strong> Accede a la información de tu mascota desde cualquier teléfono o computador.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-snug">
                    <strong>Sin tarjeta de crédito:</strong> Registro 100% libre sin cargos ocultos ni cobros automáticos.
                  </p>
                </div>
              </div>

              {/* Alerta de Error si falla Google */}
              {loginError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Botón Principal de Inicio con Google */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-heading font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Conectando con Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Logo SVG Oficial de Google */}
                      <svg className="w-5 h-5 bg-white p-0.5 rounded-full shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continuar con Google (Activar 15 Días Pro)</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Cláusula legal de consentimiento expreso */}
                <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center leading-relaxed px-2 pt-1">
                  Al continuar, confirmas que aceptas nuestros{' '}
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open_legal_modal', { detail: 'terms' }));
                    }}
                    className="underline text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    Términos de Servicio
                  </button>{' '}
                  y nuestra{' '}
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open_legal_modal', { detail: 'privacy' }));
                    }}
                    className="underline text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    Política de Privacidad
                  </button>.
                </p>

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold hover:underline cursor-pointer pt-2"
                >
                  Continuar explorando sin cuenta por ahora
                </button>
              </div>

              {/* Pie de confianza */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-4 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Sin Tarjeta de Crédito
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 15 Días de Prueba Pro
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};