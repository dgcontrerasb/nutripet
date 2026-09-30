import React, { useState, useEffect, useMemo } from 'react';
import { Package, DollarSign, Calendar, TrendingUp, ChevronDown, Coins, Sparkles, ShoppingBag, Droplets, Info } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface UnifiedFoodCalculatorProps {
  dailyGrams: number;
  petName: string;
  petType: 'dog' | 'cat';
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  defaultBagPrice: { dog: number; cat: number };
  defaultMeatPerKgPrice: number;
}

export const LATAM_CURRENCIES: CurrencyOption[] = [
  { code: 'COP', name: 'Peso colombiano (Colombia)', symbol: '$', flag: '🇨🇴', defaultBagPrice: { dog: 180000, cat: 85000 }, defaultMeatPerKgPrice: 16000 },
  { code: 'USD', name: 'Dólar estadounidense (USD / Ecuador / Panamá)', symbol: '$', flag: '🇺🇸', defaultBagPrice: { dog: 45, cat: 22 }, defaultMeatPerKgPrice: 6 },
  { code: 'MXN', name: 'Peso mexicano (México)', symbol: '$', flag: '🇲🇽', defaultBagPrice: { dog: 850, cat: 420 }, defaultMeatPerKgPrice: 110 },
  { code: 'ARS', name: 'Peso argentino (Argentina)', symbol: '$', flag: '🇦🇷', defaultBagPrice: { dog: 45000, cat: 22000 }, defaultMeatPerKgPrice: 5500 },
  { code: 'CLP', name: 'Peso chileno (Chile)', symbol: '$', flag: '🇨🇱', defaultBagPrice: { dog: 42000, cat: 20000 }, defaultMeatPerKgPrice: 5000 },
  { code: 'PEN', name: 'Sol peruano (Perú)', symbol: 'S/', flag: '🇵🇪', defaultBagPrice: { dog: 160, cat: 80 }, defaultMeatPerKgPrice: 20 },
  { code: 'BRL', name: 'Real brasileño (Brasil)', symbol: 'R$', flag: '🇧🇷', defaultBagPrice: { dog: 220, cat: 110 }, defaultMeatPerKgPrice: 25 },
  { code: 'UYU', name: 'Peso uruguayo (Uruguay)', symbol: '$', flag: '🇺🇾', defaultBagPrice: { dog: 1800, cat: 900 }, defaultMeatPerKgPrice: 380 },
  { code: 'EUR', name: 'Euro (España / Europa)', symbol: '€', flag: '🇪🇸', defaultBagPrice: { dog: 42, cat: 20 }, defaultMeatPerKgPrice: 5.5 },
];

// Helper para detectar moneda sugerida según zona horaria del dispositivo
const detectDefaultCurrency = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Bogota') || tz.includes('Colombia')) return 'COP';
    if (tz.includes('Mexico')) return 'MXN';
    if (tz.includes('Buenos_Aires') || tz.includes('Argentina')) return 'ARS';
    if (tz.includes('Santiago') || tz.includes('Chile')) return 'CLP';
    if (tz.includes('Lima') || tz.includes('Peru')) return 'PEN';
    if (tz.includes('Montevideo')) return 'UYU';
    if (tz.includes('Madrid') || tz.includes('Spain')) return 'EUR';
  } catch (e) {
    // ignore
  }
  return 'COP'; // Default Colombia por defecto
};

