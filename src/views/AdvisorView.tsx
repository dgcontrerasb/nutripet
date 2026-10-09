import React from 'react';
import { CountryFoodAdvisor } from '../components/CountryFoodAdvisor';

interface AdvisorViewProps {
  onOpenSubscriptionModal: () => void;
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="space-y-6">
      <CountryFoodAdvisor onOpenSubscriptionModal={onOpenSubscriptionModal} />
    </div>
  );
};