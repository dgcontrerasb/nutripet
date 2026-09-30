import { PetProfile, CalculationResult, ToxicFood, HealthGuide, BreedInfo } from './types';

/**
 * Fórmulas nutricionales basadas en FEDIAF y National Research Council (NRC)
 * RER = 70 * (peso_kg)^0.75
 * MER = RER * Factor según estado biológico
 */
export function calculatePetNutrition(profile: PetProfile): CalculationResult {
  const weight = Math.max(0.2, profile.weightKg);
  // RER: Requerimiento Energético en Reposo
  const rer = Math.round(70 * Math.pow(weight, 0.75));

  let multiplier = 1.0;

  if (profile.type === 'dog') {
    if (profile.stage === 'puppy_kitten') {
      if (profile.ageMonths <= 4) {
        multiplier = 3.0; // Crecimiento rápido
      } else {
        multiplier = 2.0; // Crecimiento moderado
      }
    } else if (profile.stage === 'senior') {
      multiplier = profile.neutered ? 1.2 : 1.4;
    } else {
      // Adulto
      if (profile.neutered) {
        multiplier = profile.activity === 'low' ? 1.4 : profile.activity === 'moderate' ? 1.6 : 1.8;
      } else {
        multiplier = profile.activity === 'low' ? 1.6 : profile.activity === 'moderate' ? 1.8 : 2.2;
      }
      if (profile.activity === 'working') {
        multiplier = 2.8;
      }
    }

    // Ajuste por condición corporal
    if (profile.condition === 'overweight') {
      multiplier *= 0.85; // Pérdida de peso gradual segura
    } else if (profile.condition === 'underweight') {
      multiplier *= 1.20; // Recuperación de peso
    }
  } else {
    // GATOS
    if (profile.stage === 'puppy_kitten') {
      multiplier = 2.5;
    } else if (profile.stage === 'senior') {
      multiplier = profile.neutered ? 1.1 : 1.3;
    } else {
      // Gato adulto
      if (profile.neutered) {
        multiplier = profile.activity === 'low' ? 1.1 : 1.2;
      } else {
        multiplier = profile.activity === 'low' ? 1.3 : 1.5;
      }
    }

    if (profile.condition === 'overweight') {
      multiplier *= 0.80;
    } else if (profile.condition === 'underweight') {
      multiplier *= 1.20;
    }
  }

  const mer = Math.round(rer * multiplier);

  // Cálculo de croquetas secas: (MER / kcal por 100g) * 100
  const kcalDensity = Math.max(250, profile.kibbleKcalPer100g || 360);
  const kibbleDailyGrams = Math.round((mer / kcalDensity) * 100);

  // Número de comidas al día
  let mealsPerDay = 2;
  if (profile.stage === 'puppy_kitten') {
    mealsPerDay = profile.ageMonths <= 4 ? 4 : 3;
  } else if (profile.type === 'cat' && profile.stage === 'adult') {
    mealsPerDay = 3;
  }
  const gramsPerMeal = Math.round(kibbleDailyGrams / mealsPerDay);

  // Requerimiento de agua aproximado
  const mlPerKgMin = profile.type === 'dog' ? 55 : 45;
  const mlPerKgMax = profile.type === 'dog' ? 75 : 65;
  const waterDailyMl = {
    min: Math.round(weight * mlPerKgMin),
    max: Math.round(weight * mlPerKgMax),
  };

  // Cálculo Dieta Natural / BARF
  let barfPercentage = 2.5;
  if (profile.stage === 'puppy_kitten') {
    barfPercentage = profile.ageMonths <= 4 ? 8.0 : 6.0;
  } else if (profile.activity === 'high' || profile.activity === 'working') {
    barfPercentage = 3.5;
  } else if (profile.activity === 'low' || profile.condition === 'overweight') {
    barfPercentage = 2.0;
  }

  const barfTotalGrams = Math.round((weight * 1000 * barfPercentage) / 100);

  const meatyBonesGrams = Math.round(barfTotalGrams * (profile.type === 'dog' ? 0.50 : 0.45));
  const muscleMeatGrams = Math.round(barfTotalGrams * (profile.type === 'dog' ? 0.30 : 0.35));
  const organsGrams = Math.round(barfTotalGrams * 0.10);
  const vegetablesFruitsGrams = Math.round(barfTotalGrams * (profile.type === 'dog' ? 0.10 : 0.05));

  return {
    rer,
    mer,
    activityMultiplier: Number(multiplier.toFixed(2)),
    kibbleDailyGrams,
    mealsPerDay,
    gramsPerMeal,
    waterDailyMl,
    barfBreakdown: {
      totalGrams: barfTotalGrams,
      percentage: barfPercentage,
      meatyBonesGrams,
      muscleMeatGrams,
      organsGrams,
      vegetablesFruitsGrams,
    },
  };
}

