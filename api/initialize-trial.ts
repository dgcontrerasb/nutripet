import type { IncomingMessage, ServerResponse } from 'http';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  applyApiCors,
  getBearerToken,
  initializeFirebaseAdmin,
  isFirebaseAuthError
} from '../server/firebaseAdmin.ts';
import { getOrCreateTrialStart } from '../server/trialState.ts';

type ApiRequest = IncomingMessage & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status: (code: number) => {
    json: (data: any) => any;
    end: () => any;
  };
};

const TRIAL_DAYS = 15;

function toTimestamp(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === 'function') {
      const parsed = toMillis.call(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
  }
  return null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyApiCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
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
    const { uid } = decodedToken;
    const verifiedEmail = decodedToken.email_verified && typeof decodedToken.email === 'string'
      ? decodedToken.email
      : null;
    const firestore = getFirestore();
    const userRef = firestore.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};
    const storedSubscription = userData.subscription || {};
    const storedTier = storedSubscription.tier;
    const now = Date.now();
    const rawTrialStartedAt = toTimestamp(userData.trialStartedAt);
    const trustedTrialStartedAt = rawTrialStartedAt !== null && rawTrialStartedAt <= now
      ? rawTrialStartedAt
      : null;
    const preferredTrialStart = trustedTrialStartedAt ??
      toTimestamp(storedSubscription.activatedAt);
    const trialStartedAt = await getOrCreateTrialStart(uid, verifiedEmail, preferredTrialStart);
    const needsProfileTrialSync = trustedTrialStartedAt !== trialStartedAt;
    const paidUntil = Date.parse(storedSubscription.validUntil || '');
    const isPaidSubscription = (storedTier === 'pro_monthly' || storedTier === 'pro_annual') &&
      storedSubscription.status === 'active';
    const isPaidTier = isPaidSubscription &&
      Number.isFinite(paidUntil) &&
      paidUntil > Date.now() &&
      storedSubscription.paymentVerified === true &&
      (storedSubscription.paymentProvider === 'wompi' || storedSubscription.paymentProvider === 'paypal') &&
      typeof storedSubscription.transactionId === 'string';

    if (isPaidTier) {
      const paymentId = `${storedSubscription.paymentProvider}_${storedSubscription.transactionId}`;
      const paymentSnap = await firestore.collection('processed_payments').doc(paymentId).get();
      const payment = paymentSnap.data();
      const isVerifiedPayment = paymentSnap.exists &&
        payment?.verified === true &&
        payment?.userId === uid &&
        payment?.planId === storedTier &&
        payment?.provider === storedSubscription.paymentProvider &&
        payment?.transactionId === storedSubscription.transactionId;

      if (isVerifiedPayment) {
        if (needsProfileTrialSync) {
          await userRef.set({
            trialStartedAt,
            updatedAt: now
          }, { merge: true });
        }

        return res.status(200).json({
          success: true,
          isPro: true,
          daysRemaining: Math.ceil((paidUntil - Date.now()) / (24 * 60 * 60 * 1000)),
          subscription: storedSubscription
        });
      }
    }

    const totalTrialMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const remainingMs = totalTrialMs - Math.max(0, now - trialStartedAt);
    const legacyProState = isPaidSubscription ||
      (userData.isPro === true && storedTier !== 'trial');

    if (remainingMs <= 0) {
      const freeSubscription = {
        tier: 'free',
        status: 'active',
        planName: 'Plan Gratuito'
      };

      if (
        !userSnap.exists ||
        needsProfileTrialSync ||
        legacyProState ||
        storedTier !== 'free' ||
        userData.isPro === true
      ) {
        await userRef.set({
          isPro: false,
          trialStartedAt,
          subscription: freeSubscription,
          updatedAt: now
        }, { merge: true });
      }

      return res.status(200).json({
        success: true,
        isPro: false,
        daysRemaining: 0,
        subscription: freeSubscription
      });
    }

    const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    const trialSubscription = {
      tier: 'trial',
      status: 'active',
      planName: 'Periodo de Prueba',
      trialStartedAt,
      validUntil: new Date(trialStartedAt + totalTrialMs).toISOString()
    };

    if (!userSnap.exists || needsProfileTrialSync || legacyProState) {
      await userRef.set({
        isPro: true,
        trialStartedAt,
        subscription: trialSubscription,
        updatedAt: now
      }, { merge: true });
    }

    return res.status(200).json({
      success: true,
      isPro: true,
      daysRemaining,
      trialStartedAt,
      subscription: trialSubscription
    });
  } catch (error) {
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }

    console.error('Error al consultar el trial:', error);
    return res.status(500).json({ error: 'No se pudo consultar el estado de la suscripción.' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
