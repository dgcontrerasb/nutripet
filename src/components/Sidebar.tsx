import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  AlertTriangle, 
  Award, 
  FileText, 
  Stethoscope, 
  Bell, 
  Tag, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Palette,
  Clock,
  Utensils,
  Star
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
  onOpenFeedbackModal?: () => void;
  petName: string;
  petType: 'dog' | 'cat';
  petPhotoUrl?: string;
  hasActivePet?: boolean;
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
  onOpenBgModal,
  onOpenFeedbackModal,
  petName,
  petType,
  petPhotoUrl,
  hasActivePet = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('nutripet_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('nutripet_sidebar_collapsed', String(isCollapsed));
    window.dispatchEvent(new Event('sidebar_toggle'));
  }, [isCollapsed]);

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

  const handleSelectTab = (tab: AppTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const renderNavLinks = (onClickHandler: (tab: AppTab) => void, showText: boolean) => {
    return (
      <div className="space-y-4">
        {MENU_SECTIONS.map((sec) => {
          const isProSection = sec.title.includes('PRO');
          return (
          <div
            key={sec.title}
            className={`space-y-1 ${isProSection && showText ? 'border-t border-stone-200/80 dark:border-stone-800 pt-2.5 mt-1' : ''}`}
          >
            {showText ? (
              isProSection ? (
                <div className="mx-1 px-2.5 py-1 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between select-none">
                  <span className="text-[10px] font-black tracking-widest uppercase block text-amber-700 dark:text-amber-300">
                    {sec.title}
                  </span>
                </div>
              ) : (
                <div className="px-3 flex items-center justify-between select-none">
                  <span className="text-[10px] font-black tracking-widest uppercase block text-stone-400">
                    {sec.title}
                  </span>
                </div>
              )
            ) : (
              <div className="h-px bg-stone-100 dark:bg-stone-800 my-2 mx-2" />
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
                          ? 'bg-amber-50/90 text-amber-950 border-l-4 border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                          : 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/80'
                    } ${!showText ? 'justify-center px-2' : ''}`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive 
                        ? item.isPro ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400' 
                        : item.isPro ? 'text-amber-500/80' : 'text-stone-400'
                    }`} />
                    
                    {showText && (
                      <span className="leading-none flex-1 min-w-0 text-left">
                        {item.label}
                      </span>
                    )}

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
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 📱 Barra flotante inferior de acceso rápido: visible únicamente en móvil */}
      <nav 
        aria-label="Navegación rápida móvil"
        className={`lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 no-print transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-28 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-full shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          {[
            { id: 'calculator', label: 'Porciones', icon: Calculator },
            { id: 'foods', label: 'Alimentos', icon: AlertTriangle },
            { id: 'sheet', label: 'Ficha', icon: FileText, isPro: true },
            { id: 'medical', label: 'Salud', icon: Stethoscope, isPro: true },
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
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 relative ${
                  isActive 
                    ? item.isPro
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.isPro && !isActive && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 ring-1 ring-white dark:ring-stone-900" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            title="Abrir menú completo"
            aria-label="Abrir menú completo"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-stone-700 dark:text-stone-200 hover:text-emerald-600 flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* 💻 Menú lateral de escritorio: Sticky y respetando el contenedor sin tapar el footer */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xs shrink-0 select-none no-print transition-all duration-300 sticky top-[61px] z-30 overflow-x-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{
          height: 'calc(100vh - 61px)',
          maxHeight: 'calc(100vh - 61px)',
        }}
      >
        {/* Cabecera con Logo y Botón de Recoger/Desplegar sin solapar */}
        <div className="p-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between h-16 shrink-0 relative">
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pr-6"
            >
              <NutriPetLogo size="sm" />
            </motion.div>
          ) : (
            <div className="w-full flex items-center justify-between px-1">
              <span className="text-base select-none">🐾</span>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shadow-md active:scale-90 transition-all hover:border-emerald-500 shrink-0"
                title="Expandir menú"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Botón Colapsar Sidebar cuando está abierto */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="absolute right-2 top-4.5 w-7 h-7 rounded-full bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shadow-md active:scale-90 transition-all z-20 hover:border-emerald-500"
              title="Contraer menú"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mascota Activa o Estado Sin Mascota */}
        <div className={`p-3 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-100 dark:border-stone-800 shrink-0 ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {hasActivePet && petPhotoUrl ? (
                <img src={petPhotoUrl} alt={petName} className="w-full h-full object-cover" />
              ) : hasActivePet ? (
                <span className="text-sm">{petType === 'dog' ? '🐶' : '🐱'}</span>
              ) : (
                <span className="text-xs text-stone-400">🐾</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">
                  {hasActivePet ? 'Mascota Activa' : 'Sin Mascota'}
                </span>
                <span className={`text-xs font-black leading-tight block truncate ${hasActivePet ? 'text-stone-800 dark:text-stone-100' : 'text-amber-600 dark:text-amber-400 font-bold'}`}>
                  {hasActivePet ? petName : 'Vista de ejemplo'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enlaces de Navegación con Scroll Suave */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin">
          {renderNavLinks(handleSelectTab, !isCollapsed)}
        </nav>

        {/* Panel Inferior Compacto: únicamente acciones propias del sidebar (Opinión y Fondo) */}
        <div className="p-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 shrink-0 select-none">
          {!isCollapsed ? (
            <div className={`grid gap-1.5 ${onOpenFeedbackModal ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {onOpenFeedbackModal && (
                <button
                  type="button"
                  onClick={onOpenFeedbackModal}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-750 text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Calificar y Opinión"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="truncate">Opinión</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenBgModal}
                className="py-1.5 px-2 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Cambiar fondo o subir tu foto"
              >
                <Palette className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Fondo</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              {onOpenFeedbackModal && (
                <button
                  type="button"
                  onClick={onOpenFeedbackModal}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 flex items-center justify-center mx-auto border border-stone-200 dark:border-stone-750 cursor-pointer shadow-2xs transition-all active:scale-95"
                  title="Calificar y Opinión"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenBgModal}
                className="w-8 h-8 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 flex items-center justify-center mx-auto cursor-pointer shadow-2xs transition-all active:scale-95"
                title="Cambiar fondo o subir tu foto"
              >
                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 📱 Cajón modal móvil independiente */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[120] lg:hidden flex no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer z-0"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col z-[130] border-r border-stone-200 dark:border-stone-800 overflow-hidden"
            >
              <div className="px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 min-h-16 shrink-0 bg-white dark:bg-stone-900">
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

              <nav className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
                {renderNavLinks(handleSelectTab, true)}
              </nav>

              <div className="px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/90 shrink-0">
                <div className={`grid gap-2 ${onOpenFeedbackModal ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {onOpenFeedbackModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileOpen(false);
                        onOpenFeedbackModal();
                      }}
                      className="py-2 px-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-750 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="truncate">Opinión</span>
                    </button>
                  )}

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
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};