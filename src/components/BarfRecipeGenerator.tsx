import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import {
  Utensils,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Flame,
  Copy,
  Share2,
  Crown,
  ShieldCheck,
  FileText,
  RefreshCw,
  Heart,
  Scale,
  Info,
  Droplets,
  Sparkles
} from 'lucide-react';

interface Props {
  onOpenSubscriptionModal: () => void;
}

interface PresetRecipe {
  id: string;
  name: string;
  category: 'BARF' | 'Cocida' | 'Mixta';
  petType: 'dog' | 'cat' | 'both';
  description: string;
  cookingMethod: string;
  benefits: string[];
  ingredientBreakdown: { name: string; percentage: number; note?: string }[];
  instructions: string[];
}

const PRESET_RECIPES: PresetRecipe[] = [
  {
    id: 'chicken-pumpkin-cooked',
    name: 'Menú Esencial: Pechuga de Pollo y Auyama',
    category: 'Cocida',
    petType: 'both',
    description: 'Dieta suave de altísima digestibilidad, ideal para estómagos sensibles o iniciar en comida casera.',
    cookingMethod: 'Cocción al vapor o agua hirviendo sin sal ni condimentos.',
    benefits: ['Alta proteína magra de fácil absorción', 'Auyama rica en fibra para regular heces', 'Bajo en grasas'],
    ingredientBreakdown: [
      { name: 'Pechuga de Pollo (Sin piel ni hueso)', percentage: 60, note: 'Hervida 10 mins' },
      { name: 'Auyama / Calabaza', percentage: 25, note: 'Hervida y hecha puré' },
      { name: 'Zanahoria o Calabacín', percentage: 10, note: 'Rallado al vapor' },
      { name: 'Aceite de Oliva o Salmón', percentage: 5, note: 'Añadir en frío antes de servir' }
    ],
    instructions: [
      'Corta la pechuga de pollo en cubos pequeños sin sal ni condimentos y ponla a hervir por 10-12 minutos.',
      'Cocina la auyama y la zanahoria al vapor hasta que estén muy suaves.',
      'Pisa la auyama para formar un puré y mezcla todos los ingredientes en el plato.',
      'Deja enfriar a temperatura ambiente y añade las gotas de aceite de oliva o salmón.'
    ]
  },
  {
    id: 'turkey-zucchini-cooked',
    name: 'Menú Vital: Pavo Magro, Calabacín y Arándanos',
    category: 'Cocida',
    petType: 'both',
    description: 'Rica en antioxidantes naturales y baja en alergenos. Excelente opción para mantenimiento.',
    cookingMethod: 'Salteado al agua o cocción lenta.',
    benefits: ['Antioxidantes de arándanos para inmunidad', 'Hidratación extra con calabacín', 'Proteína hipoalergénica'],
    ingredientBreakdown: [
      { name: 'Carne Molida de Pavo o Muslo', percentage: 65, note: 'Cocida al sartén sin aceite' },
      { name: 'Calabacín Verde', percentage: 20, note: 'Picado fino al vapor' },
      { name: 'Manzana (Sin semillas)', percentage: 10, note: 'En cuadritos' },
      { name: 'Arándanos Frescos o Congelados', percentage: 5, note: 'Machacados' }
    ],
    instructions: [
      'Cocina la carne de pavo molida en una sartén a fuego medio usando un chorrito de agua (sin sal).',
      'Agrega el calabacín rascado durante los últimos 3 minutos de cocción.',
      'Mezcla con la manzana picada (Asegúrate de retirar todas las semillas) y los arándanos machacados.',
      'Sirve a temperatura ambiente.'
    ]
  },
  {
    id: 'beef-veggies-cooked',
    name: 'Menú Fuerza: Ternera Magra y Zanahoria',
    category: 'Cocida',
    petType: 'dog',
    description: 'Aporte sustancioso de hierro, complejo B y aminoácidos esenciales para perritos activos.',
    cookingMethod: 'Cocción media al vapor.',
    benefits: ['Hierro hemínico de alta biodisponibilidad', 'Energía duradera para razas medianas y grandes', 'Fortalece masa muscular'],
    ingredientBreakdown: [
      { name: 'Carne Magra de Ternera o Res', percentage: 65, note: 'Magra sin exceso de gordura' },
      { name: 'Zanahoria', percentage: 20, note: 'Rallada o hervida' },
      { name: 'Espinacas o Acelga', percentage: 10, note: 'Hojas al vapor picadas' },
      { name: 'Sardina en agua (Opcional)', percentage: 5, note: 'Aporte de Omega 3 natural' }
    ],
    instructions: [
      'Cocina la carne de res magra al vapor o dorada ligeramente en agua por 5-8 minutos.',
      'Hierve las zanahorias y espinacas, luego pícalas muy fino.',
      'Mezcla la carne, los vegetales y media sardina desmenuzada en agua sin sal.',
      'Deja reposar antes de servir.'
    ]
  },
  {
    id: 'barf-classic-dog',
    name: 'Menú BARF Canino Tradicional (Modelo 80/10/10)',
    category: 'BARF',
    petType: 'dog',
    description: 'Dieta de alimentos crudos biológicamente apropiados formulada bajo la regla estándar BARF.',
    cookingMethod: 'Servido crudo previo congelado sanitario (mínimo 3 días a -18°C).',
    benefits: ['Limpieza dental mecánica natural', 'Heces más pequeñas y firmes', 'Pelaje brillante'],
    ingredientBreakdown: [
      { name: 'Huesos Carnosos Crudos (Cuellos/Alas)', percentage: 50, note: 'NUNCA cocinados, siempre crudos' },
      { name: 'Carne Magra Muscular (Pollo/Res)', percentage: 30, note: 'Músculo crudo desmenuzado' },
      { name: 'Vísceras y Órganos (Hígado/Corazón)', percentage: 10, note: 'Hígado (5%) + Corazón/Molleja (5%)' },
      { name: 'Vegetales y Frutas Trituradas', percentage: 10, note: 'Auyama, zanahoria y manzana' }
    ],
    instructions: [
      'IMPORTANTE: Congela las carnes y huesos crudos durante al menos 3 a 5 días para eliminar bacterias antes de servir.',
      'Pesa los huesos carnosos crudos (ej: cuellos o carcasas de pollo desgrasadas). NUNCA los cocines porque se astillan.',
      'Tritura los vegetales en procesador para que el perro pueda absorber sus nutrientes.',
      'Mezcla la carne muscular, vísceras picadas y puré vegetal en el recipiente.'
    ]
  },
  {
    id: 'mixed-topper-kibble',
    name: 'Menú Mixto: Croqueta Seca + Topper Caldo y Pollo',
    category: 'Mixta',
    petType: 'both',
    description: 'Lo mejor de dos mundos: 60% de croquetas balanceadas + 40% de alimento fresco hidratante.',
    cookingMethod: 'Caldo de huesos sin sal + carne hervida sobre las croquetas habituales.',
    benefits: ['Aumenta la palatabilidad sin cambiar drásticamente la dieta', 'Hidratación extra para riñones', 'Económico y nutritivo'],
    ingredientBreakdown: [
      { name: 'Croquetas Secas Habituales', percentage: 60, note: 'Ración de su alimento concentrado' },
      { name: 'Pollo o Ternera Desmenuzada', percentage: 30, note: 'Hervida sin sal' },
      { name: 'Caldo Nutritivo de Pollo/Res', percentage: 10, note: 'Caldo casero sin cebolla ni ajo' }
    ],
    instructions: [
      'Sirve el 60% de la ración de croquetas diarias recomendada para tu mascota.',
      'Agrega encima el pollo desmenuzado recién cocido.',
      'Baña el plato con 2 a 3 cucharadas de caldo de huesos tibia sin condimentos para crear una salsa deliciosa.'
    ]
  }
];

