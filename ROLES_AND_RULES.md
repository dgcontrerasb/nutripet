# 🏛️ REGLAS ARQUITECTÓNICAS Y OPERATIVAS: NUTRIPET (Enterprise Standards)

Este archivo rige toda modificación, refactorización, generación de código y auditoría asistida por agentes dentro de este workspace. Todo cambio debe cumplir sin excepciones los dictámenes de las 5 especialidades colegiadas.

---

### 1. 🛡️ SEGURIDAD DEFENSIVA, OWASP Y BLINDAJE DE DATOS (CISO & Ethical Hacker)
* **Aislamiento Estricto de Secretos:**
  - Prohibido exponer claves privadas, credenciales de Firebase Admin (`serviceAccountKey.json`), tokens Bearer, o llaves de webhook/pasarelas de pago (Wompi, PayPal).
  - Solo se permiten variables con prefijo público `VITE_` explícitamente diseñadas para el cliente.
  - No crear archivos `.env`, `.pem` o `.key` en commits ni mover secretos fuera del entorno local.
* **Prevención de Fuga de Datos (Data Leakage & Data Privacy):**
  - Ninguna telemetría, prompt ni código generado debe transcribir, exportar o enviar datos sensibles de tutores, expedientes de pacientes ni correos a servicios de terceros.
  - Aislamiento multi-inquilino estricto en Firestore: todo acceso a documentos de mascotas o usuarios debe validar `request.auth.uid == userId`.
* **Sanitización de Inputs & Prevención de XSS:**
  - Todo campo de texto libre (nombres, historiales médicos, notas) debe sanitizarse antes de renderizarse.
  - Prohibido el uso de `dangerouslySetInnerHTML` o evaluación dinámica de scripts (`eval`).
  - Carga segura de recursos: las imágenes deben manejarse como `blob:` locales o URLs seguras sanitizadas, bloqueando inyecciones SVG maliciosas.

---

### 2. ⚡ ARQUITECTURA, RENDIMIENTO Y ESTADO (Principal Frontend Architect)
* **Stack Tecnológico:** React 19 + TypeScript (estricto) + Vite + Tailwind CSS v4.
* **Type Safety Absoluto:**
  - Prohibido el uso de `any` o conversiones ciegas (`as unknown as X`).
  - Las interfaces deben respetar rigurosamente los modelos canónicos definidos en `src/types.ts`.
  - Respeto del modelo de dominio: usar exclusivamente `breedId` canónico y no atributos inventados como `breed`.
* **Inmutabilidad y Gestión de Sesión:**
  - Prohibido mutar de manera destructiva o accidental el perfil activo de la mascota (`PetProfile`) o de sesión mediante consultas informativas en catálogos (ej. enciclopedia de razas o semáforos).
* **Rendimiento DOM & Limpieza de Ciclos de Vida:**
  - Modularizar "God Components" extensos en submódulos cohesivos.
  - Implementar limpieza de listeners, debounces y suscripciones para evitar fugas de memoria.
  - Evitar re-renderizados parásitos mediante `React.memo`, `useMemo` y `useCallback` en componentes de alta frecuencia.

---

### 3. ☁️ PROTECCIÓN DE CUOTA GRATUITA Y COSTO CERO (Cloud Specialist)
* **Restricción Mandatoria:** Operación estricta bajo el **Plan Firebase Spark ($0 USD)**.
* **Optimización de Lecturas/Escrituras:**
  - Máximo 50.000 lecturas y 20.000 escrituras diarias en Firestore.
  - Prohibido implementar consultas en bucle o listeners `onSnapshot` globales innecesarios.
  - Priorizar persistencia en cliente (`persistentLocalCache`, `IndexedDB`, `localStorage`) para lecturas frecuentes de perfil y catálogos estáticos.
* **Cálculos 100% en el Cliente:**
  - Las ecuaciones metabólicas y clínicas (RER, MER, gramos de ración, factores de actividad y edad) deben resolverse matemáticamente en memoria local en el dispositivo del usuario.
  - Prohibido agregar llamadas a APIs de pago de backend (OpenAI, AWS, Google Cloud Vision, etc.).
* **Control de Payload:**
  - No superar el límite de 1MB por documento en Firestore. Prohibido almacenar imágenes crudas de alta resolución en Base64 dentro de la base de datos de documentos.

---

### 4. 📱 ERGONOMÍA, PWA Y PARIDAD RESPONSIVA (Mobile Lead)
* **Filosofía Visual Bento Grid Simétrico:**
  - Estructuración en módulos armónicos con acentos de la paleta institucional esmeralda (`#143826`, `#1a4a32`, bordes `#2a5940` y acentos ámbar).
* **Paridad Móvil y Escritorio (Cero Scroll Infinito y Cero Vacíos):**
  - **Móvil (< 640px):** Erradicar el scroll vertical infinito mediante tarjetas compactas, selectores táctiles, pestañas internas y acordeones ergonómicos.
  - **PC (>= 1024px):** Prohibido dejar columnas desiertas o vacíos laterales asimétricos; aplicar layouts Split-Screen balanceados (ej. HUD lateral sticky + directorio scrollable independiente + panel clínico de detalle).
* **Safe Areas & Táctil:**
  - Respetar márgenes de seguridad (`safe-area-inset-*`) en iOS/Android y asegurar zonas táctiles mínimas de 40-44px sin interferir con la barra de navegación flotante.

---

### 5. ⚖️ BLINDAJE LEGAL Y RESPONSABILIDAD MÉDICA (Compliance Officer)
* **Descargos de Responsabilidad Preventivos:**
  - Es obligatorio conservar y no abreviar las leyendas formales de advertencia: las pautas nutricionales (FEDIAF/NRC) y la susceptibilidad genética constituyen guías de orientación preventiva y no reemplazan la prescripción de un médico veterinario con tarjeta profesional.
  - Mantener las advertencias toxicológicas de medicamentos y alimentos prohibidos.
* **Derecho de Supresión (Habeas Data / RGPD):**
  - Cualquier flujo destructivo debe contemplar la eliminación coordinada de registros locales y remotos para cumplimiento normativo en tiendas de aplicaciones.

---

### 📋 PROTOCOLO DE CIERRE DE TAREAS
Al finalizar cualquier intervención:
1. Ejecutar `npm run build` para garantizar cero errores de TypeScript y empaquetado Vite.
2. Validar que no se hayan generado dependencias nuevas en `package.json` sin autorización expresa.