export const POPULAR_BREEDS: BreedInfo[] = [
  // --- PERROS: RAZAS GRANDES Y GIGANTES ---
  {
    id: 'golden_labrador',
    type: 'dog',
    name: 'Golden Retriever / Labrador Retriever',
    sizeCategory: 'grande',
    typicalWeight: '25 - 36 kg',
    predispositions: [
      'Alta propensión al sobrepeso por mutación en gen POMC de saciedad',
      'Displasia de cadera, codo y artrosis temprana',
      'Dermatitis atópica y alergias alimentarias'
    ],
    nutritionFocus: 'Nivel calórico controlado con L-Carnitina para quemar grasas, más Glucosamina (≥750 mg/kg) y Condroitina para cartílagos pesados.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Golden Retriever / Labrador Adult', 'Hill\'s Science Diet Adult Large Breed', 'Acana Heritage Large Breed'],
        why: 'Densidad energética adaptada para saciar sin engordar y croqueta grande que fuerza la masticación.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Large Breed Chicken', 'Diamond Naturals Large Breed Adult'],
        why: 'Pollo real como primer ingrediente con condroprotectores a un costo moderado.'
      }
    ],
    breedTips: [
      'Usa siempre comedero antivoracidad: tragar aire al devorar en 30 segundos multiplica el riesgo de torsión de estómago.',
      'Nunca dejes el saco de comida a su alcance; comerán hasta provocar una dilatación gástrica aguda.',
      'Controla los premios: un trozo de salchicha equivale a una hamburguesa entera para su peso metabólico.'
    ]
  },
  {
    id: 'german_shepherd',
    type: 'dog',
    name: 'Pastor Alemán',
    sizeCategory: 'grande',
    typicalWeight: '28 - 40 kg',
    predispositions: [
      'Sensibilidad digestiva congénita (tránsito rápido y heces pastosas recurrentes)',
      'Mayor permeabilidad de la mucosa intestinal',
      'Desgaste coxofemoral en cadera y columna lumbar'
    ],
    nutritionFocus: 'Proteínas L.I.P. de asimilación ultra alta (≥90%), prebióticos FOS/MOS y pulpa de remolacha para dar consistencia a las heces.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin German Shepherd Adult', 'Eukanuba Breed Specific German Shepherd'],
        why: 'Fórmula enriquecida con fibras digestivas específicas que compactan las evacuaciones y protegen la mucosa.'
      },
      {
        tier: 'Veterinario Específico',
        brands: ['Hill\'s Prescription Diet i/d Digestive Care', 'Purina Pro Plan Sensitive Skin & Stomach'],
        why: 'Proteína hidrolizada o salmón que no inflama el colon.'
      }
    ],
    breedTips: [
      'Divide su ración diaria en 2 o 3 tomas; los estómagos de pastor alemán toleran mal una sola comida grande al día.',
      'Agrega una cucharada de puré de calabaza cocida al alimento seco si notas consistencia blanda ocasional.'
    ]
  },
  {
    id: 'rottweiler',
    type: 'dog',
    name: 'Rottweiler',
    sizeCategory: 'grande',
    typicalWeight: '38 - 55 kg',
    predispositions: [
      'Carga articular extrema sobre hombros y rodillas',
      'Tendencia a problemas cardíacos (estenosis aórtica y miocardiopatía dilatada)',
      'Apetito fuerte con tendencia a engordar al envejecer'
    ],
    nutritionFocus: 'Enriquecido con Taurina, L-Carnitina y EPA/DHA para preservar el músculo cardíaco y mantener masa muscular magra sin grasa.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Rottweiler Adult', 'Taste of the Wild High Prairie Canine', 'Orijen Amazing Grains Large Breed'],
        why: 'Proteína cárnica concentrada sin harinas de relleno para mantener masa muscular sin forzar articulaciones.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Complete Adult Large', 'Monello Dog Razas Grandes'],
        why: 'Buena digestibilidad y soporte de aminoácidos esenciales.'
      }
    ],
    breedTips: [
      'Mantén a tu Rottweiler en una silueta esbelta donde la cintura se marque claramente desde arriba.',
      'Evita saltos de altura y ejercicios bruscos de impacto antes de los 18 meses de vida cuando cierran sus placas de crecimiento.'
    ]
  },
  {
    id: 'husky_malamute',
    type: 'dog',
    name: 'Husky Siberiano / Alaskan Malamute',
    sizeCategory: 'grande',
    typicalWeight: '20 - 38 kg',
    predispositions: [
      'Metabolismo nórdico ultra eficiente (queman muy pocas calorías en reposo)',
      'Dermatosis sensible al zinc (caída de pelo periocular y descamación nasal)',
      'Pérdida de apetito estacional o rechazo a alimentos con exceso de carbohidratos'
    ],
    nutritionFocus: 'Alta proporción de grasas saludables y proteínas de salmón o cordero, con zinc quelado de alta biodisponibilidad y cero gluten.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Taste of the Wild Pacific Stream Salmon', 'Acana Wild Coast', 'Bravery Salmon Adult'],
        why: 'Rico en ácidos grasos Omega 3 marinos que nutren su doble capa de pelo y previenen eccemas.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Diamond Naturals Salmon & Potato', 'Purina Pro Plan Adult Sensitive'],
        why: 'Pescado como fuente proteica principal con zinc orgánico añadido.'
      }
    ],
    breedTips: [
      'No te asustes si un día decide comer la mitad: los huskies autorregulan su ingesta según el clima.',
      'Su manto de doble capa nunca debe raparse; la nutrición con salmón es su escudo térmico natural tanto para frío como para calor.'
    ]
  },
  {
    id: 'great_dane_mastiff',
    type: 'dog',
    name: 'Gran Danés / Mastín / San Bernardo (Gigantes)',
    sizeCategory: 'gigante',
    typicalWeight: '50 - 85 kg',
    predispositions: [
      'Crecimiento esquelético extremadamente veloz en cachorros',
      'Máximo riesgo zootécnico de dilatación-torsión gástrica',
      'Esperanza de vida reducida con desgaste cardiovascular temprano'
    ],
    nutritionFocus: 'Proporción estricta de Calcio (0.8% - 1.0%) y Fósforo para evitar osteodistrofia hipertrófica en crecimiento, con croquetas gigantes ("Giant kibble").',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Giant Adult', 'Hill\'s Science Diet Adult Giant Breed', 'Eukanuba Adult Giant Breed'],
        why: 'Diseñado específicamente para tiempos de tránsito digestivo lentos y masticación pausada.'
      },
      {
        tier: 'Veterinario Específico',
        brands: ['Royal Canin Giant Puppy / Junior', 'Purina Pro Plan Large Robust'],
        why: 'Evita los picos de crecimiento abruptos que fracturan o deforman las articulaciones de cachorros gigantes.'
      }
    ],
    breedTips: [
      'Reposo absoluto obligatorio: Prohibido cualquier tipo de juego, carrera o caminata 90 minutos antes y después de comer.',
      'Sirve la comida en 2 o 3 tomas diarias; jamás suministres toda su ración en un único plato gigante.'
    ]
  },

  // --- PERROS: RAZAS MEDIANAS Y DE TRABAJO ---
  {
    id: 'pitbull_amstaff',
    type: 'dog',
    name: 'American Pitbull Terrier / Amstaff',
    sizeCategory: 'mediano',
    typicalWeight: '16 - 30 kg',
    predispositions: [
      'Alergias cutáneas alérgicas (dermatitis de contacto y a proteína de pollo o maíz)',
      'Estructura muscular muy densa y potente',
      'Sensibilidad ocular o descamación en hocico y patas'
    ],
    nutritionFocus: 'Proteínas no tradicionales (salmón, pato, venado o cordero), alta concentración de zinc y ácidos grasos Omega 3 y 6 para barrera epidérmica.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Taste of the Wild Sierra Mountain (Cordero)', 'Acana Singles Grass-Fed Lamb', 'Bravery Iberic Pork Adult'],
        why: 'Monoproteicos de fuentes cárnicas nobles sin cereales agresivos para evitar picores y rojeces.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Sensitive Skin Salmon', 'Kirkland Nature\'s Domain Turkey & Sweet Potato'],
        why: 'Cero maíz y sin derivados de subproductos que causan alergias comunes.'
      }
    ],
    breedTips: [
      'Si se lame constantemente las patas o se le enrojece la barriga, suspende alimentos con pollo o harinas mixtas de ave.',
      'Su masa muscular consume energía rápidamente; asegúrate de no racionar por debajo de su MER si realiza ejercicio vigoroso.'
    ]
  },
  {
    id: 'border_collie_australian',
    type: 'dog',
    name: 'Border Collie / Pastor Ovejero Australiano',
    sizeCategory: 'mediano',
    typicalWeight: '14 - 23 kg',
    predispositions: [
      'Gasto metabólico muy alto por actividad mental y motora constante',
      'Sensibilidad farmacológica al gen MDR1',
      'Desgaste en ligamentos cruzados y articulaciones por saltos'
    ],
    nutritionFocus: 'Alta densidad calórica (≥380 kcal/100g) con mínimo 26-30% de proteína bruta y 16-18% de grasas para mantener estamina sin fatiga.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Purina Pro Plan Sport Performance 30/20', 'Acana Sport & Agility', 'Taste of the Wild Southwest Canyon'],
        why: 'Proporción 30% proteína / 20% grasa formulada para perros de alta resistencia y agilidad.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Diamond Naturals All Life Stages Chicken & Rice', 'Monello Dog Energy'],
        why: 'Buen aporte calórico con proteína animal digestible para perros activos.'
      }
    ],
    breedTips: [
      'Usa alfombras olfativas y juguetes dispensadores de croquetas (KONG): el acto de descifrar cómo sacar la comida relaja su mente hiperactiva.',
      'Si en invierno baja su actividad, reduce un 10% la ración para evitar que el sedentarismo temporal aumente su peso.'
    ]
  },
  {
    id: 'beagle',
    type: 'dog',
    name: 'Beagle',
    sizeCategory: 'mediano',
    typicalWeight: '9 - 14 kg',
    predispositions: [
      'Obsesión olfativa extrema y voracidad que conduce a obesidad severa',
      'Hernias discales en la columna vertebral acentuadas por el sobrepeso',
      'Infecciones recurrentes de oído por pabellón auricular cerrado'
    ],
    nutritionFocus: 'Fibras naturales saciantes (avena, pulpa de remolacha) que llenen su estómago con menos calorías por porción.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Beagle Adult', 'Hill\'s Science Diet Perfect Weight Small & Mini / Medium'],
        why: 'Croqueta con textura de estrella que ralentiza la ingestión y fibra que genera saciedad prolongada.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Weight Management', 'Nutro Lite Adult'],
        why: 'Menos del 10% de grasa con proteína de carne magra.'
      }
    ],
    breedTips: [
      'Un Beagle pesará lo que tú le permitas pesar: mide rigurosamente los gramos con báscula de cocina, no "al ojo".',
      'Nunca dejes tachos de basura accesibles; tienen un olfato 100 veces superior al humano y comerán plástico o huesos con tal de llegar a un residuo.'
    ]
  },
  {
    id: 'cocker_spaniel',
    type: 'dog',
    name: 'Cocker Spaniel (Inglés / Americano)',
    sizeCategory: 'mediano',
    typicalWeight: '11 - 16 kg',
    predispositions: [
      'Otitis crónicas causadas por alergias alimentarias secundarias',
      'Queratoconjuntivitis seca (ojo seco)',
      'Seborrea y mal olor dérmico si la comida contiene grasas oxidadas'
    ],
    nutritionFocus: 'EPA, DHA y Biotina para regular la producción sebácea cutánea y prevenir infecciones en oídos caídos.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Cocker Adult', 'Hill\'s Sensitive Stomach & Skin Medium', 'Acana Grass-Fed Lamb'],
        why: 'Refuerzo específico del manto y complejo patentado para evitar inflamación en el conducto auditivo.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Sensitive Skin', 'Diamond Naturals Lamb & Rice'],
        why: 'Cordero hipoalergénico que reduce eritemas y picores en las orejas.'
      }
    ],
    breedTips: [
      'Usa un comedero estrecho y alto (comedero especial para Cocker) para evitar que sus orejas largas caigan dentro de la comida húmeda o el agua.',
      'Revisa sus oídos semanalmente: si huelen a levadura o están oscuros, revisa de inmediato su alimentación.'
    ]
  },
  {
    id: 'schnauzer',
    type: 'dog',
    name: 'Schnauzer (Miniatura y Estándar)',
    sizeCategory: 'pequeño',
    typicalWeight: '6 - 15 kg',
    predispositions: [
      'Hiperlipidemia hereditaria (dificultad genética para procesar triglicéridos en sangre)',
      'Máximo riesgo veterinario de Pancreatitis aguda letal tras ingerir grasa',
      'Formación de cálculos urinarios de oxalato cálcico'
    ],
    nutritionFocus: 'Dieta ESTRICTAMENTE baja en grasas (≤10-12% de grasa en materia seca) y abundante hidratación.',
    recommendedFoodTypes: [
      {
        tier: 'Veterinario Específico',
        brands: ['Hill\'s Prescription Diet i/d Low Fat', 'Royal Canin Miniature Schnauzer Adult', 'Royal Canin Gastrointestinal Low Fat'],
        why: 'Contenido lipídico terapéuticamente reducido para evitar colapso de la función pancreática.'
      },
      {
        tier: 'Súper Premium',
        brands: ['Purina Pro Plan Weight Management', 'Nutro Wholesome Essentials Lite'],
        why: 'Nivel graso controlado sin comprometer aminoácidos esenciales.'
      }
    ],
    breedTips: [
      'REGLA VITAL: Jamás le des sobras grasas de asados, piel de pollo frito, queso o tocino; en un Schnauzer, un solo bocado graso puede detonar pancreatitis de hospitalización.',
      'Limpia su barba con un paño húmedo después de cada comida para evitar proliferación de bacterias y hongos.'
    ]
  },

  // --- PERROS: RAZAS PEQUEÑAS Y BRAQUICÉFALAS ---
  {
    id: 'french_bulldog_pug',
    type: 'dog',
    name: 'Bulldog Francés / Pug / Bulldog Inglés',
    sizeCategory: 'pequeño',
    typicalWeight: '8 - 14 kg',
    predispositions: [
      'Síndrome respiratorio braquicéfalo (paladar blando elongado y fosas nasales estrechas)',
      'Acumulación de gases fétidos por aerofagia al tragar aire al masticar',
      'Dermatitis e intertrigo en pliegues faciales y sobre la cola'
    ],
    nutritionFocus: 'Croquetas ergonómicas curvas o en medialuna para fácil agarre labial, proteínas L.I.P. de fermentación reducida y control estricto de carbohidratos.',
    recommendedFoodTypes: [
      {
        tier: 'Veterinario Específico',
        brands: ['Royal Canin French Bulldog Adult', 'Royal Canin Pug Adult'],
        why: 'Croqueta a la medida anatómica braquicéfala que reduce gases en un 40% y protege las articulaciones de la columna.'
      },
      {
        tier: 'Súper Premium',
        brands: ['Hill\'s Science Diet Sensitive Stomach & Skin', 'Taste of the Wild Appalachian Valley Small Breed'],
        why: 'Fórmula sin granos pesados para no irritar los pliegues dérmicos.'
      }
    ],
    breedTips: [
      'Mantén su peso en el límite inferior recomendado: 1 kilo de más en un bulldog le resta hasta un 25% de capacidad respiratoria.',
      'Seca siempre sus arrugas con una gasa limpia tras la hora de la comida.',
      'Usa platos elevados planos para que no incline el cuello en ángulo forzado al alimentarse.'
    ]
  },
  {
    id: 'poodle_caniche',
    type: 'dog',
    name: 'Caniche (Poodle Toy / Mediano / Gigante)',
    sizeCategory: 'pequeño',
    typicalWeight: '3 - 22 kg',
    predispositions: [
      'Sarro bacteriano acelerado y enfermedad periodontal temprana',
      'Pérdida prematura de piezas dentales e infecciones radiculares',
      'Cataratas seniles y degeneración retinal'
    ],
    nutritionFocus: 'Quelantes de calcio salivar (tripolifosfato de sodio) para frenar la calcificación de la placa bacteriana, más luteína y zeaxantina para la vista.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Poodle Adult', 'Hill\'s Science Diet Adult Small & Mini Oral Care', 'Acana Small Breed'],
        why: 'Croqueta de abrasión mecánica calibrada que limpia la corona dental al morder.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Small Bites', 'Monello Dog Razas Pequeñas'],
        why: 'Buena relación de nutrientes con tamaño seguro de masticación.'
      }
    ],
    breedTips: [
      'Cepilla sus dientes al menos 3 veces por semana; la nutrición dental retrasa las limpiezas con anestesia veterinaria.',
      'Ofrece snacks de cartílago crudo o zanahoria fría como mordedor natural anti-sarro.'
    ]
  },
  {
    id: 'chihuahua_yorkie',
    type: 'dog',
    name: 'Chihuahua / Yorkshire Terrier',
    sizeCategory: 'pequeño',
    typicalWeight: '1.5 - 4.5 kg',
    predispositions: [
      'Hipoglucemia súbita (bajón letal de azúcar en sangre en cachorros)',
      'Colapso traqueal cartilaginoso al emocionarse o comer con desesperación',
      'Paladar extremadamente exigente (rechazo sistemático al alimento seco)'
    ],
    nutritionFocus: 'Densidad energética muy concentrada (pequeños estómagos con gasto acelerado), palatabilidad natural y croqueta micro-métrica.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Chihuahua Adult / Yorkshire Adult', 'Hill\'s Small & Mini Puppy / Adult', 'Orijen Small Breed'],
        why: 'Aromas naturales intensos que seducen paladares selectivos y croqueta de apenas 4-5 mm.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Toy Breed', 'Dog Chow Adultos Minis y Pequeños'],
        why: 'Croqueta diminuta fácil de deglutir sin riesgo de atoramiento.'
      }
    ],
    breedTips: [
      'Jamás dejes pasar más de 8-10 horas sin comer en cachorros toy para evitar crisis de hipoglucemia.',
      'Usa arnés pectoral en lugar de collar en el cuello para no presionar su frágil tráquea mientras pasea o come.'
    ]
  },
  {
    id: 'pomeranian_small',
    type: 'dog',
    name: 'Pomerania Pequeña (Toy / Zwergspitz / Spitz Enano)',
    sizeCategory: 'pequeño',
    typicalWeight: '1.5 - 3.2 kg',
    predispositions: [
      'Colapso traqueal (tos tipo graznido de ganso ante excitación o comida voraz)',
      'Luxación patelar congénita en rodillas traseras (grados I a IV)',
      'Alopecia X (Black Skin Disease) por desbalance hormonal folicular',
      'Predisposición a acumulación acelerada de sarro dental y pérdida de piezas'
    ],
    nutritionFocus: 'Croqueta de tamaño mini (≤6 mm) altamente digestible, con biotina, ácidos grasos Omega 3 (EPA/DHA) y azufre orgánico para nutrir la densa doble capa de pelo, más tripolifosfato sódico quelante de sarro.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Pomeranian Adult', 'Hill\'s Science Diet Adult Small & Mini', 'Farmina N&D Quinoa Skin & Coat Mini'],
        why: 'Croqueta adaptada a mandíbulas en miniatura con aporte balanceado de EPA/DHA y fibras especiales para el tránsito intestinal.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Toy Breed', 'Diamond Naturals Small Breed Chicken'],
        why: 'Pollo real con croqueta diminuta que previene atragantamientos a un precio accesible.'
      }
    ],
    breedTips: [
      'Nunca uses collar tradicional al cuello; un tirón puede aplastar los anillos cartilaginosos de su tráquea. Usa siempre arnés de pecho en forma de H o Y.',
      'Cepilla su doble capa de pelo 3 a 4 veces por semana. Nunca lo afeites ni pases máquina al ras, ya que el manto puede no volver a crecer (Alopecia post-corte).',
      'Para cachorros Pomerania pequeños, fracciona su comida en 3 o 4 tomas diarias para evitar bajones repentinos de glucosa (hipoglucemia).'
    ]
  },
  {
    id: 'pomeranian_medium',
    type: 'dog',
    name: 'Pomerania Mediana (Spitz Alemán Pequeño / Kleinspitz)',
    sizeCategory: 'pequeño',
    typicalWeight: '3.5 - 6.5 kg',
    predispositions: [
      'Tendencia al sobrepeso que agrava luxaciones de rótula',
      'Manto denso con abundante subpelo propenso a nudos y apelmazamiento',
      'Sensibilidad ocular y lagrimeo por pelos en el ángulo medial del ojo'
    ],
    nutritionFocus: 'Nivel calórico moderado para mantener peso atlético, glucosamina preventiva para articulaciones de las patas y zinc con aceite de pescado para la salud epidérmica.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Pomeranian Adult', 'Acana Singles Grass-Fed Lamb Small Breed', 'Taste of the Wild Appalachian Valley'],
        why: 'Densidad calórica balanceada que sacia su apetito manteniendo su peso óptimo sin recargar rodillas.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Small Bites Adult', 'Monello Dog Razas Pequeñas', 'Dog Chow Adultos Minis'],
        why: 'Buena digestibilidad y tamaño de croqueta ideal para su mordida intermedia.'
      }
    ],
    breedTips: [
      'Es un perro activo e inteligente: combina su ración con paseos diarios y juegos de olfato para evitar ansiedad o ladridos frecuentes.',
      'Controla los premios y snacks: en perros de 4-5 kg, dos galletas comerciales equivalen a una cuarta parte de su requerimiento calórico del día.'
    ]
  },
  {
    id: 'pomeranian_large',
    type: 'dog',
    name: 'Pomerania Grande (Spitz Alemán Mediano / Mittelspitz / Grossspitz)',
    sizeCategory: 'mediano',
    typicalWeight: '7 - 14 kg',
    predispositions: [
      'Apetito voraz y tendencia a la obesidad en etapas maduras',
      'Sensibilidad articular y desgaste de ligamentos cruzados',
      'Golpe de calor por denso pelaje polar en climas cálidos'
    ],
    nutritionFocus: 'Proteína magra de alta digestibilidad (≥26%), fibra saciante (FOS y pulpa de remolacha) y condroprotectores para sostener su osamenta más pesada.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Medium Adult', 'Hill\'s Science Diet Adult Small & Medium Bites', 'Brit Care Sustainable Adult Medium Breed'],
        why: 'Diseñado para perros de contextura media con manto profuso y actividad constante.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Medium Breed', 'Diamond Naturals All Life Stages Chicken & Rice'],
        why: 'Proteína de calidad y ácidos grasos esenciales para el soporte muscular y de pelo denso.'
      }
    ],
    breedTips: [
      'En días calurosos, asegúrate de que siempre tenga agua fresca y sombra; su manto doble aísla del frío pero puede provocar estrés térmico si hace ejercicio bajo el sol.',
      'Cepillado regular de deslanado durante la época de muda para oxigenar la piel y evitar dermatitis bajo el pelaje.'
    ]
  },
  {
    id: 'dachshund_teckel',
    type: 'dog',
    name: 'Dachshund / Teckel (Perro Salchicha)',
    sizeCategory: 'pequeño',
    typicalWeight: '4 - 9 kg',
    predispositions: [
      'Enfermedad del disco intervertebral (IVDD) por columna alargada',
      'Sobrecarga lumbar severa ante el más mínimo aumento de peso',
      'Apetito muy marcado y tendencia a pedir bocadillos humanos'
    ],
    nutritionFocus: 'Calcio y fósforo exactos con sulfato de condroitina para nutrir los discos espinales, con densidad calórica estrictamente moderada.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Dachshund Adult', 'Hill\'s Science Diet Light Small Bites', 'Eukanuba Breed Specific Dachshund'],
        why: 'Fórmula diseñada específicamente para aliviar la tensión de la columna vertebral.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Weight Management Small', 'Diamond Naturals Small Breed Chicken'],
        why: 'Control calórico riguroso con buena proteína cárnica.'
      }
    ],
    breedTips: [
      'Cada gramo de sobrepeso ejerce un efecto palanca destructivo sobre las vértebras lumbares del salchicha.',
      'Instala rampas para sillones y camas: saltar hacia abajo es la primera causa de parálisis espinal en esta raza.'
    ]
  },
  {
    id: 'shih_tzu_maltese',
    type: 'dog',
    name: 'Shih Tzu / Bichón Maltés',
    sizeCategory: 'pequeño',
    typicalWeight: '3.5 - 7.5 kg',
    predispositions: [
      'Lagrimeo constante con manchas rojizas oxidadas (epífora periocular)',
      'Sensibilidad a colorantes y conservantes sintéticos en croquetas',
      'Manto sedoso largo propenso a enredos y desnutrición folicular'
    ],
    nutritionFocus: 'Alimento 100% libre de colorantes artificiales, rico en zinc, biotina, ácido linoleico y aceite de borraja para el manto.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Shih Tzu Adult / Maltese Adult', 'Farmina N&D White Coat Sea Bass', 'Nature\'s Protection Superior Care White Dogs'],
        why: 'Fórmulas transparentes que neutralizan la porfirina en la saliva y lágrimas, eliminando manchas rojizas.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Sensitive Skin Small', 'Bravery Salmon Small Breed'],
        why: 'Salmón noble sin subproductos químicos ni harinas coloreadas.'
      }
    ],
    breedTips: [
      'Si notas lágrimas marrones u óxido alrededor de la boca, revisa los ingredientes: suele deberse a excesos de hierro o colorantes industriales en croquetas baratas.',
      'Usa bebederos de botella con boquilla de acero para mantener su barba completamente seca.'
    ]
  },
  {
    id: 'dog_mixed_small',
    type: 'dog',
    name: 'Mestizo / Criollo Pequeño (< 10 kg)',
    sizeCategory: 'pequeño',
    typicalWeight: '2 - 9.9 kg',
    predispositions: [
      'Metabolismo acelerado con estómago pequeño',
      'Predisposición a acumulación de sarro en molares',
      'Excelente longevidad (suelen vivir 14 - 17 años con peso controlado)'
    ],
    nutritionFocus: 'Croquetas de tamaño pequeño (fácil masticación) con densidad calórica moderada y agentes quelantes de sarro dental.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Acana Small Breed Adult', 'Hill\'s Science Diet Adult Small Paws', 'Taste of the Wild Appalachian Valley'],
        why: 'Nutrición densa en bocados pequeños sin riesgo de atragantamiento.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Small Bites Adult', 'Dog Chow Adultos Razas Pequeñas', 'Monello Dog Razas Pequeñas'],
        why: 'Croqueta adaptada a mandíbulas pequeñas con aporte equilibrado de calcio.'
      }
    ],
    breedTips: [
      'Pesa su ración exacta: en un perro de 5 kg, 20 gramos extra de comida al día equivalen a que un humano coma dos porciones de postre a diario.',
      'Ofrécele juguetes de mordisqueo para mantener sus encías limpias y sanas.'
    ]
  },
  {
    id: 'dog_mixed_standard',
    type: 'dog',
    name: 'Mestizo / Criollo Mediano (10 - 25 kg)',
    sizeCategory: 'mediano',
    typicalWeight: '10 - 25 kg',
    predispositions: [
      'Vigor híbrido genético (menor incidencia de anomalías congénitas)',
      'Riesgo principal centrado en el sedentarismo y exceso de premios caseros',
      'Variabilidad morfológica según su mezcla de ascendencia'
    ],
    nutritionFocus: 'Alimento completo de mantenimiento con carne real como ingrediente #1, fibras digestivas balanceadas y proporción proteína/grasa equilibrada (24/14).',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Taste of the Wild High Prairie Canine', 'Acana Singles Free-Run Duck', 'Bravery Chicken Adult'],
        why: 'Proteína noble sin desperdicios biológicos ni químicos artificiales.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Complete', 'Monello Dog Tradicional', 'Kirkland Signature Chicken & Rice'],
        why: 'Excelente relación costo-nutrición para brindar salud y longevidad.'
      }
    ],
    breedTips: [
      'Guíate exactamente por su peso y nivel de actividad real en la calculadora: un perro mestizo en su peso ideal vive hasta 4 años más que uno con sobrepeso.',
      'Establece horarios fijos para sus comidas: la rutina previene ansiedad y picoteo destructivo en el hogar.'
    ]
  },
  {
    id: 'dog_mixed_large',
    type: 'dog',
    name: 'Mestizo / Criollo Grande (> 25 kg)',
    sizeCategory: 'grande',
    typicalWeight: '25 - 50 kg',
    predispositions: [
      'Mayor desgaste en caderas y rodillas por el peso del cuerpo',
      'Riesgo de dilatación gástrica si engulle muy rápido o corre tras comer',
      'Necesidad de proteína muscular magra para no acumular grasa visceral'
    ],
    nutritionFocus: 'Fórmula con Glucosamina, Condroitina, EPA/DHA y croquetas grandes que obliguen a masticar pausadamente.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Purina Pro Plan Large Breed Adult', 'Hill\'s Science Diet Adult Large Breed', 'Acana Heritage Large Breed'],
        why: 'Condroprotectores activos para cuidar ligamentos y cartílagos pesados.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Diamond Naturals Large Breed Adult', 'Monello Dog Razas Grandes', 'Kirkland Adult Large Breed'],
        why: 'Excelente soporte de proteínas cárnicas a un costo asequible para raciones abundantes.'
      }
    ],
    breedTips: [
      'Usa comedero antivoracidad y nunca permitas ejercicio vigoroso una hora antes ni una hora después de su comida.',
      'Divide su comida en dos tomas (mañana y noche) para aliviar la carga gástrica.'
    ]
  },

  // --- GATOS: RAZAS Y CONTEXTURAS FELINAS ---
  {
    id: 'cat_european_mixed',
    type: 'cat',
    name: 'Gato Común Europeo / Mestizo Doméstico',
    sizeCategory: 'felino',
    typicalWeight: '3.5 - 5.5 kg',
    predispositions: [
      'Riesgo altísimo de obesidad tras la esterilización (+200% de tendencia al aumento de peso)',
      'Síndrome urológico felino (FUS) y cálculos de estruvita por baja hidratación instintiva',
      'Tricobezoares (bolas de pelo acumuladas en el estómago)'
    ],
    nutritionFocus: 'pH urinario estrictamente controlado (6.2 - 6.5), magnesio y fósforo balanceados, alto contenido de fibra saciante y Taurina esencial (≥1500 mg/kg).',
    recommendedFoodTypes: [
      {
        tier: 'Veterinario Específico',
        brands: ['Royal Canin Sterilised 37 / Urinary S/O', 'Hill\'s Science Diet Adult Urinary & Hairball Control'],
        why: 'Fórmula de referencia veterinaria que disuelve cristales y previene obstrucciones uretrales en machos.'
      },
      {
        tier: 'Súper Premium',
        brands: ['Applaws Grain Free Chicken & Salmon', 'Orijen Original Cat', 'Leonardo Adult Duck'],
        why: 'Hasta un 80% de proteína animal pura sin cereales que eleven su glucosa.'
      }
    ],
    breedTips: [
      'REGLA FELINA DE ORO: Los gatos evolucionaron en el desierto y no sienten sed suficiente. Dales 1 sobre de comida húmeda diario para aportar el agua que sus riñones necesitan.',
      'Coloca una fuente de agua eléctrica con filtro: a los felinos les estimula el agua corriente y beben hasta 3 veces más.'
    ]
  },
  {
    id: 'cat_persian_longhair',
    type: 'cat',
    name: 'Gato Persa / Angora / Pelo Largo',
    sizeCategory: 'felino',
    typicalWeight: '3.5 - 6 kg',
    predispositions: [
      'Bolas de pelo severas que pueden obstruir el intestino',
      'Enfermedad poliquística renal (PKD)',
      'Mandíbula braquicéfala que dificulta la prensión lingual del alimento'
    ],
    nutritionFocus: 'Fibras naturales insolubles (semillas de psyllium) que arrastran el pelo ingerido hacia las heces, más croquetas adaptadas con forma de almendra.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Persian Adult', 'Hill\'s Hairball Control Adult', 'Farmina N&D Hairball Chicken'],
        why: 'Croqueta con textura y ángulo que el persa puede recoger con la parte inferior de la lengua.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Hairball Management', 'Cat Chow Control Bolas de Pelo'],
        why: 'Fibras de celulosa y pulpa para tránsito continuo.'
      }
    ],
    breedTips: [
      'El cepillado diario de 5 minutos remueve el 70% del pelo muerto antes de que el gato lo trague al lamerse.',
      'Suministra pasta de malta felina dos veces por semana como un premio lubricante natural.'
    ]
  },
  {
    id: 'cat_siamese',
    type: 'cat',
    name: 'Gato Siamés / Oriental',
    sizeCategory: 'felino',
    typicalWeight: '3 - 4.5 kg',
    predispositions: [
      'Metabolismo activo y silueta atlética esbelta',
      'Sensibilidad gastrointestinal con vómitos por comer a gran velocidad',
      'Asma bronquial felina e hipersensibilidad olfativa'
    ],
    nutritionFocus: 'Croquetas tubulares que obligan a masticar antes de deglutir, proteínas hiperdigestibles con 38% de proteína bruta y bajo tenor lipídico.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Siamese Adult', 'Farmina N&D Quinoa Skin & Coat', 'Applaws Adult Ocean Fish'],
        why: 'Fórmula tubular que duplica el tiempo de masticación y estabiliza la digestión.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Purina Pro Plan Adult Sensitive Skin & Stomach Cat', 'Monello Cat Salmón y Atún'],
        why: 'Proteínas seleccionadas suaves con el estómago.'
      }
    ],
    breedTips: [
      'Los siameses son intelectualmente curiosos: usa comederos puzzle para obligarlos a cazar sus croquetas una por una.',
      'Evita cambiar de marca abruptamente; son extremadamente sensibles al estrés digestivo.'
    ]
  },
  {
    id: 'cat_maine_coon',
    type: 'cat',
    name: 'Maine Coon / Bosque de Noruega (Gigantes)',
    sizeCategory: 'felino',
    typicalWeight: '6 - 11 kg',
    predispositions: [
      'Miocardiopatía hipertrófica felina (HCM)',
      'Displasia de cadera inusual en felinos por su gran envergadura y peso óseo',
      'Periodo de crecimiento prolongado (maduran completamente hasta los 3-4 años)'
    ],
    nutritionFocus: 'Croqueta extragrande ("King Size") adaptada a su mandíbula fuerte, enriquecida con L-Carnitina, Glucosamina y Taurina cardíaca.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Maine Coon Adult / Kitten', 'Leonardo Adult Maxi GF', 'Taste of the Wild Canyon River Feline'],
        why: 'Croqueta cúbica gigante que no pueden tragar sin masticar y soporte articular intensivo.'
      },
      {
        tier: 'Veterinario Específico',
        brands: ['Hill\'s Prescription Diet k/d + Mobility', 'Purina Pro Plan Adult Large Feline'],
        why: 'Prevención de rigidez articular y cuidado renal temprano.'
      }
    ],
    breedTips: [
      'Un Maine Coon nunca debe ser forzado a comer croquetas estándar de gato común: intentará tragarlas como pastillas sin masticar.',
      'Proporciónale rascadores verticales de al menos 1 metro de alto para que estire su gran columna y fortalezca la cadera.'
    ]
  },
  {
    id: 'cat_bengal',
    type: 'cat',
    name: 'Gato Bengalí / Bengal',
    sizeCategory: 'felino',
    typicalWeight: '4 - 7 kg',
    predispositions: [
      'Genética semisalvaje (descendiente del gato leopardo asiático)',
      'Intolerancia severa a cereales, maíz y soja (enteritis crónica)',
      'Masa muscular magra con gasto de energía extraordinariamente alto'
    ],
    nutritionFocus: 'Alimento Grain-Free ultra cárnico (mínimo 40% de proteína animal) y grasas ricas en Omega para potenciar el brillo del manto ("glitter effect").',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Bengal Adult', 'Orijen Cat & Kitten / Fit & Trim', 'Carnilove Salmon & Turkey for Cats'],
        why: 'Perfil biológicamente apropiado para carnívoros estrictos con croqueta en forma de Y.'
      },
      {
        tier: 'Económico de Buena Calidad',
        brands: ['Diamond Naturals Grain-Free Whitefish & Sweet Potato', 'Purina Pro Plan LiveClear'],
        why: 'Proteína pura sin cereales irritantes.'
      }
    ],
    breedTips: [
      'Adoran el agua: coloca recipientes anchos o cuencos pesados, ya que acostumbran meter las patas o jugar antes de beber.',
      'Necesitan juguetes interactivos de alta velocidad para quemar adrenalina y no buscar comida por aburrimiento.'
    ]
  },
  {
    id: 'cat_sphynx',
    type: 'cat',
    name: 'Gato Esfinge / Sphynx (Sin Pelo)',
    sizeCategory: 'felino',
    typicalWeight: '3.5 - 5 kg',
    predispositions: [
      'Pérdida continua de calor corporal al carecer de manto aislante',
      'Metabolismo basal ultra acelerado para mantener temperatura a 38.5°C',
      'Piel grasa con secreción sebácea expuesta'
    ],
    nutritionFocus: 'Densidad calórica y proteica muy alta (alto porcentaje de grasas digestibles) para compensar la termorregulación continua.',
    recommendedFoodTypes: [
      {
        tier: 'Súper Premium',
        brands: ['Royal Canin Sphynx Adult', 'Hill\'s Science Diet Active Cat', 'Farmina N&D Prime Chicken & Pomegranate'],
        why: 'Aporte lipídico elevado formulado específicamente para suplir la fuga térmica del gato sin pelo.'
      },
      {
        tier: 'Veterinario Específico',
        brands: ['Royal Canin Gastrointestinal High Energy Feline', 'Purina Pro Plan Derma Plus'],
        why: 'Complejo de barrera epidérmica y energía concentrada.'
      }
    ],
    breedTips: [
      'Un Sphynx consume en promedio un 20% más alimento calórico que un gato común de su mismo peso.',
      'Su piel produce sebo para protegerse: límpialo con toallitas hipoalergénicas y mantén su comedero a temperatura templada.'
    ]
  }
];

