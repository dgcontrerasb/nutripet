import React, { useState, useEffect } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ShieldAlert, 
  Calendar, 
  Pill, 
  Sparkles, 
  Clock, 
  X,
  AlertTriangle,
  HeartPulse,
  LayoutList,
  CalendarDays,
  Droplets,
  Scissors,
  Info
} from 'lucide-react';
import { Reminder, BathLog } from '../types';
import { RemindersCalendar } from './RemindersCalendar';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const RemindersModule: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { 
    activePet, 
    isProOrTrial,
    reminders, 
    addReminder, 
    toggleReminder, 
    deleteReminder, 
    clearAllReminders,
    bathLogs,
    addBathLog,
    deleteBathLog 
  } = usePets();

  const [activeTab, setActiveTab] = useState<'vaccines' | 'bath' | 'calendar'>('vaccines');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBathModal, setShowBathModal] = useState<boolean>(false);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Estado para el modal inteligente de completar recordatorio con re-programación
  const [completingReminderState, setCompletingReminderState] = useState<{
    reminder: Reminder;
    completionDate: string;
    recurringDays: number;
    autoReschedule: boolean;
    logBathHistory: boolean;
    shampooUsed: string;
  } | null>(null);

  // Estado para registro de baño
  const [bathForm, setBathForm] = useState<{
    date: string;
    type: BathLog['type'];
    shampooUsed: string;
    nextBathDays: number;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    type: 'routine',
    shampooUsed: '',
    nextBathDays: 21,
    notes: ''
  });
  
  // Estado para confirmación de plantillas rápidas con fecha editable
  const [confirmQuickTemplate, setConfirmQuickTemplate] = useState<{
    name: string;
    type: Reminder['type'];
    days: number;
    dosage?: string;
    calculatedDate: string;
    editableDate: string;
  } | null>(null);

  // Estado para confirmación rápida de plantilla de baño
  const [confirmQuickBath, setConfirmQuickBath] = useState<{
    name: string;
    bathType: BathLog['type'];
    daysToNext: number;
    shampooUsed: string;
    bathDate: string;
  } | null>(null);

  const [form, setForm] = useState<{
    type: Reminder['type'];
    name: string;
    dueDate: string;
    dosage: string;
    notes: string;
  }>({
    type: 'vaccine',
    name: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dosage: '',
    notes: ''
  });

  // Bloqueo de scroll del body cuando cualquier modal está abierto
  const isAnyModalOpen = Boolean(
    showAddModal || 
    showBathModal || 
    showClearAllModal || 
    confirmQuickTemplate || 
    confirmQuickBath || 
    completingReminderState
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // 🔒 1. Validación de suscripción Pro
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Sistema Inteligente de Vacunas y Notificaciones"
          description="Lleva el control de fechas de vacunación, desparasitaciones periódicas, citas veterinarias y corte de uñas sin olvidar ningún evento importante."
          benefits={[
            "Esquema completo de vacunación y refuerzos anuales para perros y gatos",
            "Control y avisos de desparasitación interna y externa",
            "Historial organizado de eventos médicos con alertas personalizadas"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  // 🐾 2. Validación de mascota activa seleccionada
  if (!activePet) {
    return (
      <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3 max-w-lg mx-auto my-8">
        <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
          No hay ninguna mascota seleccionada
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-xs">
          Selecciona o registra una mascota para gestionar sus vacunas y recordatorios.
        </p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Calcular edad y etapa de la mascota
  const getPetAgeInfo = () => {
    const ageMonths = activePet.ageMonths || 24;
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 12) {
      return { stage: 'cachorro', label: 'Cachorro', advice: 'Esquema de vacunación inicial' };
    } else if (ageYears >= 7) {
      return { stage: 'senior', label: 'Senior', advice: 'Chequeos más frecuentes recomendados' };
    } else {
      return { stage: 'adulto', label: 'Adulto', advice: 'Refuerzos anuales' };
    }
  };

  const petAgeInfo = getPetAgeInfo();

  const handleOpenAddModalWithDate = (dateStr: string) => {
    setForm(prev => ({ ...prev, dueDate: dateStr }));
    setShowAddModal(true);
  };

  const shareViaWhatsApp = (rem: Reminder) => {
    const text = `🐾 *Recordatorio NutriPet para ${activePet.name}*\n📌 *Evento:* ${rem.name}\n📅 *Fecha:* ${rem.dueDate}${rem.dosage ? `\n💊 *Dosis:* ${rem.dosage}` : ''}${rem.notes ? `\n📝 *Notas:* ${rem.notes}` : ''}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const exportToCalendar = (rem: Reminder) => {
    const title = `[NutriPet] ${rem.name} - ${activePet.name}`;
    const details = `Recordatorio para ${activePet.name}. Dosis: ${rem.dosage || 'N/A'}. ${rem.notes || ''}`;
    const dateFormatted = rem.dueDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nDTSTART:${dateFormatted}T090000Z\nDTEND:${dateFormatted}T100000Z\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `nutripet_${rem.name.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recordatorios de salud (vacunas, medicación, desparasitaciones)
  const healthReminders = reminders.filter(r => r.type !== 'bath');
  const filteredHealthReminders = healthReminders.filter(r => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  // Recordatorios de baño
  const bathRemindersList = reminders.filter(r => r.type === 'bath');
  const filteredBathReminders = bathRemindersList.filter(r => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    await addReminder({
      type: form.type,
      name: form.name.trim(),
      dueDate: form.dueDate,
      dosage: form.dosage.trim() || undefined,
      notes: form.notes.trim() || undefined,
      completed: false
    });

    setShowAddModal(false);
    setForm({
      type: 'vaccine',
      name: '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dosage: '',
      notes: ''
    });
  };

  // Inferencia inteligente de días de ciclo recurrente
  const inferIntervalDays = (rem: Reminder): number => {
    if (rem.recurringDays && rem.recurringDays > 0) {
      return rem.recurringDays;
    }
    const nameLower = (rem.name + ' ' + (rem.notes || '')).toLowerCase();
    
    if (rem.type === 'bath' || nameLower.includes('baño') || nameLower.includes('grooming')) {
      if (nameLower.includes('medicado') || nameLower.includes('dermatol')) return 7;
      if (nameLower.includes('corte') || nameLower.includes('peluquer') || nameLower.includes('grooming')) return 45;
      if (nameLower.includes('uñas') || nameLower.includes('oídos')) return 15;
      if (nameLower.includes('seco') || nameLower.includes('cepillado')) return 7;
      return 21;
    }

    if (rem.type === 'deworming' || nameLower.includes('antipulgas') || nameLower.includes('pipeta') || nameLower.includes('desparasit')) {
      if (nameLower.includes('trimestral') || nameLower.includes('interno') || nameLower.includes('oral')) return 90;
      return 30;
    }

    if (rem.type === 'vaccine' || nameLower.includes('vacuna') || nameLower.includes('antirrábica') || nameLower.includes('triple')) {
      if (nameLower.includes('semestral') || nameLower.includes('tos') || nameLower.includes('bordetella')) return 180;
      return 365;
    }

    if (rem.type === 'checkup' || nameLower.includes('control') || nameLower.includes('chequeo')) {
      return 180;
    }

    if (rem.type === 'medication' || nameLower.includes('medic')) {
      return 7;
    }

    return 30;
  };

  const handleAttemptToggle = (rem: Reminder) => {
    if (rem.completed) {
      toggleReminder(rem.id, true);
      return;
    }

    const defaultDays = inferIntervalDays(rem);
    const isBath = rem.type === 'bath';

    setCompletingReminderState({
      reminder: rem,
      completionDate: todayStr,
      recurringDays: defaultDays,
      autoReschedule: true,
      logBathHistory: isBath,
      shampooUsed: rem.dosage ? rem.dosage.replace(/Shampoo:\s*/i, '') : ''
    });
  };

  const confirmCompleteReminder = async () => {
    if (!completingReminderState) return;

    const { reminder, completionDate, recurringDays, autoReschedule, logBathHistory, shampooUsed } = completingReminderState;

    await toggleReminder(reminder.id, false);

    if (autoReschedule && recurringDays > 0) {
      const baseDate = new Date(completionDate + 'T00:00:00');
      const nextDateObj = new Date(baseDate.getTime() + recurringDays * 24 * 60 * 60 * 1000);
      const nextDueDate = nextDateObj.toISOString().split('T')[0];

      let nextNotes = reminder.notes;
      if (!nextNotes || !nextNotes.includes('Programado automáticamente')) {
        nextNotes = `Programado automáticamente tras completar el ${completionDate}.`;
      }

      await addReminder({
        type: reminder.type,
        name: reminder.name,
        dueDate: nextDueDate,
        dosage: reminder.dosage,
        notes: nextNotes,
        recurringDays: recurringDays,
        completed: false
      });
    }

    if (reminder.type === 'bath' && logBathHistory) {
      const nameLower = reminder.name.toLowerCase();
      const bathType: BathLog['type'] = 
        nameLower.includes('medicado') ? 'medicated' :
        nameLower.includes('corte') || nameLower.includes('peluquer') ? 'grooming' :
        nameLower.includes('seco') ? 'dry_wash' : 'routine';

      await addBathLog({
        date: completionDate,
        type: bathType,
        shampooUsed: shampooUsed.trim() || undefined,
        notes: `Completado desde recordatorios (${reminder.name})`
      });
    }

    setCompletingReminderState(null);
  };

  const getUrgency = (dueDate: string, completed: boolean) => {
    if (completed) return { label: 'Completado', color: 'text-stone-400 bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700' };
    if (dueDate < todayStr) {
      const diffDays = Math.ceil((new Date(todayStr + 'T00:00:00').getTime() - new Date(dueDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
      return { 
        label: `⚠️ Vencido (hace ${diffDays} día${diffDays > 1 ? 's' : ''})`, 
        color: 'text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-400 border-red-300 font-extrabold shadow-2xs' 
      };
    }
    if (dueDate === todayStr) return { label: '¡Toca Hoy!', color: 'text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 font-extrabold' };
    
    const diffDays = Math.ceil((new Date(dueDate + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return { label: `En ${diffDays} días`, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200' };

    return { label: `El ${dueDate}`, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200' };
  };

  const addQuickTemplate = (name: string, type: Reminder['type'], defaultDays: number, dosage?: string) => {
    const targetDate = new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setConfirmQuickTemplate({
      name,
      type,
      days: defaultDays,
      dosage,
      calculatedDate: targetDate,
      editableDate: targetDate
    });
  };

  const confirmQuickTemplateCreate = async () => {
    if (!confirmQuickTemplate) return;
    
    await addReminder({
      type: confirmQuickTemplate.type,
      name: confirmQuickTemplate.name,
      dueDate: confirmQuickTemplate.editableDate,
      dosage: confirmQuickTemplate.dosage,
      completed: false
    });
    
    setConfirmQuickTemplate(null);
  };

  const addQuickBathTemplate = (name: string, bathType: BathLog['type'], daysToNext: number, shampooUsed: string) => {
    setConfirmQuickBath({
      name,
      bathType,
      daysToNext,
      shampooUsed,
      bathDate: new Date().toISOString().split('T')[0]
    });
  };

  const confirmQuickBathCreate = async () => {
    if (!confirmQuickBath) return;

    await addBathLog({
      date: confirmQuickBath.bathDate,
      type: confirmQuickBath.bathType,
      shampooUsed: confirmQuickBath.shampooUsed,
      notes: `Registrado vía plantilla rápida (${confirmQuickBath.name})`
    });

    const nextDate = new Date(new Date(confirmQuickBath.bathDate + 'T00:00:00').getTime() + confirmQuickBath.daysToNext * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    await addReminder({
      type: 'bath',
      name: `Próximo Baño: ${confirmQuickBath.name}`,
      dueDate: nextDate,
      dosage: confirmQuickBath.shampooUsed ? `Shampoo: ${confirmQuickBath.shampooUsed}` : undefined,
      notes: `Programado automáticamente tras el baño del ${confirmQuickBath.bathDate}.`,
      completed: false
    });

    setConfirmQuickBath(null);
  };

  const lastBath = bathLogs.length > 0 ? bathLogs[0] : null;
  const daysSinceLastBath = lastBath 
    ? Math.floor((new Date().getTime() - new Date(lastBath.date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const nextBathReminder = reminders.find(r => r.type === 'bath' && !r.completed);

  const handleSaveBathLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bathForm.date) return;

    await addBathLog({
      date: bathForm.date,
      type: bathForm.type,
      shampooUsed: bathForm.shampooUsed.trim() || undefined,
      notes: bathForm.notes.trim() || undefined,
    });

    const nextDate = new Date(new Date(bathForm.date + 'T00:00:00').getTime() + bathForm.nextBathDays * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const bathTypeLabel = 
      bathForm.type === 'routine' ? 'Baño Rutinario' :
      bathForm.type === 'medicated' ? 'Baño Medicado' :
      bathForm.type === 'dry_wash' ? 'Baño en Seco' : 'Peluquería Completa';

    await addReminder({
      type: 'bath',
      name: `Próximo Baño: ${bathTypeLabel}`,
      dueDate: nextDate,
      dosage: bathForm.shampooUsed ? `Shampoo: ${bathForm.shampooUsed}` : undefined,
      notes: `Programado automáticamente tras el baño del ${bathForm.date}.`,
      completed: false
    });

    setShowBathModal(false);
    setBathForm({
      date: new Date().toISOString().split('T')[0],
      type: 'routine',
      shampooUsed: '',
      nextBathDays: 21,
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y acciones */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-xl text-stone-900 dark:text-stone-100">
              Vacunas y Notificaciones de {activePet.name}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {reminders.filter(r => !r.completed).length} pendientes
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Nunca olvides una dosis, pastilla antipulgas o refuerzo vacunal. Sincronizado en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher */}
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('vaccines')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vaccines'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>💉 Vacunas & Salud</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bath')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bath'
                  ? 'bg-white dark:bg-stone-700 text-teal-900 dark:text-teal-300 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Control de Baño & Grooming</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-stone-700 text-blue-900 dark:text-blue-300 shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Calendario Mensual</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Crear Recordatorio
            </button>
          </div>
        </div>
      </div>

      {/* BANNER DE ALERTA POR RECORDATORIOS VENCIDOS */}
      {(() => {
        const overdueHealthCount = healthReminders.filter(r => !r.completed && r.dueDate < todayStr).length;
        const overdueBathCount = bathRemindersList.filter(r => !r.completed && r.dueDate < todayStr).length;
        const totalOverdue = overdueHealthCount + overdueBathCount;

        if (totalOverdue === 0) return null;

        return (
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-black text-red-950 dark:text-red-200 text-sm sm:text-base">
                  ⚠️ Tienes {totalOverdue} recordatorio(s) vencido(s)
                </h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5 leading-relaxed">
                  Los recordatorios vencidos <strong>permanecen visibles</strong> para cuidar la salud de {activePet.name}. Haz clic en el ícono (⭕) para completarlos y re-programar el siguiente ciclo automáticamente.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Ver Pendientes ({totalOverdue})
            </button>
          </div>
        );
      })()}

      <div id="reminders-printable-container" className="space-y-6">
        {activeTab === 'calendar' && (
          <RemindersCalendar 
            onOpenAddModalWithDate={handleOpenAddModalWithDate} 
            onToggleReminder={handleAttemptToggle}
          />
        )}

        {activeTab === 'bath' && (
          <div className="space-y-6">
            {/* Banner Destacado de Estado y Resumen de Baño */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 bg-white/20 backdrop-blur-xs rounded-2xl">
                      <Droplets className="w-6 h-6 text-white" />
                    </span>
                    <div>
                      <h4 className="font-heading font-extrabold text-lg text-white">
                        Control de Baño e Higiene de {activePet.name}
                      </h4>
                      <p className="text-xs text-teal-100">
                        {activePet.type === 'dog' ? 'Canino' : 'Felino'} • Registro de baños, shampoos y cuidados dermatológicos
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/20 text-xs">
                      <span className="text-teal-200 block text-[10px] uppercase font-bold">Último Baño Registrado</span>
                      <strong className="text-white font-extrabold text-sm">
                        {lastBath ? `${lastBath.date} (${daysSinceLastBath === 0 ? 'Hoy' : `hace ${daysSinceLastBath} días`})` : 'Sin registros aún'}
                      </strong>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/20 text-xs">
                      <span className="text-teal-200 block text-[10px] uppercase font-bold">Próximo Baño Programado</span>
                      <strong className="text-white font-extrabold text-sm">
                        {nextBathReminder ? nextBathReminder.dueDate : 'Por programar'}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBathModal(true)}
                  className="px-5 py-3 bg-white text-teal-900 hover:bg-teal-50 font-extrabold text-xs rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-white/40"
                >
                  <Droplets className="w-4 h-4 text-teal-600" />
                  <span>🛁 Registrar Baño Realizado Hoy</span>
                </button>
              </div>
            </div>

            {/* Plantillas Rápidas de Higiene */}
            <div className="p-5 bg-teal-50/70 dark:bg-teal-950/20 rounded-3xl border border-teal-200/80 dark:border-teal-800/60 shadow-3xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-400 animate-pulse" />
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-teal-950 dark:text-teal-200">
                  Plantillas Rápidas de Higiene & Grooming
                </h5>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Selecciona la tarea realizada. Podrás confirmar la fecha del baño y se programará el siguiente recordatorio automáticamente.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Baño Rutinario con Agua y Shampoo', 'routine', 21, 'Shampoo neutro canino')}
                  className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-teal-100 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  🧼 + Baño Rutinario (21 días)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Baño Medicado / Dermatológico', 'medicated', 7, 'Shampoo clorhexidina o hipoalergénico')}
                  className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-teal-100 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  🧴 + Baño Medicado (7 días)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Peluquería y Corte de Pelo', 'grooming', 45, 'Servicio completo de peluquería')}
                  className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-teal-100 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  ✂️ + Peluquería & Corte (45 días)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Corte de Uñas e Higiene de Oídos', 'routine', 15, 'Cortaúñas + solución auricular')}
                  className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-teal-100 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  💅 + Corte Uñas & Oídos (15 días)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Cepillado Profundo de Pelaje', 'dry_wash', 3, 'Peine o cepillo deslanador')}
                  className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-teal-100 dark:hover:bg-teal-950 border border-teal-200 dark:border-teal-700 rounded-xl text-xs font-bold text-teal-950 dark:text-teal-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  🪮 + Cepillado Profundo (3 días)
                </button>
              </div>
            </div>

            {/* Historial de Baños Registrados */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛁</span>
                  <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                    Historial de Baños Realizados de {activePet.name}
                  </h5>
                </div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                  {bathLogs.length} baños registrados
                </span>
              </div>

              {bathLogs.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Droplets className="w-10 h-10 text-teal-400 mx-auto opacity-60" />
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">Aún no has registrado ningún baño para {activePet.name}.</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                    Haz clic en "Registrar Baño Realizado Hoy" o usa las plantillas rápidas de higiene para guardar el historial.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bathLogs.map(log => {
                    const badgeColor = 
                      log.type === 'routine' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                      log.type === 'medicated' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                      log.type === 'dry_wash' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';

                    const typeName = 
                      log.type === 'routine' ? 'Baño Rutinario' :
                      log.type === 'medicated' ? 'Baño Medicado' :
                      log.type === 'dry_wash' ? 'Baño en Seco' : 'Peluquería Completa';

                    return (
                      <div key={log.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${badgeColor}`}>
                              {typeName}
                            </span>
                            <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">{log.date}</span>
                          </div>
                          {log.shampooUsed && (
                            <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                              🧴 <strong>Producto/Shampoo:</strong> {log.shampooUsed}
                            </p>
                          )}
                          {log.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                              📝 {log.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteBathLog(log.id)}
                          className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-stone-400 hover:text-red-600 transition-colors self-end sm:self-center cursor-pointer"
                          title="Eliminar del historial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recordatorios Programados de Baño */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                    Recordatorios Programados de Baño
                  </h5>
                </div>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                  {filteredBathReminders.length} programados
                </span>
              </div>

              {filteredBathReminders.length === 0 ? (
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center py-4">
                  No hay próximos recordatorios de baño programados.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {filteredBathReminders.map(rem => {
                    const urgency = getUrgency(rem.dueDate, rem.completed);
                    const isConfirming = confirmDeleteId === rem.id;

                    return (
                      <div
                        key={rem.id}
                        className={`bg-white dark:bg-stone-850 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          rem.completed 
                            ? 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50/50 dark:bg-stone-900/40' 
                            : rem.dueDate < todayStr 
                            ? 'border-red-300 dark:border-red-800 bg-red-50/20 dark:bg-red-950/20 shadow-xs' 
                            : 'border-teal-200 dark:border-teal-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleAttemptToggle(rem)}
                            className="mt-0.5 text-stone-400 hover:text-emerald-600 cursor-pointer transition-colors"
                            title={rem.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                          >
                            {rem.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                                🛁 Baño
                              </span>
                              <h4 className={`font-heading font-extrabold text-sm ${rem.completed ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                                {rem.name}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                              {rem.dosage && (
                                <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                                  🧴 {rem.dosage}
                                </span>
                              )}
                              {rem.notes && (
                                <span className="text-stone-500 dark:text-stone-400 italic">
                                  • {rem.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${urgency.color}`}>
                            {urgency.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => shareViaWhatsApp(rem)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:bg-emerald-100"
                          >
                            <span>💬 WhatsApp</span>
                          </button>

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/80 px-2 py-1 rounded-xl border border-red-200 dark:border-red-800">
                              <span className="text-[11px] font-bold text-red-700 dark:text-red-300">¿Eliminar?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteReminder(rem.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(rem.id)}
                              className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Guía Veterinaria de Baño e Higiene */}
            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                <h5 className="font-heading font-extrabold text-amber-950 dark:text-amber-200 text-sm">
                  💡 Sugerencias e Higiene para los Días de Baño ({activePet.type === 'dog' ? 'Caninos' : 'Felinos'})
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                <div className="bg-white/80 dark:bg-stone-900/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 space-y-1">
                  <strong className="font-bold text-amber-950 dark:text-amber-200 block">1. 👂 Oídos Protegidos</strong>
                  <p>Coloca bolitas de algodón seco en la entrada de sus oídos antes del baño para evitar el ingreso de agua y prevenir otitis.</p>
                </div>

                <div className="bg-white/80 dark:bg-stone-900/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 space-y-1">
                  <strong className="font-bold text-amber-950 dark:text-amber-200 block">2. 🌡️ Agua Tibia y Shampoo Veterinario</strong>
                  <p>El pH de la piel de tu mascota es neutro (~7.5) vs el humano (~5.5). Usa exclusivamente shampoo veterinario y agua tibia a 37°C.</p>
                </div>

                <div className="bg-white/80 dark:bg-stone-900/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 space-y-1">
                  <strong className="font-bold text-amber-950 dark:text-amber-200 block">3. 💨 Secado Garantizado</strong>
                  <p>Seca muy bien con toalla y secador en temperatura tibia a distancia. La humedad atrapada en el manto o pliegues puede generar dermatitis u hongos.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vaccines' && (
          <div className="space-y-6">
            {/* 1. PLANTILLAS RÁPIDAS DE VACUNAS Y SALUD */}
            <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200/65 dark:border-emerald-800/60 shadow-3xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-pulse" /> Plantillas Rápidas para {activePet.type === 'dog' ? 'Caninos' : 'Felinos'}:
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {petAgeInfo.label} - {petAgeInfo.advice}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-normal">
                Agrega recordatorios comunes recomendados para tu mascota con un solo clic. <strong className="text-emerald-800 dark:text-emerald-400">Podrás editar la fecha antes de confirmar.</strong>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {activePet.type === 'dog' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Vacuna Antirrábica Anual', 'vaccine', 365, '1 dosis')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      💉 + Antirrábica Anual
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Pipeta o Pastilla Antipulgas / Garrapatas', 'deworming', 30, '1 dosis mensual')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      🧴 + Antipulgas Mensual
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Desparasitante Interno Oral', 'deworming', 90, '1 tableta según peso')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      💊 + Desparasitación Trimestral
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Control Veterinario General', 'checkup', 180, 'Chequeo preventivo')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      🩺 + Control Semestral
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Vacuna Triple Felina Anual', 'vaccine', 365, '1 dosis')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      💉 + Triple Felina Anual
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Pipeta Antipulgas Mensual', 'deworming', 30, '1 pipeta en cuello')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      🧴 + Antipulgas Felino
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Malta o Pasta Antibolas de Pelo', 'medication', 7, '2 cm de pasta')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      🐾 + Pasta de Malta Semanal
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Control Veterinario General', 'checkup', 180, 'Chequeo de rutina')}
                      className="px-3.5 py-2 bg-white dark:bg-stone-850 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-950 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      🩺 + Control Semestral
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. ESQUEMA DE VACUNACIÓN SUGERIDO */}
            <div className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4 no-print">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                    Esquema de Vacunación Esencial Sugerido (Guía Internacional WSAVA)
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Vacunas obligatorias para proteger a tu {activePet.type === 'dog' ? 'perro' : 'gato'} de enfermedades mortales. Haz clic para programar:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePet.type === 'dog' ? (
                  <>
                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-red-700 bg-red-100 dark:bg-red-950/80 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 uppercase">Obligatoria Legal 🛡️</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Vacuna Antirrábica</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Previene la rabia, mortal y transmisible a humanos. Aplicación anual obligatoria.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Antirrábica Anual', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Anual
                      </button>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 dark:bg-purple-950/80 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 uppercase">Esencial Crucial 💉</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Polivalente / Múltiple Canina</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Protege contra Parvovirus, Moquillo (Distemper), Adenovirus y Leptospira.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Polivalente Canina (Sextuple)', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Anual
                      </button>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100 dark:bg-blue-950/80 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 uppercase">Recomendada 🐕</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Bordetella / Tos de Perreras</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Previene infecciones respiratorias en parques o guarderías caninas.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Contra Tos de Perreras', 'vaccine', 180, '1 dosis semestral')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Semestral
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 dark:bg-purple-950/80 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 uppercase">Esencial Crucial 💉</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Triple Felina (RPC)</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Protege contra Rinotraqueitis, Calicivirus y Panleucopenia Felina.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Triple Felina RPC', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Anual
                      </button>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100 dark:bg-blue-950/80 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 uppercase">Vital Exterior 🐈</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Leucemia Felina (FeLV)</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Vital para gatos que salen al exterior o conviven con otros felinos.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Leucemia Felina', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Anual
                      </button>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-black text-red-700 bg-red-100 dark:bg-red-950/80 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 uppercase">Obligatoria Legal 🛡️</span>
                        <h5 className="font-heading font-extrabold text-stone-950 dark:text-stone-100 text-xs mt-1.5">Antirrábica Felina</h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">Previene la rabia en felinos. Aplicación anual obligatoria por salud pública.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Antirrábica Felina', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
                      >
                        Programar Recordatorio Anual
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. TÍTULO Y LISTA DE VACUNAS Y MEDICACIÓN */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h4 className="font-heading font-extrabold text-stone-800 dark:text-stone-200 text-sm sm:text-base uppercase tracking-wider">
                  Vacunas y Medicación de {activePet.name}
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === 'all' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}
                  >
                    Todos ({healthReminders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === 'pending' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}
                  >
                    Pendientes ({healthReminders.filter(r => !r.completed).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filter === 'completed' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}
                  >
                    Completados ({healthReminders.filter(r => r.completed).length})
                  </button>
                </div>

                {healthReminders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearAllModal(true)}
                    className="text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1.5 self-end sm:self-center px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-600" />
                    <span>Vaciar vacunas y medicación</span>
                  </button>
                )}
              </div>

              {filteredHealthReminders.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-stone-800 dark:text-stone-200 text-sm">
                    {filter === 'all' 
                      ? 'No hay vacunas ni medicamentos programados' 
                      : filter === 'pending' 
                      ? '¡No tienes tareas pendientes!' 
                      : 'No hay recordatorios completados todavía.'}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                    {filter === 'all'
                      ? 'Agrega tus propias vacunas y medicamentos con fechas reales usando el botón "+ Crear Recordatorio" o las plantillas rápidas.'
                      : 'Las tareas finalizadas aparecerán marcadas aquí.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHealthReminders.map(rem => {
                    const urgency = getUrgency(rem.dueDate, rem.completed);
                    const isConfirming = confirmDeleteId === rem.id;

                    return (
                      <div
                        key={rem.id}
                        className={`bg-white dark:bg-stone-850 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          rem.completed 
                            ? 'border-stone-200 dark:border-stone-800 opacity-60 bg-stone-50/50 dark:bg-stone-900/40' 
                            : rem.dueDate < todayStr 
                            ? 'border-red-300 dark:border-red-800 bg-red-50/20 dark:bg-red-950/20 shadow-xs' 
                            : 'border-stone-200 dark:border-stone-800 shadow-2xs hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleAttemptToggle(rem)}
                            className="mt-0.5 text-stone-400 hover:text-emerald-600 cursor-pointer transition-colors"
                            title={rem.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                          >
                            {rem.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                rem.type === 'vaccine' 
                                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                                  : rem.type === 'deworming' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                  : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}>
                                {rem.type === 'vaccine' ? '💉 Vacuna' : rem.type === 'deworming' ? '🧴 Antiparasitario' : '💊 Medicación'}
                              </span>
                              <h4 className={`font-heading font-extrabold text-sm ${rem.completed ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                                {rem.name}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                              {rem.dosage && (
                                <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                                  <Pill className="w-3.5 h-3.5 text-stone-400" /> {rem.dosage}
                                </span>
                              )}
                              {rem.notes && (
                                <span className="text-stone-500 dark:text-stone-400 italic">
                                  • {rem.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${urgency.color}`}>
                            {urgency.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => shareViaWhatsApp(rem)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:bg-emerald-100"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <span className="text-xs">💬</span>
                            <span className="hidden md:inline">WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => exportToCalendar(rem)}
                            className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Añadir a Google/Apple Calendar (.ics)"
                          >
                            <Calendar className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                            <span className="hidden md:inline">Calendar</span>
                          </button>

                          {isConfirming ? (
                            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/80 px-2 py-1 rounded-xl border border-red-200 dark:border-red-800">
                              <span className="text-[11px] font-bold text-red-700 dark:text-red-300">¿Eliminar?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteReminder(rem.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(rem.id)}
                              className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                              title="Eliminar este recordatorio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADVERTENCIA LEGAL Y MÉDICA */}
            <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 shadow-3xs space-y-3 no-print mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-red-950 dark:text-red-200 text-sm">
                    ⚠️ ADVERTENCIA DE SEGURIDAD LEGAL Y SALUD ANIMAL
                  </h4>
                  <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                    Este módulo es un <strong>registro personal de seguimiento informativo</strong>. Bajo ninguna circunstancia debes medicar, desparasitar o vacunar a tu mascota por cuenta propia sin previa receta y diagnóstico de un veterinario matriculado. 
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-red-800 dark:text-red-300 bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-red-100 dark:border-red-900 font-bold leading-normal">
                ❌ El uso incorrecto de medicamentos humanos o dosis inadecuadas de desparasitantes pueden provocar intoxicaciones severas, fallas orgánicas irreversibles o la muerte de tu animal de compañía. Consulta siempre a un veterinario antes de dar cualquier fármaco.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL VACIAR TODOS LOS RECORDATORIOS */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    ¿Vaciar todos los recordatorios?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Se eliminarán todos los recordatorios actuales de {activePet.name}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              <p className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                Esta acción borrará las vacunas y fechas registradas de tu mascota para que puedas comenzar con una lista en blanco.
              </p>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await clearAllReminders();
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Sí, vaciar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN PLANTILLA RÁPIDA - EDITABLE FECHA */}
      {confirmQuickTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Confirmar Recordatorio
              </h3>
              <button
                type="button"
                onClick={() => setConfirmQuickTemplate(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">📌 Evento:</p>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{confirmQuickTemplate.name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  📅 Fecha de aplicación:
                </label>
                <input
                  type="date"
                  value={confirmQuickTemplate.editableDate}
                  onChange={e => setConfirmQuickTemplate({
                    ...confirmQuickTemplate,
                    editableDate: e.target.value
                  })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 text-sm font-bold"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Recomendado: {confirmQuickTemplate.calculatedDate} ({confirmQuickTemplate.days} días desde hoy)
                </p>
              </div>

              {confirmQuickTemplate.dosage && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">💊 Dosis sugerida:</p>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">{confirmQuickTemplate.dosage}</p>
                </div>
              )}

              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800">
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  ⚠️ Esta fecha es una recomendación basada en guías generales. 
                  Siempre consulta con tu veterinario para el esquema ideal para {activePet.name}.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmQuickTemplate(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmQuickTemplateCreate}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Confirmar y Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR RECORDATORIO MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Nuevo Recordatorio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as Reminder['type'] })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                    >
                      <option value="vaccine">💉 Vacuna</option>
                      <option value="deworming">🧴 Antiparasitario</option>
                      <option value="medication">💊 Medicamento</option>
                      <option value="checkup">🩺 Cita / Control</option>
                      <option value="bath">🛁 Baño & Grooming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha de Aplicación *</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre de la vacuna o medicamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre del tratamiento, vacuna o antiparasitario"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dosis / Frecuencia</label>
                  <input
                    type="text"
                    placeholder="Cantidad a suministrar y horario de administración"
                    value={form.dosage}
                    onChange={e => setForm({ ...form, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Notas adicionales (opcional)</label>
                  <input
                    type="text"
                    placeholder="Indicaciones especiales de suministro o compra"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR BAÑO */}
      {showBathModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </span>
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Registrar Baño de {activePet.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBathModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBathLog} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha del Baño *</label>
                    <input
                      type="date"
                      required
                      value={bathForm.date}
                      onChange={e => setBathForm({ ...bathForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Baño *</label>
                    <select
                      value={bathForm.type}
                      onChange={e => setBathForm({ ...bathForm, type: e.target.value as BathLog['type'] })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                    >
                      <option value="routine">🧼 Rutinario (Agua + Shampoo)</option>
                      <option value="medicated">🧴 Medicado / Dermatológico</option>
                      <option value="dry_wash">🧽 En Seco / Espuma</option>
                      <option value="grooming">✂️ Peluquería & Corte</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Shampoo / Producto Usado</label>
                  <input
                    type="text"
                    placeholder="Ej. Hipoalergénico Avena, Clorexidina 2%, Antipulgas"
                    value={bathForm.shampooUsed}
                    onChange={e => setBathForm({ ...bathForm, shampooUsed: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Programar Próximo Baño En *</label>
                  <select
                    value={bathForm.nextBathDays}
                    onChange={e => setBathForm({ ...bathForm, nextBathDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-stone-850"
                  >
                    <option value={7}>En 7 días (Recomendado Baño Medicado)</option>
                    <option value={15}>En 15 días (Recomendado Pelo Largo / Muy Activo)</option>
                    <option value={21}>En 21 días (Frecuencia Estándar Canina)</option>
                    <option value={30}>En 30 días (Frecuencia Pelo Corto / Sensible)</option>
                    <option value={45}>En 45 días (Peluquería & Felinos)</option>
                    <option value={60}>En 60 días (Felinos / Baño Seco)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Notas o Comportamiento (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Usó secador tranquilo, corte de uñas realizado, oídos limpios"
                    value={bathForm.notes}
                    onChange={e => setBathForm({ ...bathForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 leading-snug">
                  💡 Al guardar, se registrará la entrada en el historial y se creará automáticamente un recordatorio de próximo baño para el día correspondiente.
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBathModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Guardar Baño y Programar Siguiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR PLANTILLA RÁPIDA DE BAÑO */}
      {confirmQuickBath && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </span>
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  Registrar Baño & Programar Siguiente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmQuickBath(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 font-bold flex items-center justify-between">
                <span>Servicio / Tarea:</span>
                <span className="text-teal-700 dark:text-teal-300 font-extrabold">{confirmQuickBath.name}</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  📅 ¿En qué fecha se realizó el baño? *
                </label>
                <input
                  type="date"
                  required
                  value={confirmQuickBath.bathDate}
                  onChange={e => setConfirmQuickBath({ ...confirmQuickBath, bathDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  🧴 Shampoo / Producto Usado:
                </label>
                <input
                  type="text"
                  value={confirmQuickBath.shampooUsed}
                  onChange={e => setConfirmQuickBath({ ...confirmQuickBath, shampooUsed: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">⏰ Próximo Recordatorio Automático:</span>
                <p className="font-bold text-teal-800 dark:text-teal-300">
                  En {confirmQuickBath.daysToNext} días ({new Date(new Date(confirmQuickBath.bathDate + 'T00:00:00').getTime() + confirmQuickBath.daysToNext * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmQuickBath(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmQuickBathCreate}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Guardar Baño y Programar Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTELIGENTE DE COMPLETAR RECORDATORIO Y RE-PROGRAMAR */}
      {completingReminderState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${
                  completingReminderState.reminder.dueDate < todayStr
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                    : completingReminderState.reminder.dueDate > todayStr
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {completingReminderState.reminder.dueDate < todayStr ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : completingReminderState.reminder.dueDate > todayStr ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    {completingReminderState.reminder.dueDate < todayStr
                      ? 'Completar Recordatorio Vencido'
                      : completingReminderState.reminder.dueDate > todayStr
                      ? 'Completar Recordatorio Anticipado'
                      : 'Confirmar Realización de Tarea'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {activePet.name} • {completingReminderState.reminder.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCompletingReminderState(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              {completingReminderState.reminder.dueDate < todayStr && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-300 space-y-1">
                  <strong className="font-bold block text-red-950 dark:text-red-200">⚠️ Estaba programado para el {completingReminderState.reminder.dueDate}:</strong>
                  <p>
                    Puedes marcarlo como completado <strong>hoy mismo</strong> o seleccionar la <strong>fecha real en que se realizó</strong> para mantener la periodicidad médica correcta.
                  </p>
                </div>
              )}

              {completingReminderState.reminder.dueDate > todayStr && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <strong className="font-bold block text-amber-950 dark:text-amber-200">⏰ Está programado para el {completingReminderState.reminder.dueDate}:</strong>
                  <p>
                    Estás completando esta tarea antes de tiempo. Selecciona abajo la fecha real de aplicación para calcular el siguiente ciclo de salud.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-extrabold text-stone-800 dark:text-stone-200">
                  📅 ¿En qué fecha se realizó esta actividad? *
                </label>

                <input
                  type="date"
                  required
                  value={completingReminderState.completionDate}
                  onChange={e => setCompletingReminderState({
                    ...completingReminderState,
                    completionDate: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl font-bold text-sm text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-850 focus:ring-2 focus:ring-emerald-500"
                />

                <div className="flex gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => setCompletingReminderState({
                      ...completingReminderState,
                      completionDate: todayStr
                    })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      completingReminderState.completionDate === todayStr
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Realizado HOY ({todayStr})
                  </button>

                  {completingReminderState.reminder.dueDate !== todayStr && (
                    <button
                      type="button"
                      onClick={() => setCompletingReminderState({
                        ...completingReminderState,
                        completionDate: completingReminderState.reminder.dueDate
                      })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        completingReminderState.completionDate === completingReminderState.reminder.dueDate
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      En fecha sugerida ({completingReminderState.reminder.dueDate})
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950 dark:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={completingReminderState.autoReschedule}
                    onChange={e => setCompletingReminderState({
                      ...completingReminderState,
                      autoReschedule: e.target.checked
                    })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>🔁 Programar automáticamente el próximo recordatorio</span>
                </label>

                {completingReminderState.autoReschedule && (
                  <div className="space-y-2.5 pl-6 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-700 dark:text-stone-300 font-medium">Repetir ciclo cada:</span>
                      <input
                        type="number"
                        min="1"
                        max="730"
                        value={completingReminderState.recurringDays}
                        onChange={e => setCompletingReminderState({
                          ...completingReminderState,
                          recurringDays: Math.max(1, parseInt(e.target.value) || 1)
                        })}
                        className="w-20 px-2.5 py-1.5 bg-white dark:bg-stone-850 border border-emerald-300 dark:border-emerald-700 rounded-lg text-center font-extrabold text-stone-900 dark:text-stone-100"
                      />
                      <span className="text-stone-700 dark:text-stone-300 font-medium">días</span>
                    </div>

                    {(() => {
                      const baseDate = new Date(completingReminderState.completionDate + 'T00:00:00');
                      const nextDate = new Date(baseDate.getTime() + completingReminderState.recurringDays * 24 * 60 * 60 * 1000);
                      const nextStr = nextDate.toISOString().split('T')[0];
                      return (
                        <div className="p-2.5 bg-white/90 dark:bg-stone-850 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                          🗓️ Próxima fecha calculada: <span className="text-emerald-700 dark:text-emerald-400 font-black">{nextStr}</span> (sumando {completingReminderState.recurringDays} días a la fecha de realización).
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {completingReminderState.reminder.type === 'bath' && (
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-950 dark:text-teal-200">
                    <input
                      type="checkbox"
                      checked={completingReminderState.logBathHistory}
                      onChange={e => setCompletingReminderState({
                        ...completingReminderState,
                        logBathHistory: e.target.checked
                      })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                    />
                    <span>🛁 Registrar también en el Historial de Baños Realizados</span>
                  </label>

                  {completingReminderState.logBathHistory && (
                    <div className="pl-6 pt-1 space-y-1">
                      <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-200">
                        Shampoo / Producto Usado:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Shampoo hipoalergénico, jabón de avena..."
                        value={completingReminderState.shampooUsed}
                        onChange={e => setCompletingReminderState({
                          ...completingReminderState,
                          shampooUsed: e.target.value
                        })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-850 border border-teal-300 dark:border-teal-700 rounded-xl font-medium text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setCompletingReminderState(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmCompleteReminder}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-sm transition-all"
              >
                Confirmar y Completar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};