import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePets } from '../context/PetContext';
import { Plus, X, LogIn, LogOut, Check, ShieldCheck, Sparkles, Crown, ChevronDown, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { PetProfile, PetType } from '../types';
import { POPULAR_BREEDS } from '../data';

interface PetHeaderBarProps {
  onOpenSubscriptionModal?: () => void;
  onOpenAdminModal?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const PetHeaderBar: React.FC<PetHeaderBarProps> = ({ 
  onOpenSubscriptionModal, 
  onOpenAdminModal,
  darkMode = false,
  onToggleDarkMode
}) => {
  const { 
    user, 
    pets, 
    activePetId, 
    subscription,
    trialDaysRemaining,
    setActivePetId, 
    savePet, 
    deletePet, 
    loginWithGoogle, 
    logout 
  } = usePets();

  const isPro = subscription.tier !== 'free' && subscription.status === 'active';
  const isAdminUser = user?.email?.toLowerCase() === 'dgcontrerasb@gmail.com';
  const hasReachedPetLimit = pets.length >= 8;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [newPetName, setNewPetName] = useState<string>('');
  const [newPetType, setNewPetType] = useState<PetType>('dog');
  const [newPetBreed, setNewPetBreed] = useState<string>('');
  const [newPetWeight, setNewPetWeight] = useState<number>(15);
  const [isCreatingPet, setIsCreatingPet] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [petToDelete, setPetToDelete] = useState<PetProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Bloquear scroll del body cuando hay modales abiertos
  useEffect(() => {
    if (showAddModal || petToDelete || showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, petToDelete, showAuthModal]);

  const activePet = pets.find(p => p.id === activePetId) || (pets.length > 0 ? pets[0] : null);
  const activeBreedName = activePet 
    ? POPULAR_BREEDS.find(b => b.id === activePet.breedId)?.name || (activePet.type === 'dog' ? 'Perro' : 'Gato')
    : '';

  const filteredBreeds = useMemo(() => 
    POPULAR_BREEDS.filter(b => b.type === newPetType),
    [newPetType]
  );

  const handleWeightChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 200) {
      setNewPetWeight(num);
    }
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    if (pets.length <= 1) {
      setDeleteError('No puedes eliminar la única mascota registrada en el sistema.');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deletePet(petToDelete.id);
      setPetToDelete(null);
    } catch (err: any) {
      console.error('Error al eliminar mascota:', err);
      setDeleteError('Hubo un error al intentar eliminar la mascota. Por favor intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPetName.trim()) {
      setCreateError('El nombre de la mascota es obligatorio.');
      return;
    }

    if (newPetWeight <= 0 || newPetWeight > 200) {
      setCreateError('El peso debe estar entre 0.1 y 200 kg.');
      return;
    }

    setIsCreatingPet(true);
    setCreateError(null);

    try {
      const defaultBreed = POPULAR_BREEDS.find(b => b.type === newPetType);
      const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'pet_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      const newProfile: PetProfile = {
        id: newId,
        name: newPetName.trim(),
        type: newPetType,
        breedId: newPetBreed || (defaultBreed ? defaultBreed.id : ''),
        weightKg: newPetWeight || (newPetType === 'dog' ? 20 : 4.5),
        stage: 'adult',
        ageMonths: 24,
        neutered: true,
        activity: 'moderate',
        condition: 'ideal',
        diet: 'kibble',
        kibbleKcalPer100g: 360,
        createdAt: new Date().toISOString()
      };

      await savePet(newProfile);
      setActivePetId(newId);
      setShowAddModal(false);
      setIsDropdownOpen(false);
      setNewPetName('');
      setNewPetWeight(newPetType === 'dog' ? 20 : 4.5);
    } catch (err: any) {
      console.error('Error al crear mascota:', err);
      setCreateError('Hubo un error al crear la mascota. Por favor verifica tu conexión y intenta de nuevo.');
    } finally {
      setIsCreatingPet(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-1.5 relative">
          
          {/* Selector Desplegable Inteligente de Mascota Activa */}
          <div className="relative shrink-0 z-20" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(prev => !prev);
              }}
              className={`flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-2xs group active:scale-95 ${
                isDropdownOpen
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700/80'
              }`}
              aria-expanded={isDropdownOpen}
              title="Cambiar o gestionar mascota activa"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                  {activePet?.photoUrl ? (
                    <img src={activePet.photoUrl} alt={activePet.name} className="w-full h-full object-cover" />
                  ) : activePet ? (
                    <span className="text-sm">{activePet.type === 'dog' ? '🐶' : '🐱'}</span>
                  ) : (
                    <span className="text-xs text-stone-400">🐾</span>
                  )}
                </div>
                {activePet && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
                )}
              </div>

              <div className="text-left flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 dark:text-stone-100 truncate max-w-[110px] sm:max-w-[150px]">
                    {activePet?.name || 'Sin mascotas'}
                  </span>
                  {pets.length > 1 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-[10px] font-bold">
                      {pets.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 hidden xs:inline truncate max-w-[130px] sm:max-w-[170px]">
                  {activePet ? `${activePet.type === 'dog' ? 'Perro' : 'Gato'} · ${activePet.weightKg} kg` : 'Registra una mascota'}
                </span>
              </div>

              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : 'group-hover:text-stone-600'}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 p-2 space-y-2 animate-fade-in ring-1 ring-black/5 dark:ring-white/10">
                <div className="px-3 pt-2 pb-1.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Tus Mascotas ({pets.length})
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Cambiar perfil
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {pets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-500 dark:text-stone-400">
                      Sin mascotas registradas
                    </div>
                  ) : (
                    pets.map(pet => {
                      const isActive = pet.id === activePetId;
                      const breed = POPULAR_BREEDS.find(b => b.id === pet.breedId)?.name || (pet.type === 'dog' ? 'Perro' : 'Gato');
                      return (
                        <div
                          key={pet.id}
                          className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all ${
                            isActive
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 shadow-2xs'
                              : 'hover:bg-stone-100/80 dark:hover:bg-stone-800 border border-transparent'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActivePetId(pet.id);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                          >
                            <div className="w-9 h-9 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                              {pet.photoUrl ? (
                                <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-base">{pet.type === 'dog' ? '🐶' : '🐱'}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold block truncate ${isActive ? 'text-emerald-950 dark:text-emerald-200 font-black' : 'text-stone-800 dark:text-stone-200'}`}>
                                  {pet.name}
                                </span>
                                {isActive && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded-full shrink-0">
                                    <Check className="w-2.5 h-2.5" /> Activa
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                                {breed} · {pet.weightKg} kg
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteError(null);
                              setPetToDelete(pet);
                            }}
                            disabled={pets.length <= 1}
                            title={pets.length <= 1 ? 'No puedes eliminar la única mascota registrada' : `Eliminar perfil de ${pet.name}`}
                            className={`p-1.5 rounded-lg transition-all ml-1 shrink-0 ${
                              pets.length <= 1
                                ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed opacity-40'
                                : 'text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer active:scale-95'
                            }`}
                            aria-label={`Eliminar perfil de ${pet.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    disabled={hasReachedPetLimit}
                    onClick={() => {
                      if (hasReachedPetLimit) return;
                      setIsDropdownOpen(false);
                      if (!isPro && pets.length >= 1) {
                        if (onOpenSubscriptionModal) onOpenSubscriptionModal();
                      } else {
                        setShowAddModal(true);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs ${
                      hasReachedPetLimit
                        ? 'border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                        : 'border-dashed border-emerald-300 dark:border-emerald-700/70 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 cursor-pointer active:scale-98'
                    }`}
                    title={hasReachedPetLimit ? 'Límite máximo alcanzado (8/8 mascotas)' : 'Registrar nueva mascota'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {hasReachedPetLimit 
                        ? 'Límite alcanzado (8/8 mascotas)' 
                        : `Agregar Nueva Mascota (${pets.length}/8)${!isPro && pets.length >= 1 ? ' 👑' : ''}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Estado de Suscripción, Sincronización y Cuenta Google */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  (isPro || trialDaysRemaining > 0)
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-2xs hover:brightness-105'
                    : 'bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:brightness-110 text-white border-amber-400 shadow-xs ring-2 ring-amber-300/40 animate-pulse'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span className="hidden sm:inline">
                  {isPro && trialDaysRemaining > 30
                    ? 'NutriPet Pro Activo'
                    : trialDaysRemaining > 0
                    ? `🎁 Prueba Full (${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'día' : 'días'} restantes)`
                    : '🔒 Prueba Expirada — Activar Pro'}
                </span>
                <span className="sm:hidden">
                  {trialDaysRemaining > 0 ? `${trialDaysRemaining}d` : 'Pro'}
                </span>
              </button>
            )}

            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center text-xs transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-1 bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 p-1 sm:px-2 sm:py-1 rounded-2xl shadow-2xs shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-emerald-200 shrink-0 ring-1 ring-emerald-400">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Google Account'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.email || 'G').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                title="Inicia sesión con tu cuenta de Google para respaldar tus mascotas"
                className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-emerald-500 text-stone-800 dark:text-stone-100 text-xs font-black shadow-sm transition-all cursor-pointer ring-2 ring-emerald-400/30 hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden sm:inline">Iniciar Sesión con Google</span>
                <span className="sm:hidden font-bold">Ingresar</span>
              </button>
            )}

            {/* Botón Admin trasladado al menú deslizable para evitar sobrecarga en la barra */}
          </div>

        </div>
      </div>

      {/* Modal para agregar mascota */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowAddModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowAddModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            style={{
              maxHeight: '85vh',
              overflowY: 'auto',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 id="modal-title" className="font-heading font-extrabold text-base text-stone-900">
                Registrar Nueva Mascota
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleAddPet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Escribe el nombre de tu mascota"
                  value={newPetName}
                  onChange={e => setNewPetName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Especie</label>
                  <select
                    value={newPetType}
                    onChange={e => {
                      const t = e.target.value as PetType;
                      setNewPetType(t);
                      setNewPetWeight(t === 'dog' ? 20 : 4.5);
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="dog">Perro 🐶</option>
                    <option value="cat">Gato 🐱</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peso aprox (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="200"
                    required
                    value={newPetWeight}
                    onChange={e => handleWeightChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Raza</label>
                <select
                  value={newPetBreed}
                  onChange={e => setNewPetBreed(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Mestizo / Criollo --</option>
                  {filteredBreeds.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPet}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreatingPet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    'Crear Mascota'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación Segura */}
      {petToDelete && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setPetToDelete(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPetToDelete(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div 
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            style={{
              maxHeight: '85vh',
              overflowY: 'auto',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-lg font-black text-stone-900 dark:text-stone-100">
                  ¿Eliminar a {petToDelete.name}?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Advertencia sobre el historial</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Al eliminar el perfil de <strong>{petToDelete.name}</strong>, se eliminarán sus expedientes clínicos, carnet de vacunación, registros de peso y porciones calculadas asociadas.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-bold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setPetToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar mascota'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bienvenida y Beneficios al Iniciar Sesión */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowAuthModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <h3 className="font-heading font-black text-base text-stone-900 dark:text-stone-100">
                  NutriPet Pro
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Guarda el perfil de tus mascotas
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Inicia sesión para sincronizar historiales clínicos, cálculos calóricos y fichas de salud en la nube.
              </p>
            </div>

            <div className="space-y-2.5 bg-stone-50 dark:bg-stone-850 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-750 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
                <span>☁️</span> <span>Sincronización automática multi-dispositivo</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
                <span>📋</span> <span>Historial de vacunas, peso y recetas seguro</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
                <span>🎁</span> <span>Acceso a funciones NutriPet Pro</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setShowAuthModal(false);
                await loginWithGoogle();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border-2 border-emerald-500 text-stone-900 dark:text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
