import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Download, FileText, Plus, Trash2, Heart, Edit3, Check, X, RotateCcw, Sparkles } from 'lucide-react';
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

export const RoutineSchedule: React.FC<RoutineScheduleProps> = ({ profile, result }) => {
  const petName = profile.name.trim() || 'Tu Mascota';

  // Horarios iniciales inteligentes según comidas, gramos y especie
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
            notes: 'Última salida para hacer sus necesidades y cepillado',
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
            notes: 'A los gatos les gusta el agua fría o fuentes con movimiento',
            type: 'water',
          },
          {
            id: '3',
            time: '06:00 PM',
            activity: 'Sesión de juego interactivo',
            notes: '15 min con varita o ratón para ejercitar su instinto',
            type: 'care',
          },
          {
            id: '4',
            time: '08:30 PM',
            activity: `Cena (${result.gramsPerMeal}g)`,
            notes: 'Mantener rutina constante para evitar ansiedad nocturna',
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

  // 1. Sincronización multi-mascota: recargar rutinas al cambiar de mascota activa
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nutripet_routines_${profile.id}`);
      if (saved) {
        setRoutines(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.warn('Error al sincronizar rutinas por cambio de mascota:', e);
    }
    setRoutines(getInitialRoutines());
  }, [profile.id, getInitialRoutines]);

  // Guardar en localStorage al modificar
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

  // Estado para editar rutina existente
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);

  // 1. Detección de gramaje de comida desactualizado entre paréntesis
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

  // Actualiza automáticamente todas las comidas reemplazando (Xg) por ({result.gramsPerMeal}g) y persiste en localStorage
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

  // 2. Al abrir el formulario de edición: si es comida con gramaje viejo, actualiza automáticamente el valor inicial
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
        <td style="padding: 10px 8px; font-weight: bold; color: #1c1917; font-size: 13px;">${r.time}</td>
        <td style="padding: 10px 8px;">
          <span style="font-size: 15px; margin-right: 6px;">${typeIconsMap[r.type] || '📌'}</span>
          <strong style="color: #0c0a09; font-size: 13px;">${r.activity}</strong>
        </td>
        <td style="padding: 10px 8px; color: #57534e; font-size: 12px;">${r.notes || '-'}</td>
        <td style="padding: 10px 8px; text-align: center; color: #a8a29e; font-size: 12px;">[ &nbsp; ]</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rutina y Horarios - ${petName} - NutriPet</title>
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
            <h1 class="title">🐾 Horario de Rutina: ${petName}</h1>
            <p class="subtitle">Guía oficial de alimentación, paseos y hábitos diarios - NutriPet</p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #78716c;">
            Fecha de emisión:<br><strong>${new Date().toLocaleDateString()}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div><strong>Mascota:</strong> ${petName} (${profile.type === 'dog' ? 'Perro 🐶' : 'Gato 🐱'})</div>
          <div><strong>Ración por toma:</strong> ${result.gramsPerMeal}g</div>
          <div><strong>Meta de agua:</strong> ${result.waterDailyMl.min} - ${result.waterDailyMl.max} ml/día</div>
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
          📌 <em>Pega esta hoja en la nevera para asegurar que toda la familia mantenga la rutina de ${petName}.</em>
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
    <div className="bg-white dark:bg-stone-900 border-2 border-emerald-500/20 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 print:border-stone-400 print:bg-white print:text-black print:p-4 print:shadow-none">
      {/* Encabezado exclusivo para impresión */}
      <div className="hidden print:block pb-3 mb-3 border-b-2 border-stone-800">
        <h1 className="text-xl font-black text-black">NutriPet • Horario de Rutina y Alimentación</h1>
        <p className="text-xs text-stone-700 mt-1">
          Mascota: <strong>{petName}</strong> ({profile.type === 'dog' ? 'Perro' : 'Gato'} • {profile.weightKg} kg) | Ración recomendada: <strong>{result.gramsPerMeal}g</strong> por toma ({result.mealsPerDay} tomas/día) | Meta de agua: <strong>{result.waterDailyMl.min}-{result.waterDailyMl.max} ml/día</strong>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-lg">
              Organizador de Rutina y Horarios de {petName}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Horarios claros para nevera: paseos, tomas de comida ({result.gramsPerMeal}g) e hidratación
            </p>
          </div>
        </div>

        {/* Acciones principales de la cabecera */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Botón Descargar Horario PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Descargar o imprimir horario en formato PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>

          {/* Botón Recalcular / Restablecer a sugerido */}
          <button
            type="button"
            onClick={handleResetToSuggested}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Recalcular con los gramos de comida y agua actuales de la calculadora"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            <span className="hidden sm:inline">Restablecer sugerido</span>
            <span className="sm:hidden">Restablecer</span>
          </button>

          {/* Botón Añadir Hábito */}
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cerrar' : 'Añadir Hábito'}</span>
          </button>
        </div>
      </div>

      {/* Formulario para agregar nuevo hábito */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3 no-print animate-fade-in print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Categoría</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="food">🥣 Comida</option>
                <option value="walk">🦮 Paseo / Ejercicio</option>
                <option value="water">💧 Agua / Hidratación</option>
                <option value="care">✨ Cuidado / Premio</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Hora</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="ej. 04:00 PM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Actividad o Toma *</label>
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="ej. Cepillado, premio o comida"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
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
                      } else if (/\b(\d+(?:\.\d+)?)\s*g\b/i.test(cur)) {
                        cur = cur.replace(/\b(\d+(?:\.\d+)?)\s*g\b/i, `(${result.gramsPerMeal}g)`);
                      } else if (!cur.includes(`${result.gramsPerMeal}g`)) {
                        cur = cur ? `${cur} (${result.gramsPerMeal}g)` : `Comida (${result.gramsPerMeal}g)`;
                      }
                      setNewActivity(cur);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Insertar ración calculada ({result.gramsPerMeal}g)</span>
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 block mb-1">Notas breves</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="ej. 1 cucharada o 15 minutos"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
              />
              {newType === 'water' && (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewNotes(`Meta de hidratación: ${result.waterDailyMl.min}-${result.waterDailyMl.max} ml/día`);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/70 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Meta de agua ({result.waterDailyMl.min}-${result.waterDailyMl.max} ml)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95"
            >
              Guardar en horario
            </button>
          </div>
        </form>
      )}

      {/* Modal / Formulario para editar rutina existente */}
      {editingItem && (
        <form onSubmit={handleSaveEdit} className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-700/70 space-y-3 no-print animate-fade-in shadow-md print:hidden">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/80 pb-2">
            <span className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Editar Hábito de Rutina
            </span>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Categoría</label>
              <select
                value={editingItem.type}
                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="food">🥣 Comida</option>
                <option value="walk">🦮 Paseo / Ejercicio</option>
                <option value="water">💧 Agua / Hidratación</option>
                <option value="care">✨ Cuidado / Premio</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Hora</label>
              <input
                type="text"
                value={editingItem.time}
                onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                placeholder="ej. 08:00 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Actividad o Toma *</label>
              <input
                type="text"
                value={editingItem.activity}
                onChange={(e) => setEditingItem({ ...editingItem, activity: e.target.value })}
                placeholder="ej. Desayuno (150g)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
                required
              />
              {/* 2. Sugerencia en el formulario de edición para tipo food */}
              {editingItem.type === 'food' && (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      let cur = editingItem.activity.trim();
                      if (/\((\d+(?:\.\d+)?)\s*g\)/i.test(cur)) {
                        cur = cur.replace(/\((\d+(?:\.\d+)?)\s*g\)/i, `(${result.gramsPerMeal}g)`);
                      } else if (/\b(\d+(?:\.\d+)?)\s*g\b/i.test(cur)) {
                        cur = cur.replace(/\b(\d+(?:\.\d+)?)\s*g\b/i, `(${result.gramsPerMeal}g)`);
                      } else if (!cur.includes(`${result.gramsPerMeal}g`)) {
                        cur = cur ? `${cur} (${result.gramsPerMeal}g)` : `Comida (${result.gramsPerMeal}g)`;
                      }
                      setEditingItem({ ...editingItem, activity: cur });
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Insertar ración calculada ({result.gramsPerMeal}g)</span>
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">Notas breves</label>
              <input
                type="text"
                value={editingItem.notes}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                placeholder="ej. Con agua tibia"
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
              />
              {/* 3. Sugerencia en el formulario de edición para tipo water */}
              {editingItem.type === 'water' && (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({
                        ...editingItem,
                        notes: `Meta de hidratación: ${result.waterDailyMl.min}-${result.waterDailyMl.max} ml/día`,
                      });
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/70 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Insertar meta de agua ({result.waterDailyMl.min}-${result.waterDailyMl.max} ml)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-3 py-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      )}

      {/* 1. Banner de alerta de gramaje desactualizado arriba de la lista */}
      {hasOutdatedFoodGrams && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-3.5 sm:p-4 text-xs shadow-xs animate-fade-in print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              Hay comidas con gramaje desactualizado (calculado: <strong className="font-extrabold text-amber-950 dark:text-amber-100">{result.gramsPerMeal}g</strong> por toma).
            </p>
          </div>
          <button
            type="button"
            onClick={handleUpdateAllFoodGrams}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actualizar todas las comidas a {result.gramsPerMeal}g</span>
          </button>
        </div>
      )}

      {/* Lista visual de horarios */}
      <div className="space-y-2.5 print:space-y-2">
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
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all group print:border-stone-400 print:bg-white print:text-black print:p-2.5 ${
                isEditingThis
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-stone-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0 print:text-lg">{typeIcons[item.type] || '📌'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 font-heading print:text-black print:text-xs">
                      {item.activity}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 print:bg-stone-100 print:text-black print:border print:border-stone-300">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 print:text-stone-700">
                    {item.notes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 print:hidden">
                <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                  #{index + 1}
                </span>

                {/* Botón para Editar */}
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  title="Editar este hábito de rutina"
                  className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center transition-all cursor-pointer no-print shadow-3xs active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 p-1 rounded-xl border border-rose-200 dark:border-rose-800 no-print animate-in fade-in">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 px-1">¿Eliminar?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
                    title="Eliminar este hábito de la rutina"
                    className="w-8 h-8 rounded-xl bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/80 flex items-center justify-center transition-all cursor-pointer no-print shadow-3xs active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-900 dark:text-teal-200 shadow-2xs print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-teal-100 dark:bg-teal-900/80 rounded-xl text-teal-700 dark:text-teal-300 text-base">🛁</span>
          <div>
            <strong className="font-extrabold text-stone-900 dark:text-white block text-xs">
              Control de Baño e Higiene de {petName}
            </strong>
            <span className="text-[11px] text-stone-600 dark:text-stone-300">
              Registra los días de baño, shampoos utilizados y programa recordatorios en el módulo de Notificaciones para mantener su piel saludable.
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 print:border-stone-400 print:bg-white print:text-black">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 print:text-black" />
          <span>
            Los perros y gatos se sienten mucho más seguros y tranquilos cuando sus horarios de paseo y comida son estables.
          </span>
        </div>
      </div>
    </div>
  );
};

