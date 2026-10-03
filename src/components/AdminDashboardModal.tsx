import React, { useState, useEffect } from 'react';
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
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  CreditCard,
  Trash2,
  Edit2,
  Download,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  category: string;
  comment: string;
  device?: string;
  createdAt?: any;
}

interface UserDetailsModalProps {
  user: UserSummary;
  onClose: () => void;
  onEdit: () => void;
}

// Modal de Detalles del Usuario
const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onEdit }) => {
  const isProUser = user.subscription && user.subscription.tier !== 'free' && user.subscription.status === 'active';
  const isTrial = !isProUser && Boolean(user.trialStartDate);
  const isManualUser = Boolean(user.subscription?.isManual || user.subscription?.planName?.toLowerCase().includes('manual') || user.uid.startsWith('manual_'));

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.email} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <h3 className="font-heading font-black text-lg">{user.displayName || 'Usuario'}</h3>
              <p className="text-xs text-white/90">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Estado</span>
              <span className={`text-sm font-black ${isProUser ? 'text-emerald-900' : isTrial ? 'text-amber-900' : 'text-stone-700'}`}>
                {isProUser ? 'Activo (Pro)' : isTrial ? 'En Prueba' : 'Gratis'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-600 uppercase block">Tipo de Cuenta</span>
              <span className="text-sm font-black text-stone-900">
                {isManualUser ? 'Manual' : 'Orgánica'}
              </span>
            </div>
          </div>

          {/* Plan */}
          {user.subscription && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black uppercase">Plan Actual</span>
              </div>
              <div className="text-sm font-bold text-stone-900">{user.subscription.planName}</div>
              <div className="text-xs text-stone-600">
                Vigencia: <strong className="text-stone-800">{user.subscription.validUntil || 'Indefinida'}</strong>
              </div>
              {user.subscription.autoRenew && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Renovación automática activada</span>
                </div>
              )}
            </div>
          )}

          {/* Fechas */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50">
              <span className="text-stone-600 font-medium">Fecha de Registro</span>
              <span className="font-mono text-stone-800 font-bold">
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {user.trialStartDate && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50">
                <span className="text-stone-600 font-medium">Inicio de Prueba</span>
                <span className="font-mono text-stone-800 font-bold">
                  {new Date(user.trialStartDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* UID */}
          <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">User ID</span>
            <code className="text-xs font-mono text-stone-700 break-all">{user.uid}</code>
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
              className="py-2.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer transition-all"
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
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-stone-900">Editar Suscripción</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-600 uppercase block mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => {
                const val = e.target.value as SubscriptionTier;
                setPlan(val);
                setDays(val === 'pro_annual' ? 420 : 60);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
            >
              <option value="pro_monthly">Mensual (60 días)</option>
              <option value="pro_annual">Anual (420 días / 14 meses)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 uppercase block mb-1">Días de Suscripción</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
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
            className="py-2.5 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
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

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'feedback'>('users');
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'paying' | 'trial' | 'free'>('all');

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);

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
          rawUsers.push({
            uid: docSnap.id,
            email: docEmail,
            displayName: data.displayName || 'Cliente Activado Manual',
            photoURL: data.photoURL,
            trialStartDate: data.trialStartDate,
            subscription: data.subscription,
            updatedAt: data.updatedAt,
          });
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

          if (!chosenUid.startsWith('manual_') && chosenSub && chosenSub.tier !== 'free') {
            try {
              await setDoc(doc(db, 'users', chosenUid), {
                subscription: chosenSub,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (e) {
              console.error('Error auto-sincronizando suscripción:', e);
            }
          }
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

  const fetchFeedbacks = async () => {
    setLoadingFeedback(true);
    try {
      const snap = await getDocs(collection(db, 'feedbacks'));
      const items: FeedbackItem[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as FeedbackItem);
      });
      items.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setFeedbackList(items);
    } catch (e) {
      console.error('Error cargando feedbacks:', e);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (isOpen && user && isEmailAdmin) {
      if (activeAdminTab === 'users') {
        fetchUsers(false);
      } else {
        fetchFeedbacks();
      }
    }
  }, [isOpen, user, isEmailAdmin, activeAdminTab]);

  if (!isOpen) return null;

  if (!isEmailAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-black text-stone-900 text-lg">Acceso Restringido</h3>
          <p className="text-xs text-stone-600">
            Solo <strong>{ADMIN_EMAIL}</strong> tiene acceso a este panel.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

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

  const totalUsers = usersList.length;
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
      alert('Restricción de Seguridad: Solo puedes eliminar usuarios cuya suscripción fue creada o activada manualmente por el administrador.');
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
      alert('Error al eliminar usuario: ' + (err.message || 'Error de conexión con Firebase'));
    } finally {
      setDeletingUid(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-5xl w-full shadow-2xl border border-stone-200 space-y-6 max-h-[92vh] overflow-y-auto my-auto text-stone-800">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-stone-900 text-lg sm:text-xl">
                  Panel de Administrador
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                  Solo Propietario
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Gestión de suscriptores, finanzas y retroalimentación de NutriPet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminTab === 'users'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Suscripciones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeAdminTab === 'feedback'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Opiniones & Feedback</span>
            {feedbackList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-stone-900 text-[10px] font-black">
                {feedbackList.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeAdminTab === 'users' ? (
          <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Pagando (Pro)</span>
                  <Crown className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-heading">
                  {payingSubscribers.length}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1 font-medium">
                  {monthlySubscribers.length} mensual(es) • {annualSubscribers.length} anual(es)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-amber-800 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">En Prueba</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 font-heading">
                  {trialUsers.length}
                </div>
                <div className="text-[10px] text-amber-700 mt-1 font-medium">
                  Potenciales compradores
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between text-stone-600 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Ingresos COP</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                  ${totalRevenueCop.toLocaleString('es-CO')}
                </div>
                <div className="text-[10px] text-stone-500 mt-1 font-medium">
                  Wompi / Nequi / PSE
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between text-stone-600 mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Ingresos USD</span>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                  ${totalRevenueUsd.toFixed(2)}
                </div>
                <div className="text-[10px] text-stone-500 mt-1 font-medium">
                  PayPal / Tarjeta Int.
                </div>
              </div>
            </div>

            {/* Barra de Búsqueda y Acciones */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar usuario por correo o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  title="Exportar lista a CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Todos ({usersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('paying')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    filterType === 'paying'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Pagando ({payingSubscribers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('trial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'trial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  Prueba ({trialUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => fetchUsers(true)}
                  disabled={isLoading}
                  title="Refrescar lista"
                  className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{loadError}</span>
                </div>
                {!user && (
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Iniciar sesión con Google</span>
                  </button>
                )}
              </div>
            )}

            {/* Tabla de Usuarios */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-stone-100 text-stone-600 sticky top-0 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Usuario</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Vigencia</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                          <span>Cargando suscriptores de Firebase...</span>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No se encontraron usuarios en esta categoría.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isProUser = u.subscription && u.subscription.tier !== 'free' && u.subscription.status === 'active';
                        const isTrial = !isProUser && Boolean(u.trialStartDate);
                        const isManualUser = Boolean(u.subscription?.isManual || u.subscription?.planName?.toLowerCase().includes('manual') || u.uid.startsWith('manual_'));

                        return (
                          <tr key={u.uid} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-stone-900 truncate max-w-[200px]">{u.email}</div>
                              <div className="text-[10px] text-stone-400">{u.displayName || 'Usuario'}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {isProUser ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                  <Crown className="w-2.5 h-2.5 text-amber-500" />
                                  Activo (Paga)
                                </span>
                              ) : isTrial ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  <Clock className="w-2.5 h-2.5" />
                                  En Prueba
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px]">
                                  Gratuito
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-medium text-stone-700">
                              {u.subscription?.planName || (isTrial ? 'Prueba Gratuita' : 'Plan Básico')}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-stone-500">
                              {u.subscription?.validUntil ? (
                                <span className="font-mono text-[11px] text-stone-800 font-bold">{u.subscription.validUntil}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(u)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer transition-all"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                
                                {isManualUser && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setEditingUser(u)}
                                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 cursor-pointer transition-all"
                                      title="Editar plan"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteManualUser(u)}
                                      disabled={deletingUid === u.uid}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer transition-all disabled:opacity-50"
                                      title="Eliminar"
                                    >
                                      {deletingUid === u.uid ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activación Manual */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-heading font-extrabold text-stone-900 text-xs sm:text-sm">
                    Activar Suscripción Pro Manualmente
                  </h4>
                </div>
                <span className="text-[10px] text-stone-400">
                  Para clientes que te pagan por transferencia directa
                </span>
              </div>

              {manualSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{manualSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleManualActivation} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <input
                  type="email"
                  placeholder="Correo del cliente (ej: cliente@gmail.com)"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                  className="sm:col-span-2 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                <select
                  value={manualPlan}
                  onChange={(e) => {
                    const val = e.target.value as SubscriptionTier;
                    setManualPlan(val);
                    setManualDays(val === 'pro_annual' ? 420 : 60);
                  }}
                  className="px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="pro_monthly">Mensual 2x1 (60 días)</option>
                  <option value="pro_annual">Anual (14 meses / 420 días)</option>
                </select>

                <button
                  type="submit"
                  disabled={isActivatingManual}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isActivatingManual ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Activar Pro</span>
                </button>

                <div className="flex items-start gap-2.5 px-1 py-1.5 text-[11px] text-stone-600 font-bold select-none col-span-full">
                  <input
                    type="checkbox"
                    id="includeInRevenue"
                    checked={manualIncludeInRevenue}
                    onChange={(e) => setManualIncludeInRevenue(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-sm border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="includeInRevenue" className="cursor-pointer leading-normal flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span>¿Sumar este pago manual a las métricas de ingresos del panel?</span>
                    <span className="text-[10px] font-medium text-stone-400 font-sans">(Marca solo si el cliente ya te pagó el dinero real)</span>
                  </label>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Vista de Opiniones & Feedback */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-extrabold text-stone-900 text-sm">
                  Opiniones y Calificaciones de Usuarios
                </h4>
                <p className="text-xs text-stone-500">
                  Mensajes enviados directamente desde la opción "Calificar y Opinión"
                </p>
              </div>
              <button
                type="button"
                onClick={fetchFeedbacks}
                disabled={loadingFeedback}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedback ? 'animate-spin' : ''}`} />
                <span>Actualizar Opiniones</span>
              </button>
            </div>

            {loadingFeedback ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                Consultando comentarios en Firestore...
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs border border-stone-200 rounded-2xl bg-stone-50">
                Aún no has recibido ningún comentario de tus usuarios.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {feedbackList.map((item) => {
                  let dateStr = 'Fecha desconocida';
                  if (item.createdAt?.toDate) {
                    dateStr = item.createdAt.toDate().toLocaleString('es-CO');
                  } else if (item.createdAt) {
                    dateStr = new Date(item.createdAt).toLocaleString('es-CO');
                  }

                  return (
                    <div key={item.id} className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">{item.userName || 'Usuario Anónimo'}</span>
                            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-mono">
                              {dateStr}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block">{item.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                        "{item.comment}"
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold uppercase">
                          {item.category === 'bug' ? '🐛 Error / Bug' : item.category === 'feature' ? '💡 Sugerencia' : item.category === 'recipe' ? '🥩 Porciones' : '⭐ Opinión General'}
                        </span>
                        <span>Dispositivo: <strong>{item.device === 'pc' ? '💻 Computador' : '📱 Celular'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span>🔒 Acceso exclusivo para {ADMIN_EMAIL}</span>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-bold cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>

      </div>

      {/* Modales de Detalles y Edición */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setSelectedUser(null);
            setEditingUser(selectedUser);
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
  );
};