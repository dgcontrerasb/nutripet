# Reestructuración Espacial y Arquitectura Modular Avanzada: NutriPet

Plan de arquitectura de interfaz y maquetación de módulos para NutriPet, evolucionando de la maquetación estandarizada tipo tarjeta apilada hacia un **Panel Split Asimétrico de Alto Rendimiento**. Esta distribución separa de manera fija el cabezal de control e indicador biométrico del paciente (HUD de Mascota) en la columna izquierda, mientras despliega el flujo dinámico de trabajo a la derecha con contenedores desplegables de densidad progresiva y transiciones continuas sin modales emergentes invasivos.

---

## Decisiones Críticas & Confirmaciones del Usuario

> [!IMPORTANT]
> Basado en tus respuestas en la entrevista de diseño, las reglas de maquetación y la infoarquitectura espacial del proyecto quedan fijadas bajo los siguientes pilares:

- **Estructura Espacial Principal**: *Panel Split Asimétrico (HUD + Viewport)*.
  - **Columna Fija de Control (Izquierda / Sticky HUD)**: Muestra en todo momento el perfil del paciente activo ({profile.name}), su foto, especie, barra de peso con respecto al objetivo ideal, requerimientos calóricos base y selector rápido de mascota sin interferir con la navegación.
  - **Viewport Principal de Trabajo (Derecha)**: Espacio de lectura y edición amplia donde se renderizan la Calculadora, Ficha Clínica, Semáforo Toxicológico, Expediente y Recetarios BARF.
- **Patrón de Interacción y Navegación Interna**: *Flujo Continuo sin Modales Restrictivos*.
  - Sustitución de modales emergentes intrusivos por paneles deslizantes en línea, acordeones expandibles con transiciones suaves y tarjetas de edición in situ.
- **Densidad de Datos e Infoarquitectura**: *Progresiva y Equilibrada*.
  - La tarjeta presenta primero la métrica o recomendación principal (ej. gramos diarios, alimentos prohibidos o próximo recordatorio) y permite expandir el desglose nutricional profundo o histórico con un solo clic táctil.

---

## 1. Visión General & Concepto de Distribución

### Problema de las Interfaces de IA Cliché
Las interfaces generadas por IA suelen pecar de dos patrones repetitivos:
1. *Grid Simétrico de Tarjetas Flotantes*: Tarjetas de igual tamaño apiladas verticalmente que obligan al usuario a hacer scroll infinito para encontrar datos básicos.
2. *Cúmulo de Modales Emergentes*: Cada acción (editar peso, ver vacunas, agregar alimento) abre una ventana flotante que interrumpe la navegación.

### La Solución NutriPet: Command Center Split
NutriPet adoptará una distribución de **Centro de Comando Asimétrico**:
- Al entrar a cualquier vista (Calculadora, Ficha, Salud, Alimentos, Recordatorios), el tutor siempre ve a su mascota en la columna fija izquierda con sus métricas vitales (HUD).
- A la derecha, el módulo activo se despliega como un cuaderno continuo con secciones colapsables que no pierden el contexto biométrico.

---

## 2. Experiencia de Usuario & Maquetación Espacial

