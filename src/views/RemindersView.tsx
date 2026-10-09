import React from 'react';
import { RemindersModule } from '../components/RemindersModule';

interface RemindersViewProps {
  onOpenSubscriptionModal: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="space-y-6">
      <RemindersModule onOpenSubscriptionModal={onOpenSubscriptionModal} />
    </div>
  );
};