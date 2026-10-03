import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import { 
  Sparkles, 
  ChefHat, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Utensils, 
  RefreshCw, 
  Save, 
  Download, 
  Info,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { PetProfile, CalculationResult } from '../types';
import { calculatePetNutrition } from '../data';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const BarfRecipeGenerator: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { activePet, isProOrTrial } = usePets();

  // 🔒 1. Si no es Pro o no ha iniciado sesión, muestra la tarjeta de bloqueo
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Generador Avanzado de Menús y Recetas BARF"
          description="Diseña raciones biológicamente apropiadas y personalizadas al gramo exacto según el peso, edad y nivel de actividad de tu mascota."
          benefits={[
            "Desglose exacto en gramos de huesos carnosos, carne magra, vísceras y vegetales",
            "Generador interactivo de recetas equilibradas según especie canina o felina",
            "Opciones de rotación de proteínas y recomendaciones para transición segura"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  // 🐾 2. Si es Pro pero no tiene mascota activa seleccionada
  if (!activePet) {
    return (
      <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3 max-w-lg mx-auto my-8">
        <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
          No hay ninguna mascota seleccionada
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-xs">
          Selecciona o registra una mascota para generar sus recetas y proporciones BARF personalizadas.
        </p>
      </div>
    );
  }

  const result: CalculationResult = calculatePetNutrition(activePet);
  const barf = result.barfBreakdown;
  const isDog = activePet.type === 'dog';

  const [selectedProtein, setSelectedProtein] = useState<'chicken' | 'beef' | 'turkey' | 'lamb'>('chicken');
  const [selectedViscera, setSelectedViscera] = useState<'beef_liver' | 'chicken_liver'>('chicken_liver');

  const proteins = {
    chicken: { name: 'Pollo / Gallina', bone: 'Alitas, cuellos o carcasas de pollo', meat: 'Pechuga o muslo sin piel' },
    beef: { name: 'Res / Ternera', bone: 'Costilla tierna o cola de res', meat: 'Carne magra de res / corazón' },
    turkey: { name: 'Pavo', bone: 'Cuello de pavo o puntas de ala', meat: 'Pechuga o solomillo de pavo' },
    lamb: { name: 'Cordero', bone: 'Costillas o cuartos traseros tiernos', meat: 'Magro de pierna de cordero' }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900 dark:text-stone-100 leading-tight">
                Generador de Menú Natural BARF
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Plan nutricional adaptado a <strong className="text-stone-800 dark:text-stone-200">{activePet.name}</strong> ({activePet.weightKg} kg)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800">
            {barf?.percentage}% del peso corporal
          </span>
        </div>

        {/* Resumen diario */}
        <div className="mt-6 p-5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Ración Diaria Total:
            </span>
            <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white font-heading">
              {barf?.totalGrams || 0} <span className="text-base font-bold text-amber-600">gramos/día</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-stone-900 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold text-stone-400 block uppercase">Tomas recomendadas</span>
              <span className="text-base font-extrabold text-stone-800 dark:text-stone-200">
                {result.mealsPerDay} tomas al día
              </span>
            </div>
            <div className="bg-white dark:bg-stone-900 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold text-stone-400 block uppercase">Por toma</span>
              <span className="text-base font-extrabold text-amber-600">
                {Math.round((barf?.totalGrams || 0) / result.mealsPerDay)}g
              </span>
            </div>
          </div>
        </div>

        {/* Proporciones en gramos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">Huesos Carnosos</span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-heading block mt-1">
              {barf?.meatyBonesGrams}g
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">50% de la ración</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">Carne Magra</span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-heading block mt-1">
              {barf?.muscleMeatGrams}g
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">30% músculo</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">Vísceras y Órganos</span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-heading block mt-1">
              {barf?.organsGrams}g
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">10% víscera / hígado</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
              {isDog ? 'Vegetales & Fruta' : 'Complementos Felinos'}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-heading block mt-1">
              {barf?.vegetablesFruitsGrams}g
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
              {isDog ? '10% triturado' : 'Taurina & Fibra'}
            </span>
          </div>
        </div>

        {/* Creador de plato */}
        <div className="mt-8 space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            Configurador de Proteína para Hoy
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(proteins) as Array<keyof typeof proteins>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedProtein(key)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedProtein === key
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                }`}
              >
                {proteins[key].name}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Plato sugerido para {activePet.name}:
            </h4>
            <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-stone-800">
                <span>🦴 <strong>Hueso carnoso ({barf?.meatyBonesGrams}g):</strong> {proteins[selectedProtein].bone}</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-stone-800">
                <span>🥩 <strong>Carne magra ({barf?.muscleMeatGrams}g):</strong> {proteins[selectedProtein].meat}</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-stone-200/60 dark:border-stone-800">
                <span>🫀 <strong>Vísceras ({barf?.organsGrams}g):</strong> 50% hígado + 50% riñón/bazo</span>
              </li>
              {isDog && (
                <li className="flex items-center justify-between py-1">
                  <span>🥦 <strong>Vegetales ({barf?.vegetablesFruitsGrams}g):</strong> Calabacín, zanahoria y manzana finamente procesados</span>
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
