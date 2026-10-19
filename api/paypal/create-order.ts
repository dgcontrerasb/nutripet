import type { IncomingMessage, ServerResponse } from 'http';
import { getAuth } from 'firebase-admin/auth';
import {
  applyApiCors,
  getBearerToken,
  initializeFirebaseAdmin,
  isFirebaseAuthError
} from '../../server/firebaseAdmin.ts';
import { getAppUrl, getPaypalAccessToken } from '../../server/paymentProviders.ts';

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

const PLAN_IDS: Record<string, 'pro_monthly' | 'pro_annual'> = {
  pro_monthly: 'pro_monthly',
  plan_pro_monthly: 'pro_monthly',
  pro_annual: 'pro_annual',
  plan_pro_annual: 'pro_annual'
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyApiCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });

  try {
    const idToken = getBearerToken(req);
    if (!idToken) return res.status(401).json({ error: 'Se requiere un token de sesión válido.' });

    initializeFirebaseAdmin();
    const user = await getAuth().verifyIdToken(idToken);
    const planId = PLAN_IDS[String(req.body?.planId || '')];
    if (!planId) return res.status(400).json({ error: 'Plan inválido.' });

    const appUrl = getAppUrl();
    const { token, baseUrl } = await getPaypalAccessToken();
    const amount = planId === 'pro_annual' ? '19.99' : '2.99';
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: planId,
          custom_id: `${user.uid}:${planId}`,
          amount: { currency_code: 'USD', value: amount }
        }],
        application_context: {
          return_url: `${appUrl.origin}/?plan=${planId}`,
          cancel_url: `${appUrl.origin}/?payment=cancelled`,
          user_action: 'PAY_NOW'
        }
      })
    });

    if (!response.ok) {
      console.error('PayPal create-order failed with status:', response.status);
      return res.status(502).json({ error: 'PayPal no pudo crear la orden de pago.' });
    }

    const order = await response.json() as {
      id?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };
    const approveUrl = order.links?.find((link) => link.rel === 'approve')?.href;
    if (!order.id || !approveUrl) {
      console.error('PayPal create-order response did not contain an order ID and approval URL.');
      return res.status(502).json({ error: 'PayPal devolvió una orden incompleta.' });
    }

    return res.status(200).json({ orderId: order.id, approveUrl });
  } catch (error) {
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }
    console.error('Error preparando orden PayPal:', error);
    return res.status(503).json({ error: 'PayPal no está configurado o no está disponible.' });
  }
}
