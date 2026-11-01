import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { NutriPetLogo } from './NutriPetLogo';
import { PublicPetEmergencyCard } from '../types';

export const PublicPetProfile: React.FC = () => {
  const { publicToken } = useParams<{ publicToken?: string }>();
  const [card, setCard] = useState<PublicPetEmergencyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicCard = async () => {
      console.log('🔗 [QR Público] Ruta detectada con token:', publicToken);

      if (!publicToken) {
        console.warn('⚠️ [QR Público] Token no especificado en URL.');
        setError('Token de pasaporte QR no especificado.');
        setLoading(false);
        return;
      }

      try {
        console.log(`📥 [QR Público] Leyendo publicPets/${publicToken}`);
        const docRef = doc(db, 'publicPets', publicToken);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as PublicPetEmergencyCard;
          if (data.active) {
            console.log('✅ [QR Público] Carnet público activo cargado.');
            setCard(data);
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ [QR Público] Carnet inactivo.');
            setError('Carnet de emergencia inactivo o deshabilitado por el propietario.');
            setLoading(false);
            return;
          }
        } else {
          console.warn('⚠️ [QR Público] Documento no existe.');
          setError('Carnet de emergencia inactivo o no encontrado.');
        }
      } catch (err: any) {
        console.error('❌ [QR Público] Error de lectura:', err?.message || err);
        setError('Carnet de emergencia inactivo o no encontrado.');
      }

      setLoading(false);
    };

    fetchPublicCard();
  }, [publicToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-[#0f1712] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 dark:text-stone-300 font-bold text-sm">Verificando pasaporte digital de emergencia...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-[#0f1712] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-200 dark:border-stone-800 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🛡️
          </div>
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">Carnet de Emergencia No Disponible</h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
            {error || 'El pasaporte digital de esta mascota no se encuentra activo o ha sido renovado.'}
          </p>
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-left bg-stone-50 dark:bg-stone-850 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">¿Eres el tutor de la mascota?</span>
            <p className="text-[11px] text-stone-600 dark:text-stone-300">
              Ingresa a tu cuenta de NutriPet y abre la sección <strong>Carnet de Salud & Ficha Médica</strong> para activar el código QR público o generar uno nuevo con consentimiento.
            </p>
          </div>
          <Link 
            to="/" 
            className="inline-block w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Ir a NutriPet Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Formateo de variables biométricas
  const rawPhone = (card.shareOwnerContact && card.ownerPhone) ? card.ownerPhone : '';
  const telefonoLimpio = rawPhone.replace(/\D/g, '');
  const microchip = card.microchip || 'Registrado';
  const edad = card.ageMonths 
    ? Math.floor(card.ageMonths / 12) + ' años' 
    : (card.stage === 'puppy_kitten' ? 'Cachorro' : card.stage === 'senior' ? 'Senior' : 'Adulto');
  const sexo = card.gender === 'male' ? 'Macho' : card.gender === 'female' ? 'Hembra' : 'Registrado';

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0f1712] pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] px-4 flex flex-col items-center justify-center gap-4 transition-colors">
      {/* 💳 APPLE WALLET DIGITAL PASS */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white dark:bg-[#1a231d] rounded-[32px] border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden transition-all text-stone-800 dark:text-stone-100">
        
        {/* A) Cabecera de Pase con Chip ID */}
        <div className="p-4 sm:p-5 border-b border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NutriPetLogo size="xs" />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
              EMERGENCY ID
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ID: #{card.publicToken ? card.publicToken.slice(0, 8).toUpperCase() : 'PASS-2026'}
          </span>
        </div>

        {/* B) Identidad del Paciente */}
        <div className="p-4 sm:p-5 pb-2 flex items-center gap-3.5">
          {card.photoUrl ? (
            <img 
              src={card.photoUrl} 
              alt={card.name} 
              className="w-[68px] h-[68px] rounded-2xl object-cover border-2 border-stone-200 dark:border-stone-700 shadow-sm shrink-0" 
            />
          ) : (
            <div className="w-[68px] h-[68px] rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-stone-200 dark:border-stone-700 shadow-sm shrink-0 flex items-center justify-center text-3xl">
              {card.type === 'dog' ? '🐶' : '🐱'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-black text-2xl text-stone-900 dark:text-white leading-tight truncate">
              {card.name}
            </h1>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
              {card.type === 'dog' ? 'Canino' : 'Felino'} • {card.breedName || 'Raza Certificada'}
            </p>
          </div>
        </div>

        {/* C) Rejilla 2x2 de Datos Biométricos */}
        <div className="grid grid-cols-2 gap-2 px-4 sm:px-5 py-2">
          <div className="bg-stone-50 dark:bg-stone-850 p-2 rounded-xl text-center border border-stone-200/60 dark:border-stone-800">
            <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              PESO ACTUAL
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-100 font-tabular mt-0.5 block">
              {card.weightKg} kg
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-stone-850 p-2 rounded-xl text-center border border-stone-200/60 dark:border-stone-800">
            <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              EDAD / SEXO
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-100 mt-0.5 block truncate">
              {edad} · {sexo}
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-stone-850 p-2 rounded-xl text-center border border-stone-200/60 dark:border-stone-800">
            <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              ESTERILIZADO
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-100 mt-0.5 block">
              {card.neutered ? 'Sí' : 'No'}
            </span>
          </div>

          <div className="bg-stone-50 dark:bg-stone-850 p-2 rounded-xl text-center border border-stone-200/60 dark:border-stone-800">
            <span className="text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              MICROCHIP ISO
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-stone-800 dark:text-stone-100 mt-0.5 block truncate">
              {microchip}
            </span>
          </div>
        </div>

        {/* D) Alerta Médica (Solo si hay alergias/condiciones activadas) */}
        {card.shareHealthEmergencyInfo && (card.allergies || card.knownDiseases) && (
          <div className="mx-4 sm:mx-5 my-2 p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-start gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <div className="text-[11px] leading-snug text-amber-950 dark:text-amber-200 font-medium">
              <strong className="font-bold">Alerta Médica:</strong>{' '}
              {[card.allergies ? `Alergias: ${card.allergies}` : null, card.knownDiseases ? `Condición: ${card.knownDiseases}` : null].filter(Boolean).join(' · ')}
              . No suministrar comida sin consultar al tutor.
            </div>
          </div>
        )}

        {/* E) Botones SOS de Acción Rápida (Zona del Pulgar) */}
        <div className="p-4 sm:p-5 space-y-2">
          {card.shareOwnerContact && card.ownerPhone ? (
            <>
              {/* Botón de Llamada Principal (Verde Esmeralda NutriPet) */}
              <a
                href={'tel:' + telefonoLimpio}
                className="w-full h-12 rounded-2xl bg-[#143826] hover:bg-[#1a4a32] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <span>📞</span>
                <span>Llamar al Tutor ({card.ownerPhone})</span>
              </a>

              {/* Botón WhatsApp SOS */}
              <a
                href={'https://wa.me/' + telefonoLimpio + '?text=' + encodeURIComponent('Hola, tengo a tu mascota ' + card.name + ' gracias a su placa NutriPet. Te escribo para coordinar su regreso.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <span>💬</span>
                <span>Enviar WhatsApp con Ubicación</span>
              </a>
            </>
          ) : (
            <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
              El tutor mantiene en privado su contacto directo. Si encontraste a esta mascota, comunícate con un centro veterinario.
            </div>
          )}

          {/* Contacto Veterinario (si está activo) */}
          {card.shareVetContact && (card.veterinarian || card.veterinarianPhone) && (
            <div className="pt-1">
              {card.veterinarianPhone ? (
                <a
                  href={'tel:' + card.veterinarianPhone.replace(/\D/g, '')}
                  className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Veterinario: {card.veterinarian || 'Tratante'} ({card.veterinarianPhone})</span>
                </a>
              ) : (
                <div className="py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 text-[11px] text-center border border-stone-200/60 dark:border-stone-800">
                  Veterinario Tratante: {card.veterinarian}
                </div>
              )}
            </div>
          )}
        </div>

        {/* F) Pie de Tarjeta */}
        <div className="px-4 pb-4 pt-2 text-center text-[9.5px] text-stone-400 dark:text-stone-500 border-t border-stone-100 dark:border-stone-800 leading-tight">
          Pasaporte de Emergencia verificado por NutriPet. Datos autorizados por el tutor para fines de auxilio.
        </div>

      </div>

      {/* Botón de retorno fuera de la tarjeta */}
      <div className="pt-2 text-center">
        <Link 
          to="/"
          className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a NutriPet
        </Link>
      </div>
    </div>
  );
};
