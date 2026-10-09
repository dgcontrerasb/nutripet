import React from 'react';
import { PetProfile, CalculationResult } from '../types';
import { RoutineSchedule } from '../components/RoutineSchedule';

interface RoutineViewProps {
  profile: PetProfile;
  result: CalculationResult;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ profile, result }) => {
  return (
    <div className="space-y-6">
      <RoutineSchedule profile={profile} result={result} />
    </div>
  );
};