import React, { useState } from 'react';
import { PetProfile, CalculationResult, AppTab } from '../types';
import { POPULAR_BREEDS, getSuggestedIdealWeight } from '../data';
import {
  Scale,
  Sparkles,
  Droplets,
  Flame,
  Activity,
  FileText,
  ChevronRight,
  ShieldCheck,
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  Utensils
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { RadialHealthGauge } from './RadialHealthGauge';

interface Props {
  profile: PetProfile;
  result: CalculationResult;
  onSelectTab?: (tab: AppTab) => void;
  onEditBiometrics?: () => void;
  className?: string;
}

export const PetProfileHUD: React.FC<Props> = ({
  profile,
  result,
  onSelectTab,
  onEditBiometrics,
  className = ''
}) => {
  const isDog = profile.type === 'dog';
  const [hudDiet, setHudDiet] = useState<'kibble' | 'mixed' | 'barf'>(
    (profile.diet as any) === 'barf' ? 'barf' : (profile.diet as any) === 'mixed' ? 'mixed' : 'kibble'
  );

  // Información de Raza y Pesos Clínicos
  const selectedBreedInfo = POPULAR_BREEDS.find(b => b.id === profile.breedId);
  const breedDisplayName = selectedBreedInfo ? selectedBreedInfo.name : (profile.breedCustom || 'Raza Certificada');
  const suggestedIdeal = getSuggestedIdealWeight(profile);
  const targetWeight = Number((profile.idealWeightKg || suggestedIdeal || profile.weightKg || 1).toFixed(1));
  const currentWeight = Number((profile.weightKg || 0).toFixed(1));

  // Diferencia y Score de Salud Biométrico
  const weightDiff = Number((currentWeight - targetWeight).toFixed(1));
  const deviationRatio = targetWeight > 0 ? Math.abs(weightDiff) / targetWeight : 0;
  const healthScorePercentage = Math.round(Math.max(25, Math.min(100, (1 - deviationRatio) * 100)));

  // Gramajes oficiales limpios
  const safeKibble = result.kibbleDailyGrams;
  const safeBarf = result.barfBreakdown?.totalGrams || Math.round(safeKibble * 2.1);
  const mixedKibble = Math.round(safeKibble * 0.5);
  const mixedFresh = Math.round(safeBarf * 0.5);

  // Diagnóstico Clínico Dinámico
  const getConditionMeta = () => {
    if (weightDiff > targetWeight * 0.05) {
      return {
        text: `Sobrepeso (+${weightDiff} kg)`,
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
        barColor: 'bg-amber-500',
        scheme: 'amber' as const
      };
    }
    if (weightDiff < -(targetWeight * 0.05)) {
      return {
        text: `Bajo peso (${weightDiff} kg)`,
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
        barColor: 'bg-blue-500',
        scheme: 'blue' as const
      };
    }
    return {
      text: 'Peso Óptimo Saludable',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      barColor: 'bg-emerald-500',
      scheme: 'forest' as const
    };
  };

  const conditionMeta = getConditionMeta();

  return (
    <aside className={`w-full space-y-4 no-print select-none ${className}`}>
      <div className="bg-white/95 dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 transition-all">

        {/* 1. CABECERA: PASAPORTE CLÍNICO CON FOTO, STATUS Y MICROCHIP */}
        <div className="relative pb-4 border-b border-stone-100 dark:border-stone-800 flex items-start gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{isDog ? '🐶' : '🐱'}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
              ✓
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100 truncate leading-tight">
                {profile.name || 'Mi Mascota'}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                {isDog ? 'Canino' : 'Felino'}
              </span>
            </div>

            <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 truncate">
              {breedDisplayName}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 flex-wrap">
              <span className="inline-flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {profile.neutered ? 'Esterilizado' : 'Entero'}
              </span>
              <span>•</span>
              <span>{profile.ageMonths ? `${Math.floor(profile.ageMonths / 12)} años` : 'Adulto'}</span>
              <span>•</span>
              <span className="capitalize">
                {(() => {
                  const act = String(profile.activity || '').toLowerCase();
                  if (act === 'high' || act === 'active' || act === 'intense') return 'Muy Activo';
                  if (act === 'sedentary' || act === 'low' || act === 'calm') return 'Tranquilo';
                  return 'Moderado';
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. TERMÓMETRO VISUAL: CONDICIÓN CORPORAL & COMPARATIVA DE PESO */}
        <div className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Curva de Peso
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${conditionMeta.badge}`}>
              {conditionMeta.text}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 font-tabular">
                {currentWeight} <span className="text-xs font-normal text-stone-500">kg</span>
              </span>
              <span className="text-[10px] text-stone-400 block">Peso Actual</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-stone-700 dark:text-stone-300 font-tabular">
                {targetWeight} <span className="text-[10px] font-normal text-stone-500">kg</span>
              </span>
              <span className="text-[10px] text-stone-400 block">Peso Objetivo Ideal</span>
            </div>
          </div>

          {/* Barra Visual Proporcional */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden relative">
              <div 
                className={`h-full ${conditionMeta.barColor} rounded-full transition-all duration-500`}
                style={{ width: `${healthScorePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-stone-400 font-mono">
              <span>Bajo peso</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Rango FEDIAF</span>
              <span>Sobrepeso</span>
            </div>
          </div>
        </div>

        {/* 3. DOSIS NUTRICIONAL DIARIA CON TABS TRIPARTITAS INTERACTIVAS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Ración Diaria Oficial
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              {result.mealsPerDay} tomas al día
            </span>
          </div>

          {/* Selector de 3 Opciones dentro del HUD */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setHudDiet('kibble')}
              className={`py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
                hudDiet === 'kibble'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              🥣 Croquetas
            </button>
            <button
              type="button"
              onClick={() => setHudDiet('mixed')}
              className={`py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
                hudDiet === 'mixed'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              🥩 Mixta
            </button>
            <button
              type="button"
              onClick={() => setHudDiet('barf')}
              className={`py-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
                hudDiet === 'barf'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              🥗 BARF
            </button>
          </div>

          {/* Tarjeta de Ración Activa */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-1.5 animate-fade-in">
            {hudDiet === 'kibble' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    100% Croquetas Secas
                  </span>
                  <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-tabular">
                    <AnimatedCounter value={safeKibble} /> <span className="text-xs font-normal text-stone-500 font-sans">g / día</span>
                  </span>
                </div>
                <div className="text-right text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {result.mealsPerDay} tomas de {result.gramsPerMeal}g
                </div>
              </div>
            )}

            {hudDiet === 'mixed' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                  Combinación Balanceada 50 / 50
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="p-1.5 rounded-lg bg-white/80 dark:bg-stone-900/80 text-center">
                    <span className="text-[9px] text-stone-500 block uppercase font-bold">🥣 Croquetas</span>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-300 font-tabular">
                      {mixedKibble} g/d
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/80 dark:bg-stone-900/80 text-center">
                    <span className="text-[9px] text-stone-500 block uppercase font-bold">🥩 Comida Real</span>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-300 font-tabular">
                      {mixedFresh} g/d
                    </span>
                  </div>
                </div>
              </div>
            )}

            {hudDiet === 'barf' && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 block">
                    100% Dieta Biológica Natural
                  </span>
                  <span className="text-2xl font-black text-amber-950 dark:text-amber-100 font-tabular">
                    <AnimatedCounter value={safeBarf} /> <span className="text-xs font-normal text-stone-500 font-sans">g / día</span>
                  </span>
                </div>
                <div className="text-right text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  {result.barfBreakdown?.percentage || 2.5}% peso corporal
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. BALANZA METABÓLICA: CALORÍAS RER/MER Y AGUA CLÍNICA */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
          <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-stone-500 mb-0.5">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Gasto (MER)</span>
            </div>
            <span className="text-base font-black text-stone-900 dark:text-stone-100 font-tabular">
              {result.mer} <span className="text-[10px] font-normal text-stone-400">kcal/d</span>
            </span>
            <span className="text-[9px] text-stone-400 block mt-0.5">Base RER: {result.rer} kcal</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-stone-500 mb-0.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>Agua Diaria</span>
            </div>
            <span className="text-base font-black text-stone-900 dark:text-stone-100 font-tabular">
              {result.waterDailyMl.min}-{result.waterDailyMl.max} <span className="text-[10px] font-normal text-stone-400">ml</span>
            </span>
            <span className="text-[9px] text-stone-400 block mt-0.5">50-60 ml/kg/día</span>
          </div>
        </div>

        {/* 5. GAUGE CIRCULAR RADIAL DE SALUD INTEGRAL */}
        <RadialHealthGauge 
          value={healthScorePercentage}
          label="Índice Biométrico"
          sublabel={`${currentWeight} / ${targetWeight} kg`}
          statusText={conditionMeta.text}
          colorScheme={conditionMeta.scheme}
        />

        {/* 6. BOTONES DE ACCIÓN RÁPIDA (CONEXIÓN INMEDIATA) */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2">
          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('calculator')}
              className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ajustar Peso</span>
            </button>
          )}

          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab('sheet')}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
              <span>Ver Ficha QR</span>
            </button>
          )}
        </div>

      </div>
    </aside>
  );
};