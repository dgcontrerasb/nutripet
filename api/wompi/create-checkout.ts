import type { IncomingMessage, ServerResponse } from 'http';
import { createHash, randomUUID } from 'crypto';
import { getAuth } from 'firebase-admin/auth';
import {
  applyApiCors,
  getBearerToken,
  initializeFirebaseAdmin,
  isFirebaseAuthError
} from '../../server/firebaseAdmin.ts';
import { getAppUrl } from '../../server/paymentProviders.ts';

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

    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!publicKey || !integritySecret || !process.env.APP_URL) {
      return res.status(503).json({ error: 'El pago con Wompi no está configurado.' });
    }

    const amountInCents = planId === 'pro_annual' ? 6_990_000 : 990_000;
    const reference = `NUTRIPET_${user.uid}_${planId}_${randomUUID()}`;
    const signature = createHash('sha256')
      .update(`${reference}${amountInCents}COP${integritySecret}`)
      .digest('hex');
    const redirectUrl = getAppUrl();
    redirectUrl.search = new URLSearchParams({ plan: planId }).toString();

    return res.status(200).json({
      isConfigured: true,
      publicKey,
      amountInCents,
      reference,
      signature,
      redirectUrl: redirectUrl.toString()
    });
  } catch (error) {
    if (isFirebaseAuthError(error)) {
      return res.status(401).json({ error: 'El token de sesión no es válido o expiró.' });
    }
    console.error('Error preparando checkout Wompi:', error);
    return res.status(500).json({ error: 'No se pudo preparar el pago con Wompi.' });
  }
}
