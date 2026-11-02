/**
 * Servicio de almacenamiento local en IndexedDB para el carrete y portada de fotos de la mascota.
 * 100% gratuito: 0 bytes consumidos en Firestore y 0 llamadas de red.
 * Ofrece cientos de megabytes en el disco local del usuario, superando el límite de 5MB de localStorage.
 */

const DB_NAME = 'nutripet_media_db';
const DB_VERSION = 1;
const STORE_REEL = 'reel_photos';
const STORE_COVERS = 'cover_photos';

export interface StoredReelPhoto {
  id: string;
  petId: string;
  url: string;
  caption: string;
  tag: string;
  date: string;
  createdAt: number;
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB no soportado en este entorno'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_REEL)) {
        const reelStore = db.createObjectStore(STORE_REEL, { keyPath: 'id' });
        reelStore.createIndex('petId', 'petId', { unique: false });
        reelStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_COVERS)) {
        db.createObjectStore(STORE_COVERS, { keyPath: 'petId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene todas las fotos del carrete para una mascota específica.
 */
export async function getLocalReelPhotos(petId: string): Promise<StoredReelPhoto[]> {
  if (!petId) return [];
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REEL, 'readonly');
      const store = tx.objectStore(STORE_REEL);
      const index = store.index('petId');
      const request = index.getAll(IDBKeyRange.only(petId));

      request.onsuccess = () => {
        const results = (request.result as StoredReelPhoto[]) || [];
        results.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('⚠️ [IndexedDB] Error al consultar carrete local:', error);
    return [];
  }
}

/**
 * Guarda o actualiza una foto en el carrete local.
 */
export async function saveLocalReelPhoto(photo: StoredReelPhoto): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REEL, 'readwrite');
      const store = tx.objectStore(STORE_REEL);
      const request = store.put(photo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Error al guardar foto local:', error);
    throw error;
  }
}

/**
 * Elimina una foto específica del carrete local.
 */
export async function deleteLocalReelPhoto(photoId: string): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REEL, 'readwrite');
      const store = tx.objectStore(STORE_REEL);
      const request = store.delete(photoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Error al eliminar foto local:', error);
    throw error;
  }
}

/**
 * Obtiene la foto de portada guardada para una mascota.
 */
export async function getLocalCoverPhoto(petId: string): Promise<string | null> {
  if (!petId) return null;
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COVERS, 'readonly');
      const store = tx.objectStore(STORE_COVERS);
      const request = store.get(petId);

      request.onsuccess = () => {
        const res = request.result;
        resolve(res ? res.url : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('⚠️ [IndexedDB] Error al consultar portada local:', error);
    return null;
  }
}

/**
 * Guarda la foto de portada local para una mascota.
 */
export async function saveLocalCoverPhoto(petId: string, url: string): Promise<void> {
  if (!petId || !url) return;
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COVERS, 'readwrite');
      const store = tx.objectStore(STORE_COVERS);
      const request = store.put({ petId, url, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ [IndexedDB] Error al guardar portada local:', error);
    throw error;
  }
}
