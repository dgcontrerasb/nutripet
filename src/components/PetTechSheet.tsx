import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
  Plus,
  Trash2,
  Edit3,
  Camera,
  Heart,
  Activity,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  User,
  Phone,
  FileText,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  Download,
  Loader2,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCw,
  QrCode,
  Target,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Thermometer,
  Clock,
  Sparkle
} from 'lucide-react';
import { PetProfile, PetType, ActivityLevel, Gender } from '../types';
import { POPULAR_BREEDS, getSuggestedIdealWeight } from '../data';
import { ExportPetCardModal } from './ExportPetCardModal';
import { ProFeatureLock } from './ProFeatureLock';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const PetTechSheet: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, savePet, isSavingPet, weightLogs, addWeightLog, deleteWeightLog, isProOrTrial } = usePets();
  const handleOpenSub = onOpenSubscriptionModal || (() => {});

  const [isEditing, setIsEditing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState<PetProfile | null>(activePet);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [qrThumbUrl, setQrThumbUrl] = useState<string | null>(null);

  // Estados interactivos para checklist preventivo mensual
  const [preventiveChecks, setPreventiveChecks] = useState<Record<string, boolean>>({
    deworming: true,
    pipette: false,
    dental: true,
    grooming: true,
  });

  // Estados para Ritmo de Peso FEDIAF y Registro de Peso
  const [weeklyLossRate, setWeeklyLossRate] = useState<0.8 | 1.0 | 1.5>(1.0);
  const [showAddWeightForm, setShowAddWeightForm] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<number>(activePet?.weightKg || 10);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState<string>('');

  // Sincronizar estado cuando cambia la mascota activa
  useEffect(() => {
    setFormData(activePet);
    setIsEditing(false);
    setIsFlipped(false);
    if (activePet?.weightKg) {
      setNewWeight(activePet.weightKg);
    }
  }, [activePet?.id]);

  // Generar miniatura QR 100% en memoria local del cliente (Cero costo / Cero red)
  useEffect(() => {
    if (!activePet) return;
    let isMounted = true;
    const targetUrl = activePet.publicId
      ? `${window.location.origin}/?pet=${activePet.publicId}`
      : `${window.location.origin}/?sos=${encodeURIComponent(activePet.name)}`;

    QRCode.toDataURL(targetUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#143826',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) setQrThumbUrl(url);
      })
      .catch(() => {
        if (isMounted) setQrThumbUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, [activePet?.id, activePet?.publicId, activePet?.name]);

  if (!activePet || !formData) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
        <p className="text-stone-500 font-medium">No hay ninguna mascota seleccionada.</p>
      </div>
    );
  }

  // Cálculo automático de edad según fecha de nacimiento
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return null;

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years === 0 && months === 0) {
      const diffTime = Math.abs(now.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} días de nacido`;
    }

    if (years === 0) {
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    if (months === 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
  };

  const autoAge = calculateAge(formData.birthDate);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          setFormData(prev => prev ? { ...prev, photoUrl: compressedBase64 } : null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const cleanName = formData.name.trim() || activePet?.name || 'Mi Mascota';
    const finalFormData = { ...formData, name: cleanName };

    await savePet(finalFormData);
    setFormData(finalFormData);
    setIsEditing(false);
    setSaveFeedback(`¡Datos de ${cleanName} guardados exitosamente!`);
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || newWeight <= 0) return;

    await addWeightLog({
      date: newDate,
      weightKg: Number(newWeight),
      notes: newNotes.trim() || undefined
    });

    setShowAddWeightForm(false);
    setNewNotes('');
  };

  const togglePreventiveCheck = (key: string) => {
    setPreventiveChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentBreedInfo = POPULAR_BREEDS.find(b => b.id === formData.breedId);
  const fullBreedName = currentBreedInfo ? currentBreedInfo.name : (formData.breedCustom || 'Mestizo / Criollo');

  const suggestedIdealWeight = getSuggestedIdealWeight(formData);
  const effectiveIdealWeight = formData.idealWeightKg || suggestedIdealWeight || formData.weightKg;

  // Datos de curva de peso e historial
  const sortedWeightLogs = weightLogs.length > 0
    ? [...weightLogs].sort((a, b) => a.date.localeCompare(b.date))
    : [{
        id: 'init',
        petId: activePet.id,
        date: activePet.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        weightKg: activePet.weightKg
      }];

  const currentWeight = sortedWeightLogs[sortedWeightLogs.length - 1].weightKg;
  const initialWeight = sortedWeightLogs[0].weightKg;
  const diffKg = Number((currentWeight - initialWeight).toFixed(2));
  const diffFromIdeal = Number((currentWeight - effectiveIdealWeight).toFixed(1));
  const absDiffFromIdeal = Number(Math.abs(diffFromIdeal).toFixed(1));

  // Pauta hídrica calculada en cliente
  const dailyWaterMl = Math.round(formData.weightKg * 55);

  // Cálculo matemático 100% en cliente para Simulador FEDIAF
  const weeklyKgChange = Number((currentWeight * (weeklyLossRate / 100)).toFixed(2));
  const weeklyGramsChange = Math.round(weeklyKgChange * 1000);
  const estimatedWeeks = absDiffFromIdeal > 0 && weeklyKgChange > 0
    ? Math.max(1, Math.ceil(absDiffFromIdeal / weeklyKgChange))
    : 0;

  const getWeightStatus = () => {
    if (!effectiveIdealWeight || !currentWeight) return null;
    const diff = currentWeight - effectiveIdealWeight;
    const pct = (diff / effectiveIdealWeight) * 100;

    if (pct > 10) {
      return {
        label: `Sobrepeso (+${diff.toFixed(1)} kg)`,
        color: 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
      };
    }
    if (pct < -10) {
      return {
        label: `Bajo peso (-${Math.abs(diff).toFixed(1)} kg)`,
        color: 'text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
      };
    }
    return {
      label: 'Peso Óptimo ✨',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    };
  };

  const weightStatus = getWeightStatus();

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

  const logsWithTrend = sortedWeightLogs.map((log, index) => {
    if (index === 0) {
      return {
        ...log,
        diff: null
      };
    }
    const prevLog = sortedWeightLogs[index - 1];
    const diff = Number((log.weightKg - prevLog.weightKg).toFixed(1));
    return {
      ...log,
      diff
    };
  });

  const chartData = sortedWeightLogs.map(l => ({
    date: l.date,
    displayDate: new Date(l.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    peso: l.weightKg,
    ideal: effectiveIdealWeight,
    notes: l.notes
  }));

  const allWeights = sortedWeightLogs.map(l => l.weightKg);
  if (effectiveIdealWeight) allWeights.push(effectiveIdealWeight);
  const minWeight = Math.max(0, Math.floor(Math.min(...allWeights) - 1));
  const maxWeight = Math.ceil(Math.max(...allWeights) + 1.5);

  // Datos de contacto SOS con fallback seguro
  const vetName = formData.veterinarian?.trim() || 'Pepito Perez';
  const vetPhone = formData.veterinarianPhone?.trim() || '3213902708';
  const ownerName = formData.ownerName?.trim() || 'Tutor Responsable';
  const ownerPhone = formData.ownerPhone?.trim() || vetPhone || '3213902708';
  const allergyText = formData.allergies?.trim() || 'Al pollo';

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {saveFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          {/* ========================================================================= */}
          {/* ARQUITECTURA DE REJILLA ASIMÉTRICA: COCKPIT CLÍNICO (COLUMNA SUPERIOR)     */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* ----------------------------------------------------------------------- */}
            {/* SUB-COLUMNA 1: PASAPORTE VERTICAL DE OSLO (lg:col-span-5 xl:col-span-4) */}
            {/* ----------------------------------------------------------------------- */}
            <div className="lg:col-span-5 xl:col-span-4 w-full flex justify-center">
              <div className="relative [perspective:1000px] w-full max-w-[340px]">
                
                {/* Botón Flotante Lateral Izquierdo de Giro */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(prev => !prev)}
                  title="Girar carnet (Anverso / Reverso SOS)"
                  className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white dark:bg-stone-850 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Botón Flotante Lateral Derecho de Giro */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(prev => !prev)}
                  title="Girar carnet (Anverso / Reverso SOS)"
                  className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white dark:bg-stone-850 shadow-md border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Contenedor 3D con giro suave y fondo blanco 100% sólido */}
                <div
                  className={`grid w-full transition-transform duration-700 [transform-style:preserve-3d] will-change-transform antialiased ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* ANVERSO: CREDENCIAL MÉDICA VERTICAL (BLANCO SÓLIDO SIN BLUR) */}
                  <div
                    className={`col-start-1 row-start-1 [backface-visibility:hidden] will-change-transform antialiased bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4 ${
                      isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                    }`}
                  >
                    {/* Badge Centrado */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[9.5px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>🏅 Credencial Clínica Oficial</span>
                      </span>
                    </div>

                    {/* Foto y Datos Centrales */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div className="relative w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 border-2 border-emerald-600 dark:border-emerald-400 ring-4 ring-emerald-500/15 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} alt={formData.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{formData.type === 'dog' ? '🐶' : '🐱'}</span>
                        )}
                      </div>

                      <div className="pt-0.5">
                        <h2 className="font-editorial text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                          {formData.name}
                        </h2>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          {fullBreedName}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                          {formData.type === 'dog' ? '🐶 Canino' : '🐱 Felino'} • {formData.gender === 'female' ? 'Hembra ♀️' : 'Macho ♂️'}
                        </span>
                        {weightStatus && (
                          <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border ${weightStatus.color}`}>
                            {weightStatus.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4 Atributos Oficiales en Cuadrícula Compacta */}
                    <div className="grid grid-cols-2 gap-2 text-left pt-1">
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                          Edad
                        </span>
                        <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 block mt-0.5 truncate">
                          {autoAge || `${formData.ageMonths} meses`}
                        </span>
                        <span className="text-[9.5px] text-stone-400 block truncate">
                          Nac: {formData.birthDate || 'N/A'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                          Peso / Meta
                        </span>
                        <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 block mt-0.5 truncate">
                          {formData.weightKg} kg <span className="text-emerald-700 dark:text-emerald-400 font-bold">/ {effectiveIdealWeight} kg</span>
                        </span>
                        <span className="text-[9.5px] text-stone-400 block truncate">
                          {formData.neutered ? '✅ Esterilizado' : 'Entero'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                          Microchip ISO
                        </span>
                        <span className="text-xs font-mono font-extrabold text-stone-900 dark:text-stone-100 block mt-0.5 truncate">
                          {formData.microchip || 'Sin registro'}
                        </span>
                        <span className="text-[9.5px] text-stone-400 block truncate">
                          ID Oficial
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                          Veterinario
                        </span>
                        <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100 block mt-0.5 truncate">
                          {vetName}
                        </span>
                        <a
                          href={`tel:${vetPhone}`}
                          className="text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 truncate"
                        >
                          <Phone className="w-2.5 h-2.5 shrink-0" /> {vetPhone}
                        </a>
                      </div>
                    </div>

                    {/* Botón Píldora para Girar */}
                    <div className="flex justify-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => setIsFlipped(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                      >
                        <RotateCw className="w-3 h-3 text-amber-600" />
                        <span>🔄 Girar Ficha SOS</span>
                      </button>
                    </div>

                    {/* Base de la Credencial: Botones de Acción */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setShowExportModal(true)}
                        className="flex-1 bg-[#143826] hover:bg-[#1a4a32] text-white py-2 px-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>Exportar PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 py-2 px-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5 shrink-0" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>

                  {/* REVERSO: FICHA DE EMERGENCIA SOS (BLANCO SÓLIDO) */}
                  <div
                    className={`col-start-1 row-start-1 [backface-visibility:hidden] will-change-transform antialiased [transform:rotateY(180deg)] bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-3.5 min-h-[460px] ${
                      isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    {/* Título Superior */}
                    <div className="text-center pb-1 border-b border-stone-100 dark:border-stone-800">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-[9.5px] font-mono font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>MODO FICHA SOS • {formData.name}</span>
                      </span>
                    </div>

                    {/* Llamada Directa Veterinario */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5 text-left">
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                          🩺 Veterinario
                        </span>
                        <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                          {vetName}
                        </p>
                      </div>
                      <a
                        href={`tel:${vetPhone}`}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar ({vetPhone})</span>
                      </a>
                    </div>

                    {/* Llamada Directa Tutor */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5 text-left">
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                          👤 Tutor Responsable
                        </span>
                        <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                          {ownerName}
                        </p>
                      </div>
                      <a
                        href={`tel:${ownerPhone}`}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar Tutor</span>
                      </a>
                    </div>

                    {/* Alerta Médica Alergia */}
                    <div className="p-2.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 text-left space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-600 text-white text-[8.5px] font-black uppercase">
                        Alerta Médica
                      </span>
                      <p className="text-xs font-black text-rose-950 dark:text-rose-200">
                        Alergia: {allergyText}
                      </p>
                      <p className="text-[10px] text-rose-800 dark:text-rose-300 leading-tight">
                        {formData.emergencyContact ? `Contacto respaldo: ${formData.emergencyContact}` : 'Evitar suministrar esta proteína'}
                      </p>
                    </div>

                    {/* Mini QR de Emergencia */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800">
                      <div className="text-left text-[10px] text-stone-500">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block">Pasaporte QR SOS</span>
                        <span>Escaneo rápido de auxilio</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExportModal(true)}
                        className="p-1 rounded-lg bg-white border border-stone-200 shadow-3xs cursor-pointer hover:scale-105 transition-transform"
                      >
                        {qrThumbUrl ? (
                          <img src={qrThumbUrl} alt="QR SOS" className="w-10 h-10 object-contain rounded" />
                        ) : (
                          <QrCode className="w-10 h-10 text-[#143826]" />
                        )}
                      </button>
                    </div>

                    {/* Volver a la Credencial */}
                    <div className="pt-1 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => setIsFlipped(false)}
                        className="w-full py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3 text-emerald-600" />
                        <span>Volver a Credencial</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* SUB-COLUMNA 2: TABLERO DE SALUD & CUIDADOS PREVENTIVOS (7/8 COLS)       */}
            {/* ----------------------------------------------------------------------- */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
              
              {/* Módulo 1: Alergia & Alerta Médica Destacada */}
              <div className="bg-white dark:bg-[#1a231d] rounded-2xl border border-rose-200/80 dark:border-rose-900/60 p-4 shadow-2xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 border border-rose-100 dark:border-rose-900/40">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                      Alergia & Restricción Alimentaria Activa
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">
                      {allergyText}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                    <strong>Alerta para guarderías, veterinarios y cuidadores:</strong> {formData.name} no debe consumir premios, snacks ni piensos formulados con esta proteína o subproductos derivados para prevenir cuadros dérmicos o digestivos agudos.
                  </p>
                </div>
              </div>

              {/* Módulo 2: Plan de Cuidado Preventivo Mensual (Micro-checklist interactivo) */}
              <div className="bg-white dark:bg-[#1a231d] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Plan de Cuidado Preventivo Mensual</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Toca para actualizar estado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Desparasitación Interna */}
                  <button
                    type="button"
                    onClick={() => togglePreventiveCheck('deworming')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      preventiveChecks.deworming
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">💊</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">Desparasitación Interna</span>
                    </div>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                      preventiveChecks.deworming
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {preventiveChecks.deworming ? 'Al día ✓' : 'Pendiente'}
                    </span>
                  </button>

                  {/* Pipeta / Antipulgas */}
                  <button
                    type="button"
                    onClick={() => togglePreventiveCheck('pipette')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      preventiveChecks.pipette
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛡️</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">Pipeta / Antipulgas</span>
                    </div>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                      preventiveChecks.pipette
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {preventiveChecks.pipette ? 'Al día ✓' : 'Próxima dosis'}
                    </span>
                  </button>

                  {/* Higiene Dental & Sarro */}
                  <button
                    type="button"
                    onClick={() => togglePreventiveCheck('dental')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      preventiveChecks.dental
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🦷</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">Higiene Dental & Sarro</span>
                    </div>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                      preventiveChecks.dental
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {preventiveChecks.dental ? 'Al día ✓' : 'Pendiente'}
                    </span>
                  </button>

                  {/* Cepillado de Manto */}
                  <button
                    type="button"
                    onClick={() => togglePreventiveCheck('grooming')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      preventiveChecks.grooming
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">✨</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">Cepillado de Manto</span>
                    </div>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                      preventiveChecks.grooming
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {preventiveChecks.grooming ? 'Al día ✓' : 'Pendiente'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Módulo 3: Pauta Hídrica Diaria & Signos de Referencia */}
              <div className="bg-white dark:bg-[#1a231d] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>Pauta Hídrica & Signos Fisiológicos de Referencia</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-800/60">
                    ~{dailyWaterMl} ml / día
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 leading-snug">
                    <span className="font-bold text-blue-950 dark:text-blue-200 block text-[11px]">
                      💧 Hidratación sugerida:
                    </span>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                      ~<strong>{dailyWaterMl} ml diarios</strong> (~3 a 4 tazones de agua limpia y fresca al día para sus {formData.weightKg} kg).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 leading-snug">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block text-[11px]">
                      🌡️ Signos Vitales Típicos:
                    </span>
                    <p className="text-[10.5px] text-stone-600 dark:text-stone-400 mt-0.5 font-mono">
                      Temp: 38.0 - 39.0 °C • Resp: 15-30 rpm (reposo)
                    </p>
                  </div>
                </div>
              </div>

              {/* Módulo 4: Notas y Observaciones Clínicas */}
              <div className="bg-white dark:bg-[#1a231d] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs p-4 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0 mt-0.5 border border-stone-200 dark:border-stone-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-stone-400 block">
                    Notas del Tutor & Observaciones de Comportamiento
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mt-1 leading-relaxed">
                    {formData.notes || 'Paciente sociable y de buen temperamento. Sin conductas reactivas registradas.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* BASE INFERIOR: CONTROL DE PESO SALUDABLE (ANCHO COMPLETO - COL-SPAN-12)   */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#1a231d] border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Cabecera Estilizada */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#143826]/10 dark:bg-[#143826]/30 text-[#143826] dark:text-emerald-400 shrink-0">
                  <Scale className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-editorial text-base sm:text-lg font-medium text-stone-900 dark:text-stone-100 leading-tight">
                    Control de Peso & Meta Saludable
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Evolución biométrica y acompañamiento para {formData.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddWeightForm(!showAddWeightForm)}
                className="bg-[#143826] hover:bg-[#1a4a32] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Peso</span>
              </button>
            </div>

            {/* Formulario Desplegable para Nuevo Pesaje */}
            {showAddWeightForm && (
              <form onSubmit={handleAddWeight} className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-extrabold text-xs text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    Nuevo Registro de Peso para {formData.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddWeightForm(false)}
                    className="text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Peso en kg *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newWeight}
                      onChange={e => setNewWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fecha de pesaje *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Observación</label>
                    <input
                      type="text"
                      placeholder="Ej. Control mensual..."
                      value={newNotes}
                      onChange={e => setNewNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
                  >
                    Guardar Peso
                  </button>
                </div>
              </form>
            )}

            {/* Barra de Progreso Amigable y Visual: [Peso Actual] -> [Falta] -> [Meta Ideal] */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-stone-50/40 to-amber-50/20 dark:from-emerald-950/25 dark:via-stone-900/40 dark:to-amber-950/15 border border-emerald-500/20 dark:border-emerald-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                    Camino al Peso Ideal:
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                      Actual: <strong>{currentWeight} kg</strong>
                    </span>
                    <span className="text-stone-400">➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800">
                      {diffFromIdeal === 0 ? 'Meta alcanzada' : diffFromIdeal > 0 ? `Faltan -${absDiffFromIdeal} kg` : `Faltan +${absDiffFromIdeal} kg`}
                    </span>
                    <span className="text-stone-400">➔</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800">
                      Meta: <strong>{effectiveIdealWeight} kg</strong>
                    </span>
                  </div>
                </div>

                {/* Selector de Ritmo Simple: Gradual | Recomendado | Activo */}
                <div className="inline-flex items-center gap-1 bg-white dark:bg-stone-850 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-3xs self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setWeeklyLossRate(0.8)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      weeklyLossRate === 0.8
                        ? 'bg-[#143826] text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Gradual
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeklyLossRate(1.0)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      weeklyLossRate === 1.0
                        ? 'bg-[#143826] text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Recomendado
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeklyLossRate(1.5)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      weeklyLossRate === 1.5
                        ? 'bg-[#143826] text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    Activo
                  </button>
                </div>
              </div>

              {/* Mensaje de Proyección Guiada */}
              <div className="pt-2 border-t border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-200 leading-snug">
                  {estimatedWeeks > 0 ? (
                    <>
                      ⏱️ A este ritmo ({weeklyLossRate}%), alcanzará su condición óptima en aproximadamente{' '}
                      <span className="text-emerald-700 dark:text-emerald-300 font-black underline decoration-emerald-500/40">
                        {estimatedWeeks} semanas
                      </span>{' '}
                      (~{weeklyGramsChange} g por semana).
                    </>
                  ) : (
                    <span>✨ {formData.name} se encuentra en su rango de peso óptimo y saludable ({effectiveIdealWeight} kg).</span>
                  )}
                </p>

                <p className="text-[10px] text-stone-500 dark:text-stone-400 italic">
                  ⚖️ Estimación orientativa FEDIAF.
                </p>
              </div>
            </div>

            {/* Gráfica Sparkline Esbelta y Compacta (~140px) */}
            {!isProOrTrial ? (
              <ProFeatureLock
                compact
                featureName="Evolución y Curva de Peso Avanzada"
                description={`Monitorea el progreso de ${formData.name} con gráficas interactivas y tendencias de peso vs. meta ideal.`}
                benefits={[
                  'Gráfica interactiva de peso vs. meta ideal',
                  'Simulador metabólico semanal FEDIAF',
                  'Historial clínico compacto por fecha'
                ]}
                onOpenSubscriptionModal={handleOpenSub}
              />
            ) : (
              <div className="h-36 sm:h-38 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightColorTechSparkline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 9.5, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[minWeight, maxWeight]}
                      tick={{ fontSize: 9.5, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                      unit="kg"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-stone-900 text-white p-2 rounded-xl shadow-lg border border-stone-700 text-xs space-y-0.5">
                              <span className="font-extrabold text-stone-200 block border-b border-stone-700 pb-0.5 text-[11px]">
                                📅 {data.date}
                              </span>
                              <div className="flex justify-between gap-3 pt-0.5">
                                <span className="text-stone-400">Peso:</span>
                                <span className="font-bold text-emerald-400">{data.peso} kg</span>
                              </div>
                              <div className="flex justify-between gap-3">
                                <span className="text-stone-400">Meta:</span>
                                <span className="font-medium text-amber-300">{data.ideal} kg</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      y={effectiveIdealWeight}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Meta: ${effectiveIdealWeight}kg`,
                        position: 'insideTopRight',
                        fill: '#d97706',
                        fontSize: 9.5,
                        fontWeight: 700
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="peso"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#weightColorTechSparkline)"
                      activeDot={{ r: 4, fill: '#047857', stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Historial de Pesajes en Micro-Tarjetas Evolutivas */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Historial de Pesajes ({sortedWeightLogs.length})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mt-2">
                {logsWithTrend
                  .slice()
                  .reverse()
                  .map((log, idx) => (
                    <div
                      key={log.id || idx}
                      title={log.notes ? `Nota: ${log.notes}` : undefined}
                      className="bg-white dark:bg-[#1a231d] rounded-xl border border-stone-200/90 dark:border-stone-800 p-2.5 shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all relative flex flex-col justify-between gap-2"
                    >
                      {/* Fila superior: Fecha y acción de eliminar */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-stone-500 font-medium truncate">
                          {formatDisplayDate(log.date)}
                        </span>
                        {log.id && log.id !== 'init' ? (
                          <button
                            type="button"
                            onClick={() => deleteWeightLog(log.id)}
                            title="Eliminar pesaje"
                            className="p-1 rounded-md text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="w-3 h-3" />
                        )}
                      </div>

                      {/* Fila media: Gramaje */}
                      <div>
                        <span className="text-base font-black text-stone-900 dark:text-stone-100 font-tabular">
                          {log.weightKg} <span className="text-xs font-bold text-stone-400">kg</span>
                        </span>
                        {log.notes && (
                          <p className="text-[9.5px] text-stone-500 dark:text-stone-400 truncate italic mt-0.5">
                            {log.notes}
                          </p>
                        )}
                      </div>

                      {/* Fila inferior: Micro-badge de tendencia */}
                      <div className="pt-0.5">
                        {log.diff === null ? (
                          <span className="text-[9.5px] font-medium text-stone-400 bg-stone-50 dark:bg-stone-800/60 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            Inicial
                          </span>
                        ) : log.diff < 0 ? (
                          <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            ↓ {Math.abs(log.diff)} kg
                          </span>
                        ) : log.diff > 0 ? (
                          <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            ↑ +{log.diff} kg
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                            = Estable
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* FORMULARIO DE EDICIÓN COMPLETO */
        <div className="bg-white dark:bg-[#1a231d] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-editorial text-xl font-medium text-stone-900 dark:text-stone-100">
              Editar Ficha Clínica de {formData.name}
            </h3>
            <button
              type="button"
              onClick={() => {
                setFormData(activePet);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 pt-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Foto y Nombre */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Foto y Nombre
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formData.type === 'dog' ? '🐶' : '🐱'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 text-xs font-bold text-stone-700 dark:text-stone-200 cursor-pointer shadow-2xs">
                      <Camera className="w-3.5 h-3.5" /> Subir Foto
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => prev ? { ...prev, photoUrl: undefined } : null)}
                        className="block text-[10px] text-red-600 dark:text-red-400 hover:underline mt-1"
                      >
                        Eliminar foto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre de la Mascota *</label>
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre de tu mascota"
                    value={formData.name ?? ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    onBlur={e => {
                      if (!e.target.value.trim()) {
                        setFormData(prev => prev ? { ...prev, name: activePet?.name || 'Mi Mascota' } : null);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Especie</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as PetType })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="dog">Perro 🐶</option>
                      <option value="cat">Gato 🐱</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Sexo</label>
                    <select
                      value={formData.gender || 'male'}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="male">Macho ♂️</option>
                      <option value="female">Hembra ♀️</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Raza, Fecha y Microchip */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Raza, Nacimiento y Microchip
                </span>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Raza</label>
                  <select
                    value={formData.breedId}
                    onChange={e => setFormData({ ...formData, breedId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="">-- Otra / Mestizo Criollo --</option>
                    {POPULAR_BREEDS.filter(b => b.type === formData.type).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                    <span>Fecha de Nacimiento</span>
                    {autoAge && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold">{autoAge}</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Número de Microchip (opcional)</label>
                  <input
                    type="text"
                    placeholder="Coloque aquí el número de microchip"
                    value={formData.microchip || ''}
                    onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Peso, Esterilización y Actividad */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Peso y Condición
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Peso Actual (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Peso en kg"
                      value={formData.weightKg || ''}
                      onChange={e => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Peso Ideal (kg)</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, idealWeightKg: suggestedIdealWeight })}
                        className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        title="Sugerir por estándar de raza"
                      >
                        Sugerir ({suggestedIdealWeight} kg)
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={`Sugerido: ${suggestedIdealWeight} kg`}
                      value={formData.idealWeightKg || ''}
                      onChange={e => setFormData({ ...formData, idealWeightKg: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Nivel de Actividad</label>
                  <select
                    value={formData.activity}
                    onChange={e => setFormData({ ...formData, activity: e.target.value as ActivityLevel })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="low">Baja (Paseos cortos / Interior)</option>
                    <option value="moderate">Moderada (1 hora diaria)</option>
                    <option value="high">Alta (Muy activo / Deporte)</option>
                    <option value="working">Trabajo / Agility</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-neutered"
                    checked={formData.neutered}
                    onChange={e => setFormData({ ...formData, neutered: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="edit-neutered" className="text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                    Mascota Esterilizada / Castrada
                  </label>
                </div>
              </div>

              {/* Veterinario y Contacto */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Veterinario de Confianza
                </span>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre del Médico / Clínica</label>
                  <input
                    type="text"
                    placeholder="Nombre del veterinario o clínica"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Teléfono de Contacto / Urgencias</label>
                  <input
                    type="text"
                    placeholder="Teléfono de emergencias"
                    value={formData.veterinarianPhone || ''}
                    onChange={e => setFormData({ ...formData, veterinarianPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Datos del Propietario / Tutor y Contacto de Emergencia */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 md:col-span-2 lg:col-span-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Datos del Dueño / Tutor y Emergencias
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Nombre del Dueño / Tutor *</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={formData.ownerName || ''}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Teléfono del Dueño</label>
                    <input
                      type="text"
                      placeholder="Ej: +57 300 123 4567"
                      value={formData.ownerPhone || ''}
                      onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Contacto de Emergencia / Respaldo</label>
                    <input
                      type="text"
                      placeholder="Ej: Familiar / Vecino"
                      value={formData.emergencyContact || ''}
                      onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Alergias y Enfermedades */}
              <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 md:col-span-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Historial de Alergias, Diagnósticos y Notas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Alergias Conocidas</label>
                    <input
                      type="text"
                      placeholder="Alimentos o elementos alérgenos"
                      value={formData.allergies || ''}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Enfermedades Conocidas</label>
                    <input
                      type="text"
                      placeholder="Condiciones médicas previas"
                      value={formData.knownDiseases || ''}
                      onChange={e => setFormData({ ...formData, knownDiseases: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Notas y Comportamiento Especial</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre hábitos o cuidados especiales"
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setFormData(activePet);
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingPet}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
              >
                {isSavingPet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Guardar Ficha Técnica
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PARA EXPORTAR E IMPRIMIR EL CARNET DE SALUD PDF */}
      <ExportPetCardModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onOpenSubscriptionModal={onOpenSubscriptionModal}
      />
    </div>
  );
};
