import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Observador de estado de autenticación y resolución de redirecciones
  useEffect(() => {
    let redirectCheckComplete = false;
    let authStateComplete = false;

    const checkComplete = () => {
      if (redirectCheckComplete && authStateComplete) {
        setLoading(false);
      }
    };

    // Asegurar la persistencia local en el navegador antes de verificar resultados de redirección u observador
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error detallado al configurar persistencia local en Firebase Auth:', error);
      })
      .finally(() => {
        // Procesar retorno de autenticación en caso de haber usado redirección
        getRedirectResult(auth)
          .then((result) => {
            if (result?.user) {
              console.log('✅ Auth de redirección exitosa:', result.user.email);
              setUser(result.user);
            }
          })
          .catch((error) => {
            console.error('Error detallado de autenticación en getRedirectResult:', error);
          })
          .finally(() => {
            redirectCheckComplete = true;
            checkComplete();
          });
      });

    // Suscripción al observador de Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      authStateComplete = true;
      checkComplete();
    });

    return () => unsubscribe();
  }, []);

  // Inicio de sesión resiliente con Google (Popup con fallback automático a Redirect)
  const loginWithGoogle = async () => {
    try {
      // Garantizar persistencia antes de iniciar el flujo de login
      await setPersistence(auth, browserLocalPersistence);

      // Ejecutar popup por defecto para todos los dispositivos
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error detallado de autenticación durante loginWithGoogle:', error);

      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        console.warn('Popup bloqueado por el navegador. Ejecutando redirección...');
        await signInWithRedirect(auth, googleProvider);
      } else if (error?.code === 'auth/popup-closed-by-user') {
        console.info('Login cancelado por el usuario.');
      } else {
        throw error;
      }
    }
  };

  // Cierre de sesión seguro
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
