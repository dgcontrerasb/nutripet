# Rediseño Integral de Identidad & UI de NutriPet: Dirección Editorial Veterinaria de Alta Gama

Plan de transformación visual y de experiencia de usuario para NutriPet, reemplazando la estética genérica de interfaces de IA (degradados violetas, tarjetas flotantes y píldoras decorativas) por un sistema de diseño editorial veterinario, sofisticado y estructurado, con tonos bosque profundo, pergamino crema cálido, tipografía de alta jerarquía y microinteracciones táctiles de precisión clínica.

---

## Decisiones Críticas & Revisión del Usuario

> [!IMPORTANT]
> A partir de tus respuestas en la fase de clarificación, se han fijado las bases estéticas maestras del proyecto para garantizar un resultado con identidad de marca auténtica, profesional y diferenciada:

- **Dirección Estética Confirmada**: *Editorial Veterinario Elegante*. Estructura inspirada en monografías científicas y clínicas de alta gama, con generoso espacio negativo, bordes capilares sutiles y balance armónico entre calidez orgánica y rigor técnico.
- **Paleta Cromática Confirmada**: *Verde Bosque Profundo (`#143826`), Crema Alabastro Cálido (`#FAF8F5`), Carbón Ébano Suave (`#1C1917`)* con acentos en Salvia Muted (`#4D7C68`) y Ocre Dorado Clínico (`#B4833E`).
- **Comportamiento de Animaciones Confirmado**: *Sutil, Físico y Táctil*. Microinteracciones suaves con muelles controlados (`spring` amortiguado), respuestas al pulsar a escala `0.98`, transiciones de página fluidas sin saltos bruscos ni rebotes innecesarios.
- **Decisión de Maquetación y Navegación**: Mantener la arquitectura actual de navegación lateral de escritorio anclada y barra móvil ergonómica, pero elevando cada componente a un acabado artesanal con contraste accesible (WCAG AA).

---

## 1. Visión General & Concepto de Marca

### ¿Qué es y qué soluciona este rediseño?
NutriPet pasará de sentirse como un "software estándar generado por asistente" a consolidarse como una **plataforma veterinaria editorial de referencia**. En marketing y publicidad digital, la confianza del tutor de mascotas depende de la percepción de rigor médico y calidez afectiva:
1. **Erradicación del "AI Slop"**: Eliminación total de tarjetas con bordes luminosos de neón, píldoras informativas innecesarias amontonadas y fondos genéricos.
2. **Jerarquía Visual Superior**: La información calórica, el plato nutricional y el historial clínico deben leerse con la claridad y belleza de una publicación científica de autor.
3. **Identidad Visual Coherente**: Unificación visual entre el header, sidebar, calculadora de porciones, recetarios BARF, expedientes médicos y semáforo de toxicidad.

### Público Objetivo & Experiencia Emocional
- **Tutores comprometidos**: Buscan certeza, seriedad científica y una herramienta agradable de usar a diario.
- **Veterinarios y nutricionistas**: Exigen datos numéricos legibles (cifras tabulares `tabular-nums`), formatos de carnet que transmitan prestigio profesional y cero distracciones visuales.

---

## 2. Experiencia de Usuario & Sistema Visual

### A. Paleta de Color & Atmósfera Cromática

| Token de Diseño | Valor Hex / Tailwind | Propósito & Aplicación |
| :--- | :--- | :--- |
| **Canvas Background (Light)** | `#FAF8F5` (`stone-50` cálido) | Lienzo cálido estilo papel editorial que reduce la fatiga visual. |
| **Card Surface (Light)** | `#FFFFFF` con borde `rgba(28, 25, 23, 0.08)` | Tarjetas con delimitación capilar de 1px, sin sombras artificiales pesadas. |
| **Primary Brand (Forest)** | `#143826` (Bosque Profundo) | Botones primarios, encabezados de alto impacto y carnet oficial. |
| **Brand Accent (Salvia)** | `#3F6E58` / `#52796F` | Indicadores de balance calórico, estados activos y destacados serenos. |
| **Warm Accent (Ocre)** | `#B4833E` / `#C89B53` | Alertas nutricionales, recordatorios de vacunación y etiquetas pro. |
| **Text Primary (Ébano)** | `#1C1917` (Carbón Piedra) | Máxima legibilidad tipográfica con contraste 14:1. |
| **Text Secondary (Musgo)** | `#57534E` / `#78716C` | Leyendas clínicas, instrucciones y metadatos no invasivos. |
| **Dark Mode Atmosphere** | `#121714` (Fondo) / `#1A231D` (Superficies) | Modo oscuro orgánico de bosque nocturno (evitando el gris puro plano). |

### B. Sistema Tipográfico & Reglas Editoriales

```
[ ARQUITECTURA TIPOGRÁFICA EDITORIAL ]

Titulares & Portadas    ──►  Fraunces / Playfair Display / Outfit (Serif / Display refinado)
                             - Peso 600/700, tracking -0.02em, ritmo literario y cálido
                             
Cuerpo & Controles UI   ──►  Plus Jakarta Sans / DM Sans (Sans contemporánea nítida)
                             - Altura de x generosa, legibilidad óptima en 13px - 15px
                             
Métricas & Dosificación ──►  JetBrains Mono / Tabular Nums (Números de precisión)
                             - Gramos, Kcal/día, porcentajes y fechas sin saltos de línea
```

