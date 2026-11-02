import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sparkles, Film, Heart } from 'lucide-react';
import { PetProfile } from '../types';
import {
  StoredReelPhoto,
  getLocalReelPhotos,
  saveLocalReelPhoto,
  deleteLocalReelPhoto
} from '../utils/photoStorage';

interface PetPhotoReelWidgetProps {
  profile: PetProfile;
}

// 6 Fotos de muestra temática para poblar ambas columnas (3 y 3)
const SAMPLE_PHOTOS_A: StoredReelPhoto[] = [
  {
    id: 'sample-1',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
    caption: 'Paseo al aire libre',
    tag: '🌲 Campo',
    date: 'Ayer',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'sample-2',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&auto=format&fit=crop&q=80',
    caption: 'Hora del almuerzo',
    tag: '🥩 BARF',
    date: '24 Oct',
    createdAt: Date.now() - 172800000
  },
  {
    id: 'sample-3',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
    caption: 'Cepillado y baño',
    tag: '✨ Spa',
    date: '18 Oct',
    createdAt: Date.now() - 259200000
  }
];

const SAMPLE_PHOTOS_B: StoredReelPhoto[] = [
  {
    id: 'sample-4',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&auto=format&fit=crop&q=80',
    caption: 'Siesta en la sala',
    tag: '💤 Hogar',
    date: '12 Oct',
    createdAt: Date.now() - 345600000
  },
  {
    id: 'sample-5',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80',
    caption: 'Día de entrenamiento',
    tag: '🎾 Juego',
    date: '05 Oct',
    createdAt: Date.now() - 432000000
  },
  {
    id: 'sample-6',
    petId: 'default',
    url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500&auto=format&fit=crop&q=80',
    caption: 'Corriendo en el parque',
    tag: '⚡ Agilidad',
    date: '01 Oct',
    createdAt: Date.now() - 518400000
  }
];

