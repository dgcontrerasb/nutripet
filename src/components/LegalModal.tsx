import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Mail, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'contact';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'contact'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90dvh] my-auto overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Información Legal y Privacidad
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                NutriPet App • Transparencia y Protección de Datos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 px-4 pt-2 gap-2 bg-stone-50/60 dark:bg-stone-850/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Términos de Uso</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Política de Privacidad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contacto y Soporte</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-stone-700 dark:text-stone-300 flex-1">
          {activeTab === 'terms' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-medium text-[11.5px]">
                  <strong>Descargo de Responsabilidad Médico-Veterinario:</strong> NutriPet es una herramienta de cálculo y organización para fines estrictamente orientativos e informativos. Los resultados no constituyen diagnóstico, prescripción médica ni asesoría veterinaria personalizada. Consulta a un médico veterinario antes de realizar cualquier cambio en la dieta o tratamiento de tu mascota.
                </p>
              </div>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">1. Aceptación del Servicio</h4>
              <p>
                Al acceder o utilizar NutriPet, aceptas estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no debes hacer uso de la plataforma.
              </p>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">2. Naturaleza de los Cálculos</h4>
              <p>
                Los cálculos nutricionales (RER, MER, gramos diarios de croqueta o dietas BARF) se basan en directrices internacionales reconocidas (FEDIAF y NRC). No obstante, cada animal posee particularidades metabólicas, clínicas y genéticas individuales. El usuario asume toda la responsabilidad sobre el uso de la información.
              </p>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">3. Suscripciones y Funcionalidades</h4>
              <p>
                NutriPet ofrece modalidades de acceso libre y planes de suscripción de pago (NutriPet Pro) procesados a través de pasarelas seguras (Wompi y PayPal). Los planes otorgan acceso a funciones avanzadas y pueden ser cancelados en cualquier momento por el usuario.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3.5">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">1. Datos que Recopilamos</h4>
              <p>
                Recopilamos únicamente los datos necesarios para brindar el servicio:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de Cuenta:</strong> Correo electrónico y nombre público proporcionado al iniciar sesión mediante Google Authentication.</li>
                <li><strong>Datos de Mascotas:</strong> Nombre, especie, peso, edad, condición física, fotos (almacenadas localmente/comprimidas), registros de vacunas e historial médico.</li>
                <li><strong>Métricas de Uso:</strong> Registro anónimo de eventos mediante Google Analytics 4 para mejorar el rendimiento de la aplicación.</li>
              </ul>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">2. Servicios y Proveedores Externos</h4>
              <p>
                Utilizamos la infraestructura en la nube de <strong>Google Firebase</strong> (Firebase Auth, Cloud Firestore) para la autenticación y almacenamiento seguro de datos, así como <strong>Vercel</strong> para el alojamiento y entrega de la aplicación web.
              </p>

              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">3. Tus Derechos y Eliminación de Datos</h4>
              <p>
                Tienes derecho a acceder, rectificar o solicitar la eliminación total e irreversible de tu cuenta y todos los datos asociados de nuestras bases de datos en cualquier momento desde la configuración de la app o escribiendo a nuestro canal de soporte.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Canal Oficial de Atención y Soporte</h4>
              <p>
                Si tienes preguntas sobre el funcionamiento de la plataforma, necesitas soporte con tu suscripción o deseas ejercer tus derechos sobre tus datos personales:
              </p>

              <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold uppercase">Correo de Soporte y Privacidad</span>
                    <a 
                      href="mailto:nutripet.v2@gmail.com" 
                      className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      nutripet.v2@gmail.com
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Tiempo de respuesta habitual: 24 a 48 horas hábiles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-850/90 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};