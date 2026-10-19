import { getFirestore } from 'firebase-admin/firestore';

export class PaymentAlreadyProcessedError extends Error {}

interface VerifiedPayment {
  uid: string;
  planId: 'pro_monthly' | 'pro_annual';
  provider: 'wompi' | 'paypal';
  transactionId: string;
  amount: number;
  currency: 'COP' | 'USD';
}

export async function activateVerifiedPayment(payment: VerifiedPayment) {
  const { uid, planId, provider, transactionId, amount, currency } = payment;
  const firestore = getFirestore();
  const paymentRef = firestore.collection('processed_payments').doc(`${provider}_${transactionId}`);
  const userRef = firestore.collection('users').doc(uid);
  const now = Date.now();
  const durationDays = planId === 'pro_annual' ? 425 : 60;
  const subscription = {
    tier: planId,
    status: 'active',
    planName: planId === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual',
    activatedAt: now,
    validUntil: new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    transactionId,
    paymentProvider: provider,
    paymentVerified: true,
    amount,
    currency
  };

  let responseSubscription = subscription;
  await firestore.runTransaction(async (transaction) => {
    const processedPayment = await transaction.get(paymentRef);
    if (processedPayment.exists) {
      const existing = processedPayment.data();
      if (
        existing?.userId === uid &&
        existing?.planId === planId &&
        existing?.provider === provider &&
        existing?.verified === true &&
        typeof existing.subscription?.validUntil === 'string' &&
        Date.parse(existing.subscription.validUntil) > now
      ) {
        responseSubscription = existing.subscription;
        return;
      }
      throw new PaymentAlreadyProcessedError('Payment already assigned to another account or plan.');
    }

    transaction.create(paymentRef, {
      userId: uid,
      planId,
      provider,
      transactionId,
      amount,
      currency,
      verified: true,
      subscription,
      processedAt: now
    });
    transaction.set(userRef, {
      isPro: true,
      subscription,
      updatedAt: now
    }, { merge: true });
  });

  return responseSubscription;
}
