export type CountryCode = 'CO' | 'MX' | 'AR' | 'CL' | 'PE' | 'ES' | 'US' | 'GLOBAL';


export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
}


export const COUNTRIES: CountryInfo[] = [
  { code: 'GLOBAL', name: 'Internacional / General', flag: '🌎', currency: 'USD' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'MXN' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN' },
  { code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
];


export type FoodTier = 
  | 'top_recommended'      // Top Recomendadas (Veterinarios + Calidad Probada)
  | 'natural_premium'      // Marcas Naturales Premium (Sin límite de presupuesto)
  | 'excellent_value'      // Excelente Valor (Mejor Calidad/Precio)
  | 'budget_friendly'      // Económicas Aceptables (Presupuesto ajustado)
  | 'emergency_only';      // Solo Emergencias (No uso continuo)


export interface PetFoodBrand {
  id: string;
  name: string;
  tier: FoodTier;
  appliesTo: 'dog' | 'cat' | 'both';
  countries: CountryCode[];
  proteinSource: string;
  pros: string;
  notes: string;
  canMixWithBarf: boolean;
  mixGuidelines: string;
}


export const COUNTRY_FOOD_CATALOG: PetFoodBrand[] = [
  // --- TOP RECOMENDADAS (Veterinarios + Calidad Probada) ---
  {
    id: 'royal_canin',
    name: 'Royal Canin (Breed & Care)',
    tier: 'top_recommended',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Proteínas L.I.P. de alta asimilación (ave deshidratada, gluten de trigo hidrolizado)',
    pros: 'Croquetas con diseño ergonómico por raza, respaldo clínico y balance milimétrico de minerales.',
    notes: 'Especialista en prevención urinaria en gatos y salud articular según raza.',
    canMixWithBarf: true,
    mixGuidelines: 'Para dietas mixtas, alternar días o usar croquetas en el desayuno y dieta cocida/BARF en la cena.'
  },
  {
    id: 'hills_science_diet',
    name: "Hill's Science Diet",
    tier: 'top_recommended',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Pollo deshidratado, cordero, cebada perlada, arroz integral',
    pros: 'Fórmulas testeadas por veterinarios, excelente control de pH urinario y piel sensible.',
    notes: 'Estándar de oro clínico para salud digestiva y longevidad.',
    canMixWithBarf: true,
    mixGuidelines: 'Compatible en esquemas mixtos alternos (mañana y noche).'
  },
  {
    id: 'pro_plan',
    name: 'Purina Pro Plan (OptiHealth / LiveClear)',
    tier: 'top_recommended',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Carne real de pollo o salmón como 1er ingrediente, arroz cervecero',
    pros: 'Contiene calostro y espirulina para defensas, muy palatable, fácil de conseguir.',
    notes: 'Líder en confiabilidad y heces firmes y compactas.',
    canMixWithBarf: true,
    mixGuidelines: 'Combinable con BARF o comida casera cocida en comidas separadas.'
  },


  // --- NATURAL PREMIUM (Sin límite de presupuesto) ---
  {
    id: 'orijen_acana',
    name: 'Orijen / Acana',
    tier: 'natural_premium',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Carne fresca y deshidratada (pollo de corral, pavo, pescado entero, huevos)',
    pros: 'Sin granos, 70-85% carne real, ingredientes frescos aptos para consumo humano.',
    notes: 'Excelente digestibilidad, alto valor biológico. Requiere transición lenta por su alta densidad.',
    canMixWithBarf: true,
    mixGuidelines: 'Ideal para esquema mixto 50/50 separando comidas (Croquetas en la mañana y BARF en la noche con 8-10 horas de diferencia).'
  },
  {
    id: 'taste_of_the_wild',
    name: 'Taste of the Wild',
    tier: 'natural_premium',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Búfalo, salmón ahumado, venado asado, pato',
    pros: 'Sin cereales, probióticos K9 cepa viva, antioxidantes de frutos rojos.',
    notes: 'Muy apetecible y recomendada para animales con intolerancia al maíz o trigo.',
    canMixWithBarf: true,
    mixGuidelines: 'Separar tomas por 8 horas. No mezclar juntas en el mismo plato para evitar fermentación dispar.'
  },
  {
    id: 'farmina_nd',
    name: 'Farmina N&D (Natural & Delicious)',
    tier: 'natural_premium',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'CL', 'PE', 'ES'],
    proteinSource: 'Pollo, cordero, jabalí, bacalao con granada / naranja',
    pros: 'Bajo índice glucémico (con avena/espelta o grain-free), 90%+ proteína de origen animal.',
    notes: 'Líder en nutrición funcional europea con gran tolerancia digestiva.',
    canMixWithBarf: true,
    mixGuidelines: 'Acepta alternancia diaria con carne cruda magra en tomas separadas.'
  },
  {
    id: 'bravery',
    name: 'Bravery Pet Food (Grain Free)',
    tier: 'natural_premium',
    appliesTo: 'both',
    countries: ['CO', 'CL', 'PE', 'ES'],
    proteinSource: 'Mono-proteico (100% cerdo ibérico, salmón o cordero)',
    pros: 'Monoproteico e hipoalergénico, 100% natural sin gluten.',
    notes: 'Muy popular en España, Colombia y Chile para mascotas con alergias severas.',
    canMixWithBarf: true,
    mixGuidelines: 'Excelente para rotar con BARF de la misma proteína para evitar sensibilidades.'
  },
  {
    id: 'instinct_raw',
    name: "Instinct Raw Boost / Nature's Variety",
    tier: 'natural_premium',
    appliesTo: 'both',
    countries: ['GLOBAL', 'MX', 'US', 'ES'],
    proteinSource: 'Carne cruda liofilizada (Freeze-dried raw) + croqueta libre de granos',
    pros: 'Combina lo mejor de la croqueta con bocados crudos liofilizados reales.',
    notes: 'La transición más natural entre concentrado y dieta BARF.',
    canMixWithBarf: true,
    mixGuidelines: 'Totalmente formulada con filosofía cruda; transición a BARF muy suave.'
  },


  // --- EXCELENTE VALOR (Mejor Calidad/Precio) ---
  {
    id: 'diamond_naturals',
    name: 'Diamond Naturals',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'US'],
    proteinSource: 'Carne de cordero deshidratada, pollo de corral, superalimentos (chía, arándanos)',
    pros: 'Excelente relación costo/beneficio, sin maíz, trigo ni soya añadida.',
    notes: 'Una de las opciones más recomendadas por educadores caninos por su balance económico.',
    canMixWithBarf: true,
    mixGuidelines: 'Acepta integración con BARF respetando el intervalo de digestión de 8 horas.'
  },
  {
    id: 'monello_birbo',
    name: 'Monello / Monello Select',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['CO', 'PE', 'CL', 'AR'],
    proteinSource: 'Harina de vísceras de pollo, salmón, huevo en polvo',
    pros: 'Sin colorantes ni aromatizantes artificiales, extracto de Yucca para poco olor.',
    notes: 'Muy popular en Colombia, Perú y Cono Sur por su excelente digestibilidad a precio accesible.',
    canMixWithBarf: true,
    mixGuidelines: 'Ideal para familias con presupuesto moderado que quieren complementar con BARF los fines de semana.'
  },
  {
    id: 'nupec',
    name: 'Nupec (Nutrición Científica Consciente)',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['MX', 'CO', 'PE'],
    proteinSource: 'Carne de res y pollo, harinas de origen cárnico seleccionado, cereales digestibles',
    pros: 'Formulación veterinaria mexicana de alta palatabilidad con conservadores naturales.',
    notes: 'Marca #1 en México en clínicas veterinarias para dueños que buscan calidad sin pagar precio de importación.',
    canMixWithBarf: true,
    mixGuidelines: 'Separar la comida fresca cruda para la cena y Nupec en la mañana.'
  },
  {
    id: 'vitalcan_complete',
    name: 'Vitalcan Balanced / Complete',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['AR', 'CL', 'PE'],
    proteinSource: 'Harina de pollo y cordero, arroz, pulpa de remolacha',
    pros: 'Excelente industria argentina con balance de Omega 3 y 6 y buena consistencia fecal.',
    notes: 'Referente en Argentina y Cono Sur con líneas específicas para cachorros y adultos.',
    canMixWithBarf: true,
    mixGuidelines: 'Acepta esquema 50/50 con BARF separando turnos.'
  },
  {
    id: 'chunky_super_premium',
    name: 'Chunky / Chunky Delidog (Italcol)',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['CO', 'PE'],
    proteinSource: 'Pollo real, salmón, harina de cordero, arroz',
    pros: 'Elaboración colombiana de alta tecnología con nuggets rellenos y sin colorantes agresivos.',
    notes: 'La opción de confianza en Colombia con alto contenido proteico accesible.',
    canMixWithBarf: true,
    mixGuidelines: 'Combinable con caldo de huesos casero o BARF en turnos separados.'
  },
  {
    id: 'nutra_nuggets',
    name: 'Nutra Nuggets (Gold/Platinum)',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['CO', 'MX', 'CL', 'PE', 'AR'],
    proteinSource: 'Harina de subproductos de pollo de grado calificado, maíz molido, grasa de pollo',
    pros: 'Probada estabilidad en digestión y costo accesible por bulto grande.',
    notes: 'Muy usada en criaderos y hogares con múltiples mascotas.',
    canMixWithBarf: true,
    mixGuidelines: 'Permite alternar con suplementación de carne cruda fresca.'
  },
  {
    id: 'criadores_royal',
    name: 'Criadores / Ownat Classic',
    tier: 'excellent_value',
    appliesTo: 'both',
    countries: ['ES'],
    proteinSource: 'Carne fresca deshidratada (30%), arroz integral, guisantes',
    pros: 'Fabricación española con carne fresca a precio muy competitivo sin colorantes sintéticos.',
    notes: 'Muy popular en España con excelente recepción de palatabilidad.',
    canMixWithBarf: true,
    mixGuidelines: 'Apta para rotación mixta con carnes crudas aptas para consumo humano.'
  },


  // --- ECONÓMICAS ACEPTABLES (Presupuesto ajustado) ---
  {
    id: 'dog_chow_cat_chow',
    name: 'Purina Dog Chow / Cat Chow',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Harinas cárnicas, maíz, soya y derivados de cereales',
    pros: 'Disponibilidad universal en supermercados y tiendas de barrio; precio muy económico.',
    notes: 'Mayor porcentaje de carbohidratos. Requiere raciones un poco más voluminosas.',
    canMixWithBarf: true,
    mixGuidelines: '⚠️ OJO AL MEZCLAR: Al tener más cereales, se digiere en 10-12h. Si vas a dar BARF, dalo en tomas totalmente separadas (ej. Mañana Dog Chow, Noche BARF ligero).'
  },
  {
    id: 'pedigree_whiskas',
    name: 'Pedigree / Whiskas',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['GLOBAL', 'CO', 'MX', 'AR', 'CL', 'PE', 'ES', 'US'],
    proteinSource: 'Subproductos cárnicos, cereales molidos, harina de soya',
    pros: 'Fácilmente accesible para cualquier presupuesto familiar.',
    notes: 'Contiene colorantes en algunas variedades. Cumple los mínimos nutricionales de mantenimiento.',
    canMixWithBarf: true,
    mixGuidelines: 'Se recomienda complementar con huevo cocido o caldo de huesos sin sal para elevar el perfil de aminoácidos.'
  },
  {
    id: 'mirringo_ringo',
    name: 'Ringo / Mirringo (Económico Colombia)',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['CO', 'PE'],
    proteinSource: 'Harina de carne y hueso, subproductos de cereales, grasa animal',
    pros: 'El alimento más económico y accesible del mercado en Colombia y países andinos.',
    notes: 'Adecuado para presupuestos ajustados. Se beneficia enormemente de suplementación con proteína fresca.',
    canMixWithBarf: true,
    mixGuidelines: 'Recomendadísimo complementar con dieta mixta (añadir trozos de carne magra cocida o cruda en tomas separadas para mejorar nutrición).'
  },
  {
    id: 'ganador_minino',
    name: 'Ganador / Minino Plus (México)',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['MX'],
    proteinSource: 'Harinas de carne de ave y res, cereales seleccionados, grasa estabilizada',
    pros: 'Líder en ventas de supermercado en México; mejor calidad que marcas genéricas.',
    notes: 'Línea "Ganador Premium" ofrece un salto de calidad a bajo costo.',
    canMixWithBarf: true,
    mixGuidelines: 'Acepta alternancia con BARF en horarios separados.'
  },
  {
    id: 'raza_gati',
    name: 'Raza / Gati (Argentina)',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['AR'],
    proteinSource: 'Harinas cárnicas mixtas, maíz y derivados vegetales',
    pros: 'Económico y de amplia llegada en Argentina.',
    notes: 'Opción básica de supermercado.',
    canMixWithBarf: true,
    mixGuidelines: 'Separar de tomas de alimentos crudos por 8 a 10 horas.'
  },
  {
    id: 'cannes_felix',
    name: 'Cannes / Champion Dog / Felix (Chile)',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['CL'],
    proteinSource: 'Harinas cárnicas, maíz, subproductos de trigo',
    pros: 'Ampliamente consumido en Chile con precio muy accesible.',
    notes: 'Para perros de actividad baja o moderada.',
    canMixWithBarf: true,
    mixGuidelines: 'Separar horarios para facilitar la digestión gástrica.'
  },
  {
    id: 'brekkies_friskies',
    name: 'Brekkies / Friskies (España)',
    tier: 'budget_friendly',
    appliesTo: 'both',
    countries: ['ES'],
    proteinSource: 'Cereales, carnes y subproductos animales, extractos de proteínas vegetales',
    pros: 'Económico en hipermercados españoles.',
    notes: 'Opción básica.',
    canMixWithBarf: true,
    mixGuidelines: 'Separar tomas para evitar fermentación gástrica dispar.'
  }
];


