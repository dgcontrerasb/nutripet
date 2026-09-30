import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { PetProfile, PublicPetEmergencyCard } from '../types';
import { POPULAR_BREEDS } from '../data';
import { isValidPersistablePet } from '../context/PetContext';

export interface PublicPetCardOptions {
  active?: boolean;
  shareHealth?: boolean;
  shareOwner?: boolean;
  shareVet?: boolean;
}

/**
 * Esquema oficial público consentido de 22 campos permitidos en publicPets.
 * Prohíbe terminantemente cualquier campo privado heredado (id, petId, userId, notes, microchip, etc.).
 */
export const ALLOWED_PUBLIC_PET_KEYS = [
  'publicToken',
  'ownerId',
  'active',
  'name',
  'type',
  'breedName',
  'stage',
  'weightKg',
  'neutered',
  'photoUrl',
  'gender',
  'shareHealthEmergencyInfo',
  'allergies',
  'knownDiseases',
  'shareOwnerContact',
  'ownerName',
  'ownerPhone',
  'shareVetContact',
  'veterinarian',
  'veterinarianPhone',
  'createdAt',
  'updatedAt'
] as const;

/**
 * Función centralizada única autorizada para escribir en publicPets/{publicId}.
 * Garantiza:
 * 1. Exactamente una lectura (getDoc) y una escritura (setDoc) sobre publicPets/{publicId}.
 * 2. Cero eliminaciones automáticas y cero listados de la colección completa.
 * 3. Inmutabilidad estricta de createdAt.
 * 4. Actualización de updatedAt al instante actual.
 * 5. Escritura completa y exclusiva del esquema de 22 campos permitidos (sin merge).
 */
export async function ensurePublicPetCard(
  pet: PetProfile,
  options?: PublicPetCardOptions,
  currentUser?: User | null
): Promise<string> {
  const user = currentUser || auth.currentUser;
  if (!user || !isValidPersistablePet(pet)) {
    console.warn('🚫 [QR] No se puede crear/actualizar ficha pública: mascota o usuario inválido.');
    return '';
  }

  const safeOwnerId = (user.uid || '').trim();
  const publicId = (pet.publicId || pet.id || '').trim();
  if (!safeOwnerId || !publicId) {
    console.warn('🚫 [QR] No se puede crear ficha pública sin ID de mascota o UID de usuario válido.');
    return '';
  }

  // 1. Verificación del tamaño de foto (< 250 KB) para proteger cuota de Firestore
  let safePhotoUrl: string | undefined = undefined;
  const rawPhoto = pet.photoUrl || (pet as any).photoURL;
  if (rawPhoto && typeof rawPhoto === 'string' && rawPhoto.trim() !== '') {
    const photoBytes = new Blob([rawPhoto]).size;
    if (photoBytes <= 250 * 1024) {
      safePhotoUrl = rawPhoto.trim();
    } else {
      console.warn(`⚠️ [QR] Foto (${Math.round(photoBytes / 1024)} KB) supera los 250 KB; omitida en ficha pública para proteger cuota.`);
    }
  }

  // 2. Resolver tipo y etapa estrictamente según firestore.rules
  const safeType: 'dog' | 'cat' = pet.type === 'cat' ? 'cat' : 'dog';

  let safeStage: 'puppy_kitten' | 'adult' | 'senior' = 'adult';
  if (pet.stage === 'puppy_kitten' || (pet.stage as any) === 'puppy' || (pet.stage as any) === 'kitten') {
    safeStage = 'puppy_kitten';
  } else if (pet.stage === 'senior') {
    safeStage = 'senior';
  } else {
    safeStage = 'adult';
  }

  // 3. Peso numérico válido
  const rawWeight = typeof pet.weightKg === 'number' && !isNaN(pet.weightKg) ? pet.weightKg : 0;
  const safeWeight = Math.max(0.1, Number(rawWeight.toFixed(2)));

  // 4. Flags booleanos estrictos
  const isActive = Boolean(options?.active !== undefined ? options.active : true);
  const isNeutered = Boolean(pet.neutered);
  const shareHealth = Boolean(options?.shareHealth ?? true);
  const shareOwner = Boolean(options?.shareOwner ?? true);
  const shareVet = Boolean(options?.shareVet ?? true);

  // 5. Nombre y raza garantizando longitudes máximas
  const safeName = (pet.name || 'Mascota').trim().slice(0, 80);
  const breed = POPULAR_BREEDS.find(b => b.id === pet.breedId);
  const breedName = (breed ? breed.name : pet.breedCustom || 'Mestizo / Único').trim().slice(0, 100);

  const publicPetRef = doc(db, 'publicPets', publicId);

  try {
    const currentSnap = await getDoc(publicPetRef);

    let existingCreatedAt: string;

    if (currentSnap.exists()) {
      const existingData = currentSnap.data() || {};
      if (existingData.ownerId && existingData.ownerId !== safeOwnerId) {
        console.warn('🚫 [QR] Intento bloqueado: la mascota pertenece a otro propietario.');
        return '';
      }

      // Preservar exactamente el createdAt inmutable existente
      existingCreatedAt = existingData.createdAt || pet.createdAt || (pet as any).created_at || new Date().toISOString();
      console.log('🔄 [QR] Actualizando ficha pública existente:', publicId);
    } else {
      // Documento nuevo: inicializar createdAt
      existingCreatedAt = pet.createdAt || (pet as any).created_at || new Date().toISOString();
      console.log('🆕 [QR] Creando nueva ficha pública:', publicId);
    }

    // 6. Construir payload con exactamente los 22 campos autorizados
    const publicPayload: Record<string, any> = {
      publicToken: publicId,
      ownerId: safeOwnerId,
      active: isActive,
      name: safeName,
      type: safeType,
      breedName: breedName,
      stage: safeStage,
      weightKg: safeWeight,
      neutered: isNeutered,
      shareHealthEmergencyInfo: shareHealth,
      shareOwnerContact: shareOwner,
      shareVetContact: shareVet,
      createdAt: existingCreatedAt,
      updatedAt: new Date().toISOString()
    };

    if (safePhotoUrl) {
      publicPayload.photoUrl = safePhotoUrl;
    }
    if (pet.gender === 'male' || pet.gender === 'female') {
      publicPayload.gender = pet.gender;
    }

    // Datos de salud SOLO si shareHealthEmergencyInfo es true
    if (shareHealth) {
      if (pet.allergies && pet.allergies.trim() !== '') {
        publicPayload.allergies = pet.allergies.trim();
      }
      if (pet.knownDiseases && pet.knownDiseases.trim() !== '') {
        publicPayload.knownDiseases = pet.knownDiseases.trim();
      }
    }

    // Datos de tutor SOLO si shareOwnerContact es true
    if (shareOwner) {
      const oName = pet.ownerName || user.displayName || '';
      if (oName.trim() !== '') {
        publicPayload.ownerName = oName.trim();
      }
      if (pet.ownerPhone && pet.ownerPhone.trim() !== '') {
        publicPayload.ownerPhone = pet.ownerPhone.trim();
      }
    }

    // Datos de veterinario SOLO si shareVetContact es true
    if (shareVet) {
      if (pet.veterinarian && pet.veterinarian.trim() !== '') {
        publicPayload.veterinarian = pet.veterinarian.trim();
      }
      if (pet.veterinarianPhone && pet.veterinarianPhone.trim() !== '') {
        publicPayload.veterinarianPhone = pet.veterinarianPhone.trim();
      }
    }

    // Sanitizar rigurosamente para garantizar que solo existan los 22 campos permitidos
    const cleanPayload: Record<string, any> = {};
    for (const key of ALLOWED_PUBLIC_PET_KEYS) {
      if (publicPayload[key] !== undefined) {
        cleanPayload[key] = publicPayload[key];
      }
    }

    // Escritura única completa y limpia sobre publicPets/{publicId} SIN merge
    await setDoc(publicPetRef, cleanPayload);
    console.log('💾 [QR] Ficha pública guardada con éxito:', publicId);

  } catch (error: any) {
    console.error('❌ [QR] Error al guardar ficha pública:', error?.message || String(error));
    throw error;
  }

  // Asignar inmediatamente en la referencia en memoria para consistencia de la sesión actual
  pet.publicId = publicId;

  // Persistir publicId en el perfil privado de la mascota si aún no estaba registrado en Firestore
  try {
    const petDocRef = doc(db, 'users', user.uid, 'pets', pet.id);
    await setDoc(petDocRef, { publicId }, { merge: true });
  } catch (e) {
    console.warn('Nota guardando publicId en perfil privado:', e);
  }

  return publicId;
}

