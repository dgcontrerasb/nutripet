import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';
import { WeightCurveChart } from './WeightCurveChart';
import { 
  FileText, 
  Calendar, 
  Plus, 
  Trash2, 
  Stethoscope, 
  Activity, 
  Pill, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface ConsultationEntry {
  id: string;
  date: string;
  reason: string;
  veterinarian: string;
  diagnosis: string;
  treatment: string;
  cost?: number;
}

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const MedicalHistory: React.FC<Props> = ({ onOpenSubscriptionModal = () => {} }) => {
  const { activePet, isProOrTrial } = usePets();

  // 🔒 1. Evaluar suscripción Pro PRIMERO para mostrar el bloqueo de inmediato
  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Expediente Clínico Digital & Control de Curva de Peso"
          description="Monitorea la evolución de peso, consultas veterinarias, tratamientos y diagnósticos con gráficas y registros médicos detallados."
          benefits={[
            "Historial clínico cronológico completo con diagnósticos y recetas",
            "Gráfica interactiva de curva de peso vs. peso ideal objetivo",
            "Exportación de reportes médicos para tus visitas al veterinario"
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
          Selecciona o registra una mascota para acceder a su expediente clínico y evolución de peso.
        </p>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState<'weight' | 'consultations'>('weight');
  const [consultations, setConsultations] = useState<ConsultationEntry[]>([
    {
      id: '1',
      date: '2026-08-10',
      reason: 'Chequeo general de rutina y control de peso',
      veterinarian: 'Dra. Valentina Morales (Clínica Veterinaria Central)',
      diagnosis: 'Paciente en excelente condición corporal, constantes fisiológicas normales.',
      treatment: 'Continuar con dieta actual BARF balanceada y desparasitación periódica.'
    }
  ]);

  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newVet, setNewVet] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim() || !newDate) return;

    const newEntry: ConsultationEntry = {
      id: Date.now().toString(),
      date: newDate,
      reason: newReason.trim(),
      veterinarian: newVet.trim() || 'Médico veterinario no especificado',
      diagnosis: newDiagnosis.trim() || 'Sin observaciones particulares',
      treatment: newTreatment.trim() || 'Sin medicación prescrita'
    };

    setConsultations([newEntry, ...consultations]);
    setNewDate('');
    setNewReason('');
    setNewVet('');
    setNewDiagnosis('');
    setNewTreatment('');
    setShowAddForm(false);
  };

  const handleDeleteConsultation = (id: string) => {
    setConsultations(consultations.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del componente */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900 dark:text-stone-100 leading-tight">
                Expediente Clínico & Peso
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Historial médico y evolución antropométrica de <strong className="text-stone-800 dark:text-stone-200">{activePet.name}</strong>
              </p>
            </div>
          </div>

          {/* Selector de subpestañas */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveSubTab('weight')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'weight'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Curva de Peso
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('consultations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'consultations'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Consultas & Diagnósticos
            </button>
          </div>
        </div>

        {/* Vista 1: Gráfica y registros de curva de peso */}
        {activeSubTab === 'weight' && (
          <div className="pt-6">
            <WeightCurveChart onOpenSubscriptionModal={onOpenSubscriptionModal} />
          </div>
        )}

        {/* Vista 2: Registro de consultas veterinarias */}
        {activeSubTab === 'consultations' && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100">
                  Historial de Consultas Médicas
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Anota diagnósticos, recetas y recomendaciones clínicas.
                </p>
              </div>

              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Agregar Consulta
                </button>
              )}
            </div>

            {/* Formulario para nueva consulta */}
            {showAddForm && (
              <form onSubmit={handleAddConsultation} className="p-5 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-4 animate-fade-in text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha de la Consulta *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Veterinario / Clínica</label>
                    <input
                      type="text"
                      placeholder="Ej: Dra. Valentina Morales / Vet Care"
                      value={newVet}
                      onChange={e => setNewVet(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Motivo de Consulta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Revisión dental, dolor en pata trasera, etc."
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Diagnóstico u Observación</label>
                    <textarea
                      rows={2}
                      placeholder="Conclusiones del examen médico..."
                      value={newDiagnosis}
                      onChange={e => setNewDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tratamiento o Medicamentos</label>
                    <textarea
                      rows={2}
                      placeholder="Dosis, medicamentos o cuidados indicados..."
                      value={newTreatment}
                      onChange={e => setNewTreatment(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            )}

            {/* Listado de consultas registradas */}
            <div className="space-y-3">
              {consultations.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No hay consultas veterinarias registradas aún.
                </div>
              ) : (
                consultations.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                          {c.reason}
                        </span>
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-full font-medium">
                          {c.date}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteConsultation(c.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Veterinario / Centro:</span>
                        <span className="text-stone-700 dark:text-stone-300">{c.veterinarian}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Diagnóstico:</span>
                        <span className="text-stone-700 dark:text-stone-300">{c.diagnosis}</span>
                      </div>
                    </div>

                    {c.treatment && (
                      <div className="pt-1 text-xs">
                        <span className="text-stone-400 block text-[10px] font-bold uppercase">Tratamiento prescrito:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">{c.treatment}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};