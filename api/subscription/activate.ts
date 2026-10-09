import type { IncomingMessage, ServerResponse } from 'http';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  } catch (error) {
    console.error('Error inicializando Firebase Admin SDK:', error);
  }
}

type ApiRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => {
    json: (data: any) => void;
    end: () => void;
  };
};

const ALLOWED_PLAN_IDS = new Set(['pro_monthly', 'pro_annual']);

async function readJsonBody(req: ApiRequest): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getAllowedOrigin(req: ApiRequest): string {
  const configuredOrigin = process.env.ALLOWED_ORIGIN;
  const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : '';

  if (configuredOrigin && configuredOrigin !== '*') {
    return requestOrigin === configuredOrigin ? requestOrigin : configuredOrigin;
  }

  return requestOrigin || 'null';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'M?todo no permitido. Solo se acepta POST.' });
  }

  const authHeader = req.headers.authorization ?? req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado. Se requiere Authorization: Bearer <idToken>'
    });
  }

  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) {
    return res.status(401).json({ error: 'Token inv?lido o vac?o.' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const body = await readJsonBody(req);
    const planId = String(body?.planId || '');
    const wompiTransactionId = body?.wompiTransactionId ? String(body.wompiTransactionId) : '';
    const paypalOrderId = body?.paypalOrderId ? String(body.paypalOrderId) : '';
    const transactionId = wompiTransactionId || paypalOrderId;

    if (!ALLOWED_PLAN_IDS.has(planId)) {
      return res.status(400).json({ error: 'planId inv?lido. Usa pro_monthly o pro_annual.' });
    }

    if (!transactionId) {
      return res.status(400).json({ error: 'Debe incluir wompiTransactionId o paypalOrderId.' });
    }

    const firestore = getFirestore();
    const processedRef = firestore.collection('processed_payments').doc(transactionId);
    const processedSnap = await processedRef.get();
    if (processedSnap.exists) {
      return res.status(409).json({ error: 'Transacci?n ya procesada.' });
    }

    const planName = planId === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual';
    const subscription = {
      tier: planId,
      status: 'active',
      planName,
      activatedAt: Date.now(),
      transactionId,
      updatedAt: Date.now()
    };

    const batch = firestore.batch();
    batch.set(processedRef, {
      userId: uid,
      planId,
      transactionId,
      processedAt: Date.now()
    });
    batch.set(firestore.collection('users').doc(uid), {
      isPro: true,
      subscription,
      updatedAt: Date.now()
    }, { merge: true });

    await batch.commit();

    return res.status(200).json({
      success: true,
      subscription
    });
  } catch (error: any) {
    console.error('Error activando suscripci?n:', error);
    return res.status(401).json({
      error: 'No autorizado o token inv?lido.',
      details: error?.message || 'invalid token'
    });
  }
}
