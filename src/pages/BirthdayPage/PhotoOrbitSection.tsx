import React from 'react';
import { motion } from 'framer-motion';
import { BalloonGame } from '../../components/BalloonGame/BalloonGame';
import { BirthdayPhoto } from '../../types';
import { Target } from 'lucide-react';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';

interface PhotoOrbitSectionProps {
  photos: BirthdayPhoto[];
  onSelectPhoto?: (photo: BirthdayPhoto) => void;
}

export const PhotoOrbitSection: React.FC<PhotoOrbitSectionProps> = ({ photos, onSelectPhoto }) => {
  const { theme } = useTheme();

  return (
    <section
      id="orbit"
      className="relative snap-section flex flex-col justify-between items-center pt-16 sm:pt-20 pb-2 px-4 overflow-hidden text-center"
    >
      {/* Top Header */}
      <div className="text-center max-w-xl mx-auto flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1.5 shadow-sm bg-white/80 border border-white"
          style={{ color: theme.primary }}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Chapter II • Cupid's Balloon Pop Game</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-romantic text-3xl sm:text-5xl font-bold text-gray-800"
        >
          Shoot Balloons, Reveal Love 🏹 🎈
        </motion.h2>

        <p className="mt-1 font-anime text-xs sm:text-sm text-gray-600">
          Tap any floating balloon to throw Cupid's arrow!
        </p>
      </div>

      {/* Interactive Balloon Shooting Game */}
      <BalloonGame photos={photos} onSelectPhoto={onSelectPhoto} />

      {/* Scroll Down Button */}
      <ScrollDownButton targetId="letter" label="Next Chapter • Love Letter ↓" />
    </section>
  );
};
