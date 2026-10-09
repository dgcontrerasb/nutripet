import React from 'react';
import { PetTechSheet } from '../components/PetTechSheet';

interface PetSheetViewProps {
  onOpenSubscriptionModal: () => void;
}

export const PetSheetView: React.FC<PetSheetViewProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="space-y-6">
      <PetTechSheet onOpenSubscriptionModal={onOpenSubscriptionModal} />
    </div>
  );
};