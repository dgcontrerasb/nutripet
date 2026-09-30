import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Trash2, 
  Calendar, 
  Target, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ProFeatureLock } from './ProFeatureLock';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const WeightCurveChart: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, weightLogs, addWeightLog, deleteWeightLog, isProOrTrial } = usePets();
  const handleOpenSub = onOpenSubscriptionModal || (() => {});

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<number>(activePet?.weightKg || 10);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState<string>('');

  if (!activePet) return null;

  const logs = weightLogs.length > 0 
    ? [...weightLogs].sort((a, b) => a.date.localeCompare(b.date))
    : [{ id: 'init', petId: activePet.id, date: activePet.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0], weightKg: activePet.weightKg }];

  const currentWeight = logs[logs.length - 1].weightKg;
  const initialWeight = logs[0].weightKg;
  const diffKg = Number((currentWeight - initialWeight).toFixed(2));
  const diffPct = initialWeight > 0 ? Number(((diffKg / initialWeight) * 100).toFixed(1)) : 0;
  const idealWeight = activePet.idealWeightKg || currentWeight;
  const diffFromIdeal = Number((currentWeight - idealWeight).toFixed(2));

  // Determine health condition status
  const getWeightStatus = () => {
    if (!activePet.idealWeightKg) return { label: 'Sin meta definida', color: 'text-stone-600 bg-stone-100 border-stone-200' };
    const pct = ((currentWeight - activePet.idealWeightKg) / activePet.idealWeightKg) * 100;
    if (pct > 12) return { label: `Sobrepeso (+${diffFromIdeal} kg)`, color: 'text-amber-800 bg-amber-50 border-amber-300' };
    if (pct < -10) return { label: `Bajo peso (${diffFromIdeal} kg)`, color: 'text-blue-800 bg-blue-50 border-blue-300' };
    return { label: 'Peso Óptimo / Saludable ✨', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
  };

  const status = getWeightStatus();

  // Chart data format
  const chartData = logs.map(l => ({
    date: l.date,
    displayDate: new Date(l.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    peso: l.weightKg,
    ideal: idealWeight,
    notes: l.notes
  }));

  const allWeights = logs.map(l => l.weightKg);
  if (activePet.idealWeightKg) allWeights.push(activePet.idealWeightKg);
  const minWeight = Math.max(0, Math.floor(Math.min(...allWeights) - 1));
  const maxWeight = Math.ceil(Math.max(...allWeights) + 1.5);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || newWeight <= 0) return;

    await addWeightLog({
      date: newDate,
      weightKg: Number(newWeight),
      notes: newNotes.trim() || undefined
    });

    setShowAddForm(false);
    setNewNotes('');
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-7 shadow-xs space-y-6">
      
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-stone-900">
                Curva de Peso y Condición Corporal
              </h3>
              <p className="text-xs text-stone-500">
                Historial evolutivo y comparación contra el peso ideal objetivo de {activePet.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Peso</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Peso Actual
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-2xl text-stone-900">
              {currentWeight}
            </span>
            <span className="text-xs font-bold text-stone-500">kg</span>
          </div>
          <span className="text-[10px] text-stone-400 block truncate">
            Último: {logs[logs.length - 1].date}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Peso Ideal Objetivo
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-2xl text-emerald-700">
              {idealWeight}
            </span>
            <span className="text-xs font-bold text-emerald-600">kg</span>
          </div>
          <span className="text-[10px] text-stone-400 block truncate">
            {diffFromIdeal === 0 ? '¡Alcanzado!' : diffFromIdeal > 0 ? `${diffFromIdeal} kg sobre la meta` : `${Math.abs(diffFromIdeal)} kg para la meta`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Variación Acumulada
          </span>
          <div className="flex items-center gap-1.5">
            {diffKg > 0 ? (
              <TrendingUp className="w-4 h-4 text-amber-600" />
            ) : diffKg < 0 ? (
              <TrendingDown className="w-4 h-4 text-blue-600" />
            ) : (
              <Minus className="w-4 h-4 text-emerald-600" />
            )}
            <span className={`font-heading font-black text-xl ${diffKg > 0 ? 'text-amber-700' : diffKg < 0 ? 'text-blue-700' : 'text-emerald-700'}`}>
              {diffKg > 0 ? `+${diffKg}` : diffKg} kg
            </span>
          </div>
          <span className="text-[10px] text-stone-500 block">
            ({diffPct > 0 ? `+${diffPct}` : diffPct}% desde inicio)
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Diagnóstico Corporal
          </span>
          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${status.color}`}>
            {status.label}
          </span>
          <span className="text-[10px] text-stone-400 block truncate">
            {logs.length} controles registrados
          </span>
        </div>
      </div>

      {/* Formulario desplegable para registrar nuevo peso */}
      {showAddForm && (
        <form onSubmit={handleAddLog} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
              Nuevo Registro de Peso para {activePet.name}
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Peso en kg *</label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onChange={e => setNewWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Fecha de pesaje *</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Notas u observaciones</label>
              <input
                type="text"
                placeholder="Ej. Cambio de concentrado, post-vacuna..."
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
            >
              Guardar Peso
            </button>
          </div>
        </form>
      )}

      {/* Gráfica Recharts / Bloqueo Pro */}
      {!isProOrTrial ? (
        <ProFeatureLock
          compact
          featureName="Evolución y Curva de Peso Avanzada"
          description={`Monitorea el progreso de ${activePet.name} con gráficas interactivas, cálculo de IMC veterinario y tendencias de peso vs. meta ideal.`}
          benefits={[
            "Gráfica interactiva de peso vs. meta ideal",
            "Análisis histórico de condición corporal",
            "Alertas de variaciones repentinas de peso"
          ]}
          onOpenSubscriptionModal={handleOpenSub || (() => {})}
        />
      ) : (
        <div className="space-y-2">
          <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis 
                domain={[minWeight, maxWeight]} 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                unit="kg"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white p-3 rounded-2xl shadow-xl border border-stone-700 text-xs space-y-1">
                        <span className="font-extrabold text-stone-200 block border-b border-stone-700 pb-1">
                          📅 {data.date}
                        </span>
                        <div className="flex justify-between gap-4 pt-1">
                          <span className="text-stone-400">Peso registrado:</span>
                          <span className="font-bold text-emerald-400">{data.peso} kg</span>
                        </div>
                        {activePet.idealWeightKg && (
                          <div className="flex justify-between gap-4">
                            <span className="text-stone-400">Meta ideal:</span>
                            <span className="font-medium text-stone-300">{data.ideal} kg</span>
                          </div>
                        )}
                        {data.notes && (
                          <div className="pt-1 text-[11px] text-stone-300 italic border-t border-stone-800 mt-1">
                            "{data.notes}"
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {activePet.idealWeightKg && (
                <ReferenceLine 
                  y={idealWeight} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ 
                    value: `Meta: ${idealWeight} kg`, 
                    position: 'insideTopRight', 
                    fill: '#d97706', 
                    fontSize: 11,
                    fontWeight: 700 
                  }} 
                />
              )}
              <Area 
                type="monotone" 
                dataKey="peso" 
                stroke="#059669" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#weightColor)" 
                activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-600 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>Evolución de Peso Real</span>
          </div>
          {activePet.idealWeightKg && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-amber-500 border-b border-dashed border-amber-600"></span>
              <span>Línea de Peso Ideal ({idealWeight} kg)</span>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Historial Desplegable de Puntos */}
      {logs.length > 1 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Historial de Pesajes ({logs.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {logs.slice().reverse().map((log, idx) => (
              <div 
                key={log.id || idx} 
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-stone-900">{log.weightKg} kg</span>
                    <span className="text-[10px] text-stone-400">({log.date})</span>
                  </div>
                  {log.notes && (
                    <p className="text-[10px] text-stone-500 truncate max-w-[150px]">
                      {log.notes}
                    </p>
                  )}
                </div>

                {log.id && log.id !== 'init' && (
                  <button
                    type="button"
                    onClick={() => deleteWeightLog(log.id)}
                    title="Eliminar pesaje"
                    className="text-stone-300 hover:text-red-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
