import { PetProfile, WeightLog, MedicalRecord, Reminder } from '../types';

export interface DemoRoutineItem {
  id: string;
  time: string;
  activity: string;
  notes: string;
  type: 'food' | 'walk' | 'water' | 'care';
}

/**
 * ID canónico inmutable de la mascota de demostración.
 * Bloqueado por reglas de seguridad y filtros locales para que NUNCA se persista en Firestore.
 */
export const DEMO_PET_ID = 'demo_pet_otb';

/**
 * Perfil oficial de demostración y tour para NutriPet OTB.
 * Basado en la raza certificada Cocker Spaniel (Inglés / Americano) de data.ts.
 */
export const DEMO_PET_PROFILE: PetProfile = {
  id: DEMO_PET_ID,
  name: 'Boby',
  type: 'dog',
  breedId: 'cocker_spaniel',
  breedCustom: undefined,
  gender: 'male',
  birthDate: '2023-04-12',
  ageMonths: 36,
  stage: 'adult',
  neutered: true,
  weightKg: 13.5,
  idealWeightKg: 12.0,
  activity: 'moderate',
  condition: 'overweight',
  diet: 'kibble',
  kibbleKcalPer100g: 375,
  microchip: '981098104567890',
  allergies: 'Sensibilidad a proteínas de pollo y cereales con gluten',
  knownDiseases: 'Tendencia a otitis eritematosa en conducto auditivo',
  ownerName: 'Familia Demo NutriPet',
  ownerPhone: '+57 300 000 0000',
  emergencyContact: '+57 310 000 0000 (Contacto de Emergencia)',
  veterinarian: 'Dra. Camila Morales (Clínica VetCare)',
  veterinarianPhone: '+57 320 000 0000',
  notes: 'Mascota alegre y activa. Secar cuidadosamente las orejas tras cada baño.',
  photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/English_Cocker_Spaniel_6.jpg'
};

/**
 * Historial clínico de pesajes para alimentar la gráfica de evolución FEDIAF.
 */
export const DEMO_WEIGHT_LOGS: WeightLog[] = [
  {
    id: 'demo-w1',
    petId: DEMO_PET_ID,
    date: '2026-08-10',
    weightKg: 14.8,
    notes: 'Pesaje inicial. Diagnóstico de sobrepeso (+2.8 kg sobre meta ideal).'
  },
  {
    id: 'demo-w2',
    petId: DEMO_PET_ID,
    date: '2026-09-05',
    weightKg: 14.2,
    notes: 'Ajuste de ración a 178g/día. Reducción gradual favorable.'
  },
  {
    id: 'demo-w3',
    petId: DEMO_PET_ID,
    date: '2026-10-02',
    weightKg: 13.8,
    notes: 'Buena respuesta digestiva y mayor vitalidad en paseos.'
  },
  {
    id: 'demo-w4',
    petId: DEMO_PET_ID,
    date: '2026-11-01',
    weightKg: 13.5,
    notes: 'Pesaje actual. A solo 1.5 kg de la meta de peso óptimo.'
  }
];

/**
 * Horarios y rutina calculada para Boby.
 */
export const DEMO_ROUTINES: DemoRoutineItem[] = [
  {
    id: 'demo-r1',
    time: '07:00 AM',
    activity: 'Paseo matutino y activación',
    notes: '30 min de marcha ligera al aire libre y necesidades.',
    type: 'walk'
  },
  {
    id: 'demo-r2',
    time: '07:45 AM',
    activity: 'Desayuno regulado (89g)',
    notes: 'Croquetas secas servidas en plato anti-voracidad con agua fresca.',
    type: 'food'
  },
  {
    id: 'demo-r3',
    time: '01:30 PM',
    activity: 'Inspección de hidratación',
    notes: 'Renovación de agua fresca (meta diaria: 740 - 1010 ml/día).',
    type: 'water'
  },
  {
    id: 'demo-r4',
    time: '07:00 PM',
    activity: 'Cena regulada (89g)',
    notes: 'Segunda toma del día. Mantener 40 min de reposo post-ingesta.',
    type: 'food'
  },
  {
    id: 'demo-r5',
    time: '09:30 PM',
    activity: 'Paseo nocturno corto',
    notes: '15 min de caminata tranquila previa al descanso nocturno.',
    type: 'walk'
  }
];

/**
 * Consultas e historial clínico de ejemplo para Boby (Expediente & Peso).
 */
export const DEMO_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'demo-m1',
    petId: DEMO_PET_ID,
    date: '2026-10-15',
    type: 'consultation',
    title: 'Chequeo Preventivo y Esquema Vacunal',
    veterinarian: 'Dra. Camila Morales (Clínica VetCare)',
    diagnosis: 'Estado general excelente. Refuerzo de séxtuple aplicado sin reacciones.',
    notes: 'Peso en 13.8 kg (reducción positiva). Continuar plan nutricional de 178g/día.'
  },
  {
    id: 'demo-m2',
    petId: DEMO_PET_ID,
    date: '2026-09-10',
    type: 'treatment',
    title: 'Control Otológico Preventivo',
    veterinarian: 'Dra. Camila Morales (Clínica VetCare)',
    diagnosis: 'Leve eritema en conducto auditivo derecho sin secreción purulenta.',
    notes: 'Limpieza con solución ótica secante. Recomendación: secar cuidadosamente tras el baño.'
  },
  {
    id: 'demo-m3',
    petId: DEMO_PET_ID,
    date: '2026-07-20',
    type: 'exam',
    title: 'Perfil Bioquímico & Coprológico Anual',
    veterinarian: 'Laboratorio Clínico VetCare',
    diagnosis: 'Coprológico negativo a parásitos. Glucosa y función renal normales.',
    notes: 'Lípidos levemente en límite superior por condición de sobrepeso previa.'
  }
];

/**
 * Recordatorios y alertas preventivas de ejemplo para Boby (Vacunas y Notificaciones).
 */
export const DEMO_REMINDERS: Reminder[] = [
  {
    id: 'demo-rem1',
    petId: DEMO_PET_ID,
    type: 'deworming',
    name: 'Pipeta Antipulgas y Garrapatas',
    dueDate: '2026-11-22',
    dosage: '1 pipeta dorsal (10-20 kg)',
    completed: false,
    recurringDays: 30,
    notes: 'Aplicar directamente sobre la piel en la cruz del cuello.'
  },
  {
    id: 'demo-rem2',
    petId: DEMO_PET_ID,
    type: 'vaccine',
    name: 'Refuerzo Anual Vacuna Séxtuple (DHPPi+L)',
    dueDate: '2026-12-10',
    dosage: '1 dosis subcutánea en clínica',
    completed: false,
    recurringDays: 365,
    notes: 'Incluye Parvovirus, Moquillo, Hepatitis y Leptospirosis.'
  },
  {
    id: 'demo-rem3',
    petId: DEMO_PET_ID,
    type: 'deworming',
    name: 'Desparasitación Interna Oral Trimestral',
    dueDate: '2026-10-25',
    dosage: '1 pastilla y media según peso (13.5 kg)',
    completed: true,
    recurringDays: 90,
    notes: 'Administrada con un trocito de manzana permitida.'
  },
  {
    id: 'demo-rem4',
    petId: DEMO_PET_ID,
    type: 'bath',
    name: 'Baño de Mantenimiento & Secado de Oídos',
    dueDate: '2026-11-20',
    dosage: 'Champú hipoalergénico con avena',
    completed: false,
    recurringDays: 15,
    notes: 'Enfasis en secar los pliegues de las orejas con toalla tibia.'
  }
];

