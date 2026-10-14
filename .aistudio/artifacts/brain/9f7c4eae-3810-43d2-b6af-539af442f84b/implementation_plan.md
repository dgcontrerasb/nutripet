# Plan de Elevación Profesional & Visualización Avanzada: NutriPet

Plan de mejoras profesionales para NutriPet, diseñado para transformar la visibilidad y propuesta de valor de la plataforma mediante la integración de **Gráficos Interactivos de Evolución Metabólica** (Tendencia de peso y consumo calórico a lo largo del tiempo) e **Indicadores de Salud con Medidores Circulares de Progreso (Radial Progress Gauges)**, manteniendo la cabecera enfocada limpiamente en la mascota activa.

---

## Decisiones Críticas & Confirmaciones del Usuario

> [!IMPORTANT]
> Basado en tus respuestas en la entrevista de diseño, las especificaciones maestras de esta fase quedan fijadas así:

- **Módulo Interactivo Principal**: *Gráficos de Evolución de Peso & Consumo Calórico*.
  - Integración en `WeightCurveChart.tsx` y en el HUD/Vista de Ficha de un gráfico dinámico SVG/Canvas con curvas de tendencia, franja de peso ideal óptimo, registros históricos interactivos y desglose de Kcal/día.
- **Visualización de Métricas & Estado**: *Medidores Circulares de Progreso (Radial Gauges)*.
  - Implementación de anillos concéntricos de porcentaje en el plato nutricional y tarjetas metabólicas para mostrar visualmente:
    1. Porcentaje de hidratación diaria alcanzada.
    2. Progreso hacia el peso ideal.
    3. Distribución calórica de macronutrientes (Proteínas, Grasas, Carbohidratos).
- **Enfoque de la Cabecera**: *Enfocada en la Mascota Activa*.
  - La cabecera superior y el HUD lateral se mantendrán limpios y dedicados a la mascota seleccionada, evitando banners de alertas genéricas o elementos que distraigan de la atención veterinaria.

---

## 1. Visión General & Propuesta de Valor

### El Salto a una Plataforma Veterinaria de Clase Mundial
Para que NutriPet destaque frente a herramientas genéricas, la experiencia debe ofrecer **evidencia gráfica tangible del progreso de la mascota**:
1. **Historial Visual de Peso**: El tutor puede observar cómo el cambio de ración o alimento impacta la curva de peso hacia el objetivo saludable.
2. **Medidores Circulares de Salud**: Anillos circulares de progreso táctil que comunican el estado de hidratación y dosificación de un vistazo sin saturation textual.
3. **Estética Editorial Limpia**: Uso de paleta verde bosque (`#143826`), crema cálido (`#FAF8F5`), tipografía editorial (`Fraunces`) y cifras tabulares (`JetBrains Mono`).

---

## 2. Experiencia de Usuario & Visualización de Datos

### A. Componentes a Desarrollar e Integrar

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          MÓDULOS DE VISUALIZACIÓN AVANZADA NUTRIPET                             │
└────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                 │
           ┌─────────────────────────────────────┴────────────────────────────────────┐
           ▼                                                                          ▼
┌─────────────────────────────────────────┐                ┌──────────────────────────────────────────┐
│ 1. GRÁFICO INTERACTIVO DE EVOLUCIÓN     │                │ 2. MEDIDORES CIRCULARES DE PROGRESO     │
│    (WeightCurveChart.tsx & Medical)     │                │    (RadialHealthGauges.tsx & HUD)        │
│                                         │                │                                          │
│ - Curva Bézier de peso histórico        │                │ - Anillo 1: Hidratación diaria (ml/día)  │
│ - Banda sombreada de Peso Ideal         │                │ - Anillo 2: Balance Calórico (Kcal/día)  │
│ - Tooltip flotante con fecha y notas    │                │ - Anillo 3: % Progreso a Peso Objetivo   │
│ - Selector de rango (3M, 6M, 1A, Todo)  │                │ - Animación fluida de llenado con SVG    │
└─────────────────────────────────────────┘                └──────────────────────────────────────────┘
```

### B. Especificaciones del Gráfico de Evolución de Peso (`WeightCurveChart.tsx`)
- **Visualización**: Curva de interpolación suave (catmull-rom / bézier) que une cada registro de peso histórico de la mascota.
- **Zona de Confort**: Banda horizontal con sombreado sutil en verde salvia (`#52796f/15`) que representa el rango de peso ideal óptimo para la raza y edad.
- **Tooltips Táctiles**: Al tocar un punto del gráfico, muestra un flotante con la fecha exacta, peso registrado, diferencia respecto a la toma anterior e impresiones clínicas/notas.