export const BarfRecipeGenerator: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, isProOrTrial } = usePets();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(PRESET_RECIPES[0].id);
  const [customIngredients, setCustomIngredients] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiRecipeResult, setAiRecipeResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!activePet) return null;

  const isPro = isProOrTrial;
  const currentRecipe = PRESET_RECIPES.find(r => r.id === selectedRecipeId) || PRESET_RECIPES[0];

  // Cálculo de ración diaria estimada (aprox 2.5% a 3% del peso corporal para adultos)
  const estimatedDailyGrams = Math.round(activePet.weightKg * (activePet.type === 'cat' ? 35 : 28));

  // Filtrar recetas válidas para el tipo de mascota (dog/cat)
  const availableRecipes = PRESET_RECIPES.filter(r => r.petType === 'both' || r.petType === activePet.type);

  const handleCopyRecipe = () => {
    if (aiRecipeResult) {
      navigator.clipboard.writeText(aiRecipeResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      return;
    }

    let text = `🥩 *RECETA CASERA BALANCEDA PARA ${activePet.name.toUpperCase()}*\n`;
    text += `📌 *Platillo:* ${currentRecipe.name}\n`;
    text += `🥣 *Ración Diaria Total:* ${estimatedDailyGrams} g/día\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *INGREDIENTES EXACTOS POR PESO (${activePet.weightKg} kg):*\n`;
    currentRecipe.ingredientBreakdown.forEach(ing => {
      const grams = Math.round((estimatedDailyGrams * ing.percentage) / 100);
      text += `• ${ing.name}: *${grams} g* (${ing.percentage}%)\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👨‍🍳 *PREPARACIÓN:*\n${currentRecipe.instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}\n`;
    text += `\n✨ _Calculado en NutriPet Pro_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (aiRecipeResult) {
      window.open(`https://wa.me/?text=${encodeURIComponent(aiRecipeResult)}`, '_blank');
      return;
    }

    let text = `🥩 *RECETA NUTRIPET PARA ${activePet.name.toUpperCase()}*\n`;
    text += `📌 *Platillo:* ${currentRecipe.name}\n`;
    text += `🥣 *Ración Diaria:* ${estimatedDailyGrams} g/día\n\n`;
    text += `📊 *Ingredientes:* \n`;
    currentRecipe.ingredientBreakdown.forEach(ing => {
      const grams = Math.round((estimatedDailyGrams * ing.percentage) / 100);
      text += `• ${ing.name}: ${grams}g\n`;
    });
    text += `\n👨‍🍳 *Cocción:* ${currentRecipe.cookingMethod}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGenerateCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
      onOpenSubscriptionModal();
      return;
    }

    if (!customIngredients.trim()) return;

    setAiGenerating(true);
    setAiRecipeResult(null);

    setTimeout(() => {
      const primaryIng = customIngredients.split(',')[0]?.trim() || 'Carne magra / Pechuga';
      setAiRecipeResult(`👨‍🍳 RECETA CASERA PERSONALIZADA PARA ${activePet.name.toUpperCase()} (${estimatedDailyGrams}g totales):

Basado en tus ingredientes (${customIngredients}) y en las pautas FEDIAF/NRC para ${activePet.type === 'dog' ? 'caninos' : 'felinos'} de ${activePet.weightKg}kg:

1. Base de proteína magra (${primaryIng}): ${Math.round(estimatedDailyGrams * 0.65)}g (Cocinar al vapor o agua sin sal)
2. Fibra y vegetales aptos: ${Math.round(estimatedDailyGrams * 0.25)}g (Hervir y triturar en puré)
3. Ácidos grasos y complementos (Aceite de oliva virgen o salmón): ${Math.round(estimatedDailyGrams * 0.10)}g (Añadir en crudo al servir)

💡 Consejo: Asegúrate de retirar semillas y huesos cocidos. Nunca agregues cebolla, ajo, uvas ni sal.`);
      setAiGenerating(false);
    }, 200);
  };

  // Desglose estructurado para la tarjeta Bento de receta personalizada
  const parsedCustomList = customIngredients
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const customPrimaryProtein = parsedCustomList[0] || 'Carne magra / Pechuga';
  const customVeggies =
    parsedCustomList.length > 1
      ? parsedCustomList.slice(1).join(', ')
      : 'Vegetales y fibra apta (Auyama, Zanahoria o Calabacín)';
  const customProteinGrams = Math.round(estimatedDailyGrams * 0.65);
  const customVeggieGrams = Math.round(estimatedDailyGrams * 0.25);
  const customFatsGrams = Math.round(estimatedDailyGrams * 0.10);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* 1. HERO VERDE INSTITUCIONAL SIMÉTRICO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-4 py-3 sm:px-6 sm:py-3.5 border border-[#2a5940] shadow-xs text-center flex flex-col items-center justify-center no-print">
        <div className="relative z-10 space-y-1 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <Crown className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Formulación Natural Especializada</span>
          </div>
          <h1 className="text-sm sm:text-base font-editorial font-semibold tracking-tight text-white leading-tight">
            Dietas BARF & <span className="font-editorial italic font-normal text-amber-300">Recetas Caseras</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
            Formulaciones balanceadas calculadas gramo a gramo para {activePet.name} ({activePet.weightKg} kg).
          </p>
        </div>
      </div>

      {/* 2. MICRO-CÁPSULA DE HUMEDAD (Ración BARF vs Croquetas) */}
      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5 text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-snug">
          <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="text-stone-900 dark:text-stone-100 font-bold">Humedad Biológica (~{estimatedDailyGrams} g/día):</strong> La croqueta seca concentra calorías con solo <strong>8-10% de humedad</strong>, mientras la comida fresca/BARF aporta un <strong>70-75% de agua natural</strong>, dando mayor volumen y gramos con el mismo aporte calórico para {activePet.name}.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 shrink-0 self-start sm:self-center">
          <Scale className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Ración: ~{estimatedDailyGrams} g/día</span>
        </div>
      </div>

      {!isPro ? (
        <ProFeatureLock
          featureName="Generador de Dietas BARF & Recetas Caseras"
          description={`Diseña menús crudos (BARF) y cocinados balanceados con proporciones exactas de hueso carnoso, carne magra, vísceras y suplementos adaptados a ${activePet.name}.`}
          benefits={[
            "Desglose exacto en gramos de músculo, huesos y vísceras",
            "Soporte para dietas crudas BARF, cocidas y mixtas",
            "Generador inteligente con IA según ingredientes de casa"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      ) : (
        /* Grid Principal para Usuarios Pro */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">

          {/* Selector de Recetas del Catálogo */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-stone-800 dark:text-stone-200 text-xs font-black tracking-wide uppercase flex items-center gap-1.5 px-1">
              <ChefHat className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Catálogo de Recetas Balanceadas ({availableRecipes.length}):</span>
            </h3>

            <div className="space-y-2.5">
              {availableRecipes.map(recipe => {
                const isSelected = selectedRecipeId === recipe.id && !aiRecipeResult;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      setSelectedRecipeId(recipe.id);
                      setAiRecipeResult(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-600/20 shadow-2xs'
                        : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#1a231d] hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        recipe.category === 'BARF'
                          ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                          : recipe.category === 'Cocida'
                          ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                      }`}>
                        {recipe.category}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                        {recipe.petType === 'both' ? '🐶 Canino & 🐱 Felino' : recipe.petType === 'dog' ? '🐶 Solo Caninos' : '🐱 Solo Felinos'}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs sm:text-sm leading-snug">
                      {recipe.name}
                    </h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Formulario Generador con tus Ingredientes */}
            <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider">
                  Personalizar con tus Ingredientes
                </h4>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                Escribe qué alimentos tienes en casa y calcularemos la proporción balanceada para {activePet.name}:
              </p>
              <form onSubmit={handleGenerateCustomRecipe} className="space-y-2">
                <input
                  type="text"
                  value={customIngredients}
                  onChange={(e) => setCustomIngredients(e.target.value)}
                  placeholder="Ej: Tengo pechuga, zanahoria y camote..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  disabled={aiGenerating || !customIngredients.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
                >
                  {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Utensils className="w-3.5 h-3.5" />}
                  <span>{aiGenerating ? 'Calculando ración...' : 'Formular con mis Ingredientes'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Detalle de la Receta Seleccionada o Resultado */}
          <div className="lg:col-span-7 space-y-4">

            {aiRecipeResult ? (
              /* Vista de Receta Personalizada en Estilo Bento Premium */
              <div className="bg-white dark:bg-[#1a231d] border border-emerald-500/40 dark:border-emerald-700/50 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs animate-fade-in">
                
                {/* Barra Superior de Navegación y Acciones Rápidas */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setAiRecipeResult(null)}
                    className="px-3 py-1.5 rounded-full border border-emerald-600/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 font-bold text-xs transition-all cursor-pointer shrink-0"
                  >
                    ← Volver al Catálogo
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyRecipe}
                      className="shrink-0 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-stone-200/70 dark:border-stone-700"
                      title="Copiar receta personalizada"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="shrink-0 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Encabezado Bento con Degradado Alabastro/Esmeralda Suave */}
                <div className="rounded-2xl bg-gradient-to-br from-[#faf8f5] via-emerald-50/70 to-emerald-100/50 dark:from-stone-850 dark:via-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-900 dark:text-emerald-200 shadow-3xs">
                        <span>{activePet.type === 'dog' ? '🐶' : '🐱'}</span>
                        <span>{activePet.name} • {activePet.weightKg} kg</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300/70 dark:border-amber-800 text-[9.5px] font-mono font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>FEDIAF & NRC</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug">
                      Fórmula Casera Personalizada Balanceada
                    </h3>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                      Ingredientes base seleccionados: <strong className="text-stone-800 dark:text-stone-200">{customIngredients}</strong>
                    </p>
                  </div>

                  <div className="bg-white/95 dark:bg-stone-900/90 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl px-3.5 py-2.5 text-left sm:text-right shrink-0 shadow-3xs">
                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold">
                      Ración Total
                    </span>
                    <span className="font-heading font-black text-base sm:text-lg text-emerald-800 dark:text-emerald-300 block leading-tight">
                      ~{estimatedDailyGrams} g / día
                    </span>
                  </div>
                </div>

                {/* 3 Micro-Tarjetas Bento para los Ingredientes */}
                <div className="space-y-2.5">
                  <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Desglose Nutricional Exacto por Día:</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* 1. Tarjeta Proteína Base */}
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-center shrink-0 mt-0.5">
                          <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11.5px] sm:text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-tight block">
                            Proteína Magra Principal: {customPrimaryProtein}
                          </span>
                          <span className="text-[10px] sm:text-[10.5px] text-stone-500 dark:text-stone-400 leading-snug block mt-0.5">
                            Cocción suave al vapor o en agua hirviendo sin sal ni condimentos.
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-emerald-800 dark:text-emerald-400 font-black text-base block leading-none">
                          {customProteinGrams} g
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block mt-0.5">
                          65%
                        </span>
                      </div>
                    </div>

                    {/* 2. Tarjeta Vegetales y Fibra */}
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11.5px] sm:text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-tight block">
                            Vegetales y Fibra Digestiva: {customVeggies}
                          </span>
                          <span className="text-[10px] sm:text-[10.5px] text-stone-500 dark:text-stone-400 leading-snug block mt-0.5">
                            Hervir al vapor y triturar en puré fino para máxima absorción intestinal.
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-emerald-800 dark:text-emerald-400 font-black text-base block leading-none">
                          {customVeggieGrams} g
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block mt-0.5">
                          25%
                        </span>
                      </div>
                    </div>

                    {/* 3. Tarjeta Ácidos Grasos y Salud */}
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center shrink-0 mt-0.5">
                          <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11.5px] sm:text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-tight block">
                            Ácidos Grasos y Salud (Aceite de Oliva Virgen o Salmón)
                          </span>
                          <span className="text-[10px] sm:text-[10.5px] text-stone-500 dark:text-stone-400 leading-snug block mt-0.5">
                            Añadir siempre en crudo y a temperatura ambiente justo antes de servir.
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-emerald-800 dark:text-emerald-400 font-black text-base block leading-none">
                          {customFatsGrams} g
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 block mt-0.5">
                          10%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Seguridad Nutricional */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 leading-snug">
                    <p>
                      <strong>Seguridad Clínica y Toxicológica:</strong> Retira siempre semillas y <strong>prohibido dar huesos cocidos</strong> (riesgo de astillamiento). Nunca agregues sal, cebolla, ajo, uvas ni condimentos.
                    </p>
                    <p className="text-[10.5px] text-amber-900/90 dark:text-amber-300/90">
                      Estas pautas FEDIAF/NRC son orientativas y no reemplazan la formulación de un médico veterinario nutricionista.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              /* Vista de Receta del Catálogo Estático */
              <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xs">

                {/* Header de la Receta */}
                <div className="space-y-2.5 border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
                      <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                        currentRecipe.category === 'BARF'
                          ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                          : currentRecipe.category === 'Cocida'
                          ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                      }`}>
                        {currentRecipe.category}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-snug">
                        {currentRecipe.cookingMethod}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyRecipe}
                        className="shrink-0 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-stone-200/70 dark:border-stone-700"
                        title="Copiar texto de la receta"
                      >
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="shrink-0 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Enviar por WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5 shrink-0" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug">
                    {currentRecipe.name}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {currentRecipe.description}
                  </p>
                </div>

                {/* Porciones exactas por peso de la mascota */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Ingredientes Exactos para {activePet.name} ({estimatedDailyGrams}g totales / día):</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentRecipe.ingredientBreakdown.map((ing, idx) => {
                      const exactGrams = Math.round((estimatedDailyGrams * ing.percentage) / 100);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-[11.5px] sm:text-xs font-extrabold text-stone-900 dark:text-stone-100 leading-tight block">
                              {ing.name}
                            </span>
                            {ing.note && (
                              <span className="text-[10px] sm:text-[10.5px] text-stone-500 dark:text-stone-400 leading-snug block mt-0.5">
                                {ing.note}
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 block leading-none">
                              {exactGrams} g
                            </span>
                            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 block mt-0.5">
                              {ing.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Beneficios Nutricionales */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block">
                    ✨ Beneficios Clínicos del Menú:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRecipe.benefits.map((b, i) => (
                      <span key={i} className="text-[11px] text-emerald-800 dark:text-emerald-200 font-semibold bg-white dark:bg-stone-850 px-2.5 py-1 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60 shadow-3xs">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Paso a Paso de Preparación */}
                <div className="space-y-2.5">
                  <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Instrucciones Paso a Paso:</span>
                  </h4>

                  <ol className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                    {currentRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-stone-50/80 dark:bg-stone-850/50 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Disclaimer Nutricional en Cápsula Compacta Ámbar */}
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Aviso de Salud NutriPet:</strong> Estas recetas son guías caseras complementarias orientativas. Si vas a alimentar a {activePet.name} 100% con comida casera a largo plazo, consulta con un nutricionista veterinario para adicionar suplementación de calcio, taurina o multivitamínico.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
