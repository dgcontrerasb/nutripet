import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Función defensiva para normalizar y corregir errores tipográficos en el authDomain
const rawAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nutripet-dev.firebaseapp.com';
const resolvedAuthDomain = rawAuthDomain.startsWith('utripet-dev.firebaseapp.com')
  ? rawAuthDomain.replace('utripet-dev.firebaseapp.com', 'nutripet-dev.firebaseapp.com')
  : rawAuthDomain;

// Configuración de Firebase para NutriPet obtenida exclusivamente de variables de entorno
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: resolvedAuthDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

const app: FirebaseApp = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db: Firestore = getFirestore(app);

// Preparación de Firebase App Check (sin romper el entorno de desarrollo)
if (typeof window !== 'undefined') {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaSiteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('🛡️ App Check inicializado correctamente');
    } catch (e) {
      console.warn('Nota: App Check no se pudo inicializar en dev:', e);
    }
  }
}

// Logs seguros de diagnóstico (sin secretos ni claves expuestas)
console.log('📌 Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});
console.log('🔍 Entorno Firebase: NutriPet Dev');
console.log('🔍 Firebase key presente:', Boolean(firebaseConfig.apiKey));
console.log('🔍 Firebase project:', firebaseConfig.projectId);
console.log('🔍 Firestore database: (default)');

export default app;
