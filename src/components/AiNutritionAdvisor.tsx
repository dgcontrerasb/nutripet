import React, { useState, useRef, useEffect } from 'react';
import { usePets } from '../context/PetContext';
import { auth } from '../lib/firebase';
import { 
  Send, 
  Bot, 
  Crown, 
  RefreshCw, 
  Lock,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProFeatureLock } from './ProFeatureLock';

interface AiNutritionAdvisorProps {
  onOpenSubscriptionModal: () => void;
}

const DAILY_LIMIT = 10;
const ADMIN_EMAIL = 'dgcontrerasb@gmail.com';

const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDailyQueryCount = (uid: string): number => {
  try {
    const today = getLocalDateString();
    const key = `nutripet_ai_queries_${uid}_${today}`;
    const val = localStorage.getItem(key);
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  } catch {
    return 0;
  }
};

const incrementDailyQueryCount = (uid: string): number => {
  try {
    const today = getLocalDateString();
    const key = `nutripet_ai_queries_${uid}_${today}`;
    const current = getDailyQueryCount(uid);
    const updated = current + 1;
    localStorage.setItem(key, String(updated));
    return updated;
  } catch {
    return 1;
  }
};

interface BotKnowledge {
  id: string;
  keywords: string[];
  title: string;
  chipLabel: string;
  answer: string;
  category: string;
}

