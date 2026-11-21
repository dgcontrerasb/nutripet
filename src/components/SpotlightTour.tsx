import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
  Scale,
  Clock,
  QrCode,
  Utensils,
  Stethoscope,
  Bell,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { AppTab } from '../types';

export interface TourStep {
  id: string;
  targetTab: AppTab;
  targetSelector?: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-step',
    targetTab: 'calculator',
    targetSelector: '#calculator-biometrics-box',
    badge: 'PASO 1 DE 8 • BIENVENIDA',
    title: 'Te presentamos el perfil clínico de Boby',
    description: 'Estás explorando NutriPet con nuestra mascota de ejemplo oficial (Boby, Cocker Spaniel, 13.5 kg). Aquí verás cómo toda la app calcula sus pautas nutricionales, médicas y preventivas en tiempo real.',
    icon: <Compass className="w-5 h-5 text-emerald-400" />,
    highlights: [
      'Datos biométricos y curva de peso oficial FEDIAF calculados en vivo.',
      'Modo de ejemplo seguro en memoria: cero riesgo de modificar tu base de datos.'
    ]
  },
  {
    id: 'calculator-step',
    targetTab: 'calculator',
    targetSelector: '#print-pet-sheet',
    badge: 'PASO 2 DE 8 • NUTRICIÓN FEDIAF',
    title: 'Porciones y raciones exactas al gramo',
    description: 'Calculamos las calorías de mantenimiento (MER: 670 kcal/d) y la ración oficial (179 g/día de croquetas o equivalente en BARF), divididas en 2 tomas exactas de 90g con hidratación diaria recomendada.',
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
    highlights: [
      'Ajuste para sobrepeso (+1.5 kg) hacia la meta ideal de 12.0 kg.',
      'Rango hídrico sugerido: 743 a 1013 ml de agua fresca por día.'
    ]
  },
  {
    id: 'foods-step',
    targetTab: 'foods',
    targetSelector: '#toxic-foods-preview-grid',
    badge: 'PASO 3 DE 8 • SEGURIDAD ALIMENTARIA',
    title: 'Semáforo de toxicidad y superalimentos',
    description: 'Conoce con certeza qué alimentos son letales, peligrosos o aptos. Dado que Boby presenta sensibilidad a la proteína de pollo y cereales con gluten, el semáforo te alerta para prevenir reacciones alérgicas.',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    highlights: [
      'Alimentos letales: Cebolla, chocolate, uvas y aguacate.',
      'Superalimentos digestivos: Manzana sin semillas, calabaza y arándanos.'
    ]
  },
  {
    id: 'routine-step',
    targetTab: 'routine',
    targetSelector: '#first-routine-event-card',
    badge: 'PASO 4 DE 8 • HORARIOS & RUTINA',
    title: 'Cronograma diario inteligente sincronizado',
    description: 'Organiza los 5 momentos clave del día de Boby: paseo matutino, desayuno regulado de 89g, revisión de agua fresca, cena y caminata nocturna para evitar estrés digestivo y torsión gástrica.',
    icon: <Clock className="w-5 h-5 text-emerald-400" />,
    highlights: [
      '07:00 AM: Paseo matutino y activación muscular (30 min).',
      '07:45 AM y 07:00 PM: Tomas medidas con reposo post-ingesta obligatorio.'
    ]
  },
  {
    id: 'sheet-step',
    targetTab: 'sheet',
    targetSelector: '#pet-card-3d-flipper',
    badge: 'PASO 5 DE 8 • CREDENCIAL & QR SOS',
    title: 'Ficha médica oficial y pasaporte de rescate',
    description: 'Credencial 3D interactiva con giro anverso/reverso. Contiene el número de microchip ISO, contacto de la veterinaria Dra. Camila Morales y un código QR único para rescate inmediato en caso de pérdida.',
    icon: <QrCode className="w-5 h-5 text-emerald-400" />,
    highlights: [
      'Giro a Ficha SOS: Llamada con un toque a veterinario y tutor responsable.',
      'Exportación en PDF clínico para imprimir tamaño carnet de billetera.'
    ]
  },
  {
    id: 'medical-step',
    targetTab: 'medical',
    targetSelector: '#medical-subtabs-cockpit',
    badge: 'PASO 6 DE 8 • EXPEDIENTE & PESO',
    title: 'Historial clínico y curva de reducción',
    description: 'Lleva la bitácora de consultas, fórmulas y cirugías. Visualiza la curva histórica de peso de Boby, desde su diagnóstico inicial en 14.8 kg hasta los 13.5 kg de hoy, rumbo a su meta óptima.',
    icon: <Stethoscope className="w-5 h-5 text-teal-400" />,
    highlights: [
      'Consultas documentadas: Chequeo preventivo y control otológico.',
      'Gráfica de pesajes FEDIAF con cálculo automático de variación (kg).'
    ]
  },
  {
    id: 'reminders-step',
    targetTab: 'reminders',
    targetSelector: '#vaccine-radar-pillars',
    badge: 'PASO 7 DE 8 • BLINDAJE BIOLÓGICO',
    title: 'Radar sanitario 360° y calendario preventivo',
    description: 'Automatiza alertas para pipetas antipulgas, vacuna séxtuple anual y baños hipoalergénicos. Sincroniza con Google/Apple Calendar y envía recordatorios directos por WhatsApp.',
    icon: <Bell className="w-5 h-5 text-emerald-400" />,
    highlights: [
      'Radar 360°: Vacunas, antiparasitario externo e interno.',
      'Alertas automáticas exportables con periodicidad programada.'
    ]
  },
  {
    id: 'recipes-step',
    targetTab: 'recipes',
    targetSelector: '#barf-first-recipe-card',
    badge: 'PASO 8 DE 8 • DIETAS BARF & CASERAS',
    title: 'Generador de recetas caseras al gramo',
    description: 'Diseña dietas naturales crudas o cocinadas con las proporciones exactas según especie y peso de Boby (hueso carnoso, músculo, vísceras y fibra), o crea recetas con lo que tengas en tu despensa.',
    icon: <Utensils className="w-5 h-5 text-amber-400" />,
    highlights: [
      'Fórmulas naturales equilibradas según pautas nutricionales NRC/FEDIAF.',
      'Calculadora inteligente adaptada a los ingredientes de tu hogar.'
    ]
  }
];

