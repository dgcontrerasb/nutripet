import React, { useState, useMemo } from 'react';
import { Search, ShieldAlert, RotateCcw, X } from 'lucide-react';
import { TOXIC_AND_SAFE_FOODS } from '../data';
import { usePets } from '../context/PetContext';

const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export const FoodTrafficLight: React.FC = () => {
  const { activePet } = usePets();

  // Estados de filtrado y búsqueda
  const [foodFilter, setFoodFilter] = useState<'all' | 'mortal' | 'danger' | 'superfood'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>(() => {
    if (activePet?.type === 'cat') return 'cat';
    if (activePet?.type === 'dog') return 'dog';
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtrado por especie base para conteos dinámicos
  const speciesMatchedFoods = useMemo(() => {
    return TOXIC_AND_SAFE_FOODS.filter(food => {
      if (speciesFilter === 'all') return true;
      return food.appliesTo === 'both' || food.appliesTo === speciesFilter;
    });
  }, [speciesFilter]);

  // Conteos dinámicos por nivel de riesgo
  const counts = useMemo(() => {
    return {
      all: speciesMatchedFoods.length,
      mortal: speciesMatchedFoods.filter(f => f.category === 'mortal').length,
      danger: speciesMatchedFoods.filter(f => f.category === 'danger').length,
      superfood: speciesMatchedFoods.filter(f => f.category === 'superfood').length,
    };
  }, [speciesMatchedFoods]);

  // Lista filtrada final por categoría de riesgo y texto de búsqueda
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setFoodFilter('all');
    setSpeciesFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabecera Principal y Controles */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              Seguridad y Toxicidad
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-heading">
              Semáforo de Alimentos: Qué puede y qué NUNCA debe comer
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              ¿Vas a compartirle comida de tu plato? Revisa primero esta enciclopedia interactiva para prevenir urgencias veterinarias e intoxicaciones.
            </p>
          </div>

          {/* Selector táctil de especie */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-700 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setSpeciesFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                speciesFilter === 'all'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🐾 Todos
            </button>
            <button
              type="button"
              onClick={() => setSpeciesFilter('dog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                speciesFilter === 'dog'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🐶 Perros
            </button>
            <button
              type="button"
              onClick={() => setSpeciesFilter('cat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                speciesFilter === 'cat'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🐱 Gatos
            </button>
          </div>
        </div>

        {/* Buscador Dinámico y Filtros por Chip de Riesgo */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar alimento o síntoma (ej. chocolate, manzana, cebolla)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chips de filtro por nivel de riesgo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            <button
              type="button"
              onClick={() => setFoodFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                foodFilter === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs font-extrabold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Todos ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFoodFilter('mortal')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                foodFilter === 'mortal'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
              }`}
            >
              ⛔ Mortales ({counts.mortal})
            </button>
            <button
              type="button"
              onClick={() => setFoodFilter('danger')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                foodFilter === 'danger'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              ⚠️ Precaución ({counts.danger})
            </button>
            <button
              type="button"
              onClick={() => setFoodFilter('superfood')}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                foodFilter === 'superfood'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              }`}
            >
              ✅ Seguros / Snacks ({counts.superfood})
            </button>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Tarjetas de Alimentos */}
      {filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredFoods.map(food => (
            <div
              key={food.id}
              className={`p-4 sm:p-6 rounded-3xl border-2 transition-all hover:shadow-md ${
                food.category === 'mortal'
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-700'
                  : food.category === 'danger'
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-700'
                  : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug">
                    {food.name}
                  </h3>
                  <span
                    className={`inline-block mt-1 text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      food.category === 'mortal'
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : food.category === 'danger'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {food.dangerLevel}
                  </span>
                </div>

                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 shadow-2xs whitespace-nowrap shrink-0">
                  {food.appliesTo === 'both' ? 'Perros & Gatos' : food.appliesTo === 'dog' ? '🐶 Solo Perros' : '🐱 Solo Gatos'}
                </span>
              </div>

              <div className="mt-3 sm:mt-4 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 block font-bold text-[11px] sm:text-xs">
                    ¿Por qué es peligroso o seguro?
                  </strong>
                  <p className="mt-0.5 leading-relaxed text-stone-600 dark:text-stone-400 text-[11px] sm:text-xs">
                    {food.why}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800">
                  <strong className="text-stone-900 dark:text-stone-100 block font-bold text-[11px] sm:text-xs">
                    {food.category === 'superfood' ? '✨ Aporte nutricional y beneficios:' : '🚨 Síntomas de intoxicación:'}
                  </strong>
                  <p className="mt-0.5 leading-relaxed text-stone-600 dark:text-stone-400 text-[11px] sm:text-xs">
                    {food.symptoms}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado vacío interactivo */
        <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
              No se encontraron alimentos
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              {searchQuery
                ? `No hay resultados que coincidan con "${searchQuery}" para los filtros seleccionados.`
                : 'No hay alimentos disponibles bajo esta combinación de filtros.'}
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
