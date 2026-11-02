import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Crown, 
  DollarSign, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  X, 
  Sparkles, 
  TrendingUp, 
  CreditCard, 
  Trash2, 
  Edit2, 
  Download, 
  Eye, 
  MessageSquare, 
  Star, 
  Activity,
  UserPlus,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { usePets } from '../context/PetContext';
import { UserSubscription, SubscriptionTier } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSummary {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  trialStartDate?: string;
  subscription?: UserSubscription;
  updatedAt?: string;
}

interface FeedbackItem {
  id: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  category?: string;
  comment: string;
  device?: string;
  createdAt?: any;
}

interface UserDetailsModalProps {
  user: UserSummary;
  onClose: () => void;
  onEdit: () => void;
}

// Micro-componente Sparkline decorativo SVG
const MicroSparkline: React.FC<{ trend: 'up' | 'stable' | 'down'; color: string }> = ({ trend, color }) => {
  const points = trend === 'up'
    ? '0,18 10,16 20,12 30,14 40,8 50,4 60,2'
    : trend === 'down'
    ? '0,2 10,6 20,8 30,12 40,14 50,16 60,18'
    : '0,10 10,12 20,9 30,11 40,9 50,10 60,10';

  return (
    <svg className="w-16 h-5 overflow-visible shrink-0" viewBox="0 0 60 20">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Modal de Detalles del Usuario
const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onEdit }) => {
  const isProUser = user.subscription && user.subscription.tier !== 'free' && user.subscription.status === 'active';
  const isTrial = !isProUser && Boolean(user.trialStartDate);
  const isManualUser = Boolean(user.subscription?.isManual || user.subscription?.planName?.toLowerCase().includes('manual') || user.uid.startsWith('manual_'));

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors animate-fade-in">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl overflow-hidden shadow-xs">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.email} className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">{user.displayName || 'Usuario'}</h3>
              <p className="text-xs text-white/90">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Estado</span>
              <span className={`text-sm font-black ${isProUser ? 'text-emerald-900 dark:text-emerald-200' : isTrial ? 'text-amber-900 dark:text-amber-200' : 'text-stone-700 dark:text-stone-300'}`}>
                {isProUser ? 'Activo (Pro)' : isTrial ? 'En Prueba' : 'Gratis'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase block">Tipo de Cuenta</span>
              <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                {isManualUser ? 'Manual' : 'Orgánica'}
              </span>
            </div>
          </div>

          {/* Plan */}
          {user.subscription && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-black uppercase">Plan Actual</span>
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">{user.subscription.planName}</div>
              <div className="text-xs text-stone-600 dark:text-stone-400">
                Vigencia: <strong className="text-stone-800 dark:text-stone-200">{user.subscription.validUntil || 'Indefinida'}</strong>
              </div>
              {user.subscription.autoRenew && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Renovación automática activada</span>
                </div>
              )}
            </div>
          )}

          {/* Fechas */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-750">
              <span className="text-stone-600 dark:text-stone-400 font-medium">Fecha de Registro</span>
              <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {user.trialStartDate && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-750">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Inicio de Prueba</span>
                <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">
                  {new Date(user.trialStartDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* UID */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase block mb-1">User ID</span>
            <code className="text-xs font-mono text-stone-700 dark:text-stone-300 break-all">{user.uid}</code>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {isManualUser && (
              <button
                onClick={onEdit}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Plan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de Edición de Suscripción
interface EditSubscriptionModalProps {
  user: UserSummary;
  onClose: () => void;
  onSave: (newSub: UserSubscription) => Promise<void>;
}

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({ user, onClose, onSave }) => {
  const [plan, setPlan] = useState<SubscriptionTier>(user.subscription?.tier || 'pro_monthly');
  const [days, setDays] = useState<number>(user.subscription?.tier === 'pro_annual' ? 420 : 60);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + days);
    
    const newSub: UserSubscription = {
      tier: plan,
      status: 'active',
      planName: plan === 'pro_annual' ? 'NutriPet Pro Anual' : 'NutriPet Pro Mensual',
      startDate: new Date().toISOString(),
      validUntil: validUntilDate.toISOString().split('T')[0],
      autoRenew: false,
      isManual: true,
      includeInRevenue: user.subscription?.includeInRevenue || false
    };

    await onSave(newSub);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl p-5 space-y-4 border border-stone-200 dark:border-stone-800 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-stone-900 dark:text-stone-100">Editar Suscripción</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase block mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => {
                const val = e.target.value as SubscriptionTier;
                setPlan(val);
                setDays(val === 'pro_annual' ? 420 : 60);
              }}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-xl text-xs"
            >
              <option value="pro_monthly">Mensual (60 días)</option>
              <option value="pro_annual">Anual (420 días / 14 meses)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase block mb-1">Días de Suscripción</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-xl text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
            <strong>Vigencia estimada:</strong> {new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 text-xs font-bold cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle } = usePets();
  
  const ADMIN_EMAIL = 'dgcontrerasb@gmail.com';
  const isEmailAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'feedback' | 'manual'>('users');
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'paying' | 'trial' | 'free'>('all');

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);

  const [manualEmail, setManualEmail] = useState<string>('');
  const [manualPlan, setManualPlan] = useState<SubscriptionTier>('pro_monthly');
  const [manualDays, setManualDays] = useState<number>(60);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [isActivatingManual, setIsActivatingManual] = useState<boolean>(false);
  const [manualIncludeInRevenue, setManualIncludeInRevenue] = useState<boolean>(false);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [lastFeedbackFetchTime, setLastFeedbackFetchTime] = useState<number>(0);

  // Consulta controlada para costo cero: solo lee cuando es necesario o el admin lo pide explícitamente
  const fetchUsers = async (forceRefresh = false) => {
    if (!forceRefresh && usersList.length > 0 && Date.now() - lastFetchTime < 10 * 60 * 1000) {
      return;
    }

    if (!user) {
      setLoadError('Debes iniciar sesión con tu cuenta de Google para acceder al panel.');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const usersColRef = collection(db, 'users');
      const snapshot = await getDocs(usersColRef);
      
      const rawUsers: UserSummary[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let docEmail = data.email;
        if (!docEmail && docSnap.id.startsWith('manual_')) {
          docEmail = docSnap.id.replace('manual_', '').replace(/_/g, '.').replace(/\.com$/, '@gmail.com');
        }
        if (docEmail) {
          const isThisAdmin = docEmail.toLowerCase().trim() === ADMIN_EMAIL;
          
          rawUsers.push({
            uid: docSnap.id,
            email: docEmail,
            displayName: isThisAdmin ? (data.displayName || 'Geovanny Contreras (Propietario)') : (data.displayName || 'Cliente Activado Manual'),
            photoURL: data.photoURL,
            trialStartDate: isThisAdmin ? undefined : data.trialStartDate,
            subscription: isThisAdmin ? {
              tier: 'pro_annual',
              status: 'active',
              planName: 'NutriPet Pro Anual (Propietario)',
              validUntil: '2030-12-31'
            } : data.subscription,
            updatedAt: data.updatedAt,
          });

          if (isThisAdmin && (!data.subscription || data.subscription.tier !== 'pro_annual' || data.subscription.validUntil !== '2030-12-31')) {
            setDoc(doc(db, 'users', docSnap.id), {
              subscription: {
                tier: 'pro_annual',
                status: 'active',
                planName: 'NutriPet Pro Anual (Propietario)',
                validUntil: '2030-12-31'
              },
              trialStartDate: null,
              trialEndsAt: null,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(err => console.error('Error auto-reparando suscripción admin:', err));
          }
        }
      });

      const userMap = new Map<string, UserSummary>();

      for (const item of rawUsers) {
        const key = item.email.toLowerCase().trim();
        if (!userMap.has(key)) {
          userMap.set(key, item);
        } else {
          const existing = userMap.get(key)!;
          const isExistingManual = existing.uid.startsWith('manual_');
          const isItemManual = item.uid.startsWith('manual_');

          const existingPro = existing.subscription && existing.subscription.tier !== 'free' && existing.subscription.status === 'active';
          const itemPro = item.subscription && item.subscription.tier !== 'free' && item.subscription.status === 'active';

          const chosenUid = (!isItemManual && isExistingManual) ? item.uid : existing.uid;
          const chosenDisplayName = item.displayName !== 'Usuario NutriPet' ? item.displayName : existing.displayName;
          const chosenPhoto = item.photoURL || existing.photoURL;

          let chosenSub = existing.subscription;
          if (itemPro && !existingPro) {
            chosenSub = item.subscription;
          } else if (item.subscription && !existing.subscription) {
            chosenSub = item.subscription;
          }

          const mergedUser: UserSummary = {
            uid: chosenUid,
            email: item.email,
            displayName: chosenDisplayName,
            photoURL: chosenPhoto,
            trialStartDate: existing.trialStartDate || item.trialStartDate,
            subscription: chosenSub,
            updatedAt: item.updatedAt || existing.updatedAt
          };

          userMap.set(key, mergedUser);
        }
      }

      const loaded = Array.from(userMap.values());

      if (loaded.length === 0 && user) {
        loaded.push({
          uid: user.uid,
          email: user.email || ADMIN_EMAIL,
          displayName: user.displayName || 'Administrador',
          photoURL: user.photoURL || undefined,
          trialStartDate: new Date().toISOString(),
          subscription: {
            tier: 'pro_annual',
            status: 'active',
            planName: 'NutriPet Pro Anual (Propietario)',
            validUntil: '2030-12-31'
          }
        });
      }

      setUsersList(loaded);
      setLastFetchTime(Date.now());
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      setLoadError('Error conectando a Firestore: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async (forceRefresh = false) => {
    if (!forceRefresh && feedbackList.length > 0 && Date.now() - lastFeedbackFetchTime < 3 * 60 * 1000) {
      return;
    }

    setLoadingFeedback(true);
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const items: FeedbackItem[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as FeedbackItem);
      });
      setFeedbackList(items);
      setLastFeedbackFetchTime(Date.now());
    } catch (e) {
      console.error('Error cargando feedbacks:', e);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar permanentemente este comentario de la base de datos?')) {
      return;
    }

    setDeletingFeedbackId(id);
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error al eliminar feedback:', err);
      alert('Error al intentar eliminar el comentario.');
    } finally {
      setDeletingFeedbackId(null);
    }
  };

  useEffect(() => {
    if (isOpen && user && isEmailAdmin) {
      if (activeAdminTab === 'users' || activeAdminTab === 'manual') {
        fetchUsers(false);
      } else {
        fetchFeedbacks(false);
      }
    }
  }, [isOpen, user, isEmailAdmin, activeAdminTab]);

  if (!isOpen) return null;

  if (!isEmailAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-8 text-center space-y-4 border border-stone-200 dark:border-stone-800">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-black text-stone-900 dark:text-stone-100 text-lg">Acceso Restringido</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Solo <strong>{ADMIN_EMAIL}</strong> tiene acceso a este panel.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Exportar a CSV (Excel compatible)
  const exportToCSV = () => {
    const headers = ['Email', 'Nombre', 'Estado', 'Plan', 'Vigencia', 'Tipo', 'Fecha Registro'];
    const rows = usersList.map(u => {
      const isPro = u.subscription && u.subscription.tier !== 'free' && u.subscription.status === 'active';
      const isTrial = !isPro && Boolean(u.trialStartDate);
      const isManual = Boolean(u.subscription?.isManual || u.uid.startsWith('manual_'));
      
      return [
        u.email,
        u.displayName || '',
        isPro ? 'Activo (Pro)' : isTrial ? 'En Prueba' : 'Gratis',
        u.subscription?.planName || (isTrial ? 'Prueba' : 'Básico'),
        u.subscription?.validUntil || '',
        isManual ? 'Manual' : 'Orgánica',
        u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : ''
      ].map(field => `"${field}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nutripet_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleEditSubscription = async (newSub: UserSubscription) => {
    if (!editingUser) return;
    
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        subscription: newSub,
        updatedAt: new Date().toISOString()
      });
      
      await fetchUsers(true);
      setEditingUser(null);
      alert('Suscripción actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al editar suscripción:', err);
      alert('Error: ' + err.message);
    }
  };

  // Cálculos financieros y métricas
  const payingSubscribers = usersList.filter((u) => {
    const sub = u.subscription;
    if (!sub) return false;
    return sub.tier !== 'free' && sub.status === 'active';
  });

  const monthlySubscribers = payingSubscribers.filter(u => u.subscription?.tier === 'pro_monthly');
  const annualSubscribers = payingSubscribers.filter(u => u.subscription?.tier === 'pro_annual');

  const eligiblePayingSubscribers = payingSubscribers.filter(u => {
    const sub = u.subscription;
    if (!sub) return false;
    if (u.email?.toLowerCase() === ADMIN_EMAIL || sub.planName?.toLowerCase().includes('propietario')) return false;
    const isManual = sub.isManual || sub.planName?.toLowerCase().includes('manual');
    if (isManual && !sub.includeInRevenue) return false;
    return true;
  });

  const isUsdTransaction = (sub: UserSubscription) => {
    const gateway = ((sub as any).gateway || (sub as any).paymentGateway || '').toLowerCase();
    const currency = ((sub as any).currency || '').toUpperCase();
    const planName = (sub.planName || '').toLowerCase();
    return gateway === 'paypal' || currency === 'USD' || planName.includes('paypal') || planName.includes('usd');
  };

  const copMonthlySubscribers = eligiblePayingSubscribers.filter(u => u.subscription?.tier === 'pro_monthly' && !isUsdTransaction(u.subscription!));
  const copAnnualSubscribers = eligiblePayingSubscribers.filter(u => u.subscription?.tier === 'pro_annual' && !isUsdTransaction(u.subscription!));

  const usdMonthlySubscribers = eligiblePayingSubscribers.filter(u => u.subscription?.tier === 'pro_monthly' && isUsdTransaction(u.subscription!));
  const usdAnnualSubscribers = eligiblePayingSubscribers.filter(u => u.subscription?.tier === 'pro_annual' && isUsdTransaction(u.subscription!));

  const trialUsers = usersList.filter((u) => {
    const sub = u.subscription;
    return (!sub || sub.tier === 'free') && u.trialStartDate;
  });

  const totalRevenueCop = (copMonthlySubscribers.length * 9900) + (copAnnualSubscribers.length * 69900);
  const totalRevenueUsd = (usdMonthlySubscribers.length * 2.99) + (usdAnnualSubscribers.length * 19.99);

  // Filtros reactivos en memoria (0 consultas a Firestore)
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'paying') {
      return u.subscription && u.subscription.tier !== 'free' && u.subscription.status === 'active';
    }
    if (filterType === 'trial') {
      return (!u.subscription || u.subscription.tier === 'free') && Boolean(u.trialStartDate);
    }
    if (filterType === 'free') {
      return (!u.subscription || u.subscription.tier === 'free') && !u.trialStartDate;
    }
    return true;
  });

  const handleManualActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setIsActivatingManual(true);
    setManualSuccessMsg(null);

    try {
      const emailLower = manualEmail.trim().toLowerCase();
      const targetUser = usersList.find(u => u.email.toLowerCase() === emailLower);

      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + manualDays);
      const validUntilStr = validUntilDate.toISOString().split('T')[0];

      const newSub: UserSubscription = {
        tier: manualPlan,
        status: 'active',
        planName: manualPlan === 'pro_annual' ? 'NutriPet Pro Anual (Activación Manual)' : 'NutriPet Pro Mensual (Activación Manual)',
        startDate: new Date().toISOString(),
        validUntil: validUntilStr,
        autoRenew: false,
        isManual: true,
        includeInRevenue: manualIncludeInRevenue,
      };

      if (targetUser) {
        const userRef = doc(db, 'users', targetUser.uid);
        await updateDoc(userRef, {
          subscription: newSub,
          updatedAt: new Date().toISOString()
        });
      } else {
        const customId = `manual_${emailLower.replace(/[^a-z0-9]/g, '_')}`;
        const userRef = doc(db, 'users', customId);
        await setDoc(userRef, {
          uid: customId,
          email: emailLower,
          displayName: 'Cliente Activado Manual',
          subscription: newSub,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      setManualSuccessMsg(`¡Suscripción Pro otorgada exitosamente a ${emailLower} hasta el ${validUntilStr}!`);
      setManualEmail('');
      setManualIncludeInRevenue(false);
      await fetchUsers(true);
      setTimeout(() => setManualSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error al activar usuario manual:', err);
      alert('Error activando usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsActivatingManual(false);
    }
  };

  const handleDeleteManualUser = async (targetUser: UserSummary) => {
    const sub = targetUser.subscription;
    const isManual = Boolean(sub?.isManual || sub?.planName?.toLowerCase().includes('manual') || targetUser.uid.startsWith('manual_'));

    if (!isManual) {
      alert('Restricción de Seguridad: Solo puedes eliminar usuarios cuya suscripción fue creada o activada manualmente.');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar permanentemente la activación manual de "${targetUser.email}"?`)) {
      return;
    }

    setDeletingUid(targetUser.uid);
    try {
      await deleteDoc(doc(db, 'users', targetUser.uid));
      await fetchUsers(true);
      alert(`El registro manual de ${targetUser.email} ha sido eliminado correctamente.`);
    } catch (err: any) {
      console.error('Error al eliminar usuario manual:', err);
      alert('Error al eliminar usuario: ' + (err.message || 'Error de conexión'));
    } finally {
      setDeletingUid(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md no-print animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#121915] rounded-[32px] p-5 sm:p-7 max-w-5xl w-full shadow-2xl border border-stone-200/90 dark:border-stone-800 space-y-6 max-h-[92vh] overflow-y-auto my-auto text-stone-800 dark:text-stone-100 transition-colors">
        
        {/* 1. CABECERA EJECUTIVA ESTILO COMMAND CENTER */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-stone-900 dark:text-stone-100 text-lg sm:text-xl tracking-tight">
                  Panel de Administrador
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px] font-black tracking-wide uppercase">
                  Propietario
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Panel Activo
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Monitoreo comercial, finanzas y control de usuarios
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={isLoading}
              title="Actualizar datos manualmente"
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer text-base font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. TARJETAS KPI DE RENDIMIENTO CON MICRO-SPARKLINES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* KPI 1: Usuarios Registrados */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100/60 dark:from-stone-850 dark:to-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">Total Usuarios</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-2xl sm:text-3xl font-black font-tabular text-stone-900 dark:text-stone-100">
                {usersList.length}
              </span>
              <MicroSparkline trend="up" color="#059669" />
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate">
              {usersList.filter(u => !u.uid.startsWith('manual_')).length} orgánicos · {usersList.filter(u => u.uid.startsWith('manual_')).length} manuales
            </div>
          </div>

          {/* KPI 2: Clientes Pagando Pro */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">Suscriptores Pro</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-2xl sm:text-3xl font-black font-tabular text-emerald-950 dark:text-emerald-100">
                {payingSubscribers.length}
              </span>
              <MicroSparkline trend="up" color="#10b981" />
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
              {monthlySubscribers.length} mensual(es) · {annualSubscribers.length} anual(es)
            </div>
          </div>

          {/* KPI 3: En Periodo de Prueba */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">En Prueba</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-2xl sm:text-3xl font-black font-tabular text-amber-950 dark:text-amber-100">
                {trialUsers.length}
              </span>
              <MicroSparkline trend="stable" color="#f59e0b" />
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">
              {usersList.length > 0 ? Math.round((trialUsers.length / usersList.length) * 100) : 0}% de la base activa
            </div>
          </div>

          {/* KPI 4: Ingresos Recurrentes Consolidados */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100/60 dark:from-stone-850 dark:to-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">Ingresos Totales</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-black font-tabular text-stone-900 dark:text-stone-100 leading-tight">
                ${totalRevenueCop.toLocaleString('es-CO')} <span className="text-[10px] font-bold text-stone-400">COP</span>
              </div>
              <div className="text-xs font-bold font-tabular text-emerald-700 dark:text-emerald-400">
                +${totalRevenueUsd.toFixed(2)} USD (PayPal)
              </div>
            </div>
          </div>

        </div>

        {/* 3. SELECTOR DE PESTAÑAS PRINCIPALES */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-850 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveAdminTab('users')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'users'
                  ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Usuarios Registrados ({usersList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'manual'
                  ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-500" />
              <span>Activar Manual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('feedback')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'feedback'
                  ? 'bg-white dark:bg-stone-750 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Opiniones ({feedbackList.length})</span>
            </button>
          </div>

          {activeAdminTab === 'users' && (
            <button
              type="button"
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95"
              title="Exportar base completa a archivo CSV compatible con Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
          )}
        </div>

        {/* 4. VISTA: TABLA Y GESTIÓN DE USUARIOS */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            {/* Buscador y Filtros reactivos */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por correo o nombre en tiempo real..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-stone-100 font-medium"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-stone-900 dark:bg-stone-700 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Todos ({usersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('paying')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterType === 'paying'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Pro ({payingSubscribers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('trial')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'trial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  Prueba ({trialUsers.length})
                </button>
              </div>
            </div>

            {/* Tabla Estilizada tipo Notion / Linear */}
            <div className="border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900 shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-850 text-stone-600 dark:text-stone-400 sticky top-0 font-bold border-b border-stone-200 dark:border-stone-750 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Usuario</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Vigencia</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          <span>Consultando base de usuarios...</span>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No se encontraron usuarios con ese criterio.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isProUser = u.subscription && u.subscription.tier !== 'free' && u.subscription.status === 'active';
                        const isTrial = !isProUser && Boolean(u.trialStartDate);
                        const isManualUser = Boolean(u.subscription?.isManual || u.subscription?.planName?.toLowerCase().includes('manual') || u.uid.startsWith('manual_'));

                        return (
                          <tr key={u.uid} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[200px]">{u.email}</div>
                              <div className="text-[10px] text-stone-400">{u.displayName || 'Usuario'}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {isProUser ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200/50">
                                  <Crown className="w-2.5 h-2.5 text-amber-500" />
                                  Activo (Paga)
                                </span>
                              ) : isTrial ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200/50">
                                  <Clock className="w-2.5 h-2.5" />
                                  En Prueba
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px]">
                                  Gratuito
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-medium text-stone-700 dark:text-stone-300">
                              {u.subscription?.planName || (isTrial ? 'Prueba Gratuita' : 'Plan Básico')}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-stone-600 dark:text-stone-400 text-[11px]">
                              {u.subscription?.validUntil || 'Indefinida'}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                              <button
                                type="button"
                                onClick={() => setSelectedUser(u)}
                                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                                title="Ver detalles completos"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              {isManualUser && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser(u)}
                                    className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                                    title="Modificar días de plan"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteManualUser(u)}
                                    disabled={deletingUid === u.uid}
                                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                                    title="Eliminar usuario manual"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. VISTA: ACTIVACIÓN MANUAL DE SUSCRIPCIÓN */}
        {activeAdminTab === 'manual' && (
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-800 space-y-4 animate-fade-in max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm">
                Activación Manual de Suscripción Pro
              </h4>
            </div>

            <form onSubmit={handleManualActivation} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase block mb-1">
                  Correo Electrónico del Tutor:
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-stone-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase block mb-1">
                    Plan a Otorgar:
                  </label>
                  <select
                    value={manualPlan}
                    onChange={(e) => {
                      const val = e.target.value as SubscriptionTier;
                      setManualPlan(val);
                      setManualDays(val === 'pro_annual' ? 420 : 60);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none dark:text-stone-100"
                  >
                    <option value="pro_monthly">Mensual (60 días cortesía)</option>
                    <option value="pro_annual">Anual (420 días cortesía)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase block mb-1">
                    Días Totales:
                  </label>
                  <input
                    type="number"
                    value={manualDays}
                    onChange={(e) => setManualDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={manualIncludeInRevenue}
                  onChange={(e) => setManualIncludeInRevenue(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                  Sumar este pago al contador de ingresos del panel (ej. pago recibido por transferencia directa/efectivo)
                </span>
              </label>

              {manualSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  {manualSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isActivatingManual}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isActivatingManual ? 'Activando...' : 'Activar Suscripción Pro Ahora'}
              </button>
            </form>
          </div>
        )}

        {/* 6. VISTA: OPINIONES Y FEEDBACK */}
        {activeAdminTab === 'feedback' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                Opiniones enviadas por usuarios en la plataforma ({feedbackList.length})
              </span>
              <button
                type="button"
                onClick={() => fetchFeedbacks(true)}
                disabled={loadingFeedback}
                className="px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingFeedback ? 'animate-spin' : ''}`} />
                <span>Refrescar</span>
              </button>
            </div>

            {loadingFeedback ? (
              <div className="py-12 text-center text-stone-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                <span>Cargando comentarios...</span>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="py-12 text-center text-stone-400 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800">
                No hay opiniones registradas aún.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {fb.userName || 'Usuario anónimo'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">{fb.userEmail || 'Sin email'}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(fb.id)}
                          disabled={deletingFeedbackId === fb.id}
                          className="p-1 rounded-md text-stone-400 hover:text-red-500 cursor-pointer transition-colors"
                          title="Eliminar este comentario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                      "{fb.comment}"
                    </p>

                    {fb.category && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[9.5px] font-bold">
                        {fb.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modales Secundarios de Usuario */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onEdit={() => {
              setEditingUser(selectedUser);
              setSelectedUser(null);
            }}
          />
        )}

        {editingUser && (
          <EditSubscriptionModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleEditSubscription}
          />
        )}

      </div>
    </div>
  );
};
