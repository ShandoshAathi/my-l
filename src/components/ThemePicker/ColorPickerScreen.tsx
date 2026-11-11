import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, Heart, Check, ArrowRight, Wand2 } from 'lucide-react';
import { SakuraPetals } from '../Background/SakuraPetals';

interface ColorPickerScreenProps {
  onContinue: () => void;
}

export const ColorPickerScreen: React.FC<ColorPickerScreenProps> = ({ onContinue }) => {
  const { theme, themeId, setThemeId, availableThemes } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center px-4 py-8 sm:py-12 overflow-y-auto selection:bg-pink-200"
      style={{
        background: `linear-gradient(135deg, ${theme.bgGradientFrom} 0%, ${theme.bgGradientVia} 50%, ${theme.bgGradientTo} 100%)`
      }}
    >
      {/* Background Petals */}
      <SakuraPetals />

      {/* Top Header */}
      <div className="relative z-10 text-center max-w-xl mx-auto pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white mb-4"
        >
          <Wand2 className="h-4 w-4" style={{ color: theme.primary }} />
          <span className="font-anime text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
            Step 1 • Design Your World
          </span>
          <Heart className="h-3.5 w-3.5 fill-current" style={{ color: theme.primary }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-romantic text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-800 px-2"
        >
          Choose Your Magical Theme ♡
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-3 font-anime text-sm sm:text-base text-gray-600 max-w-md mx-auto"
        >
          Before we unlock your surprise, select your favorite colors. The entire world will blossom into your chosen theme!
        </motion.p>
      </div>

      {/* Theme Cards Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-10 w-full max-w-4xl mx-auto my-6 sm:my-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 px-2 sm:px-4"
      >
        {availableThemes.map((pal) => {
          const isSelected = pal.id === themeId;
          return (
            <motion.button
              key={pal.id}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setThemeId(pal.id)}
              type="button"
              className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl transition-all duration-300 text-left border-2 shadow-sm ${
                isSelected
                  ? 'bg-white shadow-xl scale-102 border-current ring-4 ring-offset-2'
                  : 'bg-white/70 hover:bg-white border-white/60 hover:shadow-md'
              }`}
              style={{
                color: pal.primary,
                borderColor: isSelected ? pal.primary : 'rgba(255, 255, 255, 0.8)',
                boxShadow: isSelected ? `0 12px 30px ${pal.primary}35` : undefined
              }}
            >
              {/* Header: Emoji & Check */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-2xl sm:text-3xl">{pal.emoji}</span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'border-2 border-gray-200 text-transparent opacity-40'
                  }`}
                  style={{
                    backgroundColor: isSelected ? pal.primary : 'transparent',
                    borderColor: isSelected ? pal.primary : undefined
                  }}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-gray-800">
                  {pal.name}
                </h3>
              </div>

              {/* Multi-color gradient swatch bar */}
              <div className="mt-4 flex items-center gap-1.5 w-full">
                <div
                  className="h-3.5 flex-1 rounded-full shadow-inner"
                  style={{
                    background: `linear-gradient(90deg, ${pal.secondary} 0%, ${pal.primary} 50%, ${pal.accent} 100%)`
                  }}
                />
                <div
                  className="h-3.5 w-3.5 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: pal.foliageColor }}
                  title="Foliage Blossom Color"
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Bottom Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="relative z-10 flex flex-col items-center pb-4 sm:pb-8"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onContinue}
          type="button"
          className="inline-flex items-center gap-3 px-10 py-4 sm:py-4.5 rounded-full font-bold text-base sm:text-lg text-white shadow-xl hover:shadow-2xl transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            boxShadow: `0 10px 25px ${theme.primary}50`
          }}
        >
          <Sparkles className="h-5 w-5 text-white/90" />
          <span>Enter My Surprise World ({theme.name})</span>
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        <p className="font-anime text-xs text-gray-500 mt-3">
          You can change colors anytime using the 🎨 Theme button in the menu
        </p>
      </motion.div>
    </motion.div>
  );
};
