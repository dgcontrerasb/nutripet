import React from 'react';


interface NutriPetLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}


export const NutriPetLogo: React.FC<NutriPetLogoProps> = ({ 
  className = "", 
  size = 'md'
}) => {
  // Tamaños aumentados para mayor visibilidad
  const sizeMap = {
    xs: { height: "h-8", width: "w-auto" },           // Antes: h-6
    sm: { height: "h-12 sm:h-14", width: "w-auto" },  // Antes: h-8 sm:h-9
    md: { height: "h-16 sm:h-20", width: "w-auto" },  // Antes: h-10 sm:h-12
    lg: { height: "h-20 sm:h-24", width: "w-auto" },  // Antes: h-14 sm:h-18
    xl: { height: "h-24 sm:h-32", width: "w-auto" }   // Antes: h-20 sm:h-28
  };


  const selectedSize = sizeMap[size];


  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="NutriPet"
        className={`${selectedSize.height} ${selectedSize.width} object-contain select-none drop-shadow-lg`}
        loading="eager"
      />
    </div>
  );
};


export const NutriPetIcon: React.FC<NutriPetLogoProps> = (props) => {
  return <NutriPetLogo {...props} />;
};