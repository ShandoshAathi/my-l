import React from 'react';
import { motion } from 'framer-motion';

interface FloatingHeartItem {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const HEARTS: FloatingHeartItem[] = [
  { id: 1, x: 10, size: 18, duration: 9, delay: 0, opacity: 0.35 },
  { id: 2, x: 22, size: 24, duration: 12, delay: 2, opacity: 0.4 },
  { id: 3, x: 38, size: 14, duration: 8, delay: 4, opacity: 0.3 },
  { id: 4, x: 52, size: 22, duration: 10, delay: 1, opacity: 0.45 },
  { id: 5, x: 68, size: 16, duration: 11, delay: 3, opacity: 0.35 },
  { id: 6, x: 82, size: 26, duration: 13, delay: 5, opacity: 0.4 },
  { id: 7, x: 92, size: 20, duration: 9, delay: 2.5, opacity: 0.35 },
];

export const FloatingHearts: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {HEARTS.map((item) => (
        <motion.div
          key={item.id}
          className="absolute bottom-[-10%]"
          style={{ left: `${item.x}%` }}
          animate={{
            y: ['0%', '-120%'],
            x: [0, Math.sin(item.id) * 30, -Math.sin(item.id) * 30, 0],
            rotate: [0, 25, -20, 0],
            opacity: [0, item.opacity, item.opacity, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 24 24"
            fill="#E98AB3"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_2px_8px_rgba(233,138,179,0.4)]"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
