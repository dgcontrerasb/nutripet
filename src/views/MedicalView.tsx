import React from 'react';
import { MedicalHistory } from '../components/MedicalHistory';

interface MedicalViewProps {
  onOpenSubscriptionModal: () => void;
}

export const MedicalView: React.FC<MedicalViewProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="space-y-6">
      <MedicalHistory onOpenSubscriptionModal={onOpenSubscriptionModal} />
    </div>
  );
};