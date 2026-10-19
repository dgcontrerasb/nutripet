import type { IncomingMessage, ServerResponse } from 'http';
import { getAuth } from 'firebase-admin/auth';
import {
  applyApiCors,
  getBearerToken,
  initializeFirebaseAdmin,
  isFirebaseAuthError
} from '../../server/firebaseAdmin.ts';
import { getPaypalAccessToken } from '../../server/paymentProviders.ts';
import {
  activateVerifiedPayment,
  PaymentAlreadyProcessedError
} from '../../server/subscriptionPayments.ts';

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

const PLAN_IDS = new Set(['pro_monthly', 'pro_annual']);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyApiCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });

  try {
    const idToken = getBearerToken(req);
    if (!idToken) return res.status(401).json({ error: 'Se requiere un token de sesión válido.' });

    initializeFirebaseAdmin();
    const user = await getAuth().verifyIdToken(idToken);
    const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim() : '';
    const planId = typeof req.body?.planId === 'string' ? req.body.planId : '';
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(orderId) || !PLAN_IDS.has(planId)) {
      return res.status(400).json({ error: 'Orden o plan inválido.' });
    }

    const { token, baseUrl } = await getPaypalAccessToken();
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });

    let capture: {
      status?: string;
      purchase_units?: Array<{
        custom_id?: string;
        amount?: { currency_code?: string; value?: string };
        payments?: { captures?: Array<{ id?: string; status?: string; amount?: { currency_code?: string; value?: string } }> };
      }>;
    };
    if (!captureResponse.ok) {
      const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!orderResponse.ok) {
        console.error('PayPal order capture failed with status:', captureResponse.status);
        return res.status(502).json({ error: 'PayPal no pudo confirmar el pago.' });
      }
      capture = await orderResponse.json();
    } else {
      capture = await captureResponse.json();
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const completedCapture = purchaseUnit?.payments?.captures?.find((item) => item.status === 'COMPLETED');
    const expectedAmount = planId === 'pro_annual' ? '19.99' : '2.99';

    if (
      capture.status !== 'COMPLETED' ||
      purchaseUnit?.custom_id !== `${user.uid}:${planId}` ||
      purchaseUnit.amount?.currency_code !== 'USD' ||
      purchaseUnit.amount.value !== expectedAmount ||
      completedCapture?.amount?.currency_code !== 'USD' ||
      completedCapture.amount.value !== expectedAmount ||
      !completedCapture.id
    ) {
      return res.status(403).json({ error: 'La orden no está pagada o no corresponde al usuario y plan.' });
    }

    const subscription = await activateVerifiedPayment({
      uid: user.uid,
      planId: planId as 'pro_monthly' | 'pro_annual',
      provider: 'paypal',
      transactionId: completedCapture.id,
      amount: Math.round(Number(expectedAmount) * 100),
      currency: 'USD'
    });

    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    if (error instanceof PaymentAlreadyProcessedError) {
      return res.status(409).json({ error: 'Esta orden ya fue procesada por otra cuenta o plan.' });
    }
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }
    console.error('Error capturando orden PayPal:', error);
    return res.status(503).json({ error: 'PayPal no está configurado o no está disponible.' });
  }
}
