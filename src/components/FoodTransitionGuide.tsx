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
      desc: 'El estómago de tu mascota comienza a reconocer los nuevos ingredientes sin alterarse.',
      color: 'bg-amber-500',
    },
    {
      days: 'Días 3 y 4',
      oldFoodPct: 50,
      newFoodPct: 50,
      title: 'Punto medio de adaptación',
      desc: 'Mitad y mitad. Observa la consistencia de las heces y su nivel de energía.',
      color: 'bg-emerald-500',
    },
    {
      days: 'Días 5 y 6',
      oldFoodPct: 25,
      newFoodPct: 75,
      title: 'Predominancia del nuevo alimento',
      desc: 'La flora digestiva ya está aclimatada a la nueva fórmula nutricional.',
      color: 'bg-emerald-600',
    },
    {
      days: 'Día 7 en adelante',
      oldFoodPct: 0,
      newFoodPct: 100,
      title: 'Transición completa',
      desc: '¡Listo! Ración 100% de la nueva marca o receta con total seguridad digestiva.',
      color: 'bg-emerald-700',
    },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg leading-tight">
                Regla de los 7 Días: Transición de Alimento
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 hidden sm:inline-block">
                Cuidado Digestivo
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Cómo cambiar de alimento o marca a {petName} sin causar vómito ni diarrea
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          aria-label={isOpen ? 'Contraer' : 'Expandir'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-5 pt-3 border-t border-stone-100 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Un cambio brusco de croquetas desbalancea la flora intestinal de {petType === 'cat' ? 'los felinos' : 'los perros'}. Mezcla ambos alimentos gradualmente durante 7 días:
            </p>
          </div>

          {/* Gráfico interactivo de los 4 pasos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeStep === idx 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-stone-900 font-heading">
                    {step.days}
                  </span>
                  {step.newFoodPct === 100 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>

                {/* Barra de proporción visual */}
                <div className="h-3 rounded-full bg-stone-200 overflow-hidden flex mb-2.5">
                  <div 
                    style={{ width: `${step.oldFoodPct}%` }} 
                    className="bg-stone-400 h-full transition-all"
                    title={`Comida anterior: ${step.oldFoodPct}%`}
                  />
                  <div 
                    style={{ width: `${step.newFoodPct}%` }} 
                    className={`${step.color} h-full transition-all`}
                    title={`Comida nueva: ${step.newFoodPct}%`}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-stone-500">{step.oldFoodPct}% Anterior</span>
                  <span className="text-emerald-700">{step.newFoodPct}% Nueva</span>
                </div>

                <h4 className="text-xs font-bold text-stone-900 mt-1">{step.title}</h4>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 p-3.5 rounded-2xl">
            <div className="text-xs text-emerald-950 font-medium">
              <span className="font-bold block text-emerald-900">📅 ¿Vas a iniciar este cambio de alimento hoy?</span>
              <span className="text-[11px] text-emerald-800">Programa automáticamente los recordatorios de cada etapa en tu calendario.</span>
            </div>
            <button
              type="button"
              onClick={handleProgramTransition}
              disabled={addedSchedule}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs ${
                addedSchedule 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {addedSchedule ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>¡Programado en Alertas!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Programar Cronograma (7 Días)</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-stone-500 bg-blue-50/60 border border-blue-200/70 p-3 rounded-xl flex items-center justify-between flex-wrap gap-2">
            <span>💡 <strong>Consejo práctico:</strong> Si {petName} presenta heces blandas en algún día, mantén la misma proporción por 2 días más antes de seguir avanzando.</span>
          </div>
        </div>
      )}
    </div>
  );
};
