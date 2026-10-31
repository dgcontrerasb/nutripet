import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePets } from '../context/PetContext';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
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
  Info,
  ShieldCheck,
  Syringe,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { Reminder, BathLog } from '../types';
import { RemindersCalendar } from './RemindersCalendar';

/**
 * Utilidades para manejo seguro de fechas locales (evita desfasajes por zona horaria UTC)
 */
const getLocalDateString = (dateObj: Date = new Date()): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDaysToDate = (baseDateStr: string, days: number): string => {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

const getDiffDaysFromToday = (todayStr: string, targetDateStr: string): number => {
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [dy, dm, dd] = targetDateStr.split('-').map(Number);
  const tTime = new Date(ty, tm - 1, td).getTime();
  const dTime = new Date(dy, dm - 1, dd).getTime();
  return Math.round((dTime - tTime) / (1000 * 60 * 60 * 24));
};

export const RemindersModule: React.FC = () => {
  const {
    activePet,
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

  const todayStr = useMemo(() => getLocalDateString(), []);

  // Referencias y estados de navegación para el carrusel de Blindaje Biológico en móvil
  const shieldScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollShieldLeft, setCanScrollShieldLeft] = useState(false);
  const [canScrollShieldRight, setCanScrollShieldRight] = useState(true);
  const [activeShieldIndex, setActiveShieldIndex] = useState(0);

  const checkShieldScroll = useCallback(() => {
    const el = shieldScrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth + 4;
      setCanScrollShieldLeft(overflow && el.scrollLeft > 10);
      setCanScrollShieldRight(overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

      // Calcular tarjeta activa basada en scrollLeft y el ancho de tarjeta
      const cardWidth = el.clientWidth > 0 ? el.clientWidth * 0.8 : 280;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveShieldIndex(Math.min(2, Math.max(0, index)));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkShieldScroll, 80);
    window.addEventListener('resize', checkShieldScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkShieldScroll);
    };
  }, [checkShieldScroll]);

  const scrollShield = (direction: 'left' | 'right') => {
    const el = shieldScrollRef.current;
    if (el) {
      const scrollAmount = Math.max(260, Math.floor(el.clientWidth * 0.82));
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkShieldScroll, 320);
    }
  };

  const scrollToShieldIndex = (index: number) => {
    const el = shieldScrollRef.current;
    if (el) {
      const scrollAmount = Math.max(260, Math.floor(el.clientWidth * 0.82));
      el.scrollTo({
        left: index * scrollAmount,
        behavior: 'smooth'
      });
      setActiveShieldIndex(index);
      setTimeout(checkShieldScroll, 320);
    }
  };

  // Estado para el Mini-Calendario integrado en la columna derecha
  const [miniCalDate, setMiniCalDate] = useState<Date>(new Date());
  const [selectedMiniDateStr, setSelectedMiniDateStr] = useState<string>(() => getLocalDateString());

  const [completingReminderState, setCompletingReminderState] = useState<{
    reminder: Reminder;
    completionDate: string;
    recurringDays: number;
    autoReschedule: boolean;
    logBathHistory: boolean;
    shampooUsed: string;
  } | null>(null);

  const [bathForm, setBathForm] = useState<{
    date: string;
    type: BathLog['type'];
    shampooUsed: string;
    nextBathDays: number;
    notes: string;
  }>({
    date: getLocalDateString(),
    type: 'routine',
    shampooUsed: '',
    nextBathDays: 21,
    notes: ''
  });

  const [confirmQuickTemplate, setConfirmQuickTemplate] = useState<{
    name: string;
    type: Reminder['type'];
    days: number;
    dosage?: string;
    calculatedDate: string;
    editableDate: string;
  } | null>(null);

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
    dueDate: addDaysToDate(getLocalDateString(), 14),
    dosage: '',
    notes: ''
  });

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

  // Historial de baños ordenado cronológicamente descendente
  const sortedBathLogs = useMemo(() => {
    return [...bathLogs].sort((a, b) => b.date.localeCompare(a.date));
  }, [bathLogs]);

  const lastBath = sortedBathLogs[0] || null;

  const daysSinceLastBath = useMemo(() => {
    if (!lastBath) return null;
    const [ly, lm, ld] = lastBath.date.split('-').map(Number);
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const lastDate = new Date(ly, lm - 1, ld).getTime();
    const curDate = new Date(ty, tm - 1, td).getTime();
    return Math.max(0, Math.floor((curDate - lastDate) / (1000 * 60 * 60 * 24)));
  }, [lastBath, todayStr]);

  const nextBathReminder = useMemo(() => {
    return reminders.find(r => r.type === 'bath' && !r.completed);
  }, [reminders]);

  const healthReminders = useMemo(() => {
    return reminders.filter(r => r.type !== 'bath');
  }, [reminders]);

  const filteredHealthReminders = useMemo(() => {
    return healthReminders.filter(r => {
      if (filter === 'pending') return !r.completed;
      if (filter === 'completed') return r.completed;
      return true;
    });
  }, [healthReminders, filter]);

  const bathRemindersList = useMemo(() => {
    return reminders.filter(r => r.type === 'bath');
  }, [reminders]);

  const filteredBathReminders = useMemo(() => {
    return bathRemindersList.filter(r => {
      if (filter === 'pending') return !r.completed;
      if (filter === 'completed') return r.completed;
      return true;
    });
  }, [bathRemindersList, filter]);

  // Conteo total de recordatorios vencidos memoizado
  const totalOverdue = useMemo(() => {
    return reminders.filter(r => !r.completed && r.dueDate < todayStr).length;
  }, [reminders, todayStr]);

  // Datos dinámicos para los 3 Pilares del Radar de Blindaje Biológico 360°
  const shieldPillars = useMemo(() => {
    const pendingAll = reminders
      .filter(r => !r.completed)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    // Pilar 1: Vacunas
    const nextVaccine = pendingAll.find(
      r => r.type === 'vaccine' || r.name.toLowerCase().includes('vacuna') || r.name.toLowerCase().includes('antirrábica') || r.name.toLowerCase().includes('triple')
    );
    const vaccineDays = nextVaccine ? getDiffDaysFromToday(todayStr, nextVaccine.dueDate) : null;

    // Pilar 2: Antipulgas & Garrapatas
    const nextFlea = pendingAll.find(r => {
      const n = r.name.toLowerCase();
      return n.includes('pulga') || n.includes('pipeta') || n.includes('garrapata') || n.includes('ectopar');
    });
    const fleaDays = nextFlea ? getDiffDaysFromToday(todayStr, nextFlea.dueDate) : null;

    // Pilar 3: Desparasitación Interna
    const nextDeworm = pendingAll.find(r => {
      const n = r.name.toLowerCase();
      return (r.type === 'deworming' && !n.includes('pulga') && !n.includes('pipeta')) || n.includes('desparasit') || n.includes('interno') || n.includes('trimestral');
    });
    const dewormDays = nextDeworm ? getDiffDaysFromToday(todayStr, nextDeworm.dueDate) : null;

    return {
      nextVaccine,
      vaccineDays,
      nextFlea,
      fleaDays,
      nextDeworm,
      dewormDays
    };
  }, [reminders, todayStr]);

  // Agrupación por fecha para el Mini-Calendario
  const remindersByDate = useMemo(() => {
    return reminders.reduce((acc, rem) => {
      const d = rem.dueDate;
      if (!acc[d]) acc[d] = [];
      acc[d].push(rem);
      return acc;
    }, {} as Record<string, Reminder[]>);
  }, [reminders]);

  if (!activePet) return null;

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

  /**
   * CORRECCIÓN MANDATORIA DEL MENSAJE DE WHATSAPP (CERO CUADROS NEGROS )
   * Encapsulado 100% en encodeURIComponent con endpoint directo api.whatsapp.com/send
   */
  const handleSendWhatsAppReminder = (reminder: Reminder) => {
    const message =
`🐾 *NUTRIPET CLINICAL CARE • RECORDATORIO DE SALUD*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🩺 *Paciente:* ${activePet.name} (${activePet.type === 'dog' ? 'Canino' : 'Felino'})
💉 *Tratamiento:* ${reminder.name}
🗓️ *Fecha Programada:* ${reminder.dueDate}
⚖️ *Dosis / Pauta:* ${reminder.dosage || reminder.notes || '1 aplicación de refuerzo'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *Pautas de Cuidado:*
• Mantén a ${activePet.name} en reposo y evita ejercicio intenso durante el día.
• En caso de vacunas, evitar baños las siguientes 48 horas.

📲 _Gestionado desde el Expediente Digital NutriPet_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareViaWhatsApp = handleSendWhatsAppReminder;

  const exportToCalendar = (rem: Reminder) => {
    const title = `[NutriPet] ${rem.name} - ${activePet.name}`;
    const details = `Recordatorio para ${activePet.name}. Dosis: ${rem.dosage || 'N/A'}. ${rem.notes || ''}`;
    const dateFormatted = rem.dueDate.replace(/-/g, '');

    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NutriPet//ES\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nDTSTART;VALUE=DATE:${dateFormatted}\nDTEND;VALUE=DATE:${dateFormatted}\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nutripet_${rem.name.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportAllToCalendar = () => {
    const pendingReminders = reminders.filter(r => !r.completed);
    if (pendingReminders.length === 0) return;

    const events = pendingReminders.map(rem => {
      const title = `[NutriPet] ${rem.name} - ${activePet.name}`;
      const details = `Recordatorio de salud para ${activePet.name}. Dosis: ${rem.dosage || 'N/A'}. ${rem.notes || ''}`;
      const dateFormatted = rem.dueDate.replace(/-/g, '');
      return `BEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${details}\nDTSTART;VALUE=DATE:${dateFormatted}\nDTEND;VALUE=DATE:${dateFormatted}\nEND:VEVENT`;
    }).join('\n');

    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NutriPet//ES\n${events}\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nutripet_calendario_${activePet.name.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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
      dueDate: addDaysToDate(getLocalDateString(), 14),
      dosage: '',
      notes: ''
    });
  };

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
      const nextDueDate = addDaysToDate(completionDate, recurringDays);

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
    if (completed) return { label: 'Completado', color: 'text-stone-400 bg-stone-100 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700' };
    if (dueDate < todayStr) {
      const diffDays = Math.abs(getDiffDaysFromToday(todayStr, dueDate));
      return {
        label: `⚠️ Vencido (${diffDays}d)`,
        color: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-extrabold shadow-2xs'
      };
    }
    if (dueDate === todayStr) return { label: '¡Toca Hoy!', color: 'text-amber-800 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-extrabold' };

    const diffDays = getDiffDaysFromToday(todayStr, dueDate);
    if (diffDays <= 7) return { label: `Faltan ${diffDays} días`, color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };

    return { label: `En ${diffDays} días`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
  };

  const getReminderThemeBadge = (rem: Reminder) => {
    const nameLower = rem.name.toLowerCase();
    if (rem.type === 'vaccine' || nameLower.includes('vacuna') || nameLower.includes('antirrábica') || nameLower.includes('triple') || nameLower.includes('polivalente')) {
      return {
        label: '💉 Vacuna',
        cls: 'bg-purple-50 text-purple-800 border-purple-200/90 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500'
      };
    }
    if (nameLower.includes('pulga') || nameLower.includes('pipeta') || nameLower.includes('garrapata') || nameLower.includes('ectopar')) {
      return {
        label: '🛡️ Antipulgas',
        cls: 'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    }
    if (rem.type === 'deworming' || nameLower.includes('desparasit')) {
      return {
        label: '💊 Desparasitación',
        cls: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    }
    if (rem.type === 'bath' || nameLower.includes('baño') || nameLower.includes('grooming')) {
      return {
        label: '🛁 Baño',
        cls: 'bg-blue-50 text-blue-800 border-blue-200/90 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500'
      };
    }
    if (rem.type === 'checkup') {
      return {
        label: '🩺 Control',
        cls: 'bg-teal-50 text-teal-800 border-teal-200/90 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
        dot: 'bg-teal-500'
      };
    }
    return {
      label: '💊 Medicación',
      cls: 'bg-rose-50 text-rose-800 border-rose-200/90 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500'
    };
  };

  const addQuickTemplate = (name: string, type: Reminder['type'], defaultDays: number, dosage?: string) => {
    const targetDate = addDaysToDate(todayStr, defaultDays);

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
      bathDate: todayStr
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

    const nextDate = addDaysToDate(confirmQuickBath.bathDate, confirmQuickBath.daysToNext);

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

  const handleSaveBathLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bathForm.date) return;

    await addBathLog({
      date: bathForm.date,
      type: bathForm.type,
      shampooUsed: bathForm.shampooUsed.trim() || undefined,
      notes: bathForm.notes.trim() || undefined,
    });

    const nextDate = addDaysToDate(bathForm.date, bathForm.nextBathDays);

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
      date: todayStr,
      type: 'routine',
      shampooUsed: '',
      nextBathDays: 21,
      notes: ''
    });
  };

  // Variables del Mini-Calendario integrado
  const calYear = miniCalDate.getFullYear();
  const calMonth = miniCalDate.getMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const daysOfWeekShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  let firstDayOfCalMonth = new Date(calYear, calMonth, 1).getDay();
  firstDayOfCalMonth = firstDayOfCalMonth === 0 ? 6 : firstDayOfCalMonth - 1;
  const selectedMiniDateEvents = remindersByDate[selectedMiniDateStr] || [];

  return (
    <div className="space-y-5 pb-28 sm:pb-8">
      {/* BARRA BENTO COMPACTA DE CABECERA (UNA SOLA FILA EN DESKTOP, CERO ESPACIO DESPERDICIADO) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Izquierda: Icono institucional esmeralda, título "Vacunas & Notificaciones" con badge de mascota y micro-pill */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 truncate">
                Vacunas & Notificaciones
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {activePet.name}
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                {healthReminders.filter(r => !r.completed).length} pendiente{healthReminders.filter(r => !r.completed).length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">
              Calendario preventivo de salud, higiene y desparasitación al día.
            </p>
          </div>
        </div>

        {/* Centro: Selector de subpestañas integrado */}
        <div className="order-last w-full grid grid-cols-3 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('vaccines')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-0 ${
              activeTab === 'vaccines'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Vacunas</span>
              <span className="hidden sm:inline">Vacunas & Salud</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bath')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-0 ${
              activeTab === 'bath'
                ? 'bg-white dark:bg-stone-900 text-teal-900 dark:text-teal-300 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
            <span className="truncate">
              <span className="sm:hidden">Higiene</span>
              <span className="hidden sm:inline">Baño & Grooming</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-0 ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-stone-900 text-blue-900 dark:text-blue-300 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="truncate">Calendario</span>
          </button>
        </div>

        {/* Derecha: Botón unificado 'Crear Recordatorio' y 'Sincronizar Calendario' */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center shrink-0">
          <button
            type="button"
            onClick={exportAllToCalendar}
            className="w-full sm:w-auto justify-center bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 min-w-0"
            title="Añadir a mi Calendario (Google / Apple)"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Sincronizar</span>
              <span className="hidden sm:inline">Sincronizar Calendario</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto justify-center bg-[#143826] hover:bg-[#1a4a32] text-white px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer min-w-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">+ Recordatorio</span>
              <span className="hidden sm:inline">Crear Recordatorio</span>
            </span>
          </button>
        </div>
      </div>

      {/* RADAR DE SALUD Y PROTECCIÓN PREVENTIVA (CARRUSEL MÓVIL CON FLECHAS E INDICADORES LATERALES) */}
      {activeTab === 'vaccines' && (
        <div className="space-y-2 mb-5">
          {/* Cabecera de controles e indicadores laterales para móvil */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-stone-800 dark:text-stone-100 uppercase flex items-center gap-1.5 drop-shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                PROTECCIÓN PREVENTIVA INTEGRAL
              </span>
              <span className="sm:hidden text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 shadow-2xs">
                {activeShieldIndex + 1}/3
              </span>
            </div>

            {/* Controles de deslizamiento lateral en móvil */}
            <div className="sm:hidden flex items-center gap-1.5">
              {/* Indicadores de posición (Dots interactivos) */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToShieldIndex(idx)}
                    className={`transition-all rounded-full cursor-pointer ${
                      activeShieldIndex === idx
                        ? 'w-4 h-1.5 bg-[#143826] dark:bg-emerald-400'
                        : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400'
                    }`}
                    aria-label={`Ver pilar ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Botón Flecha Izquierda */}
              <button
                type="button"
                onClick={() => scrollShield('left')}
                disabled={!canScrollShieldLeft}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  canScrollShieldLeft
                    ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 shadow-2xs hover:border-[#143826] active:scale-90 cursor-pointer'
                    : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200/40 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-40'
                }`}
                aria-label="Pilar anterior"
                title="Deslizar al pilar anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Botón Flecha Derecha */}
              <button
                type="button"
                onClick={() => scrollShield('right')}
                disabled={!canScrollShieldRight}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  canScrollShieldRight
                    ? 'bg-white dark:bg-stone-900 border-emerald-400/80 dark:border-emerald-700 text-[#143826] dark:text-emerald-300 shadow-2xs hover:border-[#143826] active:scale-90 cursor-pointer ring-2 ring-emerald-500/10'
                    : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200/40 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-40'
                }`}
                aria-label="Pilar siguiente"
                title="Deslizar al siguiente pilar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Carrusel Deslizable */}
          <div className="relative">
            <div
              ref={shieldScrollRef}
              onScroll={checkShieldScroll}
              className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory flex-nowrap sm:grid sm:grid-cols-3 sm:gap-3.5 scroll-smooth"
            >
              {/* Pilar 1: Vacunas Esenciales */}
              <div className="min-w-[270px] max-w-[290px] sm:min-w-0 sm:max-w-none shrink-0 snap-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                    <Syringe className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    shieldPillars.vaccineDays !== null && shieldPillars.vaccineDays < 0
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  }`}>
                    {shieldPillars.vaccineDays !== null && shieldPillars.vaccineDays < 0
                      ? 'Refuerzo Vencido'
                      : 'Vigente / Protegido'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase block">
                    VACUNAS ESENCIALES
                  </span>
                  <p className="font-heading font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm mt-0.5 truncate">
                    {shieldPillars.nextVaccine
                      ? shieldPillars.nextVaccine.name
                      : `${petAgeInfo.label}: Esquema al día`}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                    {shieldPillars.nextVaccine
                      ? shieldPillars.vaccineDays === 0
                        ? '¡Aplicación programada hoy!'
                        : shieldPillars.vaccineDays! > 0
                        ? `Próxima en ${shieldPillars.vaccineDays} días (${shieldPillars.nextVaccine.dueDate})`
                        : `Vencida hace ${Math.abs(shieldPillars.vaccineDays!)} días`
                      : 'Cobertura anual activa'}
                  </p>
                </div>
              </div>

              {/* Pilar 2: Protección Antipulgas & Garrapatas */}
              <div className="min-w-[270px] max-w-[290px] sm:min-w-0 sm:max-w-none shrink-0 snap-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                    {shieldPillars.fleaDays !== null
                      ? shieldPillars.fleaDays < 0
                        ? `Vencido (${Math.abs(shieldPillars.fleaDays)}d)`
                        : shieldPillars.fleaDays === 0
                        ? '¡Toca Hoy!'
                        : `Faltan ${shieldPillars.fleaDays} días`
                      : 'Al día'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase block">
                    PROTECCIÓN CONTRA PULGAS Y GARRAPATAS
                  </span>
                  <p className="font-heading font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm mt-0.5 truncate">
                    {shieldPillars.nextFlea
                      ? shieldPillars.nextFlea.name
                      : 'Barrera Ectoparasitaria'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                    {shieldPillars.nextFlea
                      ? `Fecha: ${shieldPillars.nextFlea.dueDate}`
                      : 'Ciclo preventivo cada 30 días'}
                  </p>
                </div>
              </div>

              {/* Pilar 3: Desparasitación Interna */}
              <div className="min-w-[270px] max-w-[290px] sm:min-w-0 sm:max-w-none shrink-0 snap-center p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                    <Pill className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                    {shieldPillars.dewormDays !== null
                      ? shieldPillars.dewormDays < 0
                        ? `Vencido (${Math.abs(shieldPillars.dewormDays)}d)`
                        : `Faltan ${shieldPillars.dewormDays} días`
                      : 'Ciclo Trimestral'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase block">
                    DESPARASITACIÓN INTERNA
                  </span>
                  <p className="font-heading font-black text-stone-900 dark:text-stone-100 text-xs sm:text-sm mt-0.5 truncate">
                    {shieldPillars.nextDeworm
                      ? shieldPillars.nextDeworm.name
                      : 'Control Gastrointestinal'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                    {shieldPillars.nextDeworm
                      ? `Programado: ${shieldPillars.nextDeworm.dueDate}`
                      : 'Pauta oral cada 90 días'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalOverdue > 0 && (
        <div className="bg-white dark:bg-stone-900 border-2 border-red-300 dark:border-red-900/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-black text-red-950 dark:text-red-200 text-xs sm:text-sm">
                ⚠️ Tienes {totalOverdue} recordatorio(s) vencido(s)
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                Haz clic en el círculo (⭕) para completarlos y reprogramar el siguiente ciclo automáticamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            Ver Pendientes ({totalOverdue})
          </button>
        </div>
      )}

      <div id="reminders-printable-container" className="space-y-6">
        {/* PESTAÑA CALENDARIO MENSUAL */}
        {activeTab === 'calendar' && (
          <RemindersCalendar
            onOpenAddModalWithDate={handleOpenAddModalWithDate}
            onToggleReminder={handleAttemptToggle}
            onSendWhatsApp={handleSendWhatsAppReminder}
            onDeleteReminder={deleteReminder}
            onQuickTemplate={addQuickTemplate}
          />
        )}

        {/* PESTAÑA BAÑO & GROOMING */}
        {activeTab === 'bath' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] rounded-3xl p-5 sm:p-6 text-white shadow-xs border border-[#2a5940] relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl">
                      <Droplets className="w-5 h-5 text-emerald-300" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300/90 block">
                        DERMATOLOGÍA & MANTO
                      </span>
                      <h4 className="font-heading font-extrabold text-base sm:text-lg text-white">
                        Control de Baño e Higiene de {activePet.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <div className="bg-emerald-950/50 rounded-xl px-3 py-1.5 border border-emerald-500/20 text-xs">
                      <span className="text-emerald-200/80 block text-[10px] font-mono uppercase font-bold">Último Baño</span>
                      <strong className="text-white font-extrabold text-xs">
                        {lastBath ? `${lastBath.date} (${daysSinceLastBath === 0 ? 'Hoy' : `hace ${daysSinceLastBath}d`})` : 'Sin registros'}
                      </strong>
                    </div>

                    <div className="bg-emerald-950/50 rounded-xl px-3 py-1.5 border border-emerald-500/20 text-xs">
                      <span className="text-emerald-200/80 block text-[10px] font-mono uppercase font-bold">Próximo Baño</span>
                      <strong className="text-amber-300 font-extrabold text-xs">
                        {nextBathReminder ? nextBathReminder.dueDate : 'Por programar'}
                      </strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBathModal(true)}
                  className="px-4 py-2.5 bg-white text-[#143826] hover:bg-emerald-50 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Droplets className="w-4 h-4 text-emerald-700" />
                  <span>Registrar Baño Realizado Hoy</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                  AGENDA RÁPIDA DE PELUQUERÍA
                </span>
                <h5 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                  Plantillas Rápidas de Higiene & Grooming
                </h5>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Baño Rutinario con Agua y Shampoo', 'routine', 21, 'Shampoo neutro canino')}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                >
                  🧼 + Baño Rutinario (21d)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Baño Medicado / Dermatológico', 'medicated', 7, 'Shampoo clorhexidina o hipoalergénico')}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                >
                  🧴 + Baño Medicado (7d)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Peluquería y Corte de Pelo', 'grooming', 45, 'Servicio completo de peluquería')}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                >
                  ✂️ + Peluquería & Corte (45d)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Corte de Uñas e Higiene de Oídos', 'routine', 15, 'Cortaúñas + solución auricular')}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                >
                  💅 + Uñas & Oídos (15d)
                </button>
                <button
                  type="button"
                  onClick={() => addQuickBathTemplate('Cepillado Profundo de Pelaje', 'dry_wash', 3, 'Peine o cepillo deslanador')}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 transition-all cursor-pointer"
                >
                  🪮 + Cepillado (3d)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Recordatorios Programados de Baño */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                      AGENDA PRÓXIMA
                    </span>
                    <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                      Recordatorios de Baño Programados
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    {filteredBathReminders.length}
                  </span>
                </div>

                {filteredBathReminders.length === 0 ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400 text-center py-6">
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
                          className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleAttemptToggle(rem)}
                                className="mt-0.5 text-stone-400 hover:text-emerald-600 cursor-pointer"
                              >
                                {rem.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-blue-50 text-blue-800 border-blue-200/90">
                                  🛁 Baño
                                </span>
                                <h4 className={`font-heading font-black text-stone-900 dark:text-stone-100 text-sm mt-1 ${rem.completed ? 'line-through text-stone-400' : ''}`}>
                                  {rem.name}
                                </h4>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${urgency.color}`}>
                              {urgency.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 pl-7">
                            <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" /> {rem.dueDate}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => shareViaWhatsApp(rem)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-3xs cursor-pointer active:scale-95"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </button>

                              {isConfirming ? (
                                <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-xl border border-red-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteReminder(rem.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-0.5 bg-stone-200 text-stone-700 rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(rem.id)}
                                  className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historial de Baños Realizados */}
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                      BITÁCORA DERMATOLÓGICA
                    </span>
                    <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-sm">
                      Historial de Baños de {activePet.name}
                    </h5>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    {sortedBathLogs.length} realizados
                  </span>
                </div>

                {sortedBathLogs.length === 0 ? (
                  <div className="text-center py-6 space-y-1.5">
                    <Droplets className="w-8 h-8 text-teal-400 mx-auto opacity-60" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Sin baños registrados aún
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {sortedBathLogs.map(log => {
                      const typeName =
                        log.type === 'routine' ? 'Baño Rutinario' :
                        log.type === 'medicated' ? 'Baño Medicado' :
                        log.type === 'dry_wash' ? 'Baño en Seco' : 'Peluquería Completa';

                      return (
                        <div key={log.id} className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80 uppercase">
                                {typeName}
                              </span>
                              <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100">{log.date}</span>
                            </div>
                            {log.shampooUsed && (
                              <p className="text-xs text-stone-600 dark:text-stone-300">
                                🧴 {log.shampooUsed}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteBathLog(log.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
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
            </div>
          </div>
        )}

        {/* PESTAÑA PRINCIPAL: VACUNAS & SALUD (DISEÑO DINÁMICO 2 COLUMNAS EN DESKTOP) */}
        {activeTab === 'vaccines' && (
          <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUMNA IZQUIERDA (lg:col-span-7): PRÓXIMOS REFUERZOS & HITOS DE SALUD */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                      SEGUIMIENTO CLÍNICO ACTIVO
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
                        Próximos Refuerzos & Hitos de Salud
                      </h4>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                        {healthReminders.filter(r => !r.completed).length} activos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filter === 'all'
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                      }`}
                    >
                      Todos ({healthReminders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filter === 'pending'
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                      }`}
                    >
                      Pendientes ({healthReminders.filter(r => !r.completed).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filter === 'completed'
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                      }`}
                    >
                      Listos ({healthReminders.filter(r => r.completed).length})
                    </button>
                  </div>
                </div>

                {filteredHealthReminders.length === 0 ? (
                  <div className="py-8 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-extrabold text-stone-800 dark:text-stone-200 text-sm">
                      {filter === 'all'
                        ? 'Sin vacunas ni refuerzos programados'
                        : filter === 'pending'
                        ? '¡No tienes refuerzos pendientes!'
                        : 'Aún no hay registros completados'}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                      Usa el botón "+ Recordatorio" o las recomendaciones de salud al pie para agendar en 1 clic.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
                    {filteredHealthReminders.map(rem => {
                      const urgency = getUrgency(rem.dueDate, rem.completed);
                      const themeBadge = getReminderThemeBadge(rem);
                      const isConfirming = confirmDeleteId === rem.id;

                      return (
                        <div
                          key={rem.id}
                          className={`bg-white dark:bg-stone-900 border rounded-2xl p-4 shadow-2xs transition-all space-y-2.5 ${
                            rem.completed
                              ? 'border-stone-200/70 dark:border-stone-800 opacity-60'
                              : rem.dueDate < todayStr
                              ? 'border-red-300 dark:border-red-900/60'
                              : 'border-stone-200/90 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleAttemptToggle(rem)}
                                className="mt-0.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors shrink-0"
                                title={rem.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                              >
                                {rem.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${themeBadge.cls}`}>
                                    {themeBadge.label}
                                  </span>
                                  <h4 className={`font-heading font-black text-stone-900 dark:text-stone-100 text-sm leading-tight ${rem.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''}`}>
                                    {rem.name}
                                  </h4>
                                </div>

                                {(rem.dosage || rem.notes) && (
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                                    {rem.dosage && (
                                      <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                                        <Pill className="w-3.5 h-3.5 text-stone-400" /> {rem.dosage}
                                      </span>
                                    )}
                                    {rem.notes && (
                                      <span className="text-stone-500 dark:text-stone-400 italic text-[11px]">
                                        • {rem.notes}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${urgency.color}`}>
                              {urgency.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 pl-8">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-600 dark:text-stone-400">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              {rem.dueDate}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppReminder(rem)}
                                className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-3xs cursor-pointer active:scale-95 transition-all"
                                title="Enviar recordatorio clínico por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>WhatsApp</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => exportToCalendar(rem)}
                                className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                                title="Añadir a mi Calendario (Google / Apple)"
                              >
                                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                                <span className="hidden sm:inline">Añadir a Calendario</span>
                              </button>

                              {isConfirming ? (
                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded-xl border border-red-200 dark:border-red-900">
                                  <span className="text-[10px] font-bold text-red-700 dark:text-red-300">¿Borrar?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteReminder(rem.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-md text-[10px] font-bold cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(rem.id)}
                                  className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Eliminar este recordatorio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {healthReminders.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowClearAllModal(true)}
                      className="text-[11px] font-bold text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Vaciar lista de recordatorios</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA (lg:col-span-5): MINI-CALENDARIO COMPACTO (OCULTO EN MÓVIL PARA EVITAR SCROLL EXCESIVO) */}
            <div className="hidden lg:block lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                      RADAR MENSUAL
                    </span>
                    <h4 className="font-heading font-extrabold text-sm text-stone-900 dark:text-stone-100">
                      {monthNames[calMonth]} {calYear}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setMiniCalDate(new Date(now.getFullYear(), now.getMonth(), 1));
                        setSelectedMiniDateStr(todayStr);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniCalDate(new Date(calYear, calMonth - 1, 1))}
                      className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 cursor-pointer"
                      aria-label="Mes anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMiniCalDate(new Date(calYear, calMonth + 1, 1))}
                      className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 cursor-pointer"
                      aria-label="Mes siguiente"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cuadrícula de Bajo Perfil (36-40px por celda) */}
                <div className="space-y-1">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {daysOfWeekShort.map(d => (
                      <div key={d} className="py-1 text-[10px] font-mono font-bold text-stone-400 uppercase">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfCalMonth }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="h-9 sm:h-10 rounded-xl bg-stone-50/50 dark:bg-stone-800/20 border border-dashed border-stone-100 dark:border-stone-800/40"
                      />
                    ))}

                    {Array.from({ length: daysInCalMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedMiniDateStr;
                      const dayEvents = remindersByDate[dateStr] || [];

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedMiniDateStr(dateStr)}
                          className={`h-9 sm:h-10 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                            isSelected
                              ? 'bg-[#143826] text-white border-[#143826] shadow-2xs font-extrabold'
                              : isToday
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-400 font-extrabold'
                              : dayEvents.length > 0
                              ? 'bg-stone-50 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700 font-bold hover:border-emerald-400'
                              : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 font-medium'
                          }`}
                        >
                          <span className="text-xs leading-none">{dayNum}</span>

                          {dayEvents.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1">
                              {dayEvents.slice(0, 3).map((ev, idx) => {
                                const b = getReminderThemeBadge(ev);
                                return (
                                  <span
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : b.dot}`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen del día seleccionado en el Mini-Calendario */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase">
                      📅 Día: {selectedMiniDateStr} ({selectedMiniDateEvents.length} evento{selectedMiniDateEvents.length === 1 ? '' : 's'})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModalWithDate(selectedMiniDateStr)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Agendar aquí
                    </button>
                  </div>

                  {selectedMiniDateEvents.length > 0 && (
                    <div className="space-y-1.5">
                      {selectedMiniDateEvents.map(ev => (
                        <div key={`mini-${ev.id}`} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-700">
                          <span className={`font-bold truncate ${ev.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                            {ev.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppReminder(ev)}
                            className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
                          >
                            WhatsApp
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ESQUEMA PREVENTIVO SUGERIDO (GRID DE 3 COLUMNAS EN TONOS PASTEL/CREMA) */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase block">
                    PLAN PREVENTIVO RECOMENDADO
                  </span>
                  <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    Esquema Preventivo Oficial ({activePet.type === 'dog' ? 'Caninos' : 'Felinos'})
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 self-start sm:self-auto">
                Etapa: {petAgeInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Columna 1: Vacunas Esenciales Inmunológicas */}
              <div className="p-3.5 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#EDE5D8] dark:border-stone-700/80 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 uppercase">
                      💉 Inmunización
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">Anual</span>
                  </div>
                  <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs">
                    {activePet.type === 'dog' ? 'Antirrábica & Polivalente' : 'Triple Felina & Antirrábica'}
                  </h5>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                    {activePet.type === 'dog'
                      ? 'Protección contra rabia, parvovirus, moquillo, adenovirus y leptospirosis.'
                      : 'Protección contra panleucopenia, rinotraqueitis, calicivirus y rabia.'}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {activePet.type === 'dog' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Antirrábica Anual', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                      >
                        <span>+ Agendar Antirrábica</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Polivalente Canina (Sextuple)', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100/90 text-purple-900 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                      >
                        <span>+ Agendar Polivalente</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Triple Felina RPC', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                      >
                        <span>+ Agendar Triple Felina</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuickTemplate('Vacuna Antirrábica Felina', 'vaccine', 365, '1 dosis anual')}
                        className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100/90 text-purple-900 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                      >
                        <span>+ Agendar Antirrábica</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Columna 2: Antiparasitario Dual */}
              <div className="p-3.5 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#EDE5D8] dark:border-stone-700/80 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 uppercase">
                      🛡️ Antiparasitario
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">30d - 90d</span>
                  </div>
                  <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs">
                    Pipetas, Pastillas & Desparasitante
                  </h5>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                    Control mensual para pulgas/garrapatas y purga gastrointestinal trimestral según peso corporal.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => addQuickTemplate(activePet.type === 'dog' ? 'Pipeta o Pastilla Antipulgas / Garrapatas' : 'Pipeta Antipulgas Felina', 'deworming', 30, activePet.type === 'dog' ? '1 dosis mensual' : '1 pipeta en cuello')}
                    className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                  >
                    <span>+ Antipulgas (30 días)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuickTemplate(activePet.type === 'dog' ? 'Desparasitante Interno Oral' : 'Desparasitante Interno Felino', 'deworming', 90, '1 dosis según peso')}
                    className="w-full py-1.5 px-2 bg-stone-100 hover:bg-stone-200/90 text-stone-800 border border-stone-200 dark:bg-stone-700/60 dark:text-stone-200 dark:border-stone-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                  >
                    <span>+ Desparasitación (90 días)</span>
                  </button>
                </div>
              </div>

              {/* Columna 3: Salud Integral & Controles Clínicos */}
              <div className="p-3.5 bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl border border-[#EDE5D8] dark:border-stone-700/80 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 uppercase">
                      🩺 Controles & Salud
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">Semestral</span>
                  </div>
                  <h5 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-xs">
                    {activePet.type === 'dog' ? 'Tos de Perreras & Chequeo' : 'Leucemia & Chequeo'}
                  </h5>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                    {activePet.type === 'dog'
                      ? 'Evaluación semestral del bienestar y refuerzo respiratorio.'
                      : 'Chequeo veterinario preventivo y control de bolas de pelo.'}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => addQuickTemplate('Control Veterinario General', 'checkup', 180, 'Chequeo preventivo')}
                    className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100/90 text-blue-900 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/80 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                  >
                    <span>+ Control Veterinario (180d)</span>
                  </button>
                  {activePet.type === 'dog' ? (
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Vacuna Contra Tos de Perreras', 'vaccine', 180, '1 dosis semestral')}
                      className="w-full py-1.5 px-2 bg-stone-100 hover:bg-stone-200/90 text-stone-800 border border-stone-200 dark:bg-stone-700/60 dark:text-stone-200 dark:border-stone-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                    >
                      <span>+ Tos de Perreras (180d)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addQuickTemplate('Vacuna Leucemia Felina', 'vaccine', 365, '1 dosis anual')}
                      className="w-full py-1.5 px-2 bg-stone-100 hover:bg-stone-200/90 text-stone-800 border border-stone-200 dark:bg-stone-700/60 dark:text-stone-200 dark:border-stone-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                    >
                      <span>+ Leucemia FeLV (Anual)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* AVISO COMPACTO DE SEGURIDAD MÉDICA */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-red-200/90 dark:border-red-900/50 shadow-2xs flex items-start gap-3 no-print">
        <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          <strong className="font-bold text-stone-900 dark:text-stone-100">Nota Clínica Preventiva:</strong> Este cronograma es una guía de acompañamiento. Nunca mediques ni vacunes a {activePet.name} sin prescripción de un médico veterinario colegiado.
        </div>
      </div>

      {/* MODAL: VACIAR TODOS LOS RECORDATORIOS */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-sm w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                Esta acción borrará las vacunas y fechas registradas de tu mascota para que puedas comenzar con una lista en blanco.
              </p>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
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

      {/* MODAL: CONFIRMAR PLANTILLA RÁPIDA */}
      {confirmQuickTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
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
                <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">📌 Tratamiento:</p>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{confirmQuickTemplate.name}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  📅 Fecha programada:
                </label>
                <input
                  type="date"
                  value={confirmQuickTemplate.editableDate}
                  onChange={e => setConfirmQuickTemplate({
                    ...confirmQuickTemplate,
                    editableDate: e.target.value
                  })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-bold"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Sugerido: {confirmQuickTemplate.calculatedDate} (+{confirmQuickTemplate.days} días)
                </p>
              </div>

              {confirmQuickTemplate.dosage && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">💊 Dosis / Pauta:</p>
                  <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">{confirmQuickTemplate.dosage}</p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmQuickTemplate(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmQuickTemplateCreate}
                className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Confirmar y Agendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO RECORDATORIO MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Nuevo Recordatorio de Salud
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
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoría *</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value as Reminder['type'] })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                    >
                      <option value="vaccine">💉 Vacuna</option>
                      <option value="deworming">🧴 Antipulgas / Desparasitante</option>
                      <option value="medication">💊 Medicamento</option>
                      <option value="checkup">🩺 Control Veterinario</option>
                      <option value="bath">🛁 Baño & Grooming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha Programada *</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre de la vacuna o tratamiento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Vacuna Séxtuple, Pipeta Mensual..."
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dosis / Pauta</label>
                  <input
                    type="text"
                    placeholder="Ej. 1 tableta masticable, 1 ml..."
                    value={form.dosage}
                    onChange={e => setForm({ ...form, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Notas adicionales (opcional)</label>
                  <input
                    type="text"
                    placeholder="Indicaciones o clínica veterinaria"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR BAÑO */}
      {showBathModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-xl">
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
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Baño *</label>
                    <select
                      value={bathForm.type}
                      onChange={e => setBathForm({ ...bathForm, type: e.target.value as BathLog['type'] })}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
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
                    placeholder="Ej. Hipoalergénico Avena, Clorhexidina"
                    value={bathForm.shampooUsed}
                    onChange={e => setBathForm({ ...bathForm, shampooUsed: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Programar Próximo Baño En *</label>
                  <select
                    value={bathForm.nextBathDays}
                    onChange={e => setBathForm({ ...bathForm, nextBathDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/40"
                  >
                    <option value={7}>En 7 días (Recomendado Baño Medicado)</option>
                    <option value={15}>En 15 días (Recomendado Pelo Largo)</option>
                    <option value={21}>En 21 días (Frecuencia Estándar Canina)</option>
                    <option value={30}>En 30 días (Frecuencia Pelo Corto)</option>
                    <option value={45}>En 45 días (Peluquería & Felinos)</option>
                    <option value={60}>En 60 días (Felinos / Baño Seco)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Notas (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Secador tranquilo, oídos limpios"
                    value={bathForm.notes}
                    onChange={e => setBathForm({ ...bathForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBathModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Guardar y Programar Siguiente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR PLANTILLA RÁPIDA DE BAÑO */}
      {confirmQuickBath && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-xl">
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
                <span>Servicio:</span>
                <span className="text-teal-700 dark:text-teal-300 font-extrabold">{confirmQuickBath.name}</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  📅 Fecha realizada *
                </label>
                <input
                  type="date"
                  required
                  value={confirmQuickBath.bathDate}
                  onChange={e => setConfirmQuickBath({ ...confirmQuickBath, bathDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  🧴 Shampoo / Producto:
                </label>
                <input
                  type="text"
                  value={confirmQuickBath.shampooUsed}
                  onChange={e => setConfirmQuickBath({ ...confirmQuickBath, shampooUsed: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-1">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">⏰ Próximo Recordatorio Automático:</span>
                <p className="font-bold text-teal-800 dark:text-teal-300">
                  En {confirmQuickBath.daysToNext} días ({addDaysToDate(confirmQuickBath.bathDate, confirmQuickBath.daysToNext)})
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmQuickBath(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmQuickBathCreate}
                className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Guardar y Programar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETAR RECORDATORIO Y RE-PROGRAMAR CICLO */}
      {completingReminderState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1a231d] rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col max-h-[90dvh] my-auto overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#1a231d]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${
                  completingReminderState.reminder.dueDate < todayStr
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                    : completingReminderState.reminder.dueDate > todayStr
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
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
                    Confirmar Realización de Tratamiento
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
              <div className="space-y-2">
                <label className="block font-extrabold text-stone-800 dark:text-stone-200">
                  📅 ¿En qué fecha se aplicó? *
                </label>

                <input
                  type="date"
                  required
                  value={completingReminderState.completionDate}
                  onChange={e => setCompletingReminderState({
                    ...completingReminderState,
                    completionDate: e.target.value
                  })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500"
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
                        ? 'bg-[#143826] text-white border-[#143826] shadow-2xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
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
                          ? 'bg-[#143826] text-white border-[#143826] shadow-2xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      En fecha programada ({completingReminderState.reminder.dueDate})
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
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
                  <span>🔁 Programar automáticamente el próximo refuerzo</span>
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
                        className="w-20 px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-center font-extrabold text-stone-900 dark:text-stone-100"
                      />
                      <span className="text-stone-700 dark:text-stone-300 font-medium">días</span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
                      🗓️ Próxima fecha calculada: <span className="text-emerald-700 dark:text-emerald-400 font-black">{addDaysToDate(completingReminderState.completionDate, completingReminderState.recurringDays)}</span>
                    </div>
                  </div>
                )}
              </div>

              {completingReminderState.reminder.type === 'bath' && (
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-200/80 dark:border-teal-900/40 space-y-3">
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
                    <span>🛁 Guardar también en Historial de Baños Realizados</span>
                  </label>

                  {completingReminderState.logBathHistory && (
                    <div className="pl-6 pt-1 space-y-1">
                      <label className="block text-[11px] font-bold text-teal-900 dark:text-teal-300">
                        Shampoo / Producto Usado:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Shampoo hipoalergénico..."
                        value={completingReminderState.shampooUsed}
                        onChange={e => setCompletingReminderState({
                          ...completingReminderState,
                          shampooUsed: e.target.value
                        })}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-teal-300 dark:border-teal-700 rounded-xl font-medium"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setCompletingReminderState(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold text-xs cursor-pointer text-stone-700 dark:text-stone-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmCompleteReminder}
                className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1a4a32] text-white font-extrabold text-xs cursor-pointer shadow-xs transition-all"
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
