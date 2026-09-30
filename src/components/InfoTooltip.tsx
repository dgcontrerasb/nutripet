import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  title?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, title, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside (important for mobile taps)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center align-middle" ref={containerRef}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        onMouseLeave={() => setIsOpen(false)}
        className={`text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 transition-colors inline-flex cursor-pointer ml-1 focus:outline-hidden ${className}`}
        aria-label="Más información"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </span>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 bg-stone-900 text-stone-100 dark:bg-stone-800 dark:text-stone-200 text-xs rounded-xl p-2.5 shadow-xl border border-stone-700/60 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          {title && <h5 className="font-bold text-emerald-400 mb-1">{title}</h5>}
          <p className="leading-relaxed text-[11px] font-normal">{text}</p>
          {/* Triángulo inferior decorativo */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900 dark:border-t-stone-800" />
        </div>
      )}
    </div>
  );
};
