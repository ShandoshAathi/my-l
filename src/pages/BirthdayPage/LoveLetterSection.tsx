import React from 'react';
import { motion } from 'framer-motion';
import { LoveLetterEnvelope } from '../../components/Envelope/LoveLetterEnvelope';
import { birthdayConfig } from '../../config/birthdayConfig';
import { Mail } from 'lucide-react';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

export const LoveLetterSection: React.FC = () => {
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  return (
    <section
      id="letter"
      className="relative snap-section flex flex-col justify-between items-center pt-12 sm:pt-16 pb-2 px-4 overflow-hidden text-center"
    >
      <div className="text-center max-w-xl mx-auto flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1.5 shadow-sm bg-white/80 border border-white"
          style={{ color: theme.primary }}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Chapter III • Words From The Heart</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-romantic text-3xl sm:text-5xl font-bold text-gray-800"
        >
          {config.loveLetterHeading || birthdayConfig.loveLetterHeading}
        </motion.h2>

        <p className="mt-1 font-anime text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Sealed with a wax heart and cherry blossom petals, just for your eyes.
        </p>
      </div>

      {/* 3D Interactive Envelope */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center my-auto min-h-0 py-2">
        <LoveLetterEnvelope />
      </div>

      <ScrollDownButton targetId="cake" label="Next Chapter • Sweet Cake ↓" />
    </section>
  );
};
