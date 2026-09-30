import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePets } from '../context/PetContext';
import { auth } from '../lib/firebase';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Syringe, 
  Pill, 
  Loader2, 
  MessageCircle, 
  QrCode, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { POPULAR_BREEDS } from '../data';
import { NutriPetLogo } from './NutriPetLogo';
import { downloadElementAsPdf } from '../utils/pdfExport';
import { 
  ensurePublicPetCard, 
  getPublicPetCard 
} from '../services/publicPetService';

import { ProFeatureLock } from './ProFeatureLock';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscriptionModal?: () => void;
}

export const ExportPetCardModal: React.FC<Props> = ({ isOpen, onClose, onOpenSubscriptionModal }) => {
  const { activePet, reminders, setPetPublicId, isProOrTrial } = usePets();
  const handleOpenSub = onOpenSubscriptionModal || (() => {});
  const [isExporting, setIsExporting] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

  // Estados para la gestión del Pasaporte QR Público
  const [qrActive, setQrActive] = useState<boolean>(false);
  const [shareHealth, setShareHealth] = useState<boolean>(true);
  const [shareOwner, setShareOwner] = useState<boolean>(true);
  const [shareVet, setShareVet] = useState<boolean>(true);

  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
  const [isSavingQr, setIsSavingQr] = useState<boolean>(false);
  const [qrStatusMsg, setQrStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado del QR Data URL generado 100% en local en el navegador
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Bloqueo de scroll del body cuando el carnet o modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cargar estado del QR existente de forma 100% segura (solo lectura getDoc, nunca escrituras)
  useEffect(() => {
    if (!isOpen || !activePet) return;

    const loadQrState = async () => {
      setIsLoadingQr(true);
      try {
        const publicId = activePet.publicId || activePet.id;
        const data = await getPublicPetCard(publicId);
        if (data) {
          setQrActive(Boolean(data.active));
          setShareHealth(data.shareHealthEmergencyInfo ?? true);
          setShareOwner(data.shareOwnerContact ?? true);
          setShareVet(data.shareVetContact ?? true);
        } else {
          setQrActive(false);
        }
      } catch (e: any) {
        console.warn('⚠️ [ExportPetCardModal] No se pudo recuperar el estado QR previo:', e?.message || e);
        setQrActive(false);
      } finally {
        setIsLoadingQr(false);
      }
    };

    loadQrState();
  }, [isOpen, activePet?.id, activePet?.publicId]);

  const publicId = activePet ? (activePet.publicId || activePet.id) : '';
  const breed = activePet ? POPULAR_BREEDS.find(b => b.id === activePet.breedId) : null;
  const breedName = activePet ? (breed ? breed.name : activePet.breedCustom || 'Mestizo / Único') : '';
  const photoSrc = activePet ? (activePet.photoUrl || (activePet as any).photoURL) : null;

  useEffect(() => {
    setPhotoError(false);
  }, [activePet?.id, photoSrc]);

  // URL del QR estable y única basada en publicId (100% local, cero escrituras a Firestore)
  const qrUrl = (qrActive && publicId)
    ? `${window.location.origin}/qr/${encodeURIComponent(publicId)}`
    : null;

  // Generación local del código QR como Data URL (PNG base64 puro, sin llamadas a servidores externos)
  useEffect(() => {
    let isMounted = true;

    if (!qrUrl) {
      setQrDataUrl(null);
      setIsGeneratingQr(false);
      return;
    }

    setIsGeneratingQr(true);

    QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setIsGeneratingQr(false);
        }
      })
      .catch((err) => {
        console.error('❌ [QR] Error generando QR local:', err);
        if (isMounted) {
          setQrDataUrl(null);
          setIsGeneratingQr(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [qrUrl]);

  if (!isOpen || !activePet) return null;

  // Guardar o alternar estado del carnet público en publicPets/{publicId} usando la función centralizada única
  const handleSavePublicQr = async (forceActiveState?: boolean) => {
    if (!isProOrTrial) {
      if (handleOpenSub) handleOpenSub();
      return;
    }

    if (!auth.currentUser?.uid) {
      setQrStatusMsg({ type: 'error', text: 'Debes haber iniciado sesión para administrar el carnet QR público.' });
      return;
    }

    setIsSavingQr(true);
    setQrStatusMsg(null);

    const newActiveState = forceActiveState !== undefined ? forceActiveState : qrActive;

    try {
      const savedPublicId = await ensurePublicPetCard(activePet, {
        active: newActiveState,
        shareHealth,
        shareOwner,
        shareVet
      }, auth.currentUser);

      if (savedPublicId) {
        if (activePet.publicId !== savedPublicId) {
          activePet.publicId = savedPublicId;
          await setPetPublicId(activePet.id, savedPublicId);
        }
        setQrActive(newActiveState);
        setQrStatusMsg({
          type: 'success',
          text: newActiveState 
            ? '¡Pasaporte QR activo y actualizado con éxito en la nube!' 
            : 'Pasaporte QR desactivado. Nadie podrá consultar el carnet público.'
        });
      } else {
        setQrStatusMsg({
          type: 'error',
          text: 'No se pudo actualizar el carnet público. Revisa los datos de la mascota.'
        });
      }
    } catch (error: any) {
      console.error('❌ [QR] Error Firestore completo:', {
        code: error?.code,
        message: error?.message,
        publicId,
        uid: auth.currentUser?.uid,
        petId: activePet?.id,
        petPublicId: activePet?.publicId
      });
      const code = error?.code || '';
      if (code === 'permission-denied') {
        setQrStatusMsg({ type: 'error', text: 'No tienes permisos para modificar este carnet o el formato no cumple con las reglas de seguridad.' });
      } else {
        setQrStatusMsg({ type: 'error', text: `Error al conectar con la base de datos: ${error?.message || error}` });
      }
    } finally {
      setIsSavingQr(false);
    }
  };

  const calculateAge = () => {
    if (activePet.birthDate) {
      const birth = new Date(activePet.birthDate);
      const now = new Date();
      let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      if (now.getDate() < birth.getDate()) months--;
      if (months <= 0) return 'Menos de 1 mes';
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      if (years === 0) return `${remMonths} meses`;
      if (remMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
      return `${years} ${years === 1 ? 'año' : 'años'} y ${remMonths} meses`;
    }
    return `${activePet.ageMonths} meses`;
  };

  const handleShareWhatsApp = () => {
    const qrLink = qrActive ? `${window.location.origin}/qr/${encodeURIComponent(publicId)}` : null;
    const lines = [
      `🐾 *FICHA TÉCNICA Y CARNET VETERINARIO - ${activePet.name.toUpperCase()}* 🐾`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *Especie:* ${activePet.type === 'dog' ? '🐶 Canino' : '🐱 Felino'}`,
      `• *Raza:* ${breedName}`,
      `• *Edad:* ${calculateAge()}`,
      `• *Peso Actual:* ${activePet.weightKg} kg`,
      `• *Esterilizado:* ${activePet.neutered ? 'Sí' : 'No'}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *TUTOR Y CONTACTO:*`,
      `• *Tutor:* ${activePet.ownerName || 'No registrado'}`,
      activePet.ownerPhone ? `• *Teléfono:* ${activePet.ownerPhone}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      qrLink ? `🛡️ *Pasaporte Digital QR:* ${qrLink}` : null,
      `✨ _Generado con NutriPet (https://nutripet.ai.studio)_`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  // Descarga limpia y segura a PDF
  const handleDownloadPdf = async () => {
    if (!isProOrTrial) {
      if (handleOpenSub) handleOpenSub();
      return;
    }

    if (!activePet) return;
    setIsExporting(true);
    setPdfError(null);

    const safeName = activePet.name ? activePet.name.replace(/\s+/g, '_') : 'Mascota';
    const filename = `Carnet_${safeName}_NutriPet.pdf`;

    try {
      await downloadElementAsPdf('printable-pet-card', filename);
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al exportar el carnet a PDF.';
      console.error('❌ [PDF] Error de exportación capturado en modal:', err);
      setPdfError(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  const vaccines = reminders.filter(r => r.type === 'vaccine');
  const dewormings = reminders.filter(r => r.type === 'deworming');

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Modal Toolbar (no-print) */}
        <div className="p-4 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-white">
                Carnet de Salud & Ficha Médica Oficial
              </h3>
              <p className="text-[11px] text-stone-400">
                Documento oficial descargable en PDF y Pasaporte QR de Emergencia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExporting ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Wrapper */}
        <div className="overflow-y-auto flex-1 bg-stone-50 p-4 space-y-6">

          {!isProOrTrial && (
            <div className="no-print">
              <ProFeatureLock
                compact
                featureName="Exportación a PDF & Pasaporte QR de Emergencia"
                description="Exporta el carnet oficial imprimible de tu mascota y activa la ficha médica pública por código QR."
                benefits={[
                  "Exportación oficial a PDF en alta resolución",
                  "Pasaporte digital QR para placa de identificación",
                  "Sincronización en tiempo real de carnet médico"
                ]}
                onOpenSubscriptionModal={handleOpenSub || (() => {})}
              />
            </div>
          )}

          {/* Mensaje de error de exportación PDF si ocurre */}
          {pdfError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pdfError}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setPdfError(null)}
                className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* SECCIÓN DE GESTIÓN DEL PASAPORTE QR PÚBLICO (no-print) */}
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-sm space-y-4 no-print">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h4 className="font-heading font-extrabold text-stone-900 text-sm">
                  Pasaporte QR de Emergencia (Público)
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                qrActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-100 text-stone-600'
              }`}>
                {qrActive ? '● QR Activo' : '○ QR Inactivo'}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Configura qué datos deseas que sean visibles públicamente al escanear el código QR del collar o placa. Por privacidad, los datos se almacenan de forma aislada y bajo un token seguro.
            </p>

            {/* Opciones de Consentimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                <input 
                  type="checkbox" 
                  checked={shareHealth} 
                  onChange={e => setShareHealth(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Alergias & Salud</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                <input 
                  type="checkbox" 
                  checked={shareOwner} 
                  onChange={e => setShareOwner(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Teléfono Tutor</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                <input 
                  type="checkbox" 
                  checked={shareVet} 
                  onChange={e => setShareVet(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Contacto Veterinario</span>
              </label>
            </div>

            {/* Acciones de Activación y Guardado */}
            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSavePublicQr(!qrActive)}
                  disabled={isSavingQr || isLoadingQr}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    qrActive 
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                  }`}
                >
                  {isSavingQr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : qrActive ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>{qrActive ? 'Desactivar QR Público' : 'Activar Pasaporte QR'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSavePublicQr()}
                  disabled={isSavingQr || isLoadingQr}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isSavingQr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>

            {/* Mensajes de Estado */}
            {qrStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                qrStatusMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                {qrStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{qrStatusMsg.text}</span>
              </div>
            )}
          </div>

          {/* DOCUMENTO IMPRESO EN PDF / VISUALIZACIÓN */}
          <div 
            id="printable-pet-card" 
            className="p-5 space-y-4 text-stone-900 bg-white border-4 border-emerald-600/10 rounded-3xl relative overflow-visible print:p-4 print:border-none print:shadow-none"
          >
            <div className="flex flex-col gap-4">
              
              {/* Encabezado */}
              <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 overflow-hidden border border-emerald-300 flex-shrink-0">
                  {photoSrc && !photoError ? (
                    <img 
                      src={photoSrc} 
                      alt={activePet.name} 
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{activePet.type === 'dog' ? '🐶' : '🐱'}</div>
                  )}
                </div>
                <div className="flex-1">
                  <NutriPetLogo size="sm" />
                  <h1 className="text-2xl font-black text-stone-900 mt-1">{activePet.name}</h1>
                  <p className="text-sm text-emerald-800 font-bold">{activePet.type === 'dog' ? 'Canino' : 'Felino'} • {breedName}</p>
                </div>
              </div>

              {/* Datos Generales */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span className="text-stone-500 font-bold">Edad:</span>
                  <span className="font-bold text-stone-800">{calculateAge()}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span className="text-stone-500 font-bold">Sexo / Peso:</span>
                  <span className="font-bold text-stone-800">{activePet.gender === 'male' ? 'Macho' : 'Hembra'} / {activePet.weightKg} kg</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span className="text-stone-500 font-bold">Esterilizado / Castrado:</span>
                  <span className="font-bold text-stone-800">{activePet.neutered ? 'Sí' : 'No'}</span>
                </div>
                {activePet.ownerName && (
                  <div className="flex justify-between border-b border-stone-100 py-1">
                    <span className="text-stone-500 font-bold">Tutor Responsable:</span>
                    <span className="font-bold text-stone-800">{activePet.ownerName} {activePet.ownerPhone ? `(${activePet.ownerPhone})` : ''}</span>
                  </div>
                )}
                {activePet.veterinarian && (
                  <div className="flex justify-between border-b border-stone-100 py-1">
                    <span className="text-stone-500 font-bold">Veterinario Tratante:</span>
                    <span className="font-bold text-stone-800">{activePet.veterinarian} {activePet.veterinarianPhone ? `(${activePet.veterinarianPhone})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Sección de Salud, Alergias y Enfermedades Conocidas */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wider border-b border-amber-200/60 pb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Historial de Salud & Alergias</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div>
                    <span className="text-stone-500 font-bold block">Alergias o Intolerancias:</span>
                    <span className="font-semibold text-stone-900">
                      {activePet.allergies && activePet.allergies.trim() ? activePet.allergies : 'Ninguna reportada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block">Enfermedades o Condiciones:</span>
                    <span className="font-semibold text-stone-900">
                      {activePet.knownDiseases && activePet.knownDiseases.trim() ? activePet.knownDiseases : 'Sano / Sin antecedentes'}
                    </span>
                  </div>
                </div>
                {activePet.notes && activePet.notes.trim() && (
                  <div className="pt-1 text-[11px] border-t border-amber-200/40">
                    <span className="text-stone-500 font-bold">Notas de cuidado: </span>
                    <span className="text-stone-800">{activePet.notes}</span>
                  </div>
                )}
              </div>

              {/* QR de Emergencia en Carnet (Generado 100% en local) */}
              <div className="flex justify-center my-1">
                <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center">
                  {qrUrl && qrDataUrl ? (
                    <>
                      <img 
                        src={qrDataUrl}
                        alt="QR Emergencia NutriPet" 
                        className="w-28 h-28"
                      />
                      <p className="text-[10px] font-bold text-emerald-800 mt-1 uppercase tracking-wider">Pasaporte QR Activo</p>
                    </>
                  ) : qrUrl && isGeneratingQr ? (
                    <div className="w-28 h-28 bg-stone-50 rounded-xl flex flex-col items-center justify-center text-stone-400 p-2 text-center border border-stone-200">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-1" />
                      <span className="text-[9px] font-bold">Generando QR...</span>
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-stone-100 rounded-xl flex flex-col items-center justify-center text-stone-400 p-2 text-center border border-dashed border-stone-300">
                      <QrCode className="w-8 h-8 mb-1" />
                      <span className="text-[9px] font-bold">QR Inactivo</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Esquema de Vacunación y Desparasitación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-stone-200 pb-1">
                  <Syringe className="w-3.5 h-3.5 text-purple-600" />
                  <h3 className="font-heading font-extrabold text-[11px] uppercase tracking-wider text-stone-900">
                    Vacunas 💉
                  </h3>
                </div>

                {vaccines.length === 0 ? (
                  <div className="p-2 bg-stone-50 rounded-xl text-center border border-dashed border-stone-200">
                    <p className="text-[9px] text-stone-400 italic">Sin vacunas registradas.</p>
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded-xl overflow-hidden bg-white text-[10px]">
                    <table className="w-full text-left">
                      <thead className="bg-purple-50 text-[9px] font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-1.5">Vacuna</th>
                          <th className="p-1.5">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {vaccines.slice(0, 3).map(v => (
                          <tr key={v.id}>
                            <td className="p-1.5 font-bold truncate max-w-[100px]">{v.name}</td>
                            <td className="p-1.5 font-mono">{v.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 border-b border-stone-200 pb-1">
                  <Pill className="w-3.5 h-3.5 text-amber-600" />
                  <h3 className="font-heading font-extrabold text-[11px] uppercase tracking-wider text-stone-900">
                    Desparasitaciones 🧴
                  </h3>
                </div>

                {dewormings.length === 0 ? (
                  <div className="p-2 bg-stone-50 rounded-xl text-center border border-dashed border-stone-200">
                    <p className="text-[9px] text-stone-400 italic">Sin registros.</p>
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded-xl overflow-hidden bg-white text-[10px]">
                    <table className="w-full text-left">
                      <thead className="bg-amber-50 text-[9px] font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-1.5">Producto</th>
                          <th className="p-1.5">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dewormings.slice(0, 3).map(d => (
                          <tr key={d.id}>
                            <td className="p-1.5 font-bold truncate max-w-[100px]">{d.name}</td>
                            <td className="p-1.5 font-mono">{d.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Firmas */}
            <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-8 text-center text-[10px]">
              <div className="h-10 border-b border-dashed border-stone-300 flex items-end justify-center pb-1">
                <span className="text-[8px] text-stone-400 italic">Firma del Tutor</span>
              </div>
              <div className="h-10 border-b border-dashed border-stone-300 flex items-end justify-center pb-1">
                <span className="text-[8px] text-stone-400 italic">Sello / Firma VET</span>
              </div>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};
