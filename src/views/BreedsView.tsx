import React from 'react';
import { BreedEncyclopedia } from '../components/BreedEncyclopedia';

interface BreedsViewProps {
  onSelectBreedForCalculation: (type: 'dog' | 'cat', breedId: string) => void;
}

export const BreedsView: React.FC<BreedsViewProps> = ({ onSelectBreedForCalculation }) => {
  return (
    <div className="space-y-6">
      <BreedEncyclopedia onSelectBreedForCalculation={onSelectBreedForCalculation} />
    </div>
  );
};