import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = startValue + (endValue - startValue) * easedProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toString();

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};
