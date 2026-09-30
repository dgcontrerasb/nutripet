import React from 'react';

interface LogoutTransitionModalProps {
  isOpen: boolean;
}

export const LogoutTransitionModal: React.FC<LogoutTransitionModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        {/* Contenedor de avatar con emoji animado */}
        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl animate-bounce">
          🐾
        </div>

        {/* Título */}
        <h3 className="font-heading font-black text-xl text-stone-900 dark:text-stone-100">
          ¡Hasta pronto!
        </h3>

        {/* Mensaje */}
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Tu sesión se ha cerrado de forma segura y los datos de tu mascota están guardados en la nube. ¡Esperamos verte pronto!
        </p>

        {/* Indicador de carga sutil */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Cargando vista inicial...
        </div>
      </div>
    </div>
  );
};
