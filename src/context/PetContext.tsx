import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, signInAnonymously } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { PetProfile, MedicalRecord, Reminder, WeightLog, BathLog, UserSubscription, SubscriptionTier } from '../types';
import { syncPublicPetCardIfExists, deletePublicPetCard } from '../services/publicPetService';

interface PetContextType {
  user: User | null;
  loading: boolean;
  pets: PetProfile[];
  activePetId: string;
  activePet: PetProfile | null;
  medicalRecords: MedicalRecord[];
  reminders: Reminder[];
  weightLogs: WeightLog[];
  bathLogs: BathLog[];
  subscription: UserSubscription;
  trialDaysRemaining: number;
  isProOrTrial: boolean;
  isSavingPet: boolean;
  setActivePetId: (id: string) => void;
  updatePetLocal: (pet: PetProfile) => void;
  setPetPublicId: (petId: string, publicId: string) => Promise<void>;
  savePet: (pet: PetProfile) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'petId' | 'userId'>) => Promise<void>;
  deleteMedicalRecord: (recordId: string) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'petId' | 'userId'>) => Promise<void>;
  toggleReminder: (reminderId: string, currentStatus: boolean) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  clearAllReminders: () => Promise<void>;
  addWeightLog: (log: Omit<WeightLog, 'id' | 'petId' | 'userId'>) => Promise<void>;
  deleteWeightLog: (logId: string) => Promise<void>;
  addBathLog: (log: Omit<BathLog, 'id' | 'petId' | 'userId'>) => Promise<void>;
  deleteBathLog: (logId: string) => Promise<void>;
  updateSubscription: (
    tier: SubscriptionTier, 
    planName: string, 
    verificationDetails?: { wompiTransactionId?: string; transactionReference?: string; paypalOrderId?: string }
  ) => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
  resetSubscription: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
}

const PetContext = createContext<PetContextType | null>(null);

const sanitizePets = (petList: any[]): PetProfile[] => {
  return petList.map(p => {
    let photo = p.photoUrl || p.photoURL || undefined;
    // Si la foto en base64 supera ~250KB (>300.000 caracteres), la descartamos para evitar superar el límite de 1MB de Firestore
    if (typeof photo === 'string' && photo.startsWith('data:image') && photo.length > 300000) {
      console.warn(`[NutriPet] Foto de mascota '${p.name || p.id}' demasiado grande (${Math.round(photo.length / 1024)} KB). Removida para sincronización.`);
      photo = undefined;
    }

    return {
      ...p,
      photoUrl: photo,
      veterinarian: (p.veterinarian && (p.veterinarian.includes('Alejandro') || p.veterinarian.includes('María Paz') || p.veterinarian.includes('Dr.') || p.veterinarian.includes('Dra.'))) ? '' : p.veterinarian,
      veterinarianPhone: (p.veterinarianPhone && (p.veterinarianPhone.includes('+57') || p.veterinarianPhone.includes('300 123') || p.veterinarianPhone.includes('311 987'))) ? '' : p.veterinarianPhone,
      microchip: (p.microchip && p.microchip.startsWith('98109810')) ? '' : p.microchip
    };
  });
};

const sanitizeRecords = (records: MedicalRecord[]): MedicalRecord[] => {
  return records.map(r => ({
    ...r,
    veterinarian: (r.veterinarian && (r.veterinarian.includes('Alejandro') || r.veterinarian.includes('María Paz') || r.veterinarian.includes('Dr.') || r.veterinarian.includes('Dra.'))) ? '' : r.veterinarian
  }));
};

const LOCAL_STORAGE_PETS_KEY = 'nutripet_local_pets_v2';
const LOCAL_STORAGE_ACTIVE_KEY = 'nutripet_active_pet_v2';
const LOCAL_STORAGE_RECORDS_KEY = 'nutripet_local_records_v2';
const LOCAL_STORAGE_REMINDERS_KEY = 'nutripet_local_reminders_v2';
const LOCAL_STORAGE_WEIGHTS_KEY = 'nutripet_local_weights_v2';
const LOCAL_STORAGE_BATHS_KEY = 'nutripet_local_baths_v2';
const LOCAL_STORAGE_SUBSCRIPTION_KEY = 'nutripet_subscription_v1';
const LOCAL_STORAGE_TRIAL_KEY = 'nutripet_trial_start_v1';

