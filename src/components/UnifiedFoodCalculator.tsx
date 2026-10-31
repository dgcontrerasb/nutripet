import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Activity,
  Calendar,
  CheckCircle2,
  Droplets,
  Beef,
  Package,
  SlidersHorizontal,
  ChevronRight,
  Scale
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface Props {
  dailyGrams?: number;
  kibbleDailyGrams?: number;
  barfDailyGrams?: number;
  petName: string;
  petType?: 'dog' | 'cat';
  selectedDiet?: 'kibble' | 'mixed' | 'barf';
  onDietChange?: (diet: 'kibble' | 'mixed' | 'barf') => void;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  flag: string;
  defaultKibblePrice: number;
  defaultFreshPricePerKg: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  COP: { code: 'COP', symbol: '$', flag: '🇨🇴', defaultKibblePrice: 180000, defaultFreshPricePerKg: 12000 },
  USD: { code: 'USD', symbol: '$', flag: '🇺🇸', defaultKibblePrice: 45, defaultFreshPricePerKg: 6 },
  MXN: { code: 'MXN', symbol: '$', flag: '🇲🇽', defaultKibblePrice: 850, defaultFreshPricePerKg: 95 },
  EUR: { code: 'EUR', symbol: '€', flag: '🇪🇺', defaultKibblePrice: 42, defaultFreshPricePerKg: 5.5 },
  ARS: { code: 'ARS', symbol: '$', flag: '🇦🇷', defaultKibblePrice: 45000, defaultFreshPricePerKg: 4800 },
  CLP: { code: 'CLP', symbol: '$', flag: '🇨🇱', defaultKibblePrice: 42000, defaultFreshPricePerKg: 4500 },
  PEN: { code: 'PEN', symbol: 'S/', flag: '🇵🇪', defaultKibblePrice: 160, defaultFreshPricePerKg: 18 },
};

