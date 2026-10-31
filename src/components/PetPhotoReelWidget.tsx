import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Trash2, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { PetProfile } from '../types';

interface PetPhotoReelWidgetProps {
  profile: PetProfile;
}

interface ReelPhoto {
  id: string;
  url: string;
  caption: string;
  tag: string;
  date: string;
}

const STORAGE_KEY_PREFIX = 'nutripet_reel_photos_';
const COVER_KEY_PREFIX = 'nutripet_reel_cover_';

// 5 Fotos temáticas de muestra de Spitz / Pomerania blanco
const DEFAULT_OSLO_PHOTOS: ReelPhoto[] = [
  {
    id: 'oslo-1',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
    caption: 'Tarde de paseo en el prado',
    tag: '🌲 Aire libre',
    date: 'Ayer'
  },
  {
    id: 'oslo-2',
    url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&auto=format&fit=crop&q=80',
    caption: 'Esperando su porción BARF',
    tag: '🥩 Nutrición',
    date: '24 Oct'
  },
  {
    id: 'oslo-3',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
    caption: 'Sesión de cepillado y peluquería',
    tag: '✨ Bienestar',
    date: '18 Oct'
  },
  {
    id: 'oslo-4',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&auto=format&fit=crop&q=80',
    caption: 'Momento de descanso en la sala',
    tag: '💤 Siesta',
    date: '12 Oct'
  },
  {
    id: 'oslo-5',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80',
    caption: 'Entrenamiento de obediencia',
    tag: '🎾 Juego',
    date: '05 Oct'
  }
];

// Foto de portada independiente
const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80';

export const PetPhotoReelWidget: React.FC<PetPhotoReelWidgetProps> = ({ profile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const petId = profile?.id || 'default_oslo';
  const storageKey = `${STORAGE_KEY_PREFIX}${petId}`;
  const coverKey = `${COVER_KEY_PREFIX}${petId}`;

  const [coverPhoto, setCoverPhoto] = useState<string>(() => {
    return localStorage.getItem(coverKey) || DEFAULT_COVER_URL;
  });

  const [photos, setPhotos] = useState<ReelPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_OSLO_PHOTOS;
    } catch {
      return DEFAULT_OSLO_PHOTOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(photos));
    } catch (e) {
      console.warn('Almacenamiento local lleno', e);
    }
  }, [photos, storageKey]);

  useEffect(() => {
    if (coverPhoto) {
      localStorage.setItem(coverKey, coverPhoto);
    }
  }, [coverPhoto, coverKey]);

  // Compresión en cliente a WebP para costo cero
  const compressImage = (file: File, maxWidth = 420, quality = 0.72): Promise<string> => {
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
          if (!ctx) return reject('No canvas context');

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
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
      const compressedUrl = await compressImage(file, 380, 0.7);
      const newPhoto: ReelPhoto = {
        id: Date.now().toString(),
        url: compressedUrl,
        caption: `Nuevo momento de ${profile?.name || 'Oslo'}`,
        tag: '📸 Galería',
        date: 'Hoy',
      };
      setPhotos((prev) => [newPhoto, ...prev.slice(0, 5)]);
    } catch (err) {
      console.error('Error al comprimir foto', err);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedUrl = await compressImage(file, 600, 0.75);
      setCoverPhoto(compressedUrl);
    } catch (err) {
      console.error('Error al cambiar foto de portada', err);
    }
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Duplicamos el arreglo para que el bucle continuo no tenga saltos
  const loopPhotos = [...photos, ...photos];

  const breedLabel = profile?.breedId
    ? profile.breedId.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
    : 'Pomerania Grande (Spitz Mediano)';

  const stageLabel = (profile?.stage as string) === 'puppy_kitten' ? 'Cachorro' : profile?.stage === 'senior' ? 'Senior' : 'Adulto';

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm space-y-4 overflow-hidden flex flex-col select-none">
      
      {/* 1. SECCIÓN SUPERIOR ESTÁTICA COMPACTA */}
      <div className="space-y-2 pb-2.5 border-b border-stone-100 dark:border-stone-800">
        {/* Portada compacta (h-28 en vez de h-44) */}
        <div className="relative group w-full h-28 rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-2xs">
          <img
            src={coverPhoto}
            alt={profile?.name || 'Portada'}
            className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer shadow-xs flex items-center gap-1 text-[9.5px] font-bold active:scale-95"
            title="Cambiar foto de portada"
          >
            <Camera className="w-3 h-3" />
            <span>Editar</span>
          </button>
          
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleUploadCover}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Nombre, Raza y Métricas en formato compacto */}
        <div className="text-center px-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100 tracking-tight truncate">
              {profile?.name || 'Oslo'}
            </h3>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[8.5px] font-black uppercase tracking-wider">
              Oficial
            </span>
          </div>
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
            {profile?.breedId === 'pomeranian_large' ? 'Pomerania Grande' : breedLabel}
          </p>
          <p className="text-[10px] text-stone-400 font-mono">
            {profile?.weightKg || 20} kg · {stageLabel} · 2 años
          </p>
        </div>
      </div>

      {/* 2. BARRA DE CABECERA DEL CARRUSEL */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <h4 className="font-heading font-black text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Álbum Visual ({photos.length})
          </h4>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
          title="Añadir una foto al reel"
        >
          <Plus className="w-3.5 h-3.5" />
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

      {/* 3. CARRUSEL VERTICAL CONTINUO (MÁS AMPLIO) */}
      <div className="relative h-[440px] overflow-hidden rounded-2xl group border border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/40">
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white dark:from-stone-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-stone-900 to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-3 p-2 animate-vertical-scroll group-hover:[animation-play-state:paused]">
          {loopPhotos.map((photo, idx) => (
            <div
              key={`${photo.id}-${idx}`}
              className="relative w-full h-40 rounded-2xl overflow-hidden border border-stone-200/90 dark:border-stone-800 shrink-0 shadow-2xs group/card bg-stone-100 dark:bg-stone-850"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-3 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-emerald-300">
                    {photo.tag}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="opacity-0 group-hover/card:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-xs active:scale-90"
                    title="Eliminar esta foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <span className="block text-[11px] font-black truncate leading-tight">
                    {photo.caption}
                  </span>
                  <span className="block text-[9.5px] text-stone-300 font-mono mt-0.5">
                    {photo.date} · Guardada local
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MICRO-PIE DE PRIVACIDAD EDITORIAL */}
      <div className="pt-1 pb-0.5 text-center">
        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium flex items-center justify-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
          <span>Galería local privada · Guardada exclusivamente en este dispositivo</span>
        </p>
      </div>

    </div>
  );
};