import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleButtonProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <button
      type="button"
      onClick={onToggleDarkMode}
      title={darkMode ? 'Cambiar a modo claro ☀️' : 'Cambiar a modo oscuro 🌙'}
      aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-850 text-stone-800 dark:text-stone-100 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-stone-200/90 dark:border-stone-700/80 backdrop-blur-md flex items-center gap-2 group cursor-pointer no-print ring-1 ring-black/5 dark:ring-white/10"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {darkMode ? (
          <Sun className="w-5 h-5 text-amber-400 animate-spin-slow transition-transform" />
        ) : (
          <Moon className="w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform group-hover:-rotate-12" />
        )}
      </div>
      <span className="text-xs font-bold hidden sm:inline-block pr-1 select-none text-stone-700 dark:text-stone-200">
        {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
    </button>
  );
};
