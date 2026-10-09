import React, { useRef, useState, useEffect, useMemo } from 'react';
import { auth } from './lib/firebase';
import { Sparkles, Lock } from 'lucide-react';
import { PetProfile, CalculationResult, BreedInfo, AppTab } from './types';
import { calculatePetNutrition, POPULAR_BREEDS } from './data';
import { CalculatorView } from './views/CalculatorView';
import { RoutineView } from './views/RoutineView';
import { PetSheetView } from './views/PetSheetView';
import { MedicalView } from './views/MedicalView';
import { RemindersView } from './views/RemindersView';
import { RecipesView } from './views/RecipesView';
import { AdvisorView } from './views/AdvisorView';
import { BreedsView } from './views/BreedsView';
import { FoodsView } from './views/FoodsView';
import { GuidesView } from './views/GuidesView';
import { ShareModal } from './components/ShareModal';
import { PetHeaderBar } from './components/PetHeaderBar';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RegistrationLockModal } from './components/RegistrationLockModal';
import { NutriPetLogo } from './components/NutriPetLogo';
import { Sidebar } from './components/Sidebar';
import { BackToTopButton } from './components/BackToTopButton';
import { LogoutTransitionModal } from './components/LogoutTransitionModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LegalModal } from './components/LegalModal';
import { usePets } from './context/PetContext';
import { useBgPreferences } from './hooks/useBgPreferences';

interface BackgroundLayerProps {
  bgTheme: string;
  bgIntensity: string;
  customBgImage: string | null;
  darkMode: boolean;
}

