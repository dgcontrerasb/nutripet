import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { 
  Calculator, 
  Coins, 
  TrendingDown, 
  Package, 
  Sparkles, 
  Calendar, 
  Info,
  DollarSign,
  PieChart,
  ShoppingBag
} from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  default15kgPrice: number;
  defaultMeatPerKgPrice: number;
}

const CURRENCIES: Currency[] = [
  { code: 'COP', symbol: '$', name: 'COP (Colombia)', default15kgPrice: 220000, defaultMeatPerKgPrice: 16000 },
  { code: 'MXN', symbol: '$', name: 'MXN (México)', default15kgPrice: 1400, defaultMeatPerKgPrice: 110 },
  { code: 'USD', symbol: '$', name: 'USD (Dólares)', default15kgPrice: 65, defaultMeatPerKgPrice: 6 },
  { code: 'EUR', symbol: '€', name: 'EUR (Euros)', default15kgPrice: 60, defaultMeatPerKgPrice: 5.5 },
  { code: 'CLP', symbol: '$', name: 'CLP (Chile)', default15kgPrice: 55000, defaultMeatPerKgPrice: 5000 },
  { code: 'PEN', symbol: 'S/.', name: 'PEN (Perú)', default15kgPrice: 240, defaultMeatPerKgPrice: 20 },
  { code: 'ARS', symbol: '$', name: 'ARS (Argentina)', default15kgPrice: 60000, defaultMeatPerKgPrice: 5500 }
];