export const TOXIC_AND_SAFE_FOODS: ToxicFood[] = [
  // --- CATEGORÍA MORTAL (TÓXICOS LETALES / EMERGENCIAS VITALES) ---
  {
    id: 'chocolate',
    name: 'Chocolate y Cacao',
    category: 'mortal',
    appliesTo: 'both',
    dangerLevel: 'Crítico / Mortal',
    why: 'Contiene teobromina y cafeína. Las mascotas no pueden metabolizarla y se acumula rápidamente en niveles tóxicos.',
    symptoms: 'Taquicardia, vómitos, convulsiones, temblores e insuficiencia cardíaca.',
    iconName: 'AlertOctagon',
  },
  {
    id: 'uvas',
    name: 'Uvas y Pasas',
    category: 'mortal',
    appliesTo: 'both',
    dangerLevel: 'Crítico / Letal',
    why: 'Causan fallo renal agudo e irreversible incluso en cantidades mínimas de una sola uva.',
    symptoms: 'Vómitos inmediatos, letargo intenso, deshidratación e interrupción total de la producción de orina.',
    iconName: 'Skull',
  },
  {
    id: 'xilitol',
    name: 'Xilitol (Edulcorante)',
    category: 'mortal',
    appliesTo: 'dog',
    dangerLevel: 'Crítico en perros',
    why: 'Presente en chicles, mantequilla de maní light y pastelería. Dispara una liberación masiva de insulina.',
    symptoms: 'Hipoglucemia fulminante, pérdida de coordinación, colapso y fallo hepático agudo.',
    iconName: 'Ban',
  },
  {
    id: 'masa_cruda',
    name: 'Masa Cruda con Levadura',
    category: 'mortal',
    appliesTo: 'both',
    dangerLevel: 'Emergencia Crítica / Letal',
    why: 'La levadura continúa fermentando dentro del ambiente cálido y húmedo del estómago, expandiéndose de forma desmedida (riesgo extremo de dilatación y torsión gástrica) y liberando alcohol etílico que pasa a la sangre.',
    symptoms: 'Distensión e hinchazón abdominal severa, dolor agudo, debilidad, marcha tambaleante, hipotermia, coma y fallo respiratorio por intoxicación alcohólica.',
    iconName: 'AlertOctagon',
  },
  {
    id: 'huesos_cocidos',
    name: 'Huesos Cocidos (Pollo, Res o Cerdo)',
    category: 'mortal',
    appliesTo: 'both',
    dangerLevel: 'Emergencia Quirúrgica / Letal',
    why: 'La cocción deshidrata y cristaliza la estructura del hueso haciéndolo astillable y quebradizo en agujas afiladas. Solo se pueden suministrar huesos carnosos 100% crudos bajo dietas supervisadas (BARF).',
    symptoms: 'Perforación de esófago, estómago o intestinos, desgarros internos con hemorragia digestiva, asfixia u obstrucción intestinal mortal.',
    iconName: 'Flame',
  },
  {
    id: 'nueces_macadamia',
    name: 'Nueces de Macadamia',
    category: 'mortal',
    appliesTo: 'both',
    dangerLevel: 'Altamente Tóxico / Crítico',
    why: 'Poseen un compuesto tóxico exclusivo que afecta severamente el sistema neuromuscular periférico de perros y gatos incluso en dosis mínimas.',
    symptoms: 'Ataxia pronunciada (incapacidad para mantenerse en pie), debilidad marcada en patas traseras, temblores musculares, vómitos, rigidez e hipertermia grave.',
    iconName: 'AlertTriangle',
  },

  // --- CATEGORÍA PRECAUCIÓN / PELIGROSO (EVITAR CONSUMO HABITUAL) ---
  {
    id: 'cebolla',
    name: 'Cebolla, Ajo y Puerro',
    category: 'danger',
    appliesTo: 'both',
    dangerLevel: 'Muy Peligroso / Anemia Hemolítica',
    why: 'Contienen tiosulfatos y alilpropilos que destruyen los glóbulos rojos, provocando anemia hemolítica severa (tanto crudos como cocidos o en polvo).',
    symptoms: 'Encías pálidas o amarillentas, orina rojiza u oscura, fatiga extrema, taquicardia y falta de aire.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'pan_blanco',
    name: 'Pan Blanco y Productos Horneados',
    category: 'danger',
    appliesTo: 'both',
    dangerLevel: 'Evitar consumo habitual / Sobrecarga digestiva',
    why: 'Carbohidrato refinado de relleno sin ningún aporte nutricional de calidad para carnívoros. Promueve la obesidad y altera la flora digestiva. (Aviso: la masa cruda con levadura sí es mortal).',
    symptoms: 'Gases intestinales, distensión abdominal pesada, desbalance metabólico, acumulación de grasa visceral y formación acelerada de sarro.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'queso_lacteos',
    name: 'Queso, Leche y Lácteos',
    category: 'danger',
    appliesTo: 'both',
    dangerLevel: 'Intolerancia a la Lactosa y Grasa',
    why: 'La inmensa mayoría de perros y gatos adultos carecen de la enzima lactasa para descomponer la lactosa de la leche de vaca. Los quesos curados aportan además un exceso peligroso de grasa y sodio.',
    symptoms: 'Gases dolorosos, cólicos abdominales, vómitos, diarreas líquidas persistentes y riesgo de pancreatitis en variedades ricas en grasa.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'atun_enlatado',
    name: 'Atún en Lata para Humanos',
    category: 'danger',
    appliesTo: 'both',
    dangerLevel: 'No apto para consumo habitual',
    why: 'Diseñado con cantidades de sodio y conservantes excesivas para animales. En gatos, su consumo frecuente bloquea la absorción de tiamina (vitamina B1), desgasta los riñones y acumula mercurio.',
    symptoms: 'Sobrecarga renal progresiva, deshidratación por exceso de sal, esteatitis (enfermedad de la grasa amarilla) y neuropatías por carencia de tiamina.',
    iconName: 'AlertTriangle',
  },
  {
    id: 'embutidos_salchichas',
    name: 'Embutidos, Salchichas y Jamón',
    category: 'danger',
    appliesTo: 'both',
    dangerLevel: 'Alto Riesgo de Pancreatitis y Sodio',
    why: 'Contienen concentraciones extremadamente altas de sal, grasas saturadas, condimentos irritantes (cebolla y ajo en polvo) y nitritos/nitratos conservantes nocivos.',
    symptoms: 'Pancreatitis aguda de urgencia (dolor abdominal en postura de rezo, vómitos biliares violentos), daño renal súbito e hipertensión.',
    iconName: 'Flame',
  },

  // --- CATEGORÍA SUPERFOOD (SEGUROS / SNACKS NUTRITIVOS) ---
  {
    id: 'huevo_cocido',
    name: 'Huevo Cocido',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Proteína de Oro de Alto Valor Biológico',
    why: 'Aporte extraordinario de aminoácidos esenciales, colina, hierro y vitaminas A y B12. Debe darse SIEMPRE cocido (hervido o revuelto sin sal ni aceite); nunca crudo para erradicar el riesgo de Salmonella y evitar que la avidina bloquee la biotina.',
    symptoms: 'Estimula el desarrollo muscular, fortalece la densidad y brillo del pelaje, y ofrece alta saciedad proteica en dietas equilibradas.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'pescado_salmon',
    name: 'Salmón y Pescado Blanco Cocido',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Snack Saludable Rico en Omega-3',
    why: 'Excelente fuente de ácidos grasos EPA y DHA con propiedades antiinflamatorias naturales. Debe ofrecerse SIEMPRE cocido (hervido o a la plancha sin aceites) y rigurosamente limpio de espinas.',
    symptoms: 'Alivia picores y alergias en la piel, brinda un pelaje suave y reluciente, protege las articulaciones y favorece la función cardíaca y cognitiva.',
    iconName: 'Sparkles',
  },
  {
    id: 'arroz_blanco',
    name: 'Arroz Blanco Cocido',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Digestivo y Suave para Dieta Blanda',
    why: 'Carbohidrato de absorción rápida y muy bajo residuo. Es el alimento de referencia para dietas blandas de reposo gastrointestinal durante trastornos digestivos leves. Preparar hervido únicamente en agua, sin sal, ajo ni condimentos.',
    symptoms: 'Protege y calma la mucosa gástrica irritada, ayuda a compactar las deposiciones en cuadros de heces blandas y restituye energía sin fatiga digestiva.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'ahuyama_calabaza',
    name: 'Ahuyama / Calabaza Cocida',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Regulador Intestinal Natural',
    why: 'Fibra soluble excepcional cargada de agua y betacarotenos. Es el mejor regulador digestivo natural tanto para cortar diarreas blandas como para combatir el estreñimiento y facilitar la expulsión de bolas de pelo en gatos.',
    symptoms: 'Normaliza la consistencia fecal, mejora el tránsito intestinal, sacia el apetito en mascotas con sobrepeso y aporta vitaminas antioxidantes A y C.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'manzana',
    name: 'Manzana (sin semillas ni corazón)',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Excelente Snack Saludable',
    why: 'Aporta fibra soluble, vitamina A y C. Las semillas y el corazón NUNCA deben ofrecerse porque contienen glucósidos cianogénicos (trazas de cianuro).',
    symptoms: 'Mejora la digestión, refresca el aliento y colabora en la limpieza mecánica de las encías al masticar.',
    iconName: 'CheckCircle2',
  },
  {
    id: 'zanahoria',
    name: 'Zanahoria Cruda o Cocida',
    category: 'superfood',
    appliesTo: 'both',
    dangerLevel: 'Snack Perfecto Bajo en Calorías',
    why: 'Rica en betacarotenos y antioxidantes, con mínimo aporte calórico. Al morderse cruda actúa como un cepillo de dientes natural.',
    symptoms: 'Promueve la salud ocular y digestiva, calma la ansiedad de morder y entretiene saludablemente sin añadir grasas.',
    iconName: 'Sparkles',
  },
];

