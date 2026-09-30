import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });
  }

  try {
    const { petName, petType, breed, weightKg, ageMonths, diet, question } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: 'La pregunta es obligatoria.' });
    }

    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    if (!groqKey || groqKey.includes('YOUR') || groqKey === 'undefined') {
      return res.status(500).json({
        error: 'GROQ_API_KEY no encontrada en las variables de entorno de Vercel.'
      });
    }

    const prompt = `Actúa como un Asistente Nutricional IA informativo para perros y gatos.

DATOS DE LA MASCOTA:
- Nombre: ${petName || 'Mascota'}
- Especie: ${petType === 'dog' ? 'Perro' : 'Gato'}
- Raza: ${breed || 'Criollo / Mestizo'}
- Peso: ${weightKg || 'N/A'} kg
- Edad: ${ageMonths || 'N/A'} meses
- Dieta: ${diet || 'Comercial'}

PREGUNTA DEL USUARIO: "${question}"

INSTRUCCIONES IMPORTANTES:
1. ALCANCE INFORMATIVO ÚNICAMENTE: Información general sobre nutrición y cuidados básicos. NUNCA sustituye a un veterinario profesional.
2. NO PROPORCIONES INFORMACIÓN SOBRE MEDICAMENTOS: Si la consulta es sobre fármacos o dosis médicas, indica claramente que no puedes brindar dosis y recomienda acudir presencialmente al veterinario.
3. SIGNOS DE ALARMA: Si hay síntomas críticos (vómitos reiterados, sangre, letargia extrema), indica acudir de urgencia a una clínica veterinaria.
4. TONO: Cercano, empático, sin asteriscos ni negritas dobles (**). Usa guiones o viñetas simples para listas.
5. DESCARGO OBLIGATORIO AL FINAL:
"⚠️ Esta información es solo orientativa y educativa. No reemplaza la consulta con un veterinario profesional."`;

    let groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    // En caso de saturación o límite de peticiones (429/503), reintentar con el modelo de alta velocidad llama-3.1-8b-instant
    if (!groqRes.ok && (groqRes.status === 429 || groqRes.status === 503)) {
      console.warn('Groq 70B ocupado o rate limit, reintentando con llama-3.1-8b-instant...');
      groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Error Groq en Vercel:', groqRes.status, errText);
      return res.status(groqRes.status).json({ error: `Error Groq: ${errText}` });
    }

    const groqData = await groqRes.json();
    let answerText = groqData.choices?.[0]?.message?.content || '';

    answerText = answerText
      .replace(/\*\*/g, '')
      .replace(/^\s*[\*]\s+/gm, '• ')
      .replace(/\*/g, '')
      .trim();

    return res.status(200).json({
      answer: answerText,
      provider: 'Groq IA',
    });
  } catch (error: any) {
    console.error('Error en Serverless Function:', error);
    return res.status(500).json({ error: error?.message || 'Error interno del servidor' });
  }
}