const normalizeText = (text: string = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Base de Datos Veterinaria de Nutrición y Primeros Auxilios (Consulta y Respaldo)
const BOT_KNOWLEDGE_BASE: BotKnowledge[] = [
  {
    id: 'toxic-foods',
    category: '⚠️ Alertas',
    chipLabel: '🚨 Alimentos Prohibidos',
    keywords: ['toxic', 'toxico', 'toxica', 'prohibid', 'venen', 'mortal', 'chocolate', 'cebolla', 'ajo', 'uva', 'pasa', 'aguacate', 'cafe', 'alcohol', 'remedio', 'ibuprofeno', 'acetaminofen', 'paracetamol', 'peligroso', 'matar', 'perjudicial', 'danino', 'dañino'],
    title: 'Alimentos Altamente Tóxicos y Prohibidos',
    answer: `🚨 Alimentos y Sustancias Prohibidas para Mascotas

Para garantizar la vida y salud de tu mascota, evita por completo el contacto con estos ingredientes comunes en casa:

• Chocolate y Cacao: Contienen teobromina, sustancia que los perros y gatos no pueden metabolizar. Causa taquicardias, convulsiones y puede ser mortal.
• Cebolla, Ajo y Puerros: Contienen tiosulfato, compuesto que destruye los glóbulos rojos provocando anemia hemolítica severa.
• Uvas y Pasas: Incluso en cantidades mínimas provocan una falla renal aguda e irreversible en pocas horas.
• Medicamentos Humanos: El acetaminofén/paracetamol, ibuprofeno, aspirina o diclofenaco causan intoxicación fulminante y falla hepática irreversible.
• Aguacate / Palta: Contiene persina, tóxica para perros y gatos que genera vómitos y diarreas graves.
• Xilitol (Edulcorante): Presente en chicles o cremas de maní sin azúcar. Causa hipoglucemia severa y colapso hepático.`
  },
  {
    id: 'safe-snacks',
    category: '🍎 Snacks',
    chipLabel: '🍎 Snacks Seguros',
    keywords: ['manzana', 'platano', 'banana', 'banano', 'fruta', 'verdura', 'zanahoria', 'calabaza', 'auyama', 'snack', 'premio', 'saludable', 'pera', 'fresa', 'melon', 'sandia', 'arandano', 'arandanos', 'comer', 'darle'],
    title: 'Frutas y Verduras Seguras (Snacks Saludables)',
    answer: `🥦 Snacks Naturales y Seguros de Frutas y Verduras

Puedes ofrecer estas opciones saludables en porciones moderadas (máximo el 10% de su ingesta calórica diaria total):

• Zanahoria (Cocida o Cruda): Excelente fuente de fibra, vitamina A y ayuda a limpiar mecánicamente el sarro dental.
• Calabaza o Auyama (Cocida y sin sal): Maravillosa para regular el tránsito intestinal. Ayuda tanto con el estreñimiento como con la diarrea leve.
• Manzana o Pera (Sin semillas): Ricas en fibra y agua. IMPORTANTE: Retira siempre el corazón y las semillas, ya que contienen cianuro y son tóxicas.
• Arándanos y Fresas: Potentes antioxidantes naturales que refuerzan el sistema inmune. Ideales para mascotas senior.
• Plátano o Banano: Rico en potasio, pero utilízalo con moderación por su alta cantidad de azúcares naturales.`
  },
  {
    id: 'diarrhea-vomiting',
    category: '🩺 Emergencias',
    chipLabel: '🤢 Vómitos o Diarrea',
    keywords: ['diarrea', 'vomit', 'vomito', 'vomitos', 'enferm', 'daño', 'estomag', 'estomago', 'blando', 'empach', 'hervid', 'popo', 'sangre', 'decaido', 'triste', 'flojo', 'soltura'],
    title: '¿Qué hacer ante Vómitos o Diarrea leve?',
    answer: `🩺 Guía de Emergencia Estomacal (Vómito y Diarrea)

Si tu mascota presenta problemas digestivos aislados pero está activa (sin letargia extrema ni sangre), sigue estas pautas de soporte inicial:

• Ayuno de Sólidos: Suspende la comida sólida por 12 horas para permitir que el estómago descanse. No restrinjas el acceso al agua fresca para evitar la deshidratación.
• Dieta Blanda de Recuperación: Transcurridas las 12 horas, ofrece porciones pequeñas de pollo hervido (pechuga, sin piel, sin huesos, sin sal ni condimentos) mezclado con puré de calabaza o auyama hervida.
• Hidratación Constante: Ofrece agua fresca en pequeñas dosis constantes.
• ⚠️ CUÁNDO IR URGENTE AL VETERINARIO: Si hay presencia de sangre en el vómito o las heces, si está decaída o si los vómitos continúan a pesar del ayuno.`
  },
  {
    id: 'water-hydration',
    category: '💧 Hidratación',
    chipLabel: '💧 Consumo de Agua',
    keywords: ['agua', 'hidrat', 'hidratacion', 'toma', 'bebe', 'liquido', 'sed', 'deshidrat', 'orina', 'recipiente', 'hidratar', 'bebedero'],
    title: '¿Cuánta agua debe tomar tu mascota al día?',
    answer: `💧 Guía de Hidratación Diaria para Perros y Gatos

El agua es fundamental para el filtrado renal y la termorregulación de tu mascota:

• Pauta General: Una mascota sana debe consumir aproximadamente entre 50 ml y 70 ml de agua por cada kilogramo de peso corporal al día.
• Ejemplo Práctico: Si tu mascota pesa 10 kg, su consumo de agua ideal debe rondar entre 500 ml (medio litro) y 700 ml diarios.
• Variación: Las mascotas que comen croquetas secas necesitan beber más agua porque el concentrado solo tiene un 10% de humedad. En climas cálidos o tras ejercicio intenso, la demanda hídrica aumenta.`
  },
  {
    id: 'food-transition',
    category: '🔄 Transición',
    chipLabel: '🔄 Transición de Alimento',
    keywords: ['transic', 'transicion', 'cambio', 'marca', 'comida', 'mezclar', 'croqueta', 'pienso', 'cambiar', 'nuevo', 'antiguo'],
    title: 'Cómo hacer una Transición Gradual de Alimento',
    answer: `🔄 Cronograma de Transición Gradual de Alimentos

Un cambio repentino de marca o tipo de comida daña la flora intestinal de tu mascota, causando diarreas y malestar. Sigue este protocolo de 7 a 10 días:

• Días 1 y 2: Mezcla 75% del alimento anterior con 25% del alimento nuevo.
• Días 3 y 4: Mezcla 50% del alimento anterior con 50% del alimento nuevo.
• Días 5 y 6: Mezcla 25% del alimento anterior con 75% del alimento nuevo.
• Día 7 en adelante: Ofrece 100% de la porción del alimento nuevo.

💡 Consejo: Durante los días de cambio, puedes agregar una cucharadita de puré de calabaza cocida para estabilizar su digestión.`
  },
  {
    id: 'barf-raw',
    category: '🥩 Dieta BARF',
    chipLabel: '🥩 Dieta BARF',
    keywords: ['barf', 'comida cruda', 'cruda', 'crudo', 'carne', 'natural', 'caser', 'casera', 'recet', 'receta', 'organo', 'hueso', 'huesos'],
    title: 'Dieta BARF / Comida Cruda y Casera',
    answer: `🥩 ¿Es recomendable la Dieta BARF o Alimentación Cruda?

La dieta BARF consiste en ofrecer alimentos crudos biológicamente apropiados. Ofrece ventajas pero requiere absoluta responsabilidad:

Beneficios Clave:
• Dientes limpios de sarro y mejor aliento.
• Pelaje más brillante y reducción del olor corporal.

⚠️ Riesgos Críticos:
• Contaminación bacteriana: La carne cruda puede portar patógenos como Salmonella o E. coli.
• Desbalances clínicos: Diseñar comida casera sin formulación veterinaria suele provocar deficiencias graves de calcio o taurina.
• Huesos cocidos prohibidos: NUNCA ofrezcas huesos cocidos porque se astillan y provocan perforaciones gástricas fatales.`
  },
  {
    id: 'portion-frequency',
    category: '🥣 Ración',
    chipLabel: '🥣 Porciones y Ración',
    keywords: ['cantidad', 'gramos', 'porcion', 'porciones', 'caloria', 'calorias', 'cuanto darle', 'racion', 'raciones', 'cuantas veces', 'por dia', 'diari', 'diario', 'frecuencia', 'comida'],
    title: 'Porciones, Calorías y Frecuencia de Comida',
    answer: `🥣 Guía Básica de Ración y Frecuencia de Alimento

La ración diaria ideal depende del nivel de actividad física de la mascota, pero la frecuencia sugerida según su edad es:

• Cachorros y Gatitos (Hasta los 6 meses): Alimentar de 3 a 4 veces al día en porciones reducidas.
• Adultos (De 1 a 7 años): Alimentar 2 veces al día (mañana y noche) para mantener la glucosa estable y evitar sobrecarga gástrica.
• Mascotas Senior (Más de 7 años): Alimentar 2 veces al día con alimentos ricos en fibra y protectores articulares.`
  },
  {
    id: 'appetite-loss',
    category: '🍲 Apetito',
    chipLabel: '🍲 Falta de Apetito',
    keywords: ['apetito', 'inapetenc', 'inapetencia', 'no come', 'no quiere comer', 'desgana', 'desganado', 'comer', 'anorexia', 'dejo de comer', 'caldo', 'estimular'],
    title: 'Falta de Apetito e Inapetencia (Cómo estimular)',
    answer: `🍲 Guía ante la Pérdida de Apetito o Inapetencia

Si tu mascota rechaza su comida habitual pero está activa y no presenta vómitos ni decaimiento severo, puedes estimular su olfato e interés:

• Caldo de Huesos Casero (Tibio): Prepara caldo de pollo o res cocido únicamente con agua (ESTRICTAMENTE SIN sal, cebolla, ajo ni condimentos). Añade 2 o 3 cucharadas tibias sobre su comida para liberar aromas que estimulan su apetito.
• Entibiar el Alimento: Calentar unos segundos su comida húmeda o humedecer las croquetas con agua tibia intensifica el olor natural y la palatabilidad.
• Regla de los 20 Minutos: Sirve el plato y retíralo tras 20 minutos si no come. No dejes comida servida todo el día, ya que pierde frescura y genera desinterés.
• ⚠️ ALERTA VETERINARIA: Si un perro pasa más de 24 horas o un gato más de 12 horas sin ingerir alimento (los gatos tienen alto riesgo de lipidosis hepática), acude de urgencia al veterinario.`
  },
  {
    id: 'weight-management',
    category: '⚖️ Control de Peso',
    chipLabel: '⚖️ Control de Peso',
    keywords: ['sobrepeso', 'obes', 'obesidad', 'gordo', 'adelgazar', 'bajar de peso', 'dieta', 'esterilizad', 'esterilizado', 'castrad', 'castrado', 'kilos', 'fibra', 'saciedad'],
    title: 'Sobrepeso, Esterilización y Saciedad Saludable',
    answer: `⚖️ Plan de Manejo de Peso y Reducción Calórica

El sobrepeso reduce la esperanza de vida hasta 2 años y desgasta las articulaciones. Claves para un control seguro:

• Reducción Gradual: Nunca reduzcas drásticamente la comida. Disminuye la ración calórica entre un 10% y 15% respecto a su mantenimiento y pésalo semanalmente.
• Saciedad con Verduras Bajas en Calorías: Para calmar la ansiedad por comer, agrega a su plato calabaza cocida al vapor o judías verdes/ejotes hervidos sin sal. Aportan volumen y fibra con casi cero calorías.
• Mascotas Esterilizadas: La castración reduce el metabolismo basal entre un 20% y 30%. Ajusta la calculadora a condición 'Esterilizado' para obtener los gramos exactos.
• Ejercicio Progresivo: Paseos diarios controlados y juegos interactivos para quemar energía sin sobrecargar sus articulaciones.`
  },
  {
    id: 'omega-supplements',
    category: '🐟 Suplementos Omega',
    chipLabel: '🐟 Omega 3 & Articulaciones',
    keywords: ['omega', 'aceite de salmon', 'salmon', 'pelo', 'brillo', 'articulac', 'articulaciones', 'inflamac', 'inflamacion', 'dermatitis', 'piel', 'suplemento', 'capsula', 'pescado'],
    title: 'Omega 3, Aceite de Salmón y Cuidado Articular',
    answer: `🐟 Beneficios y Dosificación de Ácidos Grasos Omega 3 (EPA y DHA)

Los ácidos grasos Omega 3 son esenciales y el organismo de perros y gatos no puede fabricarlos por sí mismo:

Beneficios Clave:
• Salud de Piel y Pelaje: Reduce la picazón, la caspa y combate la dermatitis alérgica, otorgando un brillo sedoso.
• Potente Antiinflamatorio Articular: Alivia dolores en mascotas con displasia de cadera o artritis.
• Soporte Renal y Cardiovascular: Protege la función de los riñones y retrasa el avance de insuficiencias.
• Fuentes Recomendadas: Aceite de salmón salvaje o sardinas en agua bajas en sodio (nunca en aceite vegetal).
• Conservación: Guárdalo siempre en botella oscura en el refrigerador; los omegas se oxidan fácilmente con la luz y el calor perdiendo sus propiedades.`
  },
  {
    id: 'gas-flatulence',
    category: '💨 Digestión y Gases',
    chipLabel: '💨 Gases y Digestión',
    keywords: ['gas', 'gases', 'flatulenc', 'flatulencia', 'flatulencias', 'pedo', 'olor', 'eruct', 'eructo', 'come rapido', 'voraz', 'traga', 'plato lento', 'digest', 'digestion'],
    title: 'Gases, Flatulencias y Digestión Rápida',
    answer: `💨 Causas y Soluciones para Gases y Flatulencias

Las flatulencias excesivas suelen deberse a dos factores principales: aerofagia (tragar aire) o fermentación intestinal indebida:

• Comedores Voraces: Si tu perro o gato devora la comida en segundos, traga grandes cantidades de aire. Solución: Utiliza un plato de alimentación lenta (con laberintos o relieves) o divide la ración en 3 o 4 tomas pequeñas al día.
• Ingredientes de Mala Calidad: Alimentos con alto contenido de subproductos, legumbres mal procesadas o soja fermentan en el colon generando gas metano y mal olor. Considera cambiar a una fórmula con carne real como primer ingrediente.
• Intolerancias Lácteas: Los perros y gatos adultos carecen de enzima lactasa. Evita darles leche, queso o sobras humanas.
• Alerta de Torsión Gástrica: Si notas el abdomen duro e hinchado, intentos de vomitar sin éxito y quejidos, acude de INMEDIATO a urgencias.`
  },
  {
    id: 'wet-food-hydration',
    category: '🥫 Alimento Húmedo',
    chipLabel: '🥫 Comida Húmeda',
    keywords: ['humeda', 'humedo', 'lata', 'latas', 'sobre', 'sobres', 'pouch', 'pate', 'paté', 'mix-feeding', 'mixta', 'renal', 'rinon', 'riñon', 'gato agua', 'orina', 'concentrado'],
    title: 'Comida Húmeda, Mix-Feeding y Salud Renal',
    answer: `🥫 Importancia de la Comida Húmeda y Dieta Mixta

El alimento húmedo (latas o sobres de calidad) no es una golosina, es un elemento preventivo de salud:

• 75% a 80% de Humedad: A diferencia de las croquetas secas (solo 10% de agua), las latas aportan hidratación biológica directa.
• Esencial para Gatos: Los felinos descienden de animales desérticos y tienen baja sensación de sed. La comida húmeda previene la formación de cristales urinarios, cistitis idiopática e insuficiencia renal crónica.
• Mix-Feeding (Alimentación Mixta): Puedes sustituir un porcentaje de croquetas por comida húmeda de igual calidad. Ajusta la báscula: 100g de croquetas equivalen en calorías aproximadamente a 350-400g de comida húmeda.
• Conservación: Una vez abierta la lata, tápala herméticamente y consérvala en el refrigerador por un máximo de 48 a 72 horas.`
  }
];

interface QuickQuestion {
  icon: string;
  title: string;
  query: string;
}

const quickQuestions: QuickQuestion[] = BOT_KNOWLEDGE_BASE.map(entry => {
  const parts = entry.chipLabel.trim().split(' ');
  const icon = parts[0] || '🐾';
  const title = parts.slice(1).join(' ') || entry.chipLabel;
  return {
    icon,
    title,
    query: entry.id
  };
});

export const AiNutritionAdvisor: React.FC<AiNutritionAdvisorProps> = ({ onOpenSubscriptionModal }) => {
  const { activePet, isProOrTrial, user } = usePets();
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const petName = activePet?.name?.trim() || 'tu mascota';
  const isAdmin = Boolean(user?.email && user.email.toLowerCase().trim() === ADMIN_EMAIL);

  const [dailyQueries, setDailyQueries] = useState<number>(() => {
    return user?.uid ? getDailyQueryCount(user.uid) : 0;
  });

  useEffect(() => {
    if (user?.uid) {
      setDailyQueries(getDailyQueryCount(user.uid));
    } else {
      setDailyQueries(0);
    }
  }, [user?.uid]);

  const isLimitReached = !isAdmin && dailyQueries >= DAILY_LIMIT;

  // 1 & 3. Experiencia unificada sin pestañas técnicas y bienvenida amigable
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu Asesor Nutricional para ${petName}. Puedes hacerme cualquier pregunta abierta o elegir uno de los temas sugeridos abajo para comenzar.`
    }
  ]);

  const isPro = isProOrTrial;
  const messages = conversation;

  // Auto-scroll suave cuando cambie messages o loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const scrollChips = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleSelectQuestion = (query: string) => {
    const topic = BOT_KNOWLEDGE_BASE.find(t => t.id === query || t.title === query || t.chipLabel === query);
    if (topic) {
      handleTopicClick(topic.id);
    } else {
      setQuestion(query);
    }
  };

  // Consulta de contingencia a la base de datos local
  const queryLocalKnowledgeBase = (userMessage: string): string => {
    const cleanMessage = normalizeText(userMessage.trim());
    
    let bestMatch: BotKnowledge | null = null;
    let maxMatches = 0;

    for (const entry of BOT_KNOWLEDGE_BASE) {
      let matches = 0;
      for (const rawKeyword of entry.keywords) {
        const keyword = normalizeText(rawKeyword);
        if (cleanMessage.includes(keyword)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    if (bestMatch && maxMatches > 0) {
      return `Guía: ${bestMatch.title}

${bestMatch.answer}

---
⚠️ Aviso: Esta información es de orientación general. Ante emergencias médicas, consulta presencialmente a un veterinario.`;
    }

    // 3. Respuesta amigable sin jerga técnica cuando no hay coincidencia
    return `🔍 No logré identificar una respuesta exacta para esa consulta en mi guía rápida.

Puedes probar reformulando tu pregunta con otras palabras, o elegir uno de los temas sugeridos abajo para consultar las recomendaciones oficiales.`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
      onOpenSubscriptionModal();
      return;
    }

    if (!user) {
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '🔒 Para consultar al Asesor Nutricional con IA, por favor inicia sesión con tu cuenta de Google.' 
        }
      ]);
      return;
    }

    // Validación de límite diario de cortesía
    if (!isAdmin && dailyQueries >= DAILY_LIMIT) {
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⏳ Has alcanzado el límite de ${DAILY_LIMIT} consultas diarias con IA para hoy. Tu cuota se renovará automáticamente a medianoche. Mientras tanto, puedes explorar los temas rápidos sugeridos sin restricciones.`
        }
      ]);
      return;
    }

    if (!question.trim() || loading || !activePet) return;

    const userMessage = question.trim();
    setQuestion('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // 1. Intenta primero consultar la IA con el token de Firebase y, en caso de fallo, usa en silencio la base local como respaldo
    try {
      const token = user ? await user.getIdToken() : '';
      if (!token) {
        setConversation(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: '🔒 Para consultar al Asesor Nutricional con IA, por favor inicia sesión con tu cuenta de Google.' 
          }
        ]);
        setLoading(false);
        return;
      }

      console.log("🚀 Enviando consulta a /api/ai/nutrition-advisor:", userMessage);

      let res = await fetch('/api/ai/nutrition-advisor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          petName: activePet.name,
          petType: activePet.type,
          breed: activePet.breedId,
          weightKg: activePet.weightKg,
          ageMonths: activePet.ageMonths,
          diet: activePet.diet,
          question: userMessage,
          isPro
        })
      });

      // Si el token expiró, reintentar con token forzado
      if (res.status === 401) {
        const freshToken = user ? await user.getIdToken(true) : '';
        if (freshToken) {
          res = await fetch('/api/ai/nutrition-advisor', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${freshToken}`
            },
            body: JSON.stringify({
              petName: activePet.name,
              petType: activePet.type,
              breed: activePet.breedId,
              weightKg: activePet.weightKg,
              ageMonths: activePet.ageMonths,
              diet: activePet.diet,
              question: userMessage,
              isPro
            })
          });
        }
      }

      if (res.status === 404) {
        setConversation(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: '⚠️ No se pudo conectar con el endpoint /api/ai/nutrition-advisor (Error 404 en Vercel). Verifica el despliegue de la función serverless.' 
          }
        ]);
        return;
      }

      if (res.status === 403) {
        onOpenSubscriptionModal();
        setConversation(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: '🔒 Para realizar consultas personalizadas al Asistente Nutricional, activa tu suscripción NutriPet Pro.' 
          }
        ]);
        return;
      }

      if (!res.ok) {
        console.error("❌ Error HTTP en API:", res.status, res.statusText);
        const fallbackReply = queryLocalKnowledgeBase(userMessage);
        setConversation(prev => [...prev, { role: 'assistant', content: fallbackReply }]);
        return;
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error("❌ Error HTTP en API:", res.status, res.statusText, "Formato recibido no es JSON:", contentType);
        throw new Error('Formato inválido.');
      }

      const data = await res.json();
      
      if (data.error) {
        console.error("❌ Error en datos de API:", res.status, data.error);
        const fallbackReply = queryLocalKnowledgeBase(userMessage);
        setConversation(prev => [...prev, { role: 'assistant', content: fallbackReply }]);
        return;
      }

      const reply = data.answer || 'No se pudo generar respuesta en este momento.';
      setConversation(prev => [...prev, { role: 'assistant', content: reply }]);

      // Solo si la respuesta del backend es exitosa (200 OK y trae answer), incrementa el contador
      if (res.ok && data.answer && user?.uid && !isAdmin) {
        const newCount = incrementDailyQueryCount(user.uid);
        setDailyQueries(newCount);
      }
    } catch (error: any) {
      console.error("Error en llamada AI Advisor:", error);
      // Contingencia transparente y silenciosa
      const fallbackReply = queryLocalKnowledgeBase(userMessage);
      setConversation(prev => [...prev, { role: 'assistant', content: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (!isPro) {
      onOpenSubscriptionModal();
      return;
    }
    const topic = BOT_KNOWLEDGE_BASE.find(t => t.id === topicId);
    if (!topic) return;

    setConversation(prev => [
      ...prev,
      { role: 'user', content: topic.title },
      { 
        role: 'assistant', 
        content: `Guía: ${topic.title}

${topic.answer}

---
⚠️ Aviso: Esta información es de orientación general. Ante emergencias médicas, consulta presencialmente a un veterinario.` 
      }
    ]);
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl border border-emerald-100/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 relative flex flex-col">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight">
                Asesor Nutricional Inteligente
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-emerald-200/40 dark:border-emerald-800">
                IA Clínica
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-black tracking-wide border border-amber-300 dark:border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Ilimitado Propietario
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                  isLimitReached
                    ? 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}>
                  <Clock className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                  Consultas hoy: {dailyQueries}/{DAILY_LIMIT}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Respuestas instantáneas y personalizadas para {petName}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
            isPro
              ? 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white border-amber-400/50 shadow-md shadow-amber-950/20'
          }`}
        >
          {isPro ? (
            <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse-subtle" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-100" />
          )}
          <span>{isPro ? 'NutriPet Pro Activo' : 'Desbloquear con Plan Pro'}</span>
        </button>
      </div>

      {!isPro ? (
        <ProFeatureLock
          featureName="Asesor Nutricional Inteligente"
          description={`Obtén acceso ilimitado a consultas abiertas sobre dietas, ingredientes y salud preventiva para ${petName}.`}
          benefits={[
            "Consultas ilimitadas sobre nutrición e ingredientes",
            "Integración clínica personalizada según peso y edad",
            "Respuestas instantáneas con respaldo veterinario continuo"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      ) : (
        <>
          {/* 1. Contenedor de Mensajes de Conversación con Auto-scroll suave */}
          <div className="bg-emerald-50/15 dark:bg-stone-950/40 border border-emerald-100/70 dark:border-stone-800 rounded-2xl p-4 sm:p-5 max-h-[50vh] sm:max-h-[520px] overflow-y-auto space-y-4 pr-1 shadow-inner">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-none shadow-md border border-emerald-500/20'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-emerald-100/60 dark:border-stone-700 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[11px] sm:text-xs markdown-chat-content">
                    {msg.content.split('\n').map((rawLine, lIdx) => {
                      const cleanLine = rawLine
                        .replace(/\*\*/g, '')
                        .replace(/\*/g, '')
                        .trim();

                      if (!cleanLine) {
                        return <div key={lIdx} className="h-1.5" />;
                      }

                      // Encabezados o títulos
                      if (
                        rawLine.startsWith('### ') || 
                        rawLine.startsWith('## ') || 
                        cleanLine.startsWith('Guía:') || 
                        cleanLine.startsWith('🚨') || 
                        cleanLine.startsWith('🥦') || 
                        cleanLine.startsWith('🩺') || 
                        cleanLine.startsWith('💧') || 
                        cleanLine.startsWith('🔄') || 
                        cleanLine.startsWith('🥩') || 
                        cleanLine.startsWith('🥣') || 
                        cleanLine.startsWith('🍲') || 
                        cleanLine.startsWith('⚖️') || 
                        cleanLine.startsWith('🐟') || 
                        cleanLine.startsWith('💨') || 
                        cleanLine.startsWith('🥫') || 
                        cleanLine.startsWith('🔍')
                      ) {
                        const titleText = cleanLine.replace(/^###\s*|^##\s*/, '');
                        return (
                          <h4 key={lIdx} className="font-heading font-black text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm mt-2.5 mb-1 first:mt-0">
                            {titleText}
                          </h4>
                        );
                      }

                      // Viñetas o listas
                      if (
                        rawLine.trim().startsWith('•') || 
                        rawLine.trim().startsWith('-') || 
                        rawLine.trim().startsWith('*') || 
                        /^\d+[\.\)]\s/.test(rawLine.trim())
                      ) {
                        const itemText = cleanLine.replace(/^[•\-\*]\s*|^\d+[\.\)]\s*/, '');
                        return (
                          <div key={lIdx} className="flex items-start gap-2 py-0.5 text-stone-700 dark:text-stone-300 pl-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{itemText}</span>
                          </div>
                        );
                      }

                      // Párrafos regulares sin asteriscos
                      return (
                        <p key={lIdx} className="text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                          {cleanLine}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center text-stone-500 dark:text-stone-400 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 animate-bounce" />
                </div>
                <span className="flex items-center gap-2 italic text-emerald-700 dark:text-emerald-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  Analizando consulta nutricional...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Banner Informativo cuando se alcanza el límite diario */}
          {isLimitReached && (
            <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-xs">Has alcanzado tu límite de 10 consultas de hoy</p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Has utilizado tus 10 preguntas de IA de hoy para el bienestar de {petName}. Tu cuota diaria se renovará automáticamente esta medianoche. Recuerda que aún puedes consultar los temas rápidos sugeridos abajo sin restricciones.
                </p>
              </div>
            </div>
          )}

          {/* 2. Caja de Texto (Formulario de Entrada) */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder={
                isLimitReached
                  ? "Has alcanzado el límite de 10 consultas de hoy (se renueva a medianoche)"
                  : `Pregunta algo sobre nutrición, ingredientes o cuidados de ${petName}...`
              }
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading || isLimitReached}
              className="flex-1 px-4 py-3 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 placeholder-stone-400 dark:placeholder-stone-500 transition-all shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !question.trim() || isLimitReached}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preguntar</span>
            </button>
          </form>

          {/* 3. Carrusel Horizontal Compacto de Temas Rápidos */}
          <div className="relative flex items-center group pt-2 pb-1">
            {/* Flecha Izquierda (PC) */}
            <button
              type="button"
              onClick={() => scrollChips('left')}
              className="hidden sm:flex absolute -left-2 z-10 w-6 h-6 items-center justify-center rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
              title="Temas anteriores"
            >
              <ChevronLeft className="w-3.5 h-3.5"/>
            </button>

            {/* Fila deslizable */}
            <div
              ref={scrollContainerRef}
              onWheel={(e) => {
                if (scrollContainerRef.current && e.deltaY !== 0) {
                  scrollContainerRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 sm:px-5 scrollbar-none snap-x touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {quickQuestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuestion(item.query)}
                  className="shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-emerald-50 dark:bg-stone-800 dark:hover:bg-emerald-950/60 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-400 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            {/* Flecha Derecha (PC) */}
            <button
              type="button"
              onClick={() => scrollChips('right')}
              className="hidden sm:flex absolute -right-2 z-10 w-6 h-6 items-center justify-center rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
              title="Más temas"
            >
              <ChevronRight className="w-3.5 h-3.5"/>
            </button>
          </div>

          {/* 4. Microtexto del límite diario de consultas y descargo legal informativo */}
          <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center">
            Tu plan incluye 10 consultas diarias de IA en tiempo real. Se renuevan automáticamente cada medianoche.
          </p>

          {/* Descargo de Responsabilidad Sutil */}
          <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center leading-normal">
            ⚠️ <em>El asesor provee orientación informativa basada en nutrición veterinaria. Para emergencias o diagnósticos médicos, consulta presencialmente con un veterinario.</em>
          </p>
        </>
      )}

    </div>
  );
};
