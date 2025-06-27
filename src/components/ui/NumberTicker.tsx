import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const rounded = useTransform(motionValue, (latest) =>
    Math.round(latest * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  );

  useEffect(() => {
    const animation = animate(motionValue, value, {
      duration: 2,
      delay,
      ease: 'easeOut',
    });

    return animation.stop;
  }, [motionValue, value, delay]);

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimalPlaces) + suffix;
      }
    });
  }, [rounded, decimalPlaces, prefix, suffix]);

  return (
    <span className={className} ref={ref}>
      {prefix + (direction === 'down' ? value : 0).toFixed(decimalPlaces) + suffix}
    </span>
  );
}