export const FoodBudgetCalculator: React.FC = () => {
  const { activePet } = usePets();

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('COP');
  const currency = CURRENCIES.find(c => c.code === selectedCurrencyCode) || CURRENCIES[0];

  // Default daily portion based on activePet weight
  const estimatedDailyGrams = activePet 
    ? (activePet.type === 'dog' 
        ? Math.round(activePet.weightKg * (activePet.stage === 'puppy_kitten' ? 25 : 18))
        : Math.round(activePet.weightKg * 14))
    : 250;

  const [dailyGrams, setDailyGrams] = useState<number>(estimatedDailyGrams);
  const [bagSizeKg, setBagSizeKg] = useState<number>(activePet?.type === 'cat' ? 3 : 15);
  const [bagPrice, setBagPrice] = useState<number>(
    activePet?.type === 'cat' ? Math.round(currency.default15kgPrice * 0.3) : currency.default15kgPrice
  );
  const [dietMode, setDietMode] = useState<'100_kibble' | 'mixed_60_40' | '100_barf'>('100_kibble');
  const [freshCostPerKg, setFreshCostPerKg] = useState<number>(currency.defaultMeatPerKgPrice);

  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrencyCode(newCode);
    const newCurr = CURRENCIES.find(c => c.code === newCode) || CURRENCIES[0];
    const newBagP = activePet?.type === 'cat' ? Math.round(newCurr.default15kgPrice * 0.3) : newCurr.default15kgPrice;
    setBagPrice(newBagP);
    setFreshCostPerKg(newCurr.defaultMeatPerKgPrice);
  };

  // Calculations
  const bagTotalGrams = bagSizeKg * 1000;
  const pricePerKibbleGram = bagTotalGrams > 0 ? bagPrice / bagTotalGrams : 0;
  const pricePerFreshGram = freshCostPerKg / 1000;

  // Daily portions based on diet mode
  let dailyKibbleGrams = dailyGrams;
  let dailyFreshGrams = 0;

  if (dietMode === 'mixed_60_40') {
    dailyKibbleGrams = Math.round(dailyGrams * 0.6);
    // BARF daily is typically ~2.5x the weight of dry kibble for equivalent kcal/volume
    dailyFreshGrams = Math.round(dailyGrams * 0.4 * 2.2);
  } else if (dietMode === '100_barf') {
    dailyKibbleGrams = 0;
    dailyFreshGrams = Math.round((activePet?.weightKg || 10) * 1000 * 0.03); // 3% of bodyweight
  }

  // Cost calculations
  const dailyKibbleCost = dailyKibbleGrams * pricePerKibbleGram;
  const dailyFreshCost = dailyFreshGrams * pricePerFreshGram;
  const totalDailyCost = dailyKibbleCost + dailyFreshCost;

  const monthlyCost = Math.round(totalDailyCost * 30);
  const annualCost = Math.round(totalDailyCost * 365);

  // Bag duration in days
  const bagDurationDays = dailyKibbleGrams > 0 ? Math.floor(bagTotalGrams / dailyKibbleGrams) : 0;
  const bagDurationMonths = (bagDurationDays / 30).toFixed(1);

  // Bag savings comparison (15kg vs small bags)
  const smallBagPrice = Math.round(bagPrice * 0.35); // 3kg is typically ~35% the price of a 15kg
  const smallBagsNeededFor15kg = 5;
  const smallBagsTotalCost = smallBagPrice * smallBagsNeededFor15kg;
  const annualSavingsByBigBag = Math.max(0, Math.round((smallBagsTotalCost - bagPrice) * (365 / (bagDurationDays || 1))));

  const formatPrice = (amount: number) => {
    return `${currency.symbol} ${amount.toLocaleString('es-ES')}`;
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-7 shadow-xs space-y-6">
      
      {/* Header with Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
            <Coins className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">
              Calculadora de Costo y Presupuesto de Alimentación
            </h3>
            <p className="text-xs text-stone-500">
              Estima el gasto diario, mensual y la duración exacta del saco para {activePet?.name || 'tu mascota'}
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-stone-500">Moneda:</span>
          <select
            value={selectedCurrencyCode}
            onChange={e => handleCurrencyChange(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Selector (Tabs) */}
      <div className="flex rounded-2xl bg-stone-100 p-1 gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setDietMode('100_kibble')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
            dietMode === '100_kibble'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🥣 100% Concentrado / Croquetas
        </button>

        <button
          type="button"
          onClick={() => setDietMode('mixed_60_40')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
            dietMode === 'mixed_60_40'
              ? 'bg-white text-amber-900 shadow-2xs border border-amber-200/50'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🥩 Dieta Mixta (60% Pienso + 40% Real)
        </button>

        <button
          type="button"
          onClick={() => setDietMode('100_barf')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
            dietMode === '100_barf'
              ? 'bg-white text-emerald-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🥦 100% BARF / Comida Casera
        </button>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70 text-xs">
        
        {dietMode !== '100_barf' && (
          <>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tamaño del Saco de Concentrado</label>
              <select
                value={bagSizeKg}
                onChange={e => setBagSizeKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value={1.5}>1.5 kg (Mascotas pequeñas)</option>
                <option value={3}>3 kg (Bolsa mediana)</option>
                <option value={7.5}>7.5 kg (Bolsa intermedia)</option>
                <option value={12}>12 kg (Saco estándar)</option>
                <option value={15}>15 kg (Saco grande familiar)</option>
                <option value={20}>20 kg (Saco criadero)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Precio del Saco ({currency.code})
              </label>
              <input
                type="number"
                value={bagPrice}
                onChange={e => setBagPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </>
        )}

        <div>
          <label className="block font-bold text-stone-700 mb-1">
            Porción Diaria Total (Gramos)
          </label>
          <input
            type="number"
            value={dailyGrams}
            onChange={e => setDailyGrams(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        {dietMode !== '100_kibble' && (
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Precio Carne/Pollo por kg ({currency.code})
            </label>
            <input
              type="number"
              value={freshCostPerKg}
              onChange={e => setFreshCostPerKg(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        )}

      </div>

      {/* KPI Cost Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Costo Diario */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Costo por Día
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-amber-950">
              {formatPrice(Math.round(totalDailyCost))}
            </span>
            <span className="text-xs text-amber-800">/ día</span>
          </div>
          <p className="text-[10px] text-amber-700">
            {dietMode === 'mixed_60_40' 
              ? `${dailyKibbleGrams}g croqueta + ${dailyFreshGrams}g carne` 
              : `${dailyGrams} gramos diarios servidos`}
          </p>
        </div>

        {/* Costo Mensual */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Presupuesto Mensual (30 días)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading font-black text-2xl text-emerald-950">
              {formatPrice(monthlyCost)}
            </span>
            <span className="text-xs text-emerald-800">/ mes</span>
          </div>
          <p className="text-[10px] text-emerald-700">
            Proyección anual: {formatPrice(annualCost)}
          </p>
        </div>

        {/* Duración del Saco */}
        {dietMode !== '100_barf' ? (
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Duración del Saco ({bagSizeKg} kg)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl text-blue-950">
                {bagDurationDays}
              </span>
              <span className="text-xs text-blue-800">días exactos</span>
            </div>
            <p className="text-[10px] text-blue-700">
              Aprox. {bagDurationMonths} meses por bolsa
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Kilos Frescos al Mes
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-black text-2xl text-stone-900">
                {((dailyFreshGrams * 30) / 1000).toFixed(1)}
              </span>
              <span className="text-xs text-stone-600">kg de comida real</span>
            </div>
            <p className="text-[10px] text-stone-500">
              Repartidos en raciones congeladas
            </p>
          </div>
        )}

      </div>

      {/* Smart Tips & Savings Analysis */}
      {dietMode !== '100_barf' && bagSizeKg < 15 && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3 text-xs">
          <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-stone-900 block">
              💡 Tip de Ahorro Inteligente en Comida:
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Comprar el saco grande de 15 kg en lugar de bolsas de {bagSizeKg} kg suele reducir el costo por kilogramo entre un <strong>20% y 35%</strong>. Para {activePet?.name || 'tu mascota'}, esto representa un ahorro aproximado de <strong>{formatPrice(annualSavingsByBigBag)} al año</strong>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
