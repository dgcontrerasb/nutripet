import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Pill,
  BookOpen,
  Tag,
  Scale,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DETAILED_CARE_GUIDES } from '../data/tipsGuidesData';
import { HEALTH_AND_NUTRITION_GUIDES } from '../data';
import { usePets } from '../context/PetContext';

const normalizeText = (text: string = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const TipsAndGuidesModule: React.FC = () => {
  const { activePet } = usePets();
  const petName = activePet?.name || 'Tu Mascota';

  // Sincronización automática de especie
  const [selectedSpecies, setSelectedSpecies] = useState<'both' | 'dog' | 'cat'>(
    activePet?.type === 'cat' ? 'cat' : 'dog'
  );

  useEffect(() => {
    if (activePet?.type === 'cat') setSelectedSpecies('cat');
    else if (activePet?.type === 'dog') setSelectedSpecies('dog');
  }, [activePet?.type]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('dental-care');
  const [showEmergencyTriage, setShowEmergencyTriage] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Todos los Temas', icon: '🐾' },
    { id: 'dental', label: 'Dental & Sarro', icon: '🦷' },
    { id: 'bathing', label: 'Higiene & Baño', icon: '🛁' },
    { id: 'coat', label: 'Pelo & Manto', icon: '✨' },
    { id: 'fleas', label: 'Antiparasitarios', icon: '🧴' },
    { id: 'emergencies', label: 'Urgencias & Calor', icon: '🚨' },
    { id: 'nutrition', label: 'Nutrición & Etiquetas', icon: '🥣' }
  ];

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'emergencies') {
      setShowEmergencyTriage(true);
    }
  };

  const filteredDetailedGuides = useMemo(() => {
    return DETAILED_CARE_GUIDES.filter(guide => {
      if (selectedCategory !== 'all' && guide.category !== selectedCategory) {
        return false;
      }

      const q = normalizeText(searchQuery.trim());
      if (q) {
        const inTitle = normalizeText(guide.title).includes(q);
        const inSubtitle = normalizeText(guide.subtitle).includes(q);
        const inBadge = normalizeText(guide.badge).includes(q);
        const inDog = guide.dogSpecific.products.some(p => normalizeText(p).includes(q)) ||
          guide.dogSpecific.steps.some(s => normalizeText(s.title).includes(q) || normalizeText(s.desc).includes(q));
        const inCat = guide.catSpecific.products.some(p => normalizeText(p).includes(q)) ||
          guide.catSpecific.steps.some(s => normalizeText(s.title).includes(q) || normalizeText(s.desc).includes(q));

        if (!inTitle && !inSubtitle && !inBadge && !inDog && !inCat) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  const filteredNutritionGuides = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'nutrition') return [];

    const nonDuplicateGuides = HEALTH_AND_NUTRITION_GUIDES.filter(
      g => !normalizeText(g.title).includes('7 dias') && !normalizeText(g.title).includes('cambiar de alimento')
    );

    const q = normalizeText(searchQuery.trim());
    if (!q) return nonDuplicateGuides;

    return nonDuplicateGuides.filter(guide => {
      const inTitle = normalizeText(guide.title).includes(q);
      const inSubtitle = normalizeText(guide.subtitle).includes(q);
      return inTitle || inSubtitle;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      
      {/* 1. HERO VERDE INSTITUCIONAL 100% SIMÉTRICO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143826] via-[#1a4a32] to-[#123020] text-[#faf8f5] px-3.5 py-3 sm:px-6 sm:py-3.5 border border-[#2a5940] shadow-xs text-center flex flex-col items-center justify-center no-print">
        <div className="relative z-10 space-y-1 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-200/90 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Manual Clínico & Guías Preventivas</span>
          </div>
          <h1 className="text-sm sm:text-base font-editorial font-semibold tracking-tight text-white leading-tight">
            Guías Clínicas & <span className="font-editorial italic font-normal text-amber-300">Primeros Auxilios</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-emerald-100/80 leading-relaxed font-normal">
            Protocolos de salud, higiene y triaje para {petName} según pautas veterinarias FEDIAF.
          </p>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL CLÍNICA */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* Selector de Especie */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedSpecies('dog')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSpecies === 'dog'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>🐶</span>
              <span>Caninos</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpecies('cat')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSpecies === 'cat'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <span>🐱</span>
              <span>Felinos</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpecies('both')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSpecies === 'both'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Ambos
            </button>
          </div>

          {/* Buscador + Botón Triaje */}
          <div className="flex items-center gap-2 flex-1 sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar tema (sarro, baño, pulgas, calor)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowEmergencyTriage(!showEmergencyTriage)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-3xs active:scale-95 ${
                showEmergencyTriage
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="hidden sm:inline">{showEmergencyTriage ? 'Ocultar Triaje' : '🚨 Triaje Urgente'}</span>
              <span className="sm:hidden">{showEmergencyTriage ? 'Cerrar' : '🚨 Triaje'}</span>
            </button>
          </div>
        </div>

        {/* Chips de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-stone-100 dark:border-stone-800">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-3xs'
                  : 'bg-stone-50 text-stone-600 border-stone-200/80 hover:bg-stone-100 dark:bg-stone-800/80 dark:text-stone-300 dark:border-stone-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. PANEL DE TRIAJE DE URGENCIA (NÚMEROS A LA IZQUIERDA EN MÓVIL PARA RECUPERAR ESPACIO) */}
      {showEmergencyTriage && (
        <div className="bg-gradient-to-b from-rose-50/90 to-stone-50/90 dark:from-rose-950/30 dark:to-stone-900 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-3.5 sm:p-5 space-y-3.5 shadow-2xs animate-fade-in no-print">
          
          <div className="text-center space-y-1 border-b border-rose-200/80 dark:border-rose-900/40 pb-2.5">
            <div className="inline-flex items-center gap-1.5 text-[9.5px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Protocolo Clínico • Riesgo Vital</span>
            </div>
            <h3 className="font-heading font-black text-rose-950 dark:text-rose-100 text-sm sm:text-base">
              ¿Cómo actuar ante un Golpe de Calor? (Temperatura &gt; 40°C)
            </h3>
            <p className="text-[10.5px] sm:text-[11px] text-stone-600 dark:text-stone-300 max-w-lg mx-auto">
              Secuencia obligatoria de rescate térmico mientras te diriges a urgencias veterinarias.
            </p>
          </div>

          {/* Secuencia inteligente: EN MÓVIL EL NÚMERO VA A LA IZQUIERDA, EN PC EN COLUMNA CENTRADA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
            
            {/* Paso 1 */}
            <div className="bg-white dark:bg-stone-850 p-2.5 sm:p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/50 flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-2.5 lg:gap-1.5 shadow-3xs">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                1
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-stone-900 dark:text-stone-100 font-bold text-[11.5px] leading-tight">
                  Sombra Inmediata
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-snug mt-0.5">
                  Retirar del sol a un área ventilada o climatizada.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="bg-white dark:bg-stone-850 p-2.5 sm:p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/50 flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-2.5 lg:gap-1.5 shadow-3xs">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                2
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-stone-900 dark:text-stone-100 font-bold text-[11.5px] leading-tight">
                  Agua Fresca
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-snug mt-0.5">
                  Mojar cuello, axilas e ingles. <strong>¡NUNCA hielo!</strong> Causa colapso.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-white dark:bg-stone-850 p-2.5 sm:p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/50 flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-2.5 lg:gap-1.5 shadow-3xs">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                3
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-stone-900 dark:text-stone-100 font-bold text-[11.5px] leading-tight">
                  Ventilación
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-snug mt-0.5">
                  Colocar toalla húmeda y abanicar para disipar calor.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="bg-white dark:bg-stone-850 p-2.5 sm:p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/50 flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-2.5 lg:gap-1.5 shadow-3xs">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                4
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-stone-900 dark:text-stone-100 font-bold text-[11.5px] leading-tight">
                  Hidratación Leve
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-snug mt-0.5">
                  Sorbos pequeños si traga voluntariamente. No forzar.
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="bg-white dark:bg-stone-850 p-2.5 sm:p-3 rounded-xl border border-rose-300 dark:border-rose-900 flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-2.5 lg:gap-1.5 shadow-3xs">
              <span className="w-6 h-6 rounded-full bg-rose-700 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 shadow-xs">
                5
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-rose-900 dark:text-rose-200 font-bold text-[11.5px] leading-tight">
                  Traslado Urgente
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-snug mt-0.5">
                  Llevar al hospital veterinario con auto climatizado.
                </p>
              </div>
            </div>

          </div>

          {/* Alerta de Medicamentos */}
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-rose-200/90 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-950 dark:text-rose-200">
            <Pill className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[10.5px] sm:text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
              <strong className="text-rose-900 dark:text-rose-200 font-bold">ALERTA TOXICOLÓGICA VITAL:</strong> Jamás suministres paracetamol, acetaminofén, ibuprofeno ni aspirina humana a tu perro o gato. Causan fallo hepático fulminante con dosis mínimas. Ante cualquier sospecha, acude de inmediato a urgencias.
            </p>
          </div>
        </div>
      )}

      {/* 4. LISTA DE GUÍAS CLÍNICAS (100% ANCHO ÚTIL EN 3 COLUMNAS) */}
      <div className="space-y-3.5">
        {filteredDetailedGuides.map(guide => {
          const isExpanded = expandedGuideId === guide.id;
          const isDogView = selectedSpecies === 'dog' || selectedSpecies === 'both';
          const isCatView = selectedSpecies === 'cat' || selectedSpecies === 'both';

          return (
            <div
              key={guide.id}
              className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all"
            >
              {/* Encabezado de la Guía */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${guide.badgeColor}`}>
                      {guide.badge}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      Frecuencia: <strong className="text-stone-800 dark:text-stone-200">{guide.frequency}</strong>
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {guide.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <span>{isExpanded ? 'Ver menos' : 'Ver protocolo'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Protocolo Expandido */}
              {isExpanded && (
                <div className="space-y-3.5 animate-fade-in pt-1">
                  
                  {isDogView && (
                    <div className="bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-900/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🐶</span>
                          <h4 className="font-heading font-extrabold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                            Protocolo Canino • {petName}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                          {guide.dogSpecific.frequency}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        
                        <div className="md:col-span-4 bg-white dark:bg-stone-850 p-3 rounded-xl border border-stone-200/80 dark:border-stone-750 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                            ✅ ¿Qué productos usar?
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                            {guide.dogSpecific.products.map((prod, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span>{prod}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="md:col-span-5 bg-white dark:bg-stone-850 p-3 rounded-xl border border-stone-200/80 dark:border-stone-750 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                            📋 Paso a Paso de Aplicación
                          </span>
                          <div className="space-y-1.5 text-xs">
                            {guide.dogSpecific.steps.map((step, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 space-y-0.5">
                                <strong className="text-stone-900 dark:text-stone-100 font-bold block text-[11px] font-heading">{step.title}</strong>
                                <p className="text-stone-600 dark:text-stone-300 text-[10.5px] leading-relaxed">{step.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-3 bg-red-50/80 dark:bg-red-950/40 p-3 rounded-xl border border-red-200/80 dark:border-red-900/50 space-y-1.5 text-red-950 dark:text-red-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-800 dark:text-red-300 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            Lo que NUNCA debes hacer:
                          </span>
                          <ul className="space-y-1 text-[10.5px] list-disc list-inside leading-snug">
                            {guide.dogSpecific.donts.map((d, idx) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                  {isCatView && (
                    <div className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-200/50 dark:border-indigo-900/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🐱</span>
                          <h4 className="font-heading font-extrabold text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm">
                            Protocolo Felino
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {guide.catSpecific.frequency}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        <div className="md:col-span-4 bg-white dark:bg-stone-850 p-3 rounded-xl border border-stone-200/80 dark:border-stone-750 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block">
                            ✅ ¿Qué productos usar?
                          </span>
                          <ul className="space-y-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                            {guide.catSpecific.products.map((prod, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                <span>{prod}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="md:col-span-5 bg-white dark:bg-stone-850 p-3 rounded-xl border border-stone-200/80 dark:border-stone-750 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block">
                            📋 Paso a Paso de Aplicación
                          </span>
                          <div className="space-y-1.5 text-xs">
                            {guide.catSpecific.steps.map((step, idx) => (
                              <div key={idx} className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 space-y-0.5">
                                <strong className="text-stone-900 dark:text-stone-100 font-bold block text-[11px] font-heading">{step.title}</strong>
                                <p className="text-stone-600 dark:text-stone-300 text-[10.5px] leading-relaxed">{step.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-3 bg-red-50/80 dark:bg-red-950/40 p-3 rounded-xl border border-red-200/80 dark:border-red-900/50 space-y-1.5 text-red-950 dark:text-red-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-800 dark:text-red-300 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            Lo que NUNCA debes hacer:
                          </span>
                          <ul className="space-y-1 text-[10.5px] list-disc list-inside leading-snug">
                            {guide.catSpecific.donts.map((d, idx) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resúmenes Clave */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                    {guide.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/70 dark:border-stone-800 space-y-0.5">
                        <strong className="text-stone-900 dark:text-stone-100 font-bold block text-[11px]">{takeaway.title}</strong>
                        <p className="text-stone-500 dark:text-stone-400 text-[10.5px] leading-relaxed">{takeaway.desc}</p>
                      </div>
                    ))}
                  </div>

                  {guide.warningNote && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <strong>Recomendación Veterinaria:</strong> {guide.warningNote}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. GUÍAS NUTRICIONALES & HÁBITOS DIGESTIVOS (REDISEÑO BENTO LLAMATIVO Y ELEGANTE) */}
      {filteredNutritionGuides.length > 0 && (
        <div className="space-y-3.5 pt-3">
          
          {/* Cabecera de Sección Estilizada */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-tight">
                  Guías Nutricionales & Hábitos Digestivos
                </h3>
                <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                  Criterios veterinarios para seleccionar alimento y prevenir accidentes digestivos
                </p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              AAFCO • FEDIAF
            </span>
          </div>

          {/* Cuadrícula Bento Nutricional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {filteredNutritionGuides.map(guide => {
              const isLabelGuide = normalizeText(guide.title).includes('etiqueta');

              return (
                <div 
                  key={guide.id} 
                  className={`bg-white dark:bg-stone-900 border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isLabelGuide 
                      ? 'border-emerald-200/90 dark:border-emerald-800/60 hover:border-emerald-300' 
                      : 'border-amber-200/90 dark:border-amber-800/60 hover:border-amber-300'
                  }`}
                >
                  {/* Borde Superior de Acento Visual */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    isLabelGuide ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                  }`} />

                  <div className="space-y-2.5">
                    
                    {/* Fila Superior: Badges y Acreditación */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                        isLabelGuide
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800'
                      }`}>
                        {isLabelGuide ? <Tag className="w-3 h-3 text-emerald-600" /> : <ShieldCheck className="w-3 h-3 text-amber-600" />}
                        <span>{guide.badge}</span>
                      </span>

                      <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        Nutrición Segura
                      </span>
                    </div>

                    {/* Título y Subtítulo */}
                    <div>
                      <h4 className="font-heading font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug">
                        {guide.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                        {guide.subtitle}
                      </p>
                    </div>

                    {/* Puntos Clave: Cápsulas Llamativas con Numeración y Color */}
                    <div className="space-y-2 pt-1">
                      {guide.keyPoints.map((point, index) => (
                        <div 
                          key={index} 
                          className={`p-2.5 rounded-xl border transition-all space-y-1 ${
                            isLabelGuide
                              ? 'bg-emerald-50/30 dark:bg-stone-850 border-emerald-100/80 dark:border-stone-800 hover:bg-emerald-50/60'
                              : 'bg-amber-50/30 dark:bg-stone-850 border-amber-100/80 dark:border-stone-800 hover:bg-amber-50/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                              isLabelGuide 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-amber-600 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-stone-900 dark:text-stone-100 font-heading">
                              {point.title}
                            </span>
                          </div>

                          <p className="text-[10.5px] text-stone-600 dark:text-stone-300 leading-relaxed pl-5">
                            {point.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Advertencia Veterinaria al Pie de la Tarjeta si existe */}
                  {guide.warningNote && (
                    <div className="p-2.5 mt-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[10.5px] text-amber-900 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Pauta de Prevención:</strong> {guide.warningNote}
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Estado Vacío */}
      {filteredDetailedGuides.length === 0 && filteredNutritionGuides.length === 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center space-y-2.5 shadow-2xs">
          <div className="text-2xl">🔍</div>
          <h4 className="font-heading font-black text-stone-900 dark:text-stone-100 text-sm">
            Sin resultados para &ldquo;{searchQuery}&rdquo;
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            Prueba buscando por "sarro", "shampoo", "calor", "pulgas" o restablece los filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      )}

    </div>
  );
};