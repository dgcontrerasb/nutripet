import React from 'react';
import { BarfRecipeGenerator } from '../components/BarfRecipeGenerator';

interface RecipesViewProps {
  onOpenSubscriptionModal: () => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="space-y-6">
      <BarfRecipeGenerator onOpenSubscriptionModal={onOpenSubscriptionModal} />
    </div>
  );
};