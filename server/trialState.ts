import { getFirestore } from 'firebase-admin/firestore';

function toTimestamp(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  if (typeof value === 'object' && value !== null && 'toMillis' in value) {
    const toMillis = value.toMillis;
    if (typeof toMillis === 'function') {
      const parsed = toMillis.call(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
  }
  return null;
}

export async function getOrCreateTrialStart(uid: string, preferredStart: number | null): Promise<number> {
  const firestore = getFirestore();
  const trialRef = firestore.collection('trial_records').doc(uid);

  return firestore.runTransaction(async (transaction) => {
    const trialSnap = await transaction.get(trialRef);
    const existingStart = toTimestamp(trialSnap.data()?.trialStartedAt);
    if (trialSnap.exists && existingStart !== null) {
      return existingStart;
    }

    const now = Date.now();
    const trialStartedAt = preferredStart !== null && preferredStart <= now
      ? preferredStart
      : now;

    transaction.set(trialRef, {
      userId: uid,
      trialStartedAt,
      updatedAt: now
    }, { merge: true });

    return trialStartedAt;
  });
}