/**
 * Sincroniza la ficha pública existente al guardar cambios explícitos de la mascota.
 * Si la mascota nunca ha activado una ficha pública, NO crea ninguna.
 */
export async function syncPublicPetCardIfExists(
  pet: PetProfile,
  currentUser?: User | null
): Promise<void> {
  const user = currentUser || auth.currentUser;
  if (!user || !isValidPersistablePet(pet)) return;
  const publicId = pet.publicId || pet.id;
  const publicPetRef = doc(db, 'publicPets', publicId);

  try {
    const snap = await getDoc(publicPetRef);
    if (!snap.exists()) {
      return;
    }

    const currentData = snap.data() as PublicPetEmergencyCard;
    await ensurePublicPetCard(pet, {
      active: currentData.active,
      shareHealth: currentData.shareHealthEmergencyInfo,
      shareOwner: currentData.shareOwnerContact,
      shareVet: currentData.shareVetContact
    }, user);
  } catch (e) {
    console.warn('⚠️ [QR] No se pudo sincronizar la ficha pública:', e);
  }
}

/**
 * Consulta la ficha pública existente de forma 100% segura y sin escrituras.
 */
export async function getPublicPetCard(
  publicIdOrPetId: string
): Promise<PublicPetEmergencyCard | null> {
  if (!publicIdOrPetId) return null;
  try {
    console.log('🔍 [QR] Consultando ficha pública:', publicIdOrPetId);
    const publicPetRef = doc(db, 'publicPets', publicIdOrPetId);
    const snap = await getDoc(publicPetRef);
    if (snap.exists()) {
      return snap.data() as PublicPetEmergencyCard;
    }
    return null;
  } catch (e) {
    console.warn('⚠️ [QR] Error al consultar ficha pública:', e);
    return null;
  }
}

/**
 * Elimina la ficha pública asociada a una mascota al ser borrada.
 */
export async function deletePublicPetCard(
  publicIdOrPetId: string,
  currentUser?: User | null
): Promise<void> {
  if (!publicIdOrPetId) return;
  const user = currentUser || auth.currentUser;
  if (!user) return;

  const publicPetRef = doc(db, 'publicPets', publicIdOrPetId);
  try {
    const snap = await getDoc(publicPetRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.ownerId && data.ownerId !== user.uid) {
        console.warn('🚫 [QR] Intento de eliminación bloqueado: la ficha pertenece a otro propietario.');
        return;
      }
      await deleteDoc(publicPetRef);
      console.log('🗑️ [QR] Ficha pública eliminada:', publicIdOrPetId);
    }
  } catch (e) {
    console.warn('Nota eliminando ficha pública en Firestore:', e);
  }
}
