import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export type BgTheme = 'paws' | 'warm' | 'mint' | 'sky' | 'night' | 'puppies' | 'nature' | 'custom' | 'ocean' | 'sunset' | 'forest' | 'lavender';

export function useBgPreferences(user: User | null) {
  const [bgTheme, setBgThemeState] = useState<BgTheme>(() => {
    const saved = localStorage.getItem('nutripet_bg_theme');
    return (saved as any) || 'paws';
  });

  const [customBgImage, setCustomBgImageState] = useState<string | null>(() => {
    return localStorage.getItem('nutripet_custom_bg_image');
  });

  const [bgIntensity, setBgIntensityState] = useState<'bold' | 'vivid' | 'medium'>(() => {
    const saved = localStorage.getItem('nutripet_bg_intensity');
    return (saved as any) || 'bold';
  });

  // Guardamos en un ref los valores persistidos conocidos en Firestore / iniciales
  const persistedRef = useRef({
    bgTheme: (localStorage.getItem('nutripet_bg_theme') as BgTheme) || 'paws',
    bgIntensity: (localStorage.getItem('nutripet_bg_intensity') as 'bold' | 'vivid' | 'medium') || 'bold',
    customBgImage: localStorage.getItem('nutripet_custom_bg_image') || null,
  });

  // Flag para ignorar guardado mientras se están cargando preferencias iniciales desde Firestore
  const isInitialLoadingRef = useRef(false);

  // Debounce ref para Firestore
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar de Firestore cuando user cambia
  useEffect(() => {
    if (!user?.uid) {
      console.log('🔍 [useBgPreferences] Sin usuario UID activo.');
      return;
    }

    console.log('📥 [useBgPreferences] Cargando preferencias de Firestore para:', user.uid);
    isInitialLoadingRef.current = true;

    const loadFromFirestore = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          
          if (data.bgTheme && data.bgTheme !== persistedRef.current.bgTheme) {
            console.log('🎨 [useBgPreferences] Actualizando bgTheme desde Firestore:', data.bgTheme);
            setBgThemeState(data.bgTheme);
            persistedRef.current.bgTheme = data.bgTheme;
            try { localStorage.setItem('nutripet_bg_theme', data.bgTheme); } catch {}
          }

          if (data.bgIntensity && data.bgIntensity !== persistedRef.current.bgIntensity) {
            console.log('🎨 [useBgPreferences] Actualizando bgIntensity desde Firestore:', data.bgIntensity);
            setBgIntensityState(data.bgIntensity);
            persistedRef.current.bgIntensity = data.bgIntensity;
            try { localStorage.setItem('nutripet_bg_intensity', data.bgIntensity); } catch {}
          }

          if (data.customBgImage !== undefined && data.customBgImage !== persistedRef.current.customBgImage) {
            if (data.customBgImage) {
              const sizeKB = Math.round(data.customBgImage.length / 1024);
              if (sizeKB > 100) {
                console.warn(`⚠️ [DEV Warning] customBgImage cargada supera 100 KB (${sizeKB} KB).`);
              }
            }
            setCustomBgImageState(data.customBgImage);
            persistedRef.current.customBgImage = data.customBgImage;
            try {
              if (data.customBgImage) localStorage.setItem('nutripet_custom_bg_image', data.customBgImage);
              else localStorage.removeItem('nutripet_custom_bg_image');
            } catch {}
          }
        }
      } catch (e: any) {
        console.error('❌ [useBgPreferences] Error cargando preferencias:', e?.message || e);
      } finally {
        isInitialLoadingRef.current = false;
      }
    };

    loadFromFirestore();
  }, [user?.uid]);

  // Función para programar la persistencia con Debounce de 800 ms
  const scheduleSaveToFirestore = useCallback((
    newTheme: BgTheme,
    newIntensity: 'bold' | 'vivid' | 'medium',
    newCustomImage: string | null
  ) => {
    if (!user?.uid) return;
    if (isInitialLoadingRef.current) {
      console.log('🔍 [useBgPreferences] Guardado evitado: Carga inicial en progreso.');
      return;
    }

    const currentPersisted = persistedRef.current;
    if (
      currentPersisted.bgTheme === newTheme &&
      currentPersisted.bgIntensity === newIntensity &&
      currentPersisted.customBgImage === newCustomImage
    ) {
      console.log('🔍 [useBgPreferences] Guardado evitado: Los valores no han cambiado respecto a Firestore.');
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    console.log('⏳ [useBgPreferences] Cambio detectado. Programando guardado con Debounce (800ms)...');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('💾 [useBgPreferences] Guardando preferencias en Firestore...', { bgTheme: newTheme, bgIntensity: newIntensity });
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          bgTheme: newTheme,
          bgIntensity: newIntensity,
          customBgImage: newCustomImage || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Actualizar ref de persistido tras la confirmación de la promesa
        persistedRef.current = {
          bgTheme: newTheme,
          bgIntensity: newIntensity,
          customBgImage: newCustomImage
        };
        console.log('✅ [useBgPreferences] Preferencias de fondo guardadas exitosamente en Firestore.');
      } catch (e: any) {
        console.error('❌ [useBgPreferences] Error al guardar preferencias en Firestore:', e?.message || e);
      }
    }, 800);
  }, [user?.uid]);

  // Modificadores explícitos con actualización local + sync condicional
  const setBgTheme = useCallback((theme: BgTheme) => {
    setBgThemeState(theme);
    try { localStorage.setItem('nutripet_bg_theme', theme); } catch {}
    scheduleSaveToFirestore(theme, bgIntensity, customBgImage);
  }, [bgIntensity, customBgImage, scheduleSaveToFirestore]);

  const setBgIntensity = useCallback((intensity: 'bold' | 'vivid' | 'medium') => {
    setBgIntensityState(intensity);
    try { localStorage.setItem('nutripet_bg_intensity', intensity); } catch {}
    scheduleSaveToFirestore(bgTheme, intensity, customBgImage);
  }, [bgTheme, customBgImage, scheduleSaveToFirestore]);

  const setCustomBgImage = useCallback((img: string | null) => {
    if (img) {
      const sizeKB = Math.round(img.length / 1024);
      if (sizeKB > 100) {
        console.warn(`⚠️ [DEV Warning] customBgImage es de ${sizeKB} KB. Se recomienda mantener imágenes de fondo ligeras (<100 KB) para mejor rendimiento.`);
      }
      try { localStorage.setItem('nutripet_custom_bg_image', img); } catch {}
    } else {
      try { localStorage.removeItem('nutripet_custom_bg_image'); } catch {}
    }
    setCustomBgImageState(img);
    scheduleSaveToFirestore(bgTheme, bgIntensity, img);
  }, [bgTheme, bgIntensity, scheduleSaveToFirestore]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    bgTheme,
    setBgTheme,
    customBgImage,
    setCustomBgImage,
    bgIntensity,
    setBgIntensity
  };
}
