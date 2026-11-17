import React, { useMemo } from 'react';
import { PetProfile, AppTab } from '../types';
import { usePets } from '../context/PetContext';
import { RadialHealthGauge } from './RadialHealthGauge';
import { getSuggestedIdealWeight } from '../data';
import { DEMO_WEIGHT_LOGS } from '../data/demoPet';
import {
  Activity,
  Scale,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Clock,
  ClipboardList,
  ChevronRight
} from 'lucide-react';

interface PetHealthTimelineProps {
  profile: PetProfile;
  onSelectTab?: (tab: AppTab) => void;
  className?: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  timestamp: number;
  category: 'weight' | 'medical' | 'reminder' | 'bath';
  title: string;
  subtitle: string;
  badgeText: string;
  badgeClass: string;
  icon: React.ReactNode;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [y, m, d] = parts;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIdx = parseInt(m, 10) - 1;
    return `${parseInt(d, 10)} ${months[monthIdx] || m}`;
  } catch {
    return dateStr;
  }
};

export const PetHealthTimeline: React.FC<PetHealthTimelineProps> = ({
  profile,
  onSelectTab,
  className = ''
}) => {
  const { weightLogs, medicalRecords, reminders, bathLogs } = usePets();

  // Biometría y condición física calculada
  const suggestedIdeal = getSuggestedIdealWeight(profile);
  const targetWeight = Number((profile.idealWeightKg || suggestedIdeal || profile.weightKg || 1).toFixed(1));
  const currentWeight = Number((profile.weightKg || 0).toFixed(1));
  const weightDiff = Number((currentWeight - targetWeight).toFixed(1));
  const deviationRatio = targetWeight > 0 ? Math.abs(weightDiff) / targetWeight : 0;
  const healthScorePercentage = Math.round(Math.max(25, Math.min(100, (1 - deviationRatio) * 100)));

  const conditionMeta = useMemo(() => {
    if (weightDiff > targetWeight * 0.05) {
      return {
        text: `Sobrepeso (+${weightDiff} kg)`,
        scheme: 'amber' as const
      };
    }
    if (weightDiff < -(targetWeight * 0.05)) {
      return {
        text: `Bajo peso (${weightDiff} kg)`,
        scheme: 'blue' as const
      };
    }
    return {
      text: 'Peso Óptimo',
      scheme: 'forest' as const
    };
  }, [weightDiff, targetWeight]);

  // Unificación cronológica de eventos reales de la mascota
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Registros de peso
    const isDemo = profile.id === 'demo_pet_otb';
    const petWeights = isDemo ? DEMO_WEIGHT_LOGS : (weightLogs || []).filter(w => w.petId === profile.id);
    petWeights.forEach(w => {
      events.push({
        id: `weight-${w.id}`,
        date: w.date,
        timestamp: new Date(w.date).getTime() || 0,
        category: 'weight',
        title: `${w.weightKg} kg`,
        subtitle: w.notes?.trim() ? w.notes : 'Control de peso registrado',
        badgeText: 'PESO',
        badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40',
        icon: <Scale className="w-3 h-3 text-blue-600 dark:text-blue-400" />
      });
    });

    if (isDemo) {
      events.push({
        id: 'demo-med-1',
        date: '2026-10-15',
        timestamp: new Date('2026-10-15').getTime(),
        category: 'medical',
        title: 'Evaluación Nutricional & Oídos',
        subtitle: 'Dra. Camila Morales • Conducto auditivo sano y dieta balanceada.',
        badgeText: 'CONSULTA',
        badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40',
        icon: <Stethoscope className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
      });
      events.push({
        id: 'demo-rem-1',
        date: '2026-11-20',
        timestamp: new Date('2026-11-20').getTime(),
        category: 'reminder',
        title: 'Refuerzo Anual Polivalente Canina',
        subtitle: 'Clínica VetCare • Esquema preventivo al día.',
        badgeText: 'VACUNA',
        badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40',
        icon: <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      });
    }

    // 2. Expediente médico y consultas
    const petMedicals = (medicalRecords || []).filter(m => m.petId === profile.id);
    petMedicals.forEach(m => {
      const isSurgery = m.type === 'surgery';
      const isExam = m.type === 'exam' || m.type === 'xray';
      const isPrescription = m.type === 'prescription' || m.type === 'treatment';
      const badge = isSurgery ? 'CIRUGÍA' : isExam ? 'EXAMEN' : isPrescription ? 'RECETA' : 'CONSULTA';

      events.push({
        id: `medical-${m.id}`,
        date: m.date,
        timestamp: new Date(m.date).getTime() || 0,
        category: 'medical',
        title: m.title || 'Consulta Veterinaria',
        subtitle: m.diagnosis?.trim() || m.veterinarian?.trim() || m.notes?.trim() || 'Atención veterinaria',
        badgeText: badge,
        badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40',
        icon: <Stethoscope className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
      });
    });

    // 3. Recordatorios y vacunas
    const petReminders = (reminders || []).filter(r => r.petId === profile.id);
    petReminders.forEach(r => {
      const badge = r.type === 'vaccine' ? 'VACUNA' : r.type === 'deworming' ? 'DESPARASIT.' : 'PREVENCIÓN';

      events.push({
        id: `reminder-${r.id}`,
        date: r.dueDate,
        timestamp: new Date(r.dueDate).getTime() || 0,
        category: 'reminder',
        title: r.name,
        subtitle: r.completed ? 'Recordatorio completado' : (r.notes?.trim() || 'Recordatorio preventivo'),
        badgeText: badge,
        badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40',
        icon: <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      });
    });

    // 4. Registros de higiene y baño
    const petBaths = (bathLogs || []).filter(b => b.petId === profile.id);
    petBaths.forEach(b => {
      const typeLabel =
        b.type === 'medicated'
          ? 'Baño Medicado'
          : b.type === 'grooming'
          ? 'Peluquería / Corte'
          : b.type === 'dry_wash'
          ? 'Baño en Seco'
          : 'Baño de Rutina';

      events.push({
        id: `bath-${b.id}`,
        date: b.date,
        timestamp: new Date(b.date).getTime() || 0,
        category: 'bath',
        title: typeLabel,
        subtitle: b.shampooUsed ? `Champú: ${b.shampooUsed}` : (b.notes?.trim() || 'Higiene registrada'),
        badgeText: 'HIGIENE',
        badgeClass: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-900/40',
        icon: <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
      });
    });

    // Orden descendente (más reciente primero)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [weightLogs, medicalRecords, reminders, bathLogs, profile.id]);

  return (
    <div className={`bg-white dark:bg-[#151c17] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 space-y-4 shadow-2xs ${className}`}>
      {/* Cabecera del Módulo */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#143826]/10 dark:bg-[#3f6e58]/25 flex items-center justify-center text-[#143826] dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 font-mono">
              Salud & Actividad
            </h3>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Monitoreo clínico continuo
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700">
          {timelineEvents.length} {timelineEvents.length === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      {/* Medidor Radial de Salud */}
      <RadialHealthGauge
        value={healthScorePercentage}
        label="Índice Biométrico"
        sublabel={`${currentWeight} kg`}
        statusText={conditionMeta.text}
        colorScheme={conditionMeta.scheme}
        className="border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/50"
      />

      {/* Comparativa Rápida de Peso */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/80">
          <span className="text-[9px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400 block">
            Peso Meta
          </span>
          <span className="text-xs font-bold font-tabular text-stone-800 dark:text-stone-200">
            {targetWeight} kg
          </span>
        </div>
        <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/80">
          <span className="text-[9px] uppercase tracking-wider font-mono text-stone-500 dark:text-stone-400 block">
            Diferencia
          </span>
          <span className={`text-xs font-bold font-tabular ${
            weightDiff === 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : weightDiff > 0
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-blue-700 dark:text-blue-400'
          }`}>
            {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
          </span>
        </div>
      </div>

      {/* Timeline Vertical de Eventos */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider text-stone-500 dark:text-stone-400">
            <Clock className="w-3 h-3" />
            Línea de Tiempo
          </span>
          {timelineEvents.length > 0 && (
            <span className="text-[10px] text-stone-600 dark:text-stone-400 font-mono">
              Recientes
            </span>
          )}
        </div>

        {timelineEvents.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-1.5 bg-stone-50/50 dark:bg-stone-900/30">
            <div className="w-8 h-8 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
              Sin eventos registrados
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
              Las consultas, vacunas y pesajes que agregues se sincronizarán aquí.
            </p>
          </div>
        ) : (
          <div className="relative pl-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {/* Guía vertical del timeline */}
            <div className="absolute left-[8px] top-2 bottom-2 w-px bg-stone-200 dark:border-stone-800 dark:bg-stone-800" />

            {timelineEvents.slice(0, 15).map(event => (
              <div key={event.id} className="relative">
                {/* Icono de hito */}
                <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-2xs z-10">
                  {event.icon}
                </div>

                {/* Tarjeta de hito clínico */}
                <div className="p-2.5 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 space-y-1 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${event.badgeClass}`}>
                      {event.badgeText}
                    </span>
                    <span className="text-[10px] font-tabular text-stone-600 dark:text-stone-400">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {event.title}
                  </p>
                  {event.subtitle && (
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1">
                      {event.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enlace al Expediente Clínico */}
      {onSelectTab && (
        <button
          type="button"
          onClick={() => onSelectTab('medical')}
          className="w-full mt-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800/80 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-between transition-colors border border-stone-200/60 dark:border-stone-700/60 cursor-pointer"
        >
          <span>Ver expediente clínico</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
        </button>
      )}
    </div>
  );
};
