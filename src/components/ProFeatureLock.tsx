import React from 'react';
import { Lock, Crown, ShieldCheck, Sparkles } from 'lucide-react';

export interface ProFeatureLockProps {
  featureName: string;
  description?: string;
  benefits?: string[];
  onOpenSubscriptionModal: () => void;
  compact?: boolean;
}

export const ProFeatureLock: React.FC<ProFeatureLockProps> = ({
  featureName,
  description = "Esta función forma parte de NutriPet Pro. Tu prueba gratuita terminó, pero tus mascotas y datos siguen seguros.",
  benefits = [
    "Acceso completo a esta función",
    "Datos sincronizados y protegidos",
    "Soporte avanzado de NutriPet"
  ],
  onOpenSubscriptionModal,
  compact = false,
}) => {
  return (
    <div className={`relative bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/20 dark:via-emerald-950/30 dark:to-teal-950/20 border-2 border-dashed border-emerald-300/80 dark:border-emerald-700/60 rounded-3xl ${compact ? 'p-5 sm:p-6 space-y-3' : 'p-6 sm:p-10 space-y-5'} text-center z-10 shadow-sm backdrop-blur-xs`}>
      {/* Icono de Candado */}
      <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md ring-4 ring-amber-400/20`}>
        <Lock className={`${compact ? 'w-6 h-6' : 'w-8 h-8'}`} />
      </div>

      {/* Título y Descripción */}
      <div className="max-w-lg mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Función Exclusiva NutriPet Pro</span>
        </div>
        <h4 className={`font-heading font-black text-stone-900 dark:text-stone-100 ${compact ? 'text-base sm:text-xl' : 'text-xl sm:text-2xl'} tracking-tight`}>
          Desbloquea {featureName}
        </h4>
        <p className={`text-stone-650 dark:text-stone-300 leading-relaxed ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          {description}
        </p>
      </div>

      {/* Lista de Beneficios */}
      {benefits && benefits.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-emerald-900 dark:text-emerald-300 py-1">
          {benefits.map((benefit, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{benefit}</span>
            </span>
          ))}
        </div>
      )}

      {/* Botón de Acción Principal */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-102 cursor-pointer mx-auto"
        >
          <Sparkles className="w-4.5 h-4.5 text-amber-200 shrink-0" />
          <span>Desbloquear {featureName} (Desde $9.900 COP / $2.99 USD)</span>
        </button>
      </div>
    </div>
  );
};

export default ProFeatureLock;
