import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PawPrint } from 'lucide-react';

interface LogoutTransitionModalProps {
  isOpen: boolean;
  userName?: string | null;
  onComplete?: () => void;
}

interface PawItem {
  id: number;
  xPct: number;
  yPct: number;
  rotation: number;
}

function generateLogoutPaws(isDesktop: boolean): PawItem[] {
  const cols = isDesktop ? 8 : 4;
  const rows = isDesktop ? 4 : 7;
  const xMin = isDesktop ? 0.28 : 0.15;
  const xMax = isDesktop ? 0.72 : 0.85;
  const yMin = isDesktop ? 0.28 : 0.32;
  const yMax = isDesktop ? 0.72 : 0.68;
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const available: Array<{ col: number; row: number }> = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) / cols;
      const cy = (r + 0.5) / rows;
      const inExclusion = cx >= xMin && cx <= xMax && cy >= yMin && cy <= yMax;
      if (!inExclusion) {
        available.push({ col: c, row: r });
      }
    }
  }

  // Mezcla inicial de posiciones
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.map((cell, idx) => {
    const baseX = (cell.col + 0.5) * cellW;
    const baseY = (cell.row + 0.5) * cellH;
    const jitterX = (Math.random() - 0.5) * (cellW * 0.65);
    const jitterY = (Math.random() - 0.5) * (cellH * 0.65);
    const rotation = -20 + Math.random() * 40;

    return {
      id: idx,
      xPct: Math.max(3, Math.min(97, baseX + jitterX)),
      yPct: Math.max(3, Math.min(97, baseY + jitterY)),
      rotation
    };
  });
}

export const LogoutTransitionModal: React.FC<LogoutTransitionModalProps> = ({ 
  isOpen, 
  userName,
  onComplete
}) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [paws, setPaws] = useState<PawItem[]>([]);
  const [hiddenSet, setHiddenSet] = useState<Set<number>>(new Set());
  const [showGoodbyeText, setShowGoodbyeText] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = userName && userName.trim() ? userName.trim().split(' ')[0] : '';

  useEffect(() => {
    if (!isOpen) {
      setHiddenSet(new Set());
      setShowGoodbyeText(false);
      return;
    }

    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(reduced);

    const currentWidth = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1024);
    const desktopMode = currentWidth >= 640;
    setIsDesktop(desktopMode);

    const generatedPaws = generateLogoutPaws(desktopMode);
    setPaws(generatedPaws);

    if (reduced) {
      setHiddenSet(new Set(generatedPaws.map(p => p.id)));
      setShowGoodbyeText(true);
      if (onComplete) {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Orden de desaparición aleatorio (Fisher-Yates sobre los índices)
    const fadeOrder = generatedPaws.map(p => p.id);
    for (let i = fadeOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fadeOrder[i], fadeOrder[j]] = [fadeOrder[j], fadeOrder[i]];
    }

    let isCancelled = false;
    let currentInterval = 80;
    let stepIndex = 0;
    const currentHidden = new Set<number>();

    const scheduleNextFade = () => {
      if (isCancelled) return;
      if (stepIndex < fadeOrder.length) {
        currentHidden.add(fadeOrder[stepIndex]);
        setHiddenSet(new Set(currentHidden));
        stepIndex++;
        currentInterval = Math.min(240, currentInterval * 1.16);
        setTimeout(scheduleNextFade, currentInterval);
      } else {
        // Tras la última huella desvanecida: esperar ~200ms y mostrar texto de despedida
        setTimeout(() => {
          if (!isCancelled) {
            setShowGoodbyeText(true);
            if (onComplete) {
              setTimeout(onComplete, 1400);
            }
          }
        }, 200);
      }
    };

    const initialTimer = setTimeout(scheduleNextFade, currentInterval);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#faf8f5] dark:bg-[#0c140f] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Cerrando sesión"
    >
      {/* Escenario de Huellas Desvaneciéndose */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {paws.map((paw) => {
          const isFaded = hiddenSet.has(paw.id);
          return (
            <motion.div
              key={paw.id}
              initial={isReducedMotion ? { opacity: 0, scale: 0.4 } : { opacity: 1, scale: 1 }}
              animate={{
                opacity: isFaded ? 0 : 1,
                scale: isFaded ? (isReducedMotion ? 1 : 0.4) : 1
              }}
              transition={{
                duration: isReducedMotion ? 0 : 0.22,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                left: `${paw.xPct}%`,
                top: `${paw.yPct}%`,
                transform: `translate(-50%, -50%) rotate(${paw.rotation}deg)`
              }}
              className="text-[#0c9964] pointer-events-none"
            >
              <PawPrint
                className={isDesktop ? 'w-8 h-8' : 'w-6 h-6'}
                fill="#0c9964"
                strokeWidth={1.5}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Tarjeta Central Protegida (Zona de Exclusión) */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl bg-[#faf8f5]/95 dark:bg-[#0c140f]/95 border border-stone-200 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center justify-center min-h-[220px]">
        <AnimatePresence>
          {showGoodbyeText ? (
            <motion.div
              key="goodbye-content"
              initial={isReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className="space-y-2.5 flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0c9964] animate-pulse" />
                <span>Sesión cerrada correctamente</span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                ¡Hasta pronto{displayName ? `, ` : ''}<span className="italic text-[#0c9964]">{displayName}</span>!
              </h2>

              <div className="space-y-0.5 pt-0.5">
                <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <span className="text-[#0c9964] font-bold">✓</span>
                  <span>Sincronización completa</span>
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-[280px] sm:max-w-[320px] mx-auto">
                  Los expedientes y porciones de tus consentidos están guardados en la nube de <span className="font-bold text-stone-900 dark:text-stone-100">Nutri</span><span className="font-bold text-[#0c9964]">Pet</span><span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">OTB</span>.
                </p>
              </div>

              <p className="text-[11px] text-stone-400 font-medium pt-1">
                ¡Vuelve pronto para seguir cuidando a tus consentidos! 🐾
              </p>
            </motion.div>
          ) : (
            <div key="closing-placeholder" className="py-6 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#0c9964]/20 border-t-[#0c9964] animate-spin" />
              <span className="text-[11px] font-mono font-semibold tracking-wider text-stone-400 uppercase">
                Guardando sesión...
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LogoutTransitionModal;
