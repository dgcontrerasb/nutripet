import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  MessageCircle,
  Pill
} from 'lucide-react';
import { Reminder } from '../types';

interface Props {
  onOpenAddModalWithDate: (dateStr: string) => void;
  onToggleReminder?: (reminder: Reminder) => void;
  onSendWhatsApp?: (reminder: Reminder) => void;
  onDeleteReminder?: (id: string) => void;
  onQuickTemplate?: (name: string, type: Reminder['type'], defaultDays: number, dosage?: string) => void;
}

export const RemindersCalendar: React.FC<Props> = ({
  onOpenAddModalWithDate,
  onToggleReminder,
  onSendWhatsApp,
  onDeleteReminder,
  onQuickTemplate
}) => {
  const { activePet, reminders, toggleReminder, deleteReminder } = usePets();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!activePet) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let firstDayOfWeek = new Date(year, month, 1).getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentDate(new Date(y, today.getMonth(), 1));
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const remindersByDate = reminders.reduce((acc, rem) => {
    const d = rem.dueDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(rem);
    return acc;
  }, {} as Record<string, Reminder[]>);

  const selectedDayReminders = remindersByDate[selectedDateStr] || [];
  const sortedAllReminders = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const handleWhatsAppFallback = (rem: Reminder) => {
    if (onSendWhatsApp) {
      onSendWhatsApp(rem);
      return;
    }
    const message =
`🐾 *NUTRIPET CLINICAL CARE • RECORDATORIO DE SALUD*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🩺 *Paciente:* ${activePet.name} (${activePet.type === 'dog' ? 'Canino' : 'Felino'})
💉 *Tratamiento:* ${rem.name}
🗓️ *Fecha Programada:* ${rem.dueDate}
⚖️ *Dosis / Pauta:* ${rem.dosage || rem.notes || '1 aplicación de refuerzo'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *Pautas de Cuidado:*
• Mantén a ${activePet.name} en reposo y evita ejercicio intenso durante el día.
• En caso de vacunas, evitar baños las siguientes 48 horas.

📲 _Gestionado desde el Expediente Digital NutriPet_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (id: string) => {
    if (onDeleteReminder) {
      onDeleteReminder(id);
    } else {
      deleteReminder(id);
    }
    setConfirmDeleteId(null);
  };

  const getEventBadge = (rem: Reminder) => {
    const nameLower = rem.name.toLowerCase();
    if (rem.type === 'vaccine' || nameLower.includes('vacuna') || nameLower.includes('antirrábica') || nameLower.includes('triple')) {
      return {
        label: 'Vacuna',
        bg: 'bg-purple-50 text-purple-800 border-purple-200/90 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500',
        icon: '💉'
      };
    }
    if (nameLower.includes('pulga') || nameLower.includes('pipeta') || nameLower.includes('garrapata')) {
      return {
        label: 'Antipulgas',
        bg: 'bg-amber-50 text-amber-800 border-amber-200/90 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        icon: '🛡️'
      };
    }
    if (rem.type === 'deworming' || nameLower.includes('desparasit')) {
      return {
        label: 'Desparasitación',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        icon: '💊'
      };
    }
    if (rem.type === 'bath' || nameLower.includes('baño') || nameLower.includes('grooming')) {
      return {
        label: 'Baño',
        bg: 'bg-blue-50 text-blue-800 border-blue-200/90 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500',
        icon: '🛁'
      };
    }
    return {
      label: 'Control / Salud',
      bg: 'bg-teal-50 text-teal-800 border-teal-200/90 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
      dot: 'bg-teal-500',
      icon: '🩺'
    };
  };

  const getCountdownChip = (dueDate: string, completed: boolean) => {
    if (completed) {
      return { text: 'Completado', cls: 'bg-stone-100 text-stone-500 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700' };
    }
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const [dy, dm, dd] = dueDate.split('-').map(Number);
    const diffDays = Math.round((new Date(dy, dm - 1, dd).getTime() - new Date(ty, tm - 1, td).getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Vencido (${Math.abs(diffDays)}d)`,
        cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-extrabold'
      };
    }
    if (diffDays === 0) {
      return {
        text: '¡Toca Hoy!',
        cls: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-extrabold'
      };
    }
    if (diffDays <= 7) {
      return {
        text: `Faltan ${diffDays} días`,
        cls: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      };
    }
    return {
      text: `En ${diffDays} días`,
      cls: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* COLUMNA IZQUIERDA (lg:col-span-7): PRÓXIMOS REFUERZOS & HITOS DE SALUD */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                CRONOGRAMA CLÍNICO ACTIVO
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  Próximos Refuerzos & Hitos de Salud
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                  {reminders.filter(r => !r.completed).length} activos
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAddModalWithDate(selectedDateStr)}
              className="bg-[#143826] hover:bg-[#1a4a32] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar en {selectedDateStr}</span>
            </button>
          </div>

          {/* Eventos filtrados del día seleccionado si existen */}
          {selectedDayReminders.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  📅 Seleccionado: {selectedDateStr} ({selectedDayReminders.length} evento{selectedDayReminders.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className="space-y-2">
                {selectedDayReminders.map(ev => {
                  const badge = getEventBadge(ev);
                  return (
                    <div
                      key={`sel-${ev.id}`}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200/80 dark:border-stone-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{badge.icon}</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100 truncate">{ev.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppFallback(ev)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sortedAllReminders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Sin eventos programados en el calendario de {activePet.name}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                Selecciona cualquier día en el mini-calendario o usa las plantillas de salud para programar un refuerzo.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
              {sortedAllReminders.map(rem => {
                const badge = getEventBadge(rem);
                const countdown = getCountdownChip(rem.dueDate, rem.completed);
                const isConfirming = confirmDeleteId === rem.id;

                return (
                  <div
                    key={rem.id}
                    className={`bg-white dark:bg-stone-900 border rounded-2xl p-4 shadow-2xs transition-all space-y-2.5 ${
                      rem.completed
                        ? 'border-stone-200/70 dark:border-stone-800 opacity-60'
                        : 'border-stone-200/90 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleReminder ? onToggleReminder(rem) : toggleReminder(rem.id, rem.completed)}
                          className="mt-0.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shrink-0 transition-colors"
                          title={rem.completed ? 'Marcar como pendiente' : 'Completar'}
                        >
                          {rem.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${badge.bg}`}>
                              {badge.icon} {badge.label}
                            </span>
                            <h4 className={`font-heading font-black text-stone-900 dark:text-stone-100 text-sm leading-tight ${rem.completed ? 'line-through text-stone-400 dark:text-stone-500' : ''}`}>
                              {rem.name}
                            </h4>
                          </div>

                          {(rem.dosage || rem.notes) && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                              {rem.dosage && (
                                <span className="inline-flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                                  <Pill className="w-3 h-3 text-stone-400" /> {rem.dosage}
                                </span>
                              )}
                              {rem.notes && (
                                <span className="italic text-[11px] text-stone-500 dark:text-stone-400">
                                  • {rem.notes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${countdown.cls}`}>
                        {countdown.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 pl-7">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-stone-600 dark:text-stone-400">
                        <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                        {rem.dueDate}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleWhatsAppFallback(rem)}
                          className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-3xs cursor-pointer active:scale-95 transition-all"
                          title="Enviar recordatorio clínico por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>

                        {isConfirming ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded-xl border border-red-200 dark:border-red-900">
                            <span className="text-[10px] font-bold text-red-700 dark:text-red-300">¿Borrar?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(rem.id)}
                              className="px-2 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-bold cursor-pointer"
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
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Eliminar recordatorio"
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
      </div>

      {/* COLUMNA DERECHA (lg:col-span-5): MINI-CALENDARIO COMPACTO + PLANTILLAS DE SALUD */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3.5">
          {/* Header del Mini-Calendario */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block">
                RADAR MENSUAL
              </span>
              <h4 className="font-heading font-extrabold text-sm text-stone-900 dark:text-stone-100">
                {monthNames[month]} {year}
              </h4>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 transition-colors cursor-pointer"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 transition-colors cursor-pointer"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid Compacto de Celdas de Bajo Perfil (36-40px) */}
          <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 text-center">
              {daysOfWeek.map(d => (
                <div key={d} className="py-1 text-[10px] font-mono font-bold text-stone-400 uppercase">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-9 sm:h-10 rounded-xl bg-stone-50/50 dark:bg-stone-800/20 border border-dashed border-stone-100 dark:border-stone-800/40"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;
                const dayEvents = remindersByDate[dateStr] || [];

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dateStr)}
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
                          const b = getEventBadge(ev);
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

          {/* Leyenda compacta de puntos */}
          <div className="flex items-center justify-center gap-3 pt-1 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400 font-medium flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Vacuna
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Antipulgas
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Desparasit.
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Baño
            </span>
          </div>
        </div>

        {/* Plantillas Rápidas de Salud al pie */}
        {onQuickTemplate && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
                PLANTILLAS RÁPIDAS DE SALUD
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onQuickTemplate(activePet.type === 'dog' ? 'Vacuna Antirrábica Anual' : 'Vacuna Triple Felina RPC', 'vaccine', 365, '1 dosis anual')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                + Antirrábica
              </button>
              <button
                type="button"
                onClick={() => onQuickTemplate('Pipeta / Pastilla Antipulgas y Garrapatas', 'deworming', 30, '1 aplicación mensual')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                + Antipulgas
              </button>
              <button
                type="button"
                onClick={() => onQuickTemplate('Desparasitación Interna Trimestral', 'deworming', 90, '1 tableta según peso')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                + Desparasitación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
