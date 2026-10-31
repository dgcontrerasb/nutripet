import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Award, 
  Sparkles, 
  ShieldAlert, 
  Utensils, 
  Lightbulb, 
  Star, 
  CheckCircle2,
  ChevronRight,
  Info,
  BookOpen
} from 'lucide-react';
import { POPULAR_BREEDS } from '../data';
import { BreedInfo } from '../types';
import { usePets } from '../context/PetContext';

interface BreedEncyclopediaProps {
  profileHUD?: React.ReactNode;
}

const normalizeText = (text: string = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const BreedEncyclopedia: React.FC<BreedEncyclopediaProps> = ({
  profileHUD,
}) => {
  const { activePet } = usePets();
  const petName = activePet?.name || 'Tu Mascota';

  // Identificar la raza de la mascota activa
  const activePetBreed = useMemo(() => {
    if (!activePet?.breedId) return POPULAR_BREEDS[0];
    return POPULAR_BREEDS.find(b => b.id === activePet.breedId) || POPULAR_BREEDS[0];
  }, [activePet?.breedId]);

  // Raza actualmente inspeccionada en el panel de detalle (inicia con la de Oslo)
  const [selectedBreedId, setSelectedBreedId] = useState<string>(activePetBreed.id);

  useEffect(() => {
    if (activePetBreed) {
      setSelectedBreedId(activePetBreed.id);
    }
  }, [activePetBreed]);

  const [breedSearchQuery, setBreedSearchQuery] = useState<string>('');
  const [breedTypeFilter, setBreedTypeFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [detailTab, setDetailTab] = useState<'health' | 'brands' | 'tips'>('health');

  // Filtrado de la lista del directorio
  const filteredBreedsList: BreedInfo[] = useMemo(() => {
    return POPULAR_BREEDS.filter(breed => {
      const matchType = breedTypeFilter === 'all' || breed.type === breedTypeFilter;
      const q = normalizeText(breedSearchQuery.trim());
      if (!q) return matchType;

      const matchQuery =
        normalizeText(breed.name).includes(q) ||
        breed.predispositions.some(p => normalizeText(p).includes(q)) ||
        normalizeText(breed.sizeCategory).includes(q);

      return matchType && matchQuery;
    });
  }, [breedSearchQuery, breedTypeFilter]);

  // Raza actualmente visualizada en detalle
  const currentBreed = useMemo(() => {
    return POPULAR_BREEDS.find(b => b.id === selectedBreedId) || activePetBreed;
  }, [selectedBreedId, activePetBreed]);

  const isCurrentActivePet = currentBreed.id === activePet?.breedId;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* ========================================================================= */}
      {/* 📐 ARQUITECTURA SPLIT-SCREEN EN 3 MÓDULOS (CERO VACÍOS EN PC Y MÓVIL)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        
        {/* MÓDULO 1 (IZQUIERDA - 4 COLS): PET PROFILE HUD DE OSLO */}
        {profileHUD && (
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-4">
            {profileHUD}
          </div>
        )}

        {/* CONTENEDOR CENTRAL + DERECHO (8 COLS EN PC) */}
        <div className={`space-y-4 ${profileHUD ? 'lg:col-span-8' : 'col-span-12'}`}>
          
          {/* 1. HERO VERDE INSTITUCIONAL 100% SIMÉTRICO */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-3.5 py-3 sm:px-6 sm:py-3.5 border border-[#2a5940] shadow-xs text-center flex flex-col items-center justify-center no-print">
            <div className="relative z-10 space-y-1 max-w-lg mx-auto">
              <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Enciclopedia Morfológica & Nutrición</span>
              </div>
              <h1 className="text-sm sm:text-base font-editorial font-semibold tracking-tight text-white leading-tight">
                Alimentos & Marcas <span className="font-editorial italic font-normal text-amber-300">según Raza y Contextura</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
                Susceptibilidad genética y pautas de alimentación preventiva para {petName}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* ======================================================== */}
            {/* MÓDULO 2 (CENTRAL): DIRECTORIO COMPACTO DE RAZAS          */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Directorio ({filteredBreedsList.length})
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBreedTypeFilter('all')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${breedTypeFilter === 'all' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-400'}`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedTypeFilter('dog')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${breedTypeFilter === 'dog' ? 'bg-amber-500 text-white' : 'text-stone-400'}`}
                    >
                      🐶
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreedTypeFilter('cat')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${breedTypeFilter === 'cat' ? 'bg-indigo-600 text-white' : 'text-stone-400'}`}
                    >
                      🐱
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={breedSearchQuery}
                    onChange={e => setBreedSearchQuery(e.target.value)}
                    placeholder="Buscar raza..."
                    className="w-full pl-7 pr-6 py-1.5 bg-stone-50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {breedSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBreedSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Lista Scrollable Interna */}
              <div className="h-[200px] sm:h-[300px] lg:h-[480px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {filteredBreedsList.map(b => {
                  const isSelected = b.id === currentBreed.id;
                  const isOslo = b.id === activePet?.breedId;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBreedId(b.id)}
                      className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 shadow-3xs'
                          : 'border-stone-200/70 dark:border-stone-800 hover:border-stone-300 bg-stone-50/50 dark:bg-stone-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span className="text-base shrink-0">{b.type === 'dog' ? '🐕' : '🐈'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate block">
                              {b.name}
                            </span>
                            {isOslo && (
                              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                                {petName}
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] text-stone-400 block truncate">
                            {b.typicalWeight} • {b.sizeCategory}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                <span>Consulta de susceptibilidad</span>
                <span className="text-emerald-600 font-bold">FEDIAF</span>
              </div>

            </div>

            {/* ======================================================== */}
            {/* MÓDULO 3 (DERECHO): PANEL DE CONSULTA CLÍNICA DE RAZA    */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1a231d] border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
              
              {/* Cabecera del Detalle (Sin botón de simular ni recalcular) */}
              <div className="border-b border-stone-100 dark:border-stone-800 pb-3 space-y-1">
                {isCurrentActivePet ? (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60">
                      <Star className="w-3 h-3 fill-current" />
                      Raza de {petName} (Mascota Activa)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">Perfil Vigente</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      <BookOpen className="w-3 h-3 text-stone-500" />
                      Consulta Informativa
                    </span>
                    <span className="text-[10px] text-stone-400">Modo Directorio</span>
                  </div>
                )}

                <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug">
                  {currentBreed.name}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Peso Típico: <strong className="text-stone-700 dark:text-stone-300">{currentBreed.typicalWeight}</strong> • Contextura: {currentBreed.sizeCategory}
                </p>
              </div>

              {/* Selector de Pestañas de Consulta */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-850 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDetailTab('health')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    detailTab === 'health'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-3xs font-black'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Puntos Débiles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('brands')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    detailTab === 'brands'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-3xs font-black'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fórmulas Sugeridas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('tips')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    detailTab === 'tips'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-3xs font-black'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Consejo Clave</span>
                </button>
              </div>

              {/* Contenido de la Ficha Clínica */}
              <div className="space-y-3 min-h-[220px]">
                
                {/* 1. PUNTOS DÉBILES */}
                {detailTab === 'health' && (
                  <div className="space-y-2.5 animate-fade-in">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                      Susceptibilidad Genética Registrada:
                    </span>
                    <div className="space-y-1.5">
                      {currentBreed.predispositions.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                          <span className="text-xs text-stone-700 dark:text-stone-300 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-[10.5px] text-stone-500 dark:text-stone-400 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span><strong>Enfoque nutricional recomendado:</strong> {currentBreed.nutritionFocus}</span>
                    </div>
                  </div>
                )}

                {/* 2. MARCAS SUGERIDAS */}
                {detailTab === 'brands' && (
                  <div className="space-y-2.5 animate-fade-in">
                    {currentBreed.recommendedFoodTypes.map((tier, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-1.5">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md inline-block ${
                          tier.tier.includes('Súper Premium')
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}>
                          {tier.tier}
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {tier.brands.map((b, bIdx) => (
                            <span key={bIdx} className="px-2 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-3xs">
                              {b}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10.5px] text-stone-600 dark:text-stone-300 leading-snug pt-1">
                          💡 <strong>Por qué funciona:</strong> {tier.why}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. CONSEJO DEL ESPECIALISTA */}
                {detailTab === 'tips' && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 animate-fade-in">
                    <span className="text-[10.5px] font-black uppercase text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Pauta Veterinaria Clave:
                    </span>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {currentBreed.breedTips[0]}
                    </p>
                  </div>
                )}

              </div>

              {/* Descargo Médico al Pie */}
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
                📌 <em>Ficha informativa según estándares FEDIAF. Cada mascota debe ser valorada individualmente en consulta médica.</em>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};