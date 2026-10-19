import type { IncomingMessage, ServerResponse } from 'http';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';

type ApiRequest = IncomingMessage & {
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  setHeader: (name: string, value: string) => void;
};

export function initializeFirebaseAdmin(): void {
  if (getApps().length > 0) {
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const appOptions = projectId ? { projectId } : {};
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    initializeApp({ ...appOptions, credential: cert(JSON.parse(serviceAccountKey)) });
    return;
  }

  initializeApp({ ...appOptions, credential: applicationDefault() });
}

export function getBearerToken(req: ApiRequest): string | null {
  const authorization = req.headers.authorization ?? req.headers.Authorization;
  if (typeof authorization !== 'string') {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

export function isFirebaseAuthError(error: unknown): boolean {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code.startsWith('auth/');
}

export function applyApiCors(req: ApiRequest, res: ApiResponse): void {
  const configuredOrigins = (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : '';

  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
