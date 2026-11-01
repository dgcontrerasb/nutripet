import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Globe, 
  ShoppingBag, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Leaf, 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Utensils, 
  ShieldCheck 
} from 'lucide-react';
import { 
  COUNTRIES, 
  CountryCode, 
  COUNTRY_FOOD_CATALOG, 
  PetFoodBrand, 
  FoodTier, 
  MIXED_DIET_KNOWLEDGE 
} from '../data/countryFoodCatalog';
import { usePets } from '../context/PetContext';
import { ProFeatureLock } from './ProFeatureLock';

interface Props {
  onOpenSubscriptionModal: () => void;
}

// Micro-banderas vectoriales SVG limpias y nítidas (Cero dependencia de emojis rotos en Windows)
export const CountryFlagBadge: React.FC<{ code: CountryCode; className?: string }> = ({ 
  code, 
  className = "w-5 h-3.5" 
}) => {
  switch (code) {
    case 'CO':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="Colombia"
        >
          <path fill="#FCD116" d="M0 0h640v240H0z" />
          <path fill="#003893" d="M0 240h640v120H0z" />
          <path fill="#CE1126" d="M0 360h640v120H0z" />
        </svg>
      );
    case 'MX':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="México"
        >
          <path fill="#006847" d="M0 0h213.3v480H0z" />
          <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#CE1126" d="M426.7 0H640v480H426.7z" />
          <circle cx="320" cy="240" r="28" fill="#8B5A2B" opacity="0.9" />
          <circle cx="320" cy="240" r="16" fill="#FCD116" opacity="0.8" />
        </svg>
      );
    case 'AR':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="Argentina"
        >
          <path fill="#74ACDF" d="M0 0h640v160H0zM0 320h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <circle cx="320" cy="240" r="28" fill="#F6B40E" />
        </svg>
      );
    case 'CL':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="Chile"
        >
          <path fill="#D52B1E" d="M0 240h640v240H0z" />
          <path fill="#ffffff" d="M240 0h400v240H240z" />
          <path fill="#0039A6" d="M0 0h240v240H0z" />
          <polygon fill="#ffffff" points="120,52 132,90 172,90 140,114 152,152 120,128 88,152 100,114 68,90 108,90" />
        </svg>
      );
    case 'PE':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="Perú"
        >
          <path fill="#D91023" d="M0 0h213.3v480H0zM426.7 0H640v480H426.7z" />
          <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
        </svg>
      );
    case 'ES':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="España"
        >
          <path fill="#AA151B" d="M0 0h640v120H0zM0 360h640v120H0z" />
          <path fill="#F1BF00" d="M0 120h640v240H0z" />
          <rect x="180" y="200" width="40" height="80" rx="6" fill="#AA151B" opacity="0.8" />
        </svg>
      );
    case 'US':
      return (
        <svg 
          viewBox="0 0 640 480" 
          className={`${className} rounded-xs overflow-hidden shrink-0 shadow-2xs border border-stone-200 dark:border-stone-700`} 
          aria-label="Estados Unidos"
        >
          <path fill="#B22234" d="M0 0h640v480H0z" />
          <path stroke="#ffffff" strokeWidth="37" d="M0 55h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640" />
          <path fill="#3C3B6E" d="M0 0h260v258H0z" />
          <circle cx="80" cy="70" r="12" fill="#fff" />
          <circle cx="180" cy="70" r="12" fill="#fff" />
          <circle cx="130" cy="130" r="12" fill="#fff" />
          <circle cx="80" cy="190" r="12" fill="#fff" />
          <circle cx="180" cy="190" r="12" fill="#fff" />
        </svg>
      );
    case 'GLOBAL':
    default:
      return (
        <div 
          className={`${className} rounded-xs bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center shrink-0 shadow-2xs text-emerald-700 dark:text-emerald-400`} 
          aria-label="Internacional"
        >
          <Globe className="w-3.5 h-3.5" />
        </div>
      );
  }
};

