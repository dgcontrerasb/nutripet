import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  ShoppingBag, 
  ArrowRightLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Leaf,
  TrendingUp,
  Wallet,
  AlertTriangle
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

export const CountryFoodAdvisor: React.FC<Props> = ({ onOpenSubscriptionModal }) => {
  const { activePet, isProOrTrial } = usePets();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('GLOBAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'brands' | 'mixed_diet'>('brands');
  
  // Estado para acordeones (qué categorías están expandidas)
  const [expandedTiers, setExpandedTiers] = useState<Record<FoodTier | 'all', boolean>>({
    top_recommended: true,
    natural_premium: false,
    excellent_value: false,
    budget_friendly: false,
    emergency_only: false,
    all: true
  });

  const currentPetType = activePet?.type || 'dog';

  // Filtrar marcas según país, tipo de mascota y búsqueda
  const filteredBrands = useMemo(() => {
    return COUNTRY_FOOD_CATALOG.filter(brand => {
      const matchPet = brand.appliesTo === 'both' || brand.appliesTo === currentPetType;
      const matchCountry = selectedCountry === 'GLOBAL' 
        ? true 
        : (brand.countries.includes(selectedCountry) || brand.countries.includes('GLOBAL'));
      const matchSearch = searchQuery === '' || 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase());

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

  // Toggle para acordeones
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

  if (!isProOrTrial) {
    return (
      <div className="space-y-6">
        <ProFeatureLock
          featureName="Marcas por País & Guía de Dieta Mixta"
          description="Accede a nuestro catálogo internacional de marcas clasificadas por calidad, presupuesto y país de origen, junto con la guía completa para transiciones alimentarias sin diarreas."
          benefits={[
            "Análisis de marcas disponibles en Colombia, México, Argentina, Chile y más",
            "Clasificación por gama (Súper Premium, Calidad-Precio, Emergencia)",
            "Cronograma paso a paso para transición alimentaria segura"
          ]}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                Guía por País & Presupuesto
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Para {currentPetType === 'dog' ? 'Perros 🐶' : 'Gatos 🐱'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-heading mt-2">
              Marcas Recomendadas & Dieta Mixta
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1 max-w-3xl">
              Encuentra marcas disponibles en tu país y cómo combinarlas con comida natural (BARF) o entre sí.
            </p>
          </div>

          {/* Selector de País */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0 space-y-1.5">
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" /> Tu País:
            </label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value as CountryCode)}
              className="w-full sm:w-56 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-800 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Subpestañas + Búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('brands')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'brands'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Marcas ({filteredBrands.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('mixed_diet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'mixed_diet'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dieta Mixta 🥩</span>
            </button>
          </div>

          {activeSubTab === 'brands' && (
            /* Búsqueda por nombre */
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar marca..."
                className="pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden w-48 sm:w-64"
              />
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO: SUBPESTAÑA 1 - MARCAS POR PAÍS */}
      {activeSubTab === 'brands' && (
        <div className="space-y-3">
          {/* Botón para expandir/colapsar todo */}
          <div className="flex justify-end">
            <button
              onClick={() => toggleTier('all')}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-all"
            >
              {expandedTiers.all ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Colapsar todo
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Expandir todo
                </>
              )}
            </button>
          </div>

          {/* ACORDEÓN 1: TOP RECOMENDADAS */}
          <TierAccordion
            title="🏆 Top Recomendadas"
            subtitle="Veterinarios + Calidad Probada"
            description="Fórmulas científicas, amplia disponibilidad, precios medios-altos"
            icon={<Award className="w-4 h-4" />}
            color="amber"
            brands={brandsByTier.top_recommended}
            isExpanded={expandedTiers.top_recommended}
            onToggle={() => toggleTier('top_recommended')}
          />

          {/* ACORDEÓN 2: NATURAL PREMIUM */}
          <TierAccordion
            title="🌟 Natural Premium"
            subtitle="Sin límite de presupuesto"
            description="Carne real como 1er ingrediente, sin subproductos, grain-free"
            icon={<Leaf className="w-4 h-4" />}
            color="emerald"
            brands={brandsByTier.natural_premium}
            isExpanded={expandedTiers.natural_premium}
            onToggle={() => toggleTier('natural_premium')}
          />

          {/* ACORDEÓN 3: EXCELENTE VALOR */}
          <TierAccordion
            title="⭐ Excelente Valor"
            subtitle="Mejor Calidad/Precio"
            description="Buena calidad a precios accesibles para uso diario"
            icon={<TrendingUp className="w-4 h-4" />}
            color="blue"
            brands={brandsByTier.excellent_value}
            isExpanded={expandedTiers.excellent_value}
            onToggle={() => toggleTier('excellent_value')}
          />

          {/* ACORDEÓN 4: ECONÓMICAS ACEPTABLES */}
          <TierAccordion
            title="💰 Económicas Aceptables"
            subtitle="Presupuesto ajustado"
            description="Opciones económicas, recomendamos complementar con comida fresca"
            icon={<Wallet className="w-4 h-4" />}
            color="purple"
            brands={brandsByTier.budget_friendly}
            isExpanded={expandedTiers.budget_friendly}
            onToggle={() => toggleTier('budget_friendly')}
          />

          {/* ACORDEÓN 5: SOLO EMERGENCIAS */}
          {brandsByTier.emergency_only.length > 0 && (
            <TierAccordion
              title="⚠️ Solo Emergencias"
              subtitle="No uso continuo"
              description="Marcas genéricas, usar solo temporalmente"
              icon={<AlertTriangle className="w-4 h-4" />}
              color="red"
              brands={brandsByTier.emergency_only}
              isExpanded={expandedTiers.emergency_only}
              onToggle={() => toggleTier('emergency_only')}
            />
          )}
        </div>
      )}

      {/* CONTENIDO: SUBPESTAÑA 2 - GUÍA DE DIETA MIXTA */}
      {activeSubTab === 'mixed_diet' && (
        <div className="space-y-6">
          {/* Banner explicativo */}
          <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-3 shadow-md">
            <span className="text-xs font-bold text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-600/40">
              Nutrición Flexible & Ahorro
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading">
              {MIXED_DIET_KNOWLEDGE.title}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
              {MIXED_DIET_KNOWLEDGE.subtitle}
            </p>
          </div>

          {/* Reglas de Oro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MIXED_DIET_KNOWLEDGE.goldenRules.map((gr, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 p-2 bg-stone-50 rounded-2xl border border-stone-100">
                    {gr.icon}
                  </span>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-stone-900 leading-snug">
                      {gr.rule}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {gr.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla de Mezclas */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
              ¿Cuáles mezclas son seguras?
            </h3>

            <div className="space-y-3">
              {MIXED_DIET_KNOWLEDGE.safeMixtures.map((mix, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    mix.safetyLevel === 'safe'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : mix.safetyLevel === 'caution'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {mix.safetyLevel === 'safe' ? '✅' : mix.safetyLevel === 'caution' ? '⚠️' : '⛔'}
                      </span>
                      <h4 className="font-heading font-extrabold text-sm text-stone-900">
                        {mix.type}
                      </h4>
                    </div>
                    <span 
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        mix.safetyLevel === 'safe'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : mix.safetyLevel === 'caution'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {mix.safetyLevel === 'safe' ? 'Apta' : mix.safetyLevel === 'caution' ? 'Con Precaución' : 'Evitar'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-stone-700 mt-2">
                    <strong>Cómo:</strong> {mix.howTo}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {mix.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Componente Acordeón por Categoría
interface TierAccordionProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: 'amber' | 'emerald' | 'blue' | 'purple' | 'red';
  brands: PetFoodBrand[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TierAccordion: React.FC<TierAccordionProps> = ({
  title,
  subtitle,
  description,
  icon,
  color,
  brands,
  isExpanded,
  onToggle
}) => {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    red: 'bg-red-50 border-red-200 text-red-900'
  };

  const badgeColorClasses = {
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  if (brands.length === 0) return null;

  return (
    <div className={`rounded-3xl border-2 overflow-hidden transition-all ${colorClasses[color]}`}>
      {/* Cabecera del acordeón (siempre visible) */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
            {icon}
          </span>
          <div>
            <h3 className="font-heading font-extrabold text-base text-stone-900 leading-tight">
              {title}
            </h3>
            <p className="text-[11px] font-semibold text-stone-600 mt-0.5">
              {subtitle} • {brands.length} {brands.length === 1 ? 'marca' : 'marcas'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColorClasses[color]}`}>
            {isExpanded ? 'Visible' : 'Oculto'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-stone-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-stone-600" />
          )}
        </div>
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2">
          <p className="text-xs text-stone-600 mb-4 -mt-1 pl-14">
            {description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {brands.map(brand => (
              <BrandCard key={brand.id} brand={brand} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// Componente Tarjeta de Marca (Compacta)
const BrandCard: React.FC<{ brand: PetFoodBrand; color: 'amber' | 'emerald' | 'blue' | 'purple' | 'red' }> = ({ brand, color }) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2.5 hover:shadow-sm transition-shadow">
      <div className="space-y-1.5">
        <h4 className="font-heading font-extrabold text-sm text-stone-900 leading-tight">
          {brand.name}
        </h4>

        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Proteína:
          </p>
          <p className="text-xs text-stone-700 font-medium leading-snug line-clamp-2">
            {brand.proteinSource}
          </p>
        </div>

        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Ventajas:
          </p>
          <p className="text-xs text-stone-600 leading-snug line-clamp-2">
            {brand.pros}
          </p>
        </div>
      </div>

      <div className="pt-2.5 border-t border-stone-100 space-y-1">
        <p className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
          🥩 Mix con BARF:
        </p>
        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
          {brand.mixGuidelines}
        </p>
      </div>
    </div>
  );
};