interface Props {
  activeTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  hasActivePet: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProOrTrial: boolean;
  petName?: string;
  onGoToSignIn: () => void;
}

export const SpotlightTour: React.FC<Props> = ({
  onNavigateTab,
  hasActivePet,
  isAuthenticated,
  isLoading,
  isProOrTrial,
  petName,
  onGoToSignIn
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  const hasAutoCheckedRef = useRef<boolean>(false);
  const prevTabRef = useRef<AppTab | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const visibleSteps = useMemo<TourStep[]>(() => {
    const displayPetName = hasActivePet && petName?.trim() ? petName.trim() : 'Boby';

    const baseSteps: Array<Omit<TourStep, 'badge'> & { category: string }> = [
      {
        id: 'welcome-step',
        targetTab: 'calculator',
        targetSelector: '#calculator-biometrics-box',
        category: 'BIENVENIDA',
        title: hasActivePet
          ? `Perfil biométrico de ${displayPetName}`
          : 'Te presentamos el perfil clínico de Boby',
        description: hasActivePet
          ? `Aquí ajustas los datos fisiológicos de ${displayPetName} (foto, especie, raza y peso) para recalcular automáticamente sus pautas nutricionales y médicas.`
          : 'Estás explorando NutriPet con nuestra mascota de ejemplo oficial (Boby, Cocker Spaniel, 13.5 kg). Aquí verás cómo toda la app calcula sus pautas nutricionales, médicas y preventivas en tiempo real.',
        icon: <Compass className="w-5 h-5 text-emerald-400" />,
        highlights: hasActivePet
          ? [
              'Edición rápida de peso, raza y fotografía oficial en vivo.',
              'Los cambios se reflejan al instante en toda la ficha clínica.'
            ]
          : [
              'Datos biométricos y curva de peso oficial FEDIAF calculados en vivo.',
              'Modo de ejemplo seguro en memoria: cero riesgo de modificar tu base de datos.'
            ]
      },
      {
        id: 'calculator-step',
        targetTab: 'calculator',
        targetSelector: '#print-pet-sheet',
        category: 'NUTRICIÓN FEDIAF',
        title: 'Porciones y raciones exactas al gramo',
        description: hasActivePet
          ? `Calculamos las calorías base (RER), de mantenimiento (MER) y la ración diaria de ${displayPetName} en croquetas, BARF o mixta, junto con su hidratación recomendada.`
          : 'Calculamos las calorías de mantenimiento (MER: 670 kcal/d) y la ración oficial (179 g/día de croquetas o equivalente en BARF), divididas en 2 tomas exactas de 90g con hidratación diaria recomendada.',
        icon: <Scale className="w-5 h-5 text-emerald-400" />,
        highlights: hasActivePet
          ? [
              'Cálculo metabólico adaptado al peso, etapa de vida y actividad.',
              'Comparte la ficha nutricional de forma rápida cuando lo necesites.'
            ]
          : [
              'Ajuste para sobrepeso (+1.5 kg) hacia la meta ideal de 12.0 kg.',
              'Rango hídrico sugerido: 743 a 1013 ml de agua fresca por día.'
            ]
      },
      {
        id: 'foods-step',
        targetTab: 'foods',
        targetSelector: '#toxic-foods-preview-grid',
        category: 'SEGURIDAD ALIMENTARIA',
        title: 'Semáforo de toxicidad y superalimentos',
        description: hasActivePet
          ? `Consulta con certeza qué alimentos son letales, de precaución o aptos para cuidar la alimentación diaria de ${displayPetName} y prevenir reacciones adversas.`
          : 'Conoce con certeza qué alimentos son letales, peligrosos o aptos. Dado que Boby presenta sensibilidad a la proteína de pollo y cereales con gluten, el semáforo te alerta para prevenir reacciones alérgicas.',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        highlights: [
          'Alimentos letales: Cebolla, chocolate, uvas y aguacate.',
          'Superalimentos digestivos: Manzana sin semillas, calabaza y arándanos.'
        ]
      },
      {
        id: 'routine-step',
        targetTab: 'routine',
        targetSelector: '#first-routine-event-card',
        category: 'HORARIOS & RUTINA',
        title: 'Cronograma diario inteligente sincronizado',
        description: hasActivePet
          ? `Organiza los momentos clave del día de ${displayPetName}: paseos, tomas de alimento reguladas, hidratación y reposo digestivo.`
          : 'Organiza los 5 momentos clave del día de Boby: paseo matutino, desayuno regulado de 89g, revisión de agua fresca, cena y caminata nocturna para evitar estrés digestivo y torsión gástrica.',
        icon: <Clock className="w-5 h-5 text-emerald-400" />,
        highlights: hasActivePet
          ? [
              'Distribución horaria clara de comidas y paseos diarios.',
              'Ventanas de reposo post-ingesta para prevenir estrés digestivo.'
            ]
          : [
              '07:00 AM: Paseo matutino y activación muscular (30 min).',
              '07:45 AM y 07:00 PM: Tomas medidas con reposo post-ingesta obligatorio.'
            ]
      }
    ];

    const proOrFallbackSteps: Array<Omit<TourStep, 'badge'> & { category: string }> = isProOrTrial
      ? [
          {
            id: 'sheet-step',
            targetTab: 'sheet',
            targetSelector: '#pet-card-3d-flipper',
            category: 'CREDENCIAL & QR SOS',
            title: 'Ficha médica oficial y pasaporte de rescate',
            description: hasActivePet
              ? `Credencial 3D interactiva de ${displayPetName} con giro anverso/reverso, microchip ISO, contacto veterinario y un código QR único para rescate inmediato.`
              : 'Credencial 3D interactiva con giro anverso/reverso. Contiene el número de microchip ISO, contacto de la veterinaria Dra. Camila Morales y un código QR único para rescate inmediato en caso de pérdida.',
            icon: <QrCode className="w-5 h-5 text-emerald-400" />,
            highlights: [
              'Giro a Ficha SOS: Llamada con un toque a veterinario y tutor responsable.',
              'Exportación en PDF clínico para imprimir tamaño carnet de billetera.'
            ]
          },
          {
            id: 'medical-step',
            targetTab: 'medical',
            targetSelector: '#medical-subtabs-cockpit',
            category: 'EXPEDIENTE & PESO',
            title: 'Historial clínico y curva de reducción',
            description: hasActivePet
              ? `Lleva la bitácora de consultas, fórmulas y cirugías de ${displayPetName}, y visualiza su curva histórica de peso frente a los rangos ideales.`
              : 'Lleva la bitácora de consultas, fórmulas y cirugías. Visualiza la curva histórica de peso de Boby, desde su diagnóstico inicial en 14.8 kg hasta los 13.5 kg de hoy, rumbo a su meta óptima.',
            icon: <Stethoscope className="w-5 h-5 text-teal-400" />,
            highlights: [
              hasActivePet
                ? 'Registro organizado de consultas, exámenes, cirugías y fórmulas.'
                : 'Consultas documentadas: Chequeo preventivo y control otológico.',
              'Gráfica de pesajes FEDIAF con cálculo automático de variación (kg).'
            ]
          },
          {
            id: 'reminders-step',
            targetTab: 'reminders',
            targetSelector: '#vaccine-radar-pillars',
            category: 'BLINDAJE BIOLÓGICO',
            title: 'Radar sanitario 360° y calendario preventivo',
            description: hasActivePet
              ? `Automatiza alertas para vacunas, antiparasitarios, chequeos y baños de ${displayPetName}, con exportación a calendario y recordatorios directos.`
              : 'Automatiza alertas para pipetas antipulgas, vacuna séxtuple anual y baños hipoalergénicos. Sincroniza con Google/Apple Calendar y envía recordatorios directos por WhatsApp.',
            icon: <Bell className="w-5 h-5 text-emerald-400" />,
            highlights: [
              'Radar 360°: Vacunas, antiparasitario externo e interno.',
              'Alertas automáticas exportables con periodicidad programada.'
            ]
          },
          {
            id: 'recipes-step',
            targetTab: 'recipes',
            targetSelector: '#barf-first-recipe-card',
            category: 'DIETAS BARF & CASERAS',
            title: 'Generador de recetas caseras al gramo',
            description: hasActivePet
              ? `Diseña dietas naturales crudas o cocinadas con las proporciones exactas según especie y peso de ${displayPetName}, o crea recetas con los ingredientes de tu hogar.`
              : 'Diseña dietas naturales crudas o cocinadas con las proporciones exactas según especie y peso de Boby (hueso carnoso, músculo, vísceras y fibra), o crea recetas con lo que tengas en tu despensa.',
            icon: <Utensils className="w-5 h-5 text-amber-400" />,
            highlights: [
              'Fórmulas naturales equilibradas según pautas nutricionales NRC/FEDIAF.',
              'Calculadora inteligente adaptada a los ingredientes de tu hogar.'
            ]
          }
        ]
      : [
          {
            id: 'pro-overview-step',
            targetTab: 'sheet',
            targetSelector: '#pettechsheet-container',
            category: 'FUNCIONES PRO',
            title: 'Funciones PRO disponibles con tu cuenta',
            description: isAuthenticated
              ? 'NutriPet Pro desbloquea la credencial 3D con código QR SOS, expediente clínico con curva de peso, calendario de vacunas y recetas BARF al gramo.'
              : 'NutriPet Pro desbloquea la credencial 3D con código QR SOS, expediente clínico con curva de peso, calendario de vacunas y recetas BARF al gramo. Al iniciar sesión con Google recibes 15 días de prueba gratuita sin tarjeta.',
            icon: <Crown className="w-5 h-5 text-amber-500" />,
            highlights: [
              'Credencial QR SOS imprimible + expediente clínico completo.',
              'Radar de vacunas, antiparasitarios y generador de dietas BARF.'
            ]
          }
        ];

    const combined = [...baseSteps, ...proOrFallbackSteps];
    return combined.map(({ category, ...rest }, index) => ({
      ...rest,
      badge: `PASO ${index + 1} DE ${combined.length} • ${category}`
    }));
  }, [hasActivePet, petName, isProOrTrial, isAuthenticated]);

  const safeStepIndex = Math.min(currentStepIndex, Math.max(0, visibleSteps.length - 1));
  const step = visibleSteps[safeStepIndex] || visibleSteps[0];
  const isFirstStep = safeStepIndex === 0;
  const isLastStep = safeStepIndex === visibleSteps.length - 1;

  // Autoiniciar una única vez solo para usuarios autenticados sin mascota tras finalizar la carga
  useEffect(() => {
    if (isLoading || !isAuthenticated || hasAutoCheckedRef.current) return;
    hasAutoCheckedRef.current = true;

    const completed = localStorage.getItem('nutripet_spotlight_completed');
    if (!hasActivePet && completed !== 'true') {
      setCurrentStepIndex(0);
      setIsOpen(true);
    }
  }, [isAuthenticated, isLoading, hasActivePet]);

  // Escuchar evento global para reactivar el tour manualmente en cualquier momento
  useEffect(() => {
    const handleStartTour = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('nutripet_start_tour', handleStartTour);
    return () => window.removeEventListener('nutripet_start_tour', handleStartTour);
  }, []);

  // Cerrar y guardar estado en localStorage
  const handleCloseTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem('nutripet_spotlight_completed', 'true');
  }, []);

  // Acción contextual al finalizar el tour según sesión y mascota registrada
  const handleFinishAction = () => {
    handleCloseTour();
    if (!isAuthenticated) {
      onGoToSignIn();
    } else if (!hasActivePet) {
      window.dispatchEvent(new Event('nutripet_open_add_pet'));
    }
  };

  const finalButtonLabel = !isAuthenticated
    ? 'Iniciar sesión y guardar'
    : !hasActivePet
      ? '¡Registrar mi mascota!'
      : 'Finalizar tour';

  // Sincronización delicada por fases (Cross-fade en cambio de pestaña, morph en misma pestaña)
  useEffect(() => {
    if (!isOpen) return;

    const isTabChange = prevTabRef.current !== null && prevTabRef.current !== step.targetTab;
    prevTabRef.current = step.targetTab;

    if (isTabChange) {
      // Si cambia de vista, atenuar suavemente para evitar vuelos diagonales sobre pantallas vacías
      setIsCrossFading(true);
    }

    if (step.targetTab) {
      onNavigateTab(step.targetTab);
    }

    if (!step.targetSelector) {
      setTargetRect(null);
      setIsCrossFading(false);
      return;
    }

    let isCancelled = false;
    let observer: MutationObserver | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const measureAndCenter = () => {
      if (isCancelled || !step.targetSelector) return false;
      const el = document.querySelector(step.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Desplazamiento ergonómico: posiciona el elemento en la zona despejada superior/central
          // dejando libre los 220px inferiores donde descansa el modal sin solaparse
          const availableHeight = window.innerHeight - 240;
          const targetCenterY = 80 + Math.max(0, availableHeight / 2);
          const currentCenterY = rect.top + rect.height / 2;
          const diff = currentCenterY - targetCenterY;

          // Inmediatamente mostrar el recuadro sobre el elemento sin demora ni parpadeo
          setTargetRect(rect);
          setIsCrossFading(false);

          if (Math.abs(diff) > 35) {
            window.scrollBy({ top: diff, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            // Re-medir tras el scroll para asentar la posición final con exactitud milimétrica
            setTimeout(() => {
              if (!isCancelled) {
                const refreshed = el.getBoundingClientRect();
                setTargetRect(refreshed);
              }
            }, prefersReducedMotion ? 50 : 350);
          }

          return true;
        }
      }
      return false;
    };

    // 1. Intento inmediato si ya está en DOM
    if (!measureAndCenter()) {
      // 2. Reintento rápido para vistas lazy (cada 40ms)
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        if (measureAndCenter()) {
          if (intervalId) clearInterval(intervalId);
        } else if (attempts > 50) {
          if (intervalId) clearInterval(intervalId);
          observer?.disconnect();
          if (!isCancelled) {
            setTargetRect(null);
            setIsCrossFading(false);
          }
        }
      }, 40);

      // 3. Observer para el instante exacto del montaje
      observer = new MutationObserver(() => {
        if (measureAndCenter()) {
          if (intervalId) clearInterval(intervalId);
          observer?.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (observer) observer.disconnect();
    };
  }, [isOpen, safeStepIndex, step.targetTab, step.targetSelector, onNavigateTab, prefersReducedMotion]);

  // Actualizar rect continuamente en scroll y resize sin retrasos
  useEffect(() => {
    if (!isOpen || !step.targetSelector) return;

    let rAFId: number | null = null;
    const updateRect = () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        const el = document.querySelector(step.targetSelector!);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect);
          }
        }
      });
    };

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, step.targetSelector]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinishAction();
    } else {
      setCurrentStepIndex(prev => Math.min(prev + 1, visibleSteps.length - 1));
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => Math.max(0, prev - 1));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-auto no-print select-none">
      {/* Fondo atenualo sutil (CERO BLUR, app 100% visible, nítida y legible) */}
      <div
        onClick={handleCloseTour}
        className="fixed inset-0 bg-stone-900/40 transition-opacity duration-300 cursor-pointer"
      />

      {/* Orificio Spotlight con Morphing suave y resplandor esmeralda */}
      {targetRect && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            top: `${Math.max(6, targetRect.top - 8)}px`,
            left: `${Math.max(6, targetRect.left - 8)}px`,
            width: `${Math.min(window.innerWidth - 12, targetRect.width + 16)}px`,
            height: `${targetRect.height + 16}px`,
            opacity: isCrossFading ? 0 : 1,
            transform: isCrossFading ? 'scale(0.97)' : 'scale(1)',
            transition: prefersReducedMotion
              ? 'none'
              : 'opacity 220ms ease, transform 220ms ease, top 350ms cubic-bezier(0.16, 1, 0.3, 1), left 350ms cubic-bezier(0.16, 1, 0.3, 1), width 350ms cubic-bezier(0.16, 1, 0.3, 1), height 350ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="fixed rounded-2xl border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.45),0_0_20px_rgba(16,185,129,0.35)] pointer-events-none z-[151]"
        />
      )}

      {/* Modal Flotante Serena y Firmemente Anclado Abajo (100% Opaco y Sólido, CERO Transparencias) */}
      <div
        className="fixed inset-x-3 sm:inset-x-4 bottom-4 sm:bottom-6 max-w-md mx-auto z-[152]"
      >
        <div className="bg-white dark:bg-[#18211b] rounded-2xl border-2 border-stone-200/90 dark:border-stone-700/80 p-4 sm:p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] space-y-3">
          
          {/* Cabecera compacta: Badge temático + Botón Saltar */}
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 text-[9.5px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{step.badge}</span>
            </div>

            <button
              type="button"
              onClick={handleCloseTour}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Cerrar el tutorial interactivo"
            >
              <span>Saltar</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cuerpo: Icono + Título + Descripción concisa */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {step.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="font-editorial font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Puntos destacados con micro-badges compactos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
              {step.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 flex items-start gap-1.5 text-[10.5px] sm:text-[11px] text-stone-700 dark:text-stone-300"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie de navegación interactiva */}
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
            {/* Paginador con barras o puntos */}
            <div className="flex items-center gap-1.5">
              {visibleSteps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeStepIndex
                      ? 'w-5 bg-emerald-600 dark:bg-emerald-400'
                      : 'w-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300'
                  }`}
                  title={`Ir al paso ${idx + 1}`}
                />
              ))}
              <span className="text-[9.5px] font-mono font-bold text-stone-400 dark:text-stone-500 ml-1">
                {safeStepIndex + 1}/{visibleSteps.length}
              </span>
            </div>

            {/* Botones de desplazamiento */}
            <div className="flex items-center gap-1.5">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleFinishAction}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:brightness-105 text-white text-[11px] sm:text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span>{finalButtonLabel}</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-lg bg-[#143826] hover:bg-[#1a4a32] text-white text-[11px] sm:text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
