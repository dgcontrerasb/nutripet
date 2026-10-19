import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Check,
  Crown,
  FileSpreadsheet,
  PawPrint,
  ShieldCheck,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import { usePets } from '../context/PetContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanId = 'pro_monthly' | 'pro_annual';
type Currency = 'COP' | 'USD';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, subscription, trialDaysRemaining, loginWithGoogle } = usePets();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro_monthly');
  const [currency, setCurrency] = useState<Currency>('COP');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(false);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPro = ['pro', 'pro_monthly', 'pro_annual'].includes(subscription?.tier || '') &&
    subscription?.status === 'active';
  const paymentMethod = currency === 'COP' ? 'Wompi' : 'PayPal';
  const amount = currency === 'COP'
    ? selectedPlan === 'pro_annual' ? '$69.900 COP' : '$9.900 COP'
    : selectedPlan === 'pro_annual' ? '$19.99 USD' : '$2.99 USD';
  const duration = selectedPlan === 'pro_annual'
    ? '425 días (aprox. 14 meses)'
    : '60 días';

  const handleSubscribe = async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      const idToken = await user.getIdToken();

      if (currency === 'COP') {
        const response = await fetch('/api/wompi/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`
          },
          body: JSON.stringify({ planId: selectedPlan })
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || `Wompi rechazó la solicitud (${response.status}).`);
        }
        if (
          data?.isConfigured !== true ||
          typeof data.publicKey !== 'string' ||
          typeof data.amountInCents !== 'number' ||
          typeof data.reference !== 'string' ||
          typeof data.signature !== 'string' ||
          typeof data.redirectUrl !== 'string'
        ) {
          throw new Error('El servidor no devolvió los datos necesarios para iniciar el pago con Wompi.');
        }

        const checkoutUrl = `https://checkout.wompi.co/p/?public-key=${encodeURIComponent(data.publicKey)}&currency=COP&amount-in-cents=${data.amountInCents}&reference=${encodeURIComponent(data.reference)}&signature:integrity=${encodeURIComponent(data.signature)}&redirect-url=${encodeURIComponent(data.redirectUrl)}`;
        window.location.href = checkoutUrl;
        return;
      }

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ planId: selectedPlan })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `PayPal rechazó la solicitud (${response.status}).`);
      }
      if (typeof data?.approveUrl !== 'string') {
        throw new Error('El servidor no devolvió el enlace de aprobación de PayPal.');
      }

      window.location.href = data.approveUrl;
    } catch (error) {
      console.warn('Subscription checkout error:', error);
      alert(error instanceof Error
        ? error.message
        : 'No se pudo iniciar el pago. Inténtalo de nuevo.');
      setIsProcessing(false);
    }
  };

  const planOptions: Array<{
    id: PlanId;
    title: string;
    duration: string;
    price: string;
    note: string;
    promotion: string;
    badge?: string;
  }> = [
    {
      id: 'pro_monthly',
      title: '30 días + 30 días de regalo',
      duration: '60 días de NutriPet Pro en total',
      price: currency === 'COP' ? '$9.900 COP' : '$2.99 USD',
      note: 'Pagas el primer mes',
      promotion: 'El segundo mes va por cuenta nuestra'
    },
    {
      id: 'pro_annual',
      title: '12 meses + 2 meses de regalo',
      duration: '425 días de NutriPet Pro en total',
      price: currency === 'COP' ? '$69.900 COP' : '$19.99 USD',
      note: 'Un solo pago por todo el periodo',
      promotion: 'Incluye dos meses adicionales',
      badge: 'Más tiempo'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
        className="my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900"
      >
        <header className="relative shrink-0 border-b border-stone-200 bg-gradient-to-r from-emerald-800 to-teal-700 px-5 py-5 text-white sm:px-7">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Crown className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                NutriPet Pro
              </p>
              <h2 id="subscription-title" className="mt-0.5 text-xl font-black sm:text-2xl">
                {isPro ? 'Tu plan NutriPet Pro' : 'Elige tu acceso Pro'}
              </h2>
            </div>
          </div>
          {!isPro && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">
              Selecciona cuánto tiempo quieres y cómo prefieres pagar. Verás el total antes de continuar.
            </p>
          )}
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          {isPro ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                <div>
                  <h3 className="font-bold text-emerald-950 dark:text-emerald-100">
                    {subscription.planName || 'NutriPet Pro'} está activo
                  </h3>
                  <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-200">
                    Válido hasta {subscription.validUntil || 'la fecha indicada en tu cuenta'}.
                  </p>
                  <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
                    Es un pago único; no hay renovación automática.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {trialDaysRemaining > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  <p className="text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">
                    Tienes {trialDaysRemaining} {trialDaysRemaining === 1 ? 'día' : 'días'} de acceso de bienvenida.
                    El periodo pagado comienza cuando se confirma la compra y no tiene renovación automática.
                  </p>
                </div>
              )}

              <section aria-labelledby="plan-step-title">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">1</span>
                  <h3 id="plan-step-title" className="font-bold text-stone-900 dark:text-stone-100">
                    Elige la duración
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {planOptions.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative rounded-2xl border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/35'
                            : 'border-stone-200 bg-white hover:border-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500'
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
                            {plan.badge}
                          </span>
                        )}
                        <span className="block pr-20 text-sm font-semibold text-stone-600 dark:text-stone-300">
                          {plan.note}
                        </span>
                        <span className="mt-2 block text-lg font-black text-stone-950 dark:text-white">
                          {plan.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-stone-600 dark:text-stone-400">
                          {plan.duration}
                        </span>
                        <span className="mt-2 block text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          {plan.promotion}
                        </span>
                        <span className="mt-4 block text-2xl font-black text-emerald-800 dark:text-emerald-300">
                          {plan.price}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-500 dark:bg-emerald-500' : 'border-stone-400 dark:border-stone-500'}`}>
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          {isSelected ? 'Seleccionado' : 'Seleccionar este plan'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="payment-step-title">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">2</span>
                  <h3 id="payment-step-title" className="font-bold text-stone-900 dark:text-stone-100">
                    Elige cómo pagar
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={currency === 'COP'}
                    onClick={() => setCurrency('COP')}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      currency === 'COP'
                        ? 'border-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/35'
                        : 'border-stone-200 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🇨🇴</span>
                    <span>
                      <span className="block font-bold text-stone-900 dark:text-stone-100">Colombia · COP</span>
                      <span className="mt-1 block text-sm text-stone-600 dark:text-stone-400">Wompi · Nequi, PSE y tarjetas disponibles en el checkout</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={currency === 'USD'}
                    onClick={() => setCurrency('USD')}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      currency === 'USD'
                        ? 'border-emerald-700 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/35'
                        : 'border-stone-200 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-500'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🌎</span>
                    <span>
                      <span className="block font-bold text-stone-900 dark:text-stone-100">Pago internacional · USD</span>
                      <span className="mt-1 block text-sm text-stone-600 dark:text-stone-400">PayPal · pago en dólares</span>
                    </span>
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/70">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-black text-white">3</span>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100">Revisa tu compra</h3>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      NutriPet Pro · {selectedPlan === 'pro_annual'
                        ? '12 meses pagados + 2 de regalo (425 días)'
                        : '1 mes pagado + 1 mes de regalo (60 días)'}
                    </p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                      Pago único con {paymentMethod}. Sin cobros automáticos.
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-xl font-black text-stone-950 dark:text-white">
                    {amount}
                    <span className="block text-[10px] font-medium text-stone-500 dark:text-stone-400">Total a pagar hoy</span>
                  </p>
                </div>
              </section>

              <section aria-labelledby="included-title" className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <h3 id="included-title" className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                  <Zap className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  Incluido durante tu acceso Pro
                </h3>
                <div className="grid gap-x-4 gap-y-2 text-sm text-stone-700 dark:text-stone-300 sm:grid-cols-2">
                  <span className="flex items-center gap-2"><PawPrint className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />Mascotas ilimitadas</span>
                  <span className="flex items-center gap-2"><Activity className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />Gráficas de evolución y peso</span>
                  <span className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />Ficha técnica en PDF</span>
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />Asistente nutricional y recetas</span>
                </div>
              </section>

              {!user && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-sm text-amber-950 dark:text-amber-100">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Inicia sesión para asociar tu compra a tu cuenta NutriPet.</span>
                  </div>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="shrink-0 rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {!isPro && (
          <footer className="shrink-0 border-t border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:px-7">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isProcessing || !user}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Conectando con {paymentMethod}…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Continuar a {paymentMethod} · {amount}</span>
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-stone-500 dark:text-stone-400">
              Se abrirá el sitio seguro de {paymentMethod} para completar el pago.
            </p>
          </footer>
        )}
      </section>
    </div>
  );
};
