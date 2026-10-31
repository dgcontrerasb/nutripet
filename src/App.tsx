import React, { useEffect, useRef, useState, useMemo } from 'react';
import { auth } from './lib/firebase';
import {
  Calculator,
  Scale,
  Sparkles,
  Camera,
  Trash2,
  Palette,
  Image as ImageIcon,
  X,
  MessageCircle,
  FileText,
  Lock,
  Loader2,
  Save,
  CheckCircle2,
  Award,
  ChevronRight
} from 'lucide-react';
import { PetProfile, CalculationResult, BreedInfo, AppTab } from './types';
import { calculatePetNutrition, POPULAR_BREEDS } from './data';
import { UnifiedFoodCalculator } from './components/UnifiedFoodCalculator';
import { ShareModal } from './components/ShareModal';
import { RoutineSchedule } from './components/RoutineSchedule';
import { FoodTransitionGuide } from './components/FoodTransitionGuide';
import { PetHeaderBar } from './components/PetHeaderBar';
import { PetTechSheet } from './components/PetTechSheet';
import { MedicalHistory } from './components/MedicalHistory';
import { RemindersModule } from './components/RemindersModule';
import { CountryFoodAdvisor } from './components/CountryFoodAdvisor';
import { BreedEncyclopedia } from './components/BreedEncyclopedia';
import { TipsAndGuidesModule } from './components/TipsAndGuidesModule';
import { FoodTrafficLight } from './components/FoodTrafficLight';
import { PetPhotoReelWidget } from './components/PetPhotoReelWidget';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ProFeatureLock } from './components/ProFeatureLock';
import { AnimatedCounter } from './components/AnimatedCounter';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RegistrationLockModal } from './components/RegistrationLockModal';
import { PetProfileHUD } from './components/PetProfileHUD';
import { NutriPetLogo } from './components/NutriPetLogo';
import { BarfRecipeGenerator } from './components/BarfRecipeGenerator';
import { Sidebar } from './components/Sidebar';
import { BackToTopButton } from './components/BackToTopButton';
import { LogoutTransitionModal } from './components/LogoutTransitionModal';
import { FeedbackModal } from './components/FeedbackModal';
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

// Mapeo Bidireccional Oficial de Rutas para Enrutamiento Limpio
const TAB_TO_PATH: Record<AppTab, string> = {
  calculator: '/porciones',
  routine: '/horarios',
  foods: '/semaforo',
  recipes: '/recetas',
  sheet: '/ficha',
  medical: '/expediente',
  reminders: '/vacunas',
  advisor: '/marcas',
  breeds: '/razas',
  guides: '/guias',
};

const PATH_TO_TAB: Record<string, AppTab> = {
  '/': 'calculator',
  '/porciones': 'calculator',
  '/calculadora': 'calculator',
  '/horarios': 'routine',
  '/rutina': 'routine',
  '/semaforo': 'foods',
  '/recetas': 'recipes',
  '/barf': 'recipes',
  '/ficha': 'sheet',
  '/carnet': 'sheet',
  '/expediente': 'medical',
  '/peso': 'medical',
  '/vacunas': 'reminders',
  '/alertas': 'reminders',
  '/marcas': 'advisor',
  '/razas': 'breeds',
  '/guias': 'guides',
  '/tips': 'guides',
};

