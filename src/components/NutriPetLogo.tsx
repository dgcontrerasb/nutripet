import React from 'react';

interface NutriPetLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const NutriPetLogo: React.FC<NutriPetLogoProps> = ({ 
  className = "", 
  size = 'md'
}) => {
  const sizeMap = {
    xs: {
      dogBox: "h-8 w-[27px]",
      gap: "gap-1.5",
      text: "text-base",
      otb: "text-[7px] tracking-[0.2em]",
      line: "w-2",
      otbGap: "gap-1",
    },
    sm: {
      dogBox: "h-11 sm:h-12 w-[37px] sm:w-[40px]",
      gap: "gap-2",
      text: "text-xl sm:text-2xl",
      otb: "text-[8px] sm:text-[9px] tracking-[0.22em]",
      line: "w-2.5 sm:w-3",
      otbGap: "gap-1.5",
    },
    md: {
      dogBox: "h-14 sm:h-16 w-[47px] sm:w-[54px]",
      gap: "gap-2.5",
      text: "text-2xl sm:text-3xl",
      otb: "text-[9.5px] sm:text-[10.5px] tracking-[0.22em]",
      line: "w-3.5 sm:w-4",
      otbGap: "gap-1.5",
    },
    lg: {
      dogBox: "h-18 sm:h-20 w-[60px] sm:w-[67px]",
      gap: "gap-3",
      text: "text-3xl sm:text-4xl",
      otb: "text-[11px] sm:text-xs tracking-[0.24em]",
      line: "w-4 sm:w-5",
      otbGap: "gap-2",
    },
    xl: {
      dogBox: "h-22 sm:h-28 w-[74px] sm:w-[94px]",
      gap: "gap-3.5",
      text: "text-4xl sm:text-5xl",
      otb: "text-xs sm:text-sm tracking-[0.25em]",
      line: "w-5 sm:w-6",
      otbGap: "gap-2",
    },
  };

  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${s.gap} ${className}`}>
      <div className={`relative overflow-hidden shrink-0 ${s.dogBox}`}>
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="h-full w-auto max-w-none -translate-x-[9.5%] select-none dark:invert dark:brightness-95"
          loading="eager"
        />
      </div>

      <div className="flex flex-col items-end leading-none">
        <span className={`font-heading font-black tracking-tight leading-none ${s.text}`}>
          <span className="text-stone-900 dark:text-stone-100">Nutri</span>
          <span className="text-[#0c9964]">Pet</span>
        </span>
        <span className={`mt-0.5 inline-flex items-center font-mono font-bold uppercase text-stone-600 dark:text-stone-400 leading-none ${s.otbGap} ${s.otb}`}>
          <span className={`h-px bg-stone-400 dark:bg-stone-500 shrink-0 ${s.line}`} aria-hidden="true" />
          <span>OTB</span>
          <span className={`h-px bg-stone-400 dark:bg-stone-500 shrink-0 ${s.line}`} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

export const NutriPetIcon: React.FC<NutriPetLogoProps> = (props) => {
  return <NutriPetLogo {...props} />;
};