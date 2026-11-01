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
  breedName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const qrLink = `https://nutripet-v2.vercel.app/qr/${profile.publicId || profile.id}`;
  const message = 
`🐾 *FICHA TÉCNICA Y PASAPORTE CLÍNICO • NUTRIPET*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🩺 *Paciente:* ${profile.name}
🐕 *Especie / Raza:* ${profile.type === 'dog' ? 'Canino' : 'Felino'} • ${breedName || 'Raza Certificada'}
🎂 *Edad:* ${profile.ageMonths ? Math.floor(profile.ageMonths / 12) + ' años' : 'No registrada'}
⚖️ *Peso Actual:* ${profile.weightKg} kg
✂️ *Esterilizado:* ${profile.neutered ? 'Sí' : 'No'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *TUTOR Y CONTACTO:*
• *Tutor:* ${profile.ownerName || 'Tutor Responsable'}
• *Teléfono:* ${profile.ownerPhone || 'No registrado'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲 *Pasaporte Digital QR de Emergencia:*
${qrLink}

✨ _Expediente oficial generado en NutriPet (https://nutripet-v2.vercel.app)_`;

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = message;
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
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                Compartir Ficha de {profile.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pasaporte clínico oficial y QR de emergencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Vista previa del mensaje */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
            Mensaje que se enviará:
          </label>
          <div className="p-3.5 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 font-mono whitespace-pre-line max-h-56 overflow-y-auto leading-relaxed">
            {message}
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
            className="w-full py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">¡Texto copiado al portapapeles!</span>
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
          🐾 El pasaporte digital QR permite a cualquier persona acceder de forma segura a los datos de emergencia de tu mascota.
        </p>
      </div>
    </div>
  );
};
