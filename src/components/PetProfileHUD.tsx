import React, { useState } from 'react';
import { 
  Scale, 
  Flame, 
  Droplets, 
  Edit3, 
  FileText, 
  Printer, 
  ChevronDown, 
  Award, 
  Activity,
  Heart
} from 'lucide-react';
import { PetProfile, CalculationResult, AppTab } from '../types';
import { POPULAR_BREEDS, getSuggestedIdealWeight } from '../data';
import { AnimatedCounter } from './AnimatedCounter';

interface PetProfileHUDProps {
  profile: PetProfile;
  result: CalculationResult;
  onEditBiometrics?: () => void;
  onSelectTab?: (tab: AppTab) => void;
  onOpenExportModal?: () => void;
  className?: string;
}

export const PetProfileHUD: React.FC<PetProfileHUDProps> = ({
  profile,
  result,
  onEditBiometrics,
  onSelectTab,
  onOpenExportModal,
  className = ''
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const selectedBreedInfo = POPULAR_BREEDS.find(b => b.id === profile.breedId);
  const breedDisplayName = selectedBreedInfo ? selectedBreedInfo.name : (profile.breedCustom || 'Raza / Contextura');
  const suggestedIdeal = getSuggestedIdealWeight(profile);
  const targetWeight = profile.idealWeightKg || suggestedIdeal || profile.weightKg;

  // Cálculo del porcentaje del peso relativo al objetivo
  const weightProgress = Math.min(Math.max((profile.weightKg / targetWeight) * 100, 40), 160);

  const getConditionLabel = () => {
    switch (profile.condition) {
      case 'overweight':
        return { text: 'Sobrepeso registrado', color: 'text-amber-800 dark:text-amber-300' };
      case 'underweight':
        return { text: 'Bajo peso registrado', color: 'text-blue-800 dark:text-blue-300' };
      default:
        return { text: 'Condición Ideal Óptima', color: 'text-[#143826] dark:text-emerald-300' };
    }
  };

  const conditionMeta = getConditionLabel();

  return (
    <aside className={`w-full space-y-4 no-print select-none ${className}`}>
      {/* Contenedor HUD estilo Papel Alabastro y Bosque Profundo */}
      <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 shadow-bento transition-all">
        
        {/* Cabecera del Paciente HUD */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{profile.type === 'dog' ? '🐶' : '🐱'}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <h2 className="font-editorial text-xl sm:text-2xl font-medium text-stone-900 dark:text-stone-100 truncate">
                  {profile.name || 'Mi Mascota'}
                </h2>
              </div>

              {/* Zero-Pill Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                <span className="font-medium text-stone-700 dark:text-stone-300 truncate max-w-[140px]">
                  {breedDisplayName}
                </span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span>{profile.type === 'dog' ? 'Canino' : 'Felino'}</span>
              </div>
            </div>
          </div>

          {/* Toggle móvil para colapsar en pantallas pequeñas */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(prev => !prev)}
            className="lg:hidden p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer shrink-0"
            aria-label="Expandir datos de paciente"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Cuerpo del HUD (Siempre visible en LG, colapsable en móvil) */}
        <div className={`space-y-4 pt-4 ${isMobileExpanded ? 'block' : 'hidden lg:block'}`}>
          
          {/* Indicador Táctil de Peso y Progreso */}
          <div className="p-3.5 rounded-xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#143826] dark:text-emerald-400" />
                Métrica de Peso
              </span>
              <span className={`font-semibold text-xs ${conditionMeta.color}`}>
                {conditionMeta.text}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-tabular">
                {profile.weightKg} <span className="text-xs font-normal text-stone-500">kg</span>
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-tabular">
                Objetivo: <strong className="text-stone-800 dark:text-stone-200 font-semibold">{targetWeight} kg</strong>
              </span>
            </div>

            {/* Barra Visual de Estado */}
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden relative">
              <div 
                className="h-full bg-[#143826] dark:bg-[#3f6e58] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(weightProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* Tarjeta de Ración Diaria Recomendada */}
          <div className="p-3.5 rounded-xl bg-[#143826]/5 dark:bg-[#143826]/30 border border-[#143826]/15 dark:border-[#143826]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#143826] dark:text-emerald-300 font-medium">
                Ración Diaria Sugerida
              </span>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase">
                {profile.diet === 'kibble' ? 'Croquetas' : 'BARF Fresco'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#143826] dark:text-emerald-200 font-tabular">
                <AnimatedCounter 
                  value={profile.diet === 'kibble' ? result.kibbleDailyGrams : (result.barfBreakdown?.totalGrams || 0)} 
                /> <span className="text-xs font-normal text-[#143826]/80 dark:text-emerald-300 font-sans">g / día</span>
              </span>
              <span className="text-xs text-[#143826]/90 dark:text-emerald-300 font-tabular font-medium">
                {result.mealsPerDay} tomas de {result.gramsPerMeal}g
              </span>
            </div>
          </div>

          {/* Desglose Métrico de Calorías & Agua */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-0.5">
                Calorías (MER)
              </span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-tabular">
                {result.mer} <span className="text-[10px] text-stone-500 font-normal">kcal</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-0.5">
                Meta de Agua
              </span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-tabular">
                {result.waterDailyMl.min}-{result.waterDailyMl.max} <span className="text-[10px] text-stone-500 font-normal">ml</span>
              </span>
            </div>
          </div>

          {/* Acciones Directas del Paciente */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2">
            {onEditBiometrics && (
              <button
                type="button"
                onClick={onEditBiometrics}
                className="py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#143826] dark:text-emerald-400" />
                <span>Biométricos</span>
              </button>
            )}

            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('sheet')}
                className="py-2 px-3 rounded-xl bg-[#143826] hover:bg-[#1c4d34] dark:bg-[#3f6e58] dark:hover:bg-[#4d856b] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ver Ficha</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
