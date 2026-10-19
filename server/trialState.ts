import { createHash } from 'node:crypto';
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

function getTrialRecordId(uid: string, email: string | null): string {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return uid;
  }

  const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');
  return `email_${emailHash}`;
}

export async function getOrCreateTrialStart(
  uid: string,
  email: string | null,
  preferredStart: number | null
): Promise<number> {
  const firestore = getFirestore();
  const trialCollection = firestore.collection('trial_records');
  const trialRef = trialCollection.doc(getTrialRecordId(uid, email));
  const legacyUidRef = trialCollection.doc(uid);

  return firestore.runTransaction(async (transaction) => {
    const [trialSnap, legacyUidSnap] = await Promise.all([
      transaction.get(trialRef),
      trialRef.path === legacyUidRef.path ? Promise.resolve(null) : transaction.get(legacyUidRef)
    ]);
    const existingStart = toTimestamp(trialSnap.data()?.trialStartedAt) ??
      (legacyUidSnap ? toTimestamp(legacyUidSnap.data()?.trialStartedAt) : null);
    if (existingStart !== null) {
      if (!trialSnap.exists) {
        transaction.set(trialRef, {
          userId: uid,
          trialStartedAt: existingStart,
          updatedAt: Date.now()
        }, { merge: true });
      }
      return existingStart;
    }

    const now = Date.now();
    const trialStartedAt = preferredStart !== null && preferredStart <= now
      ? preferredStart
      : now;

    transaction.set(trialRef, {
      userId: uid,
      ...(email?.trim() ? { emailHash: trialRef.id.slice('email_'.length) } : {}),
      trialStartedAt,
      updatedAt: now
    }, { merge: true });

    return trialStartedAt;
  });
}
