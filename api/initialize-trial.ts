import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Respuesta al preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Responder a peticiones POST (o GET de comprobación)
  if (req.method === 'POST' || req.method === 'GET') {
    return res.status(200).json({
      success: true,
      isPro: true,
      daysRemaining: 15,
      subscription: {
        tier: 'pro',
        status: 'active',
        planName: 'NutriPet Pro'
      }
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