export default function App() {
  const { activePet, updatePetLocal, savePet, updateSubscription, isProOrTrial, trialDaysRemaining, user, isSavingPet } = usePets();
  const isAdminUser = user?.email?.toLowerCase() === 'dgcontrerasb@gmail.com';

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

  // 🛡️ BLINDAJE DE SEGURIDAD: Transacciones Wompi y PayPal intactas
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wompiTxId = urlParams.get('id') || urlParams.get('transaction_id');
    if (wompiTxId) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const planParam = urlParams.get('plan');
        if (planParam !== 'pro_annual' && planParam !== 'pro_monthly') {
          alert('No se pudo identificar el plan asociado al pago de Wompi.');
          return;
        }
        const planTier = planParam;
        const planName = planTier === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual';

        updateSubscription(planTier, planName, { wompiTransactionId: wompiTxId }).then(success => {
          if (success) {
            alert(`¡Pago exitoso con Wompi! Tu suscripción ${planName} se ha activado automáticamente.`);
          } else {
            alert('🔒 Activación bloqueada: No se pudo verificar la transacción de Wompi.');
          }
        });
      }
    }

    const paypalToken = urlParams.get('token');
    if (paypalToken) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        window.history.replaceState({}, document.title, window.location.pathname);
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
                alert(data.error || '🔒 Activación bloqueada: No se pudo capturar o verificar la orden de PayPal.');
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
    name: 'Oslo',
    type: 'dog',
    breedId: 'pomeranian',
    weightKg: 15,
    stage: 'adult',
    ageMonths: 36,
    neutered: true,
    activity: 'moderate',
    condition: 'ideal',
    diet: 'kibble',
    kibbleKcalPer100g: 360,
    photoUrl: undefined,
  });

  const isProfileEmpty = activePet == null;
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

  // Inicialización ultra segura basada en la URL actual
  const [activeTab, setActiveTabRaw] = useState<AppTab>(() => {
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    return PATH_TO_TAB[currentPath] || 'calculator';
  });

  // Reemplazar la entrada inicial en el historial para que nunca quede vacía
  useEffect(() => {
    const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const initialTab = PATH_TO_TAB[currentPath] || 'calculator';
    const targetPath = TAB_TO_PATH[initialTab] || '/porciones';
    window.history.replaceState({ tab: initialTab }, '', window.location.pathname === '/' ? '/' : targetPath);
  }, []);

  // Función de navegación con pushState enriquecido
  const setActiveTab = (tab: AppTab) => {
    const safeTab = tab || 'calculator';
    setActiveTabRaw(safeTab);
    const targetPath = TAB_TO_PATH[safeTab] || '/porciones';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: safeTab }, '', targetPath);
    }
  };

  const handleSelectTab = setActiveTab;

  // Escuchar botón "Atrás" y "Adelante" con fallback garantizado a 'calculator'
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab && PATH_TO_TAB[TAB_TO_PATH[e.state.tab as AppTab]]) {
        setActiveTabRaw(e.state.tab as AppTab);
        return;
      }
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const matchedTab = PATH_TO_TAB[currentPath] || 'calculator';
      setActiveTabRaw(matchedTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isBiometricsExpanded, setIsBiometricsExpanded] = useState<boolean>(() => !activePet);

  useEffect(() => {
    if (activePet) {
      setIsBiometricsExpanded(false);
    }
  }, [activePet?.id]);

  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('La foto es demasiado pesada. Selecciona una imagen menor a 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          setProfile(prev => ({ ...prev, photoUrl: compressedBase64 }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfile(prev => ({ ...prev, photoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTypeChange = (newType: 'dog' | 'cat') => {
    const defaultBreed = POPULAR_BREEDS.find(b => b.type === newType);
    setProfile(prev => ({
      ...prev,
      type: newType,
      breedId: defaultBreed ? defaultBreed.id : '',
      weightKg: newType === 'dog' ? 15 : 4.5
    }));
  };

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      setProfile(prev => ({ ...prev, weightKg: 0 }));
      return;
    }
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      setProfile(prev => ({ ...prev, weightKg: Number(num.toFixed(1)) }));
    }
  };

  const handleWeightAdjust = (delta: number) => {
    setProfile(prev => {
      const current = prev.weightKg || (prev.type === 'dog' ? 15 : 4.5);
      const nextWeight = Math.max(0.2, Number((current + delta).toFixed(1)));
      return { ...prev, weightKg: nextWeight };
    });
  };

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

      {/* Cabecera Superior Fija Permanente */}
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
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
          onOpenAdminModal={() => setShowAdminModal(true)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </header>

      {/* Contenedor Principal: 108px en móvil para librar los ~98px del header doble y dejar ver el borde superior completo */}
      <div className="flex-grow flex flex-col lg:flex-row w-full items-start pt-[108px] sm:pt-[84px]">
        {/* Barra Lateral estilo Workspace con scroll propio */}
        <div className="w-full lg:w-auto shrink-0 lg:sticky lg:top-[82px] lg:h-[calc(100vh-82px)] overflow-y-auto no-scrollbar">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isProOrTrial={isProOrTrial}
            trialDaysRemaining={trialDaysRemaining}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
            onOpenBgModal={() => setShowBgModal(true)}
            onOpenAdminModal={isAdminUser ? () => setShowAdminModal(true) : undefined}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
            petName={profile.name}
            petType={profile.type}
            petPhotoUrl={profile.photoUrl}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>

        {/* Modal Selector de Fondo e Imagen */}
        {showBgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs no-print animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto my-auto transition-colors">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 sticky top-0 bg-white dark:bg-stone-900 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
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
                  <X className="w-5 h-5" />
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
                  <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-center">Subir foto desde tu dispositivo</span>
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
                  Temas y Texturas
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
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Huellas</div>
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
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Arena suave</div>
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
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">Perrito Real</div>
                    <div className="text-[10px] text-stone-600 dark:text-stone-400">Fotografía fondo</div>
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

        {/* Contenido Principal con Respiro Armónico y Equilibrado */}
        <main className="flex-grow flex-1 w-full px-3 sm:px-5 lg:pl-3 lg:pr-6 pt-1 sm:pt-4 pb-8 space-y-3 sm:space-y-4 overflow-x-hidden">
          {/* VISTA 1: CALCULADORA Y FICHA CLÍNICA OFICIAL */}
          {activeTab === 'calculator' && (
            <div className="w-full animate-fade-in flex flex-col xl:flex-row items-start gap-4 sm:gap-6">

              {/* 🟢 BANNER HERO VERDE EN MÓVIL (PRIMERO EN PANTALLAS PEQUEÑAS) */}
              <div className="block lg:hidden w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-3.5 py-3 border border-[#2a5940] shadow-xs text-center flex-col items-center justify-center no-print">
                <div className="relative z-10 space-y-1 max-w-lg mx-auto">
                  <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Award className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Fórmula Nutricional Oficial</span>
                  </div>
                  <h1 className="text-sm font-editorial font-semibold tracking-tight text-white leading-tight">
                    Ficha Médica & <span className="font-editorial italic font-normal text-amber-300">Recomendaciones Oficiales</span>
                  </h1>
                  <p className="text-[10px] text-emerald-100/80 leading-relaxed font-normal">
                    Perfil clínico certificado para {profile.name} según pautas internacionales FEDIAF & NRC.
                  </p>
                </div>
              </div>
              
              {/* Bloque Calculadora: 5 cols izquierda + 7 cols derecha fluido */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start flex-1 w-full">

                {/* 📌 COLUMNA IZQUIERDA (5 COLS): BIOMÉTRICOS LIMPIOS + ASISTENTE CALCULADOR */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">

                  {/* 1.1 Biométricos Puros */}
                  <div className="glass-card dark:bg-stone-900/90 dark:border-stone-800 rounded-2xl p-3 sm:p-5 shadow-2xs space-y-2.5 sm:space-y-3.5 no-print transition-all">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2 sm:pb-2.5">
                      <div>
                        <h2 className="font-heading font-extrabold text-xs sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5 sm:gap-2">
                          <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                          Perfil Biométrico
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">Datos fisiológicos de {profile.name}</p>
                      </div>

                      {activePet && (
                        <button
                          type="button"
                          onClick={() => setIsBiometricsExpanded(prev => !prev)}
                          className="px-2.5 py-1 sm:px-2.5 sm:py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-[11px] sm:text-xs font-bold hover:bg-stone-100 transition-all cursor-pointer shadow-2xs shrink-0"
                        >
                          {isBiometricsExpanded ? '✕ Ocultar' : '✏️ Editar'}
                        </button>
                      )}
                    </div>
                    {!isBiometricsExpanded && activePet ? (
                      <div
                        onClick={() => setIsBiometricsExpanded(true)}
                        className="p-2.5 sm:p-3 rounded-xl bg-stone-50/90 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-750 flex items-center justify-between gap-2.5 animate-fade-in cursor-pointer hover:bg-stone-100/90 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">{profile.name}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                              {profile.type === 'dog' ? '🐶 Perro' : '🐱 Gato'}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-stone-600 dark:text-stone-400 truncate">
                            {profile.weightKg} kg • {selectedBreedInfo ? selectedBreedInfo.name : 'Raza no definida'}
                          </p>
                        </div>
                        <span className="text-[11px] sm:text-xs text-stone-400 dark:text-stone-500 font-semibold shrink-0 select-none">
                          Modificar →
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
                        {/* Foto Oficial */}
                        <div className="p-2.5 sm:p-3 bg-stone-50/80 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-750 space-y-1.5 sm:space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1 sm:gap-1.5">
                              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Foto Oficial
                            </span>
                            {profile.photoUrl && (
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="text-[9px] sm:text-[10px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Quitar
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {profile.photoUrl ? (
                                <img
                                  src={profile.photoUrl}
                                  alt={profile.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg sm:text-xl">
                                  {profile.type === 'dog' ? '🐶' : '🐱'}
                                </span>
                              )}
                            </div>

                            <div className="flex-1">
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="upload-pet-photo"
                              />
                              <label
                                htmlFor="upload-pet-photo"
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs w-full"
                              >
                                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-600 dark:text-stone-400" />
                                {profile.photoUrl ? 'Cambiar Foto' : 'Subir Foto'}
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Especie */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleTypeChange('dog')}
                            className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border-2 flex items-center justify-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                              profile.type === 'dog'
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                            }`}
                          >
                            <span>🐶 Perro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTypeChange('cat')}
                            className={`py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl border-2 flex items-center justify-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs transition-all cursor-pointer ${
                              profile.type === 'cat'
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                            }`}
                          >
                            <span>🐱 Gato</span>
                          </button>
                        </div>

                        {/* Nombre y Raza */}
                        <div className="space-y-1.5 sm:space-y-2">
                          <input
                            type="text"
                            value={profile.name}
                            onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nombre de la mascota"
                            className="w-full px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800 text-xs sm:text-sm"
                          />
                          <select
                            value={profile.breedId}
                            onChange={e => setProfile(prev => ({ ...prev, breedId: e.target.value }))}
                            className="w-full px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800 text-[11px] sm:text-xs bg-white cursor-pointer"
                          >
                            {availableBreeds.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.typicalWeight})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Peso Actual en Tiempo Real */}
                        <div className="p-2 sm:p-2.5 bg-stone-50/80 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-750 flex items-center justify-between gap-1.5 sm:gap-2">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-stone-600 dark:text-stone-300">
                            Peso Actual:
                          </span>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={profile.weightKg || ''}
                              onChange={handleWeightInputChange}
                              className="w-14 sm:w-16 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-stone-300 dark:border-stone-600 font-extrabold text-xs sm:text-sm text-center"
                            />
                            <span className="text-[11px] sm:text-xs font-bold text-stone-500">kg</span>
                            <button
                              type="button"
                              onClick={() => handleWeightAdjust(-0.5)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-stone-700 border border-stone-300 rounded font-black text-[11px] sm:text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWeightAdjust(0.5)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-stone-700 border border-stone-300 rounded font-black text-[11px] sm:text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Botón Guardar */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (isProfileEmpty || !activePet) return;
                            await savePet(profile);
                            setSaveSuccessMessage(`¡Perfil guardado!`);
                            setTimeout(() => setSaveSuccessMessage(null), 3000);
                          }}
                          disabled={isSavingPet || isProfileEmpty}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] sm:text-xs shadow-xs transition-all cursor-pointer"
                        >
                          {isSavingPet ? 'Guardando...' : 'Guardar Datos Biométricos'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1.2 Calculadora Unificada y Diagnóstico Nutricional */}
                  <div className="no-print">
                    <UnifiedFoodCalculator
                      kibbleDailyGrams={result.kibbleDailyGrams}
                      barfDailyGrams={result.barfBreakdown?.totalGrams || Math.round(result.kibbleDailyGrams * 2.1)}
                      petName={profile.name}
                      petType={profile.type}
                      selectedDiet={(profile.diet as any) || 'kibble'}
                      onDietChange={(newDiet) => setProfile(prev => ({ ...prev, diet: newDiet as any }))}
                    />
                  </div>

                </div>

                {/* 📋 COLUMNA DERECHA (7 COLS): HERO ELEGANTE + FICHA CLÍNICA + REGLAS DE TRANSICIÓN */}
                <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">

                  {/* 2.1 Hero Verde Editorial Centrado (ESTRICTAMENTE OCULTO EN MÓVIL, SOLO VISIBLE EN PC) */}
                  <div className="hidden lg:block relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-4 py-3.5 sm:px-6 sm:py-4 border border-[#2a5940] shadow-xs text-center no-print">
                    <div className="relative z-10 space-y-1 max-w-lg mx-auto">
                      <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Award className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Fórmula Nutricional Oficial</span>
                      </div>
                      <h1 className="text-sm sm:text-lg font-editorial font-semibold tracking-tight text-white leading-tight">
                        Ficha Médica & <span className="font-editorial italic font-normal text-amber-300">Recomendaciones Oficiales</span>
                      </h1>
                      <p className="text-[10px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
                        Perfil clínico certificado para {profile.name} según pautas internacionales FEDIAF & NRC.
                      </p>
                    </div>
                  </div>

                  {/* 2.2 Ficha Clínica Oficial */}
                  <div
                    id="print-pet-sheet"
                    className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4 relative overflow-hidden transition-all"
                  >
                    {/* Cabecera Mascota */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-stone-100 dark:border-stone-800 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                          {profile.photoUrl ? (
                            <img
                              src={profile.photoUrl}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              {profile.type === 'dog' ? '🐶' : '🐱'}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <h3 className="font-editorial text-lg sm:text-xl font-medium text-stone-900 dark:text-stone-100 leading-tight truncate">
                              {profile.name || 'Mi Mascota'}
                            </h3>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                              ({profile.type === 'dog' ? 'Canino' : 'Felino'})
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-snug">
                            <p className="font-medium text-stone-700 dark:text-stone-300">
                              {selectedBreedInfo ? selectedBreedInfo.name : 'Raza / Contextura'}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Peso Actual: <strong className="text-stone-900 dark:text-stone-100 font-semibold">{profile.weightKg} kg</strong> · {profile.condition === 'ideal' ? 'Peso Ideal' : profile.condition === 'overweight' ? 'Sobrepeso' : 'Bajo Peso'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
                        <span>Compartir Ficha</span>
                      </button>
                    </div>

                    {/* Métricas Energéticas Clínicas Compactas (Ahorro del 40% vertical) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5 animate-fade-in">
                      <div className="py-1.5 px-1 sm:p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/90 dark:border-stone-800 text-center flex flex-col justify-center">
                        <span className="text-[8px] sm:text-[9px] font-mono uppercase text-stone-500 leading-none mb-1">RER (Base)</span>
                        <div className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-tabular leading-tight">
                          {result.rer} <span className="text-[8.5px] sm:text-[10px] font-normal text-stone-400">kcal</span>
                        </div>
                      </div>

                      <div className="py-1.5 px-1 sm:p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-center flex flex-col justify-center">
                        <span className="text-[8px] sm:text-[9px] font-mono uppercase text-emerald-800 dark:text-emerald-300 leading-none mb-1">MER (Total)</span>
                        <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 font-tabular leading-tight">
                          {result.mer} <span className="text-[8.5px] sm:text-[10px] font-normal text-emerald-700">kcal</span>
                        </div>
                      </div>

                      <div className="py-1.5 px-1 sm:p-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/90 dark:border-stone-800 text-center flex flex-col justify-center">
                        <span className="text-[8px] sm:text-[9px] font-mono uppercase text-stone-500 leading-none mb-1">Agua Diaria</span>
                        <div className="text-[10.5px] sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-tabular leading-tight">
                          {result.waterDailyMl.min}-{result.waterDailyMl.max} <span className="text-[8.5px] sm:text-[10px] font-normal text-stone-400">ml</span>
                        </div>
                      </div>
                    </div>

                    {/* Fórmulas Recomendadas */}
                    {selectedBreedInfo && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </span>
                            <h4 className="font-heading font-black text-xs text-stone-900 dark:text-stone-100 truncate">
                              Nutrición Específica · <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{selectedBreedInfo.name}</span>
                            </h4>
                          </div>
                          <span className="text-[9px] font-mono font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50 shrink-0">
                            FEDIAF/NRC
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedBreedInfo.recommendedFoodTypes.map((tier, idx) => {
                            const isSuper = tier.tier.includes('Súper Premium');
                            return (
                              <div
                                key={idx}
                                className={`relative p-2.5 rounded-xl border flex flex-col justify-between shadow-2xs ${
                                  isSuper
                                    ? 'bg-gradient-to-br from-emerald-50/40 via-white to-stone-50/60 dark:from-emerald-950/25 dark:via-stone-900 dark:to-stone-900 border-emerald-500/25 dark:border-emerald-700/40'
                                    : 'bg-gradient-to-br from-amber-50/40 via-white to-stone-50/60 dark:from-amber-950/25 dark:via-stone-900 dark:to-stone-900 border-amber-500/25 dark:border-amber-700/40'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs ${
                                        isSuper
                                          ? 'bg-emerald-700 text-white'
                                          : 'bg-amber-600 text-white'
                                      }`}
                                    >
                                      {isSuper ? '★ Súper Premium' : '⚖ Calidad-Precio'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-snug line-clamp-2">
                                    {tier.why}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-1 pt-1.5 mt-1 border-t border-stone-200/60 dark:border-stone-800">
                                  {tier.brands.map((brand, bIdx) => (
                                    <span
                                      key={bIdx}
                                      className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[9.5px] font-black text-stone-800 dark:text-stone-100 shadow-2xs"
                                    >
                                      {brand}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2.3 Regla de los 7 Días */}
                  <div className="no-print">
                    <FoodTransitionGuide
                      petName={profile.name}
                      petType={profile.type}
                    />
                  </div>

                </div>

              </div>

              {/* 📷 WIDGET FOTOGRÁFICO DE OSLO */}
              <div className="hidden xl:block w-72 shrink-0 xl:sticky xl:top-0">
                <PetPhotoReelWidget profile={profile} />
              </div>

            </div>
          )}

          {/* VISTAS MODULARES CON EL MISMO BALANCE VISUAL */}
          {activeTab === 'routine' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                <RoutineSchedule profile={profile} result={result} />
              </div>
            </div>
          )}

          {/* VISTA: TIPS, GUÍAS CLÍNICAS Y PRIMEROS AUXILIOS */}
          {activeTab === 'guides' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                <TipsAndGuidesModule />
              </div>
            </div>
          )}

          {activeTab === 'sheet' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                {isProOrTrial ? (
                  <PetTechSheet onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
                ) : (
                  <ProFeatureLock
                    featureName="Ficha Médica Imprimible & Código QR de Emergencia"
                    onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                {isProOrTrial ? (
                  <MedicalHistory />
                ) : (
                  <ProFeatureLock
                    featureName="Expediente Clínico Digital & Control de Curva de Peso"
                    onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                {isProOrTrial ? (
                  <RemindersModule />
                ) : (
                  <ProFeatureLock
                    featureName="Sistema Inteligente de Vacunas y Notificaciones"
                    onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                <BarfRecipeGenerator onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
              </div>
            </div>
          )}

          {activeTab === 'advisor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                <CountryFoodAdvisor onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
              </div>
            </div>
          )}

          {activeTab === 'breeds' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0">
                <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
              </div>
              <div className="w-full lg:col-span-8 space-y-4">
                <BreedEncyclopedia
                  onSelectBreedForCalculation={(type, breedId) => {
                    setProfile(prev => ({
                      ...prev,
                      type,
                      breedId,
                      name: prev.name || 'Mi Mascota',
                    }));
                    handleSelectTab('calculator');
                  }}
                />
              </div>
            </div>
          )}

         {/* VISTA 3: SEMÁFORO DE ALIMENTOS TÓXICOS Y SEGUROS */}
          {activeTab === 'foods' && (
            <div className="w-full space-y-5">
              {/* Contenedor Superior: Tarjeta de Oslo (4 cols) + Hero Verde y Primeras 4 Tarjetas (8 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Columna Izquierda: Tarjeta Lateral de Oslo (Solo Desktop) */}
                <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0 space-y-3">
                  <PetProfileHUD profile={profile} result={result} onSelectTab={handleSelectTab} />
                </div>

                {/* Columna Derecha: Hero Verde idéntico + Primeras 4 Tarjetas */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-4 py-3.5 sm:px-6 sm:py-4 border border-[#2a5940] shadow-xs text-center flex flex-col items-center justify-center no-print">
                    <div className="relative z-10 space-y-1 max-w-lg mx-auto">
                      <div className="inline-flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <Award className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Seguridad & Toxicología Veterinaria</span>
                      </div>
                      <h1 className="text-base sm:text-lg font-editorial font-semibold tracking-tight text-white leading-tight">
                        Semáforo Clínico & <span className="font-editorial italic font-normal text-amber-300">Prevención de Intoxicaciones</span>
                      </h1>
                      <p className="text-[11px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
                        Guía toxicológica certificada para {profile.name} según protocolos clínicos FEDIAF.
                      </p>
                    </div>
                  </div>

                  <FoodTrafficLight />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white/90 dark:bg-stone-900/90 py-6 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2.5 text-xs text-stone-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <NutriPetLogo size="sm" />
              <span>•</span>
              <span>Herramienta informativa y de orientación para el cuidado de mascotas</span>
            </div>
            {isAdminUser && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400">Uso personal</span>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="text-stone-300 hover:text-stone-500 p-1 cursor-pointer"
                  title="Acceso Propietario"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="p-2.5 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-[10px] text-stone-600 dark:text-stone-400 leading-relaxed">
            <strong>Aviso de exención de responsabilidad:</strong> Esta aplicación web es un recurso de consulta general y cálculo orientativo. La información no constituye asesoría médica, diagnóstico ni prescripción. Ante cualquier duda o síntoma, consulta siempre a tu médico veterinario.
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
      <RegistrationLockModal />
      <LogoutTransitionModal isOpen={isLoggingOut} />
      <BackToTopButton />
    </div>
  );
}