import { firebaseConfig } from '../config/firebase';

console.log('🔥 [Firebase] Proyecto conectado:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId,
  databaseId: '(default)'
});

// Re-exporta la configuración centralizada de Firebase desde src/config/firebase.ts
export * from '../config/firebase';
export { default } from '../config/firebase';
