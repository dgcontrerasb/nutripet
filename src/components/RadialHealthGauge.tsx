import React from 'react';

interface RadialHealthGaugeProps {
  value: number; // Porcentaje actual (0 a 100)
  size?: number; // Ancho/Alto en px (por defecto 80)
  strokeWidth?: number; // Ancho del trazo (por defecto 8)
  label: string; // Título o concepto (ej: "Hidratación", "Meta Peso")
  sublabel?: string; // Valor formateado central (ej: "850 ml", "14.5 kg")
  statusText?: string; // Texto de estado (ej: "Óptimo", "En Meta")
  colorScheme?: 'forest' | 'amber' | 'blue' | 'rose';
  className?: string;
}

export const RadialHealthGauge: React.FC<RadialHealthGaugeProps> = ({
  value,
  size = 84,
  strokeWidth = 7,
  label,
  sublabel,
  statusText,
  colorScheme = 'forest',
  className = ''
}) => {
  // Limitar porcentaje entre 0 y 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const colorMap = {
    forest: {
      stroke: '#143826',
      darkStroke: '#3f6e58',
      bgStroke: 'rgba(20, 56, 38, 0.12)',
      darkBgStroke: 'rgba(63, 110, 88, 0.2)',
      badgeBg: 'bg-[#143826]/10 text-[#143826] dark:bg-[#3f6e58]/30 dark:text-emerald-300'
    },
    amber: {
      stroke: '#b4833e',
      darkStroke: '#c89b53',
      bgStroke: 'rgba(180, 131, 62, 0.12)',
      darkBgStroke: 'rgba(200, 155, 83, 0.2)',
      badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
    },
    blue: {
      stroke: '#2563eb',
      darkStroke: '#60a5fa',
      bgStroke: 'rgba(37, 99, 235, 0.12)',
      darkBgStroke: 'rgba(96, 165, 250, 0.2)',
      badgeBg: 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
    },
    rose: {
      stroke: '#e11d48',
      darkStroke: '#fb7185',
      bgStroke: 'rgba(225, 29, 72, 0.12)',
      darkBgStroke: 'rgba(251, 113, 133, 0.2)',
      badgeBg: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300'
    }
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className={`p-3.5 rounded-xl bg-white dark:bg-[#1a231d] border border-stone-200/80 dark:border-stone-800 shadow-2xs flex items-center gap-3.5 select-none ${className}`}>
      {/* SVG Anillo Radial */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Circulo de Fondo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-stone-200 dark:text-stone-800"
          />
          {/* Circulo de Progreso Animado */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Porcentaje Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold font-tabular text-stone-900 dark:text-stone-100">
            {Math.round(clampedValue)}%
          </span>
        </div>
      </div>

      {/* Información Lateral */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block truncate">
          {label}
        </span>
        {sublabel && (
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-tabular block truncate">
            {sublabel}
          </span>
        )}
        {statusText && (
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${scheme.badgeBg}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};
