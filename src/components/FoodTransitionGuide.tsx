import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Bell, Sparkles } from 'lucide-react';
import { usePets } from '../context/PetContext';

interface FoodTransitionGuideProps {
  petName?: string;
  petType?: 'dog' | 'cat';
}

export const FoodTransitionGuide: React.FC<FoodTransitionGuideProps> = ({ 
  petName = 'tu mascota', 
  petType = 'dog' 
}) => {
  const { addReminder, activePet } = usePets();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [addedSchedule, setAddedSchedule] = useState(false);

  const handleProgramTransition = async () => {
    const today = new Date();
    
    // Día 1
    const d1 = new Date(today);
    await addReminder({
      type: 'checkup',
      name: `Transición Alimento D1-2 (75% Viejo / 25% Nuevo)`,
      dueDate: d1.toISOString().split('T')[0],
      dosage: 'Mezcla 75% alimento actual con 25% alimento nuevo',
      completed: false
    });

    // Día 3
    const d3 = new Date(today);
    d3.setDate(d3.getDate() + 2);
    await addReminder({
      type: 'checkup',
      name: `Transición Alimento D3-4 (50% Viejo / 50% Nuevo)`,
      dueDate: d3.toISOString().split('T')[0],
      dosage: 'Mezcla 50% alimento actual con 50% alimento nuevo',
      completed: false
    });

    // Día 5
    const d5 = new Date(today);
    d5.setDate(d5.getDate() + 4);
    await addReminder({
      type: 'checkup',
      name: `Transición Alimento D5-6 (25% Viejo / 75% Nuevo)`,
      dueDate: d5.toISOString().split('T')[0],
      dosage: 'Mezcla 25% alimento actual con 75% alimento nuevo',
      completed: false
    });

    // Día 7
    const d7 = new Date(today);
    d7.setDate(d7.getDate() + 6);
    await addReminder({
      type: 'checkup',
      name: `Transición Alimento Día 7+ (100% Nuevo Alimento)`,
      dueDate: d7.toISOString().split('T')[0],
      dosage: 'Servir 100% del nuevo alimento',
      completed: false
    });

    setAddedSchedule(true);
    setTimeout(() => setAddedSchedule(false), 5000);
  };

  const steps = [
    {
      days: 'Días 1 y 2',
      oldFoodPct: 75,
      newFoodPct: 25,
      title: 'Introducción suave',
      desc: 'El estómago reconoce nuevos ingredientes.',
      color: 'bg-amber-500',
    },
    {
      days: 'Días 3 y 4',
      oldFoodPct: 50,
      newFoodPct: 50,
      title: 'Adaptación 50/50',
      desc: 'Heces firmes y niveles de energía constantes.',
      color: 'bg-emerald-500',
    },
    {
      days: 'Días 5 y 6',
      oldFoodPct: 25,
      newFoodPct: 75,
      title: 'Predominancia nueva',
      desc: 'Microbiota intestinal aclimatada a la fórmula.',
      color: 'bg-teal-600',
    },
    {
      days: 'Día 7 en adelante',
      oldFoodPct: 0,
      newFoodPct: 100,
      title: 'Transición 100%',
      desc: '¡Ración completa con total seguridad digestiva!',
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5 transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm leading-tight truncate">
                Regla de los 7 Días: Transición de Alimento
              </h3>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                Cuidado Digestivo
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
              Cambio gradual para {petName} sin vómitos ni diarrea
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors shrink-0 ml-2 cursor-pointer"
          aria-label={isOpen ? 'Contraer' : 'Expandir'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 animate-fade-in">
          {/* Gráfico interactivo compacto de 4 pasos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeStep === idx 
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs' 
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-black text-stone-900 dark:text-stone-100 font-heading">
                      {step.days}
                    </span>
                    {step.newFoodPct === 100 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>

                  {/* Barra de proporción visual fina */}
                  <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden flex mb-1.5">
                    <div 
                      style={{ width: `${step.oldFoodPct}%` }} 
                      className="bg-stone-400 h-full transition-all"
                    />
                    <div 
                      style={{ width: `${step.newFoodPct}%` }} 
                      className={`${step.color} h-full transition-all`}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-extrabold mb-1">
                    <span className="text-stone-400">{step.oldFoodPct}% Ant.</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{step.newFoodPct}% Nuevo</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-stone-200/50 dark:border-stone-800/80">
                  <h4 className="text-[10px] font-black text-stone-800 dark:text-stone-200 leading-tight">{step.title}</h4>
                  <p className="text-[9px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug line-clamp-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fila Inferior Compacta: Recordatorio & Consejo integrados */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/70 dark:border-emerald-800/50 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 min-w-0">
              <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-[10px] leading-tight text-stone-600 dark:text-stone-300">
                Si presenta heces blandas, mantén la misma proporción por 2 días más.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleProgramTransition}
              disabled={addedSchedule}
              className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs ${
                addedSchedule 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {addedSchedule ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>¡Programado en Alertas!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Programar en Calendario</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};