export const HEALTH_AND_NUTRITION_GUIDES: HealthGuide[] = [
  {
    id: 'etiquetas',
    title: 'Cómo leer la etiqueta de un alimento (Regla de Oro)',
    subtitle: 'Aprende a identificar comida de calidad sin dejarte engañar por el empaque',
    badge: 'Ahorro y Salud',
    keyPoints: [
      {
        title: 'Primer ingrediente debe ser carne identificada',
        desc: 'Busca "Pollo deshidratado", "Carne fresca de res" o "Salmón". Huye de los que digan "Subproductos de ave" o "Harina de carne y hueso" sin especificar la especie.',
      },
      {
        title: 'Cuidado con la fragmentación de cereales',
        desc: 'Si una bolsa lista "Maíz", "Gluten de maíz" y "Harina de maíz" por separado, en realidad el ingrediente #1 es maíz y no carne.',
      },
      {
        title: 'Proteína y Grasa según etapa',
        desc: 'Cachorros necesitan mínimo 28% de proteína y 15% de grasa. Perros adultos de mantenimiento 22-26% proteína. Gatos necesitan mínimo 30-36% de proteína obligatoria.',
      },
    ],
    warningNote: 'En gatos, comprueba SIEMPRE que incluya Taurina añadida. Los felinos no pueden sintetizarla y su carencia provoca ceguera irreversible y fallo cardíaco.',
  },
  {
    id: 'transicion',
    title: 'La Regla de los 7 Días para Cambiar de Alimento',
    subtitle: 'Evita diarreas, vómitos y rechazo estomacal al cambiar de marca o fórmula',
    badge: 'Guía Práctica',
    keyPoints: [
      {
        title: 'Días 1 y 2 (75% antiguo / 25% nuevo)',
        desc: 'Permite que la flora bacteriana intestinal reconozca la nueva fuente de nutrientes sin alterarse.',
      },
      {
        title: 'Días 3 y 4 (50% antiguo / 50% nuevo)',
        desc: 'Revisa la consistencia de las heces. Si están normales, avanza con total tranquilidad.',
      },
      {
        title: 'Días 5 y 6 (25% antiguo / 75% nuevo)',
        desc: 'El estómago ya metaboliza mayoritariamente la nueva proteína.',
      },
      {
        title: 'Día 7 en adelante (100% nuevo)',
        desc: 'Transición completada con éxito sin estrés digestivo para tu mascota.',
      },
    ],
    warningNote: 'Nunca cambies de golpe de una marca económica a una súper premium o viceversa; el cambio drástico de grasa suele provocar gastroenteritis aguda.',
  },
  {
    id: 'ansiedad_comida',
    title: 'Comederos Lentos y Prevención de Torsión Gástrica',
    subtitle: 'Por qué comer con prisa puede ser una emergencia médica fatal',
    badge: 'Seguridad Vital',
    keyPoints: [
      {
        title: 'El peligro de la aerofagia',
        desc: 'Tragar croquetas enteras sin masticar introduce aire en el estómago. En razas medianas y grandes puede provocar Torsión de Estómago (emergencia quirúrgica de minutos).',
      },
      {
        title: 'Platos con laberinto o alfombras de olfato',
        desc: 'Obligan a tu mascota a usar la lengua y el hocico, convirtiendo un devorado de 30 segundos en una sesión calmada de 10 minutos.',
      },
      {
        title: 'Estimulación mental y saciedad',
        desc: 'El esfuerzo de búsqueda olfativa libera endorfinas y reduce drásticamente la ansiedad y la hiperactividad en casa.',
      },
    ],
  },
];

