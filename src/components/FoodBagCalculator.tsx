import React, { useState } from 'react';
import { Package, DollarSign, Calendar, Sparkles, TrendingUp, ChevronDown } from 'lucide-react';

interface FoodBagCalculatorProps {
  dailyGrams: number;
  petName: string;
  petType: 'dog' | 'cat';
}

export interface CurrencyOption {
  code: string;        // Diminutivo ISO (ej. COP, MXN, ARS, USD)
  name: string;        // Nombre del país y moneda
  symbol: string;      // Símbolo habitual ($, S/, Q, L, etc.)
  flag: string;        // Emoji de bandera
  defaultBagPrice: { dog: number; cat: number };
}

// Catálogo completo de monedas de Latinoamérica (+ España y USD internacional)
export const LATAM_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'Dólar estadounidense (Internacional / Ecuador / Panamá / El Salvador)', symbol: '$', flag: '🇺🇸', defaultBagPrice: { dog: 45, cat: 22 } },
  { code: 'COP', name: 'Peso colombiano (Colombia)', symbol: '$', flag: '🇨🇴', defaultBagPrice: { dog: 180000, cat: 85000 } },
  { code: 'MXN', name: 'Peso mexicano (México)', symbol: '$', flag: '🇲🇽', defaultBagPrice: { dog: 850, cat: 420 } },
  { code: 'ARS', name: 'Peso argentino (Argentina)', symbol: '$', flag: '🇦🇷', defaultBagPrice: { dog: 45000, cat: 22000 } },
  { code: 'CLP', name: 'Peso chileno (Chile)', symbol: '$', flag: '🇨🇱', defaultBagPrice: { dog: 42000, cat: 20000 } },
  { code: 'PEN', name: 'Sol peruano (Perú)', symbol: 'S/', flag: '🇵🇪', defaultBagPrice: { dog: 160, cat: 80 } },
  { code: 'BRL', name: 'Real brasileño (Brasil)', symbol: 'R$', flag: '🇧🇷', defaultBagPrice: { dog: 220, cat: 110 } },
  { code: 'UYU', name: 'Peso uruguayo (Uruguay)', symbol: '$', flag: '🇺🇾', defaultBagPrice: { dog: 1800, cat: 900 } },
  { code: 'PYG', name: 'Guaraní paraguayo (Paraguay)', symbol: '₲', flag: '🇵🇾', defaultBagPrice: { dog: 320000, cat: 160000 } },
  { code: 'BOB', name: 'Boliviano (Bolivia)', symbol: 'Bs', flag: '🇧🇴', defaultBagPrice: { dog: 310, cat: 150 } },
  { code: 'VES', name: 'Bolívar digital (Venezuela)', symbol: 'Bs.', flag: '🇻🇪', defaultBagPrice: { dog: 1650, cat: 800 } },
  { code: 'GTQ', name: 'Quetzal guatemalteco (Guatemala)', symbol: 'Q', flag: '🇬🇹', defaultBagPrice: { dog: 350, cat: 170 } },
  { code: 'HNL', name: 'Lempira hondureña (Honduras)', symbol: 'L', flag: '🇭🇳', defaultBagPrice: { dog: 1100, cat: 540 } },
  { code: 'NIO', name: 'Córdoba nicaragüense (Nicaragua)', symbol: 'C$', flag: '🇳🇮', defaultBagPrice: { dog: 1650, cat: 810 } },
  { code: 'CRC', name: 'Colón costarricense (Costa Rica)', symbol: '₡', flag: '🇨🇷', defaultBagPrice: { dog: 23000, cat: 11500 } },
  { code: 'DOP', name: 'Peso dominicano (República Dominicana)', symbol: 'RD$', flag: '🇩🇴', defaultBagPrice: { dog: 2600, cat: 1300 } },
  { code: 'EUR', name: 'Euro (España / Europa)', symbol: '€', flag: '🇪🇸', defaultBagPrice: { dog: 42, cat: 20 } },
];