### A. Anatomía de la Pantalla (Desktop & Tablet)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               HEADER PERMANENTE (LG:LEFT-64)                                    │
│       Aviso Institucional · Selector de Mascota Rapido · Cuenta Pro / Administrador · Tema     │
├─────────────────┬───────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR FIJO    │ PANEL SPLIT ASIMÉTRICO (viewport principal lg:pl-64)                          │
│ (256px ancho)   │                                                                               │
│                 │ ┌──────────────────────────────┬────────────────────────────────────────────┐ │
│ - Calculadora   │ │ COLUMNA HUD DE PACIENTE      │ VIEWPORT DINÁMICO DE MÓDULOS (Flex-1)      │ │
│ - Alimentos     │ │ (Sticky / 320px - 360px)     │                                            │ │
│ - Ficha Técnica │ │                              │ [ HERO DEL MÓDULO ACTIVO ]                 │ │
│ - Salud & Pesos │ │ - Avatar & Especie           │                                            │ │
│ - Recordatorios │ │ - Peso & Barra de Estado     │ [ BLOQUE PRINCIPAL / FORMULARIO CONTINUO ] │ │
│ - Recetas BARF  │ │ - Requerimiento MER/RER      │ - Acordeón 1: Biometría & Dieta            │ │
│ - Razas         │ │ - Ración sugerida en gramos  │ - Acordeón 2: Plato & Desglose Nutricional │ │
│ - Guías & Tips  │ │ - Accesos de edición in situ │ - Acordeón 3: Recomendaciones & Marcas     │ │
│                 │ └──────────────────────────────┴────────────────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────────────────────────────────────────────┘
```

### B. Distribución por Módulo

#### 1. Módulo Calculadora Nutricional & Dosificación
- **Columna HUD (Izquierda)**: Mantiene la ficha fija de la mascota con la foto, edad, raza, tipo de alimento actual (croquetas vs. BARF) y el calculador de porciones en tiempo real.
- **Viewport Principal (Derecha)**:
  - *Panel 1 (Biometría In Situ)*: Formulario compacto de entrada de peso, nivel de actividad y estado reproductivo con sliders suaves y botones de selección táctil.
  - *Panel 2 (Plato Nutricional Interactivo)*: Presentación visual del plato en gramos con desglose por tomas (Toma 1, Toma 2, Toma 3) y contador animado (`AnimatedCounter`).

#### 2. Módulo Semáforo Toxicológico
- **Columna HUD**: Resumen de alertas activas de la especie (ej. *"Ingredientes mortales para Caninos"*).
- **Viewport Principal**:
  - *Barra de Filtros y Búsqueda Inmediata*: Filtros por categoría de riesgo (Mortal, Peligroso, Superalimento) y buscador por texto con autocompletado.
  - *Grilla Asimétrica de Alimentos*: Tarjetas compactas de 1 línea con indicador de riesgo que al hacer clic expanden el panel inferior con la toxina, dosis peligrosa, síntomas y protocolo de emergencia.

#### 3. Módulo Ficha Técnica & Carnet Imprimible
- **Columna HUD**: Carnet de identidad sintético con código QR de acceso rápido a la ficha pública.
- **Viewport Principal**:
  - Vista unificada con secciones colapsables: Identificación, Contactos Veterinarios de Emergencia, Registro de Microchip/Placa y Botones de exportación directa a PDF e impresión.

#### 4. Módulo Expediente Médico & Historial de Pesos
- **Columna HUD**: Gráfico de evolución de peso simplificado con tendencia histórica.
- **Viewport Principal**:
  - *Línea de Tiempo Clínica*: Registro cronológico de consultas, exámenes, desparasitaciones y cirugías. Formulario de inserción deslizante directamente en la cabecera sin modal emergente.

---

## 3. Decisiones de Producto & Trade-Offs

### 1. Panel Split Asimétrico vs. Re-renderizado Completo de Pantalla
- **Elección**: Implementar el HUD lateral de paciente como un panel estibado de alta visibilidad en pantallas medianas y grandes, adaptándose en móviles como un banner de resumen colapsable.
- **Justificación**: Elimina la desconexión contextual: el tutor siempre sabe qué mascota está modificando y ve el impacto inmediato de cambiar el peso o la dieta sobre los gramos diarios calculados.

### 2. Edición In Situ y Acordeones Deslizantes vs. Modales Emergentes
- **Elección**: Reemplazar ventanas modales por paneles expansibles con animación muelle (`framer-motion` o CSS transitions).
- **Justificación**: Aumenta la velocidad de interacción, reduce clics perdidos y mejora la usabilidad en dispositivos táctiles móviles.

---

## 4. Arquitectura Técnica & Mapa de Modificación de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DE CONTENEDORES                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌─────────────────────────────────────┐    ┌───────────────────────────────────┐
│     COMPONENTES DE MAQUETACIÓN      │    │     SISTEMA DE COMPONENTES        │
│  - App.tsx (Layout Split & Grid)    │    │  - PetProfileHUD.tsx (HUD Fijo)   │
│  - Sidebar.tsx (Barra Lateral Nav)  │    │  - InlineExpander.tsx (Acordeón)  │
│  - PetHeaderBar.tsx (Header Top)    │    │  - ModuleContainer.tsx (Viewport) │
└──────────────────┬──────────────────┘    └──────────────────┬────────────────┘
                   │                                          │
                   └────────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ CALCULADORA & PLATO  │    │ SEMÁFORO TOXICOLÓGICO│    │ SALUD & EXPEDIENTE   │
│ - UnifiedCalculator  │    │ - FoodTrafficLight   │    │ - MedicalHistory     │
│ - FoodBagCalculator  │    │ - CountryFoodAdvisor │    │ - PetTechSheet       │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Plan de Ejecución en Código:
1. **Fase 1: Creación del Componente `PetProfileHUD.tsx`**:
   - Módulo independiente que encapsula el perfil activo, avatar, peso, estado ideal y requerimientos calóricos (MER/RER) para ser montado de forma sticky en la columna izquierda.
2. **Fase 2: Reestructuración de la Vista Principal en `App.tsx`**:
   - Ajuste de la grilla de contenido de `activeTab === 'calculator'`, `'foods'`, `'sheet'`, `'medical'`, etc., usando la maquetación split `grid-cols-1 lg:grid-cols-12` con columna HUD (`lg:col-span-4`) y viewport (`lg:col-span-8`).
3. **Fase 3: Refactorización de Módulos a Paneles In Situ**:
   - Reemplazo de modales en `MedicalHistory.tsx`, `FoodTrafficLight.tsx` y `PetTechSheet.tsx` por acordeones y paneles deslizantes en línea.
4. **Fase 4: Verificación de Build & Pruebas**:
   - Ejecución de `compile_applet` y `lint_applet` para garantizar cero errores en TypeScript y Vite.