export interface MixedDietGuide {
  title: string;
  subtitle: string;
  goldenRules: {
    rule: string;
    explanation: string;
    icon: string;
  }[];
  safeMixtures: {
    type: string;
    howTo: string;
    safetyLevel: 'safe' | 'caution' | 'forbidden';
    details: string;
  }[];
}


export const MIXED_DIET_KNOWLEDGE: MixedDietGuide = {
  title: 'Guía de Dieta Mixta: Concentrado / Croquetas + BARF / Natural',
  subtitle: 'Cómo combinar alimentos secos y comida fresca cruda o cocida sin provocar diarreas ni problemas digestivos',
  goldenRules: [
    {
      rule: 'REGLA #1: Separar tomas en horarios diferentes (Mínimo 8 a 10 horas)',
      explanation: 'Las croquetas secas tardan entre 10 y 14 horas en digerirse por su alta cantidad de almidón y fibra vegetal, mientras que la carne cruda (BARF) se digiere en solo 4 a 5 horas por la acidez gástrica (pH 1-2). Si las mezclas juntas en el mismo plato, la carne se queda retenida fermentando con la croqueta, provocando gases, vómitos y diarreas.',
      icon: '⏰'
    },
    {
      rule: 'REGLA #2: Proporción 50/50 o 70/30 (Para ajustar al presupuesto)',
      explanation: 'Si no puedes comprar solo croquetas caras o solo BARF todo el mes: Dale el 50% de su ración calculada en croquetas en la mañana, y el 50% de su ración en dieta fresca (carne, vísceras y verduras) en la noche. O croquetas de lunes a viernes y BARF los fines de semana.',
      icon: '⚖️'
    },
    {
      rule: 'REGLA #3: Mezclas Seguras en el MISMO plato',
      explanation: '¿Qué SÍ puedes mezclar directamente en el plato de croquetas sin esperar horas? Caldo de huesos tibio (sin sal, cebolla ni condimentos), huevo crudo o cocido entero (1 a 2 veces por semana), kefir natural sin azúcar, o una cucharada de puré de calabaza/zapallo cocido.',
      icon: '🍲'
    },
    {
      rule: 'REGLA #4: ¿Se pueden mezclar dos marcas de croquetas distintas?',
      explanation: 'SÍ se pueden mezclar dos marcas de croquetas (por ejemplo, una Premium con una Básica para mejorar el sabor y nutrición sin gastar tanto). La clave es que ambas sean de similar densidad o hacer una transición previa para que la flora intestinal se adapte a ambas proteínas.',
      icon: '🔄'
    }
  ],
  safeMixtures: [
    {
      type: 'Croquetas + Caldo de Huesos Natural',
      howTo: 'Añadir 2 a 4 cucharadas de caldo tibio sobre las croquetas al momento de servir.',
      safetyLevel: 'safe',
      details: '100% seguro y muy saludable. Hidrata las croquetas, cuida los riñones y aporta colágeno natural para las articulaciones.'
    },
    {
      type: 'Croquetas + Huevo (Crudo o Pochado)',
      howTo: 'Colocar un huevo sobre las croquetas 2 veces por semana.',
      safetyLevel: 'safe',
      details: 'Aporta la proteína de mayor valor biológico del planeta, biotina y ácidos grasos para un pelaje brillante.'
    },
    {
      type: 'Croquetas (Mañana) + BARF / Carne (Noche)',
      howTo: '50% de la ración diaria en la mañana y 50% de carne fresca cruda o cocida en la noche (8h después).',
      safetyLevel: 'safe',
      details: 'El método ideal recomendado por nutricionistas veterinarios para dueños que quieren dar comida real sin perder la comodidad del concentrado.'
    },
    {
      type: 'Mezclar Marca Top + Marca Económica en el mismo plato',
      howTo: 'Mezclar 50% de concentrado Top (ej. Pro Plan / Nupec) con 50% de concentrado económico (ej. Dog Chow / Ringo / Ganador).',
      safetyLevel: 'safe',
      details: 'Excelente estrategia de ahorro familiar: eleva el porcentaje global de proteína y digestibilidad sin duplicar el presupuesto mensual.'
    },
    {
      type: 'Croquetas Secas + Carne Cruda (BARF) Revueltas en el MISMO Plato',
      howTo: 'Poner mitad croquetas y mitad carne molida cruda juntas en una sola comida.',
      safetyLevel: 'forbidden',
      details: '⛔ NO RECOMENDADO: Tienen tiempos de digestión y pH gástrico radicalmente distintos. Puede causar heces pastosas, vómitos y fermentación bacteriana excesiva.'
    }
  ]
};