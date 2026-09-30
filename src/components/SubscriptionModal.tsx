import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Zap, 
  Calendar,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, subscription, trialDaysRemaining, updateSubscription, cancelSubscription, loginWithGoogle } = usePets();
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_annual'>('pro_monthly');
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP');
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'paypal'>('wompi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const checkoutRef = React.useRef<HTMLDivElement>(null);

  const scrollToCheckout = () => {
    if (checkoutRef.current) {
      checkoutRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Bloqueo de scroll del body cuando la ventana emergente está abierta y reinicio de estado
  React.useEffect(() => {
    setIsProcessing(false);
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

  // 1. Estabilidad del botón de pago y estado de carga con bloque finally
  const handleSubscribe = async () => {
    setIsProcessing(true);
    setSuccessMessage(null);
    let keepProcessing = false;

    try {
      // 1. Pagos en Colombia (COP): Todos se redirigen y procesan por Wompi (Nequi, Daviplata, PSE, Tarjetas, Bancolombia)
      if (currency === 'COP' || paymentMethod === 'wompi') {
        const wompiRes = await fetch('/api/wompi/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: selectedPlan === 'pro_annual' ? 'plan_pro_annual' : 'plan_pro_monthly',
            returnUrl: window.location.origin
          })
        });
        const wompiData = await wompiRes.json();

        if (wompiData.isConfigured && wompiData.publicKey) {
          keepProcessing = true;
          const wompiUrl = `https://checkout.wompi.co/p/?public-key=${wompiData.publicKey}&currency=COP&amount-in-cents=${wompiData.amountInCents}&reference=${wompiData.reference}${wompiData.signature ? `&signature:integrity=${wompiData.signature}` : ''}&redirect-url=${encodeURIComponent(wompiData.redirectUrl)}`;
          window.location.href = wompiUrl;
          return;
        } else {
          alert('La pasarela Wompi no está configurada actualmente. Por favor intenta más tarde.');
          return;
        }
      }

      // 2. Pagos Internacionales (USD): Se procesan por PayPal
      if (currency === 'USD' || paymentMethod === 'paypal') {
        const paypalRes = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: selectedPlan === 'pro_annual' ? 'plan_pro_annual' : 'plan_pro_monthly'
          })
        });
        const paypalData = await paypalRes.json();

        if (paypalData?.approveUrl) {
          keepProcessing = true;
          window.location.href = paypalData.approveUrl;
          return;
        } else {
          alert('No se pudo conectar con la pasarela PayPal. Verifica tus datos e intenta nuevamente.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Subscription checkout error:', err);
      alert('Hubo un inconveniente al conectar con la pasarela de pago. Por favor intenta más tarde.');
    } finally {
      if (!keepProcessing) {
        setIsProcessing(false);
      }
    }
  };

  const isPaidPro = ['pro', 'pro_monthly', 'pro_annual'].includes(subscription?.tier) && subscription?.status === 'active';
  const isPro = isPaidPro;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* 2. Coherencia con Modo Oscuro en el Contenedor Principal */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-amber-200/50 dark:border-stone-800 transition-colors">
        
        {/* Banner de Cabecera con Gradiente Dorado */}
        <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 p-5 sm:p-6 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-200 block">
                Suscripción Mensual NutriPet Pro
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-black">
                Activa tu Plan NutriPet Pro
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/90 max-w-xl">
            Desbloquea la gráfica de evolución de peso, exportación de Ficha Técnica oficial en PDF, IA veterinaria y sincronización en la nube.
          </p>
        </div>

        {/* Contenido Principal */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">

          {/* Mensaje de Éxito */}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl p-4 text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-start gap-3 animate-fade-in">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200 mb-1">¡Suscripción Activa y Desbloqueada!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {/* Estado de Suscripción Actual */}
          {isPro ? (
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-stone-850 dark:to-stone-800 border border-amber-300 dark:border-stone-700 rounded-2xl p-4 space-y-3 transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-amber-950 dark:text-amber-300 text-base">
                        {subscription.planName || 'NutriPet Pro'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                        Activo
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Válido hasta: <strong className="text-stone-800 dark:text-stone-100">{subscription.validUntil || 'Próximo mes'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('¿Estás seguro de cancelar la renovación automática de tu suscripción? Mantendrás el acceso Pro hasta el final del ciclo.')) {
                      await cancelSubscription();
                      alert('Tu suscripción ha sido cancelada. Mantendrás el acceso hasta finalizar el periodo actual.');
                    }
                  }}
                  className="text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold underline cursor-pointer self-end sm:self-center"
                >
                  Cancelar renovación
                </button>
              </div>
            </div>
          ) : (
            trialDaysRemaining > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-2xs">
                  🎁
                </div>
                <div>
                  <h4 className="font-heading font-black text-emerald-950 dark:text-emerald-200 text-sm">
                    Acceso de Bienvenida Activo ({trialDaysRemaining} {trialDaysRemaining === 1 ? 'día restante' : 'días restantes'})
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mt-0.5">
                    Cuentas con acceso a la IA Nutricional, ficha técnica en PDF y gráficas de evolución. Aprovecha la oferta 2x1 comprometiendo tu primer mes para recibir 60 días completos.
                  </p>
                </div>
              </div>
            )
          )}

          {!isPro && (
            <>
              {/* Banner de la Oferta Promocional: 30 Días Gratis al Comprometer el 1er Mes */}
              <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-teal-500/10 dark:from-amber-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-500/50 dark:border-emerald-700/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                  🎁
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    <span>¡Oferta de Lanzamiento: 30 Días Gratis!</span>
                  </div>
                  <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-tight">
                    Pagas tu primer mes hoy y recibes 60 Días Completos de NutriPet Pro
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    Al comprometer tu primer mes ({currency === 'COP' ? '$9.900 COP' : '$2.99 USD'}), te regalamos <strong>30 días adicionales gratis</strong> de bienvenida. Disfrutas de <strong>2 meses completos</strong> con IA Veterinaria, Ficha Técnica en PDF y Mascotas Ilimitadas.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400">✓ 60 días garantizados</span>
                    <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400">✓ Cancela cuando quieras</span>
                    <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400">✓ Nequi, PSE, Tarjeta o PayPal</span>
                  </div>
                </div>
              </div>

              {/* Selector de Moneda y Tarifas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800">
                <div>
                  <span className="text-xs font-black text-stone-800 dark:text-stone-200 uppercase tracking-wider block">
                    Moneda de Pago:
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {currency === 'COP' 
                      ? '🇨🇴 Mostrando tarifas en Pesos Colombianos (Wompi, Nequi, PSE)' 
                      : '🇺🇸 Mostrando tarifas en Dólares USD (PayPal, Tarjeta Internacional)'}
                  </span>
                </div>
                <div className="flex items-center bg-stone-200/80 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold shrink-0">
                  <button
                    id="btn-currency-cop"
                    type="button"
                    onClick={() => {
                      setCurrency('COP');
                      setPaymentMethod('wompi');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      currency === 'COP' 
                        ? 'bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-500/20' 
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>🇨🇴 COP</span>
                    <span className="text-[10px] opacity-90 font-medium">($9.900)</span>
                  </button>
                  <button
                    id="btn-currency-usd"
                    type="button"
                    onClick={() => {
                      setCurrency('USD');
                      setPaymentMethod('paypal');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      currency === 'USD' 
                        ? 'bg-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-500/20' 
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>🇺🇸 USD</span>
                    <span className="text-[10px] opacity-90 font-medium">($2.99)</span>
                  </button>
                </div>
              </div>

              {/* Grid de Selección de Planes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Opción 1: Pro Mensual (Promo 60 días) */}
                <div 
                  id="card-plan-monthly"
                  onClick={() => {
                    setSelectedPlan('pro_monthly');
                    scrollToCheckout();
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'pro_monthly' 
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/25 ring-2 ring-emerald-600/20 shadow-md' 
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase shadow-2xs">
                    Pagas 1 Mes, Llevas 2 Meses (60 Días)
                  </span>

                  <div>
                    <div className="flex justify-between items-start mb-1 pt-0.5">
                      <div>
                        <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                          Plan de Entrada
                        </span>
                        <h3 className="font-heading font-black text-base text-stone-900 dark:text-stone-100">
                          NutriPet Pro Mensual
                        </h3>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'pro_monthly' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'}`}>
                        {selectedPlan === 'pro_monthly' && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="my-2">
                      <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                        {currency === 'COP' ? '$9.900' : '$2.99'}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-bold"> / 60 días iniciales</span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Incluye <strong>30 días gratis de bienvenida</strong>. Tu próximo cobro es hasta dentro de 60 días.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="btn-select-monthly-plan"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('pro_monthly');
                      scrollToCheckout();
                    }}
                    className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedPlan === 'pro_monthly'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span>{selectedPlan === 'pro_monthly' ? '✓ Plan Elegido (Continuar al Pago ↓)' : 'Seleccionar Plan Mensual'}</span>
                  </button>
                </div>

                {/* Opción 2: Pro Anual (Promo 14 meses) */}
                <div 
                  id="card-plan-annual"
                  onClick={() => {
                    setSelectedPlan('pro_annual');
                    scrollToCheckout();
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === 'pro_annual' 
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/25 ring-2 ring-amber-500/20 shadow-md' 
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase shadow-2xs">
                    12 Meses + 2 Meses GRATIS (14 Meses)
                  </span>

                  <div>
                    <div className="flex justify-between items-start mb-1 pt-0.5">
                      <div>
                        <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          Máximo Ahorro
                        </span>
                        <h3 className="font-heading font-black text-base text-stone-900 dark:text-stone-100">
                          NutriPet Pro Anual
                        </h3>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'pro_annual' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-300 dark:border-stone-600'}`}>
                        {selectedPlan === 'pro_annual' && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="my-2">
                      <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                        {currency === 'COP' ? '$69.900' : '$19.99'}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-bold"> / 14 meses</span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Equivalente a solo <strong>{currency === 'COP' ? '$4.992' : '$1.42'}</strong> / mes. Ahorras más del 40% e incluye 2 meses gratis adicionales.
                    </p>
                  </div>

                  <button
                    type="button"
                    id="btn-select-annual-plan"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan('pro_annual');
                      scrollToCheckout();
                    }}
                    className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedPlan === 'pro_annual'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span>{selectedPlan === 'pro_annual' ? '✓ Plan Elegido (Continuar al Pago ↓)' : 'Seleccionar Plan Anual'}</span>
                  </button>
                </div>
              </div>

              {/* Selector de Método de Pago Oficial */}
              <div ref={checkoutRef} className="space-y-3 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                    Pasarela de Pago Oficial (Activación Inmediata):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currency === 'COP' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Pasarela Segura SSL
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Pago Protegido SSL
                      </span>
                    )}
                  </div>
                </div>

                {currency === 'COP' ? (
                  /* Tarjeta Oficial Wompi Bancolombia */
                  <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-600/20 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                          🇨🇴
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm">
                              Pasarela Oficial Wompi (Bancolombia)
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider">
                              Seguro & Automático
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            Todos los pagos en Colombia se procesan sin intermediarios ni cuentas manuales.
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Canales integrados en Wompi */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">📱</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">Nequi</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Vía Wompi</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">⚡</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">PSE</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Daviplata & Bancos</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">💳</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">Tarjetas</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Crédito / Débito</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">🏦</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">Bancolombia</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Botón directo</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200 font-medium bg-emerald-100/70 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>
                        Al dar clic abajo se abrirá el checkout oficial de <strong>Wompi</strong> con tu valor exacto. La activación de NutriPet Pro es <strong>inmediata y automática</strong> al confirmarse la transacción.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Tarjeta Oficial PayPal Internacional */
                  <div className="p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-600/20 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                          🅿️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm">
                              PayPal Internacional
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                              Global USD
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            Pago seguro en dólares para usuarios internacionales.
                          </p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">🅿️</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">Cuenta PayPal</span>
                          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">Saldo o cuenta vinculada</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-2 shadow-2xs">
                        <span className="text-xl">💳</span>
                        <div>
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight">Tarjetas Internacionales</span>
                          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">Visa, Mastercard, Amex</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-blue-900 dark:text-blue-200 font-medium bg-blue-100/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800/80">
                      <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      <span>
                        Serás redirigido a la pasarela segura de <strong>PayPal</strong> para autorizar el cobro. Tu suscripción NutriPet Pro se activará de forma instantánea.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Funciones Desbloqueadas Incluidas en Pro */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Funciones Desbloqueadas al Pagar:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Mascotas ilimitadas</strong> (Perros y Gatos)</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <span><strong>📈 Gráfica de evolución</strong> y curva de peso</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3 h-3" />
                </div>
                <span><strong>📄 Exportar Ficha Técnica</strong> oficial en PDF</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>IA Nutricional Veterinaria</strong> (Groq ultra-rápida)</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-800 dark:text-amber-300" />
                </div>
                <span><strong>Generador BARF & Recetas Caseras</strong></span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Sincronización segura en la nube</strong> (Firestore)</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Historial médico</strong> e impresiones clínicas</span>
              </div>
            </div>
          </div>

          {/* Botón de Acción Principal */}
          {!isPro && (
            <div className="space-y-3 pt-1">
              {!user && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Inicia sesión con Google para respaldar tu suscripción Pro en la nube.</span>
                  </div>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                  >
                    Conectar
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-heading font-black text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Conectando con la Pasarela de Pago...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4.5 h-4.5" />
                    <span>
                      {currency === 'COP'
                        ? `Pagar con Wompi • ${selectedPlan === 'pro_annual' ? '$69.900 COP (14 Meses)' : '$9.900 COP (60 Días)'}`
                        : `Pagar con PayPal • ${selectedPlan === 'pro_annual' ? '$19.99 USD (14 Meses)' : '$2.99 USD (60 Días)'}`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-stone-400 dark:text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Pago seguro. La activación es automática e inmediata al realizar la transacción.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
