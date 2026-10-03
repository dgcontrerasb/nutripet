import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import { 
  Bell, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldAlert,
  Loader2,
  Syringe,
  Sparkles
} from 'lucide-react';

interface ReminderItem {
  id: string;
  title: string;
  date: string;
  category: 'vaccine' | 'deworming' | 'grooming' | 'vet' | 'medication';
  completed: boolean;
}

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const RemindersModule: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { activePet, isProOrTrial } = usePets();

  // 🔒 1. Si no es Pro o no ha iniciado sesión, muestra la tarjeta de bloqueo
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Sistema Inteligente de Vacunas y Notificaciones"
          description="Lleva el control de fechas de vacunación, desparasitaciones periódicas, citas veterinarias y corte de uñas sin olvidar ningún evento importante."
          benefits={[
            "Calendario programado de vacunas obligatorias y opcionales",
            "Control y avisos de desparasitación interna y externa",
            "Historial organizado de eventos médicos con alertas personalizadas"
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
          Selecciona o registra una mascota para gestionar sus vacunas y recordatorios.
        </p>
      </div>
    );
  }

  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: '1', title: 'Vacuna Antirrábica Anual', date: '2026-11-15', category: 'vaccine', completed: false },
    { id: '2', title: 'Desparasitación Interna (Pastilla)', date: '2026-10-20', category: 'deworming', completed: false },
    { id: '3', title: 'Pipeta Antipulgas / Garrapatas', date: '2026-10-05', category: 'deworming', completed: true },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState<'vaccine' | 'deworming' | 'grooming' | 'vet' | 'medication'>('vaccine');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const item: ReminderItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      date: newDate,
      category: newCategory,
      completed: false
    };

    setReminders(prev => [item, ...prev]);
    setNewTitle('');
    setNewDate('');
  };

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900 dark:text-stone-100 leading-tight">
                Vacunas y Recordatorios
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Calendario de salud para <strong className="text-stone-800 dark:text-stone-200">{activePet.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Formulario para agregar */}
        <form onSubmit={handleAddReminder} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-6">
          <input
            type="text"
            required
            placeholder="Título del evento (Ej: Vacuna Séxtuple)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="sm:col-span-2 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <input
            type="date"
            required
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="px-3 py-2.5 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Agregar Recordatorio
          </button>
        </form>

        {/* Lista de recordatorios */}
        <div className="mt-6 space-y-2.5">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                r.completed
                  ? 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleComplete(r.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    r.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 dark:border-stone-700 hover:border-emerald-500'
                  }`}
                >
                  {r.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${r.completed ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                    {r.title}
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-stone-400" /> {r.date}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteReminder(r.id)}
                className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Eliminar recordatorio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
