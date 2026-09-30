import React, { useState, useMemo } from 'react';
import { Search, Award, RotateCcw } from 'lucide-react';
import { POPULAR_BREEDS } from '../data';
import { BreedInfo } from '../types';

interface BreedEncyclopediaProps {
  onSelectBreedForCalculation: (type: 'dog' | 'cat', breedId: string) => void;
}

const normalizeText = (text: string = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const BreedEncyclopedia: React.FC<BreedEncyclopediaProps> = ({
  onSelectBreedForCalculation,
}) => {
  const [breedSearchQuery, setBreedSearchQuery] = useState<string>('');
  const [breedTypeFilter, setBreedTypeFilter] = useState<'all' | 'dog' | 'cat'>('all');

  const filteredBreedsList: BreedInfo[] = useMemo(() => {
    return POPULAR_BREEDS.filter(breed => {
      const matchType = breedTypeFilter === 'all' || breed.type === breedTypeFilter;
      const q = normalizeText(breedSearchQuery.trim());
      if (!q) return matchType;

      const matchQuery =
        normalizeText(breed.name).includes(q) ||
        breed.predispositions.some(p => normalizeText(p).includes(q)) ||
        normalizeText(breed.nutritionFocus).includes(q) ||
        normalizeText(breed.sizeCategory).includes(q) ||
        breed.recommendedFoodTypes.some(
          tier =>
            normalizeText(tier.tier).includes(q) ||
            tier.brands.some(b => normalizeText(b).includes(q)) ||
            normalizeText(tier.why).includes(q)
        );

      return matchType && matchQuery;
    });
  }, [breedSearchQuery, breedTypeFilter]);

  const handleResetFilters = () => {
    setBreedSearchQuery('');
    setBreedTypeFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Cabecera, Buscador y Filtros */}
      <div className="glass-card rounded-3xl p-4 sm:p-8 space-y-4 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            Enciclopedia de Razas y Nutrición
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-heading">
            Alimentos y Marcas Ideales según la Raza y Contextura
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            No todos los perros o gatos procesan los alimentos igual. Un Labrador requiere protección articular y control estricto de saciedad; un Bulldog necesita croquetas ergonómicas antiahogo; y los gatos necesitan control de pH urinario.
          </p>
        </div>

        {/* Buscador y Filtro por Especie */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={breedSearchQuery}
              onChange={e => setBreedSearchQuery(e.target.value)}
              placeholder="Buscar raza (ej. Pomerania, Husky, Dachshund, Pitbull)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-medium bg-stone-50/50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
            />
            {breedSearchQuery && (
              <button
                type="button"
                onClick={() => setBreedSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-100/90 dark:bg-stone-800/90 p-1 rounded-xl overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setBreedTypeFilter('all')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                breedTypeFilter === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs font-extrabold'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              Todas ({POPULAR_BREEDS.length})
            </button>
            <button
              type="button"
              onClick={() => setBreedTypeFilter('dog')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 ${
                breedTypeFilter === 'dog'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs font-extrabold'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              <span>🐶</span> Perros ({POPULAR_BREEDS.filter(b => b.type === 'dog').length})
            </button>
            <button
              type="button"
              onClick={() => setBreedTypeFilter('cat')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 ${
                breedTypeFilter === 'cat'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs font-extrabold'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              <span>🐱</span> Gatos ({POPULAR_BREEDS.filter(b => b.type === 'cat').length})
            </button>
          </div>
        </div>

        {/* Guía Rápida: Si no conoces la raza de tu mascota */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-stone-700 dark:text-stone-300">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs text-base sm:text-lg">
            🐾
          </div>
          <div className="space-y-0.5 text-xs sm:text-sm">
            <p className="font-bold text-emerald-950 dark:text-emerald-200">
              ¿Tu mascota es mestiza, adoptada o no sabes su raza exacta?
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px] sm:text-xs">
              ¡No te preocupes! Elige una de las 3 opciones por tamaño (<strong className="text-stone-800 dark:text-stone-100">Mestizo Pequeño &lt;10kg</strong>, <strong className="text-stone-800 dark:text-stone-100">Mediano 10-25kg</strong> o <strong className="text-stone-800 dark:text-stone-100">Grande &gt;25kg</strong>), o escoge la raza que más se parezca a sus características físicas. En la calculadora, los gramos y calorías se calculan con exactitud matemática a partir de su peso real en kg.
            </p>
          </div>
        </div>
      </div>

      {/* Estado vacío cuando no hay resultados */}
      {filteredBreedsList.length === 0 && (
        <div className="glass-card rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
              No se encontraron razas
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              No hay coincidencias para &ldquo;{breedSearchQuery}&rdquo; en la categoría seleccionada.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer búsqueda y filtros</span>
          </button>
        </div>
      )}

      {/* Listado de Razas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredBreedsList.map(breed => (
          <div
            key={breed.id}
            className="glass-card rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{breed.type === 'dog' ? '🐕' : '🐈'}</span>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                      {breed.name}
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-semibold block mt-0.5">
                    Peso promedio: {breed.typicalWeight} • Categoría: {breed.sizeCategory}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectBreedForCalculation(breed.type, breed.id)}
                  className="w-full sm:w-auto text-center px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer active:scale-98"
                >
                  Calcular con esta raza →
                </button>
              </div>

              {/* Predisposiciones de Salud */}
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                  Puntos Débiles de Salud:
                </span>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-0.5 list-disc list-inside">
                  {breed.predispositions.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Marcas Recomendadas */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Marcas y Fórmulas Sugeridas:
                </span>
                <div className="space-y-2.5">
                  {breed.recommendedFoodTypes.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800"
                    >
                      {/* Categoría / Nivel Badge */}
                      <span
                        className={`font-bold text-xs px-2.5 py-1 rounded-lg w-fit ${
                          tier.tier.includes('Súper Premium')
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {tier.tier}
                      </span>

                      {/* Marcas recomendadas en Chips/Tags */}
                      <div className="flex flex-wrap gap-2">
                        {tier.brands.map((brand, bIdx) => (
                          <span
                            key={bIdx}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-2xs"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>

                      {/* Explicación Por qué funciona */}
                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 mt-1 leading-relaxed">
                        <span className="shrink-0 mt-0.5">💡</span>
                        <div>
                          <strong className="text-stone-900 dark:text-stone-200">Por qué funciona:</strong>{' '}
                          {tier.why}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips de la Raza */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <strong className="block font-bold">Consejo clave para el dueño:</strong>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                {breed.breedTips[0]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
