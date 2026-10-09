import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Camera, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Award, 
  MessageCircle, 
  FileText 
} from 'lucide-react';
import { PetProfile, CalculationResult, BreedInfo, AppTab } from '../types';
import { POPULAR_BREEDS } from '../data';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { UnifiedFoodCalculator } from '../components/UnifiedFoodCalculator';
import { FoodTransitionGuide } from '../components/FoodTransitionGuide';

interface CalculatorViewProps {
  profile: PetProfile;
  setProfile: (updater: React.SetStateAction<PetProfile> | ((prev: PetProfile) => PetProfile)) => void;
  activePet: any;
  result: CalculationResult;
  selectedBreedInfo?: BreedInfo;
  availableBreeds: BreedInfo[];
  setActiveTab: (tab: AppTab) => void;
  setShowShareModal: (show: boolean) => void;
  isSavingPet: boolean;
  savePet: (pet: PetProfile) => Promise<void>;
  user: any;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  profile,
  setProfile,
  activePet,
  result,
  selectedBreedInfo,
  availableBreeds,
  setActiveTab,
  setShowShareModal,
  isSavingPet,
  savePet,
  user,
}) => {
  const [isBiometricsExpanded, setIsBiometricsExpanded] = useState<boolean>(() => !activePet);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProfileEmpty = activePet == null;

  useEffect(() => {
    if (activePet) {
      setIsBiometricsExpanded(false);
    }
  }, [activePet?.id]);

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

  return (
    <div className="space-y-8">
      {/* Banner Superior */}
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

      {/* Formulario y Ficha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Panel Izquierdo */}
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
              <div 
                onClick={() => setIsBiometricsExpanded(true)}
                className="p-4 rounded-2xl bg-stone-50/90 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-755 flex items-center justify-between gap-3 animate-fade-in cursor-pointer hover:bg-stone-100/90 dark:hover:bg-stone-800 transition-colors"
              >
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
                <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold select-none">
                  Toca para ver o editar →
                </span>
              </div>
            ) : (
              <>
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
                      <span className="text-xl">🐶</span>
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
                      <span className="text-xl">🐱</span>
                      <span>Gato</span>
                    </button>
                  </div>
                </div>

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

                <div className="p-4 bg-stone-50/80 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-750 space-y-2.5">
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

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (isProfileEmpty || !activePet) return;
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

        {/* Panel Derecho */}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-stone-100 dark:border-stone-800 gap-4">
              <div className="flex items-center gap-4">
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
                        <span className={`font-bold text-xs px-2.5 py-1 rounded-lg w-fit ${
                          tier.tier.includes('Súper Premium')
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        }`}>
                          {tier.tier}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {tier.brands.map((brand, bIdx) => (
                            <span key={bIdx} className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs">
                              {brand}
                            </span>
                          ))}
                        </div>

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

          <div className="no-print">
            <UnifiedFoodCalculator
              dailyGrams={profile.diet === 'kibble' ? result.kibbleDailyGrams : (result.barfBreakdown?.totalGrams || 500)}
              petName={profile.name}
              petType={profile.type}
            />
          </div>

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

          <div className="no-print">
            <FoodTransitionGuide
              petName={profile.name}
              petType={profile.type}
            />
          </div>

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
  );
};