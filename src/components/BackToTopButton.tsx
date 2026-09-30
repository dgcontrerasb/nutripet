import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Volver arriba"
      aria-label="Volver arriba"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl hover:shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/25 backdrop-blur-md flex items-center justify-center group cursor-pointer animate-fade-in no-print"
    >
      <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
