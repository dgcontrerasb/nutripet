import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  AlertTriangle, 
  Award, 
  FileText, 
  Stethoscope, 
  Bell, 
  Tag, 
  Sparkles, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Crown,
  Zap,
  Info,
  ShieldCheck,
  Palette,
  SlidersHorizontal,
  Sun,
  Moon,
  Clock,
  Utensils
} from 'lucide-react';
import { AppTab } from '../types';
import { NutriPetLogo } from './NutriPetLogo';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isProOrTrial: boolean;
  trialDaysRemaining: number;
  onOpenSubscriptionModal: () => void;
  onOpenBgModal: () => void;
  onOpenAdminModal?: () => void;
  petName: string;
  petType: 'dog' | 'cat';
  petPhotoUrl?: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface MenuItem {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isPro?: boolean;
}

interface MenuSection {
  title: string;
  badge?: string;
  icon: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'HERRAMIENTAS BÁSICAS',
    icon: '🥣',
    items: [
      { id: 'calculator', label: 'Porciones & Dieta', icon: Calculator },
      { id: 'foods', label: 'Semáforo Alimentos', icon: AlertTriangle },
      { id: 'routine', label: 'Horarios & Rutina', icon: Clock },
      { id: 'guides', label: 'Tips & Emergencias', icon: BookOpen },
      { id: 'breeds', label: 'Razas & Susceptibilidad', icon: Tag },
    ]
  },
  {
    title: 'FUNCIONES PRO 👑',
    icon: '✨',
    items: [
      { id: 'recipes', label: 'Dietas BARF & Recetas', icon: Utensils, isPro: true },
      { id: 'ai', label: 'Asistente IA (Groq)', icon: Sparkles, isPro: true },
      { id: 'sheet', label: 'Ficha & QR Emergencia', icon: FileText, isPro: true },
      { id: 'medical', label: 'Expediente & Peso', icon: Stethoscope, isPro: true },
      { id: 'reminders', label: 'Vacunas y Notificaciones', icon: Bell, isPro: true },
      { id: 'advisor', label: 'Marcas x País & Transición', icon: Award, isPro: true },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isProOrTrial,
  trialDaysRemaining,
  onOpenSubscriptionModal,
  onOpenBgModal,
  onOpenAdminModal,
  petName,
  petType,
  petPhotoUrl,
  darkMode = false,
  onToggleDarkMode
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nutripet_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('nutripet_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Bloqueo de scroll en el fondo mientras el menú móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileOpen]);

  // Cerrar cajón móvil al seleccionar pestaña
  const handleSelectTab = (tab: AppTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const getActiveTabTitle = () => {
    for (const sec of MENU_SECTIONS) {
      const match = sec.items.find(i => i.id === activeTab);
      if (match) return match.label;
    }
    return 'NutriPet';
  };

  const renderNavLinks = (onClickHandler: (tab: AppTab) => void, showText: boolean) => {
    return (
      <div className="space-y-4">
        {MENU_SECTIONS.map((sec) => (
          <div key={sec.title} className="space-y-1">
            {showText ? (
              <div className="px-3 flex items-center justify-between select-none">
                <span className={`text-[10px] font-black tracking-widest uppercase block ${
                  sec.title.includes('PRO') ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'
                }`}>
                  {sec.title}
                </span>
              </div>
            ) : (
              <div className="h-px bg-stone-100 my-2 mx-2" />
            )}
            
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onClickHandler(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all relative cursor-pointer active:scale-97 group ${
                      isActive
                        ? item.isPro
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                          : 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/80'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive 
                        ? item.isPro ? 'text-amber-200' : 'text-emerald-700 dark:text-emerald-400' 
                        : item.isPro ? 'text-amber-500/80' : 'text-stone-400'
                    }`} />
                    
                    {showText && (
                      <span className="leading-none flex-1 min-w-0 text-left">
                        {item.label}
                      </span>
                    )}

                    {/* Tooltip flotante si está colapsado */}
                    {!showText && (
                      <div className="absolute left-14 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all bg-stone-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md z-40 pointer-events-none select-none">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* 📱 ISLA FLOTANTE INFERIOR MODERNA (Acceso ergonómico directo sin tapar laterales) */}
      <nav 
        aria-label="Navegación rápida móvil"
        className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 no-print"
      >
        <div className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-full shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          
          {/* Accesos directos más usados */}
          {[
            { id: 'calculator', label: 'Porciones', icon: Calculator },
            { id: 'foods', label: 'Alimentos', icon: AlertTriangle },
            { id: 'sheet', label: 'Ficha', icon: FileText, isPro: true },
            { id: 'ai', label: 'IA', icon: Sparkles, isPro: true },
          ].map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id as AppTab)}
                title={item.label}
                aria-label={item.label}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 relative ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.isPro && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 ring-1 ring-white dark:ring-stone-900" />
                )}
              </button>
            );
          })}

          <div className="w-px h-5 bg-stone-200 dark:border-stone-800 mx-1" />

          {/* Botón para desplegar el cajón completo */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            title="Abrir menú completo"
            aria-label="Abrir menú completo"
            className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-200 hover:text-emerald-600 flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs"
          >
            <Menu className="w-4 h-4" />
          </button>

        </div>
      </nav>

      {/* 💻 MENÚ LATERAL DE ESCRITORIO (Fijo, colapsable) */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-stone-200 bg-white shadow-xs shrink-0 select-none no-print transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{ minHeight: 'calc(100vh - 54px)' }}
      >
        {/* Cabecera Sidebar */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-2 overflow-hidden h-16 shrink-0">
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <NutriPetLogo size="sm" />
            </motion.div>
          ) : (
            <div className="mx-auto">
              <span className="text-lg">🐾</span>
            </div>
          )}

          {/* Botón Colapsar Sidebar */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer shadow-2xs active:scale-95 transition-all z-25 hover:border-stone-400"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Mascota Actual Resumen */}
        <div className={`p-3 bg-stone-50 border-b border-stone-100 shrink-0 ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
              {petPhotoUrl ? (
                <img src={petPhotoUrl} alt={petName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">{petType === 'dog' ? '🐶' : '🐱'}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">Mascota Activa</span>
                <span className="text-xs font-black text-stone-800 leading-tight block truncate">{petName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {renderNavLinks(handleSelectTab, !isCollapsed)}
        </nav>

        {/* Panel de Modos e Intensidad al fondo si no está colapsado */}
        {!isCollapsed && (
          <div className="p-3 border-t border-stone-100 bg-stone-50/50 space-y-2.5 shrink-0">
            {/* Accesos rápidos a Fondo y Tema */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-200/50 dark:border-stone-800">
              <button
                type="button"
                onClick={onOpenBgModal}
                className="py-1.5 px-2 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800/90 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Cambiar fondo o subir tu foto"
              >
                <Palette className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Fondo</span>
              </button>
              {onToggleDarkMode && (
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="py-1.5 px-2 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800/90 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {darkMode ? <Sun className="w-3 h-3 text-amber-400 shrink-0" /> : <Moon className="w-3 h-3 text-stone-500 dark:text-stone-400 shrink-0" />}
                  <span className="truncate">{darkMode ? 'Claro' : 'Oscuro'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tarjeta Pro Promocional en el Sidebar */}
        <div className="p-3 border-t border-stone-100 shrink-0">
          {isCollapsed ? (
            <button
              onClick={onOpenSubscriptionModal}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-sm active:scale-95 cursor-pointer"
              title="Suscripción NutriPet Pro"
            >
              <Crown className="w-5 h-5 text-amber-200" />
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white space-y-2 shadow-xs border border-amber-400/40 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 w-14 h-14 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-1.5 font-heading">
                <Crown className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-[11px] font-black uppercase tracking-wider">NutriPet Pro</span>
              </div>
              <p className="text-[10px] text-amber-100/90 leading-normal font-normal">
                {isProOrTrial 
                  ? `Suscripción activa • ${trialDaysRemaining} días` 
                  : 'Sube fotos ilimitadas, descarga en PDF, alertas y chat veterinario IA.'}
              </p>
              {!isProOrTrial && (
                <button
                  type="button"
                  onClick={onOpenSubscriptionModal}
                  className="w-full py-1.5 px-3 bg-white hover:bg-amber-50 text-amber-950 font-bold text-[10px] rounded-lg cursor-pointer transition-all active:scale-97 text-center shadow-2xs"
                >
                  🔒 Activar NutriPet Pro
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 📱 CAJÓN MÓVIL DESPLEGABLE CON COBERTURA TOTAL Y MÁXIMO Z-INDEX */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex no-print">
            {/* Telón de fondo con desenfoque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer z-0"
            />

            {/* Panel lateral deslizante independiente */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-10 border-r border-stone-200 dark:border-stone-800 overflow-hidden"
            >
              {/* Cabecera limpia del cajón */}
              <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 h-16 shrink-0 bg-white dark:bg-stone-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                    {petPhotoUrl ? (
                      <img src={petPhotoUrl} alt={petName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base">{petType === 'dog' ? '🐶' : '🐱'}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-black text-stone-900 dark:text-stone-100 block leading-tight truncate">{petName}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase tracking-wider">Menú NutriPet</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Cerrar menú lateral"
                  className="w-9 h-9 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enlaces de Navegación */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
                {renderNavLinks(handleSelectTab, true)}
              </nav>

              {/* Pie Compacto del Cajón Móvil */}
              <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/90 space-y-2 shrink-0">
                {/* Fondo y Modo en una sola fila compacta de 2 columnas */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenBgModal();
                    }}
                    className="py-2 px-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Fondo</span>
                  </button>

                  {onToggleDarkMode && (
                    <button
                      type="button"
                      onClick={onToggleDarkMode}
                      className="py-2 px-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-stone-600 shrink-0" />}
                      <span className="truncate">{darkMode ? 'Claro' : 'Oscuro'}</span>
                    </button>
                  )}
                </div>

                {/* Acceso exclusivo Admin en móvil */}
                {onOpenAdminModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenAdminModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <Crown className="w-4 h-4 text-amber-200" />
                    <span>👑 Panel Administrador</span>
                  </button>
                )}

                {/* Estatus Pro en formato píldora delgada */}
                <div 
                  onClick={() => {
                    if (!isProOrTrial) {
                      setIsMobileOpen(false);
                      onOpenSubscriptionModal();
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl flex items-center justify-between gap-2 shadow-xs transition-all ${
                    isProOrTrial 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                      : 'bg-emerald-600 text-white cursor-pointer active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Crown className="w-4 h-4 text-amber-200 shrink-0" />
                    <span className="text-xs font-black truncate">
                      {isProOrTrial ? 'NutriPet Pro' : 'Activar NutriPet Pro'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                    {isProOrTrial ? `${trialDaysRemaining}d activos` : 'Ver planes'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
