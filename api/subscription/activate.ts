import type { IncomingMessage, ServerResponse } from 'http';
import { getAuth } from 'firebase-admin/auth';
import {
  initializeFirebaseAdmin,
  applyApiCors,
  getBearerToken,
  isFirebaseAuthError
} from '../../server/firebaseAdmin.ts';
import {
  activateVerifiedPayment,
  PaymentAlreadyProcessedError
} from '../../server/subscriptionPayments.ts';
import { getWompiApiBaseUrl } from '../../server/paymentProviders.ts';

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyApiCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se acepta POST.' });
  }

  try {
    const idToken = getBearerToken(req);
    if (!idToken) {
      return res.status(401).json({ error: 'Se requiere un token de sesión válido.' });
    }

    initializeFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const planId = String(body.planId || '');
    const transactionId = typeof body.wompiTransactionId === 'string'
      ? body.wompiTransactionId.trim()
      : '';

    if (planId !== 'pro_monthly' && planId !== 'pro_annual') {
      return res.status(400).json({ error: 'planId inválido.' });
    }

    if (!/^[A-Za-z0-9_-]{1,128}$/.test(transactionId)) {
      return res.status(400).json({ error: 'Identificador de transacción inválido.' });
    }

    const wompiBaseUrl = getWompiApiBaseUrl();
    const verificationResponse = await fetch(
      `${wompiBaseUrl}/transactions/${encodeURIComponent(transactionId)}`
    );

    if (!verificationResponse.ok) {
      console.error('Wompi transaction verification failed with status:', verificationResponse.status);
      return res.status(502).json({ error: 'No se pudo verificar el pago con Wompi.' });
    }

    const verification = await verificationResponse.json() as {
      data?: {
        status?: string;
        reference?: string;
        amount_in_cents?: number;
        currency?: string;
      };
    };
    const transaction = verification.data;
    const expectedAmount = planId === 'pro_annual' ? 6_990_000 : 990_000;
    const expectedReferencePrefix = `NUTRIPET_${uid}_${planId}_`;

    if (
      transaction?.status !== 'APPROVED' ||
      transaction.currency !== 'COP' ||
      transaction.amount_in_cents !== expectedAmount ||
      typeof transaction.reference !== 'string' ||
      !transaction.reference.startsWith(expectedReferencePrefix)
    ) {
      return res.status(403).json({ error: 'El pago no está aprobado o no corresponde al plan y usuario.' });
    }

    const subscription = await activateVerifiedPayment({
      uid,
      planId,
      provider: 'wompi',
      transactionId,
      amount: expectedAmount,
      currency: 'COP'
    });

    return res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    if (error instanceof PaymentAlreadyProcessedError) {
      return res.status(409).json({ error: 'Esta transacción ya fue procesada por otra cuenta o plan.' });
    }
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }
    console.error('Error activando suscripción Wompi:', error);
    return res.status(500).json({ error: 'No se pudo completar la activación de la suscripción.' });
  }
}
