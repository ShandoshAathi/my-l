import React from 'react';
import { motion } from 'framer-motion';
import { GiftBoxCanvas } from '../../components/GiftScene/GiftBoxCanvas';
import { birthdayConfig } from '../../config/birthdayConfig';
import { Sparkles, Heart } from 'lucide-react';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

interface HeroSectionProps {
  isSurpriseOpen: boolean;
  onOpenSurprise: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isSurpriseOpen, onOpenSurprise }) => {
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  return (
    <section
      id="welcome"
      className="relative snap-section flex flex-col justify-between items-center pt-16 sm:pt-20 pb-2 px-4 text-center overflow-hidden"
    >
      {/* Soft Glow Radial Aura matching selected theme */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary}30 60%, transparent 80%)`
        }}
      />

      {/* Floating Decorative Anime Clouds */}
      <div className="absolute top-16 left-4 sm:left-14 opacity-40 animate-float-slow pointer-events-none">
        <svg width="90" height="45" viewBox="0 0 100 50" fill="#FFF9F3">
          <path d="M20,40 Q10,40 10,30 Q10,18 24,18 Q28,8 40,8 Q54,8 60,18 Q72,16 78,26 Q86,26 86,36 Q86,40 76,40 Z" />
        </svg>
      </div>
      <div className="absolute top-24 right-4 sm:right-16 opacity-35 animate-float-medium pointer-events-none">
        <svg width="100" height="50" viewBox="0 0 100 50" fill="#FFF9F3">
          <path d="M20,40 Q10,40 10,30 Q10,18 24,18 Q28,8 40,8 Q54,8 60,18 Q72,16 78,26 Q86,26 86,36 Q86,40 76,40 Z" />
        </svg>
      </div>

      {/* Top Header Information */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 shadow-sm border border-white/70 backdrop-blur-md mb-2"
        >
          <Sparkles className="h-3.5 w-3.5 animate-spin-slow" style={{ color: theme.primary }} />
          <span className="font-anime text-[11px] sm:text-xs font-semibold tracking-wide" style={{ color: theme.primary }}>
            A Little World Made Just For You
          </span>
          <Heart className="h-3 w-3 fill-current" style={{ color: theme.primary }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="font-romantic text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight px-2 transition-colors duration-500 leading-tight"
          style={{ color: theme.primary }}
        >
          {config.heroHeading || birthdayConfig.birthdayHeading}
        </motion.h1>

        <p className="mt-1 max-w-md font-anime text-xs sm:text-sm text-gray-700/90 px-4">
          {config.subtitle || birthdayConfig.subtitle}
        </p>
      </div>

      {/* Center 3D Gift Box (Expands/contracts to fit viewport) */}
      <div className="relative flex-1 min-h-[160px] max-h-[320px] w-full flex items-center justify-center my-auto">
        <GiftBoxCanvas isOpen={isSurpriseOpen} onOpen={onOpenSurprise} />
      </div>

      {/* Bottom Button & Scroll Navigation */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSurprise}
          className="group relative inline-flex items-center gap-2.5 px-7 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-bold text-sm sm:text-base text-white shadow-md hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            boxShadow: `0 8px 20px ${theme.primary}40`
          }}
        >
          <Sparkles className="h-4 w-4 text-white/90 group-hover:rotate-12 transition-transform" />
          <span>{isSurpriseOpen ? 'Surprise Unlocked! Bloom Flowers ♡' : 'Open Your Surprise 🌸'}</span>
          <Heart className="h-4 w-4 text-white fill-white group-hover:scale-125 transition-transform" />
        </motion.button>

        <ScrollDownButton targetId="intro" label="Begin Story • Hey Princess ↓" />
      </div>
    </section>
  );
};
