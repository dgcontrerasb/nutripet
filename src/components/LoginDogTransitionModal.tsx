import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PawPrint } from 'lucide-react';

interface LoginDogTransitionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string | null;
}

interface PawItem {
  id: number;
  xPct: number;
  yPct: number;
  rotation: number;
}

function generateLoginPaws(isDesktop: boolean): PawItem[] {
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

  // Mezcla aleatoria (Fisher-Yates) para el orden de aparición
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.map((cell, idx) => {
    const baseX = (cell.col + 0.5) * cellW;
    const baseY = (cell.row + 0.5) * cellH;
    const jitterX = (Math.random() - 0.5) * (cellW * 0.65);
    const jitterY = (Math.random() - 0.5) * (cellH * 0.65);
    const rotation = -20 + Math.random() * 40; // rotación entre -20° y 20°

    return {
      id: idx,
      xPct: Math.max(3, Math.min(97, baseX + jitterX)),
      yPct: Math.max(3, Math.min(97, baseY + jitterY)),
      rotation
    };
  });
}

export const LoginDogTransitionModal: React.FC<LoginDogTransitionModalProps> = ({
  isOpen,
  onComplete,
  userName
}) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [paws, setPaws] = useState<PawItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setVisibleCount(0);
      setShowWelcomeText(false);
      return;
    }

    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(reduced);

    // Medición única al iniciar la animación
    const currentWidth = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1024);
    const desktopMode = currentWidth >= 640;
    setIsDesktop(desktopMode);

    const generatedPaws = generateLoginPaws(desktopMode);
    setPaws(generatedPaws);

    if (reduced) {
      setVisibleCount(generatedPaws.length);
      setShowWelcomeText(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }

    let isCancelled = false;
    let currentInterval = 360;
    let count = 0;
    const totalPaws = generatedPaws.length;

    const scheduleNextPaw = () => {
      if (isCancelled) return;
      if (count < totalPaws) {
        count++;
        setVisibleCount(count);
        currentInterval = Math.max(55, currentInterval * 0.83);
        setTimeout(scheduleNextPaw, currentInterval);
      } else {
        // Al completar todas las huellas: mostrar texto de bienvenida
        setShowWelcomeText(true);
        setTimeout(() => {
          if (!isCancelled) {
            onComplete();
          }
        }, 1300);
      }
    };

    const initialTimer = setTimeout(scheduleNextPaw, currentInterval);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#faf8f5] dark:bg-[#0c140f] flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a NutriPet"
    >
      {/* Escenario de Huellas Distribuidas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {paws.map((paw, index) => {
          const isVisible = index < visibleCount;
          return (
            <motion.div
              key={paw.id}
              initial={isReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : (isReducedMotion ? 1 : 0.4)
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
          {showWelcomeText ? (
            <motion.div
              key="welcome-content"
              initial={isReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              className="space-y-2.5 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0c9964] animate-pulse" />
                <span>Acceso exitoso</span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 font-normal tracking-tight">
                ¡Bienvenido{userName ? `, ${userName.split(' ')[0]}` : ''} a{' '}
                <span className="font-bold text-stone-900 dark:text-stone-100">Nutri</span>
                <span className="font-bold text-[#0c9964]">Pet</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">
                  OTB
                </span>!
              </h2>

              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium max-w-xs mx-auto">
                Sincronizando los expedientes y dietas de tus consentidos...
              </p>

              <div className="w-40 h-1.5 bg-stone-200/70 dark:bg-stone-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#0c9964] rounded-full animate-pulse w-3/4" />
              </div>
            </motion.div>
          ) : (
            <div key="loading-placeholder" className="py-6 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-[#0c9964]/20 border-t-[#0c9964] animate-spin" />
              <span className="text-[11px] font-mono font-semibold tracking-wider text-stone-400 uppercase">
                Iniciando...
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginDogTransitionModal;
