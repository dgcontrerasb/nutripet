import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detectar si la app ya está corriendo como PWA instalada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Verificar descarte en localStorage (14 días)
    const dismissedUntil = localStorage.getItem('pwa_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setIsDismissed(true);
      return;
    }

    // 3. Detectar dispositivos iOS/Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // 4. Escuchar evento beforeinstallprompt (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    // Guardar marca de tiempo para ocultarlo durante 14 días
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_dismissed_until', String(Date.now() + fourteenDaysMs));
    setIsDismissed(true);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.warn('Error al activar el prompt de instalación PWA:', err);
    }
  };

  // Si ya está instalada, fue descartada, o no aplica (ni deferredPrompt ni iOS)
  if (isInstalled || isDismissed) {
    return null;
  }

  // Mostrar el banner si tenemos deferredPrompt O si es un dispositivo iOS en Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Banner Flotante Discreto con soporte Dark Mode */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-40 animate-fade-in">
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xl flex items-center justify-between gap-3 text-stone-800 dark:text-stone-100 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate font-heading">
                Instala NutriPet en tu dispositivo
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight truncate">
                Acceso rápido y pantalla completa desde Chrome
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Ocultar aviso por 14 días"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Instructivo para usuarios de iOS / Safari */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-800 dark:text-stone-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  📱
                </div>
                <h3 className="font-extrabold text-base font-heading">Instalar en iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Sigue estos sencillos pasos desde Safari para añadir NutriPet a tu pantalla de inicio:
            </p>

            <ol className="space-y-3 text-xs text-stone-700 dark:text-stone-200">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">1.</span>
                <span>Toca el botón <strong className="text-stone-900 dark:text-white">Compartir (⎋ / <Share2 className="w-3.5 h-3.5 inline text-blue-500" />)</strong> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">2.</span>
                <span>Desplázate hacia abajo y elige <strong className="text-stone-900 dark:text-white">'Agregar al inicio'</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">3.</span>
                <span>Confirma con <strong className="text-stone-900 dark:text-white">'Agregar'</strong> para disfrutar la app a pantalla completa.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
