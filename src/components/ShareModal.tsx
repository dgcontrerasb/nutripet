import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { PetProfile, CalculationResult } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PetProfile;
  result: CalculationResult;
  breedName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  profile,
  result,
  breedName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUrl = 'https://nutripet.ai.studio';
  const petEmoji = profile.type === 'dog' ? '🐶' : '🐱';
  const petName = profile.name.trim() || (profile.type === 'dog' ? 'Mi perrito' : 'Mi gatito');

  // Redacción del mensaje amigable y sin tecnicismos
  const shareMessage = 
`🐾 ¡Hola! Estuve calculando la comida diaria para mi mascota en NutriPet:

${petEmoji} Nombre: ${petName}
⚖️ Peso: ${profile.weightKg} kg (${breedName || 'Raza'})
🥣 Porción recomendada: ${result.kibbleDailyGrams} gramos al día (${result.mealsPerDay} tomas de ${result.gramsPerMeal}g)
💧 Agua sugerida: ${result.waterDailyMl.min} - ${result.waterDailyMl.max} ml/día

Es una guía gratuita con semáforo de alimentos tóxicos y raciones para el hogar. Puedes calcular la tuya aquí:
👉 ${currentUrl}`;

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareMessage;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-stone-900 text-base sm:text-lg">
                Compartir Ficha de {petName}
              </h3>
              <p className="text-xs text-stone-500">
                Envía la porción diaria a tu familia, amigos o paseador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Mensaje que se enviará:
          </label>
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 font-mono whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
            {shareMessage}
          </div>
        </div>

        {/* Acciones principales */}
        <div className="space-y-2.5 pt-1">
          {/* Botón WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Enviar por WhatsApp</span>
          </button>

          {/* Botón Copiar al Portapapeles */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Texto copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Copiar texto para enviar por Telegram, Instagram o SMS</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-stone-400 pt-1">
          🐾 Compartir la app con otros dueños ayuda a que más mascotas coman las raciones adecuadas y eviten alimentos tóxicos.
        </p>
      </div>
    </div>
  );
};
