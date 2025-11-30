'use client';

import { useEffect, useState, useRef } from 'react';

interface CountingNumberProps {
  targetValue: number;
  duration?: number;
  className?: string;
  startOnViewportEnter?: boolean;
}

export function CountingNumber({
  targetValue,
  duration = 2000,
  className,
  startOnViewportEnter = true,
}: CountingNumberProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTime: number | null = null;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedValue = percentage * (1 - Math.pow(1 - percentage, 3));
            setCurrentValue(Math.floor(easedValue * targetValue));

            if (progress < duration) {
              requestAnimationFrame(animate);
            } else {
              setCurrentValue(targetValue);
            }
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      if (startOnViewportEnter) {
        observer.observe(ref.current);
      } else {
        // Start animation immediately if startOnViewportEnter is false
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const percentage = Math.min(progress / duration, 1);
          setCurrentValue(Math.floor(percentage * targetValue));
          if (progress < duration) {
            requestAnimationFrame(animate);
          } else {
            setCurrentValue(targetValue);
          }
        };
        requestAnimationFrame(animate);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [targetValue, duration, startOnViewportEnter]);

  return (
    <span ref={ref} className={className}>
      {currentValue.toLocaleString()}
    </span>
  );
}