export const PetPhotoReelWidget: React.FC<PetPhotoReelWidgetProps> = ({ profile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const petId = (profile?.publicId || profile?.id || 'default_pet').trim();
  const [photos, setPhotos] = useState<StoredReelPhoto[]>([]);
  const isDog = profile?.type === 'dog';

  // Cargar fotos desde IndexedDB local (Costo $0)
  useEffect(() => {
    let isMounted = true;

    const loadLocalMedia = async () => {
      try {
        const savedPhotos = await getLocalReelPhotos(petId);
        if (!isMounted) return;

        if (savedPhotos && savedPhotos.length > 0) {
          setPhotos(savedPhotos);
        } else {
          setPhotos([...SAMPLE_PHOTOS_A, ...SAMPLE_PHOTOS_B]);
        }
      } catch (err) {
        console.warn('⚠️ [IndexedDB] Fallback al cargar fotos locales:', err);
        if (isMounted) setPhotos([...SAMPLE_PHOTOS_A, ...SAMPLE_PHOTOS_B]);
      }
    };

    loadLocalMedia();

    return () => {
      isMounted = false;
    };
  }, [petId]);

  // Compresión en cliente a WebP (~380x520px vertical, tamaño ~28 KB)
  const compressImage = (file: File, maxWidth = 420, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo inicializar canvas'));

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = () => reject(new Error('Error al decodificar la imagen'));
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedUrl = await compressImage(file, 420, 0.8);
      const newPhoto: StoredReelPhoto = {
        id: `reel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        petId: petId,
        url: compressedUrl,
        caption: `Momento de ${profile?.name || 'Mascota'}`,
        tag: '📸 Galería',
        date: 'Hoy',
        createdAt: Date.now()
      };

      await saveLocalReelPhoto(newPhoto);

      setPhotos((prev) => {
        const hasSampleOnly = prev.every((p) => p.id.startsWith('sample-'));
        const nextList = hasSampleOnly ? [newPhoto] : [newPhoto, ...prev.filter((p) => !p.id.startsWith('sample-'))];
        return nextList.slice(0, 16);
      });
    } catch (err) {
      console.error('Error al procesar foto:', err);
      alert('No se pudo procesar la foto. Intenta con otra imagen.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (id.startsWith('sample-')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    try {
      await deleteLocalReelPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error al eliminar foto local:', err);
    }
  };

  // Dividir las fotos entre las 2 columnas del rollo (Par = Columna 1, Impar = Columna 2)
  const column1Raw = photos.filter((_, idx) => idx % 2 === 0);
  const column2Raw = photos.filter((_, idx) => idx % 2 !== 0);

  const column1 = column1Raw.length > 0 ? (column1Raw.length === 1 ? [column1Raw[0], column1Raw[0]] : [...column1Raw, ...column1Raw]) : [];
  const column2 = column2Raw.length > 0 ? (column2Raw.length === 1 ? [column2Raw[0], column2Raw[0]] : [...column2Raw, ...column2Raw]) : column1;

  const breedLabel = profile?.breedId
    ? profile.breedId.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
    : (profile?.breedCustom || 'Raza Certificada');

  const stageLabel = (profile?.stage as string) === 'puppy_kitten' ? 'Cachorro' : profile?.stage === 'senior' ? 'Senior' : 'Adulto';
  const ageDisplay = profile?.ageMonths ? `${Math.floor(profile.ageMonths / 12)} años` : 'Edad registrada';

  return (
    <div className="w-full bg-white/95 dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-3.5 overflow-hidden flex flex-col select-none transition-colors">
      
      {/* 1. CABECERA IDENTITARIA CÁLIDA */}
      <div className="p-3 rounded-2xl bg-[#faf8f5] dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800 flex items-center gap-3 shadow-2xs">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-stone-800 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-xs">
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile?.name || 'Mascota'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{isDog ? '🐶' : '🐱'}</span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
            ✓
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100 tracking-tight truncate leading-tight">
              {profile?.name || 'Mi Mascota'}
            </h3>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8px] font-black uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
              Perfil
            </span>
          </div>

          <p className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
            {breedLabel}
          </p>

          <div className="flex items-center gap-1 text-[9.5px] text-stone-500 dark:text-stone-400 font-mono">
            <span className="font-bold text-stone-800 dark:text-stone-200">{profile?.weightKg || 0} kg</span>
            <span>•</span>
            <span>{ageDisplay}</span>
            <span>•</span>
            <span className="capitalize">{stageLabel}</span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CABECERA EDITORIAL CÁLIDA */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <Film className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="font-heading font-black text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider leading-none">
              Carrete de Momentos
            </h4>
            <span className="text-[9px] text-stone-400 font-mono">Doble flujo continuo ({photos.length})</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
          title="Subir foto al carrete"
        >
          <Plus className="w-3 h-3" />
          <span>Subir</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUploadPhoto}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* 3. CONTENEDOR INTEGRADO Y CÁLIDO (FONDO MARFIL / VERDE BOSQUE CON ARMONÍA VISUAL) */}
      <div className="relative h-[530px] rounded-2xl p-2 bg-[#f4efe6] dark:bg-[#131b15] border border-stone-200/90 dark:border-stone-850 shadow-inner overflow-hidden group">
        
        {/* Degradados superior e inferior adaptativos y luminosos */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#f4efe6] dark:from-[#131b15] via-[#f4efe6]/80 dark:via-[#131b15]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f4efe6] dark:from-[#131b15] via-[#f4efe6]/80 dark:via-[#131b15]/80 to-transparent z-20 pointer-events-none" />

        <div className="grid grid-cols-2 gap-2 h-full">
          
          {/* 🎞️ COLUMNA 1: FLUJO IZQUIERDO (↑ HACIA ARRIBA) */}
          <div className="relative overflow-hidden rounded-xl bg-white/70 dark:bg-[#18221b]/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs">
            {/* Perforaciones cálidas adaptativas */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 film-perforations-editorial z-10 pointer-events-none opacity-40" />
            
            <div className="flex flex-col gap-2.5 py-2 pl-3.5 pr-1.5 animate-film-up group-hover:[animation-play-state:paused]">
              {column1.map((photo, idx) => (
                <div
                  key={`col1-${photo.id}-${idx}`}
                  className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-750 bg-stone-100 dark:bg-stone-900 shrink-0 shadow-xs group/frame"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/frame:scale-105"
                    loading="lazy"
                  />

                  {/* Micro-insignia superior discreta */}
                  <div className="absolute top-1.5 left-2 right-2 flex justify-between items-center text-[8px] font-mono font-bold text-white drop-shadow-md pointer-events-none">
                    <span className="bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md">#{String((idx % 12) + 1).padStart(2, '0')}</span>
                    <span className="bg-emerald-950/60 backdrop-blur-xs text-emerald-300 px-1.5 py-0.5 rounded-md text-[7.5px]">{photo.tag}</span>
                  </div>

                  {/* Botón de borrado */}
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover/frame:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-all cursor-pointer z-10 active:scale-90"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Pie de foto limpio con degradado suave */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent p-2 text-white">
                    <span className="block text-[10px] font-bold truncate leading-tight drop-shadow-xs">
                      {photo.caption}
                    </span>
                    <span className="block text-[8px] text-stone-300 font-mono mt-0.5">
                      {photo.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🎞️ COLUMNA 2: FLUJO DERECHO (↓ HACIA ABAJO) */}
          <div className="relative overflow-hidden rounded-xl bg-white/70 dark:bg-[#18221b]/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs">
            {/* Perforaciones cálidas adaptativas */}
            <div className="absolute top-0 bottom-0 right-0 w-2.5 film-perforations-editorial z-10 pointer-events-none opacity-40" />

            <div className="flex flex-col gap-2.5 py-2 pl-1.5 pr-3.5 animate-film-down group-hover:[animation-play-state:paused]">
              {column2.map((photo, idx) => (
                <div
                  key={`col2-${photo.id}-${idx}`}
                  className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-750 bg-stone-100 dark:bg-stone-900 shrink-0 shadow-xs group/frame"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/frame:scale-105"
                    loading="lazy"
                  />

                  {/* Micro-insignia superior discreta */}
                  <div className="absolute top-1.5 left-2 right-2 flex justify-between items-center text-[8px] font-mono font-bold text-white drop-shadow-md pointer-events-none">
                    <span className="bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md">#{String((idx % 12) + 13).padStart(2, '0')}</span>
                    <span className="bg-emerald-950/60 backdrop-blur-xs text-emerald-300 px-1.5 py-0.5 rounded-md text-[7.5px]">{photo.tag}</span>
                  </div>

                  {/* Botón de borrado */}
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover/frame:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-all cursor-pointer z-10 active:scale-90"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Pie de foto limpio */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent p-2 text-white">
                    <span className="block text-[10px] font-bold truncate leading-tight drop-shadow-xs">
                      {photo.caption}
                    </span>
                    <span className="block text-[8px] text-stone-300 font-mono mt-0.5">
                      {photo.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Pie informativo */}
      <div className="text-center pt-0.5">
        <span className="text-[9.5px] font-mono text-stone-400 dark:text-stone-500 flex items-center justify-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
          Doble carrete interactivo • Guardado en tu dispositivo
        </span>
      </div>

    </div>
  );
};
