import React from 'react';
import { FoodTrafficLight } from '../components/FoodTrafficLight';

export const FoodsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <FoodTrafficLight />
    </div>
  );
};