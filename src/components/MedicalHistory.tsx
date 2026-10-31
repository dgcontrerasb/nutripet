import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePets } from '../context/PetContext';
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
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MedicalRecord, WeightLog } from '../types';

export const MedicalHistory: React.FC = () => {
  const { activePet, medicalRecords, weightLogs, addMedicalRecord, deleteMedicalRecord, addWeightLog, deleteWeightLog } = usePets();

  const [activeSubTab, setActiveSubTab] = useState<'records' | 'weights'>('records');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [confirmDeleteRecordId, setConfirmDeleteRecordId] = useState<string | null>(null);
  const [confirmDeleteWeightId, setConfirmDeleteWeightId] = useState<string | null>(null);

  // Estados para scroll y flechas de navegación del carrusel de filtros
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkFilterScroll = useCallback(() => {
    const el = filterScrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth + 4;
      setHasOverflow(overflow);
      setCanScrollLeft(overflow && el.scrollLeft > 4);
      setCanScrollRight(overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkFilterScroll, 60);
    window.addEventListener('resize', checkFilterScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkFilterScroll);
    };
  }, [checkFilterScroll, medicalRecords.length]);

  const scrollFilters = (direction: 'left' | 'right') => {
    const el = filterScrollRef.current;
    if (el) {
      const scrollAmount = 240;
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkFilterScroll, 320);
    }
  };

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

  // Sincronización inteligente al abrir el modal con el tipo activo
  const handleOpenAddModal = (customType?: MedicalRecord['type']) => {
    const targetType: MedicalRecord['type'] = customType || (filterType !== 'all' ? (filterType as MedicalRecord['type']) : 'consultation');
    setRecordForm({
      date: new Date().toISOString().split('T')[0],
      type: targetType,
      title: '',
      veterinarian: activePet?.veterinarian || '',
      diagnosis: '',
      notes: ''
    });
    setShowAddModal(true);
  };

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

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.toLocaleDateString('es-ES', { month: 'short' });
      const year = d.getFullYear();
      const cleanMonth = month.replace('.', '');
      const capitalizedMonth = cleanMonth.charAt(0).toUpperCase() + cleanMonth.slice(1);
      return `${day} ${capitalizedMonth} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const getTypeBadge = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consultation':
        return {
          label: 'Consulta Médica',
          icon: <Stethoscope className="w-3.5 h-3.5" />,
          color: 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
          nodeBorder: 'border-blue-500',
          nodeText: 'text-blue-600 dark:text-blue-400'
        };
      case 'surgery':
        return {
          label: 'Cirugía / Procedimiento',
          icon: <Scissors className="w-3.5 h-3.5" />,
          color: 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
          nodeBorder: 'border-purple-500',
          nodeText: 'text-purple-600 dark:text-purple-400'
        };
      case 'exam':
        return {
          label: 'Examen de Laboratorio',
          icon: <Activity className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          nodeBorder: 'border-emerald-500',
          nodeText: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'xray':
        return {
          label: 'Radiografía / Ecografía',
          icon: <Eye className="w-3.5 h-3.5" />,
          color: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          nodeBorder: 'border-amber-500',
          nodeText: 'text-amber-600 dark:text-amber-400'
        };
      case 'prescription':
        return {
          label: 'Fórmula Médica',
          icon: <Pill className="w-3.5 h-3.5" />,
          color: 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
          nodeBorder: 'border-teal-500',
          nodeText: 'text-teal-600 dark:text-teal-400'
        };
      case 'treatment':
        return {
          label: 'Tratamiento Continuo',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          nodeBorder: 'border-rose-500',
          nodeText: 'text-rose-600 dark:text-rose-400'
        };
      default:
        return {
          label: 'Registro',
          icon: <FileText className="w-3.5 h-3.5" />,
          color: 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
          nodeBorder: 'border-stone-400',
          nodeText: 'text-stone-600 dark:text-stone-400'
        };
    }
  };

  const getAddButtonContent = () => {
    switch (filterType) {
      case 'surgery':
        return { label: '+ Nueva Cirugía', icon: <Scissors className="w-3.5 h-3.5" /> };
      case 'exam':
        return { label: '+ Nuevo Examen', icon: <Activity className="w-3.5 h-3.5" /> };
      case 'xray':
        return { label: '+ Nueva Radiografía/Eco', icon: <Eye className="w-3.5 h-3.5" /> };
      case 'prescription':
        return { label: '+ Nueva Fórmula', icon: <Pill className="w-3.5 h-3.5" /> };
      case 'treatment':
        return { label: '+ Nuevo Tratamiento', icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 'consultation':
        return { label: '+ Nueva Consulta', icon: <Stethoscope className="w-3.5 h-3.5" /> };
      default:
        return { label: '+ Nueva Entrada', icon: <Plus className="w-3.5 h-3.5" /> };
    }
  };

  const addButtonContent = getAddButtonContent();

  const filterCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'consultation', label: '🩺 Consultas' },
    { id: 'surgery', label: '✂️ Cirugías' },
    { id: 'exam', label: '🧪 Exámenes' },
    { id: 'xray', label: '📷 Rayos X / Eco' },
    { id: 'prescription', label: '💊 Fórmulas' },
    { id: 'treatment', label: '🩹 Tratamientos' },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return medicalRecords.length;
    return medicalRecords.filter(r => r.type === catId).length;
  };

  return (
    <div className="space-y-6">
      {/* Selector de subpestañas y Botón de Acción */}
      <div className="bg-white dark:bg-[#1a231d] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 sm:p-4.5 shadow-bento flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-fade-in">
        <div className="grid grid-cols-2 gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('records')}
            className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'records'
                ? 'bg-white dark:bg-stone-900 text-[#143826] dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#143826] dark:text-emerald-400 shrink-0" />
            <span className="truncate">Consultas ({medicalRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('weights')}
            className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'weights'
                ? 'bg-white dark:bg-stone-900 text-[#143826] dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#143826] dark:text-emerald-400 shrink-0" />
            <span className="truncate">Pesos ({weightLogs.length})</span>
          </button>
        </div>

        <div className="w-full sm:w-auto flex items-center">
          {activeSubTab === 'records' ? (
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1b4d34] dark:bg-[#3f6e58] dark:hover:bg-[#4d856b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {addButtonContent.icon}
              <span>{addButtonContent.label}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowWeightModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1b4d34] dark:bg-[#3f6e58] dark:hover:bg-[#4d856b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
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
            {/* Filtros por categoría con carrusel deslizable y flechas laterales */}
            <div className="flex items-center gap-1.5 w-full">
              {hasOverflow && (
                <button
                  type="button"
                  onClick={() => scrollFilters('left')}
                  disabled={!canScrollLeft}
                  aria-label="Ver filtros anteriores"
                  className={`shrink-0 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center ${
                    canScrollLeft
                      ? 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-stone-200/90 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-[#143826] hover:text-[#143826] dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs cursor-pointer active:scale-90'
                      : 'bg-white/40 dark:bg-stone-900/40 border-stone-200/40 dark:border-stone-800/40 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-30'
                  }`}
                  title={canScrollLeft ? 'Ver filtros anteriores' : undefined}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div
                ref={filterScrollRef}
                onScroll={checkFilterScroll}
                className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-0.5 flex-nowrap scroll-smooth"
              >
                {filterCategories.map(f => {
                  const count = getCategoryCount(f.id);
                  const isSelected = filterType === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterType(f.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-xs'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold leading-none ${
                          isSelected
                            ? 'bg-white/20 dark:bg-stone-900/20 text-white dark:text-stone-900'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasOverflow && (
                <button
                  type="button"
                  onClick={() => scrollFilters('right')}
                  disabled={!canScrollRight}
                  aria-label="Ver más filtros"
                  className={`shrink-0 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center ${
                    canScrollRight
                      ? 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-emerald-500/60 dark:border-emerald-600/60 text-[#143826] dark:text-emerald-400 hover:bg-[#143826] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white shadow-2xs hover:shadow-xs cursor-pointer active:scale-90 group/btn ring-2 ring-emerald-500/15'
                      : 'bg-white/40 dark:bg-stone-900/40 border-stone-200/40 dark:border-stone-800/40 text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-30'
                  }`}
                  title={canScrollRight ? 'Ver más filtros' : undefined}
                >
                  <ChevronRight className={`w-4 h-4 ${canScrollRight ? 'group-hover/btn:translate-x-0.5 transition-transform' : ''}`} />
                </button>
              )}
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 sm:p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
                  {filterType === 'all'
                    ? 'Sin registros médicos aún'
                    : `Sin registros en ${filterCategories.find(c => c.id === filterType)?.label || 'esta categoría'}`}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Lleva el historial de consultas, cirugías, diagnósticos y fórmulas médicas de {activePet.name} en un solo lugar.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#143826] hover:bg-[#1b4d34] dark:bg-[#3f6e58] dark:hover:bg-[#4d856b] text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  {addButtonContent.icon}
                  <span>Agregar primer registro</span>
                </button>
              </div>
            ) : (
              /* Contenedor delimitado para erradicar el scroll infinito y dar holgura al dock móvil inferior */
              <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1 sm:pr-1.5 pb-28 sm:pb-8 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
                {/* Riel cronológico Clinical Timeline Bento */}
                <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-3.5 before:top-3.5 before:bottom-3.5 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                  {filteredRecords.map(record => {
                    const badge = getTypeBadge(record.type);
                    return (
                      <div key={record.id} className="relative group">
                        {/* Nodo en el riel cronológico (acoplado y contenido) */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-3.5 sm:top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-stone-900 border-2 shadow-xs flex items-center justify-center ${badge.nodeBorder} ${badge.nodeText} z-10`}
                          title={badge.label}
                        >
                          <span className="scale-75 sm:scale-90">
                            {badge.icon}
                          </span>
                        </div>

                        {/* Tarjeta Bento */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-3">
                          {/* Cabecera */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${badge.color}`}>
                                {badge.icon} {badge.label}
                              </span>
                              <h4 className="font-heading font-extrabold text-stone-900 dark:text-white text-base leading-tight">
                                {record.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-500 dark:text-stone-400">
                              <span className="flex items-center gap-1 font-mono font-medium">
                                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                {formatDisplayDate(record.date)}
                              </span>

                              {confirmDeleteRecordId === record.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">¿Eliminar?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteMedicalRecord(record.id);
                                      setConfirmDeleteRecordId(null);
                                    }}
                                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteRecordId(null)}
                                    className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRecordId(record.id)}
                                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Eliminar esta entrada"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Cuerpo en 2 Columnas Bento */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {record.veterinarian ? (
                              <div className="p-3 bg-stone-50 dark:bg-stone-850/60 rounded-xl border border-stone-200/70 dark:border-stone-800 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500">
                                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                    Veterinario / Clínica:
                                  </span>
                                </div>
                                <p className="font-bold text-stone-900 dark:text-stone-100 text-xs pl-5">
                                  {record.veterinarian}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-stone-50/50 dark:bg-stone-850/30 rounded-xl border border-dashed border-stone-200/60 dark:border-stone-800/60 space-y-0.5">
                                <span className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-wider">
                                  Veterinario / Clínica
                                </span>
                                <p className="text-xs text-stone-400 italic">No especificado</p>
                              </div>
                            )}

                            {record.diagnosis ? (
                              <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                                  <Stethoscope className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                    Diagnóstico / Hallazgos:
                                  </span>
                                </div>
                                <p className="font-semibold text-stone-900 dark:text-stone-100 text-xs pl-5">
                                  {record.diagnosis}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-stone-50/50 dark:bg-stone-850/30 rounded-xl border border-dashed border-stone-200/60 dark:border-stone-800/60 space-y-0.5">
                                <span className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-wider">
                                  Diagnóstico / Hallazgos
                                </span>
                                <p className="text-xs text-stone-400 italic">Sin diagnóstico registrado</p>
                              </div>
                            )}
                          </div>

                          {/* Acordeón / Caja de Tratamiento / Fórmula */}
                          {record.notes && (
                            <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                              <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                                <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                  Tratamiento / Indicaciones / Fórmula:
                                </span>
                              </div>
                              <p className="whitespace-pre-line leading-relaxed pl-5 font-medium">
                                {record.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBPESTAÑA 2: HISTÓRICO DE PESO (INTACTA) */}
        {activeSubTab === 'weights' && (
          <div className="space-y-4 pb-28 sm:pb-8">
            <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-lg">
                    Evolución del Peso de {activePet.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Controla si se mantiene en su rango saludable o presenta fluctuaciones.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Peso Actual:</span>
                    <span className="text-base font-black text-stone-900 dark:text-stone-100 font-heading">{activePet.weightKg} kg</span>
                  </div>
                </div>
              </div>

              {weightLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                  No hay pesajes registrados. Agrega el primero para graficar la evolución.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Peso</th>
                        <th className="py-2.5 px-3">Variación</th>
                        <th className="py-2.5 px-3">Notas</th>
                        <th className="py-2.5 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {weightLogs.map((log, index) => {
                        const prevLog = index > 0 ? weightLogs[index - 1] : null;
                        const diff = prevLog ? (log.weightKg - prevLog.weightKg) : 0;

                        return (
                          <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                            <td className="py-3 px-3 font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" /> {log.date}
                            </td>
                            <td className="py-3 px-3 font-black text-stone-900 dark:text-stone-100 font-heading text-sm">
                              {log.weightKg} kg
                            </td>
                            <td className="py-3 px-3">
                              {prevLog ? (
                                diff === 0 ? (
                                  <span className="text-stone-400 font-bold">= Estable</span>
                                ) : diff > 0 ? (
                                  <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5" /> +{diff.toFixed(2)} kg
                                  </span>
                                ) : (
                                  <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1">
                                    <TrendingDown className="w-3.5 h-3.5" /> -{Math.abs(diff).toFixed(2)} kg
                                  </span>
                                )
                              ) : (
                                <span className="text-stone-400 italic">Punto inicial</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                              {log.notes || '—'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {confirmDeleteWeightId === log.id ? (
                                <div className="flex items-center justify-end gap-1.5 bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-xl border border-rose-200 dark:border-rose-800 inline-flex">
                                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">¿Borrar?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteWeightLog(log.id);
                                      setConfirmDeleteWeightId(null);
                                    }}
                                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteWeightId(null)}
                                    className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteWeightId(log.id)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-stone-900 dark:text-stone-100">
                Nueva Entrada en Expediente
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={recordForm.date}
                    onChange={e => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Entrada *</label>
                  <select
                    value={recordForm.type}
                    onChange={e => setRecordForm({ ...recordForm, type: e.target.value as MedicalRecord['type'] })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Título o Motivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Describe brevemente el motivo de la consulta o procedimiento"
                  value={recordForm.title}
                  onChange={e => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Veterinario / Clínica</label>
                <input
                  type="text"
                  placeholder="Coloque aquí el nombre de su veterinario o clínica médica"
                  value={recordForm.veterinarian}
                  onChange={e => setRecordForm({ ...recordForm, veterinarian: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Diagnóstico o Hallazgos</label>
                <input
                  type="text"
                  placeholder="Resultados, observaciones médicas o diagnóstico emitido"
                  value={recordForm.diagnosis}
                  onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fórmula Médica / Tratamiento / Notas</label>
                <textarea
                  rows={3}
                  placeholder="Detalla medicamentos recetados, posología, duración o cuidados especiales"
                  value={recordForm.notes}
                  onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-2xs"
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
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Registrar Pesaje de {activePet.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeight} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={weightForm.date}
                  onChange={e => setWeightForm({ ...weightForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Peso en Kilogramos (kg) *</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={weightForm.weightKg || ''}
                  onChange={e => setWeightForm({ ...weightForm, weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-base font-black font-heading text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nota o Condición (opcional)</label>
                <input
                  type="text"
                  placeholder="Detalles sobre el momento o condición del pesaje"
                  value={weightForm.notes}
                  onChange={e => setWeightForm({ ...weightForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-2xs"
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
