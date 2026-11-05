import React from 'react';
import './LogoutCatAnimation.css';

interface LogoutTransitionModalProps {
  isOpen: boolean;
  userName?: string | null;
}

export const LogoutTransitionModal: React.FC<LogoutTransitionModalProps> = ({ 
  isOpen, 
  userName 
}) => {
  if (!isOpen) return null;

  // Extraer el primer nombre del usuario para coordinar exactamente con el saludo de bienvenida
  const displayName = userName && userName.trim() ? userName.trim().split(' ')[0] : '';

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-4 sm:p-6 bg-[#FDFBFD] animate-fadeIn transition-opacity duration-500 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Cerrando sesión"
    >
      {/* Espacio superior para balance visual */}
      <div className="h-2 shrink-0" />

      {/* 1. Gato Original Exacto de David Khourshid con Cuerda Continua */}
      <div className="w-full flex items-center justify-center -mt-16 sm:-mt-12 scale-[0.78] sm:scale-95 md:scale-100 origin-top overflow-visible">
        <div className="all-wrap">  
  <div className="all">
    <div className="yarn"></div>
    <div className="cat-wrap">    
      <div className="cat">
        <div className="cat-upper">
          <div className="cat-leg"></div>
          <div className="cat-leg"></div>
          <div className="cat-head">
            <div className="cat-ears">
              <div className="cat-ear"></div>
              <div className="cat-ear"></div>
            </div>
            <div className="cat-face">
              <div className="cat-eyes"></div>
              <div className="cat-mouth"></div>
              <div className="cat-whiskers"></div>
            </div>
          </div>
        </div>
        <div className="cat-lower-wrap">
          <div className="cat-lower">
            <div className="cat-leg">
              <div className="cat-leg">
                <div className="cat-leg">
                  <div className="cat-leg">
                    <div className="cat-leg">
                      <div className="cat-leg">
                        <div className="cat-leg">
                          <div className="cat-leg">
                            <div className="cat-leg">
                              <div className="cat-leg">
                                <div className="cat-leg">
                                  <div className="cat-leg">
                                    <div className="cat-leg">
                                      <div className="cat-leg">
                                        <div className="cat-leg">
                                          <div className="cat-leg">
                                            <div className="cat-paw"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cat-leg">
              <div className="cat-leg">
                <div className="cat-leg">
                  <div className="cat-leg">
                    <div className="cat-leg">
                      <div className="cat-leg">
                        <div className="cat-leg">
                          <div className="cat-leg">
                            <div className="cat-leg">
                              <div className="cat-leg">
                                <div className="cat-leg">
                                  <div className="cat-leg">
                                    <div className="cat-leg">
                                      <div className="cat-leg">
                                        <div className="cat-leg">
                                          <div className="cat-leg">
                                            <div className="cat-paw"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cat-tail">
              <div className="cat-tail">
                <div className="cat-tail">
                  <div className="cat-tail">
                    <div className="cat-tail">
                      <div className="cat-tail">
                        <div className="cat-tail">
                          <div className="cat-tail">
                            <div className="cat-tail">
                              <div className="cat-tail">
                                <div className="cat-tail">
                                  <div className="cat-tail">
                                    <div className="cat-tail">
                                      <div className="cat-tail">
                                        <div className="cat-tail">
                                          <div className="cat-tail -end"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>

      {/* 2. Textos Centrados con Tipografía Editorial Fraunces sobre Fondo Blanco */}
      <div className="relative z-10 w-full max-w-md pb-6 sm:pb-10 space-y-2 flex flex-col items-center text-center shrink-0">
        
        {/* Píldora de estado sutil */}
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0c9964] animate-pulse" />
          <span>Sesión cerrada correctamente</span>
        </div>

        {/* Título con nombre del usuario coordinado con el inicio y verde del logo */}
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
          ¡Hasta pronto{displayName ? `, ` : ''}<span className="italic text-[#0c9964]">{displayName}</span>!
        </h2>

        {/* Sincronización limpia directa */}
        <div className="space-y-0.5 pt-0.5">
          <p className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-1.5">
            <span className="text-[#0c9964] font-bold">✓</span>
            <span>Sincronización completa</span>
          </p>
          <p className="text-xs text-stone-600 leading-relaxed max-w-[280px] sm:max-w-[320px] mx-auto">
            Los expedientes y porciones de tus consentidos están guardados en la nube de <span className="font-bold text-stone-900">Nutri</span><span className="font-bold text-[#0c9964]">Pet</span>.
          </p>
        </div>

        {/* Micro texto de despedida */}
        <p className="text-[11px] text-stone-400 font-medium pt-1">
          ¡Vuelve pronto para seguir cuidando a tus consentidos! 🐾
        </p>

      </div>
    </div>
  );
};

export default LogoutTransitionModal;
