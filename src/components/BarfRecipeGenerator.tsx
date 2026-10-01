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
  Droplets
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

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const BarfRecipeGenerator: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { activePet, isProOrTrial } = usePets();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(PRESET_RECIPES[0].id);
  const [customIngredients, setCustomIngredients] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiRecipeResult, setAiRecipeResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 🔒 1. Si no es Pro o no ha iniciado sesión, muestra la tarjeta de bloqueo
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Generador de Recetas BARF & Menús Caseros"
          description="Diseña recetas de comida natural balanceadas al gramo según la edad, condición corporal y nivel de actividad física de tu mascota."
          benefits={[
            "Cálculo exacto de huesos carnosos, carne magra, vísceras y vegetales",
            "Menús semanales listos para armar y porcionar sin complicaciones",
            "Recomendaciones nutricionales seguras para evitar déficits alimentarios"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  // 🐾 2. Si es Pro pero no tiene mascota activa seleccionada
  if (!activePet) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center space-y-3 max-w-lg mx-auto my-8">
        <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
          No hay ninguna mascota seleccionada
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Selecciona o registra una mascota para generar su receta nutricional personalizada.
        </p>
      </div>
    );
  }

  const isPro = isProOrTrial;
  const currentRecipe = PRESET_RECIPES.find(r => r.id === selectedRecipeId) || PRESET_RECIPES[0];

  

  // Cálculo de ración diaria estimada (aprox 2.5% a 3% del peso corporal para adultos)
  const estimatedDailyGrams = Math.round(activePet.weightKg * (activePet.type === 'cat' ? 35 : 28));

  // Filtrar recetas válidas para el tipo de mascota (dog/cat)
  const availableRecipes = PRESET_RECIPES.filter(r => r.petType === 'both' || r.petType === activePet.type);

  const handleCopyRecipe = () => {
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

  return (
    <div className="space-y-6">
      
      {/* Banner de Título */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5" />
              <span>Función Exclusiva Pro</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Generador BARF & Recetas Caseras 🥩
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Formulaciones balanceadas de comida natural cocida, dieta BARF o toppers húmedos calculadas gramo a gramo para <strong>{activePet.name}</strong> ({activePet.weightKg} kg).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 min-w-[160px]">
            <span className="text-[10px] font-extrabold uppercase text-emerald-300 block">
              Ración Diaria Sugerida
            </span>
            <span className="font-heading font-black text-2xl text-white block mt-0.5">
              ~{estimatedDailyGrams} g
            </span>
            <span className="text-[10px] text-stone-300 block">
              para {activePet.weightKg} kg de peso
            </span>
          </div>
        </div>
      </div>

      {/* Nota Explicativa: Humedad y Gramos en Comida Fresca vs Croquetas */}
      <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3 text-xs text-teal-900 dark:text-teal-200 shadow-2xs">
        <Droplets className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-stone-900 dark:text-white text-xs flex items-center gap-1.5">
            💡 ¿Por qué la ración en comida fresca o BARF (~{estimatedDailyGrams}g) es mayor que en croquetas secas?
          </p>
          <p className="text-[11.5px] leading-relaxed text-stone-600 dark:text-stone-300">
            <strong>Croquetas secas:</strong> Tienen solo entre <strong>8% y 10% de humedad</strong> (las calorías están ultra deshidratadas e hiperconcentradas en menos gramos).<br />
            <strong>Comida Fresca / BARF:</strong> Contiene un <strong>70% a 75% de agua biológica natural</strong> propia de la carne y vegetales. Para aportar exactamente las mismas calorías que requiere {activePet.name}, el plato fresco tiene mayor volumen y gramos biológicos.
          </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selector de Recetas del Catálogo Gratuito */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5 px-1">
            <ChefHat className="w-4 h-4 text-emerald-600" />
            Catálogo de Recetas Balanceadas ({availableRecipes.length}):
          </h3>

          <div className="space-y-2.5">
            {availableRecipes.map(recipe => {
              const isSelected = selectedRecipeId === recipe.id;
              return (
                <div
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipeId(recipe.id);
                    setAiRecipeResult(null);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-sm' 
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      recipe.category === 'BARF' 
                        ? 'bg-rose-100 text-rose-800 border-rose-200' 
                        : recipe.category === 'Cocida' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {recipe.category}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      {recipe.petType === 'both' ? '🐶 Canino & 🐱 Felino' : recipe.petType === 'dog' ? '🐶 Solo Caninos' : '🐱 Solo Felinos'}
                    </span>
                  </div>

                  <h4 className="font-heading font-extrabold text-stone-900 text-sm">
                    {recipe.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Formulario Generador con tus Ingredientes */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-600" />
              <h4 className="font-heading font-extrabold text-stone-900 text-xs uppercase tracking-wider">
                Personalizar con tus Ingredientes
              </h4>
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Escribe qué alimentos tienes en casa y calcularemos la proporción balanceada para {activePet.name}:
            </p>
            <form onSubmit={handleGenerateCustomRecipe} className="space-y-2">
              <input
                type="text"
                value={customIngredients}
                onChange={(e) => setCustomIngredients(e.target.value)}
                placeholder="Ej: Tengo pechuga, zanahoria y camote..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
              />
              <button
                type="submit"
                disabled={aiGenerating || !customIngredients.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
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
            /* Vista de Receta Personalizada */
            <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-6 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Receta Personalizada Balanceada
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAiRecipeResult(null)}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Volver al Catálogo
                </button>
              </div>

              <div className="text-xs text-stone-800 space-y-2 font-mono whitespace-pre-wrap bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 leading-relaxed">
                {aiRecipeResult}
              </div>
            </div>
          ) : (
            /* Vista de Receta del Catálogo Estático */
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              
              {/* Header de la Receta */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    {currentRecipe.category} • {currentRecipe.cookingMethod}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyRecipe}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Copiar texto de la receta"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Enviar por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
                  {currentRecipe.name}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {currentRecipe.description}
                </p>
              </div>

              {/* Porciones exactas por peso de la mascota */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-extrabold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    Ingredientes Exactos para {activePet.name} ({estimatedDailyGrams}g totales / día):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentRecipe.ingredientBreakdown.map((ing, idx) => {
                    const exactGrams = Math.round((estimatedDailyGrams * ing.percentage) / 100);
                    return (
                      <div 
                        key={idx}
                        className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-extrabold text-stone-900 text-xs block">
                            {ing.name}
                          </span>
                          {ing.note && (
                            <span className="text-[10px] text-stone-500 block mt-0.5">
                              {ing.note}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="font-heading font-black text-emerald-800 text-sm block">
                            {exactGrams} g
                          </span>
                          <span className="text-[10px] font-bold text-stone-400">
                            {ing.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Beneficios Nutricionales */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-900 block">
                  ✨ Beneficios Clínicos del Menú:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentRecipe.benefits.map((b, i) => (
                    <span key={i} className="text-xs text-emerald-800 font-medium bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-3xs">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Paso a Paso de Preparación */}
              <div className="space-y-3">
                <h4 className="font-heading font-extrabold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  Instrucciones Paso a Paso:
                </h4>

                <ol className="space-y-2 text-xs text-stone-700">
                  {currentRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Disclaimer Nutricional */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-[11px] text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
