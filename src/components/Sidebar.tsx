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
  Crown,
  Settings,
  Palette,
  Sun,
  Moon,
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
  isProOrTrial,
  trialDaysRemaining,
  onOpenSubscriptionModal,
  onOpenBgModal,
  onOpenAdminModal,
  onOpenFeedbackModal,
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
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                          : 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/80'
                    } ${!showText ? 'justify-center px-2' : ''}`}
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
      {/* 📱 Barra flotante inferior de acceso rápido: visible únicamente en móvil */}
      <nav 
        aria-label="Navegación rápida móvil"
        className={`lg:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 no-print transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-28 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-full shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
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
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
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

          <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-0.5" />

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
        className={`hidden lg:flex flex-col border-r border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-xs shrink-0 select-none no-print transition-all duration-300 sticky top-[84px] sm:top-[90px] z-30 overflow-x-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{
          height: 'calc(100vh - 90px)',
          maxHeight: 'calc(100vh - 90px)',
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

        {/* Mascota Activa */}
        <div className={`p-3 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-100 dark:border-stone-800 shrink-0 ${isCollapsed ? 'text-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {petPhotoUrl ? (
                <img src={petPhotoUrl} alt={petName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">{petType === 'dog' ? '🐶' : '🐱'}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wide">Mascota Activa</span>
                <span className="text-xs font-black text-stone-800 dark:text-stone-100 leading-tight block truncate">{petName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enlaces de Navegación con Scroll Suave */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 scrollbar-thin">
          {renderNavLinks(handleSelectTab, !isCollapsed)}
        </nav>

        {/* Panel Inferior Optimizado: Calificación, Fondo, Tema, Redes y Pro */}
        <div className="p-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/50 space-y-1.5 shrink-0 select-none">
          
          {/* Calificar y Opinión (Compacto) */}
          {onOpenFeedbackModal && (
            isCollapsed ? (
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200/80 dark:border-amber-800/80 cursor-pointer shadow-2xs transition-all active:scale-95"
                title="Calificar y Opinión"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenFeedbackModal}
                className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span>Calificar y Opinión</span>
              </button>
            )
          )}

          {/* Selector de Fondo y Modo Oscuro (Compacto) */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onOpenBgModal}
                className="py-1 px-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Cambiar fondo o subir tu foto"
              >
                <Palette className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Fondo</span>
              </button>
              {onToggleDarkMode && (
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="py-1 px-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {darkMode ? <Sun className="w-3 h-3 text-amber-400 shrink-0" /> : <Moon className="w-3 h-3 text-stone-500 dark:text-stone-400 shrink-0" />}
                  <span className="truncate">{darkMode ? 'Claro' : 'Oscuro'}</span>
                </button>
              )}
            </div>
          )}

          {/* Redes Sociales Oficiales Desktop (Sin @nutripet.v2, muy compacto) */}
          {!isCollapsed ? (
            <div className="pt-1 border-t border-stone-200/60 dark:border-stone-800">
              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href="https://www.facebook.com/NutriPet.v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 group hover:border-blue-400"
                  title="Facebook NutriPet"
                >
                  <img src="/facebook-logo.png" alt="Facebook" className="w-3 h-3 object-contain" />
                  <span className="truncate">Facebook</span>
                </a>
                <a
                  href="https://www.tiktok.com/@nutripetv2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1 px-1.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 group hover:border-stone-400"
                  title="TikTok NutriPet"
                >
                  <img src="/tiktok-logo.png" alt="TikTok" className="w-3 h-3 object-contain" />
                  <span className="truncate">TikTok</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 pt-1 border-t border-stone-200/60 dark:border-stone-800">
              <a
                href="https://www.facebook.com/NutriPet.v2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition-all shadow-2xs hover:border-blue-400"
                title="Facebook NutriPet"
              >
                <img src="/facebook-logo.png" alt="Facebook" className="w-full h-full object-contain" />
              </a>
              <a
                href="https://www.tiktok.com/@nutripetv2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-750 flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition-all shadow-2xs hover:border-stone-400"
                title="TikTok NutriPet"
              >
                <img src="/tiktok-logo.png" alt="TikTok" className="w-full h-full object-contain" />
              </a>
            </div>
          )}

          {/* Acceso Administrador en PC (si aplica) */}
          {onOpenAdminModal && (
            isCollapsed ? (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-100 flex items-center justify-center mx-auto shadow-2xs active:scale-95 cursor-pointer transition-colors"
                title="Panel Administrador"
              >
                <Settings className="w-4 h-4 text-stone-200" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="w-full py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-100 font-extrabold text-[10.5px] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                <span>Panel Admin</span>
              </button>
            )
          )}

          {/* Tarjeta Pro Optimizada: Botón Naranja Compacto y Profesional */}
          {!isCollapsed ? (
            isProOrTrial ? (
              <div 
                onClick={onOpenSubscriptionModal}
                className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-2xs flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all select-none"
                title="Ver detalles de tu suscripción NutriPet Pro"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs shrink-0">👑</span>
                  <span className="text-[10.5px] font-black uppercase font-heading tracking-wide leading-none text-white truncate">
                    NutriPet Pro
                  </span>
                  <span className="text-[8px] font-mono font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full leading-none">
                    ACTIVO
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white/60 shadow-xs animate-pulse shrink-0" />
              </div>
            ) : (
              <div
                onClick={onOpenSubscriptionModal}
                className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-2xs flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all select-none"
                title="Activar NutriPet Pro"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs shrink-0">👑</span>
                  <span className="text-[10.5px] font-black uppercase font-heading tracking-wide leading-none text-white truncate">
                    Activar Pro
                  </span>
                </div>
                <span className="text-[8.5px] font-bold bg-white/25 text-white border border-white/30 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                  Ver planes
                </span>
              </div>
            )
          ) : (
            isProOrTrial ? (
              <div 
                onClick={onOpenSubscriptionModal} 
                className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white border border-amber-300/40 flex items-center justify-center cursor-pointer shadow-xs hover:brightness-105 active:scale-95 transition-all text-xs" 
                title="NutriPet Pro Activo"
              >
                👑
              </div>
            ) : (
              <div 
                onClick={onOpenSubscriptionModal} 
                className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white border border-amber-300/30 flex items-center justify-center cursor-pointer shadow-xs hover:brightness-105 active:scale-95 transition-all" 
                title="Activar NutriPet Pro"
              >
                <Crown className="w-3.5 h-3.5 text-amber-100" />
              </div>
            )
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

              <div className="px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/90 space-y-2 shrink-0">
                {/* Botón Calificar en Menú Móvil */}
                {onOpenFeedbackModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenFeedbackModal();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span>Calificar y Opinión</span>
                  </button>
                )}

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

                {/* Redes Sociales Oficiales Mobile */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 select-none">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Comunidad Oficial
                    </span>
                    
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="https://www.facebook.com/NutriPet.v2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-95 group hover:border-blue-400"
                    >
                      <img src="/facebook-logo.png" alt="Facebook" className="w-4 h-4 object-contain" />
                      <span>Facebook</span>
                    </a>
                    <a
                      href="https://www.tiktok.com/@nutripetv2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs active:scale-95 group hover:border-stone-400"
                    >
                      <img src="/tiktok-logo.png" alt="TikTok" className="w-4 h-4 object-contain" />
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>

                {onOpenAdminModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenAdminModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-100 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors active:scale-95"
                  >
                    <Settings className="w-4 h-4 text-stone-300" />
                    <span>Panel Administrador</span>
                  </button>
                )}

                {isProOrTrial ? (
                  <div 
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenSubscriptionModal();
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-2xs flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all select-none"
                    title="Ver detalles de tu suscripción NutriPet Pro"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs shrink-0">👑</span>
                      <span className="text-[11px] font-black uppercase font-heading tracking-wide leading-none text-white truncate">
                        NutriPet Pro
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full leading-none">
                        ACTIVO
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white/60 shadow-xs animate-pulse shrink-0" />
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenSubscriptionModal();
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-2xs flex items-center justify-between cursor-pointer active:scale-98 transition-all select-none"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs shrink-0">👑</span>
                      <span className="text-[11px] font-black uppercase font-heading tracking-wide leading-none text-white truncate">
                        Activar Pro
                      </span>
                    </div>
                    <span className="text-[8.5px] font-bold bg-white/25 text-white border border-white/30 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                      Ver planes
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};