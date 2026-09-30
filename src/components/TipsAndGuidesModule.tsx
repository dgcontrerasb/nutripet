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
  RotateCcw 
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

  // Selected species filter: defaults to activePet's type, or 'both'
  const [selectedSpecies, setSelectedSpecies] = useState<'both' | 'dog' | 'cat'>(
    activePet?.type === 'cat' ? 'cat' : activePet?.type === 'dog' ? 'dog' : 'both'
  );

  // 3. Reactividad con la mascota activa
  useEffect(() => {
    if (activePet?.type === 'dog') {
      setSelectedSpecies('dog');
    } else if (activePet?.type === 'cat') {
      setSelectedSpecies('cat');
    } else {
      setSelectedSpecies('both');
    }
  }, [activePet?.type]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('dental-care');

  const categories = [
    { id: 'all', label: 'Todos los Temas', icon: '🐾' },
    { id: 'dental', label: 'Cuidado Dental & Sarro', icon: '🦷' },
    { id: 'bathing', label: 'Frecuencia & Baño', icon: '🛁' },
    { id: 'coat', label: 'Pelo & Brillo', icon: '✨' },
    { id: 'fleas', label: 'Pulgas & Antiparasitarios', icon: '🧴' },
    { id: 'emergencies', label: 'Golpe de Calor & Urgencias', icon: '🚨' },
    { id: 'nutrition', label: 'Nutrición & Etiquetas', icon: '🥣' }
  ];

  // 2. Filtrado de guías detalladas con normalización insensible a tildes y diacríticos
  const filteredDetailedGuides = useMemo(() => {
    return DETAILED_CARE_GUIDES.filter(guide => {
      // Category filter
      if (selectedCategory !== 'all' && guide.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      const q = normalizeText(searchQuery.trim());
      if (q) {
        const inTitle = normalizeText(guide.title).includes(q);
        const inSubtitle = normalizeText(guide.subtitle).includes(q);
        const inBadge = normalizeText(guide.badge).includes(q);
        const inDog =
          guide.dogSpecific.products.some(p => normalizeText(p).includes(q)) ||
          guide.dogSpecific.steps.some(
            s => normalizeText(s.title).includes(q) || normalizeText(s.desc).includes(q)
          ) ||
          guide.dogSpecific.donts.some(d => normalizeText(d).includes(q));
        const inCat =
          guide.catSpecific.products.some(p => normalizeText(p).includes(q)) ||
          guide.catSpecific.steps.some(
            s => normalizeText(s.title).includes(q) || normalizeText(s.desc).includes(q)
          ) ||
          guide.catSpecific.donts.some(d => normalizeText(d).includes(q));
        const inTakeaways = guide.keyTakeaways.some(
          t => normalizeText(t.title).includes(q) || normalizeText(t.desc).includes(q)
        );
        const inWarning = guide.warningNote ? normalizeText(guide.warningNote).includes(q) : false;

        if (!inTitle && !inSubtitle && !inBadge && !inDog && !inCat && !inTakeaways && !inWarning) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  // 2. Filtrado de guías de nutrición con normalización
  const filteredNutritionGuides = useMemo(() => {
    if (selectedCategory !== 'all' && selectedCategory !== 'nutrition') {
      return [];
    }
    const q = normalizeText(searchQuery.trim());
    if (!q) return HEALTH_AND_NUTRITION_GUIDES;

    return HEALTH_AND_NUTRITION_GUIDES.filter(guide => {
      const inTitle = normalizeText(guide.title).includes(q);
      const inSubtitle = normalizeText(guide.subtitle).includes(q);
      const inBadge = normalizeText(guide.badge).includes(q);
      const inPoints = guide.keyPoints.some(
        pt => normalizeText(pt.title).includes(q) || normalizeText(pt.desc).includes(q)
      );
      const inWarning = guide.warningNote ? normalizeText(guide.warningNote).includes(q) : false;
      return inTitle || inSubtitle || inBadge || inPoints || inWarning;
    });
  }, [selectedCategory, searchQuery]);

  const showNutritionGuides = filteredNutritionGuides.length > 0;

  // Detección de emergencia en búsqueda
  const isEmergencySearched = useMemo(() => {
    const q = normalizeText(searchQuery.trim());
    return (
      q.includes('calor') ||
      q.includes('emerg') ||
      q.includes('termic') ||
      q.includes('urgenc') ||
      q.includes('temperatura')
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden text-center flex flex-col items-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Manual de Cuidados & Primeros Auxilios
            </span>
            {activePet && (
              <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-stone-300">
                Sugerencias para: <strong className="text-white">{activePet.name} ({activePet.type === 'cat' ? 'Gato' : 'Perro'})</strong>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight text-white text-center">
            Guías Clínicas y Consejos para Perros & Gatos
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl text-center">
            Protocolos paso a paso sobre higiene dental, frecuencia y productos de baño, cuidado del pelaje, control de pulgas y actuación inmediata ante golpes de calor e intoxicaciones.
          </p>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 w-full">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-stone-400 block font-bold">🦷 Cepillado Dental</span>
              <span className="text-sm font-extrabold text-white">2-3 veces/semana</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-stone-400 block font-bold">🛁 Frecuencia Baño</span>
              <span className="text-sm font-extrabold text-white">Perros: 3-6 semanas</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-stone-400 block font-bold">🧴 Antiparasitarios</span>
              <span className="text-sm font-extrabold text-white">Cada 1 a 3 meses</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-stone-400 block font-bold">☀️ Golpe de Calor</span>
              <span className="text-sm font-extrabold text-amber-300">Agua FRESCA (No hielo)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. BANNER DE RESPONSABILIDAD MÉDICA Y PREVENCIÓN DE ENVENENAMIENTOS */}
      <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-900/60 shadow-xs space-y-3 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-black text-red-950 dark:text-red-200 text-sm">
              🚨 ADVERTENCIA DE SEGURIDAD CLÍNICA IMPORTANTE
            </h4>
            <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
              Las guías y consejos presentados en esta sección son recursos de soporte temporal y carácter estrictamente <strong>educativo e informativo</strong>. Bajo ninguna circunstancia reemplazan la atención de un centro de urgencias o médico veterinario certificado.
            </p>
          </div>
        </div>
        <p className="text-[11px] text-red-900 dark:text-red-200 bg-white/80 dark:bg-stone-850 p-3 rounded-xl border border-red-100 dark:border-red-900/50 font-extrabold leading-normal">
          ⚠️ NUNCA SUMINISTRES MEDICAMENTOS DE USO HUMANO (como acetaminofén/paracetamol, ibuprofeno, aspirina o diclofenaco) a tu perro o gato. Estos componentes son altamente hepatotóxicos, causan úlceras gástricas severas, destrucción de glóbulos rojos y pueden provocar la muerte fulminante del animal con una sola dosis. Ante cualquier síntoma de malestar o sospecha de intoxicación, acude de inmediato a urgencias veterinarias.
        </p>
      </div>

      {/* 1. BARRA DE CONTROL: Especies, Búsqueda y Categorías */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Species Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl self-start">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 px-2 hidden sm:inline">Especie:</span>
            <button
              type="button"
              onClick={() => setSelectedSpecies('both')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSpecies === 'both'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>🐾</span>
              <span>Perros & Gatos</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpecies('dog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSpecies === 'dog'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>🐶</span>
              <span>Solo Perros</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpecies('cat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSpecies === 'cat'
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>🐱</span>
              <span>Solo Gatos</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tema (ej. shampoo, golpe de calor, sarro, malta, pulgas)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs p-1 cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-100 dark:bg-stone-800/80 dark:text-stone-300 dark:border-stone-700 dark:hover:bg-stone-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. EMERGENCY HIGHLIGHT BANNER: GOLPE DE CALOR */}
      {(selectedCategory === 'emergencies' || selectedCategory === 'all' || isEmergencySearched) && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-900/60 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 dark:border-red-900/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800/60 inline-block">
                  Atención Rápida • Primeros Auxilios
                </span>
                <h3 className="font-heading font-extrabold text-red-950 dark:text-red-200 text-base sm:text-lg">
                  ¿Cómo actuar ante un Golpe de Calor o Emergencia Térmica?
                </h3>
              </div>
            </div>
            <span className="text-xs font-extrabold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-xl self-start sm:self-center border border-red-200 dark:border-red-800/60">
              🚨 Temperatura &gt; 40°C = Urgencia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="bg-white dark:bg-stone-800/90 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-xs">1</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-heading">Sombra Inmediata</strong>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                Mueve a la mascota de inmediato a un lugar con sombra, ventilador o aire acondicionado.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-800/90 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-xs">2</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-heading">Agua Fresca (NO Hielo)</strong>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                Moja almohadillas, axilas, cuello e ingle con agua fresca o templada. <strong>¡El hielo causa colapso circulatorio!</strong>
              </p>
            </div>

            <div className="bg-white dark:bg-stone-800/90 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-xs">3</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-heading">Ventilación Activa</strong>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                Coloca toallas húmedas sobre su cuerpo y abanica suavemente para favorecer la evaporación térmica.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-800/90 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-xs">4</span>
              <strong className="block text-stone-900 dark:text-stone-100 font-heading">Hidratación Suave</strong>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                Ofrece pequeños sorbos de agua fresca sin forzar. Si no quiere o no puede tragar, no le obligues.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-800/90 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-1">
              <span className="w-6 h-6 rounded-full bg-red-800 text-white font-extrabold flex items-center justify-center text-xs">5</span>
              <strong className="block text-red-900 dark:text-red-200 font-heading">Traslado Clínico Urgente</strong>
              <p className="text-red-700 dark:text-red-300 text-[11px] leading-relaxed">
                Llévalo de inmediato al veterinario con el aire acondicionado del auto encendido.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED GUIDES LIST */}
      <div className="space-y-6">
        {filteredDetailedGuides.map(guide => {
          const isExpanded = expandedGuideId === guide.id;

          return (
            <div
              key={guide.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 transition-all hover:border-stone-300 dark:hover:border-stone-700"
            >
              {/* Top Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${guide.badgeColor}`}>
                      {guide.badge}
                    </span>
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                      Frecuencia: <strong className="text-stone-800 dark:text-stone-200">{guide.frequency}</strong>
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-stone-900 dark:text-stone-100 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    {guide.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>{isExpanded ? 'Ver menos' : 'Ver guía completa'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* DOGS VS CATS DUAL PANELS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* DOG PANEL */}
                {(selectedSpecies === 'both' || selectedSpecies === 'dog') && (
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-stone-800 dark:text-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐶</span>
                        <h4 className="font-heading font-extrabold text-amber-950 dark:text-amber-200 text-sm sm:text-base">
                          Protocolo para Perros
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-800/60 px-2.5 py-0.5 rounded-md">
                        {guide.dogSpecific.frequency}
                      </span>
                    </div>

                    {/* Products recommended */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-300 block">
                        ✅ ¿Qué productos usar?
                      </span>
                      <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                        {guide.dogSpecific.products.map((prod, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 pt-1 border-t border-amber-200/40 dark:border-amber-900/40">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-300 block">
                        📋 Paso a Paso de Aplicación:
                      </span>
                      <div className="space-y-2 text-xs">
                        {guide.dogSpecific.steps.map((step, idx) => (
                          <div key={idx} className="bg-white dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-0.5">
                            <strong className="text-stone-900 dark:text-stone-100 font-semibold block font-heading">{step.title}</strong>
                            <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Don'ts */}
                    <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200/80 dark:border-red-900/50 space-y-1 text-xs text-red-900 dark:text-red-200">
                      <span className="text-[11px] font-extrabold uppercase text-red-800 dark:text-red-300 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Lo que NUNCA debes hacer:
                      </span>
                      <ul className="space-y-1 text-[11px] list-disc list-inside">
                        {guide.dogSpecific.donts.map((d, idx) => (
                          <li key={idx} className="leading-snug">{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* CAT PANEL */}
                {(selectedSpecies === 'both' || selectedSpecies === 'cat') && (
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 text-stone-800 dark:text-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐱</span>
                        <h4 className="font-heading font-extrabold text-indigo-950 dark:text-indigo-200 text-sm sm:text-base">
                          Protocolo para Gatos
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                        {guide.catSpecific.frequency}
                      </span>
                    </div>

                    {/* Products recommended */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-300 block">
                        ✅ ¿Qué productos usar?
                      </span>
                      <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                        {guide.catSpecific.products.map((prod, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 pt-1 border-t border-indigo-200/40 dark:border-indigo-900/40">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-300 block">
                        📋 Paso a Paso de Aplicación:
                      </span>
                      <div className="space-y-2 text-xs">
                        {guide.catSpecific.steps.map((step, idx) => (
                          <div key={idx} className="bg-white dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-0.5">
                            <strong className="text-stone-900 dark:text-stone-100 font-semibold block font-heading">{step.title}</strong>
                            <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Don'ts */}
                    <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200/80 dark:border-red-900/50 space-y-1 text-xs text-red-900 dark:text-red-200">
                      <span className="text-[11px] font-extrabold uppercase text-red-800 dark:text-red-300 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Lo que NUNCA debes hacer:
                      </span>
                      <ul className="space-y-1 text-[11px] list-disc list-inside">
                        {guide.catSpecific.donts.map((d, idx) => (
                          <li key={idx} className="leading-snug">{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* KEY TAKEAWAYS & WARNING NOTE */}
              {isExpanded && (
                <div className="space-y-4 pt-3 border-t border-stone-100 dark:border-stone-800 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {guide.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 space-y-1 text-xs">
                        <strong className="text-stone-900 dark:text-stone-100 font-heading block">{takeaway.title}</strong>
                        <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">{takeaway.desc}</p>
                      </div>
                    ))}
                  </div>

                  {guide.warningNote && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">
                        <strong>Recomendación Profesional:</strong> {guide.warningNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* NUTRITION & ETIQUETAS SECTION */}
        {showNutritionGuides && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
              <span className="text-lg">🥣</span>
              <h3 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-lg sm:text-xl">
                Guías de Nutrición, Etiquetas y Hábitos Digestivos
              </h3>
            </div>

            <div className="space-y-4">
              {filteredNutritionGuides.map(guide => (
                <div key={guide.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-7 shadow-xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/60 inline-block">
                        {guide.badge}
                      </span>
                      <h3 className="font-heading font-extrabold text-base sm:text-xl text-stone-900 dark:text-stone-100 mt-1.5 leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">{guide.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {guide.keyPoints.map((point, index) => (
                      <div key={index} className="p-3 sm:p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/70 space-y-1">
                        <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100 block font-heading">
                          {point.title}
                        </span>
                        <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          {point.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {guide.warningNote && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px] sm:text-xs">
                        <strong>Nota importante:</strong> {guide.warningNote}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío cuando no hay resultados */}
        {filteredDetailedGuides.length === 0 && !showNutritionGuides && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h4 className="font-heading font-extrabold text-stone-900 dark:text-stone-100 text-base">
              No se encontraron guías con el término &ldquo;{searchQuery}&rdquo;
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Prueba buscando por "dientes", "shampoo", "calor", "pulgas", "bravecto", "omega" o cambia el filtro de especie.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSpecies(activePet?.type === 'cat' ? 'cat' : activePet?.type === 'dog' ? 'dog' : 'both');
              }}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