export const UnifiedFoodCalculator: React.FC<UnifiedFoodCalculatorProps> = ({
  dailyGrams: initialDailyGrams,
  petName,
  petType,
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(() => detectDefaultCurrency());
  
  const activeCurrency = LATAM_CURRENCIES.find((c) => c.code === selectedCurrencyCode) || LATAM_CURRENCIES[0];

  const [bagWeightKg, setBagWeightKg] = useState<number | ''>(petType === 'dog' ? 15 : 3);
  const [bagPrice, setBagPrice] = useState<number | ''>(activeCurrency.defaultBagPrice[petType]);
  const [customDailyGrams, setCustomDailyGrams] = useState<number | ''>(initialDailyGrams || 150);
  const [freshCostPerKg, setFreshCostPerKg] = useState<number | ''>(activeCurrency.defaultMeatPerKgPrice);
  const [dietMode, setDietMode] = useState<'100_kibble' | 'mixed_60_40' | '100_barf'>('100_kibble');

  // Sincronizar reajustes cuando cambia la especie (petType)
  useEffect(() => {
    setBagWeightKg(petType === 'dog' ? 15 : 3);
    setBagPrice(activeCurrency.defaultBagPrice[petType]);
    setFreshCostPerKg(activeCurrency.defaultMeatPerKgPrice);
  }, [petType, activeCurrency]);

  // Sincronizar ración diaria automáticamente cuando cambia la mascota activa en la calculadora principal
  useEffect(() => {
    if (initialDailyGrams > 0) {
      setCustomDailyGrams(initialDailyGrams);
    }
  }, [initialDailyGrams]);

  // Al cambiar la moneda, adaptar precios sugeridos
  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrencyCode(newCode);
    const target = LATAM_CURRENCIES.find((c) => c.code === newCode);
    if (target) {
      setBagPrice(target.defaultBagPrice[petType]);
      setFreshCostPerKg(target.defaultMeatPerKgPrice);
    }
  };

  // Cálculos matemáticos unificados memoizados
  const calculations = useMemo(() => {
    const numericDailyGrams = typeof customDailyGrams === 'number' ? customDailyGrams : 0;
    const numericBagWeight = typeof bagWeightKg === 'number' ? bagWeightKg : 0;
    const numericBagPrice = typeof bagPrice === 'number' ? bagPrice : 0;
    const numericFreshCostPerKg = typeof freshCostPerKg === 'number' ? freshCostPerKg : 0;

    const effectiveDailyGrams = Math.max(1, numericDailyGrams);
    const bagTotalGrams = Math.max(0, numericBagWeight) * 1000;

    let kibbleGramsDaily = effectiveDailyGrams;
    let freshGramsDaily = 0;

    if (dietMode === 'mixed_60_40') {
      kibbleGramsDaily = Math.round(effectiveDailyGrams * 0.6);
      freshGramsDaily = Math.round(effectiveDailyGrams * 0.4 * 2.0); // factor 2.0 por humedad
    } else if (dietMode === '100_barf') {
      kibbleGramsDaily = 0;
      freshGramsDaily = effectiveDailyGrams;
    }

    const totalPlateGrams = kibbleGramsDaily + freshGramsDaily;

    // Días de duración del saco de croquetas
    const daysDuration = kibbleGramsDaily > 0 && bagTotalGrams > 0
      ? Math.max(1, Math.floor(bagTotalGrams / kibbleGramsDaily)) 
      : 0;
    const monthsDuration = daysDuration > 0 ? (daysDuration / 30.4).toFixed(1) : '0';

    // Costo por gramo
    const pricePerKibbleGram = bagTotalGrams > 0 ? numericBagPrice / bagTotalGrams : 0;
    const pricePerFreshGram = numericFreshCostPerKg / 1000;

    const dailyKibbleCost = kibbleGramsDaily * pricePerKibbleGram;
    const dailyFreshCost = freshGramsDaily * pricePerFreshGram;
    const totalDailyCost = dailyKibbleCost + dailyFreshCost;

    const monthlyCost = Math.round(totalDailyCost * 30.4);
    const annualCost = Math.round(totalDailyCost * 365);

    // Fecha estimada de fin del saco
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + (daysDuration || 0));
    const formattedFinishDate = finishDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      effectiveDailyGrams,
      bagTotalGrams,
      kibbleGramsDaily,
      freshGramsDaily,
      totalPlateGrams,
      daysDuration,
      monthsDuration,
      totalDailyCost,
      monthlyCost,
      annualCost,
      formattedFinishDate,
    };
  }, [customDailyGrams, bagWeightKg, bagPrice, freshCostPerKg, dietMode]);

  const {
    effectiveDailyGrams,
    kibbleGramsDaily,
    freshGramsDaily,
    totalPlateGrams,
    daysDuration,
    monthsDuration,
    totalDailyCost,
    monthlyCost,
    annualCost,
    formattedFinishDate,
  } = calculations;

  const formatMoney = (amount: number) => {
    if (amount === 0) return '0';
    if (amount >= 1000) {
      return Math.round(amount).toLocaleString('es-ES');
    }
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const popularBagSizes = petType === 'dog' 
    ? [3, 8, 12, 15, 18, 20] 
    : [1.5, 3, 7, 10];

  return (
    <div className="bg-white dark:bg-stone-900 border-2 border-emerald-500/20 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 transition-all">
      
      {/* Cabecera Unificada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-lg">
              Calculadora Unificada de Rendimiento & Presupuesto
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Duración del saco, costo diario y presupuesto mensual para {petName || 'tu mascota'}
            </p>
          </div>
        </div>

        {/* Selector de Moneda Sincronizada */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Moneda:</span>
          <div className="relative">
            <select
              value={selectedCurrencyCode}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {LATAM_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Selector de Tipo de Alimentación */}
      <div className="flex rounded-2xl bg-stone-100 dark:bg-stone-800 p-1 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setDietMode('100_kibble')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
            dietMode === '100_kibble'
              ? 'bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-300 shadow-2xs font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          🥣 100% Croquetas
        </button>

        <button
          type="button"
          onClick={() => setDietMode('mixed_60_40')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1 ${
            dietMode === 'mixed_60_40'
              ? 'bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300 shadow-2xs font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <span>🥩 Dieta Mixta</span>
          <InfoTooltip text="La comida fresca contiene ~75% de agua celular, por lo que requiere el doble de peso en gramos que la croqueta seca (8-10% agua) para aportar la misma energía calórica." />
        </button>

        <button
          type="button"
          onClick={() => setDietMode('100_barf')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1 ${
            dietMode === '100_barf'
              ? 'bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-300 shadow-2xs font-extrabold'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <span>🥦 100% BARF / Natural</span>
          <InfoTooltip text="Cálculo basado en una dieta cruda biológicamente apropiada compuesta por hueso carnoso, carne de músculo, vísceras y vegetales." />
        </button>
      </div>

      {/* Aclaración Nutricional sobre Humedad de los Alimentos */}
      <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300">
        <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-[11.5px] leading-relaxed">
          <span className="font-extrabold text-stone-900 dark:text-white block mb-0.5">
            💡 ¿Por qué varían los gramos entre Croquetas y Comida Fresca / BARF?
          </span>
          Las croquetas secas contienen solo <strong>8-10% de agua</strong> (calorías ultra deshidratadas en menos gramos), mientras que la carne y vegetales frescos contienen un <strong>70-75% de agua celular natural</strong>. Por eso, el plato fresco requiere mayor cantidad en gramos para aportar exactamente la misma energía.
        </div>
      </div>

      {/* Controles Sincronizados de Entrada */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Tamaño del saco (si usa croquetas) */}
        {dietMode !== '100_barf' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              Tamaño del Saco
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={bagWeightKg === '' ? '' : bagWeightKg}
                onChange={(e) => setBagWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 dark:text-white bg-stone-50/50 dark:bg-stone-800/50"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                kg
              </span>
            </div>

            {/* Accesos rápidos */}
            <div className="flex flex-wrap gap-1 pt-1">
              {popularBagSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBagWeightKg(size)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                    bagWeightKg === size
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {size}kg
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Precio del Saco */}
        {dietMode !== '100_barf' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                Precio del Saco ({activeCurrency.code})
              </label>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                {activeCurrency.symbol}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                {activeCurrency.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={bagPrice === '' ? '' : bagPrice}
                onChange={(e) => setBagPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 dark:text-white bg-stone-50/50 dark:bg-stone-800/50"
              />
            </div>
          </div>
        )}

        {/* Ración Diaria Auto-Sincronizada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 inline-flex items-center">
              <span>Ración Diaria Servida</span>
              <InfoTooltip text="Calculada según peso ideal, edad, nivel de actividad y estado reproductivo en la ficha. Si la modificas aquí, recalcularemos el presupuesto sin alterar su ficha oficial." />
            </label>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
              Autosincronizado
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={customDailyGrams === '' ? '' : customDailyGrams}
              onChange={(e) => setCustomDailyGrams(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 dark:text-white bg-stone-50/50 dark:bg-stone-800/50"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
              g/día
            </span>
          </div>
        </div>

        {/* Precio de comida fresca/carne si aplica */}
        {dietMode !== '100_kibble' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              Precio Carne/Alimento Real x kg ({activeCurrency.code})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                {activeCurrency.symbol}
              </span>
              <input
                type="number"
                min="0"
                value={freshCostPerKg === '' ? '' : freshCostPerKg}
                onChange={(e) => setFreshCostPerKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 dark:text-white bg-stone-50/50 dark:bg-stone-800/50"
              />
            </div>
          </div>
        )}

      </div>

      {/* Resultados Unificados (Duración + Costo Diario + Presupuesto Mensual) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. Duración exactas en días */}
        {dietMode !== '100_barf' ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Duración del Saco ({bagWeightKg || 0} kg)</span>
              <InfoTooltip text="Días exactos que alcanzará la bolsa según los gramos de croqueta servidos por día." />
            </div>
            <div className="text-3xl font-black text-emerald-950 dark:text-white font-heading">
              {daysDuration} <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">días exactos</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-1">
              Rinde aprox. <strong>{monthsDuration} meses</strong>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>Comida Real Mensual</span>
              <InfoTooltip text="Cálculo basado en una dieta cruda biológicamente apropiada compuesta por hueso carnoso, carne de músculo, vísceras y vegetales." />
            </div>
            <div className="text-3xl font-black text-emerald-950 dark:text-white font-heading">
              {((freshGramsDaily * 30.4) / 1000).toFixed(1)} <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">kg/mes</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-1">
              Raciones frescas preparadas
            </p>
          </div>
        )}

        {/* 2. Gasto Diario */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-750 text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-stone-400" />
            <span>Costo por Día</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-heading truncate">
            <span className="text-lg font-bold text-stone-400 mr-1">{activeCurrency.symbol}</span>
            {formatMoney(totalDailyCost)}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            {activeCurrency.code} por {totalPlateGrams}g servidos en total
          </p>
          {dietMode === 'mixed_60_40' && (
            <div className="pt-1">
              <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold rounded-lg border border-amber-200 dark:border-amber-800/60">
                🥣 {kibbleGramsDaily}g croquetas + 🥩 {freshGramsDaily}g carne fresca
              </span>
            </div>
          )}
        </div>

        {/* 3. Presupuesto Mensual */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-750 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1 text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
            <span>Presupuesto Mensual</span>
            <InfoTooltip text="Proyección estimada sobre un mes estándar de 30.4 días para planificar compras periódicas." />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-heading truncate">
            <span className="text-lg font-bold text-stone-400 mr-1">{activeCurrency.symbol}</span>
            {formatMoney(monthlyCost)}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-1">
            Proyección anual: {activeCurrency.symbol} {formatMoney(annualCost)} {activeCurrency.code}
          </p>
        </div>

      </div>

      {/* Alerta de frescura / Fecha de Fin */}
      {dietMode !== '100_barf' && daysDuration > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              📅 Si abres este saco de {bagWeightKg || 0}kg hoy, se terminará el <u>{formattedFinishDate}</u>
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              💡 Conserva el concentrado en su empaque original bien sellado para evitar humedad y conservar sabor.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
