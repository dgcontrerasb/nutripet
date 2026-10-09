import type { IncomingMessage, ServerResponse } from 'http';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Inicialización de Firebase Admin como Singleton compatible con ESM
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp({
        credential: applicationDefault()
      });
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

const TRIAL_DAYS = 15;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  // 1. Extraer y validar el Bearer Token
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No autorizado. Se requiere cabecera Authorization con token Bearer.' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    return res.status(401).json({ error: 'Token de autenticación vacío o malformado.' });
  }

  try {
    // 2. Verificar la identidad del usuario con Firebase Auth
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = getFirestore();
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    const now = Date.now();
    let trialStartedAt = now;
    let isPro = false;
    let daysRemaining = 0;

    if (userDoc.exists) {
      const data = userDoc.data() || {};
      
      // Si el usuario ya tiene una suscripción de pago activa
      if (data.subscription?.tier === 'pro_annual' || data.subscription?.tier === 'pro_monthly') {
        return res.status(200).json({
          success: true,
          isPro: true,
          daysRemaining: -1,
          subscription: data.subscription
        });
      }

      if (data.trialStartedAt) {
        trialStartedAt = data.trialStartedAt;
      } else {
        await userDocRef.set({ trialStartedAt: now }, { merge: true });
      }
    } else {
      await userDocRef.set({ 
        trialStartedAt: now,
        createdAt: now 
      }, { merge: true });
    }

    // 3. Cálculo de vigencia en el servidor
    const elapsedMs = now - trialStartedAt;
    const totalTrialMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;

    if (elapsedMs < totalTrialMs) {
      daysRemaining = Math.max(1, Math.ceil((totalTrialMs - elapsedMs) / (24 * 60 * 60 * 1000)));
      isPro = true;
    } else {
      daysRemaining = 0;
      isPro = false;
    }

    return res.status(200).json({
      success: true,
      isPro,
      daysRemaining,
      subscription: {
        tier: isPro ? 'trial' : 'free',
        status: isPro ? 'active' : 'expired',
        planName: isPro ? `Periodo de Prueba (${daysRemaining} días)` : 'Plan Gratuito'
      }
    });

  } catch (err: any) {
    console.error('Error verificando sesión o trial:', err);
    return res.status(401).json({ 
      error: 'Token inválido o expirado.', 
      details: err?.message 
    });
  }
}