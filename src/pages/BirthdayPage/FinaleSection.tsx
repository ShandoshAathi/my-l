import React from 'react';
import { motion } from 'framer-motion';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { birthdayConfig } from '../../config/birthdayConfig';
import { triggerRomanticConfetti } from '../../components/Common/ConfettiTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

interface FinaleSectionProps {
  onReplay: () => void;
}

export const FinaleSection: React.FC<FinaleSectionProps> = ({ onReplay }) => {
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  return (
    <section
      id="finale"
      className="relative snap-section flex flex-col justify-between items-center pt-16 sm:pt-20 pb-4 px-4 max-w-4xl mx-auto text-center overflow-hidden"
    >
      {/* Top Title */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center gap-2 mb-2" style={{ color: theme.primary }}>
          <Sparkles className="h-4 w-4 animate-spin-slow" />
          <Heart className="h-6 w-6 fill-current animate-bounce" />
          <Sparkles className="h-4 w-4 animate-spin-slow" />
        </div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="font-romantic text-4xl sm:text-6xl font-bold px-2 leading-tight"
          style={{ color: theme.primary }}
        >
          {config.finalHeading || birthdayConfig.finalHeading}
        </motion.h2>
      </div>

      {/* Center Closing Letter Card */}
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center my-auto min-h-0 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="w-full rounded-3xl glass-card p-5 sm:p-8 shadow-glass border border-white/60 max-h-[50vh] overflow-y-auto"
        >
          <div className="font-anime text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 space-y-2.5 whitespace-pre-line text-center">
            {config.finalMessage || birthdayConfig.finalMessage}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center justify-center">
            <p className="font-romantic text-xl sm:text-2xl font-bold" style={{ color: theme.primary }}>
              Forever and always, {config.recipientName || 'my beautiful princess'} 🌸
            </p>
          </div>
        </motion.div>
      </div>

      {/* Replay Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex-shrink-0 pb-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerRomanticConfetti();
            onReplay();
          }}
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full font-bold text-sm sm:text-base text-white shadow-md hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            boxShadow: `0 8px 20px ${theme.primary}40`
          }}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Replay My Surprise From The Start ♡</span>
        </motion.button>
      </motion.div>
    </section>
  );
};
