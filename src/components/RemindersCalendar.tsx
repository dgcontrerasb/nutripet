import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Syringe, 
  Pill, 
  HeartPulse, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { Reminder } from '../types';

interface Props {
  onOpenAddModalWithDate: (dateStr: string) => void;
  onToggleReminder?: (reminder: Reminder) => void;
}

export const RemindersCalendar: React.FC<Props> = ({ onOpenAddModalWithDate, onToggleReminder }) => {
  const { activePet, reminders, toggleReminder } = usePets();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!activePet) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Day of week of first day (0 is Sunday, 1 is Monday...)
  let firstDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0 and Sunday is 6
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Group reminders by date string YYYY-MM-DD
  const remindersByDate = reminders.reduce((acc, rem) => {
    const d = rem.dueDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(rem);
    return acc;
  }, {} as Record<string, Reminder[]>);

  // Selected date events
  const selectedDayReminders = remindersByDate[selectedDateStr] || [];

  const getEventBadge = (type: Reminder['type']) => {
    switch (type) {
      case 'vaccine':
        return { label: 'Vacuna', bg: 'bg-purple-100 text-purple-900 border-purple-200', icon: '💉' };
      case 'deworming':
        return { label: 'Desparasitación', bg: 'bg-amber-100 text-amber-900 border-amber-200', icon: '💊' };
      case 'checkup':
        return { label: 'Cita Médica', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', icon: '🏥' };
      case 'medication':
        return { label: 'Medicina', bg: 'bg-rose-100 text-rose-900 border-rose-200', icon: '🩺' };
      default:
        return { label: 'Recordatorio', bg: 'bg-blue-100 text-blue-900 border-blue-200', icon: '🔔' };
    }
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-7 shadow-xs space-y-6">
      
      {/* Header del Calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70">
            <CalendarIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">
              Calendario Mensual de Tratamientos y Vacunas
            </h3>
            <p className="text-xs text-stone-500">
              Cronograma visual interactivo para {activePet.name}
            </p>
          </div>
        </div>

        {/* Controles de Navegación del Mes */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Hoy
          </button>
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-extrabold text-stone-800 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="space-y-2">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {daysOfWeek.map(d => (
            <div key={d} className="py-1.5 text-xs font-extrabold text-stone-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas del Mes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Espacios vacíos antes del día 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-stone-50/40 border border-dashed border-stone-100 p-1 opacity-40"></div>
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;
            const dayEvents = remindersByDate[dateStr] || [];
            const hasPending = dayEvents.some(e => !e.completed);
            const isPast = dateStr < todayStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[70px] sm:min-h-[90px] rounded-2xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs ring-2 ring-emerald-500/20'
                    : isToday
                    ? 'bg-blue-50/60 border-blue-400'
                    : 'bg-white hover:bg-stone-50 border-stone-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center ${
                    isToday 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : isSelected 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-stone-700'
                  }`}>
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      hasPending ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event previews in cell */}
                <div className="space-y-0.5 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(ev => {
                    const badge = getEventBadge(ev.type);
                    return (
                      <div
                        key={ev.id}
                        className={`text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded truncate flex items-center gap-1 ${
                          ev.completed ? 'line-through opacity-50 bg-stone-100 text-stone-500' : badge.bg
                        }`}
                        title={ev.name}
                      >
                        <span>{badge.icon}</span>
                        <span className="truncate">{ev.name}</span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] font-bold text-stone-400 block text-right">
                      +{dayEvents.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del Día Seleccionado */}
      <div className="p-4 sm:p-5 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-extrabold text-stone-900 font-heading">
              Eventos para el {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddModalWithDate(selectedDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Programar para esta fecha</span>
          </button>
        </div>

        {selectedDayReminders.length === 0 ? (
          <div className="py-4 text-center text-xs text-stone-400">
            No hay citas, vacunas ni tratamientos programados para este día.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedDayReminders.map(ev => {
              const badge = getEventBadge(ev.type);
              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-2xl bg-white border flex items-center justify-between gap-3 shadow-2xs ${
                    ev.completed ? 'border-stone-200 opacity-60' : 'border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleReminder ? onToggleReminder(ev) : toggleReminder(ev.id, ev.completed)}
                      className="text-stone-400 hover:text-emerald-600 shrink-0 cursor-pointer"
                    >
                      {ev.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.icon} {badge.label}
                        </span>
                        {ev.dosage && (
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {ev.dosage}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-bold text-stone-900 mt-1 truncate ${ev.completed ? 'line-through text-stone-400' : ''}`}>
                        {ev.name}
                      </h4>
                      {ev.notes && (
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-1 rounded-xl shrink-0 ${
                    ev.completed ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {ev.completed ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
