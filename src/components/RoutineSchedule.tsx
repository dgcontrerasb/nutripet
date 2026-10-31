import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, Download, Plus, Trash2, Heart, Edit3, Check, X, RotateCcw, 
  Sparkles, Utensils, Droplets, ShieldAlert, Sparkle, BookOpen
} from 'lucide-react';
import { PetProfile, CalculationResult } from '../types';

interface RoutineScheduleProps {
  profile: PetProfile;
  result: CalculationResult;
}

interface RoutineItem {
  id: string;
  time: string;
  activity: string;
  notes: string;
  type: 'food' | 'walk' | 'water' | 'care';
}

const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const RoutineSchedule: React.FC<RoutineScheduleProps> = ({ profile, result }) => {
  const petName = profile.name.trim() || 'Tu Mascota';

  const getInitialRoutines = useCallback((): RoutineItem[] => {
    return profile.type === 'dog'
      ? [
          {
            id: '1',
            time: '07:30 AM',
            activity: 'Paseo matutino y necesidades',
            notes: '20-30 min al aire libre para activarse',
            type: 'walk',
          },
          {
            id: '2',
            time: '08:00 AM',
            activity: `Desayuno (${result.gramsPerMeal}g)`,
            notes: 'Servir con agua fresca renovada',
            type: 'food',
          },
          {
            id: '3',
            time: '02:00 PM',
            activity: 'Revisión de agua fresca',
            notes: `Meta de hidratación: ${result.waterDailyMl.min}-${result.waterDailyMl.max} ml/día`,
            type: 'water',
          },
          ...(result.mealsPerDay >= 2
            ? [
                {
                  id: '4',
                  time: '07:30 PM',
                  activity: `Cena (${result.gramsPerMeal}g)`,
                  notes: 'Evitar juegos bruscos justo después de comer',
                  type: 'food' as const,
                },
              ]
            : []),
          {
            id: '5',
            time: '09:00 PM',
            activity: 'Paseo nocturno corto',
            notes: 'Última salida para necesidades y calma',
            type: 'walk',
          },
        ]
      : [
          {
            id: '1',
            time: '08:00 AM',
            activity: `Desayuno (${result.gramsPerMeal}g)`,
            notes: 'Plato limpio lejos de su caja de arena',
            type: 'food',
          },
          {
            id: '2',
            time: '11:00 AM',
            activity: 'Renovación de agua fresca',
            notes: 'Preferir agua fresca o fuentes activas',
            type: 'water',
          },
          {
            id: '3',
            time: '06:00 PM',
            activity: 'Sesión de juego interactivo',
            notes: '15 min de estimulación cazadora',
            type: 'care',
          },
          {
            id: '4',
            time: '08:30 PM',
            activity: `Cena (${result.gramsPerMeal}g)`,
            notes: 'Evita hiperactividad nocturna',
            type: 'food',
          },
        ];
  }, [profile.type, result.gramsPerMeal, result.mealsPerDay, result.waterDailyMl]);

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    try {
      const saved = localStorage.getItem(`nutripet_routines_${profile.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error al cargar rutinas guardadas:', e);
    }
    return getInitialRoutines();
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nutripet_routines_${profile.id}`);
      if (saved) {
        setRoutines(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.warn('Error al sincronizar rutinas:', e);
    }
    setRoutines(getInitialRoutines());
  }, [profile.id, getInitialRoutines]);

  useEffect(() => {
    try {
      localStorage.setItem(`nutripet_routines_${profile.id}`, JSON.stringify(routines));
    } catch (e) {
      console.warn('Error al guardar rutinas:', e);
    }
  }, [routines, profile.id]);

  const [newTime, setNewTime] = useState<string>('');
  const [newActivity, setNewActivity] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newType, setNewType] = useState<'food' | 'walk' | 'water' | 'care'>('care');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);

  const hasOutdatedFoodGrams = useMemo(() => {
    return routines.some(r => {
      if (r.type !== 'food') return false;
      const match = r.activity.match(/\((\d+(?:\.\d+)?)\s*g\)/i);
      if (match) {
        return parseFloat(match[1]) !== result.gramsPerMeal;
      }
      return false;
    });
  }, [routines, result.gramsPerMeal]);

  const handleUpdateAllFoodGrams = () => {
    const updated = routines.map(r => {
      if (r.type === 'food') {
        let updatedActivity = r.activity;
        if (/\(\d+(?:\.\d+)?\s*g\)/i.test(updatedActivity)) {
          updatedActivity = updatedActivity.replace(/\(\d+(?:\.\d+)?\s*g\)/gi, `(${result.gramsPerMeal}g)`);
        } else if (!updatedActivity.includes(`${result.gramsPerMeal}g`)) {
          updatedActivity = `${updatedActivity} (${result.gramsPerMeal}g)`;
        }
        return { ...r, activity: updatedActivity };
      }
      if (r.type === 'water') {
        let updatedNotes = r.notes;
        if (/(\d+)\s*-\s*(\d+)\s*ml/i.test(updatedNotes)) {
          updatedNotes = updatedNotes.replace(/(\d+)\s*-\s*(\d+)\s*ml/i, `${result.waterDailyMl.min}-${result.waterDailyMl.max} ml`);
        }
        return { ...r, notes: updatedNotes };
      }
      return r;
    });

    setRoutines(updated);
    try {
      localStorage.setItem(`nutripet_routines_${profile.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error al guardar rutinas sincronizadas:', e);
    }
  };

  const handleStartEdit = (item: RoutineItem) => {
    setConfirmDeleteId(null);
    let preparedItem = { ...item };
    if (preparedItem.type === 'food') {
      if (/\(\d+(?:\.\d+)?\s*g\)/i.test(preparedItem.activity)) {
        preparedItem.activity = preparedItem.activity.replace(/\(\d+(?:\.\d+)?\s*g\)/gi, `(${result.gramsPerMeal}g)`);
      }
    }
    setEditingItem(preparedItem);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.trim()) return;

    const newItem: RoutineItem = {
      id: Date.now().toString(),
      time: newTime.trim() || 'Hora libre',
      activity: newActivity.trim(),
      notes: newNotes.trim() || 'Hábito diario',
      type: newType,
    };

    setRoutines(prev => [...prev, newItem]);
    setNewTime('');
    setNewActivity('');
    setNewNotes('');
    setNewType('care');
    setShowAddForm(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.activity.trim()) return;
    setRoutines(prev => prev.map((r) => (r.id === editingItem.id ? editingItem : r)));
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setRoutines(prev => prev.filter((r) => r.id !== id));
  };

  const handleResetToSuggested = () => {
    const fresh = getInitialRoutines();
    setRoutines(fresh);
    try {
      localStorage.setItem(`nutripet_routines_${profile.id}`, JSON.stringify(fresh));
    } catch (e) {
      console.warn('Error al restablecer rutinas:', e);
    }
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes en tu navegador para descargar el PDF.');
      return;
    }

    const typeIconsMap: Record<string, string> = {
      food: '🥣',
      walk: '🦮',
      water: '💧',
      care: '✨',
    };

    const rowsHtml = routines.map((r) => `
      <tr style="border-bottom: 1px solid #e7e5e4;">
        <td style="padding: 10px 8px; font-weight: bold; color: #1c1917; font-size: 13px;">${escapeHtml(r.time)}</td>
        <td style="padding: 10px 8px;">
          <span style="font-size: 15px; margin-right: 6px;">${typeIconsMap[r.type] || '📌'}</span>
          <strong style="color: #0c0a09; font-size: 13px;">${escapeHtml(r.activity)}</strong>
        </td>
        <td style="padding: 10px 8px; color: #57534e; font-size: 12px;">${escapeHtml(r.notes || '-')}</td>
        <td style="padding: 10px 8px; text-align: center; color: #a8a29e; font-size: 12px;">[ &nbsp; ]</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rutina y Horarios - ${escapeHtml(petName)} | NutriPet</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: 900; color: #064e3b; margin: 0; }
          .subtitle { font-size: 12px; color: #57534e; margin-top: 3px; }
          .summary-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #059669; color: white; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          th:first-child { border-top-left-radius: 8px; }
          th:last-child { border-top-right-radius: 8px; }
          .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px dashed #d6d3d1; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">🐾 Horario de Rutina: ${escapeHtml(petName)}</h1>
            <p class="subtitle">Guía oficial de alimentación, paseos y hábitos diarios - NutriPet</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #78716c;">
            Fecha de emisión:<br><strong>${new Date().toLocaleDateString()}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div><strong>Mascota:</strong> ${escapeHtml(petName)} (${profile.type === 'dog' ? 'Perro 🐶' : 'Gato 🐱'})</div>
          <div><strong>Ración por toma:</strong> ${result.gramsPerMeal}g</div>
          <div><strong>Meta de agua:</strong> ${result.waterDailyMl.min}-${result.waterDailyMl.max} ml/día</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 20%;">Hora</th>
              <th style="width: 40%;">Actividad</th>
              <th style="width: 30%;">Detalle / Instrucción</th>
              <th style="width: 10%; text-align: center;">Listo</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          📌 <em>Pega esta hoja en la nevera para asegurar que toda la familia mantenga la rutina de ${escapeHtml(petName)}.</em>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      {/* Encabezado exclusivo para impresión */}
      <div className="hidden print:block pb-3 mb-3 border-b-2 border-stone-800">
        <h1 className="text-xl font-black text-black">NutriPet • Horario de Rutina y Alimentación</h1>
        <p className="text-xs text-stone-700 mt-1">
          Mascota: <strong>{petName}</strong> ({profile.type === 'dog' ? 'Perro' : 'Gato'} - {profile.weightKg} kg) | Ración recomendada: <strong>{result.gramsPerMeal}g</strong> por toma ({result.mealsPerDay} tomas/día) | Meta de agua: <strong>{result.waterDailyMl.min}-{result.waterDailyMl.max} ml/día</strong>
        </p>
      </div>

      {/* 📐 CONTENEDOR EN 2 TARJETAS INDEPENDIENTES (QUE JUNTO A OSLO FORMAN LOS 3 MÓDULOS) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* 🟩 MÓDULO 2 (CENTRAL): ORGANIZADOR + ACCIONES + LISTA     */}
        {/* ======================================================== */}
        <div className="xl:col-span-7 bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
          
          {/* Fila 1: Título completo y limpio sin cortes ni elipsis */}
          <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-black text-stone-900 dark:text-stone-100 text-base sm:text-lg leading-tight">
                Organizador de Rutina & Hábitos
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Cronograma de {petName}: tomas de comida ({result.gramsPerMeal}g), paseos e hidratación
              </p>
            </div>
          </div>

          {/* Fila 2: Barra de herramientas con los 3 botones perfectamente alineados en fila */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                {routines.length} eventos activos
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Sincronizado
              </span>
            </div>

            {/* Trío de Botones: sin romperse ni caerse de renglón */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-3xs active:scale-95"
                title="Descargar horario en PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSuggested}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer shadow-3xs active:scale-95"
                title="Restablecer sugerido"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Restablecer</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-3xs active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cerrar' : 'Añadir'}</span>
              </button>
            </div>
          </div>

          {/* Formulario para agregar nuevo hábito */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-stone-50 dark:bg-stone-800/60 p-3 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2.5 no-print animate-fade-in print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Categoría</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="food">🥣 Comida</option>
                    <option value="walk">🦮 Paseo / Ejercicio</option>
                    <option value="water">💧 Agua / Hidratación</option>
                    <option value="care">✨ Cuidado / Premio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Hora</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="ej. 04:00 PM"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Actividad o Toma *</label>
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="ej. Cepillado o comida"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-400"
                    required
                  />
                  {newType === 'food' && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          let cur = newActivity.trim();
                          if (/\((\d+(?:\.\d+)?)\s*g\)/i.test(cur)) {
                            cur = cur.replace(/\((\d+(?:\.\d+)?)\s*g\)/i, `(${result.gramsPerMeal}g)`);
                          } else if (!cur.includes(`${result.gramsPerMeal}g`)) {
                            cur = cur ? `${cur} (${result.gramsPerMeal}g)` : `Comida (${result.gramsPerMeal}g)`;
                          }
                          setNewActivity(cur);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[9.5px] font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Insertar {result.gramsPerMeal}g</span>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Notas breves</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="ej. 15 minutos"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-400"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 rounded-xl text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-3xs active:scale-95"
                >
                  Guardar hábito
                </button>
              </div>
            </form>
          )}

          {/* Modal / Formulario para editar rutina existente */}
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="bg-amber-50/90 dark:bg-amber-950/40 p-3 sm:p-4 rounded-xl border border-amber-300 dark:border-amber-700/70 space-y-2.5 no-print animate-fade-in shadow-xs print:hidden">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/80 pb-1.5">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  Editar Hábito de Rutina
                </span>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-amber-700 dark:text-amber-300 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Categoría</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="food">🥣 Comida</option>
                    <option value="walk">🦮 Paseo / Ejercicio</option>
                    <option value="water">💧 Agua / Hidratación</option>
                    <option value="care">✨ Cuidado / Premio</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Hora</label>
                  <input
                    type="text"
                    value={editingItem.time}
                    onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                    placeholder="ej. 08:00 AM"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500 placeholder:text-stone-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Actividad o Toma *</label>
                  <input
                    type="text"
                    value={editingItem.activity}
                    onChange={(e) => setEditingItem({ ...editingItem, activity: e.target.value })}
                    placeholder="ej. Desayuno (150g)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500 placeholder:text-stone-400"
                    required
                  />
                  {editingItem.type === 'food' && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          let cur = editingItem.activity.trim();
                          if (/\((\d+(?:\.\d+)?)\s*g\)/i.test(cur)) {
                            cur = cur.replace(/\((\d+(?:\.\d+)?)\s*g\)/i, `(${result.gramsPerMeal}g)`);
                          } else if (!cur.includes(`${result.gramsPerMeal}g`)) {
                            cur = cur ? `${cur} (${result.gramsPerMeal}g)` : `Comida (${result.gramsPerMeal}g)`;
                          }
                          setEditingItem({ ...editingItem, activity: cur });
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[9.5px] font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Insertar {result.gramsPerMeal}g</span>
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Notas breves</label>
                  <input
                    type="text"
                    value={editingItem.notes}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    placeholder="ej. Con agua tibia"
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-1 focus:ring-amber-500 placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-2.5 py-1 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-3xs active:scale-95 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          )}

          {/* Banner de alerta de gramaje desactualizado */}
          {hasOutdatedFoodGrams && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-xl p-3 text-xs shadow-3xs animate-fade-in print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2">
                <span className="text-sm shrink-0">⚠️</span>
                <p className="text-amber-900 dark:text-amber-200 leading-snug font-medium text-[11px] sm:text-xs">
                  Comidas con gramaje desactualizado (calculado: <strong className="font-extrabold text-amber-950 dark:text-amber-100">{result.gramsPerMeal}g</strong> por toma).
                </p>
              </div>
              <button
                type="button"
                onClick={handleUpdateAllFoodGrams}
                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-3xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-3 h-3" />
                <span>Actualizar a {result.gramsPerMeal}g</span>
              </button>
            </div>
          )}

          {/* Lista de Eventos */}
          <div className="space-y-2">
            {routines.map((item, index) => {
              const typeIcons = {
                food: '🥣',
                walk: '🦮',
                water: '💧',
                care: '✨',
              };

              const isEditingThis = editingItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all print:border-stone-400 print:bg-white print:text-black print:p-2 ${
                    isEditingThis
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-stone-200/90 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-stone-50/50 dark:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-lg shrink-0 print:text-base">{typeIcons[item.type] || '📌'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                          {item.activity}
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[10.5px] sm:text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {item.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 print:hidden">
                    <span className="text-[11px] text-stone-400 font-mono hidden md:inline mr-1">
                      #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      title="Editar hábito"
                      className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 p-0.5 rounded-lg border border-rose-200 dark:border-rose-800 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded text-[10px] font-bold cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setConfirmDeleteId(item.id);
                        }}
                        title="Eliminar hábito"
                        className="w-7 h-7 rounded-lg bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/80 flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consejo al pie de la lista */}
          <div className="p-2.5 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center gap-2 text-[10.5px] sm:text-xs text-stone-500 dark:text-stone-400 print:border-stone-400 print:bg-white print:text-black">
            <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 print:text-black" />
            <span className="leading-snug">
              Los perros y gatos se sienten mucho más seguros y tranquilos cuando sus horarios de paseo y comida son estables.
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 🟩 MÓDULO 3 (DERECHO): PANEL CLÍNICO HOMOGÉNEO Y SIMÉTRICO */}
        {/* ======================================================== */}
        <div className="xl:col-span-5 bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all print:hidden">
          
          {/* Cabecera Simétrica Nivelada con el Centro */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Guía Clínica & Pautas
              </h4>
            </div>
            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              FEDIAF / NRC
            </span>
          </div>

          {/* Submódulo A: Dosificación Por Toma */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white to-stone-50 dark:from-emerald-950/20 dark:via-stone-900 dark:to-stone-900 border border-emerald-200/70 dark:border-emerald-800/60 shadow-3xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Dosificación Por Toma
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {result.mealsPerDay} tomas/día
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 text-center">
                <span className="text-[8.5px] font-mono uppercase text-stone-400 block">Ración / Toma</span>
                <span className="text-base font-black text-stone-900 dark:text-stone-100 font-tabular">
                  {result.gramsPerMeal} <span className="text-[10px] font-normal text-stone-400">g</span>
                </span>
                <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold">
                  {result.mealsPerDay === 2 ? 'Mañana & Noche' : `${result.mealsPerDay} veces`}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 text-center">
                <span className="text-[8.5px] font-mono uppercase text-stone-400 block">Meta Hidratación</span>
                <span className="text-base font-black text-stone-900 dark:text-stone-100 font-tabular">
                  {result.waterDailyMl.min}-{result.waterDailyMl.max} <span className="text-[10px] font-normal text-stone-400">ml</span>
                </span>
                <span className="text-[8.5px] text-blue-600 dark:text-blue-400 block mt-0.5 font-bold flex items-center justify-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5" /> 50-60 ml/kg
                </span>
              </div>
            </div>

            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
              Dividir el alimento en {result.mealsPerDay} tomas previene picos de glucosa y reduce la fermentación intestinal en {petName}.
            </p>
          </div>

          {/* Submódulo B: Cronobiología & Reposo Digestivo */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 shadow-3xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs border-b border-amber-200/60 dark:border-amber-900/40 pb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Regla de Oro: Reposo Digestivo</span>
            </div>

            <div className="space-y-1.5 text-[10.5px] text-stone-600 dark:text-stone-300 leading-snug">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>No ejercicio previo:</strong> Reposar 30 min antes de la comida.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Reposo posterior:</strong> Evitar saltos o carreras durante 60-90 min tras comer para prevenir dilatación gástrica.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 font-black">•</span>
                <span><strong>Vaciado fisiológico:</strong> El pienso seco tarda entre 8 a 10 horas en digerirse por completo.</span>
              </div>
            </div>
          </div>

          {/* Submódulo C: Protocolo de Higiene & Manto */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 shadow-3xs space-y-2">
            <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-900/40 pb-1.5">
              <span className="text-xs font-black text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <span className="text-sm">🛁</span>
                Protocolo de Higiene & Manto
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200">
                {profile.type === 'dog' ? 'Canino' : 'Felino'}
              </span>
            </div>

            <div className="space-y-1.5 text-[10.5px] text-stone-600 dark:text-stone-300 leading-snug">
              <div className="flex items-start gap-1.5">
                <Sparkle className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Cepillado regular:</strong> 2 a 3 veces por semana para oxigenar su piel.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Sparkle className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Frecuencia de baño:</strong> Cada 3 a 5 semanas con shampoo dermocosmético específico.</span>
              </div>
            </div>

            <p className="text-[9.5px] text-teal-800/80 dark:text-teal-400 pt-0.5 font-medium">
              💡 Vincula los días de aseo en Notificaciones para recibir alertas automáticas.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};