### C. Especificaciones de Medidores Circulares (`RadialHealthGauge`)
- **Anillo de Agua**: Anillo SVG con progreso de $0\%$ a $100\%$ del agua sugerida, animado suavemente al cargar.
- **Anillo de Condición Corporal**: Calibración porcentual del peso actual respecto al ideal ($100\% = \text{Peso Ideal}$, $<90\% = \text{Bajo Peso}$, $>110\% = \text{Sobrepeso}$).

---

## 3. Decisiones de Producto & Trade-Offs

### 1. Gráficos Nativos SVG Interactivas vs. Librerías Pesadas Externas
- **Elección**: Desarrollar componentes de gráficos SVG vectoriales nativos ultra optimizados con `framer-motion` y matemáticas vectoriales simples.
- **Justificación**: Garantiza un tiempo de carga instantáneo (<10ms), cero dependencias pesadas en el bundle de JavaScript y adaptabilidad perfecta al modo oscuro y claro.

### 2. Anillos Radiales vs. Barras Rectangulares Comunes
- **Elección**: Implementar anillos radials con centro informativo (valor numérico en `font-tabular` + etiqueta).
- **Justificación**: Los anillos de progreso circulares transmiten un acabado de tecnología médica moderna (similar a Apple Health y monitores clínicos), rompiendo la monotonía de barras rectangulares convencionales.

---

## 4. Arquitectura Técnica & Plan de Ejecución

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DE ARCHIVOS                        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌─────────────────────────────────────┐    ┌───────────────────────────────────┐
│      COMPONENTES DE GRÁFICOS        │    │     COMPONENTES DE VISTA          │
│  - RadialHealthGauge.tsx (Anillos)  │    │  - App.tsx (Integración en View)  │
│  - WeightCurveChart.tsx (Evolución) │    │  - PetProfileHUD.tsx (Gauge HUD)  │
│  - MedicalHistory.tsx (Tab Pesos)   │    │  - PetTechSheet.tsx (Sección)     │
└──────────────────┬──────────────────┘    └──────────────────┬────────────────┘
                   │                                          │
                   └────────────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  MEDIDOR DE AGUA     │    │  MEDIDOR DE PESO     │    │  CURVA TEMPORAL      │
│ - Gauge de Hidratación│   │ - Gauge de Objetivo  │    │ - SVG Interactivo    │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Pasos de Implementación:
1. **Fase 1: Componente `RadialHealthGauge.tsx`**:
   - Crear un medidor circular SVG reutilizable con stroke animado, gradiente verde bosque / salvia y número tabular central.
2. **Fase 2: Rediseño del Gráfico `WeightCurveChart.tsx`**:
   - Refactorizar la curva de peso para incluir banda de sombra objetivo ideal, puntos interactivos con tooltip táctil y selector de periodo.
3. **Fase 3: Integración en el HUD y Ficha Técnica**:
   - Insertar los medidores circulares en `PetProfileHUD.tsx` y en el desglose de `App.tsx` / `PetTechSheet.tsx`.
4. **Fase 4: Verificación & Pruebas**:
   - Validación mediante `compile_applet` y `lint_applet` para asegurar compilación sin errores.
