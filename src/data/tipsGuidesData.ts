export interface DetailedGuide {
  id: string;
  category: 'dental' | 'bathing' | 'coat' | 'fleas' | 'emergencies' | 'nutrition';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  frequency: string;
  speciesTarget: 'both' | 'dog' | 'cat';
  dogSpecific: {
    frequency: string;
    products: string[];
    steps: { title: string; desc: string }[];
    donts: string[];
  };
  catSpecific: {
    frequency: string;
    products: string[];
    steps: { title: string; desc: string }[];
    donts: string[];
  };
  keyTakeaways: { title: string; desc: string; iconName?: string }[];
  warningNote: string;
  emergencyStepByStep?: string[];
}

export const DETAILED_CARE_GUIDES: DetailedGuide[] = [
  {
    id: 'dental-care',
    category: 'dental',
    title: 'Cuidado Dental y Prevención de Sarro',
    subtitle: 'Protege las encías, previene la pérdida prematura de piezas y elimina el mal aliento',
    badge: 'Higiene Bucal',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    frequency: '2 a 3 veces por semana',
    speciesTarget: 'both',
    dogSpecific: {
      frequency: '2 a 4 veces por semana (mínimo 2 veces)',
      products: [
        'Pasta dental enzimática para perros (sabor pollo o carne)',
        'Cepillo de cerdas suaves de doble cabezal o dedal de silicona',
        'Mordedores dentales de caucho natural o astas de ciervo naturales',
        'Aditivo para el agua con algas Ascophyllum nodosum (ablanda el sarro)'
      ],
      steps: [
        {
          title: '1. Acostumbramiento gradual',
          desc: 'Deja que lama un poco de pasta dental enzimática de tu dedo durante 3 días para asociarla con un premio.'
        },
        {
          title: '2. Técnica de cepillado exterior',
          desc: 'Levanta el labio superior y cepilla en círculos sobre colmillos y muelas posteriores a 45 grados de la encía. No es necesario abrir la mandíbula completa.'
        },
        {
          title: '3. Enzimas sin enjuague',
          desc: 'Las pastas veterinarias no requieren enjuague y sus enzimas activas continúan desprendiendo bacterias tras el cepillado.'
        }
      ],
      donts: [
        'NUNCA uses pasta dental humana: contiene flúor y xilitol, altamente tóxicos y mortales para perros.',
        'No des huesos cocidos: se astillan y fracturan dientes o perforan el estómago.',
        'No ignores el mal aliento persistente (halitosis): indica bacterias avanzadas o enfermedad renal/hepática.'
      ]
    },
    catSpecific: {
      frequency: '2 a 3 veces por semana',
      products: [
        'Dedal de microfibra suave o gasa estéril humedecida',
        'Gel oral enzimático felino con sabor a malta o pescado',
        'Solución de clorhexidina oral veterinaria al 0.12%',
        'Snacks crujientes dentales con sello VOHC (Veterinary Oral Health Council)'
      ],
      steps: [
        {
          title: '1. Masaje con dedal o gasa',
          desc: 'Aplica una gota de gel enzimático en la gasa o dedal y frota suavemente los colmillos y premolares superiores por los laterales.'
        },
        {
          title: '2. Aplicación directa sin cepillar',
          desc: 'Si el gato rechaza el cepillo, coloca una gota de gel en los labios; al lamerse lo distribuirá por toda la dentadura.'
        },
        {
          title: '3. Inspección periódica',
          desc: 'Observa si hay encías enrojecidas o babeo, ya que más del 70% de los gatos mayores de 3 años padecen Lesión de Reabsorción Dental (FORL).'
        }
      ],
      donts: [
        'No fuerces el cepillado si el gato se estresa demasiado; usa geles orales pasivos.',
        'Jamás uses productos humanos con mentol o alcohol, causan quemaduras químicas bucales.',
        'No ignores si el gato mastica solo de un lado o tira la comida de la boca: es signo de dolor agudo.'
      ]
    },
    keyTakeaways: [
      {
        title: 'La pasta veterinaria se traga',
        desc: 'Las pastas especiales para mascotas no hacen espuma y están diseñadas para ser digeridas con total seguridad.'
      },
      {
        title: 'Consecuencias del sarro acumulado',
        desc: 'Las bacterias de la boca viajan por el torrente sanguíneo hacia el corazón (endocarditis) y los riñones.'
      },
      {
        title: 'Profilaxis ultrasónica en clínica',
        desc: 'Cuando el sarro está petrificado en marrón, el cepillo ya no lo quita; se necesita limpieza veterinaria profesional.'
      }
    ],
    warningNote: 'Si observas encías que sangran al tacto, piezas dentales flojas o pus alrededor de la raíz, acude a revisión veterinaria de inmediato.'
  },
  {
    id: 'bathing-hygiene',
    category: 'bathing',
    title: 'Frecuencia de Baño y Productos Adecuados',
    subtitle: 'Aprende cada cuánto bañarlos, qué champú usar y cómo proteger la barrera de su piel',
    badge: 'Higiene & Baño',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    frequency: 'Perros: Cada 3-6 semanas | Gatos: Solo en seco o emergencias',
    speciesTarget: 'both',
    dogSpecific: {
      frequency: 'Cada 3 a 6 semanas (dependiendo de la actividad y pelaje)',
      products: [
        'Champú con pH neutro canino (pH 6.5 a 7.5)',
        'Champú de avena coloidal o aloe vera para pieles sensibles',
        'Acondicionador desenredante para mantos largos',
        'Toallas absorbentes de microfibra y secador con aire tibio/frío'
      ],
      steps: [
        {
          title: '1. Cepillado previo en seco',
          desc: 'Elimina nudos y suciedad superficial antes de mojar el pelo, ya que el agua aprieta los nudos y dificulta desenredarlos.'
        },
        {
          title: '2. Agua tibia y cuidado de oídos',
          desc: 'Usa agua tibia (36-37°C). Coloca motas de algodón en las orejas para evitar que entre agua en el canal auditivo y cause otitis.'
        },
        {
          title: '3. Enjabonado y enjuague doble',
          desc: 'Masajea desde el cuello hacia la cola. Enjuaga con abundante agua hasta que no quede ningún residuo jabonoso.'
        },
        {
          title: '4. Secado profundo obligatorio',
          desc: 'Seca a fondo con toalla y secador a temperatura media. La humedad retenida en la raíz causa hongos y "hot spots" (dermatitis húmeda).'
        }
      ],
      donts: [
        'NUNCA uses champú para humanos ni jabón de lavar platos: el pH de la piel humana es ácido (5.5) y destruye la barrera lipídica del perro causando caspa y picores.',
        'No los bañes cada semana con champú común: reseca la piel y agrava el olor.',
        'No uses secador a temperatura muy caliente ni lo acerques a los ojos y nariz.'
      ]
    },
    catSpecific: {
      frequency: 'Generalmente NO requieren baño con agua (se acicalan solos 3-4 horas al día)',
      products: [
        'Espuma de baño en seco sin aclarado especial para gatos',
        'Toallitas húmedas higiénicas sin alcohol ni aromas',
        'Champú felino extra suave hipoalergénico (solo en caso de extrema suciedad)',
        'Guante de masaje húmedo'
      ],
      steps: [
        {
          title: '1. Cuándo es realmente necesario',
          desc: 'Solo baña a un gato con agua si se ensució con sustancias tóxicas/pegajosas, lodo, si es anciano con artrosis o razas sin pelo como el Sphynx (cada 2-4 semanas).'
        },
        {
          title: '2. Lavado en seco preferido',
          desc: 'Aplica espuma de lavado en seco sobre el manto a contrapelo, masajea con una toalla suave y cepilla. Cero estrés y máxima limpieza.'
        },
        {
          title: '3. Si debes bañarlo con agua',
          desc: 'Usa un recipiente bajo con 5-10 cm de agua tibia, coloca una toalla en el fondo para que no resbale y usa una jarra en lugar de la regadera para no asustarlo.'
        }
      ],
      donts: [
        'NUNCA uses productos con aceites esenciales (árbol de té, eucalipto, lavanda, cítricos): son letales para el hígado felino.',
        'No sumerjas su cabeza bajo el agua ni permitas que entre agua a sus oídos.',
        'No obligues al gato si entra en pánico extremo; opta por toallitas y limpieza en seco.'
      ]
    },
    keyTakeaways: [
      {
        title: 'El pH de la piel es diferente',
        desc: 'Perros y gatos tienen un pH entre 6.5 y 7.5. El champú humano (pH 5.5) deshidrata y daña su piel.'
      },
      {
        title: 'Oídos secos previenen infecciones',
        desc: 'La principal causa de otitis tras el baño es el agua retenida en el conducto auditivo en forma de "L".'
      },
      {
        title: 'Gatos Sphynx (sin pelo)',
        desc: 'Requieren baños regulares cada 15 a 30 días porque su piel acumula sebo natural al no tener pelo que lo absorba.'
      }
    ],
    warningNote: 'Tras el baño, asegúrate de que el perro no quede húmedo en las zonas de pliegues (hocico en Bulldogs, axilas e ingles) para prevenir hongos.'
  },
  {
    id: 'coat-care',
    category: 'coat',
    title: 'Cuidado del Pelaje, Cepillado y Brillo',
    subtitle: 'Protocolos para evitar nudos, bolas de pelo en gatos y el secreto de los ácidos grasos Omega 3',
    badge: 'Pelo & Manto',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    frequency: 'Cepillado: 2 a 7 veces por semana según manto',
    speciesTarget: 'both',
    dogSpecific: {
      frequency: 'Pelo corto: 1-2 veces/sem | Pelo largo o doble manto: 3-5 veces/sem o diario en muda',
      products: [
        'Guante de cerdas de goma (para pelo corto como Dálmata, Boxer, Chihuahua)',
        'Carda metálica suave y peine rastrillo deslanador (para Husky, Golden, Pastor, Pastor Alemán)',
        'Aceite de Salmón puro 100% salvaje (rico en EPA y DHA)',
        'Spray desenredante bifásico acondicionador sin aclarado'
      ],
      steps: [
        {
          title: '1. Cepillado por capas en doble manto',
          desc: 'Separa el pelo con una mano y cepilla desde la raíz hacia afuera con el rastrillo para retirar el subpelo muerto sin cortar el pelo de cobertura.'
        },
        {
          title: '2. Suplementación con Omega 3',
          desc: 'Añade 1 dosis diaria de Aceite de Salmón en su comida según su peso. Fortalece los folículos y reduce la caída estacional hasta en un 50%.'
        },
        {
          title: '3. Revisión de zonas críticas de nudos',
          desc: 'Detrás de las orejas, axilas, cuello bajo el collar y entre los muslos son propensos a enredarse; revísalos siempre.'
        }
      ],
      donts: [
        '¡NUNCA RAPES perros de doble capa (Husky, Pomerania, Golden, Samoyedo, Pastor Alemán)! Su manto los aísla del frío y del calor. Raparlos causa alopecia post-corte y quemaduras solares.',
        'No cepilles el pelo largo seco con nudos apretados sin rociar previamente un acondicionador desenredante.',
        'No des suplementos de biotina humana sin supervisión veterinaria.'
      ]
    },
    catSpecific: {
      frequency: 'Pelo corto: 2-3 veces/sem | Pelo largo (Persa, Maine Coon, Angora): Diario',
      products: [
        'Carda pequeña con puntas protegidas y peine metálico de púas finas',
        'Manopla de silicona electrostática para pelo muerto',
        'Pasta de malta felina con sabor a queso o pescado',
        'Hierba gatera o cat grass (aporta fibra para purga natural)'
      ],
      steps: [
        {
          title: '1. Rutina de cepillado positiva',
          desc: 'Cepilla en sesiones cortas de 3 a 5 minutos mientras lo acaricias en la cabeza y barbilla. Premia con un snack al finalizar.'
        },
        {
          title: '2. Pasta de malta anti-bolas de pelo',
          desc: 'Suministra 2 a 3 cm de pasta de malta 2 veces por semana (o a diario durante las épocas de muda de primavera y otoño) para lubricar los pelos tragados y expulsarlos por las heces.'
        },
        {
          title: '3. Desenredo cuidadoso en pelo largo',
          desc: 'Si encuentras un nudo pegado a la piel, usa los dedos o un cortanudos especial. Nunca uses tijeras puntiagudas cerca de la fina piel felina.'
        }
      ],
      donts: [
        'NUNCA cortes nudos con tijeras en gatos: la piel del gato es elástica y finísima, es muy fácil cortar la piel por accidente provocando heridas graves.',
        'No permitas que el gato vomite bolas de pelo con frecuencia; las bolas de pelo grandes pueden causar una obstrucción intestinal que requiere cirugía.',
        'No uses peines con cuchillas afiladas que irriten su piel sensible.'
      ]
    },
    keyTakeaways: [
      {
        title: 'El doble manto es un escudo térmico',
        desc: 'El pelo exterior refleja los rayos del sol y el subpelo crea una cámara de aire que mantiene al perro fresco en verano y abrigado en invierno.'
      },
      {
        title: 'Bolas de pelo (Tricobezoares)',
        desc: 'La pasta de malta y el cepillado diario son la única forma efectiva de prevenir cirugías por obstrucción gástrica en gatos de pelo largo.'
      },
      {
        title: 'Brillo proviene desde adentro',
        desc: 'Un pelo opaco o quebradizo es el primer síntoma de un alimento bajo en proteínas nobles o deficiente en grasas saludables.'
      }
    ],
    warningNote: 'Si notas zonas calvas circulares (alopecias), costras, caspa excesiva o heridas por rascado, consulta al veterinario para descartar tiña, sarna o alergia alimentaria.'
  },
  {
    id: 'flea-tick-control',
    category: 'fleas',
    title: 'Remedios para Pulgas, Garrapatas y Parásitos',
    subtitle: 'Guía de antiparasitarios orales, pipetas, collares y el protocolo seguro para el hogar',
    badge: 'Antiparasitarios',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    frequency: 'Tópicos/Orales: Cada 1 a 3 meses | Internos: Cada 3 meses',
    speciesTarget: 'both',
    dogSpecific: {
      frequency: 'Pastillas: Cada 1-3 meses | Pipetas: Cada 4 semanas | Collar: 6-8 meses',
      products: [
        'Pastillas orales masticables (Isoxazolinas: Bravecto, Nexgard, Simparica, Credelio)',
        'Pipetas spot-on de aplicación dérmica (Fipronil, Imidacloprid, Permetrina)',
        'Collares antiparasitarios de liberación prolongada (ej. Seresto)',
        'Pastillas desparasitantes internas de amplio espectro (Praziquantel, Febantel, Pirantel)'
      ],
      steps: [
        {
          title: '1. Elegir el método según estilo de vida',
          desc: 'Si tu perro nada o se baña con frecuencia, las pastillas orales son más efectivas porque no pierden potencia con el agua.'
        },
        {
          title: '2. Aplicación correcta de pipeta',
          desc: 'Separa el pelo en la nuca y entre los omóplatos hasta ver la piel desnuda. Vierte todo el líquido directo sobre la piel. No bañes 48h antes ni 48h después.'
        },
        {
          title: '3. Desparasitación interna trimestral',
          desc: 'Administra la pastilla desparasitante interna cada 3 meses para protegerlo de gusanos intestinales (tenias, áscaris) que transmiten las pulgas al ser ingeridas.'
        }
      ],
      donts: [
        'No uses collares insecticidas baratos de supermercado: emiten gases irritantes y tienen baja eficacia contra garrapatas.',
        'No apliques pipetas sobre heridas abiertas o piel irritada.',
        'No olvides que 1 sola pulga puede poner hasta 50 huevos al día en tus alfombras y sofás.'
      ]
    },
    catSpecific: {
      frequency: 'Pipetas felinas mensuales | Desparasitación interna cada 3 meses',
      products: [
        'Pipetas felinas integrales (Revolution Plus, Bravecto Plus felino, Broadline, Advocate Cat, Frontline Cat)',
        'Peine antipulgas metálico de dientes ultra juntos',
        'Pastillas internas específicas para gatos (Milbemicina, Praziquantel en tamaño pequeño)'
      ],
      steps: [
        {
          title: '1. Aplicación en la base de la nuca',
          desc: 'Aplica la pipeta en la parte más alta de la nuca, justo en la base del cráneo, donde el gato no alcance a lamerse durante su acicalamiento.'
        },
        {
          title: '2. Protección contra ácaros de las orejas',
          desc: 'Las pipetas modernas felinas eliminan también los ácaros Otodectes cynotis, causantes de la cera negra y el rascado desesperado de orejas.'
        },
        {
          title: '3. Limpieza profunda del entorno',
          desc: 'Aspira sillones, esquinas y camas. Lava las mantas del gato a 60°C para matar los huevos y larvas depositados en la casa.'
        }
      ],
      donts: [
        '⚠️ ¡ALERTA MORTAL!: NUNCA apliques pipetas o productos para perros en gatos. La PERMETRINA que contienen muchos antiparasitarios caninos es mortal para los gatos en minutos (provoca temblores, convulsiones y muerte).',
        'No uses collares con cascabel ni collares químicos rígidos que puedan ahorcarlo o intoxicarlo al lamerse.',
        'No uses aceites esenciales caseros (como aceite de neem o árbol de té) en gatos: su hígado no puede procesarlos.'
      ]
    },
    keyTakeaways: [
      {
        title: 'Regla del 95% ambiental',
        desc: 'Solo el 5% de las pulgas están sobre la mascota (adultas); el 95% restante vive en forma de huevos y larvas en tu casa.'
      },
      {
        title: 'Dermatitis por picadura (DAPP)',
        desc: 'Muchos perros y gatos son alérgicos a la saliva de la pulga; una sola picadura provoca una erupción masiva con pérdida de pelo.'
      },
      {
        title: 'Garrapatas transmiten bacterias',
        desc: 'Las garrapatas transmiten la Ehrlichia y Anaplasma en perros (parásitos en la sangre que causan anemia y hemorragias graves).'
      }
    ],
    warningNote: 'Si tu perro o gato conviven juntos, NUNCA permitas que el gato lama a un perro recién tratado con pipeta que contenga permetrina durante las primeras 24 horas.'
  },
  {
    id: 'emergency-first-aid',
    category: 'emergencies',
    title: 'Primeros Auxilios: Golpes de Calor y Afecciones Comunes',
    subtitle: 'Protocolos de actuación rápida ante emergencias críticas, intoxicaciones y heridas en casa',
    badge: 'Urgencias Vitales',
    badgeColor: 'bg-red-50 text-red-800 border-red-200',
    frequency: 'Guía de Reacción Inmediata',
    speciesTarget: 'both',
    dogSpecific: {
      frequency: 'Actuación inmediata en minutos',
      products: [
        'Agua fresca (NUNCA helada)',
        'Paños limpios o toallas húmedas',
        'Termómetro rectal digital veterinario',
        'Número de urgencias 24h de tu clínica cercana guardado en el teléfono'
      ],
      steps: [
        {
          title: '1. Golpe de Calor (Temperatura > 40.5°C)',
          desc: 'Síntomas: Jadeo desesperado, lengua/encías rojo oscuro o moradas, babeo espeso, tambaleo y desmayo. Muy frecuente en Bulldogs, Pugs, Huskys y coches cerrados.'
        },
        {
          title: '2. Qué hacer de inmediato',
          desc: 'Llévalo a la sombra con ventilador. Moja sus almohadillas, cuello, axilas e ingles con agua templada o fresca. Ofrece sorbos de agua sin forzar.'
        },
        {
          title: '3. Traslado urgente con A/C',
          desc: 'Llévalo de urgencia al veterinario con el aire acondicionado del auto encendido. No esperes a que "se le pase".'
        }
      ],
      donts: [
        '¡NUNCA uses agua helada ni cubos de hielo en un golpe de calor!: El frío extremo provoca vasoconstricción periférica y colapso circulatorio (shock térmico), atrapando el calor dentro de los órganos vitales.',
        'NUNCA dejes a tu perro dentro de un coche cerrado, ni siquiera 5 minutos con las ventanas entreabiertas: la temperatura interior sube a 50°C en minutos.',
        'No des medicamentos humanos como Paracetamol, Ibuprofeno o Aspirina: son veneno y causan fallo hepático fulminante.'
      ]
    },
    catSpecific: {
      frequency: 'Actuación inmediata en minutos',
      products: [
        'Transportín rígido seguro cubierto con una manta para reducir estrés',
        'Suero fisiológico para lavado de ojos o heridas superficiales',
        'Jeringa sin aguja para dar agua en sorbos pequeños si está consciente',
        'Contacto de urgencias felinas 24h'
      ],
      steps: [
        {
          title: '1. Obstrucción Urinaria (Emergencia #1 en gatos machos)',
          desc: 'Síntomas: El gato entra y sale de la caja de arena, puja con dolor, maúlla fuerte, no orina nada o saca gotas con sangre y se lame los genitales. Es mortal en 24-48h por fallo renal.'
        },
        {
          title: '2. Intoxicación por Lirios / Plantas',
          desc: 'Cualquier parte de la flor del Lirio (Lilium) o su polen ingerido al acicalarse causa fallo renal agudo irreversible en gatos. Acude a urgencias antes de 6 horas.'
        },
        {
          title: '3. Golpe de calor felino',
          desc: 'Los gatos NO jadean de forma normal. Si un gato jadea con la boca abierta tras estar en calor, está sufriendo un shock térmico grave. Enfríalo con paños húmedos en las almohadillas.'
        }
      ],
      donts: [
        'NUNCA esperes más de 12 horas si un gato macho no puede orinar: la vejiga puede romperse.',
        'No tengas plantas de la familia de los Lirios en una casa con gatos.',
        'No des Paracetamol a un gato: una sola pastilla infantil de Paracetamol destruye sus glóbulos rojos (metahemoglobinemia) y es mortal.'
      ]
    },
    keyTakeaways: [
      {
        title: 'Prueba del pliegue cutáneo (Deshidratación)',
        desc: 'Pellizca suavemente la piel del lomo y suéltala. Si tarda más de 2 segundos en volver a su lugar, tu mascota está deshidratada.'
      },
      {
        title: 'Torsión Gástrica (Perros medianos/grandes)',
        desc: 'Si el perro tiene el abdomen hinchado y duro como un tambor, intenta vomitar y solo saca espuma blanca, es Torsión de Estómago. Emergencia quirúrgica de minutos.'
      },
      {
        title: 'En caso de intoxicación',
        desc: 'Toma foto del envase o planta que ingirió para que el veterinario administre el antídoto específico sin perder tiempo.'
      }
    ],
    warningNote: 'Ante cualquier emergencia vital, llama por teléfono a la clínica veterinaria mientras vas en camino para que el equipo médico tenga el quirófano y oxígeno listos al recibirte.',
    emergencyStepByStep: [
      'Paso 1: Mantén la calma y asegura el entorno para evitar más accidentes.',
      'Paso 2: En golpe de calor, moja axilas, ingles y patitas con agua fresca (NO helada).',
      'Paso 3: En heridas con sangrado, presiona con una gasa limpia firmemente.',
      'Paso 4: Nunca administres analgésicos o medicamentos de humanos.',
      'Paso 5: Traslada de inmediato al centro veterinario más cercano.'
    ]
  }
];
