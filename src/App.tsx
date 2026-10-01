import React, { useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { 
  Calculator, 
  Utensils, 
  AlertTriangle, 
  BookOpen, 
  Printer, 
  Heart, 
  Scale, 
  Droplet, 
  CheckCircle2, 
  Info, 
  Sparkles,
  Search,
  Award,
  Camera,
  Trash2,
  Tag,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Activity,
  Flame,
  Palette,
  Image as ImageIcon,
  X,
  Share2,
  Package,
  Clock,
  MessageCircle,
  FileText,
  Stethoscope,
  Bell,
  Crown,
  Lock,
  Loader2,
  Download,
  Check,
  Save
} from 'lucide-react';
import { PetProfile, CalculationResult, BreedInfo, AppTab } from './types';
import { calculatePetNutrition, HEALTH_AND_NUTRITION_GUIDES, POPULAR_BREEDS } from './data';
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
import { SubscriptionModal } from './components/SubscriptionModal';
import { AnimatedCounter } from './components/AnimatedCounter';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { RegistrationLockModal } from './components/RegistrationLockModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { NutriPetLogo } from './components/NutriPetLogo';
import { BarfRecipeGenerator } from './components/BarfRecipeGenerator';
import { Sidebar } from './components/Sidebar';
import { BackToTopButton } from './components/BackToTopButton';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { LogoutTransitionModal } from './components/LogoutTransitionModal';
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
  const isAdminUser = user?.email?.toLowerCase() === 'dgcontrerasb@gmail.com';

  // Función de prueba accesible desde consola: testWompi()
  React.useEffect(() => {
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

  // Modo Oscuro / Claro persistente
// Modo Oscuro / Claro (Modo claro por defecto)
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('nutripet_dark_mode');
    if (saved !== null) return saved === 'true';
    return false; // Iniciar siempre en modo claro por defecto
  });
  React.useEffect(() => {
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

// Escuchar retorno de transacciones (Wompi o PayPal en la URL)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Retorno de Wompi (?id=... o ?transaction_id=... en la URL)
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

    // 2. Retorno de PayPal (?token=... o ?PayerID=... en la URL)
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

  // Perfil temporal de borrador para la calculadora si aún no hay mascotas reales
  const [localDraftProfile, setLocalDraftProfile] = React.useState<PetProfile>({
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

  // Marcar si el perfil es puramente temporal/visual
  const isProfileEmpty = activePet == null;
  const profile: PetProfile = activePet || localDraftProfile;

  // setProfile NUNCA llama a updatePetLocal ni savePet si activePet es null o si el ID es temporal/default
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

  const [activeTab, setActiveTab] = React.useState<AppTab>('calculator');

  // Control de colapso de biométricos para optimizar espacio en móvil
  const [isBiometricsExpanded, setIsBiometricsExpanded] = React.useState<boolean>(() => !activePet);

  React.useEffect(() => {
    if (activePet) {
      setIsBiometricsExpanded(false);
    }
  }, [activePet?.id]);
  const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string | null>(null);

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const prevUserRef = React.useRef(user);

  React.useEffect(() => {
    // Si antes había usuario y ahora pasó a null (cerró sesión)
    if (prevUserRef.current && !user) {
      setIsLoggingOut(true);
      setActiveTab('calculator');
      
      // Limpiar claves locales de sesión para evitar mostrar perfiles residuales
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
        // Forzar actualización limpia del perfil borrador
        window.location.reload();
      }, 2500);

      return () => clearTimeout(timer);
    }
    prevUserRef.current = user;
  }, [user]);

  // Scroll automático al inicio al cambiar de pestaña
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeTab]);
  
  // Opciones de personalización de fondo con persistencia en Firestore y localStorage
  const { bgTheme, setBgTheme, customBgImage, setCustomBgImage, bgIntensity, setBgIntensity } = useBgPreferences(user);
  const [showBgModal, setShowBgModal] = React.useState<boolean>(false);
  const [showShareModal, setShowShareModal] = React.useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = React.useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Cálculo en tiempo real
  const result: CalculationResult = React.useMemo(() => {
    return calculatePetNutrition(profile);
  }, [profile]);

  // Información de la raza seleccionada
  const selectedBreedInfo: BreedInfo | undefined = React.useMemo(() => {
    return POPULAR_BREEDS.find(b => b.id === profile.breedId);
  }, [profile.breedId]);

  // Lista de razas según la especie activa (perro o gato)
  const availableBreeds = React.useMemo(() => {
    return POPULAR_BREEDS.filter(b => b.type === profile.type);
  }, [profile.type]);

  // Manejo de carga de foto con compresión en Canvas (evita superar límites de Firestore)
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

  // Cambio de especie: reset de raza
  const handleTypeChange = (newType: 'dog' | 'cat') => {
    const defaultBreed = POPULAR_BREEDS.find(b => b.type === newType);
    setProfile(prev => ({
      ...prev,
      type: newType,
      breedId: defaultBreed ? defaultBreed.id : '',
      weightKg: newType === 'dog' ? 20 : 4.5
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
      const current = prev.weightKg || (prev.type === 'dog' ? 20 : 4.5);
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
        // Comprimir mediante canvas para que quepa perfecto en localStorage sin perder nitidez visual
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
      <header className="fixed top-0 left-0 right-0 z-40 w-full no-print shadow-xs">
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

      {/* Estructura con Sidebar Lateral Desplegable con padding top para compensar la barra fija */}
      <div className="flex-grow flex flex-col lg:flex-row w-full mx-auto max-w-7xl items-start pt-20 sm:pt-24">
        <div className="w-full lg:w-auto lg:sticky lg:top-24 lg:self-start z-30 shrink-0">
          <Sidebar 
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isProOrTrial={isProOrTrial}
            trialDaysRemaining={trialDaysRemaining}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
            onOpenBgModal={() => setShowBgModal(true)}
            onOpenAdminModal={isAdminUser ? () => setShowAdminModal(true) : undefined}
            petName={profile.name}
            petType={profile.type}
            petPhotoUrl={profile.photoUrl}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>

      {/* Modal / Selector de Fondo e Imagen */}
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

            {/* Fondos y Temas Preestablecidos */}
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

                {/* 7. ocean */}
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

                {/* 8. sunset */}
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

                {/* 9. forest */}
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

                {/* 10. lavender */}
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

            {/* Selector de Nivel de Notoriedad / Intensidad */}
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

      {/* Cuerpo Principal a la Derecha */}
      <main className="flex-grow flex-1 w-full px-4 sm:px-6 pt-6 sm:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-32 lg:pb-12 space-y-8 overflow-x-hidden">
        
        {/* VISTA 1: CALCULADORA NUTRICIONAL Y FICHA CON FOTO */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            
            {/* Banner Destacado con Gradiente y Barra de Progreso de Pasos Centrados */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-900 text-white p-6 sm:p-8 shadow-lg border border-emerald-800/40 dark:shadow-[0_0_25px_rgba(16,185,129,0.12)] no-print text-center">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-3 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-md border border-emerald-400/30">
                  <Award className="w-3.5 h-3.5" />
                  Estimación Veterinaria Orientativa
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading leading-tight text-center text-white">
                  Calculadora Nutricional <span className="text-emerald-300 font-extrabold">& Ficha Oficial</span>
                </h1>
                <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-2xl font-normal text-center">
                  Configura el perfil de tu mascota para calcular sus requerimientos calóricos exactos y generar su carnet impreso.
                </p>

                {/* 📊 Indicador Progresivo de Pasos (Centrado) */}
                <div className="pt-2 w-full flex justify-center">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 max-w-xl mx-auto">
                    <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/15 flex items-center justify-center gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">Paso 1</span>
                        <span className="text-xs font-bold text-white whitespace-nowrap">Datos Mascota</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/15 flex items-center justify-center gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">Paso 2</span>
                        <span className="text-xs font-bold text-white whitespace-nowrap">Dieta & Estilo</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/15 flex items-center justify-center gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-emerald-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">Paso 3</span>
                        <span className="text-xs font-bold text-white whitespace-nowrap">Ficha & Ración</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cuadrícula Principal: Formulario + Ficha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Panel de Configuración (Izquierda) */}
              <div className="lg:col-span-5 space-y-4">
                
                <div className="flex items-center justify-between px-1 no-print">
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Configuración de la Mascota
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Pasos 1 y 2
                  </span>
                </div>

                <div className="glass-card dark:bg-stone-900/90 dark:border-stone-800 dark:shadow-[0_0_20px_rgba(16,185,129,0.06)] rounded-3xl p-6 sm:p-7 shadow-bento space-y-6 no-print transition-all">
                  
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                    <div>
                      <h2 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Biométricos & Dieta
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Personaliza los datos para la ración exacta</p>
                    </div>

                    {activePet && (
                      <button
                        type="button"
                        onClick={() => setIsBiometricsExpanded(prev => !prev)}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-750 transition-all cursor-pointer shadow-2xs shrink-0"
                      >
                        {isBiometricsExpanded ? '✕ Ocultar' : '✏️ Editar'}
                      </button>
                    )}
                  </div>

                {!isBiometricsExpanded && activePet ? (
                  <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-750 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-stone-900 dark:text-stone-100">{profile.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {profile.type === 'dog' ? '🐶 Perro' : '🐱 Gato'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        {profile.weightKg} kg • {profile.condition === 'ideal' ? 'Peso Ideal' : profile.condition === 'overweight' ? 'Sobrepeso' : 'Bajo Peso'} • {profile.diet === 'kibble' ? 'Croquetas' : 'BARF'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBiometricsExpanded(true)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs hover:bg-emerald-50 dark:hover:bg-stone-650 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Modificar ✏️
                    </button>
                  </div>
                ) : (
                  <>
                {/* Subir Foto de la Mascota */}
                <div className="p-4 bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Foto Oficial de Ficha
                    </span>
                    {profile.photoUrl && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Quitar foto
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {profile.photoUrl ? (
                        <img 
                          src={profile.photoUrl} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-stone-300">
                          {profile.type === 'dog' ? '🐶' : '🐱'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
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
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98 w-full"
                      >
                        <Camera className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                        {profile.photoUrl ? 'Cambiar Foto' : 'Subir Foto de tu Mascota'}
                      </label>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500">
                        Se optimiza automáticamente en tu navegador
                      </p>
                    </div>
                  </div>
                </div>

                {/* Especie: Perro o Gato con Micro-animación bounce */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Especie
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="select-type-dog"
                      onClick={() => handleTypeChange('dog')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
                        profile.type === 'dog'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 shadow-xs dark:border-emerald-500'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      <span className="text-xl transform group-hover:scale-110 transition-transform">🐶</span>
                      <span>Perro</span>
                    </button>
                    <button
                      type="button"
                      id="select-type-cat"
                      onClick={() => handleTypeChange('cat')}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
                        profile.type === 'cat'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 shadow-xs dark:border-emerald-500'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      <span className="text-xl transform group-hover:scale-110 transition-transform">🐱</span>
                      <span>Gato</span>
                    </button>
                  </div>
                </div>

                {/* Nombre y Selección de Raza */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="pet-name-input" className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Nombre de la Mascota
                    </label>
                    <input
                      id="pet-name-input"
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      onBlur={e => {
                        if (!e.target.value.trim()) {
                          setProfile(prev => ({ ...prev, name: 'Mi Mascota' }));
                        }
                      }}
                      placeholder="Escribe el nombre de tu mascota"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="pet-breed-select" className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Raza / Contextura
                      </label>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        ¿Dudas? Elige por tamaño
                      </span>
                    </div>
                    <select
                      id="pet-breed-select"
                      value={profile.breedId}
                      onChange={e => setProfile(prev => ({ ...prev, breedId: e.target.value }))}
                      className="w-full px-3.5 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800 text-sm bg-white cursor-pointer touch-manipulation shadow-2xs"
                    >
                      {availableBreeds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.typicalWeight})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      💡 Si tu mascota es mestiza o no conoces su raza, escoge la opción de <strong className="text-stone-700">Mestizo por peso</strong> o la raza más similar físicamente.
                    </p>
                  </div>
                </div>

                {/* Peso Actual (Campo Numérico Directo) */}
                <div className="p-4 bg-stone-50/80 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pet-weight-input" className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Peso Corporal Actual
                    </label>
                    <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500">
                      Escribe el peso exacto
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="pet-weight-input"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="150"
                        placeholder="Ej. 12.5"
                        value={profile.weightKg || ''}
                        onChange={handleWeightInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 font-extrabold text-stone-900 dark:text-stone-100 text-lg sm:text-xl shadow-2xs pr-12 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-stone-400 dark:text-stone-500 text-sm pointer-events-none">
                        kg
                      </span>
                    </div>

                    {/* Botones incremento/decremento directo para comodidad rápida */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleWeightAdjust(-0.5)}
                        className="w-11 h-11 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-650 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 rounded-xl font-black text-base flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Restar 0.5 kg"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWeightAdjust(0.5)}
                        className="w-11 h-11 bg-white dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-650 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 rounded-xl font-black text-base flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Sumar 0.5 kg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Etapa de Vida */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Etapa de Vida
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stage: 'puppy_kitten' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.stage === 'puppy_kitten'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      {profile.type === 'dog' ? 'Cachorro' : 'Gatito'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stage: 'adult' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.stage === 'adult'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      Adulto
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stage: 'senior' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.stage === 'senior'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      Senior (+7 años)
                    </button>
                  </div>
                </div>

                {/* Condición Corporal */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Condición Corporal
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, condition: 'underweight' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.condition === 'underweight'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      Bajo Peso
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, condition: 'ideal' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.condition === 'ideal'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 dark:border-emerald-500 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      Peso Ideal
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, condition: 'overweight' }))}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-xs ${
                        profile.condition === 'overweight'
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/70 text-red-900 dark:text-red-200 font-extrabold'
                          : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                      }`}
                    >
                      Sobrepeso
                    </button>
                  </div>
                </div>

                {/* Esterilizado y Dieta */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">¿Esterilizado / Castrado?</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Ajuste calórico (-20%)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, neutered: !prev.neutered }))}
                    className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer active:scale-95 ${
                      profile.neutered ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        profile.neutered ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Tipo de Dieta */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, diet: 'kibble' }))}
                    className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
                      profile.diet === 'kibble'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 dark:border-emerald-500 font-extrabold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                    }`}
                  >
                    🥣 Croquetas / Pienso
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, diet: 'barf' }))}
                    className={`p-3 rounded-2xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md ${
                      profile.diet === 'barf'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 dark:border-emerald-500 font-extrabold'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900'
                    }`}
                  >
                    🥩 Comida Natural (BARF)
                  </button>
                </div>

                {/* Botón Destacado de Guardar Cambios de la Mascota */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (isProfileEmpty || !activePet) {
                        return;
                      }
                      const lowerId = String(profile?.id || '').toLowerCase();
                      if (
                        lowerId === 'defaultpet' ||
                        lowerId === 'tempemptypet' ||
                        lowerId.includes('default') ||
                        lowerId.includes('temp')
                      ) {
                        console.warn('✖ Guardado bloqueado por mascota temporal:', profile.id);
                        return;
                      }
                      await savePet(profile);
                      setSaveSuccessMessage(`¡Perfil de ${profile.name || 'mascota'} guardado con éxito!`);
                      setTimeout(() => setSaveSuccessMessage(null), 3500);
                    }}
                    disabled={isSavingPet || isProfileEmpty}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingPet ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando en la Nube...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-emerald-200" />
                        <span>{isProfileEmpty ? 'Selecciona una Mascota para Guardar' : 'Guardar Cambios de Mascota'}</span>
                      </>
                    )}
                  </button>

                  {isProfileEmpty && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center font-bold">
                      💡 Para guardar datos clínicos y porciones, primero agrega o selecciona una mascota en la barra superior.
                    </p>
                  )}

                  {saveSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center justify-center gap-2 animate-fade-in shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{saveSuccessMessage}</span>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            </div>

              {/* Panel de la Ficha Personalizada con Foto (Derecha) */}
              <div className="lg:col-span-7 space-y-4">
                
                <div className="flex items-center justify-between px-1 no-print">
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Ficha Técnica & Raciones Oficiales
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Paso 3 de 3
                  </span>
                </div>
                
                <div 
                  id="print-pet-sheet"
                  className="glass-card dark:bg-stone-900/90 dark:border-stone-800 dark:shadow-[0_0_25px_rgba(16,185,129,0.08)] border-2 border-emerald-500/10 rounded-3xl p-6 sm:p-8 shadow-bento space-y-6 relative overflow-hidden transition-all print:bg-white print:border print:border-black print:p-4 print:shadow-none"
                >
                  
                  {/* Cabecera con Foto y Datos de la Mascota */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-stone-100 dark:border-stone-800 gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar o Foto Subida */}
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-emerald-500/40 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                        {profile.photoUrl ? (
                          <img 
                            src={profile.photoUrl} 
                            alt={profile.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">
                            {profile.type === 'dog' ? '🐶' : '🐱'}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-2xl font-black text-stone-900 dark:text-stone-100 leading-tight">
                            {profile.name || 'Mi Mascota'}
                          </h3>
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/80">
                            {profile.type === 'dog' ? 'Canino' : 'Felino'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold mt-0.5">
                          {selectedBreedInfo ? selectedBreedInfo.name : 'Raza / Contextura'}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          Peso: <strong className="text-stone-800 dark:text-stone-200">{profile.weightKg} kg</strong> • Condición: <strong className="text-stone-800 dark:text-stone-200">{profile.condition === 'ideal' ? 'Peso Ideal' : profile.condition === 'overweight' ? 'Sobrepeso' : 'Bajo Peso'}</strong> • Esterilizado: <strong className="text-stone-800 dark:text-stone-200">{profile.neutered ? 'Sí' : 'No'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap no-print">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                        title="Compartir por WhatsApp o copiar resumen"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>Compartir Resumen</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. PLATO RECOMENDADO (LA RESPUESTA CLAVE INMEDIATA) */}
                  {profile.diet === 'kibble' ? (
                    <div className="space-y-4 bg-gradient-to-b from-stone-50 to-emerald-50/30 dark:from-stone-850 dark:to-emerald-950/20 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🥣</span>
                          <div>
                            <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">
                              Ración Diaria de Croquetas / Pienso
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Recomendación calórica para {profile.name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                          {result.mealsPerDay} tomas al día
                        </span>
                      </div>

                      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                        <div className="text-center sm:text-left">
                          <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                            Total diario a servir:
                          </span>
                          <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white font-heading">
                            <AnimatedCounter value={result.kibbleDailyGrams} /> <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">gramos/día</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: result.mealsPerDay }).map((_, i) => (
                            <div key={i} className="text-center bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl">
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                                Toma {i + 1}
                              </span>
                              <span className="text-lg font-black text-stone-900 dark:text-white font-heading">
                                <AnimatedCounter value={result.gramsPerMeal} suffix="g" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-gradient-to-b from-stone-50 to-amber-50/30 dark:from-stone-850 dark:to-amber-950/20 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🥩</span>
                          <div>
                            <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">
                              Ración Dieta Natural BARF
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Alimento biológicamente apropiado para {profile.name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                          {result.barfBreakdown?.percentage}% peso corporal
                        </span>
                      </div>

                      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center sm:text-left flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-xs text-stone-400 dark:text-stone-500 block font-bold uppercase">Total diario fresco:</span>
                          <span className="text-3xl font-black text-stone-900 dark:text-white font-heading">
                            <AnimatedCounter value={result.barfBreakdown?.totalGrams || 0} /> <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">gramos/día</span>
                          </span>
                        </div>
                        <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg font-bold">
                          {result.mealsPerDay} tomas de {Math.round((result.barfBreakdown?.totalGrams || 0) / result.mealsPerDay)}g
                        </span>
                      </div>

                      {result.barfBreakdown && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Huesos Carnosos</span>
                            <span className="text-base font-extrabold text-stone-900 dark:text-white font-heading">
                              <AnimatedCounter value={result.barfBreakdown.meatyBonesGrams} suffix="g" />
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">50% crudo</span>
                          </div>

                          <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Carne Magra</span>
                            <span className="text-base font-extrabold text-stone-900 dark:text-white font-heading">
                              <AnimatedCounter value={result.barfBreakdown.muscleMeatGrams} suffix="g" />
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">30% músculo</span>
                          </div>

                          <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Vísceras</span>
                            <span className="text-base font-extrabold text-stone-900 dark:text-white font-heading">
                              <AnimatedCounter value={result.barfBreakdown.organsGrams} suffix="g" />
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">10% hígado/órgano</span>
                          </div>

                          <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Vegetales Aptos</span>
                            <span className="text-base font-extrabold text-stone-900 dark:text-white font-heading">
                              <AnimatedCounter value={result.barfBreakdown.vegetablesFruitsGrams} suffix="g" />
                            </span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">10% verdura</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. BLOQUE DE MÉTRICAS ENERGÉTICAS (RER, MER, AGUA) DETALLADO SIEMPRE VISIBLE */}
                  <div className="space-y-4 pt-1 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                          Gasto Base (RER)
                        </span>
                        <span className="text-xl font-black text-stone-800 font-heading">
                          {result.rer} <span className="text-xs font-medium text-stone-500">kcal/día</span>
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-1">Calorías en reposo estricto</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                          Calorías Totales (MER)
                        </span>
                        <span className="text-xl font-black text-emerald-900 font-heading">
                          {result.mer} <span className="text-xs font-medium text-emerald-700">kcal/día</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 block mt-1">Gasto total según actividad</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 col-span-2 sm:col-span-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                          Agua Diaria Sugerida
                        </span>
                        <span className="text-xl font-black text-blue-900 font-heading">
                          {result.waterDailyMl.min} - {result.waterDailyMl.max} <span className="text-xs font-medium text-blue-700">ml</span>
                        </span>
                        <span className="text-[10px] text-blue-600 block mt-1">Hidratación fresca</span>
                      </div>
                    </div>

                    {/* SECCIÓN ESPECIAL: MARCAS SUGERIDAS Y CONSEJOS SEGÚN SU RAZA */}
                    {selectedBreedInfo && (
                      <div className="space-y-3 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="font-heading font-extrabold text-sm sm:text-base text-stone-900">
                              Sugerencias del Mercado para {selectedBreedInfo.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              Enfoque nutricional: {selectedBreedInfo.nutritionFocus}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {selectedBreedInfo.recommendedFoodTypes.map((tier, idx) => (
                            <div key={idx} className="flex flex-col gap-2.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                              {/* Categoría / Nivel Badge */}
                              <span className={`font-bold text-xs px-2.5 py-1 rounded-lg w-fit ${
                                tier.tier.includes('Súper Premium')
                                  ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              }`}>
                                {tier.tier}
                              </span>

                              {/* Marcas recomendadas en Chips/Tags */}
                              <div className="flex flex-wrap gap-2">
                                {tier.brands.map((brand, bIdx) => (
                                  <span key={bIdx} className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs">
                                    {brand}
                                  </span>
                                ))}
                              </div>

                              {/* Explicación Por qué funciona */}
                              <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 mt-1 leading-relaxed">
                                <span className="shrink-0 mt-0.5">💡</span>
                                <div>
                                  <strong className="text-stone-900 dark:text-stone-200">Por qué funciona:</strong> {tier.why}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Llamado Contextual al Registro dentro de la Ficha (Visible solo sin sesión) */}
                {!user && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3.5 no-print">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shrink-0">
                        {profile.type === 'dog' ? '🐶' : '🐱'}
                      </div>
                      <div className="text-center sm:text-left">
                        <strong className="block font-bold text-sm text-white">
                          ¿Quieres guardar la ficha y dieta de {profile.name || 'tu mascota'}?
                        </strong>
                        <p className="text-xs text-stone-300">
                          Respalda su historial en la nube e incluye 15 días gratis de funciones Pro.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const googleBtn = document.querySelector('button[title*="Google"]') as HTMLButtonElement | null;
                        if (googleBtn) googleBtn.click();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap text-center"
                    >
                      Registrarme Gratis
                    </button>
                  </div>
                )}

                {/* Calculadora Unificada de Rendimiento, Duración de Saco & Presupuesto */}
                <div className="no-print">
                  <UnifiedFoodCalculator
                    dailyGrams={profile.diet === 'kibble' ? result.kibbleDailyGrams : (result.barfBreakdown?.totalGrams || 500)}
                    petName={profile.name}
                    petType={profile.type}
                  />
                </div>

                {/* Acceso Rápido a la Rutina y Horarios en su pestaña dedicada */}
                <div className="p-4 bg-emerald-50 dark:bg-stone-850 border border-emerald-200/80 dark:border-stone-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                  <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 text-xs font-medium">
                    <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl font-extrabold">⏰</span>
                    <div>
                      <strong className="block font-bold text-stone-900 dark:text-white">Organizador de Rutina & Horarios</strong>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Genera la tabla de horarios de {profile.name} para pegar en la nevera.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('routine')}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Ver Rutina Completa →
                  </button>
                </div>

                {/* Guía Interactiva de Transición de Alimento (Regla de 7 días) */}
                <div className="no-print">
                  <FoodTransitionGuide
                    petName={profile.name}
                    petType={profile.type}
                  />
                </div>

                {/* Nota informativa al pie con acceso directo a la Ficha Oficial */}
                <div className="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-center text-xs text-stone-600 dark:text-stone-400 no-print flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-center sm:text-left">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      ¿Deseas la ficha clínica completa, carnet de vacunas y contactos médicos de <strong>{profile.name}</strong>?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sheet')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
                  >
                    <span>Ir a la Ficha Técnica Oficial →</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VISTA ORGANIZADOR DE RUTINA Y HORARIOS */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <RoutineSchedule
              profile={profile}
              result={result}
            />
          </div>
        )}

        {/* VISTA 2: FICHA TÉCNICA Y REGISTRO DETALLADO */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            <PetTechSheet onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          </div>
        )}

        {/* VISTA 3: EXPEDIENTE MÉDICO Y EVOLUCIÓN */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            <MedicalHistory />
          </div>
        )}

        {/* VISTA 4: RECORDATORIOS DE MEDICACIÓN Y VACUNAS */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <RemindersModule />
          </div>
        )}

        {/* VISTA RECETAS: GENERADOR BARF & RECETAS CASERAS */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <BarfRecipeGenerator onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          </div>
        )}

        {/* VISTA 5: MARCAS POR PAÍS & GUÍA DE DIETA MIXTA */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            <CountryFoodAdvisor onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
          </div>
        )}

        {/* VISTA 6: GUÍA COMPLETA DE RAZAS Y MARCAS */}
        {activeTab === 'breeds' && (
          <div className="space-y-6">
            <BreedEncyclopedia
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
          </div>
        )}

        {/* VISTA 3: SEMÁFORO DE ALIMENTOS TÓXICOS Y SEGUROS */}
        {activeTab === 'foods' && (
          <FoodTrafficLight />
        )}

        {/* VISTA: TIPS, GUÍAS CLÍNICAS Y PRIMEROS AUXILIOS */}
        {activeTab === 'guides' && (
          <TipsAndGuidesModule />
        )}

      </main>
    </div>

      {/* Footer y Descargo de Responsabilidad */}
      <footer className="mt-auto border-t border-stone-200 bg-white/90 py-8 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 text-xs text-stone-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <NutriPetLogo size="sm" />
              <span>•</span>
              <span>Herramienta informativa y de orientación para el cuidado de mascotas en el hogar</span>
            </div>
            {user?.email?.toLowerCase() === 'dgcontrerasb@gmail.com' && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-stone-400">
                  Uso exclusivamente personal y orientativo
                </span>
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
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
            <strong>Aviso de exención de responsabilidad:</strong> Esta aplicación web es un recurso de consulta general y cálculo orientativo creado para amantes de las mascotas. La información, tablas y estimaciones aquí presentadas son solo de referencia general y <u>no constituyen asesoría médica, diagnóstico ni prescripción</u>. Cada perro o gato tiene necesidades individuales, condiciones preexistentes o alergias que requieren la valoración de un profesional de la salud animal. Ante cualquier duda, cambio de dieta o síntoma, consulta siempre a tu médico veterinario de confianza.
          </div>
        </div>
      </footer>

      {/* Modal para Compartir Ficha por WhatsApp o Copiar */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
        result={result}
        breedName={selectedBreedInfo?.name}
      />

      {/* Modal de Suscripción Mensual NutriPet Pro */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Modal Privado de Suscriptores y Métricas (Solo Propietario) */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      {/* Modal y Temporizador de Bloqueo de 60 Segundos para Invitados (3 Días Gratis Pro) */}
      <RegistrationLockModal />

      {/* Modal de Transición al Cerrar Sesión */}
      <LogoutTransitionModal isOpen={isLoggingOut} />

      {/* Banner Promocional desactivado para evitar colisión con la barra inferior */}

      {/* Botón Flotante para Volver Arriba */}
      <BackToTopButton />
    </div>
  );
}
