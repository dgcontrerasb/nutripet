import React from 'react';
import { Lock, Crown, ShieldCheck, Sparkles } from 'lucide-react';

export interface ProFeatureLockProps {
  featureName: string;
  description?: string;
  benefits?: string[];
  priceText?: string;
  ctaText?: string;
  onOpenSubscriptionModal: () => void;
  compact?: boolean;
}

export const ProFeatureLock: React.FC<ProFeatureLockProps> = ({
  featureName,
  description = "Esta función forma parte de NutriPet Pro. Tu prueba gratuita terminó, pero tus mascotas y datos siguen seguros.",
  benefits = [
    "Acceso completo e ilimitado a esta función",
    "Historial y métricas sincronizados en la nube",
    "Soporte prioritario y actualizaciones continuas"
  ],
  priceText = "Desde $9.900 COP / $2.99 USD",
  ctaText = "Desbloquear Pro",
  onOpenSubscriptionModal,
  compact = false,
}) => {
  return (
    <div className={`relative bg-white dark:bg-[#151c17] border border-stone-200/80 dark:border-stone-800 rounded-3xl ${compact ? 'p-5 sm:p-6 space-y-3' : 'p-6 sm:p-10 space-y-5'} text-center z-10 shadow-sm overflow-hidden`}>
      {/* Halo ambiental cálido sutil */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Icono de Candado - Ámbar Rol 3A Comercial */}
      <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 ring-4 ring-amber-400/20 dark:ring-amber-400/10 relative z-10`}>
        <Lock className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} text-white drop-shadow-xs`} />
      </div>

      {/* Título y Descripción */}
      <div className="max-w-lg mx-auto space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Función Exclusiva NutriPet Pro</span>
        </div>
        <h4 className={`font-heading font-black text-stone-900 dark:text-stone-100 ${compact ? 'text-base sm:text-xl' : 'text-xl sm:text-2xl'} tracking-tight`}>
          Desbloquea {featureName}
        </h4>
        <p className={`text-stone-600 dark:text-stone-300 leading-relaxed ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          {description}
        </p>
      </div>

      {/* Lista de Beneficios Específicos */}
      {benefits && benefits.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs font-semibold py-1 relative z-10">
          {benefits.map((benefit, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 text-[11px] sm:text-xs text-stone-700 dark:text-stone-300 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{benefit}</span>
            </span>
          ))}
        </div>
      )}

      {/* Botón de Acción Principal - CTA desacoplado del precio */}
      <div className="pt-2 relative z-10">
        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 cursor-pointer mx-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
          <span>{ctaText}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-amber-200/80" />
          <span className="font-tabular font-medium text-amber-100 text-[11px] sm:text-xs">{priceText}</span>
        </button>
      </div>
    </div>
  );
};

export default ProFeatureLock;