export const UnifiedFoodCalculator: React.FC<Props> = ({
  dailyGrams,
  kibbleDailyGrams,
  barfDailyGrams,
  petName,
  selectedDiet = 'kibble',
  onDietChange
}) => {
  const [activeView, setActiveView] = useState<'report' | 'settings'>('report');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('COP');
  const curr = CURRENCIES[selectedCurrency] || CURRENCIES.COP;

  // Dieta activa
  const [currentDiet, setCurrentDiet] = useState<'kibble' | 'mixed' | 'barf'>(selectedDiet);

  useEffect(() => {
    if (selectedDiet) {
      setCurrentDiet(selectedDiet);
    }
  }, [selectedDiet]);

  // Factor de actividad clínica que sí altera el cálculo calórico
  const [activityFactor, setActivityFactor] = useState<'calm' | 'moderate' | 'active'>('moderate');

  // Parámetros de compra editables (no asume 15 kg fijos)
  const [bagWeightKg, setBagWeightKg] = useState<number>(15);
  const [bagPrice, setBagPrice] = useState<number>(curr.defaultKibblePrice);
  const [freshPriceKg, setFreshPriceKg] = useState<number>(curr.defaultFreshPricePerKg);
  const [freshBatchKg, setFreshBatchKg] = useState<number>(10);

  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrency(newCode);
    const target = CURRENCIES[newCode];
    if (target) {
      setBagPrice(target.defaultKibblePrice);
      setFreshPriceKg(target.defaultFreshPricePerKg);
    }
  };

  // Cálculo reactivo según la actividad física seleccionada (FEDIAF Factor)
  const multiplier = useMemo(() => {
    if (activityFactor === 'calm') return 0.88; // Sedentario / Castrado de baja actividad
    if (activityFactor === 'active') return 1.15; // Muy activo / Trabajo
    return 1.0; // Moderado estándar
  }, [activityFactor]);

  const baseKibble = Math.max(1, Number(kibbleDailyGrams || dailyGrams || 178));
  const baseBarf = Math.max(1, Number(barfDailyGrams || Math.round(baseKibble * 2.1)));

  // Gramajes recalculados en tiempo real por el factor de actividad
  const calculatedKibbleGrams = Math.round(baseKibble * multiplier);
  const calculatedBarfGrams = Math.round(baseBarf * multiplier);

  // Raciones para Dieta Mixta (50/50 exacto)
  const mixedKibbleGrams = Math.round(calculatedKibbleGrams * 0.5);
  const mixedFreshGrams = Math.round(calculatedBarfGrams * 0.5);

  const activeDailyKibble = currentDiet === 'kibble' ? calculatedKibbleGrams : currentDiet === 'mixed' ? mixedKibbleGrams : 0;
  const activeDailyFresh = currentDiet === 'barf' ? calculatedBarfGrams : currentDiet === 'mixed' ? mixedFreshGrams : 0;

  // Cálculos de rendimiento de compra
  let durationDaysInt = 0;
  let durationMonths = 0;
  let costPerDay = 0;
  let monthlyBudget = 0;

  if (currentDiet === 'kibble') {
    const totalGramsInBag = Math.max(1, bagWeightKg) * 1000;
    durationDaysInt = Math.max(1, Math.floor(totalGramsInBag / activeDailyKibble));
    durationMonths = Number((durationDaysInt / 30.4).toFixed(1));
    costPerDay = Number((bagPrice / durationDaysInt).toFixed(2));
    monthlyBudget = Number((costPerDay * 30.4).toFixed(2));
  } else if (currentDiet === 'mixed') {
    const totalGramsInBag = Math.max(1, bagWeightKg) * 1000;
    durationDaysInt = Math.max(1, Math.floor(totalGramsInBag / activeDailyKibble));
    durationMonths = Number((durationDaysInt / 30.4).toFixed(1));

    const kibbleCostDay = bagPrice / durationDaysInt;
    const freshCostDay = (activeDailyFresh / 1000) * freshPriceKg;

    costPerDay = Number((kibbleCostDay + freshCostDay).toFixed(2));
    monthlyBudget = Number((costPerDay * 30.4).toFixed(2));
  } else {
    // 100% BARF
    const totalFreshGrams = Math.max(1, freshBatchKg) * 1000;
    durationDaysInt = Math.max(1, Math.floor(totalFreshGrams / activeDailyFresh));
    durationMonths = Number((durationDaysInt / 30.4).toFixed(1));

    costPerDay = Number(((activeDailyFresh / 1000) * freshPriceKg).toFixed(2));
    monthlyBudget = Number((costPerDay * 30.4).toFixed(2));
  }

  const today = new Date();
  const finishDate = new Date();
  finishDate.setDate(today.getDate() + durationDaysInt);

  const formattedFinishDate = finishDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleDietSelect = (diet: 'kibble' | 'mixed' | 'barf') => {
    setCurrentDiet(diet);
    if (typeof onDietChange === 'function') {
      onDietChange(diet);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 transition-all">

      {/* Cabecera sin textos cortados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-extrabold text-sm text-stone-900 dark:text-stone-100 leading-tight">
              Diagnóstico Nutricional
            </h3>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
              Rendimiento y costo de comida para {petName}
            </p>
          </div>
        </div>

        {/* Selector de Moneda */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 shrink-0">
          <span className="text-sm select-none" aria-hidden="true">{curr.flag}</span>
          <span className="text-[10px] font-bold text-stone-500 uppercase">Moneda:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="bg-transparent text-[11px] font-extrabold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <option key={code} value={code} className="text-stone-800 dark:text-stone-900 font-bold">
                {c.flag} {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selector de Esquema de Alimentación */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl text-[11px] font-bold">
        <button
          type="button"
          onClick={() => handleDietSelect('kibble')}
          className={`py-2 px-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
            currentDiet === 'kibble'
              ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-2xs font-extrabold border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          🥣 Croquetas
        </button>
        <button
          type="button"
          onClick={() => handleDietSelect('mixed')}
          className={`py-2 px-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
            currentDiet === 'mixed'
              ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-2xs font-extrabold border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          🥩 Dieta Mixta
        </button>
        <button
          type="button"
          onClick={() => handleDietSelect('barf')}
          className={`py-2 px-1.5 rounded-lg transition-all text-center truncate cursor-pointer ${
            currentDiet === 'barf'
              ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-2xs font-extrabold border border-stone-200/80 dark:border-stone-700'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          🥗 100% BARF
        </button>
      </div>
{/* VISTA 1: REPORTE PRINCIPAL */}
      {activeView === 'report' ? (
        <div className="space-y-2.5 sm:space-y-3.5 animate-fade-in">

          {/* Ración Diaria: 100% Croquetas */}
          {currentDiet === 'kibble' && (
            <div className="py-2.5 px-3 sm:p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Ración Diaria Total</span>
                <div className="text-lg sm:text-2xl font-black text-emerald-950 dark:text-emerald-200 font-tabular leading-tight">
                  <AnimatedCounter value={activeDailyKibble} /> <span className="text-[11px] sm:text-xs font-normal text-stone-500 font-sans">g / día (2 tomas de {Math.round(activeDailyKibble / 2)}g)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] text-stone-400 block">Saco comprado</span>
                <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">{bagWeightKg} kg</span>
              </div>
            </div>
          )}

          {/* Ración Diaria: Dieta Mixta Compacta (Ahorro del 50% de alto en móvil) */}
          {currentDiet === 'mixed' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="py-2 px-2.5 sm:p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 text-center flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase tracking-tight">🥣 Croquetas (50%)</span>
                <div className="my-0.5 leading-none">
                  <span className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100 font-tabular">
                    <AnimatedCounter value={activeDailyKibble} />
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-600 dark:text-stone-300 ml-1">
                    g / día
                  </span>
                </div>
                <span className="text-[8.5px] sm:text-[9px] text-stone-500 leading-none">Pienso seco</span>
              </div>

              <div className="py-2 px-2.5 sm:p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 text-center flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase tracking-tight">🥩 Carne Fresca (50%)</span>
                <div className="my-0.5 leading-none">
                  <span className="text-base sm:text-xl font-black text-stone-900 dark:text-stone-100 font-tabular">
                    <AnimatedCounter value={activeDailyFresh} />
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-stone-600 dark:text-stone-300 ml-1">
                    g / día
                  </span>
                </div>
                <span className="text-[8.5px] sm:text-[9px] text-stone-500 leading-none">Comida natural</span>
              </div>
            </div>
          )}

          {/* Ración Diaria: 100% BARF */}
          {currentDiet === 'barf' && (
            <div className="py-2.5 px-3 sm:p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">Ración Diaria Fresca</span>
                <div className="text-lg sm:text-2xl font-black text-amber-950 dark:text-emerald-200 font-tabular leading-tight">
                  <AnimatedCounter value={activeDailyFresh} /> <span className="text-[11px] sm:text-xs font-normal text-stone-500 font-sans">g / día (2 tomas de {Math.round(activeDailyFresh / 2)}g)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] text-stone-400 block">Lote preparado</span>
                <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">{freshBatchKg} kg</span>
              </div>
            </div>
          )}

          {/* Selector Rápido del Tamaño de Saco Real */}
          {currentDiet !== 'barf' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-stone-400 font-semibold shrink-0">Tu saco:</span>
              {[3, 8, 12, 15, 18, 20].map((kg) => (
                <button
                  key={kg}
                  type="button"
                  onClick={() => setBagWeightKg(kg)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                    bagWeightKg === kg
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {kg} kg
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-stone-400 font-semibold shrink-0">Tu lote:</span>
              {[2, 5, 10, 15, 20].map((kg) => (
                <button
                  key={kg}
                  type="button"
                  onClick={() => setFreshBatchKg(kg)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                    freshBatchKg === kg
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {kg} kg
                </button>
              ))}
            </div>
          )}

          {/* Tarjetas de Presupuesto */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 text-center">
              <span className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5">Duración</span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-tabular block leading-tight">
                <AnimatedCounter value={durationDaysInt} /> días
              </span>
              <span className="text-[9px] text-stone-400">~{durationMonths} meses</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 text-center">
              <span className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5">Costo Diario</span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-tabular block leading-tight">
                {curr.symbol}<AnimatedCounter value={Math.round(costPerDay)} />
              </span>
              <span className="text-[9px] text-stone-400">Gasto real</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 text-center">
              <span className="text-[9px] font-mono uppercase text-stone-500 block mb-0.5">Presupuesto Mes</span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-tabular block leading-tight">
                {curr.symbol}<AnimatedCounter value={Math.round(monthlyBudget)} />
              </span>
              <span className="text-[9px] text-stone-400">30.4 días</span>
            </div>
          </div>

          {/* Fecha Estimada */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {currentDiet === 'barf' ? `El lote de ${freshBatchKg}kg` : `El saco de ${bagWeightKg}kg`} se terminará aprox. el <strong>{formattedFinishDate}</strong>.
            </span>
          </div>

          {/* BOTÓN EVIDENTE PARA EDITAR DATOS Y ACTIVIDAD */}
          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className="w-full py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ajustar Actividad Física y Precios de Compra</span>
          </button>
        </div>
      ) : (

        /* VISTA 2: PANEL DE AJUSTES CLÍNICOS Y PRECIOS */
        <div className="space-y-4 animate-fade-in">
          {/* Actividad Física que sí cambia los gramos */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Nivel de Actividad Diaria de {petName}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivityFactor('calm')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activityFactor === 'calm'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="text-sm mb-0.5">🛋️</div>
                <div className="text-xs font-bold">Sedentario</div>
                <div className="text-[9px] text-stone-400">-12% calorías</div>
              </button>

              <button
                type="button"
                onClick={() => setActivityFactor('moderate')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activityFactor === 'moderate'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="text-sm mb-0.5">🐕</div>
                <div className="text-xs font-bold">Moderado</div>
                <div className="text-[9px] text-stone-400">Ración normal</div>
              </button>

              <button
                type="button"
                onClick={() => setActivityFactor('active')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  activityFactor === 'active'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="text-sm mb-0.5">⚡</div>
                <div className="text-xs font-bold">Muy Activo</div>
                <div className="text-[9px] text-stone-400">+15% calorías</div>
              </button>
            </div>
          </div>

          {/* Precios de Compra */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Precio Saco Croquetas ({curr.code})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">{curr.symbol}</span>
                <input
                  type="number"
                  value={bagPrice || ''}
                  onChange={(e) => setBagPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-stone-200 font-bold text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Precio x Kilo Carne Fresca ({curr.code})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">{curr.symbol}</span>
                <input
                  type="number"
                  value={freshPriceKg || ''}
                  onChange={(e) => setFreshPriceKg(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-stone-200 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('report')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplicar Cambios y Ver Reporte</span>
          </button>
        </div>
      )}

      {/* Explicación Didáctica al pie */}
      <div className="p-3 rounded-xl bg-stone-50/90 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
        <Droplets className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px]">
          <strong>¿Por qué varían los gramos?</strong> Las croquetas contienen <strong>8–10% de agua</strong> (energía deshidratada), mientras que la comida natural tiene <strong>70–75% de agua biológica</strong>[cite: 10]. Por eso el plato fresco pesa más para aportar la misma energía[cite: 10].
        </p>
      </div>

    </div>
  );
};