import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Utiliza POST.' });

  try {
    const { petName, petType, breed, weightKg, ageMonths, diet, question } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: 'La pregunta es obligatoria.' });
    }

    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!geminiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en Vercel.' });
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
4. TONO: Cercano, empático, sin asteriscos ni negritas dobles (**). Usa guiones simples para listas.
5. DESCARGO OBLIGATORIO AL FINAL:
⚠️ Esta información es solo orientativa y educativa. No reemplaza la consulta con un veterinario profesional.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(500).json({ error: `Error Gemini: ${errText}` });
    }

    const data = await apiRes.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    text = text.replace(/\*\*/g, '').replace(/^\s*[\*]\s+/gm, '• ').trim();

    return res.status(200).json({
      answer: text,
      provider: 'Gemini IA'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Error de servidor' });
  }
}