/**
 * Parsea el rango típico de peso de una raza (ej. "25 - 36 kg")
 */
export function parseBreedWeightRange(typicalWeightStr?: string): { min: number; max: number; avg: number } | null {
  if (!typicalWeightStr) return null;
  const matches = typicalWeightStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (matches) {
    const min = parseFloat(matches[1]);
    const max = parseFloat(matches[2]);
    return { min, max, avg: Number(((min + max) / 2).toFixed(1)) };
  }
  return null;
}

/**
 * Calcula o estima el peso ideal basado en estándares de raza o condición corporal (FEDIAF/NRC)
 */
export function getSuggestedIdealWeight(profile: PetProfile): number {
  // Si el usuario/veterinario fijó explícitamente un peso ideal positivo, priorizarlo
  if (profile.idealWeightKg && profile.idealWeightKg > 0) {
    return profile.idealWeightKg;
  }

  // 1. Estándar morfométrico de la raza
  const breedInfo = POPULAR_BREEDS.find(b => b.id === profile.breedId);
  const breedWeight = parseBreedWeightRange(breedInfo?.typicalWeight);

  if (breedWeight) {
    return breedWeight.avg;
  }

  // 2. Estimación por condición corporal si no hay raza definida
  if (profile.condition === 'overweight') {
    return Number((profile.weightKg * 0.85).toFixed(1));
  }
  if (profile.condition === 'underweight') {
    return Number((profile.weightKg * 1.15).toFixed(1));
  }

  // 3. Si está en condición ideal o no se especifica
  return profile.weightKg;
}

