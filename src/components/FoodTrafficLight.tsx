import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, RotateCcw, X, ChevronDown, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TOXIC_AND_SAFE_FOODS } from '../data';
import { usePets } from '../context/PetContext';

const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const INITIAL_CARD_LIMIT = 4;

export const FoodTrafficLight: React.FC = () => {
  const { activePet } = usePets();

  const petType = activePet?.type || 'dog';
  const petName = activePet?.name || 'tu mascota';

  const [foodFilter, setFoodFilter] = useState<'all' | 'mortal' | 'danger' | 'superfood'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Filtrado exclusivo para la especie de la mascota activa
  const speciesMatchedFoods = useMemo(() => {
    return TOXIC_AND_SAFE_FOODS.filter(food => {
      return food.appliesTo === 'both' || food.appliesTo === petType;
    });
  }, [petType]);

  const counts = useMemo(() => {
    return {
      all: speciesMatchedFoods.length,
      mortal: speciesMatchedFoods.filter(f => f.category === 'mortal').length,
      danger: speciesMatchedFoods.filter(f => f.category === 'danger').length,
      superfood: speciesMatchedFoods.filter(f => f.category === 'superfood').length,
    };
  }, [speciesMatchedFoods]);

  const filteredFoods = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery.trim());

    return speciesMatchedFoods.filter(food => {
      const matchCategory = foodFilter === 'all' || food.category === foodFilter;
      if (!matchCategory) return false;

      if (!normalizedQuery) return true;

      const nameMatch = normalizeText(food.name).includes(normalizedQuery);
      const whyMatch = normalizeText(food.why).includes(normalizedQuery);
      const symptomsMatch = normalizeText(food.symptoms).includes(normalizedQuery);

      return nameMatch || whyMatch || symptomsMatch;
    });
  }, [speciesMatchedFoods, foodFilter, searchQuery]);

  // Primeras 4 tarjetas (niveladas con la tarjeta de Oslo)
  const initialCards = useMemo(() => {
    return filteredFoods.slice(0, INITIAL_CARD_LIMIT);
  }, [filteredFoods]);

  // Tarjetas restantes para desplegar en 3 columnas
  const remainingCards = useMemo(() => {
    return filteredFoods.slice(INITIAL_CARD_LIMIT);
  }, [filteredFoods]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFoodFilter('all');
    setIsExpanded(false);
  };

  const renderFoodCard = (food: typeof TOXIC_AND_SAFE_FOODS[0]) => (
    <div
      key={food.id}
      className="bg-white/95 dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-stone-100 dark:border-stone-800/80 pb-3">
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100 leading-snug">
              {food.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                food.category === 'mortal'
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60'
                  : food.category === 'danger'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60'
              }`}
            >
              {food.dangerLevel}
            </span>
          </div>

          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-200/70 dark:border-stone-700 shrink-0">
            {food.appliesTo === 'both' ? 'Perros & Gatos' : food.appliesTo === 'dog' ? '🐶 Solo Perros' : '🐱 Solo Gatos'}
          </span>
        </div>

        <div className="mt-3 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
          <div>
            <strong className="text-stone-900 dark:text-stone-100 block font-bold text-[11px]">
              ¿Por qué es peligroso o seguro?
            </strong>
            <p className="mt-0.5 leading-relaxed text-stone-600 dark:text-stone-400 text-[11px]">
              {food.why}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <strong className="text-stone-900 dark:text-stone-100 block font-bold text-[11px]">
              {food.category === 'superfood' ? '✨ Aporte nutricional y beneficios:' : '🚨 Síntomas de intoxicación:'}
            </strong>
            <p className="mt-0.5 leading-relaxed text-stone-600 dark:text-stone-400 text-[11px]">
              {food.symptoms}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 1. MÓDULO SUPERIOR: Buscador y Filtros */}
      <div className="bg-white/95 dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xs transition-all backdrop-blur-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 shrink-0">
            <span className="text-sm">{petType === 'dog' ? '🐶' : '🐱'}</span>
            <span>Protocolo alimentario para <strong className="text-emerald-950 dark:text-emerald-100 font-extrabold">{petName}</strong> ({petType === 'dog' ? 'Canino' : 'Felino'})</span>
          </div>

          <div className="relative flex-1 md:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsExpanded(false);
              }}
              placeholder="Buscar ingrediente, snack o síntoma..."
              className="w-full pl-10 pr-9 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-850/80 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-stone-100 dark:border-stone-800/80">
          <button
            type="button"
            onClick={() => {
              setFoodFilter('all');
              setIsExpanded(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              foodFilter === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs font-black'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <span>Todos</span>
            <span className="opacity-80 font-mono text-[10px]">({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFoodFilter('mortal');
              setIsExpanded(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              foodFilter === 'mortal'
                ? 'bg-red-700 text-white shadow-xs font-black'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/50 dark:border-red-900/40'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span>Mortales</span>
            <span className="opacity-80 font-mono text-[10px]">({counts.mortal})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFoodFilter('danger');
              setIsExpanded(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              foodFilter === 'danger'
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/50 dark:border-amber-900/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Precaución</span>
            <span className="opacity-80 font-mono text-[10px]">({counts.danger})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFoodFilter('superfood');
              setIsExpanded(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              foodFilter === 'superfood'
                ? 'bg-emerald-700 text-white shadow-xs font-black'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/50 dark:border-emerald-900/40'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Seguros / Snacks</span>
            <span className="opacity-80 font-mono text-[10px]">({counts.superfood})</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMERAS 4 TARJETAS EN 2 COLUMNAS (ALINEADAS CON OSLO) */}
      {filteredFoods.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {initialCards.map(food => renderFoodCard(food))}
          </div>

          {/* Botón Expansor */}
          {remainingCards.length > 0 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white hover:bg-stone-50 dark:bg-[#1a231d] dark:hover:bg-stone-850 border border-stone-300/80 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs font-extrabold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
              >
                <span>
                  {isExpanded
                    ? '▲ Mostrar menos alimentos'
                    : `▼ Mostrar más alimentos (${remainingCards.length} restantes)`}
                </span>
                <ChevronDown className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* 3. BLOQUE EXPANDIDO DE 3 COLUMNAS QUE ESCAPA AL 100% DEL ANCHO */}
          {isExpanded && remainingCards.length > 0 && (
            <div className="lg:-ml-[50%] w-auto lg:w-[150%] pt-6 border-t border-stone-200/80 dark:border-stone-800">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 animate-fade-in">
                {remainingCards.map(food => renderFoodCard(food))}
              </div>
            </div>
          )}
          
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white/95 dark:bg-[#1a231d] border border-stone-200 dark:border-stone-800 rounded-3xl space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
              No se encontraron alimentos
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {searchQuery
                ? `No hay resultados para "${searchQuery}" en la categoría seleccionada.`
                : 'No hay alimentos disponibles bajo este filtro.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
};