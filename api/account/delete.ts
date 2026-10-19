import type { IncomingMessage, ServerResponse } from 'http';
import { getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import {
  applyApiCors,
  getBearerToken,
  initializeFirebaseAdmin,
  isFirebaseAuthError
} from '../../server/firebaseAdmin.ts';
import { getOrCreateTrialStart } from '../../server/trialState.ts';

type ApiRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => {
    json: (data: unknown) => void;
    end: () => void;
  };
};

async function deleteMatchingDocuments(
  firestore: Firestore,
  collectionName: string,
  field: string,
  value: string
): Promise<void> {
  const snapshot = await firestore.collection(collectionName).where(field, '==', value).get();
  for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
    const batch = firestore.batch();
    snapshot.docs.slice(offset, offset + 400).forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyApiCors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  const idToken = getBearerToken(req);
  if (!idToken) {
    return res.status(401).json({ error: 'Se requiere un token de sesión válido.' });
  }

  try {
    initializeFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (!decodedToken.email_verified || typeof decodedToken.email !== 'string') {
      return res.status(403).json({
        error: 'Verifica el correo de tu cuenta antes de solicitar su eliminación.'
      });
    }

    const uid = decodedToken.uid;
    const firestore = getFirestore();
    const userRef = firestore.collection('users').doc(uid);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data() || {};
    const preferredTrialStart = typeof userData.trialStartedAt === 'number'
      ? userData.trialStartedAt
      : null;

    await getOrCreateTrialStart(uid, decodedToken.email, preferredTrialStart);

    await deleteMatchingDocuments(firestore, 'publicPets', 'ownerId', uid);
    await deleteMatchingDocuments(firestore, 'feedbacks', 'userId', uid);
    await firestore.recursiveDelete(userRef);
    await getAuth().deleteUser(uid);

    return res.status(200).json({ success: true });
  } catch (error) {
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }
    console.error('Error eliminando la cuenta:', error);
    return res.status(500).json({ error: 'No se pudo completar la eliminación de la cuenta.' });
  }
}
