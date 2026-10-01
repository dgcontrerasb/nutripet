import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  Stethoscope, 
  Scissors, 
  Pill, 
  Activity, 
  Eye, 
  Scale, 
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MedicalRecord, WeightLog } from '../types';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const MedicalHistory: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { activePet, medicalRecords, weightLogs, addMedicalRecord, deleteMedicalRecord, addWeightLog, deleteWeightLog, isProOrTrial } = usePets();

  // 🔒 Bloqueo si no tiene Pro o no ha iniciado sesión
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Expediente Clínico & Control de Peso"
          description="Lleva el historial veterinario completo de tu mascota: consultas médicas, cirugías, diagnósticos, fórmulas farmacológicas y monitoreo de peso corporal."
          benefits={[
            "Registro ordenado de consultas, cirugías, exámenes y tratamientos",
            "Monitoreo gráfico y registro histórico de peso corporal con variaciones",
            "Acceso inmediato a fórmulas médicas e indicaciones veterinarias"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  // Si es Pro pero aún no ha creado o seleccionado una mascota:
  if (!activePet) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center space-y-3 max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
          No hay ninguna mascota seleccionada
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Selecciona o registra una mascota en la barra superior para gestionar su expediente clínico.
        </p>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState<'records' | 'weights'>('records');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [confirmDeleteRecordId, setConfirmDeleteRecordId] = useState<string | null>(null);
  const [confirmDeleteWeightId, setConfirmDeleteWeightId] = useState<string | null>(null);

  // Form states
  const [recordForm, setRecordForm] = useState<{
    date: string;
    type: MedicalRecord['type'];
    title: string;
    veterinarian: string;
    diagnosis: string;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    type: 'consultation',
    title: '',
    veterinarian: activePet?.veterinarian || '',
    diagnosis: '',
    notes: ''
  });

  const [weightForm, setWeightForm] = useState<{
    date: string;
    weightKg: number;
    notes: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    weightKg: activePet?.weightKg || 0,
    notes: ''
  });

  if (!activePet) return null;

  const filteredRecords = medicalRecords.filter(r => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.title.trim()) return;

    await addMedicalRecord({
      date: recordForm.date,
      type: recordForm.type,
      title: recordForm.title.trim(),
      veterinarian: recordForm.veterinarian.trim() || undefined,
      diagnosis: recordForm.diagnosis.trim() || undefined,
      notes: recordForm.notes.trim() || undefined
    });

    setShowAddModal(false);
    setRecordForm({
      date: new Date().toISOString().split('T')[0],
      type: 'consultation',
      title: '',
      veterinarian: activePet?.veterinarian || '',
      diagnosis: '',
      notes: ''
    });
  };

  const handleCreateWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightForm.weightKg || weightForm.weightKg <= 0) return;

    await addWeightLog({
      date: weightForm.date,
      weightKg: weightForm.weightKg,
      notes: weightForm.notes.trim() || undefined
    });

    setShowWeightModal(false);
  };

  const getTypeBadge = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consultation':
        return { label: 'Consulta Médica', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'surgery':
        return { label: 'Cirugía / Procedimiento', icon: <Scissors className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'exam':
        return { label: 'Examen de Laboratorio', icon: <Activity className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'xray':
        return { label: 'Radiografía / Ecografía', icon: <Eye className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'prescription':
        return { label: 'Fórmula Médica', icon: <Pill className="w-3.5 h-3.5" />, color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'treatment':
        return { label: 'Tratamiento Continuo', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: 'Registro', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de subpestañas y Botones de Exportar/Imprimir */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('records')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'records'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>Consultas ({medicalRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('weights')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'weights'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Pesos ({weightLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeSubTab === 'records' ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Entrada
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowWeightModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Peso
            </button>
          )}
        </div>
      </div>

      <div id="medical-records-printable" className="space-y-6">

      {/* SUBPESTAÑA 1: CONSULTAS Y PROCEDIMIENTOS */}
      {activeSubTab === 'records' && (
        <div className="space-y-4">
          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'consultation', label: '🩺 Consultas' },
              { id: 'surgery', label: '✂️ Cirugías' },
              { id: 'exam', label: '🧪 Exámenes' },
              { id: 'xray', label: '📷 Rayos X / Eco' },
              { id: 'prescription', label: '💊 Fórmulas' },
              { id: 'treatment', label: '🩹 Tratamientos' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filterType === f.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-stone-900 text-base">
                Sin registros médicos aún
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Lleva el historial de consultas, cirugías, diagnósticos y fórmulas médicas de {activePet.name} en un solo lugar.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar primer registro
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(record => {
                const badge = getTypeBadge(record.type);
                return (
                  <div
                    key={record.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${badge.color}`}>
                          {badge.icon} {badge.label}
                        </span>
                        <h4 className="font-heading font-extrabold text-stone-900 text-base">
                          {record.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" /> {record.date}
                        </span>
                        {confirmDeleteRecordId === record.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-xl border border-red-200">
                            <span className="text-[11px] font-bold text-red-700">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteMedicalRecord(record.id);
                                setConfirmDeleteRecordId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteRecordId(null)}
                              className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteRecordId(record.id)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Eliminar esta entrada"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {record.veterinarian && (
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                          <span className="text-[11px] font-bold text-stone-400 block uppercase">Veterinario / Clínica:</span>
                          <span className="font-bold text-stone-800">{record.veterinarian}</span>
                        </div>
                      )}

                      {record.diagnosis && (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                          <span className="text-[11px] font-bold text-amber-800 block uppercase">Diagnóstico / Hallazgos:</span>
                          <span className="font-medium text-stone-800">{record.diagnosis}</span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-100 text-xs text-stone-700">
                        <span className="text-[11px] font-bold text-stone-400 block uppercase mb-1">
                          Tratamiento / Indicaciones / Fórmula:
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">{record.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBPESTAÑA 2: HISTÓRICO DE PESO */}
      {activeSubTab === 'weights' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-extrabold text-stone-900 text-lg">
                  Evolución del Peso de {activePet.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Controla si se mantiene en su rango saludable o presenta fluctuaciones.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
                <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Peso Actual:</span>
                  <span className="text-base font-black text-stone-900 font-heading">{activePet.weightKg} kg</span>
                </div>
              </div>
            </div>

            {weightLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                No hay pesajes registrados. Agrega el primero para graficar la evolución.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Peso</th>
                      <th className="py-2.5 px-3">Variación</th>
                      <th className="py-2.5 px-3">Notas</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {weightLogs.map((log, index) => {
                      const prevLog = index > 0 ? weightLogs[index - 1] : null;
                      const diff = prevLog ? (log.weightKg - prevLog.weightKg) : 0;

                      return (
                        <tr key={log.id} className="hover:bg-stone-50/60">
                          <td className="py-3 px-3 font-medium text-stone-700 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" /> {log.date}
                          </td>
                          <td className="py-3 px-3 font-black text-stone-900 font-heading text-sm">
                            {log.weightKg} kg
                          </td>
                          <td className="py-3 px-3">
                            {prevLog ? (
                              diff === 0 ? (
                                <span className="text-stone-400 font-bold">= Estable</span>
                              ) : diff > 0 ? (
                                <span className="text-amber-700 font-bold flex items-center gap-1">
                                  <TrendingUp className="w-3.5 h-3.5" /> +{diff.toFixed(2)} kg
                                </span>
                              ) : (
                                <span className="text-blue-700 font-bold flex items-center gap-1">
                                  <TrendingDown className="w-3.5 h-3.5" /> -{Math.abs(diff).toFixed(2)} kg
                                </span>
                              )
                            ) : (
                              <span className="text-stone-400 italic">Punto inicial</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            {log.notes || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {confirmDeleteWeightId === log.id ? (
                              <div className="flex items-center justify-end gap-1.5 bg-red-50 px-2 py-1 rounded-xl border border-red-200 inline-flex">
                                <span className="text-[11px] font-bold text-red-700">¿Borrar?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteWeightLog(log.id);
                                    setConfirmDeleteWeightId(null);
                                  }}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteWeightId(null)}
                                  className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteWeightId(log.id)}
                                className="text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Eliminar este pesaje"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      </div> {/* Fin de #medical-records-printable */}

      {/* MODAL: AGREGAR REGISTRO MÉDICO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-stone-900">
                Nueva Entrada en Expediente
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={recordForm.date}
                    onChange={e => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Entrada *</label>
                  <select
                    value={recordForm.type}
                    onChange={e => setRecordForm({ ...recordForm, type: e.target.value as MedicalRecord['type'] })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="consultation">🩺 Consulta General</option>
                    <option value="surgery">✂️ Cirugía / Castración</option>
                    <option value="exam">🧪 Examen / Análisis</option>
                    <option value="xray">📷 Radiografía / Eco</option>
                    <option value="prescription">💊 Fórmula / Medicación</option>
                    <option value="treatment">🩹 Tratamiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Título o Motivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Describe brevemente el motivo de la consulta o procedimiento"
                  value={recordForm.title}
                  onChange={e => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Veterinario / Clínica</label>
                <input
                  type="text"
                  placeholder="Coloque aquí el nombre de su veterinario o clínica médica"
                  value={recordForm.veterinarian}
                  onChange={e => setRecordForm({ ...recordForm, veterinarian: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Diagnóstico o Hallazgos</label>
                <input
                  type="text"
                  placeholder="Resultados, observaciones médicas o diagnóstico emitido"
                  value={recordForm.diagnosis}
                  onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Fórmula Médica / Tratamiento / Notas</label>
                <textarea
                  rows={3}
                  placeholder="Detalla medicamentos recetados, posología, duración o cuidados especiales"
                  value={recordForm.notes}
                  onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Guardar en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PESAJE */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-stone-900">
                Registrar Pesaje de {activePet.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeight} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={weightForm.date}
                  onChange={e => setWeightForm({ ...weightForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Peso en Kilogramos (kg) *</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={weightForm.weightKg || ''}
                  onChange={e => setWeightForm({ ...weightForm, weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-base font-black font-heading focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nota o Condición (opcional)</label>
                <input
                  type="text"
                  placeholder="Detalles sobre el momento o condición del pesaje"
                  value={weightForm.notes}
                  onChange={e => setWeightForm({ ...weightForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Guardar Peso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
