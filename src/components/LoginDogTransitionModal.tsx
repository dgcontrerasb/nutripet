import React, { useEffect } from 'react';

interface LoginDogTransitionModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string | null;
}

export const LoginDogTransitionModal: React.FC<LoginDogTransitionModalProps> = ({
  isOpen,
  onComplete,
  userName
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Duración de la animación: 2.2 segundos para que el usuario disfrute la bienvenida
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#FDFBFD] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenido a NutriPet"
    >
      <style>{`
        .nutripet-dog-box {
          position: relative;
          width: 240px;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .np-leg {
          position: absolute;
          bottom: 0;
          width: 26px;
          height: 36px;
        }

        .np-paw {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 32px;
          height: 16px;
          overflow: hidden;
        }
        .np-paw::before {
          content: '';
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .np-top {
          position: absolute;
          bottom: 0;
          left: 6px;
          height: 38px;
          width: 22px;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          transform-origin: bottom right;
          transform: rotateZ(90deg) translateX(-1px) translateY(13px);
          z-index: -1;
          background-image: linear-gradient(70deg, transparent 20%, #ff8b56 20%);
        }

        .np-dog {
          position: relative;
          width: 195px;
          height: 72px;
        }
        .np-dog::before {
          content: '';
          position: absolute;
          bottom: -6px;
          right: -1px;
          width: 100%;
          height: 13px;
          background-color: rgba(28, 49, 48, 0.1);
          border-radius: 50%;
          z-index: -1000;
          animation: np-dog-shadow 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__head {
          position: absolute;
          left: 13px;
          bottom: 0;
          width: 84px;
          height: 72px;
          border-top-left-radius: 35px;
          border-top-right-radius: 35px;
          border-bottom-right-radius: 28px;
          border-bottom-left-radius: 28px;
          background-color: #FF8147;
          animation: np-dog-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__head-c {
          position: absolute;
          left: 13px;
          bottom: 0;
          width: 84px;
          height: 72px;
          animation: np-dog-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
          z-index: -1;
        }
        .np-dog__snout {
          position: absolute;
          left: -13px;
          bottom: 0;
          width: 65px;
          height: 32px;
          border-top-right-radius: 26px;
          border-bottom-right-radius: 26px;
          border-bottom-left-radius: 39px;
          background-color: #D7DBD2;
          animation: np-dog-snout 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__snout::before {
          content: '';
          position: absolute;
          left: -1px;
          top: -1.3px;
          width: 16px;
          height: 10px;
          border-top-right-radius: 26px;
          border-bottom-right-radius: 26px;
          border-bottom-left-radius: 39px;
          background-color: #1C3130;
          animation: np-dog-snout-b 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__nose {
          position: absolute;
          top: -17px;
          left: 40%;
          width: 6.5px;
          height: 21px;
          border-radius: 4.5px;
          transform-origin: bottom;
          transform: rotateZ(10deg);
          background-color: #D7DBD2;
        }
        .np-dog__eye-l, .np-dog__eye-r {
          position: absolute;
          top: -8px;
          width: 6px;
          height: 3.2px;
          border-radius: 50%;
          background-color: #1C3130;
          animation: np-dog-eye 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__eye-l {
          left: 27%;
        }
        .np-dog__eye-r {
          left: 65%;
        }
        .np-dog__ear-l, .np-dog__ear-r {
          position: absolute;
          width: 91px;
          height: 29px;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          border-bottom-right-radius: 28px;
          border-bottom-left-radius: 28px;
          background-color: #E26538;
        }
        .np-dog__ear-l {
          top: 13px;
          left: 52px;
          transform-origin: bottom left;
          transform: rotateZ(-50deg);
          z-index: -1;
          animation: np-dog-ear-l 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__ear-r {
          top: 13px;
          right: 26px;
          transform-origin: bottom right;
          transform: rotateZ(20deg);
          z-index: -2;
          animation: np-dog-ear-r 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__body {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          position: absolute;
          bottom: 2.6px;
          left: 32px;
          width: 162px;
          height: 62px;
          border-top-left-radius: 26px;
          border-top-right-radius: 52px;
          border-bottom-right-radius: 13px;
          border-bottom-left-radius: 52px;
          background-color: #ff702e;
          z-index: -2;
          animation: np-dog-body 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
        }
        .np-dog__tail {
          position: absolute;
          right: -26px;
          height: 13px;
          width: 39px;
          background-color: #E96839;
          border-radius: 13px;
        }
        .np-dog__paws {
          position: absolute;
          bottom: 0;
          left: 65px;
          width: 104px;
          height: 26px;
        }
        .np-dog__bl-leg {
          left: -26px;
          z-index: -10;
        }
        .np-dog__bl-paw::before {
          background-color: #bec4b6;
        }
        .np-dog__bl-top {
          background-image: linear-gradient(80deg, transparent 20%, #E96839 20%);
        }
        .np-dog__fl-leg {
          z-index: 10;
          left: 0;
        }
        .np-dog__fl-paw::before {
          background-color: #D7DBD2;
        }
        .np-dog__fr-leg {
          right: 0;
        }
        .np-dog__fr-paw::before {
          background-color: #D7DBD2;
        }

        @keyframes np-dog-head {
          0%, 10%, 20%, 26%, 28%, 90%, 100% {
            height: 72px;
            bottom: 0;
            transform-origin: bottom right;
            transform: rotateZ(0);
          }
          5%, 15%, 22%, 24%, 30% {
            height: 70px;
          }
          32%, 50% {
            height: 72px;
          }
          55%, 60% {
            bottom: 6.5px;
            transform-origin: bottom right;
            transform: rotateZ(0);
          }
          70%, 80% {
            bottom: 6.5px;
            transform-origin: bottom right;
            transform: rotateZ(10deg);
          }
        }

        @keyframes np-dog-body {
          0%, 10%, 20%, 26%, 28%, 32%, 100% {
            height: 62px;
          }
          5%, 15%, 22%, 24%, 30% {
            height: 61px;
          }
        }

        @keyframes np-dog-ear-l {
          0%, 10%, 20%, 26%, 28%, 82%, 100% {
            transform: rotateZ(-50deg);
          }
          5%, 15%, 22%, 24% {
            transform: rotateZ(-48deg);
          }
          30%, 31% {
            transform: rotateZ(-30deg);
          }
          32%, 80% {
            transform: rotateZ(-60deg);
          }
        }

        @keyframes np-dog-ear-r {
          0%, 10%, 20%, 26%, 28% {
            transform: rotateZ(20deg);
          }
          5%, 15%, 22%, 24% {
            transform: rotateZ(18deg);
          }
          30%, 31% {
            transform: rotateZ(10deg);
          }
          32% {
            transform: rotateZ(25deg);
          }
        }

        @keyframes np-dog-snout {
          0%, 10%, 20%, 26%, 28%, 82%, 100% {
            height: 32px;
          }
          5%, 15%, 22%, 24% {
            height: 30px;
          }
        }

        @keyframes np-dog-snout-b {
          0%, 10%, 20%, 26%, 28%, 98%, 100% {
            width: 16px;
          }
          5%, 15%, 22%, 24% {
            width: 15.5px;
          }
          34%, 98% {
            width: 11px;
          }
        }

        @keyframes np-dog-shadow {
          0%, 10%, 20%, 26%, 28%, 30%, 84%, 100% {
            width: 99%;
          }
          5%, 15%, 22%, 24% {
            width: 101%;
          }
          34%, 81% {
            width: 96%;
          }
        }

        @keyframes np-dog-eye {
          0%, 30% {
            width: 6px;
            height: 2.6px;
          }
          32%, 59%, 90%, 100% {
            width: 4.5px;
            height: 4.5px;
            transform: translateY(0);
          }
          60%, 75% {
            transform: translateY(-2.6px);
          }
          80%, 85% {
            transform: translateY(1.3px);
          }
        }
      `}</style>

      {/* Animación del Perrito de Ricardo Oliva Alonso */}
      <div className="nutripet-dog-box mb-3">
        <div className="np-dog">
          <div className="np-dog__paws">
            <div className="np-dog__bl-leg np-leg">
              <div className="np-dog__bl-paw np-paw" />
              <div className="np-dog__bl-top np-top" />
            </div>
            <div className="np-dog__fl-leg np-leg">
              <div className="np-dog__fl-paw np-paw" />
              <div className="np-dog__fl-top np-top" />
            </div>
            <div className="np-dog__fr-leg np-leg">
              <div className="np-dog__fr-paw np-paw" />
              <div className="np-dog__fr-top np-top" />
            </div>
          </div>
          <div className="np-dog__body">
            <div className="np-dog__tail" />
          </div>
          <div className="np-dog__head">
            <div className="np-dog__snout">
              <div className="np-dog__nose" />
              <div className="np-dog__eyes">
                <div className="np-dog__eye-l" />
                <div className="np-dog__eye-r" />
              </div>
            </div>
          </div>
          <div className="np-dog__head-c">
            <div className="np-dog__ear-l" />
            <div className="np-dog__ear-r" />
          </div>
        </div>
      </div>

      {/* Texto de Bienvenida con Tipografía Editorial Fraunces y Colores Oficiales del Logo: Nutri (Negro) + Pet (Verde Logo #0c9964) */}
      <div className="space-y-1.5 mt-2 max-w-sm">
        <h2 className="font-editorial text-2xl sm:text-3xl text-stone-900 font-normal tracking-tight">
          ¡Bienvenido{userName ? `, ${userName.split(' ')[0]}` : ''} a{' '}
          <span className="font-bold text-stone-900">Nutri</span><span className="font-bold text-[#0c9964]">Pet</span>!
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Sincronizando los expedientes y dietas de tus consentidos...
        </p>
      </div>

      {/* Micro barra de progreso con el verde oficial del logo */}
      <div className="w-44 h-1.5 bg-stone-200/70 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-[#0c9964] rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
};
