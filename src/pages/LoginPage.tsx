import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Heart, 
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NutriPetLogo } from '../components/NutriPetLogo';
import { LoginDogTransitionModal } from '../components/LoginDogTransitionModal';

export const LoginPage: React.FC = () => {
  const { user, loading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [showDogTransition, setShowDogTransition] = useState(false);

  // Modo oscuro sincronizado con la aplicación
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nutripet_dark_mode');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nutripet_dark_mode', String(darkMode));
  }, [darkMode]);

  // Si el usuario ya está autenticado y no hay animación en curso, redirigir al inicio
  useEffect(() => {
    if (!loading && user && !showDogTransition && !isLoggingIn) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate, showDogTransition, isLoggingIn]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      await loginWithGoogle();
      setIsLoginSuccess(true);
      // Activa la hermosa animación del perrito de Ricardo Oliva Alonso sobre fondo blanco
      setShowDogTransition(true);
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError('No se pudo completar el inicio de sesión. Por favor, verifica tu conexión e intenta de nuevo.');
      }
      setIsLoggingIn(false);
      setShowDogTransition(false);
    }
  };

  const handleTransitionComplete = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="h-screen max-h-screen bg-[#faf8f5] dark:bg-[#0c140f] text-stone-900 dark:text-stone-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 overflow-y-auto lg:overflow-hidden">
      
      {/* ========================================================================= */}
      {/* COLUMNA IZQUIERDA (50% en PC): HERO EDITORIAL CON LA FOTO PROTAGONISTA     */}
      {/* ========================================================================= */}
      <section className="relative w-full lg:w-1/2 min-h-[44vh] sm:min-h-[48vh] lg:h-full lg:min-h-0 overflow-hidden bg-gradient-to-b from-[#143826] via-[#0f2a1d] to-[#0a160f] flex items-center justify-center p-3 sm:p-5 lg:p-7 shrink-0">
        
        {/* Capa de aura ambiental desenfocada: expande los tonos dorados y celestes de la foto a todo el fondo */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/auth-hero-pet.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center filter blur-3xl scale-125 opacity-65 dark:opacity-45 brightness-95"
          />
          {/* Velo degradado que funde suavemente */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e2418]/90 via-[#0e2418]/30 to-black/30 lg:to-transparent" />
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#faf8f5]/20 dark:to-[#0c140f]/70" />
        </div>

        {/* Botón rápido para móvil: 'Explorar' sin registrarse */}
        <div className="lg:hidden absolute top-4 right-4 z-30">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white text-xs font-bold hover:bg-black/80 transition-all cursor-pointer active:scale-95 shadow-md"
            aria-label="Explorar sin iniciar sesión"
          >
            <span>Explorar</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tarjeta Visual Enmarcada: Los perritos son los protagonistas absolutos (Cero módulos/cápsulas) */}
        <div className="relative z-10 w-full max-w-[390px] sm:max-w-[420px] lg:max-w-[440px] h-[38vh] sm:h-[42vh] lg:h-[90vh] max-h-[760px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border border-white/20 ring-1 ring-black/10 flex flex-col justify-end p-4 sm:p-6 group">
          
          {/* Fotografía principal nítida con ajuste perfecto */}
          <img
            src="/auth-hero-pet.jpg"
            alt="Mascotas felices y saludables en NutriPet"
            className="absolute inset-0 w-full h-full object-cover object-center select-none transition-transform duration-700 ease-out group-hover:scale-103"
          />

          {/* Sombreado inferior suave para legibilidad directa sin cajas */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          {/* Texto Editorial Oficial Centrado y Directo (Sin módulos, cajas ni cápsulas) */}
          <div className="relative z-10 text-center px-2 pb-2 sm:pb-4 space-y-1 select-none">
            <h2 className="font-editorial text-[14.5px] sm:text-base text-white font-normal leading-snug tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="block">La nutrición y salud de tu mascota,</span>
              <span className="block italic text-amber-200">en un solo lugar.</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-200/95 font-light leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] max-w-[280px] sm:max-w-[320px] mx-auto">
              Raciones exactas, historial clínico y carnet digital de emergencia QR.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COLUMNA DERECHA (50% en PC): FORMULARIO MODERNO, CENTRADO Y SIN SCROLL    */}
      {/* ========================================================================= */}
      <main className="relative z-10 -mt-6 sm:-mt-8 lg:mt-0 flex-1 flex flex-col justify-between bg-[#faf8f5] dark:bg-[#0c140f] rounded-t-[32px] sm:rounded-t-[36px] lg:rounded-none shadow-2xl lg:shadow-none p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[56vh] lg:h-full lg:overflow-hidden">
        
        {/* Barra superior de escritorio: Volver + Modo Oscuro */}
        <div className="hidden lg:flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200/70 hover:bg-stone-300/80 dark:bg-stone-800 dark:hover:bg-stone-750 text-xs font-bold text-stone-600 dark:text-stone-300 transition-all cursor-pointer group active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Volver a la Calculadora</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
            </button>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">
              Acceso Seguro
            </span>
          </div>
        </div>

        {/* Indicador táctil en móvil */}
        <div className="lg:hidden w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-2" />

        {/* Contenedor central con distribución simétrica y moderna */}
        <div className="w-full max-w-[390px] mx-auto my-auto flex flex-col items-center text-center space-y-4">
          
          {/* Logotipo centrado de NutriPet */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="transform hover:scale-105 transition-transform">
              <NutriPetLogo size="md" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-black text-stone-900 dark:text-white tracking-tight leading-tight">
                Iniciar Sesión
              </h1>
              <p className="text-xs sm:text-[13px] text-stone-500 dark:text-stone-400 font-medium max-w-[320px] mx-auto leading-relaxed">
                Conéctate para respaldar tus mascotas y consultar sus fichas desde cualquier lugar.
              </p>
            </div>
          </div>

          {/* Notificación de error en autenticación (si ocurre) */}
          {authError && (
            <div 
              role="alert"
              className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-center gap-2 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="text-[11px] leading-snug">{authError}</span>
            </div>
          )}

          {/* Botón Principal: Inicio de Sesión con Google */}
          <div className="w-full space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || isLoginSuccess}
              className={`w-full h-12 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.99] disabled:cursor-wait cursor-pointer ${
                isLoginSuccess
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.01]'
                  : 'bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 border-stone-200 dark:border-stone-750 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md'
              }`}
            >
              {isLoginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                  <span>¡Bienvenido! Entrando a NutriPet...</span>
                </>
              ) : isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span>Conectando con Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </button>

            {/* Separador minimalista */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200/80 dark:border-stone-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-extrabold">
                <span className="bg-[#faf8f5] dark:bg-[#0c140f] px-2.5 text-stone-400">
                  o también
                </span>
              </div>
            </div>

            {/* Botón Secundario: Modo Invitado */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-stone-200/70 dark:border-stone-750 active:scale-[0.99] group shadow-2xs"
            >
              <span>Continuar como Invitado (Modo Exploración)</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Micro Beneficios Centrados (Sin módulos ni cajas) */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-center select-none pt-0.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Respaldo en la nube</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Carnet digital QR</span>
            </div>
          </div>

          {/* Redes Sociales Oficiales: Directo, sin cajas ni módulos */}
          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 w-full select-none flex items-center justify-between gap-2 px-1">
            <div className="text-left min-w-0">
              <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block truncate">
                Visita nuestras redes sociales
              </span>
              <span className="text-[9.5px] text-stone-400 dark:text-stone-500 block truncate">
                Tips clínicos, recetas y novedades
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://www.facebook.com/NutriPet.v2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 p-1.5 border border-stone-200/80 dark:border-stone-700 hover:scale-110 active:scale-95 transition-all shadow-xs flex items-center justify-center hover:border-blue-500 hover:shadow-blue-500/20"
                title="Síguenos en Facebook (@NutriPet.v2)"
              >
                <img
                  src="/facebook-logo.png"
                  alt="Facebook NutriPet"
                  className="w-full h-full object-contain"
                />
              </a>
              <a
                href="https://www.tiktok.com/@nutripetv2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 p-1.5 border border-stone-200/80 dark:border-stone-700 hover:scale-110 active:scale-95 transition-all shadow-xs flex items-center justify-center hover:border-stone-900 dark:hover:border-stone-400"
                title="Síguenos en TikTok (@nutripetv2)"
              >
                <img
                  src="/tiktok-logo.png"
                  alt="TikTok NutriPet"
                  className="w-full h-full object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Pie de página con aviso de privacidad discreto */}
        <footer className="text-center pt-2 text-[10px] sm:text-[10.5px] text-stone-400 dark:text-stone-500 border-t border-stone-200/50 dark:border-stone-800/50 shrink-0">
          <p>
            Al ingresar aceptas el uso médico-orientativo de NutriPet. Tus datos y fotos están protegidos y cifrados en la nube.
          </p>
        </footer>
      </main>

      {/* Transición de Bienvenida con el Perro de Ricardo Oliva Alonso sobre Fondo Blanco */}
      <LoginDogTransitionModal
        isOpen={showDogTransition}
        onComplete={handleTransitionComplete}
        userName={user?.displayName}
      />

    </div>
  );
};

export default LoginPage;