export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // Proteger contra campos con base64 excesivo que superen el límite de 1MB de Firestore
      if (typeof value === 'string' && value.startsWith('data:image') && value.length > 300000) {
        console.warn(`[Firestore] Campo '${key}' omitido por superar tamaño seguro (${Math.round(value.length / 1024)} KB).`);
        continue;
      }
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanFirestoreData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export const isValidPersistablePet = (pet: any): boolean => {
  if (!pet || typeof pet !== 'object') return false;
  const id = typeof pet.id === 'string' ? pet.id.trim() : '';
  if (!id) return false;
  const lowerId = id.toLowerCase();
  if (
    lowerId === 'defaultpet' ||
    lowerId === 'default_pet' ||
    lowerId === 'pet_default' ||
    lowerId === 'tempemptypet' ||
    lowerId === 'temp_empty_pet' ||
    lowerId.includes('default') ||
    lowerId.includes('temp')
  ) {
    return false;
  }
  if (pet.type !== 'dog' && pet.type !== 'cat') return false;
  return true;
};

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Referencias para control de guardados y prevención de condiciones de carrera
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDebouncePetIdRef = useRef<string | null>(null);
  const deletedPetIdsRef = useRef<Set<string>>(new Set());
  const loadedPetsRef = useRef<Set<string>>(new Set());
  const trialStartDateSyncedRef = useRef<boolean>(false);

  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  const [isProState, setIsProState] = useState<boolean>(false);
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: 'free',
    status: 'active',
    planName: 'Plan Gratuito'
  });

  const syncTrialFromBackend = useCallback(async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/initialize-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (data.subscription) {
            setSubscription(data.subscription);
          }
          
          let remaining = data.daysRemaining ?? 0;
          if (data.subscription?.validUntil) {
            const validUntilStr = data.subscription.validUntil.includes('T')
              ? data.subscription.validUntil
              : `${data.subscription.validUntil}T23:59:59`;
            const validMs = new Date(validUntilStr).getTime();
            if (!isNaN(validMs)) {
              remaining = Math.max(0, Math.ceil((validMs - Date.now()) / (1000 * 60 * 60 * 24)));
            }
          }

          setTrialDaysRemaining(remaining);
          setIsProState(Boolean(data.isPro) || remaining > 0);
          if (data.trialStartedAt) setTrialStartedAt(data.trialStartedAt);
          if (data.trialEndsAt) setTrialEndsAt(data.trialEndsAt);
          console.log(`⏳ [Trial] trial consultado: ${remaining} días restantes para usuario ${currentUser.uid}`);
        }
      }
    } catch (err) {
      console.warn('⚠️ [Trial] Error al consultar trial con backend:', err);
    }
  }, []);

  const [isSavingPet, setIsSavingPet] = useState<boolean>(false);

  const [pets, setPets] = useState<PetProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PETS_KEY);
      return saved ? sanitizePets(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });
  
  const [activePetId, setActivePetIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
      return saved || '';
    } catch {
      return '';
    }
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
      return saved ? sanitizeRecords(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REMINDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WEIGHTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bathLogs, setBathLogs] = useState<BathLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BATHS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // OPTIMIZACIÓN: Memoizar valores derivados
  const filteredMedicalRecords = useMemo(() => 
    medicalRecords.filter(r => r.petId === activePetId),
    [medicalRecords, activePetId]
  );

  const filteredReminders = useMemo(() => 
    reminders.filter(r => r.petId === activePetId),
    [reminders, activePetId]
  );

  const sortedWeightLogs = useMemo(() => 
    weightLogs.filter(w => w.petId === activePetId).sort((a, b) => a.date.localeCompare(b.date)),
    [weightLogs, activePetId]
  );

  const sortedBathLogs = useMemo(() => 
    bathLogs.filter(b => b.petId === activePetId).sort((a, b) => b.date.localeCompare(a.date)),
    [bathLogs, activePetId]
  );

  const activePetMemo = useMemo(() => 
    pets.find(p => p.id === activePetId) || (pets.length > 0 ? pets[0] : null),
    [pets, activePetId]
  );

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(pets));
    } catch (err) {
      console.error('Error saving pets locally:', err);
    }
  }, [pets]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, activePetId);
    } catch {}
  }, [activePetId]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(medicalRecords));
      localStorage.setItem(LOCAL_STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
      localStorage.setItem(LOCAL_STORAGE_WEIGHTS_KEY, JSON.stringify(weightLogs));
      localStorage.setItem(LOCAL_STORAGE_BATHS_KEY, JSON.stringify(bathLogs));
    } catch (err) {
      console.warn('Error guardando registros en localStorage:', err);
    }
  }, [medicalRecords, reminders, weightLogs, bathLogs]);

  const prevAnonUidRef = useRef<string | null>(null);

  const mergeUserData = async (anonUid: string, googleUid: string) => {
    try {
      console.log(`[Merge] Iniciando migración de cuenta invitada ${anonUid} a cuenta Google ${googleUid}...`);

      const anonDocSnap = await getDoc(doc(db, 'users', anonUid));
      if (anonDocSnap.exists()) {
        // Nota: Las funciones Full y el trial de 15 días son autorizados exclusivamente por el servidor para Google Auth.
      }

      const petsColSnap = await getDocs(collection(db, 'users', anonUid, 'pets'));
      for (const petDoc of petsColSnap.docs) {
        const petId = petDoc.id;
        const petData = petDoc.data();

        await setDoc(doc(db, 'users', googleUid, 'pets', petId), {
          ...petData,
          userId: googleUid
        }, { merge: true });

        const medColSnap = await getDocs(collection(db, 'users', anonUid, 'pets', petId, 'medicalRecords'));
        for (const medDoc of medColSnap.docs) {
          await setDoc(doc(db, 'users', googleUid, 'pets', petId, 'medicalRecords', medDoc.id), medDoc.data());
          await deleteDoc(doc(db, 'users', anonUid, 'pets', petId, 'medicalRecords', medDoc.id));
        }

        const remColSnap = await getDocs(collection(db, 'users', anonUid, 'pets', petId, 'reminders'));
        for (const remDoc of remColSnap.docs) {
          await setDoc(doc(db, 'users', googleUid, 'pets', petId, 'reminders', remDoc.id), remDoc.data());
          await deleteDoc(doc(db, 'users', anonUid, 'pets', petId, 'reminders', remDoc.id));
        }

        const weightColSnap = await getDocs(collection(db, 'users', anonUid, 'pets', petId, 'weightLogs'));
        for (const weightDoc of weightColSnap.docs) {
          await setDoc(doc(db, 'users', googleUid, 'pets', petId, 'weightLogs', weightDoc.id), weightDoc.data());
          await deleteDoc(doc(db, 'users', anonUid, 'pets', petId, 'weightLogs', weightDoc.id));
        }

        await deleteDoc(doc(db, 'users', anonUid, 'pets', petId));
      }

      await deleteDoc(doc(db, 'users', anonUid));
    } catch (e) {
      console.error('[Merge] Error migrando cuenta anónima:', e);
    }
  };

  useEffect(() => {
    // Procesar retorno si el usuario inició sesión mediante signInWithRedirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('✅ [Auth] Sesión iniciada exitosamente con Redirect:', result.user.email);
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/popup-closed-by-user') {
          console.warn('[Auth] Redirect result info:', err);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const prevAnonUid = prevAnonUidRef.current;
      
      // Limpiar localStorage si hay datos "sucios" de pruebas anteriores
      try {
        const savedPets = localStorage.getItem(LOCAL_STORAGE_PETS_KEY);
        if (savedPets) {
          const parsedPets: PetProfile[] = JSON.parse(savedPets);
          const hasDefaults = parsedPets.some(p => 
            p.id?.includes('default') || 
            p.id?.includes('pet_default') ||
            p.id === 'temp_empty_pet'
          );
          
          if (hasDefaults) {
            const validPets = parsedPets.filter(p => 
              !p.id?.includes('default') && 
              !p.id?.includes('pet_default') &&
              p.id !== 'temp_empty_pet'
            );
            
            if (validPets.length === 0) {
              localStorage.removeItem(LOCAL_STORAGE_PETS_KEY);
              localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
            } else {
              localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(validPets));
            }
          }
        }
      } catch (e) {
        console.warn('Error limpiando localStorage:', e);
      }
      
      setLoading(false);
      
      if (currentUser) {
        syncTrialFromBackend(currentUser);

        if (prevAnonUid && prevAnonUid !== currentUser.uid && !currentUser.isAnonymous) {
          await mergeUserData(prevAnonUid, currentUser.uid);
          prevAnonUidRef.current = null;
          loadedPetsRef.current.clear();
        }

        if (currentUser.isAnonymous) {
          prevAnonUidRef.current = currentUser.uid;
        }

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const emailStr = currentUser.email || `invitado_${currentUser.uid.substring(0, 8)}@nutripet.app`;
            const displayNameStr = currentUser.displayName || (currentUser.isAnonymous ? 'Invitado de NutriPet' : 'Usuario NutriPet');

            await setDoc(userDocRef, cleanFirestoreData({
              uid: currentUser.uid,
              email: emailStr,
              displayName: displayNameStr,
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString()
            }), { merge: true });
          }
        } catch (e: any) {
          if (e?.code === 'permission-denied') {
            console.warn('🚫 [Trial] Intento cliente bloqueado de modificar suscripción');
          } else {
            console.error('Error syncing user profile:', e);
          }
        }
      } else {
        console.log('Sin usuario autenticado, esperando login...');
        setSubscription({ tier: 'free', status: 'active', planName: 'Plan Gratuito' });
        setTrialDaysRemaining(0);
        setIsProState(false);
        loadedPetsRef.current.clear();
      }
    });

    return () => unsubscribe();
  }, [syncTrialFromBackend]);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUserDoc = onSnapshot(userDocRef, async (snap) => {
      const isAdmin = user.email?.toLowerCase() === 'dgcontrerasb@gmail.com';

      if (snap.exists()) {
        const data = snap.data();

        if (data.lastActivePetId) {
          setActivePetIdState(data.lastActivePetId);
          try { localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, data.lastActivePetId); } catch {}
        }
        
        if (isAdmin) {
          setSubscription({
            tier: 'pro_annual',
            status: 'active',
            planName: 'NutriPet Pro (Administrador)',
            validUntil: '2030-12-31'
          });
          setTrialDaysRemaining(365);
          setIsProState(true);
        } else if (data.subscription) {
          const sub = data.subscription as UserSubscription;
          setSubscription(sub);

          // Soporte para mapa anidado subscription.trialEndsAt / subscription.trialStartedAt con fallback a raíz
          const startedAtIso = sub?.trialStartedAt || data.trialStartedAt || trialStartedAt;
          if (startedAtIso) setTrialStartedAt(startedAtIso);

          const expiryDateStr = sub?.validUntil 
            ? (sub.validUntil.includes('T') ? sub.validUntil : `${sub.validUntil}T23:59:59`)
            : (sub?.trialEndsAt || data.trialEndsAt || trialEndsAt);

          if (expiryDateStr) {
            setTrialEndsAt(expiryDateStr);
            const expiryMs = new Date(expiryDateStr).getTime();
            if (!isNaN(expiryMs)) {
              const diffDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / (1000 * 60 * 60 * 24)));
              setTrialDaysRemaining(diffDays);
              const isActive = (sub.status === 'active' && sub.tier !== 'free') || diffDays > 0;
              setIsProState(isActive);
            }
          } else if (sub.tier !== 'free' && sub.status === 'active') {
            setIsProState(true);
            setTrialDaysRemaining(30);
          }
        }
      }
    }, (err) => {
      console.error('Error listening to user document:', err);
      setSyncError(`Error en usuario: ${err.message}`);
    });

    return () => unsubscribeUserDoc();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const currentUserId = auth.currentUser?.uid || user.uid;
    const petsQuery = collection(db, 'users', currentUserId, 'pets');
    
    const unsubscribePets = onSnapshot(petsQuery, (snapshot) => {
      const cloudPets: PetProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const rawPet: PetProfile = {
          ...(data as PetProfile),
          id: docSnap.id,
          photoUrl: data.photoUrl || data.photoURL || undefined
        };

        // Filtrar mascotas que hayan sido eliminadas recientemente en la sesión
        if (isValidPersistablePet(rawPet) && !deletedPetIdsRef.current.has(rawPet.id)) {
          cloudPets.push(rawPet);
        }
      });

      const sanitizedCloudPets = sanitizePets(cloudPets);
      console.log(`🐾 Firestore cargó ${sanitizedCloudPets.length} mascotas.`);

      // FIRESTORE ES LA ÚNICA FUENTE DE VERDAD:
      // Reemplazar estado React y caché de localStorage directamente.
      // NUNCA hacer setDoc ni re-subir mascotas desde localStorage aquí.
      setPets(sanitizedCloudPets);
      try {
        localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(sanitizedCloudPets));
      } catch {}

      setActivePetIdState((currentActiveId) => {
        if (!sanitizedCloudPets.some(p => p.id === currentActiveId)) {
          const nextId = sanitizedCloudPets.length > 0 ? sanitizedCloudPets[0].id : '';
          try {
            localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, nextId);
          } catch {}
          return nextId;
        }
        return currentActiveId;
      });
    }, (error) => {
      console.error('Error escuchando mascotas de Firestore:', error);
      setSyncError(`Error en mascotas: ${error.message}`);
    });

    return () => unsubscribePets();
  }, [user]);

  useEffect(() => {
    if (!user || !activePetId) return;

    // Si los registros de esta mascota ya se cargaron en el estado durante la sesión actual,
    // se leen directamente de la memoria / localStorage para evitar reconexión masiva y lecturas redundantes
    if (loadedPetsRef.current.has(activePetId)) {
      return;
    }

    loadedPetsRef.current.add(activePetId);

    const recordsRef = collection(db, 'users', user.uid, 'pets', activePetId, 'medicalRecords');
    const unsubscribeRecords = onSnapshot(recordsRef, (snap) => {
      const records: MedicalRecord[] = [];
      snap.forEach(d => records.push({ ...(d.data() as MedicalRecord), id: d.id }));
      setMedicalRecords(prev => {
        const others = prev.filter(r => r.petId !== activePetId);
        return [...others, ...records];
      });
    }, (err) => {
      console.warn('Medical records listener offline / notice:', err.message);
    });

    const remindersRef = collection(db, 'users', user.uid, 'pets', activePetId, 'reminders');
    const unsubscribeReminders = onSnapshot(remindersRef, (snap) => {
      const rems: Reminder[] = [];
      snap.forEach(d => rems.push({ ...(d.data() as Reminder), id: d.id }));
      setReminders(prev => {
        const others = prev.filter(r => r.petId !== activePetId);
        return [...others, ...rems];
      });
    }, (err) => {
      console.warn('Reminders listener offline / notice:', err.message);
    });

    const weightsRef = collection(db, 'users', user.uid, 'pets', activePetId, 'weightLogs');
    const unsubscribeWeights = onSnapshot(weightsRef, (snap) => {
      const weights: WeightLog[] = [];
      snap.forEach(d => weights.push({ ...(d.data() as WeightLog), id: d.id }));
      setWeightLogs(prev => {
        const others = prev.filter(w => w.petId !== activePetId);
        return [...others, ...weights];
      });
    }, (err) => {
      console.warn('Weights listener offline / notice:', err.message);
    });

    return () => {
      unsubscribeRecords();
      unsubscribeReminders();
      unsubscribeWeights();
    };
  }, [user, activePetId]);

  const setActivePetId = useCallback((id: string) => {
    setActivePetIdState(id);
    try { localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, id); } catch {}
    if (user) {
      setDoc(doc(db, 'users', user.uid), { lastActivePetId: id }, { merge: true }).catch(() => {});
    }
  }, [user]);

  // === FUNCIÓN setPetPublicId: PERSISTENCIA TOTAL DEL ID PÚBLICO (REACT + LOCALSTORAGE + FIRESTORE) ===
  const setPetPublicId = useCallback(async (petId: string, publicId: string) => {
    if (!petId || !publicId) return;

    // 1. Actualizar el estado React local de las mascotas y sincronizar inmediatamente localStorage
    setPets(prev => {
      const nextPets = prev.map(p => p.id === petId ? { ...p, publicId } : p);
      try {
        localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(nextPets));
      } catch (err) {
        console.warn('Error guardando en localStorage:', err);
      }
      return nextPets;
    });

    // 2. Persistir en Firestore en users/{uid}/pets/{petId}
    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const petDocRef = doc(db, 'users', currentUid, 'pets', petId);
        await setDoc(petDocRef, { publicId, updatedAt: new Date().toISOString() }, { merge: true });
        console.log('✅ [PetContext] publicId persistido para la mascota:', petId, publicId);
      } catch (e) {
        console.warn('⚠️ [PetContext] Error persistiendo publicId en Firestore:', e);
      }
    }
  }, [user]);

  // === FUNCIÓN updatePetLocal: SOLO ACTUALIZA MASCOTAS EXISTENTES CON ID VÁLIDO ===
  const updatePetLocal = useCallback((petData: PetProfile) => {
    if (!isValidPersistablePet(petData)) {
      console.warn('✖ Escritura bloqueada por mascota inválida/temporal', petData?.id);
      return;
    }

    if (deletedPetIdsRef.current.has(petData.id)) {
      console.warn('✖ Escritura bloqueada por mascota eliminada', petData.id);
      return;
    }

    const petExists = pets.some(p => p.id === petData.id);
    if (!petExists) {
      console.warn('⚠️ Actualización bloqueada de mascota inexistente:', petData.id);
      return;
    }

    // Cancelar cualquier debounce pendiente previo
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const updatedPet = {
      ...petData,
      updatedAt: new Date().toISOString()
    };

    // Actualizar estado local SOLO para la mascota existente
    setPets(prev => {
      const nextPets = prev.map(p => p.id === petData.id ? updatedPet : p);
      try {
        localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(nextPets));
      } catch (err) {
        console.warn("Error en respaldo local:", err);
      }
      return nextPets;
    });

    pendingDebouncePetIdRef.current = petData.id;

    // Guardar en Firestore después de 800ms sin cambios (DEBOUNCE OPTIMIZADO)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Verificar que no haya sido eliminada en ese intervalo
        if (deletedPetIdsRef.current.has(petData.id)) {
          console.warn('✖ Escritura bloqueada por mascota eliminada', petData.id);
          return;
        }
        if (pendingDebouncePetIdRef.current !== petData.id) {
          return;
        }
        if (!isValidPersistablePet(petData)) {
          console.warn('✖ Escritura bloqueada por mascota inválida/temporal', petData?.id);
          return;
        }

        let petToSave = { ...petData };
        if (petToSave.photoUrl && petToSave.photoUrl.length > 150_000) {
          console.warn('✖ Foto demasiado grande para Firestore (>150 KB). Se omite photoUrl.');
          petToSave.photoUrl = undefined;
        }

        if (user) {
          const currentUid = auth.currentUser?.uid || user.uid;
          const petDocRef = doc(db, "users", currentUid, "pets", petToSave.id);
          console.log('💾 [PetContext] Iniciando actualización de mascota en Firestore...', petToSave.id);
          await setDoc(petDocRef, cleanFirestoreData({ ...petToSave, userId: currentUid, updatedAt: new Date().toISOString() }), { merge: true });
          console.log('✅ [PetContext] Mascota actualizada exitosamente en Firestore:', petToSave.id);
        }
      } catch (e: any) {
        console.error("❌ [PetContext] Error en actualización de mascota en Firestore:", e);
        const code = e?.code || '';
        if (code === 'permission-denied') {
          setSyncError('No tienes permisos suficientes para actualizar esta mascota.');
        } else if (code === 'resource-exhausted') {
          setSyncError('Límite de cuota o recurso alcanzado en la base de datos.');
        } else if (code === 'unavailable') {
          setSyncError('Servicio no disponible temporalmente. Los cambios locales se sincronizarán al reconectarse.');
        } else {
          setSyncError(`Error guardando mascota: ${e?.message || e}`);
        }
      } finally {
        if (pendingDebouncePetIdRef.current === petData.id) {
          pendingDebouncePetIdRef.current = null;
        }
      }
    }, 800);
  }, [user, pets]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // === FUNCIÓN savePet: CREACIÓN O ACTUALIZACIÓN EXPLÍCITA ===
  const savePet = useCallback(async (petData: PetProfile) => {
    if (!isValidPersistablePet(petData)) {
      console.warn('✖ Escritura bloqueada por mascota inválida/temporal', petData?.id);
      return;
    }

    if (deletedPetIdsRef.current.has(petData.id)) {
      console.warn('✖ Escritura bloqueada por mascota eliminada', petData.id);
      return;
    }

    // Cancelar cualquier debounce pendiente para esta mascota
    if (saveTimeoutRef.current && pendingDebouncePetIdRef.current === petData.id) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      pendingDebouncePetIdRef.current = null;
    }

    let petToSave = { ...petData };
    if (petToSave.photoUrl && petToSave.photoUrl.length > 150_000) {
      console.warn('✖ Foto demasiado grande para Firestore (>150 KB). Se omite photoUrl.');
      petToSave.photoUrl = undefined;
    }

    const updatedPet: PetProfile = {
      ...petToSave,
      updatedAt: new Date().toISOString()
    };

    let isNewPet = false;

    // Actualizar estado local inmediatamente
    setPets(prev => {
      const exists = prev.some(p => p.id === updatedPet.id);
      isNewPet = !exists;
      const nextPets = exists 
        ? prev.map(p => p.id === updatedPet.id ? updatedPet : p)
        : [...prev, updatedPet];
      
      try {
        localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(nextPets));
      } catch (err) {
        console.warn("Error en respaldo local:", err);
      }
      return nextPets;
    });

    setIsSavingPet(true);

    try {
      if (user) {
        const currentUid = auth.currentUser?.uid || user.uid;
        const petDocRef = doc(db, "users", currentUid, "pets", updatedPet.id);
        console.log('💾 [PetContext] Guardando mascota en Firestore...', updatedPet.id);
        await setDoc(petDocRef, cleanFirestoreData({ ...updatedPet, userId: currentUid, updatedAt: new Date().toISOString() }), { merge: true });
        
        // Sincronizar ficha pública si ya existía para esta mascota (sin duplicar)
        await syncPublicPetCardIfExists(updatedPet, auth.currentUser || user);

        if (isNewPet) {
          console.log('✅ [PetContext] Mascota creada exitosamente en Firestore:', updatedPet.id);
        } else {
          console.log('✅ [PetContext] Mascota guardada/actualizada exitosamente en Firestore:', updatedPet.id);
        }
      }
      setSyncError(null);
    } catch (err: any) {
      console.error("❌ [PetContext] Error al guardar mascota en Firestore:", err);
      const code = err?.code || '';
      if (code === 'permission-denied') {
        setSyncError('No tienes permisos suficientes para guardar esta mascota.');
      } else if (code === 'resource-exhausted') {
        setSyncError('Límite de cuota alcanzado.');
      } else if (code === 'unavailable') {
        setSyncError('Servicio no disponible temporalmente. El cambio local se conserva en el dispositivo.');
      } else {
        setSyncError(`Error guardando mascota: ${err?.message || err}`);
      }
      throw err;
    } finally {
      setIsSavingPet(false);
    }
  }, [user]);

  // === FUNCIÓN deletePet: ELIMINACIÓN TOTAL Y SEGURA ===
  const deletePet = useCallback(async (petId: string) => {
    if (!petId || petId === 'temp_empty_pet' || petId.toLowerCase().includes('default')) {
      console.warn('⚠️ Intento de eliminar mascota con ID inválido/temporal bloqueado:', petId);
      return;
    }

    // 1. Obtener la mascota antes de borrarla para conocer su publicId
    const petToDelete = pets.find(p => p.id === petId);
    const targetPublicId = petToDelete?.publicId || petId;

    // 2. Marcar el ID como eliminado en memoria antes de borrar para bloquear re-escrituras
    deletedPetIdsRef.current.add(petId);
    loadedPetsRef.current.delete(petId);

    // 2. Cancelar cualquier debounce de guardado pendiente para ese ID
    if (saveTimeoutRef.current && pendingDebouncePetIdRef.current === petId) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      pendingDebouncePetIdRef.current = null;
    }

    // 3. Eliminar el ID del estado React y de localStorage inmediatamente, determinando el siguiente ID activo sin valores obsoletos
    let nextActiveId = '';
    setPets(prev => {
      const remaining = prev.filter(p => p.id !== petId);
      try {
        localStorage.setItem(LOCAL_STORAGE_PETS_KEY, JSON.stringify(remaining));
      } catch {}
      nextActiveId = remaining.length > 0 ? remaining[0].id : '';
      return remaining;
    });

    // Limpiar expedientes, recordatorios y pesos asociados en memoria local
    setMedicalRecords(prev => prev.filter(r => r.petId !== petId));
    setReminders(prev => prev.filter(r => r.petId !== petId));
    setWeightLogs(prev => prev.filter(w => w.petId !== petId));

    // 4. Actualizar activePetId si coincide con la eliminada de forma atómica
    setActivePetIdState(currentActiveId => {
      if (currentActiveId === petId) {
        try { localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, nextActiveId); } catch {}
        if (user) {
          setDoc(doc(db, 'users', user.uid), { lastActivePetId: nextActiveId }, { merge: true }).catch(() => {});
        }
        return nextActiveId;
      }
      return currentActiveId;
    });

    // 5. Eliminar explícitamente las subcolecciones y el documento en Firestore
    try {
      if (user) {
        const currentUid = auth.currentUser?.uid || user.uid;

        // Limpiar subcolección medicalRecords
        try {
          const medSnap = await getDocs(collection(db, 'users', currentUid, 'pets', petId, 'medicalRecords'));
          for (const d of medSnap.docs) {
            await deleteDoc(doc(db, 'users', currentUid, 'pets', petId, 'medicalRecords', d.id));
          }
        } catch (e) {
          console.warn('Nota limpiando medicalRecords en Firestore:', e);
        }

        // Limpiar subcolección reminders
        try {
          const remSnap = await getDocs(collection(db, 'users', currentUid, 'pets', petId, 'reminders'));
          for (const d of remSnap.docs) {
            await deleteDoc(doc(db, 'users', currentUid, 'pets', petId, 'reminders', d.id));
          }
        } catch (e) {
          console.warn('Nota limpiando reminders en Firestore:', e);
        }

        // Limpiar subcolección weightLogs
        try {
          const weightSnap = await getDocs(collection(db, 'users', currentUid, 'pets', petId, 'weightLogs'));
          for (const d of weightSnap.docs) {
            await deleteDoc(doc(db, 'users', currentUid, 'pets', petId, 'weightLogs', d.id));
          }
        } catch (e) {
          console.warn('Nota limpiando weightLogs en Firestore:', e);
        }

        // Eliminar también la ficha pública asociada en publicPets/{targetPublicId}
        await deletePublicPetCard(targetPublicId, auth.currentUser || user);

        // Eliminar documento principal de la mascota
        await deleteDoc(doc(db, 'users', currentUid, 'pets', petId));
      }
      console.log('🗑️ Mascota eliminada:', petId);
      setSyncError(null);
    } catch (err) {
      console.error('Error deleting pet from Firestore:', err);
      setSyncError(`Error eliminando mascota: ${err}`);
      throw err;
    }
  }, [user]);

  const addMedicalRecord = useCallback(async (data: Omit<MedicalRecord, 'id' | 'petId' | 'userId'>) => {
    const newRecord: MedicalRecord = {
      ...data,
      id: 'rec_' + Date.now(),
      petId: activePetId,
      userId: user?.uid,
      createdAt: new Date().toISOString()
    };

    setMedicalRecords(prev => [newRecord, ...prev]);

    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const recRef = doc(db, 'users', currentUid, 'pets', activePetId, 'medicalRecords', newRecord.id);
        await setDoc(recRef, cleanFirestoreData(newRecord));
      } catch (e) {
        console.error('Error adding medical record:', e);
        setSyncError(`Error agregando registro: ${e}`);
      }
    }
  }, [user, activePetId]);

  const deleteMedicalRecord = useCallback(async (recordId: string) => {
    setMedicalRecords(prev => prev.filter(r => r.id !== recordId));
    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        await deleteDoc(doc(db, 'users', currentUid, 'pets', activePetId, 'medicalRecords', recordId));
      } catch (e) {
        console.error('Error deleting medical record:', e);
      }
    }
  }, [user, activePetId]);

  const addReminder = useCallback(async (data: Omit<Reminder, 'id' | 'petId' | 'userId'>) => {
    const newReminder: Reminder = {
      ...data,
      id: 'rem_' + Date.now(),
      petId: activePetId,
      userId: user?.uid,
      createdAt: new Date().toISOString()
    };

    setReminders(prev => [newReminder, ...prev]);

    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const remRef = doc(db, 'users', currentUid, 'pets', activePetId, 'reminders', newReminder.id);
        await setDoc(remRef, cleanFirestoreData(newReminder));
      } catch (e) {
        console.error('Error adding reminder:', e);
      }
    }
  }, [user, activePetId]);

  const toggleReminder = useCallback(async (reminderId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, completed: newStatus } : r));

    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const remRef = doc(db, 'users', currentUid, 'pets', activePetId, 'reminders', reminderId);
        await setDoc(remRef, { completed: newStatus }, { merge: true });
      } catch (e) {
        console.error('Error toggling reminder:', e);
      }
    }
  }, [user, activePetId]);

  const deleteReminder = useCallback(async (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        await deleteDoc(doc(db, 'users', currentUid, 'pets', activePetId, 'reminders', reminderId));
      } catch (e) {
        console.error('Error deleting reminder:', e);
      }
    }
  }, [user, activePetId]);

  const clearAllReminders = useCallback(async () => {
    const toDelete = reminders.filter(r => r.petId === activePetId);
    setReminders(prev => prev.filter(r => r.petId !== activePetId));
    if (user) {
      const currentUid = auth.currentUser?.uid || user.uid;
      for (const item of toDelete) {
        try {
          await deleteDoc(doc(db, 'users', currentUid, 'pets', activePetId, 'reminders', item.id));
        } catch (e) {
          console.error('Error deleting reminder:', e);
        }
      }
    }
  }, [user, activePetId, reminders]);

  const addWeightLog = useCallback(async (data: Omit<WeightLog, 'id' | 'petId' | 'userId'>) => {
    const newLog: WeightLog = {
      ...data,
      id: 'w_' + Date.now(),
      petId: activePetId,
      userId: user?.uid
    };

    setWeightLogs(prev => [...prev, newLog]);

    const activePet = pets.find(p => p.id === activePetId);
    if (activePet) {
      savePet({ ...activePet, weightKg: data.weightKg });
    }

    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const logRef = doc(db, 'users', currentUid, 'pets', activePetId, 'weightLogs', newLog.id);
        await setDoc(logRef, cleanFirestoreData(newLog));
      } catch (e) {
        console.error('Error adding weight log:', e);
      }
    }
  }, [user, activePetId, pets, savePet]);

  const deleteWeightLog = useCallback(async (logId: string) => {
    setWeightLogs(prev => prev.filter(w => w.id !== logId));
    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        await deleteDoc(doc(db, 'users', currentUid, 'pets', activePetId, 'weightLogs', logId));
      } catch (e) {
        console.error('Error deleting weight log:', e);
      }
    }
  }, [user, activePetId]);

  const addBathLog = useCallback(async (data: Omit<BathLog, 'id' | 'petId' | 'userId'>) => {
    const newLog: BathLog = {
      ...data,
      id: 'bath_' + Date.now(),
      petId: activePetId,
      userId: user?.uid,
      createdAt: new Date().toISOString()
    };

    setBathLogs(prev => [newLog, ...prev]);

    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        const logRef = doc(db, 'users', currentUid, 'pets', activePetId, 'bathLogs', newLog.id);
        await setDoc(logRef, cleanFirestoreData(newLog));
      } catch (e) {
        console.error('Error adding bath log:', e);
      }
    }
  }, [user, activePetId]);

  const deleteBathLog = useCallback(async (logId: string) => {
    setBathLogs(prev => prev.filter(b => b.id !== logId));
    if (user) {
      try {
        const currentUid = auth.currentUser?.uid || user.uid;
        await deleteDoc(doc(db, 'users', currentUid, 'pets', activePetId, 'bathLogs', logId));
      } catch (e) {
        console.error('Error deleting bath log:', e);
      }
    }
  }, [user, activePetId]);

  const loginWithGoogleRedirect = useCallback(async () => {
    try {
      setSyncError(null);
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error('Error in signInWithRedirect:', err);
      setSyncError(`Error al redirigir a Google: ${err.message}`);
    }
  }, []);

  const updateSubscription = useCallback(async (
    tier: SubscriptionTier, 
    planName: string, 
    verificationDetails?: { wompiTransactionId?: string; transactionReference?: string; paypalOrderId?: string }
  ): Promise<boolean> => {
    const currentUser = auth.currentUser || user;
    if (!currentUser) return false;

    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          planId: tier === 'pro_annual' ? 'plan_pro_annual' : 'plan_pro_monthly',
          planName,
          wompiTransactionId: verificationDetails?.wompiTransactionId,
          transactionReference: verificationDetails?.transactionReference,
          paypalOrderId: verificationDetails?.paypalOrderId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setSubscription(data.subscription);
          setIsProState(true);
          setTrialDaysRemaining(365);
          console.log('✅ [Subscription] Suscripción activada exitosamente por backend:', data.subscription);
          return true;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('🔒 [Subscription] Activación bloqueada por backend:', errData);
      }
      return false;
    } catch (e: any) {
      console.error('Error activando suscripción:', e);
      return false;
    }
  }, [user]);

  const cancelSubscription = useCallback(async () => {
    const cancelledSub: UserSubscription = {
      ...subscription,
      autoRenew: false,
      status: 'cancelled'
    };
    setSubscription(cancelledSub);
  }, [subscription]);

  const resetSubscription = useCallback(async () => {
    const freeSub: UserSubscription = {
      tier: 'free',
      status: 'active',
      planName: 'Plan Gratuito'
    };
    setSubscription(freeSub);
  }, []);

  const isProActive = subscription.tier !== 'free' && subscription.status === 'active';
  const isProOrTrial = isProState || isProActive || trialDaysRemaining > 0;

  return (
    <PetContext.Provider
      value={{
        user,
        loading,
        pets,
        activePetId,
        activePet: activePetMemo,
        medicalRecords: filteredMedicalRecords,
        reminders: filteredReminders,
        weightLogs: sortedWeightLogs,
        bathLogs: sortedBathLogs,
        subscription,
        trialDaysRemaining,
        isProOrTrial,
        isSavingPet,
        setActivePetId,
        updatePetLocal,
        setPetPublicId,
        savePet,
        deletePet,
        addMedicalRecord,
        deleteMedicalRecord,
        addReminder,
        toggleReminder,
        deleteReminder,
        clearAllReminders,
        addWeightLog,
        deleteWeightLog,
        addBathLog,
        deleteBathLog,
        updateSubscription,
        cancelSubscription,
        resetSubscription,
        loginWithGoogle,
        loginWithGoogleRedirect,
        logout
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePets = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
};