export const CountryFoodAdvisor: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, isProOrTrial } = usePets();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('GLOBAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'brands' | 'mixed_diet'>('brands');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer click por fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estado para acordeones de la pestaña de marcas
  const [expandedTiers, setExpandedTiers] = useState<Record<FoodTier | 'all', boolean>>({
    top_recommended: true,
    natural_premium: false,
    excellent_value: false,
    budget_friendly: false,
    emergency_only: false,
    all: true
  });

  // Estado para acordeones de la pestaña de dieta mixta
  const [expandedMixed, setExpandedMixed] = useState<{
    rules: boolean;
    trafficLight: boolean;
    transition: boolean;
    all: boolean;
  }>({
    rules: true,
    trafficLight: true,
    transition: false,
    all: true
  });

  const currentPetType = activePet?.type || 'dog';
  const petName = activePet?.name || 'tu mascota';

  // Filtrar marcas según país, tipo de mascota y búsqueda
  const filteredBrands = useMemo(() => {
    return COUNTRY_FOOD_CATALOG.filter(brand => {
      const matchPet = brand.appliesTo === 'both' || brand.appliesTo === currentPetType;
      const matchCountry = selectedCountry === 'GLOBAL' 
        ? true 
        : (brand.countries.includes(selectedCountry) || brand.countries.includes('GLOBAL'));
      const matchSearch = searchQuery.trim() === '' || 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.proteinSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.pros.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPet && matchCountry && matchSearch;
    });
  }, [currentPetType, selectedCountry, searchQuery]);

  // Agrupar por categoría
  const brandsByTier = useMemo(() => {
    return {
      top_recommended: filteredBrands.filter(b => b.tier === 'top_recommended'),
      natural_premium: filteredBrands.filter(b => b.tier === 'natural_premium'),
      excellent_value: filteredBrands.filter(b => b.tier === 'excellent_value'),
      budget_friendly: filteredBrands.filter(b => b.tier === 'budget_friendly'),
      emergency_only: filteredBrands.filter(b => b.tier === 'emergency_only')
    };
  }, [filteredBrands]);

  const currentCountryObj = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0];

  // Toggle para acordeones de marcas
  const toggleTier = (tier: FoodTier | 'all') => {
    if (tier === 'all') {
      const newState = !expandedTiers.all;
      setExpandedTiers({
        top_recommended: newState,
        natural_premium: newState,
        excellent_value: newState,
        budget_friendly: newState,
        emergency_only: newState,
        all: newState
      });
    } else {
      setExpandedTiers(prev => ({
        ...prev,
        [tier]: !prev[tier]
      }));
    }
  };

  // Toggle para acordeones de dieta mixta
  const toggleMixedAccordion = (section: 'rules' | 'trafficLight' | 'transition' | 'all') => {
    if (section === 'all') {
      const newState = !expandedMixed.all;
      setExpandedMixed({
        rules: newState,
        trafficLight: newState,
        transition: newState,
        all: newState
      });
    } else {
      setExpandedMixed(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  if (!isProOrTrial) {
    return (
      <div className="space-y-6 pb-28 sm:pb-8">
        <ProFeatureLock
          featureName="Marcas por País & Guía de Dieta Mixta"
          description="Accede a nuestro catálogo internacional de marcas clasificadas por calidad, presupuesto y país de origen, junto con la guía completa para transiciones alimentarias sin diarreas."
          benefits={[
            "Análisis de marcas disponibles en Colombia, México, Argentina, Chile, España y más",
            "Clasificación por gama (Súper Premium, Calidad-Precio, Económicas Aceptables)",
            "Cronograma paso a paso para combinar croquetas y BARF de forma segura"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 sm:pb-8">
      {/* 1. HERO VERDE OFICIAL (IDÉNTICO A APP.TSX) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-4 py-3.5 sm:px-6 sm:py-4 border border-[#2a5940] shadow-xs text-center flex flex-col items-center justify-center no-print mb-4">
        <div className="relative z-10 space-y-1 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <Award className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Fórmula Nutricional Oficial</span>
          </div>
          <h1 className="text-sm sm:text-lg font-editorial font-semibold tracking-tight text-white leading-tight">
            Marcas Recomendadas & <span className="font-editorial italic font-normal text-amber-300">Dieta Mixta</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
            Perfil clínico certificado para {petName} según pautas internacionales FEDIAF & NRC.
          </p>
        </div>
      </div>

      {/* 2. TARJETA BLANCA DE CONTROL BENTO */}
      <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 mb-4">
        {/* Fila 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Conmutador simétrico 50/50 */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl gap-1 w-full sm:w-auto sm:min-w-[340px]">
            <button
              type="button"
              onClick={() => setActiveSubTab('brands')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
                activeSubTab === 'brands'
                  ? 'bg-white dark:bg-stone-900 text-[#143826] dark:text-emerald-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="shrink-0">🏷️</span>
              <span className="sm:hidden">Marcas ({filteredBrands.length})</span>
              <span className="hidden sm:inline truncate">Directorio de Marcas ({filteredBrands.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('mixed_diet')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
                activeSubTab === 'mixed_diet'
                  ? 'bg-white dark:bg-stone-900 text-[#143826] dark:text-emerald-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span className="shrink-0">🥩</span>
              <span className="sm:hidden">Dieta Mixta</span>
              <span className="hidden sm:inline truncate">Guía de Dieta Mixta & Reglas</span>
            </button>
          </div>

          {/* Selector de país a la derecha con dropdown flotante y micro-banderas SVG */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="w-full sm:w-auto bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs transition-all active:scale-98"
              aria-expanded={isCountryDropdownOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-2">
                <CountryFlagBadge code={selectedCountry} />
                <span className="truncate max-w-[140px] sm:max-w-[170px]">{currentCountryObj.name}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Desplegable Flotante */}
            {isCountryDropdownOpen && (
              <div 
                className="absolute right-0 left-0 sm:left-auto top-full mt-1.5 w-full sm:w-64 bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto"
                role="listbox"
              >
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800 mb-1">
                  Selecciona tu país
                </div>
                {COUNTRIES.map(country => {
                  const isSelected = selectedCountry === country.code;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#143826] text-white shadow-2xs'
                          : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CountryFlagBadge code={country.code} />
                        <span className="truncate">{country.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fila 2 */}
        {activeSubTab === 'brands' ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-850">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por marca o proteína..."
                className="w-full h-[38px] sm:h-[40px] pl-9 pr-8 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold p-1 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleTier('all')}
              className="h-[38px] sm:h-[40px] px-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
            >
              {expandedTiers.all ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Colapsar todo</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir todo</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-850">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <Utensils className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-heading font-extrabold text-stone-800 dark:text-stone-200">
                Protocolo de Combinación & Salud Digestiva
              </span>
            </div>

            <button
              type="button"
              onClick={() => toggleMixedAccordion('all')}
              className="h-[36px] px-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              {expandedMixed.all ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Colapsar todo</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir todo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. VISTA DE MARCAS Y VISTA DE DIETA MIXTA EN ACORDEONES */}
      {activeSubTab === 'brands' && (
        <div className="space-y-4">
          {filteredBrands.length === 0 ? (
            <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-stone-800 dark:text-stone-200">
                No encontramos marcas con ese criterio
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                Prueba buscando por otro nombre o cambia el país seleccionado a <strong>Internacional / General</strong>.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ACORDEÓN 1: TOP RECOMENDADAS */}
              <TierAccordion
                title="Top Recomendadas"
                badgeText="★ Súper Premium"
                description="Fórmulas científicas con amplia disponibilidad clínica y balance de minerales verificado."
                icon={<Award className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />}
                accent="amber"
                brands={brandsByTier.top_recommended}
                isExpanded={expandedTiers.top_recommended}
                onToggle={() => toggleTier('top_recommended')}
              />

              {/* ACORDEÓN 2: NATURAL PREMIUM */}
              <TierAccordion
                title="Natural Premium"
                badgeText="★ Natural Grain-Free"
                description="Carne real deshidratada o fresca como primer ingrediente, sin subproductos ni granos genéricos."
                icon={<Leaf className="w-4 h-4 text-teal-700 dark:text-teal-400" />}
                accent="emerald"
                brands={brandsByTier.natural_premium}
                isExpanded={expandedTiers.natural_premium}
                onToggle={() => toggleTier('natural_premium')}
              />

              {/* ACORDEÓN 3: EXCELENTE VALOR */}
              <TierAccordion
                title="Excelente Valor"
                badgeText="⚖ Calidad-Precio"
                description="Buena asimilación y digestibilidad a precios razonables para sostenimiento regular."
                icon={<TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                accent="blue"
                brands={brandsByTier.excellent_value}
                isExpanded={expandedTiers.excellent_value}
                onToggle={() => toggleTier('excellent_value')}
              />

              {/* ACORDEÓN 4: ECONÓMICAS ACEPTABLES */}
              <TierAccordion
                title="Económicas Aceptables"
                badgeText="💰 Económica Aceptable"
                description="Opciones de bajo costo comercial. Recomendamos complementar con caldo de huesos o huevo."
                icon={<Wallet className="w-4 h-4 text-stone-700 dark:text-stone-300" />}
                accent="stone"
                brands={brandsByTier.budget_friendly}
                isExpanded={expandedTiers.budget_friendly}
                onToggle={() => toggleTier('budget_friendly')}
              />

              {/* ACORDEÓN 5: SOLO EMERGENCIAS */}
              {brandsByTier.emergency_only.length > 0 && (
                <TierAccordion
                  title="Solo Emergencias"
                  badgeText="⚠️ Solo Emergencia"
                  description="Marcas genéricas de emergencia. Evitar su uso continuo como alimento único."
                  icon={<AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  accent="red"
                  brands={brandsByTier.emergency_only}
                  isExpanded={expandedTiers.emergency_only}
                  onToggle={() => toggleTier('emergency_only')}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* VISTA DE DIETA MIXTA EN ACORDEONES */}
      {activeSubTab === 'mixed_diet' && (
        <div className="space-y-3">
          {/* ACORDEÓN 1: LAS 4 REGLAS CLÍNICAS DE ORO */}
          <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3 mb-3 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleMixedAccordion('rules')}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
              aria-expanded={expandedMixed.rules}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shrink-0 text-base">
                  📜
                </span>
                <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
                  <h3 className="text-xs sm:text-sm font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                    Las 4 Reglas Clínicas de Oro
                  </h3>
                  <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 w-fit bg-emerald-700 text-white shadow-2xs border-emerald-800">
                    Horarios, Proporciones & Mezclas
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate hidden sm:block">
                    Fundamentos de pH y tiempos gástricos para evitar fermentación, gases y disbiosis.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {expandedMixed.rules ? 'OCULTO' : 'MOSTRAR'}
                </span>
                <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {expandedMixed.rules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {expandedMixed.rules && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-400 sm:hidden">
                  Fundamentos de pH y tiempos gástricos para evitar fermentación, gases y disbiosis.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {MIXED_DIET_KNOWLEDGE.goldenRules.map((gr, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[#FAF7F2] dark:bg-stone-900 border border-[#EDE5D8] dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xl p-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shrink-0 shadow-3xs">
                            {gr.icon}
                          </span>
                          <span className="font-mono text-[11px] font-black text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800">
                            REGLA #{idx + 1}
                          </span>
                        </div>

                        <h4 className="font-heading font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug">
                          {gr.rule.replace(/^REGLA\s*#\d+:\s*/i, '')}
                        </h4>

                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          {gr.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 2: SEMÁFORO DE MEZCLAS SEGURAS */}
          <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3 mb-3 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleMixedAccordion('trafficLight')}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
              aria-expanded={expandedMixed.trafficLight}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800 text-amber-800 dark:text-amber-300 shrink-0 text-base">
                  🚦
                </span>
                <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
                  <h3 className="text-xs sm:text-sm font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                    Semáforo de Mezclas Seguras
                  </h3>
                  <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 w-fit bg-amber-600 text-white shadow-2xs border-amber-700">
                    Compatibilidad Gástrica
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate hidden sm:block">
                    Identifica qué combinaciones potencian la absorción y cuáles producen indigestión.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {expandedMixed.trafficLight ? 'OCULTO' : 'MOSTRAR'}
                </span>
                <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {expandedMixed.trafficLight ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {expandedMixed.trafficLight && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-400 sm:hidden">
                  Identifica qué combinaciones potencian la absorción y cuáles producen indigestión.
                </p>

                <div className="space-y-3">
                  {MIXED_DIET_KNOWLEDGE.safeMixtures.map((mix, idx) => {
                    const isSafe = mix.safetyLevel === 'safe';
                    const isCaution = mix.safetyLevel === 'caution';
                    const isForbidden = mix.safetyLevel === 'forbidden';

                    return (
                      <div 
                        key={idx}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2 bg-[#FAF7F2] dark:bg-stone-900 ${
                          isSafe
                            ? 'border-emerald-300 dark:border-emerald-800/80'
                            : isCaution
                            ? 'border-amber-300 dark:border-amber-800/80'
                            : 'border-red-300 dark:border-red-800/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            {isSafe && <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />}
                            {isCaution && <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />}
                            {isForbidden && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                            <h4 className="font-heading font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                              {mix.type}
                            </h4>
                          </div>

                          <span 
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto border ${
                              isSafe
                                ? 'bg-emerald-700 text-white shadow-2xs border-emerald-800'
                                : isCaution
                                ? 'bg-amber-600 text-white shadow-2xs border-amber-700'
                                : 'bg-red-600 text-white shadow-2xs border-red-700'
                            }`}
                          >
                            {isSafe ? 'APTA' : isCaution ? 'CON PRECAUCIÓN' : 'EVITAR'}
                          </span>
                        </div>

                        <div className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-850 p-2.5 rounded-lg border border-stone-200/70 dark:border-stone-750 space-y-1">
                          <p>
                            <strong className="font-bold text-stone-900 dark:text-stone-100">Cómo servir: </strong>
                            {mix.howTo}
                          </p>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                            {mix.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 3: PROTOCOLO DE TRANSICIÓN GRADUAL (7 DÍAS) */}
          <div className="bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3 mb-3 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => toggleMixedAccordion('transition')}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
              aria-expanded={expandedMixed.transition}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800 text-blue-800 dark:text-blue-300 shrink-0 text-base">
                  ⏱️
                </span>
                <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
                  <h3 className="text-xs sm:text-sm font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                    Protocolo de Transición (7 Días)
                  </h3>
                  <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 w-fit bg-blue-700 text-white shadow-2xs border-blue-800">
                    Paso a Paso
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate hidden sm:block">
                    Cronograma oficial para cambiar de marca o introducir comida fresca sin diarreas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {expandedMixed.transition ? 'OCULTO' : 'MOSTRAR'}
                </span>
                <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500">
                  {expandedMixed.transition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {expandedMixed.transition && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3.5">
                <p className="text-xs text-stone-600 dark:text-stone-400 sm:hidden">
                  Cronograma oficial para cambiar de marca o introducir comida fresca sin diarreas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Fase 1 */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-[#FAF7F2] dark:bg-stone-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Días 1 y 2
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">25% Nuevo</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      75% Alimento habitual + 25% Alimento nuevo o comida cocida en su plato.
                    </p>
                  </div>

                  {/* Fase 2 */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-[#FAF7F2] dark:bg-stone-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Días 3 y 4
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">50% Nuevo</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      50% Alimento habitual + 50% Alimento nuevo. Mitad de cada uno.
                    </p>
                  </div>

                  {/* Fase 3 */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-[#FAF7F2] dark:bg-stone-900 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Días 5 y 6
                      </span>
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">75% Nuevo</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400">
                      25% Alimento habitual + 75% Alimento nuevo. Mayoría de la nueva dieta.
                    </p>
                  </div>

                  {/* Fase 4 */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                        Día 7 en adelante
                      </span>
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">100% Nuevo</span>
                    </div>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-[11px] text-emerald-950 dark:text-emerald-200 font-medium">
                      100% Alimento nuevo consolidado. Flora bacteriana totalmente adaptada.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-850 border border-stone-200/80 dark:border-stone-750 text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Pauta Veterinaria:</strong> Si notas heces blandas en cualquier fase, no avances a la siguiente: mantén esa misma proporción durante 2 días adicionales hasta que las deposiciones se normalicen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Acordeón Bento por Categoría de Marcas
interface TierAccordionProps {
  title: string;
  badgeText: string;
  description: string;
  icon: React.ReactNode;
  accent: 'amber' | 'emerald' | 'blue' | 'stone' | 'red';
  brands: PetFoodBrand[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TierAccordion: React.FC<TierAccordionProps> = ({
  title,
  badgeText,
  description,
  icon,
  accent,
  brands,
  isExpanded,
  onToggle
}) => {
  if (brands.length === 0) return null;

  const headerBorders = {
    amber: 'border-amber-200/90 dark:border-amber-900/70',
    emerald: 'border-emerald-200/90 dark:border-emerald-900/70',
    blue: 'border-blue-200/90 dark:border-blue-900/70',
    stone: 'border-stone-200/90 dark:border-stone-800',
    red: 'border-red-200/90 dark:border-red-900/70'
  };

  const badgeStyles = {
    amber: 'bg-emerald-700 text-white shadow-2xs border-emerald-800',
    emerald: 'bg-teal-700 text-white shadow-2xs border-teal-800',
    blue: 'bg-amber-600 text-white shadow-2xs border-amber-700',
    stone: 'bg-stone-600 text-white shadow-2xs border-stone-700',
    red: 'bg-red-600 text-white shadow-2xs border-red-700'
  };

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#1a231d] shadow-2xs overflow-hidden transition-all ${headerBorders[accent]}`}>
      {/* Cabecera del acordeón */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors text-left cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700 shrink-0">
            {icon}
          </span>
          <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
            <h3 className="text-xs sm:text-base font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
              {title}
            </h3>
            <span className={`text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 w-fit ${badgeStyles[accent]}`}>
              {badgeText}
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate hidden sm:block">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shrink-0">
            <span className="sm:hidden">{brands.length}</span>
            <span className="hidden sm:inline">{brands.length} {brands.length === 1 ? 'marca' : 'marcas'}</span>
          </span>
          <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Contenido Desplegable */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800 space-y-3.5">
          <p className="text-xs text-stone-600 dark:text-stone-400 sm:hidden pt-2">
            {description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {brands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Tarjeta Individual de Marca Bento
const BrandCard: React.FC<{ brand: PetFoodBrand }> = ({ brand }) => {
  return (
    <div className="bg-[#FAF7F2] dark:bg-stone-900 border border-[#EDE5D8] dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-snug">
            {brand.name}
          </h4>
          <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shrink-0">
            {brand.appliesTo === 'both' ? '🐶🐱' : brand.appliesTo === 'dog' ? '🐶' : '🐱'}
          </span>
        </div>

        {/* Proteína */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
            Fuente de Proteína
          </span>
          <p className="text-xs text-stone-800 dark:text-stone-200 font-medium leading-snug line-clamp-2">
            {brand.proteinSource}
          </p>
        </div>

        {/* Ventajas */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
            Ventajas Clínicas
          </span>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-snug line-clamp-2">
            {brand.pros}
          </p>
        </div>
      </div>

      {/* Pauta Dieta Mixta con BARF */}
      <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-0.5 bg-white dark:bg-stone-850 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-750">
        <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
          🥩 Mix con Alimento Natural:
        </span>
        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
          {brand.mixGuidelines}
        </p>
      </div>
    </div>
  );
};