- **Disciplina "Zero-Pill"**:
  - *Antes*: Etiquetas estáticas envueltas en cápsulas de colores llamativos que saturaban la pantalla.
  - *Nuevo*: Metadatos limpios en texto continuo separados por puntos medios (`Adulto · Canino · 14.5 kg · Esterilizado`), reservando los contenedores interactivos únicamente para botones y pestañas funcionales.
- **Micro-Composición de Tarjetas**:
  - Padding exterior proporcional $\ge 24\text{px}$ en tarjetas principales.
  - Radio de esquinas curadas: `rounded-2xl` ($16\text{px}$) consistente con radios interiores calculados ($r_{\text{inner}} = r_{\text{outer}} - \text{padding}$).

### C. Animaciones & Respuestas Táctiles
- **Feedback al Pulsar**: `active:scale-[0.98]` con transición de `150ms ease-out` en botones, selectores de especie y tabs.
- **Entradas y Revelaciones**: Despliegues suaves mediante `framer-motion` (`opacity: 0, y: 8` hacia `opacity: 1, y: 0`) con curva `easeOutQuart` (300ms).
- **Indicadores de Progreso**: Barras de cálculo nutricional con llenado cinético continuo y números animados mediante `AnimatedCounter`.

---

## 3. Decisiones de Producto & Trade-Offs

### 1. Tipografía Editorial vs. Fuentes de Sistema Genéricas
- **Elección**: Incorporar una familia editorial con carácter (`Fraunces` o `Outfit` balanceado) para encabezados clave y carnets, combinada con `Plus Jakarta Sans` para formularios e inputs.
- **Justificación**: Crea una ruptura inmediata con las interfaces genéricas de software SaaS de plantilla y le otorga a NutriPet un aire de botica / clínica veterinaria de autor.
- **Alternativas Descartadas**: Mantener `Inter` o `Roboto` (percibidas como código predeterminado sin identidad de marca).

### 2. Estilo de Contenedores: Papel Alabastro y Bordes Capilares vs. Neomorfismo / Glassmorphism Excesivo
- **Elección**: Reemplazar los fondos semitransparentes pesados y brillos artificiales por superficies sólidas o suavemente traslúcidas de papel alabastro con bordes ultrafinos de 1px (`border-stone-200/80`).
- **Justificación**: Aumenta drásticamente la legibilidad bajo la luz solar, acelera el renderizado y transmite limpieza quirúrgica y orden editorial.

### 3. Preservación Estricta de Funcionalidades Existentes
- **Elección**: Conservar intacta toda la lógica de cálculo calórico (MER/RER, factores de actividad), persistencia de Firebase, pasarelas de pago (Wompi, PayPal), generador de carnet impreso y estados de suscripción Pro.
- **Justificación**: El objetivo es una renovación estética de nivel superior, sin riesgo de regresiones operativas ni pérdida de datos de usuarios.

---

## 4. Arquitectura Técnica & Mapa de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN NUTRIPET                           │
│       Tema: Editorial Veterinario (Bosque Profundo / Crema / Ébano)     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌─────────────────────────────────────┐    ┌───────────────────────────────────┐
│     SISTEMA DE DISEÑO GLOBAL        │    │        ESTRUCTURA DE VISTA        │
│  - Tailwind Tokens & index.css      │    │  - App.tsx (Layout & Header)      │
│  - Google Fonts (Editorial + Sans)  │    │  - Sidebar.tsx (Navegación Fija)  │
│  - Microinteracciones Framer Motion │    │  - PetHeaderBar.tsx (Mascota Top) │
└──────────────────┬──────────────────┘    └──────────────────┬────────────────┘
                   │                                          │
                   └────────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  MÓDULO CALCULADORA  │    │   EXPEDIENTES & HOJA │    │ MÓDULOS DE BIENESTAR │
│ - Formulario Paciente│    │ - PetTechSheet.tsx   │    │ - BarfRecipeGen.tsx  │
│ - Plato Nutricional  │    │ - MedicalHistory.tsx │    │ - FoodTrafficLight   │
│ - Métricas Energéticas│   │ - RemindersModule    │    │ - BreedEncyclopedia  │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Plan de Ejecución por Capas:
1. **Fase 1: Capa de Estilos Globales & Tipografía (`index.html`, `src/index.css`)**:
   - Integración de fuentes Google Fonts editoriales (`Fraunces` / `Outfit` / `Plus Jakarta Sans`).
   - Reemplazo de variables de color, sombras bento refinadas, bordes capilares y paleta bosque/crema para modos claro y oscuro.
2. **Fase 2: Estructura Central & Navegación (`src/App.tsx`, `src/components/Sidebar.tsx`, `src/components/PetHeaderBar.tsx`)**:
   - Pulido del header superior, banner informativo con tipografía de precisión, navegación lateral con estados activos de alto contraste y transición suave.
3. **Fase 3: Vista Principal de la Calculadora & Carnet Nutricional (`src/App.tsx`)**:
   - Rediseño del hero de la calculadora con estética editorial.
   - Refactorización de las tarjetas de entrada biométrica y presentación del plato con acento visual en los gramos recomendados (`tabular-nums`).
   - Aplicación estricta de la regla zero-pill en datos de paciente (raza, edad, estado reproductivo).
4. **Fase 4: Armonización de Módulos Complementarios**:
   - Ajustes de estilo en la Ficha Técnica, Carnet Imprimible, Semáforo de Alimentos, Recetario BARF y Recordatorios Clínicos.
5. **Fase 5: Validación Técnica & Build**:
   - Comprobación con `compile_applet` y `lint_applet` asegurando cero errores en TypeScript y Vite.
