import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Phone, Stethoscope, AlertTriangle, ArrowLeft } from 'lucide-react';
import { NutriPetLogo } from './NutriPetLogo';
import { PublicPetEmergencyCard } from '../types';

export const PublicPetProfile: React.FC = () => {
  const { publicToken } = useParams<{ publicToken?: string }>();
  const [card, setCard] = useState<PublicPetEmergencyCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicCard = async () => {
      // 🔗 Log DEV: Ruta detectada
      console.log('🔗 [QR Público] Ruta detectada con token presente:', publicToken);

      if (!publicToken) {
        console.warn('⚠️ [QR Público] Token no especificado en URL.');
        setError('Token de pasaporte QR no especificado.');
        setLoading(false);
        return;
      }

      try {
        // 📥 Log DEV: Lectura directa getDoc
        console.log(`📥 [QR Público] Leyendo publicPets/${publicToken}`);
        const docRef = doc(db, 'publicPets', publicToken);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as PublicPetEmergencyCard;
          if (data.active) {
            // ✅ Log DEV: Carnet activo
            console.log('✅ [QR Público] Carnet público activo cargado.');
            setCard(data);
            setLoading(false);
            return;
          } else {
            // ⚠️ Log DEV: Carnet inactivo
            console.warn('⚠️ [QR Público] Carnet no disponible o inactivo.');
            setError('Carnet de emergencia inactivo o deshabilitado por el propietario.');
            setLoading(false);
            return;
          }
        } else {
          // ⚠️ Log DEV: Documento no existe
          console.warn('⚠️ [QR Público] Carnet no disponible o inactivo.');
          setError('Carnet de emergencia inactivo o no encontrado.');
        }
      } catch (err: any) {
        // ❌ Log DEV: Error de lectura
        console.error('❌ [QR Público] Error de lectura:', err?.message || err);
        setError('Carnet de emergencia inactivo o no encontrado.');
      }

      setLoading(false);
    };

    fetchPublicCard();
  }, [publicToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 font-bold text-sm">Verificando pasaporte digital de emergencia...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🛡️
          </div>
          <h2 className="text-xl font-black text-stone-900">Carnet de Emergencia No Disponible</h2>
          <p className="text-stone-600 text-xs leading-relaxed">
            {error || 'El pasaporte digital de esta mascota no se encuentra activo o ha sido renovado.'}
          </p>
          <div className="pt-2 border-t border-stone-100 text-left bg-stone-50 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">¿Eres el tutor de la mascota?</span>
            <p className="text-[11px] text-stone-600">
              Ingresa a tu cuenta de NutriPet y abre la sección <strong>Carnet de Salud & Ficha Médica</strong> para activar el código QR público o generar uno nuevo con consentimiento.
            </p>
          </div>
          <Link 
            to="/" 
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Ir a NutriPet Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-4 border-emerald-600/20 overflow-hidden space-y-4 p-6">
        
        {/* Header con Logo y Estado */}
        <div className="flex justify-between items-center border-b pb-4">
          <NutriPetLogo size="xs" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            🛡️ Pasaporte de Emergencia
          </span>
        </div>

        {/* Foto y Ficha Básica */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 overflow-hidden border-2 border-emerald-600 shrink-0 shadow-sm flex items-center justify-center">
            {card.photoUrl ? (
              <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{card.type === 'dog' ? '🐶' : '🐱'}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900">{card.name}</h1>
            <p className="text-xs font-bold text-emerald-700">
              {card.type === 'dog' ? 'Canino' : 'Felino'} • {card.breedName}
            </p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Peso: {card.weightKg} kg • Esterilizado: {card.neutered ? 'Sí' : 'No'}
            </p>
          </div>
        </div>

        {/* Información Médica / Salud */}
        {card.shareHealthEmergencyInfo && (card.allergies || card.knownDiseases) ? (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Alergias & Cuidados Médicos</span>
            </div>
            {card.allergies && (
              <p className="text-xs text-amber-950 font-medium">
                <strong>Alergias:</strong> {card.allergies}
              </p>
            )}
            {card.knownDiseases && (
              <p className="text-xs text-amber-950 font-medium">
                <strong>Condiciones:</strong> {card.knownDiseases}
              </p>
            )}
          </div>
        ) : null}

        {/* Contacto del Tutor */}
        {card.shareOwnerContact && (card.ownerName || card.ownerPhone) ? (
          <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">👤 Contacto del Tutor</span>
            {card.ownerName && (
              <p className="font-bold text-stone-900 text-sm">{card.ownerName}</p>
            )}
            {card.ownerPhone && (
              <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
                <span className="text-xs font-semibold text-stone-700">{card.ownerPhone}</span>
                <a 
                  href={`tel:${card.ownerPhone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> Llamar
                </a>
              </div>
            )}
          </div>
        ) : null}

        {/* Contacto Veterinario */}
        {card.shareVetContact && (card.veterinarian || card.veterinarianPhone) ? (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
              <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Veterinario Tratante</span>
            </div>
            {card.veterinarian && (
              <p className="text-xs text-stone-800 font-medium">{card.veterinarian}</p>
            )}
            {card.veterinarianPhone && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-stone-600">{card.veterinarianPhone}</span>
                <a 
                  href={`tel:${card.veterinarianPhone}`}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Llamar Vet
                </a>
              </div>
            )}
          </div>
        ) : null}

        {/* Aviso de privacidad y seguridad */}
        <div className="p-2.5 rounded-xl bg-stone-100 text-stone-500 text-[10px] text-center">
          Pasaporte de Emergencia verificado por NutriPet. La información mostrada ha sido compartida voluntariamente por el tutor.
        </div>

        {/* Botón de retorno */}
        <div className="pt-2 text-center">
          <Link 
            to="/"
            className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a NutriPet
          </Link>
        </div>

      </div>
    </div>
  );
};
