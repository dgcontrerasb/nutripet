import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Camera, 
  Calendar, 
  Heart, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  Phone, 
  FileText,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  Printer,
  Download,
  Loader2
} from 'lucide-react';
import { PetProfile, PetType, LifeStage, ActivityLevel, Gender, BodyCondition } from '../types';
import { POPULAR_BREEDS, getSuggestedIdealWeight, parseBreedWeightRange } from '../data';
import { WeightCurveChart } from './WeightCurveChart';
import { ExportPetCardModal } from './ExportPetCardModal';

interface Props {
  onOpenSubscriptionModal?: () => void;
}

export const PetTechSheet: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, savePet, deletePet, pets, isSavingPet } = usePets();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PetProfile | null>(activePet);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sincronizar form cuando cambia la mascota activa
  React.useEffect(() => {
    setFormData(activePet);
    setIsEditing(false);
  }, [activePet?.id]);

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
        const MAX_WIDTH = 256;  // 🔽 Reducido de 400
        const MAX_HEIGHT = 256;  // 🔽 Reducido de 400
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
          // 🔽 Calidad reducida de 0.7 a 0.5
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          // 🔍 Logging para verificar tamaño
          const sizeInBytes = new Blob([compressedBase64]).size;
          console.log('📸 Foto comprimida:', (sizeInBytes / 1024).toFixed(2), 'KB');
          
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
    setSaveFeedback("¡Datos de " + cleanName + " guardados exitosamente!");
    setTimeout(() => setSaveFeedback(null), 4000);
  };

  const currentBreedInfo = POPULAR_BREEDS.find(b => b.id === formData.breedId);

  const suggestedIdealWeight = getSuggestedIdealWeight(formData);
  const effectiveIdealWeight = formData.idealWeightKg || suggestedIdealWeight;

  // Estado del peso ideal comparado
  const getWeightStatus = () => {
    if (!effectiveIdealWeight || !formData.weightKg) return null;
    const diff = formData.weightKg - effectiveIdealWeight;
    const pct = (diff / effectiveIdealWeight) * 100;

    if (pct > 10) return { label: 'Sobrepeso leve (+ ' + diff.toFixed(1) + ' kg)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (pct < -10) return { label: 'Bajo peso (- ' + Math.abs(diff).toFixed(1) + ' kg)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Peso Ideal Óptimo', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const weightStatus = getWeightStatus();

  return (
    <div className="space-y-6">
      {/* Encabezado con estado y acción */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 pb-6 border-b border-stone-100">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{formData.type === 'dog' ? '🐶' : '🐱'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-heading font-extrabold text-2xl text-stone-900 leading-tight">
                  {formData.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  {formData.type === 'dog' ? 'Canino' : 'Felino'}
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-0.5">
                {currentBreedInfo ? currentBreedInfo.name : (formData.breedCustom || 'Mestizo / Criollo')} • {autoAge || `${formData.ageMonths} meses`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(activePet);
                    setIsEditing(false);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSavingPet}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-75"
                >
                  {isSavingPet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar Cambios
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Carnet PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar Ficha
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENIDO DE LA FICHA: MODO VISTA O MODO EDICIÓN */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
            
            {/* Tarjeta 1: Identidad & Edad */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Identidad y Registro
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Sexo:</span>
                  <span className="font-bold text-stone-800 capitalize">
                    {formData.gender === 'male' ? 'Macho ♂️' : formData.gender === 'female' ? 'Hembra ♀️' : 'No especificado'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Fecha de Nacimiento:</span>
                  <span className="font-bold text-stone-800">
                    {formData.birthDate || 'No registrada'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Edad Calculada:</span>
                  <span className="font-extrabold text-emerald-700 font-heading">
                    {autoAge || `${formData.ageMonths} meses`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Microchip:</span>
                  {formData.microchip ? (
                    <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {formData.microchip}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic text-[11px]">
                      Coloque aquí el número de microchip
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Físico y Peso */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Estado Físico y Peso
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Peso Actual:</span>
                  <span className="font-heading font-black text-stone-900 text-sm">
                    {formData.weightKg} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Peso Ideal Objetivo:</span>
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    {formData.idealWeightKg ? (
                      <>
                        <span>{formData.idealWeightKg} kg</span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          Indicación Médica
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{suggestedIdealWeight} kg</span>
                        <span className="text-[9px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200">
                          Estándar Raza
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {weightStatus && (
                  <div className={`p-2 rounded-xl border text-[11px] font-bold text-center ${weightStatus.color}`}>
                    {weightStatus.label}
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-stone-200/50">
                  <span className="text-stone-500">Esterilizado / Castrado:</span>
                  <span className="font-bold text-stone-800">
                    {formData.neutered ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Nivel de Actividad:</span>
                  <span className="font-bold text-stone-800 capitalize">
                    {formData.activity === 'low' ? 'Baja / Sedentario' : formData.activity === 'moderate' ? 'Moderada' : formData.activity === 'high' ? 'Alta / Muy Activo' : 'Trabajo o Deporte'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Veterinario y Contacto */}
            <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Veterinario de Cabecera
              </span>
              <div className="space-y-2 text-xs">
                <div className="py-1">
                  <span className="text-stone-500 block text-[11px]">Médico / Clínica:</span>
                  {formData.veterinarian ? (
                    <span className="font-bold text-stone-900 text-xs">
                      {formData.veterinarian}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic text-[11px] block">
                      Coloque aquí el nombre de su veterinario o clínica
                    </span>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-stone-500 block text-[11px]">Teléfono de Urgencias / Citas:</span>
                  {formData.veterinarianPhone ? (
                    <a 
                      href={`tel:${formData.veterinarianPhone}`} 
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> {formData.veterinarianPhone}
                    </a>
                  ) : (
                    <span className="text-stone-400 italic text-[11px] block">
                      Coloque aquí el número de teléfono o emergencias
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Tutor Responsable & Contacto de Emergencia */}
            <div className="md:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Tutor Responsable & Contactos de Emergencia
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-3xs">
                  <span className="text-stone-400 block text-[10px] font-bold uppercase mb-0.5">👤 Nombre del Dueño / Tutor:</span>
                  <span className="font-extrabold text-stone-900 text-sm">
                    {formData.ownerName || 'No registrado aún'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-3xs">
                  <span className="text-stone-400 block text-[10px] font-bold uppercase mb-0.5">📱 Teléfono del Tutor:</span>
                  {formData.ownerPhone ? (
                    <a href={`tel:${formData.ownerPhone}`} className="font-extrabold text-emerald-700 hover:underline flex items-center gap-1 text-sm font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {formData.ownerPhone}
                    </a>
                  ) : (
                    <span className="text-stone-400 italic text-xs">Sin teléfono registrado</span>
                  )}
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-3xs">
                  <span className="text-rose-600 block text-[10px] font-bold uppercase mb-0.5">🚨 Contacto de Emergencia:</span>
                  <span className="font-bold text-stone-800 text-xs">
                    {formData.emergencyContact || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila inferior: Alergias, Enfermedades y Notas */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Alergias Conocidas
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {formData.allergies || 'Ninguna alergia registrada.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Enfermedades o Condiciones
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {formData.knownDiseases || 'Sin enfermedades crónicas reportadas.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-600" /> Notas y Comportamiento
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {formData.notes || 'Sin notas adicionales.'}
                </p>
              </div>
            </div>

            {/* CURVA Y CONTROL DE PESO INTERACTIVA */}
            <div className="md:col-span-2 lg:col-span-3 pt-3">
              <WeightCurveChart onOpenSubscriptionModal={onOpenSubscriptionModal} />
            </div>

          </div>
        ) : (
          /* FORMULARIO DE EDICIÓN COMPLETO */
          <form onSubmit={handleSave} className="space-y-6 pt-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Foto y Nombre */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Foto y Nombre
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white border border-stone-300 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formData.type === 'dog' ? '🐶' : '🐱'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700 cursor-pointer shadow-2xs">
                      <Camera className="w-3.5 h-3.5" /> Subir Foto
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {formData.photoUrl && (
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => prev ? { ...prev, photoUrl: undefined } : null)}
                        className="block text-[10px] text-red-600 hover:underline mt-1"
                      >
                        Eliminar foto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nombre de la Mascota *</label>
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
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-base sm:text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Especie</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as PetType })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="dog">Perro 🐶</option>
                      <option value="cat">Gato 🐱</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Sexo</label>
                    <select
                      value={formData.gender || 'male'}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="male">Macho ♂️</option>
                      <option value="female">Hembra ♀️</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Raza, Fecha y Microchip */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Raza, Nacimiento y Microchip
                </span>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Raza</label>
                  <select
                    value={formData.breedId}
                    onChange={e => setFormData({ ...formData, breedId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="">-- Otra / Mestizo Criollo --</option>
                    {POPULAR_BREEDS.filter(b => b.type === formData.type).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                    <span>Fecha de Nacimiento</span>
                    {autoAge && <span className="text-[10px] text-emerald-700 font-extrabold">{autoAge}</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate || ''}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Número de Microchip (opcional)</label>
                  <input
                    type="text"
                    placeholder="Coloque aquí el número de microchip de su mascota"
                    value={formData.microchip || ''}
                    onChange={e => setFormData({ ...formData, microchip: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Peso, Esterilización y Actividad */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Peso y Condición
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Peso Actual (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Peso actual en kilogramos"
                      value={formData.weightKg || ''}
                      onChange={e => setFormData({ ...formData, weightKg: e.target.value === '' ? ('' as any) : parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">Peso Ideal (kg)</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, idealWeightKg: suggestedIdealWeight })}
                        className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                        title="Sugerir por estándar de raza o condición corporal"
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
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-stone-500 block mt-1 leading-tight">
                      💡 Basado en estándares de la raza o indicación clínica de su veterinario.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nivel de Actividad</label>
                  <select
                    value={formData.activity}
                    onChange={e => setFormData({ ...formData, activity: e.target.value as ActivityLevel })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="low">Baja (Paseos cortos / Mascota de interior)</option>
                    <option value="moderate">Moderada (1 hora de juego o paseo diario)</option>
                    <option value="high">Alta (Perro muy activo / deporte)</option>
                    <option value="working">Trabajo / Canicross / Agility</option>
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
                  <label htmlFor="edit-neutered" className="text-xs font-bold text-stone-800 cursor-pointer">
                    Mascota Esterilizada / Castrada
                  </label>
                </div>
              </div>

              {/* Veterinario y Contacto */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Veterinario de Confianza
                </span>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Médico / Clínica</label>
                  <input
                    type="text"
                    placeholder="Coloque aquí el nombre de su veterinario o clínica"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono de Contacto / Urgencias</label>
                  <input
                    type="text"
                    placeholder="Coloque aquí el número de teléfono de su veterinario o clínica"
                    value={formData.veterinarianPhone || ''}
                    onChange={e => setFormData({ ...formData, veterinarianPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Datos del Propietario / Tutor y Contacto de Emergencia */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 md:col-span-2 lg:col-span-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Datos del Dueño / Tutor y Emergencias
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Dueño / Tutor *</label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez / Camila R."
                      value={formData.ownerName || ''}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono del Dueño</label>
                    <input
                      type="text"
                      placeholder="Ej: +57 300 123 4567"
                      value={formData.ownerPhone || ''}
                      onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Contacto de Emergencia / Respaldo</label>
                    <input
                      type="text"
                      placeholder="Ej: Mamá (315...) / Vecino"
                      value={formData.emergencyContact || ''}
                      onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Alergias y Enfermedades */}
              <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 md:col-span-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Historial de Alergias, Diagnósticos y Notas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Alergias Conocidas</label>
                    <input
                      type="text"
                      placeholder="Indica alimentos, picaduras o elementos alérgenos"
                      value={formData.allergies || ''}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Enfermedades Conocidas</label>
                    <input
                      type="text"
                      placeholder="Condiciones médicas o diagnósticos previos"
                      value={formData.knownDiseases || ''}
                      onChange={e => setFormData({ ...formData, knownDiseases: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Notas y Comportamiento Especial</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre hábitos, miedos, preferencias o cuidados especiales"
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setFormData(activePet);
                  setIsEditing(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs cursor-pointer"
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
                  'Guardar Ficha Técnica'
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* MODAL PARA EXPORTAR E IMPRIMIR EL CARNET DE SALUD PDF */}
      <ExportPetCardModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        onOpenSubscriptionModal={onOpenSubscriptionModal}
      />
    </div>
  );
};