export const FoodBagCalculator: React.FC<FoodBagCalculatorProps> = ({
  dailyGrams,
  petName,
  petType,
}) => {
  const [bagWeightKg, setBagWeightKg] = useState<number>(petType === 'dog' ? 15 : 3);
  
  // Selección de moneda por defecto: USD
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');

  // Buscar moneda seleccionada
  const activeCurrency = LATAM_CURRENCIES.find((c) => c.code === selectedCurrencyCode) || LATAM_CURRENCIES[0];

  // Precio del saco en la moneda activa
  const [bagPrice, setBagPrice] = useState<number>(activeCurrency.defaultBagPrice[petType]);

  // Al cambiar la moneda en el desplegable, sugerimos un precio de referencia típico para esa moneda
  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrencyCode(newCode);
    const target = LATAM_CURRENCIES.find((c) => c.code === newCode);
    if (target) {
      setBagPrice(target.defaultBagPrice[petType]);
    }
  };

  // Cálculos matemáticos:
  // 1. Gramos totales del saco = kilos * 1000
  const totalBagGrams = Math.max(0.1, bagWeightKg) * 1000;
  const safeDailyGrams = Math.max(1, dailyGrams);

  // 2. Días que rinde el saco = gramos totales / ración diaria de la mascota
  const daysDuration = Math.max(1, Math.round(totalBagGrams / safeDailyGrams));
  const monthsDuration = (daysDuration / 30.4).toFixed(1);

  // 3. Costo diario = precio del saco / días de duración
  const numericCostPerDay = bagPrice > 0 ? bagPrice / daysDuration : 0;
  // 4. Costo mensual (30.4 días en promedio) = costo diario * 30.4
  const numericCostPerMonth = numericCostPerDay * 30.4;

  // Formateador inteligente de moneda según el orden de magnitud (ej. pesos colombianos sin decimales, dólares con 2 decimales)
  const formatMoney = (amount: number) => {
    if (amount === 0) return '0';
    if (amount >= 1000) {
      return Math.round(amount).toLocaleString('es-ES');
    }
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Fecha estimada en que se terminará si se abre hoy
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysDuration);
  const formattedFinishDate = finishDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const popularBagSizes = petType === 'dog' 
    ? [3, 8, 12, 15, 18, 20] 
    : [1.5, 3, 7, 10];

  return (
    <div className="bg-white border-2 border-emerald-500/20 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-stone-900 text-lg">
              Calculadora de Duración y Gasto del Saco
            </h3>
            <p className="text-xs text-stone-500">
              ¿Cuánto te durará el concentrado de {petName || 'tu mascota'} y cuánto gastas al día?
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 px-2.5 py-1 rounded-xl text-xs font-bold text-stone-700">
          <span>Consumo:</span>
          <strong className="text-emerald-700">{dailyGrams} g/día</strong>
        </div>
      </div>

      {/* Controles de entrada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tamaño del saco */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Tamaño del saco (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.5"
              max="50"
              step="0.5"
              value={bagWeightKg || ''}
              onChange={(e) => setBagWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 bg-stone-50/50"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
              kg
            </span>
          </div>

          {/* Accesos rápidos de peso común */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] text-stone-400 self-center mr-1">Comunes:</span>
            {popularBagSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setBagWeightKg(size)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  bagWeightKg === size
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {size} kg
              </button>
            ))}
          </div>
        </div>

        {/* Moneda y Precio del saco */}
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Moneda de tu país
            </label>
            {/* Menú desplegable con nombre y diminutivo de todos los países de Latinoamérica */}
            <div className="relative">
              <select
                value={selectedCurrencyCode}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-9 py-2 rounded-xl border border-stone-200 bg-stone-50/70 text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {LATAM_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Campo del precio */}
          <div className="pt-1 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Precio que pagaste por el saco
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {activeCurrency.code} ({activeCurrency.symbol})
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
                value={bagPrice || ''}
                onChange={(e) => setBagPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-extrabold text-stone-900 bg-stone-50/50"
              />
            </div>
            <p className="text-[10px] text-stone-400">
              Escribe lo que cuesta el saco en {activeCurrency.name.split('(')[0].trim()}
            </p>
          </div>
        </div>
      </div>

      {/* Resultados Destacados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Duración */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Te durará aprox.</span>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-heading">
            {daysDuration} <span className="text-base font-bold text-emerald-700">días</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Equivale a <strong>{monthsDuration} meses/semanas</strong>
          </p>
        </div>

        {/* Gasto por día */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-3.5 h-3.5 text-stone-400" />
            <span>Costo por día</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-heading truncate" title={`${activeCurrency.symbol} ${formatMoney(numericCostPerDay)} ${activeCurrency.code}`}>
            <span className="text-lg font-bold text-stone-400 mr-1">{activeCurrency.symbol}</span>
            {formatMoney(numericCostPerDay)}
          </div>
          <p className="text-[11px] text-stone-500 font-medium mt-1">
            {activeCurrency.code} por {dailyGrams}g de comida diaria
          </p>
        </div>

        {/* Gasto mensual estimado */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
            <span>Presupuesto mensual</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-heading truncate" title={`${activeCurrency.symbol} ${formatMoney(numericCostPerMonth)} ${activeCurrency.code}`}>
            <span className="text-lg font-bold text-stone-400 mr-1">{activeCurrency.symbol}</span>
            {formatMoney(numericCostPerMonth)}
          </div>
          <p className="text-[11px] text-stone-500 font-medium mt-1">
            {activeCurrency.code} estimado al mes (~30 días)
          </p>
        </div>
      </div>

      {/* Alerta de frescura / fecha de fin */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">
            📅 Si abres este saco hoy, se terminará aproximadamente el: <u>{formattedFinishDate}</u>
          </p>
          <p className="text-[11px] text-amber-800">
            <strong>Consejo casero de almacenamiento:</strong> Guarda el concentrado en su empaque original bien sellado y dentro de un recipiente con tapa para evitar que se oxide con el aire o pierda sabor.
          </p>
        </div>
      </div>
    </div>
  );
};