const BackgroundLayer = React.memo(function BackgroundLayer({
  bgTheme,
  bgIntensity,
  customBgImage,
  darkMode
}: BackgroundLayerProps) {
  const overlayAlpha1 = bgIntensity === 'vivid' ? 0.35 : bgIntensity === 'bold' ? 0.55 : 0.75;
  const overlayAlpha2 = bgIntensity === 'vivid' ? 0.45 : bgIntensity === 'bold' ? 0.65 : 0.82;
  const overlayColor = darkMode ? '12, 10, 9' : '255, 255, 255';

  let customStyle: React.CSSProperties = {};
  if (bgTheme === 'custom' && customBgImage) {
    customStyle = {
      backgroundImage: `linear-gradient(rgba(${overlayColor}, ${overlayAlpha1}), rgba(${overlayColor}, ${overlayAlpha2})), url(${customBgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (bgTheme === 'puppies') {
    customStyle = {
      backgroundImage: `linear-gradient(rgba(${overlayColor}, ${overlayAlpha1}), rgba(${overlayColor}, ${overlayAlpha2})), url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (bgTheme === 'nature') {
    const col1 = darkMode ? overlayColor : '240, 253, 244';
    const col2 = darkMode ? overlayColor : '236, 253, 245';
    customStyle = {
      backgroundImage: `linear-gradient(rgba(${col1}, ${overlayAlpha1}), rgba(${col2}, ${overlayAlpha2})), url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  let bgClass = darkMode ? 'bg-paws-pattern-dark' : 'bg-paws-pattern';
  if (bgTheme === 'custom' || bgTheme === 'nature' || bgTheme === 'puppies') {
    bgClass = '';
  } else if (bgTheme === 'warm') {
    bgClass = darkMode ? 'bg-warm-pattern-dark' : 'bg-warm-pattern';
  } else if (bgTheme === 'mint') {
    bgClass = darkMode ? 'bg-mint-pattern-dark' : 'bg-mint-pattern';
  } else if (bgTheme === 'sky') {
    bgClass = darkMode ? 'bg-sky-pattern-dark' : 'bg-sky-pattern';
  } else if (bgTheme === 'ocean') {
    bgClass = darkMode ? 'bg-ocean-pattern-dark' : 'bg-ocean-pattern';
  } else if (bgTheme === 'sunset') {
    bgClass = darkMode ? 'bg-sunset-pattern-dark' : 'bg-sunset-pattern';
  } else if (bgTheme === 'forest') {
    bgClass = darkMode ? 'bg-forest-pattern-dark' : 'bg-forest-pattern';
  } else if (bgTheme === 'lavender') {
    bgClass = darkMode ? 'bg-lavender-pattern-dark' : 'bg-lavender-pattern';
  } else if (bgTheme === 'night') {
    bgClass = 'bg-night-pattern text-stone-100';
  }

  return (
    <div 
      className={`fixed inset-0 pointer-events-none -z-50 transition-colors duration-300 ${bgClass}`}
      style={customStyle}
      aria-hidden="true"
    />
  );
});

export default function App() {
  const { activePet, updatePetLocal, savePet, updateSubscription, isProOrTrial, trialDaysRemaining, user, isSavingPet } = usePets();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nutripet_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    const handleToggle = () => {
      setIsSidebarCollapsed(localStorage.getItem('nutripet_sidebar_collapsed') === 'true');
    };
    window.addEventListener('sidebar_toggle', handleToggle);
    return () => window.removeEventListener('sidebar_toggle', handleToggle);
  }, []);

  useEffect(() => {
    (window as any).testWompi = async () => {
      console.log('🧪 Ejecutando simulación de verificación Wompi...');
      const fakeReference = `NP_TEST_${Date.now()}`;
      const verifiedPlan = 'pro_monthly';
      const planName = 'NutriPet Pro Mensual (Promo 60 Días)';

      const success = await updateSubscription(verifiedPlan, planName, {
        wompiTransactionId: fakeReference,
        transactionReference: fakeReference
      });

      if (success) {
        alert(`¡Pago exitoso con Wompi! Tu suscripción ${planName} se ha activado automáticamente.`);
        console.log(`✅ updateSubscription completado con éxito: ${verifiedPlan}`);
      } else {
        console.warn('⚠️ No se pudo completar la activación en el backend');
      }
    };

    return () => {
      delete (window as any).testWompi;
    };
  }, [updateSubscription]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('nutripet_dark_mode');
    if (saved !== null) return saved === 'true';
    return false;
  });

  useEffect(() => {
    localStorage.setItem('nutripet_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wompiTxId = urlParams.get('id') || urlParams.get('transaction_id');
    if (wompiTxId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const planParam = urlParams.get('plan') || 'pro_monthly';
        const planTier = planParam === 'plan_pro_annual' || planParam === 'pro_annual' ? 'pro_annual' : 'pro_monthly';
        const planName = planTier === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual';

        updateSubscription(planTier as any, planName, { wompiTransactionId: wompiTxId }).then(success => {
          if (success) {
            alert(`¡Pago exitoso con Wompi! Tu suscripción ${planName} se ha activado automáticamente.`);
          } else {
            alert('🔒 activación bloqueada: No se pudo verificar la transacción de Wompi.');
          }
        });
      }
    }

    const paypalToken = urlParams.get('token');
    const payerId = urlParams.get('PayerID');
    if (paypalToken && payerId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const currentUser = auth.currentUser;
      if (currentUser) {
        currentUser.getIdToken().then((idToken: string) => {
          fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              orderId: paypalToken,
              planId: urlParams.get('plan') || 'pro_monthly'
            })
          })
            .then(res => res.json())
            .then(async data => {
              if (data && data.success && data.subscription) {
                const plan = data.subscription.tier || 'pro_monthly';
                const planName = plan === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual';
                alert(`¡Pago con PayPal Exitoso! Tu suscripción ${planName} se ha activado automáticamente.`);
                window.location.reload();
              } else {
                alert(data.error || '🔒 activación bloqueada: No se pudo capturar o verificar la orden de PayPal.');
              }
            })
            .catch(err => {
              console.error('Error al capturar orden de PayPal:', err);
              alert('Error de conexión al confirmar con PayPal.');
            });
        });
      }
    }
  }, [updateSubscription]);

  const [localDraftProfile, setLocalDraftProfile] = useState<PetProfile>({
    id: 'defaultpet',
    name: '',
    type: 'dog',
    breedId: 'goldenlabrador',
    weightKg: 28,
    stage: 'adult',
    ageMonths: 36,
    neutered: true,
    activity: 'moderate',
    condition: 'ideal',
    diet: 'kibble',
    kibbleKcalPer100g: 360,
    photoUrl: undefined,
  });

  const profile: PetProfile = activePet || localDraftProfile;

  const setProfile = (updater: React.SetStateAction<PetProfile> | ((prev: PetProfile) => PetProfile)) => {
    if (activePet) {
      const updated = typeof updater === 'function' ? updater(profile) : updater;
      const lowerId = String(updated?.id || '').toLowerCase();
      if (
        lowerId === 'defaultpet' ||
        lowerId === 'tempemptypet' ||
        lowerId.includes('default') ||
        lowerId.includes('temp')
      ) {
        console.warn('✖ Escritura bloqueada por ID temporal/default en setProfile:', updated?.id);
        return;
      }
      updatePetLocal(updated);
    } else {
      setLocalDraftProfile(updater);
    }
  };

  const [activeTab, setActiveTab] = useState<AppTab>('calculator');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (prevUserRef.current && !user) {
      setIsLoggingOut(true);
      setActiveTab('calculator');
      try {
        localStorage.removeItem('nutripet_local_pets_v2');
        localStorage.removeItem('nutripet_active_pet_v2');
        localStorage.removeItem('nutripet_local_records_v2');
        localStorage.removeItem('nutripet_local_reminders_v2');
        localStorage.removeItem('nutripet_local_weights_v2');
        localStorage.removeItem('nutripet_local_baths_v2');
      } catch (e) {
        console.warn('Error limpiando caché local al cerrar sesión:', e);
      }

      const timer = setTimeout(() => {
        setIsLoggingOut(false);
        window.location.reload();
      }, 2500);

      return () => clearTimeout(timer);
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeTab]);
  
  const { bgTheme, setBgTheme, customBgImage, setCustomBgImage, bgIntensity, setBgIntensity } = useBgPreferences(user);
  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  useEffect(() => {
    const handleOpenLegal = (e: any) => {
      setLegalModalTab(e.detail || 'terms');
    };
    window.addEventListener('open_legal_modal', handleOpenLegal);
    return () => window.removeEventListener('open_legal_modal', handleOpenLegal);
  }, []);

  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const result: CalculationResult = useMemo(() => {
    return calculatePetNutrition(profile);
  }, [profile]);

  const selectedBreedInfo: BreedInfo | undefined = useMemo(() => {
    return POPULAR_BREEDS.find(b => b.id === profile.breedId);
  }, [profile.breedId]);

  const availableBreeds = useMemo(() => {
    return POPULAR_BREEDS.filter(b => b.type === profile.type);
  }, [profile.type]);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert('Por favor selecciona una imagen de menos de 12MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setCustomBgImage(optimizedBase64);
            setBgTheme('custom');
          } else {
            setCustomBgImage(rawBase64);
            setBgTheme('custom');
          }
        };
        img.onerror = () => {
          setCustomBgImage(rawBase64);
          setBgTheme('custom');
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark text-stone-100' : 'text-stone-800'}`}
    >
      <BackgroundLayer 
        bgTheme={bgTheme}
        bgIntensity={bgIntensity}
        customBgImage={customBgImage}
        darkMode={darkMode}
      />
      
      {/* Cabecera Superior Fija */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full no-print shadow-xs bg-white dark:bg-stone-900">
        <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 text-center font-medium">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> Referencias generales de alimentación y bienestar para mascotas
          </span>
          <span className="mx-2 text-stone-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-stone-300">
            Ficha con foto de tu mascota, porciones sugeridas y consejos prácticos
          </span>
        </div>
        <PetHeaderBar 
          onOpenSubscriptionModal={() => {
            const isAdmin = user?.email?.toLowerCase().trim() === 'dgcontrerasb@gmail.com';
            if (isAdmin) {
              setShowAdminModal(true);
            } else {
              setShowSubscriptionModal(true);
            }
          }} 
          onOpenAdminModal={() => setShowAdminModal(true)} 
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </header>

      {/* Contenedor Principal */}
      <div className="flex-grow flex flex-col lg:flex-row w-full items-start pt-[84px] sm:pt-[90px]">
        
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isProOrTrial={isProOrTrial}
          trialDaysRemaining={trialDaysRemaining}
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
          onOpenBgModal={() => setShowBgModal(true)}
          onOpenAdminModal={user?.email?.toLowerCase().trim() === 'dgcontrerasb@gmail.com' ? () => setShowAdminModal(true) : undefined}
          onOpenFeedbackModal={() => setShowFeedbackModal(true)}
          petName={profile.name}
          petType={profile.type}
          petPhotoUrl={profile.photoUrl}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
        
        {/* Modal Selector de Fondo e Imagen */}
        {showBgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto transition-colors">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 sticky top-0 bg-white dark:bg-stone-900 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <span className="text-base">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">
                      Personalizar Fondo
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Diseños marcados o tu propia foto</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBgModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Subir Imagen Propia */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Tu Propia Imagen de Fondo
                </label>
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <span className="text-base">🖼️</span>
                  <span className="text-center">Subir foto desde tu dispositivo (PC o Móvil)</span>
                </button>
                {customBgImage && (
                  <div className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[200px]">✓ Imagen personalizada guardada</span>
                    <button
                      onClick={() => {
                        setCustomBgImage(null);
                        setBgTheme('paws');
                      }}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Temas Listos */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Temas y Texturas Listas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setBgTheme('paws')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'paws'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-100/70 dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🐾</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Huellas Marcadas</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Patitas visibles</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('warm')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'warm'
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#f7eedb] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">☕</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Ámbar Cálido</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Arena tostada</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('mint')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'mint'
                        ? 'border-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#dcfce7] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌿</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Verde Menta Vivo</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Fresco y botánico</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('sky')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'sky'
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-950 dark:text-sky-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#e0f2fe] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌤️</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Cielo Claro</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Azul aire libre</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('puppies')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'puppies'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🐕❤️</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Foto Perrito</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Mascota real</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('nature')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'nature'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-emerald-50/40 dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌳🐕</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Parque y Césped</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Paisaje al aire libre</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('ocean')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'ocean'
                        ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-950 dark:text-cyan-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#ecfeff] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌊</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Océano Profundo</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Cyan azul marino</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('sunset')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'sunset'
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/50 text-orange-950 dark:text-orange-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#fff7ed] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌅</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Atardecer</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Naranja cálido</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('forest')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'forest'
                        ? 'border-green-700 bg-green-50 dark:bg-green-950/50 text-green-950 dark:text-green-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#f0fdf4] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌲</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Bosque Oscuro</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Verde pino natural</div>
                  </button>

                  <button
                    onClick={() => setBgTheme('lavender')}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      bgTheme === 'lavender'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300 bg-[#faf5ff] dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-0.5">🌸</div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Lavanda Suave</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Púrpura floral</div>
                  </button>
                </div>
              </div>

              {/* Intensidad */}
              <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex flex-wrap justify-between gap-1">
                  <span>Notoriedad del Fondo</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold lowercase">
                    {bgIntensity === 'vivid' ? 'Muy marcado / Alto impacto' : bgIntensity === 'bold' ? 'Marcado nítido' : 'Equilibrado'}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setBgIntensity('vivid')}
                    className={`py-2 px-1 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer text-center ${
                      bgIntensity === 'vivid'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🔥 Muy Notorio
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgIntensity('bold')}
                    className={`py-2 px-1 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer text-center ${
                      bgIntensity === 'bold'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    ✨ Marcado
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgIntensity('medium')}
                    className={`py-2 px-1 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer text-center ${
                      bgIntensity === 'medium'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🌿 Suave
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowBgModal(false)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors active:scale-98"
              >
                Listo
              </button>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <main className="flex-grow flex-1 w-full min-w-0 px-4 sm:px-6 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-32 lg:pb-12 space-y-8 overflow-x-hidden">
          
          {/* VISTA 1: CALCULADORA NUTRICIONAL Y FICHA CON FOTO */}
          {activeTab === 'calculator' && (
            <CalculatorView
              profile={profile}
              setProfile={setProfile}
              activePet={activePet}
              result={result}
              selectedBreedInfo={selectedBreedInfo}
              availableBreeds={availableBreeds}
              setActiveTab={setActiveTab}
              setShowShareModal={setShowShareModal}
              isSavingPet={isSavingPet}
              savePet={savePet}
              user={user}
            />
          )}

          {/* VISTA ORGANIZADOR DE RUTINA */}
          {activeTab === 'routine' && (
            <RoutineView
              profile={profile}
              result={result}
            />
          )}

          {/* VISTA 2: FICHA TÉCNICA */}
          {activeTab === 'sheet' && (
            <PetSheetView onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          )}

          {/* VISTA 3: EXPEDIENTE MÉDICO */}
          {activeTab === 'medical' && (
            <MedicalView onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          )}

          {/* VISTA 4: RECORDATORIOS */}
          {activeTab === 'reminders' && (
            <RemindersView onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          )}

          {/* VISTA RECETAS */}
          {activeTab === 'recipes' && (
            <RecipesView onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          )}

          {/* VISTA 5: MARCAS POR PAÍS */}
          {activeTab === 'advisor' && (
            <AdvisorView onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          )}

          {/* VISTA 6: GUÍA DE RAZAS */}
          {activeTab === 'breeds' && (
            <BreedsView
              onSelectBreedForCalculation={(type, breedId) => {
                setProfile(prev => ({
                  ...prev,
                  type,
                  breedId,
                  name: prev.name || 'Mi Mascota',
                }));
                setActiveTab('calculator');
              }}
            />
          )}

          {/* VISTA: SEMÁFORO DE ALIMENTOS */}
          {activeTab === 'foods' && (
            <FoodsView />
          )}

          {/* VISTA: TIPS Y PRIMEROS AUXILIOS */}
          {activeTab === 'guides' && (
            <GuidesView />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 py-8 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NutriPetLogo size="sm" />
              <span>•</span>
              <span>Herramienta informativa y de orientación para el cuidado de mascotas en el hogar</span>
            </div>

            {user?.email?.toLowerCase() === 'dgcontrerasb@gmail.com' && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="text-stone-300 hover:text-stone-500 transition-colors p-1 rounded-sm cursor-pointer"
                  title="Acceso Propietario"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            <strong>Aviso de exención de responsabilidad:</strong> Esta aplicación web es un recurso de consulta general y cálculo orientativo creado para amantes de las mascotas. La información, tablas y estimaciones aquí presentadas son solo de referencia general y <u>no constituyen asesoría médica, diagnóstico ni prescripción</u>. Cada perro o gato tiene necesidades individuales, condiciones preexistentes o alergias que requieren la valoración de un profesional de la salud animal. Ante cualquier duda, cambio de dieta o síntoma, consulta siempre a tu médico veterinario de confianza.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setLegalModalTab('terms')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 cursor-pointer"
            >
              Términos de Servicio
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLegalModalTab('privacy')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 cursor-pointer"
            >
              Política de Privacidad
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLegalModalTab('contact')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 cursor-pointer font-medium"
            >
              Contacto & Soporte
            </button>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
        result={result}
        breedName={selectedBreedInfo?.name}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
      <LegalModal
        isOpen={legalModalTab !== null}
        onClose={() => setLegalModalTab(null)}
        initialTab={legalModalTab || 'terms'}
      />
      <RegistrationLockModal />
      <LogoutTransitionModal isOpen={isLoggingOut} />
      <BackToTopButton />
    </div>
  );
}
