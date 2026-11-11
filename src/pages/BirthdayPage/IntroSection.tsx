import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';
import { birthdayConfig } from '../../config/birthdayConfig';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

export const IntroSection: React.FC = () => {
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  return (
    <section
      id="intro"
      className="relative snap-section flex flex-col justify-between items-center pt-16 sm:pt-20 pb-2 px-4 overflow-hidden"
    >
      <div className="flex-1 w-full max-w-3xl flex items-center justify-center my-auto min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full rounded-3xl glass-card p-5 sm:p-8 md:p-10 shadow-glass border border-white/60 overflow-hidden"
        >
          {/* Soft anime glow effect inside card */}
          <div
            className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-30"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-25"
            style={{ backgroundColor: theme.secondary }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
            {/* Anime Princess Illustration Card */}
            <div className="relative flex-shrink-0">
              <div
                className="relative h-32 w-32 sm:h-44 sm:w-44 rounded-full overflow-hidden border-4 border-white shadow-polaroid flex items-center justify-center p-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.secondary} 0%, #FFFFFF 50%, ${theme.secondary} 100%)`
                }}
              >
                {/* Princess SVG */}
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
                  <circle cx="100" cy="100" r="90" fill="#FFF1F7" />
                  <circle cx="100" cy="100" r="80" fill={theme.secondary} opacity="0.4" />
                  <path d="M45,110 C40,160 55,190 70,200 L130,200 C145,190 160,160 155,110 Z" fill="#7A4E3B" />
                  <ellipse cx="100" cy="110" rx="42" ry="46" fill="#FFE5D9" />
                  <circle cx="58" cy="115" r="10" fill="#FFE5D9" />
                  <circle cx="142" cy="115" r="10" fill="#FFE5D9" />
                  <ellipse cx="78" cy="125" rx="8" ry="5" fill="#FF8BA7" opacity="0.6" />
                  <ellipse cx="122" cy="125" rx="8" ry="5" fill="#FF8BA7" opacity="0.6" />
                  <ellipse cx="80" cy="110" rx="7" ry="10" fill="#3D2B24" />
                  <ellipse cx="120" cy="110" rx="7" ry="10" fill="#3D2B24" />
                  <circle cx="82" cy="106" r="3" fill="#FFFFFF" />
                  <circle cx="122" cy="106" r="3" fill="#FFFFFF" />
                  <path d="M72,102 Q80,98 88,102" stroke="#3D2B24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M112,102 Q120,98 128,102" stroke="#3D2B24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M93,128 Q100,136 107,128" stroke="#D85A8C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M55,95 C65,70 135,70 145,95 C145,95 125,90 100,95 C75,90 55,95 55,95 Z" fill="#8B5A43" />
                  <path d="M78,74 L86,84 L100,68 L114,84 L122,74 L120,86 L80,86 Z" fill="#FFD700" stroke="#E6C200" strokeWidth="1" />
                  <circle cx="100" cy="74" r="3" fill={theme.accent} />
                </svg>
              </div>

              {/* Sparkle badge */}
              <div
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md animate-bounce"
                style={{ backgroundColor: theme.primary }}
              >
                <Heart className="h-4 w-4 fill-white" />
              </div>
            </div>

            {/* Text Message Content */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/80 border border-white"
                style={{ color: theme.primary }}
              >
                <Star className="h-3 w-3 fill-current" />
                <span>A note from my heart</span>
              </div>

              <h2 className="font-romantic text-2xl sm:text-4xl font-bold text-gray-800">
                {config.introHeading || birthdayConfig.introHeading}
              </h2>

              <p className="font-anime text-xs sm:text-sm md:text-base leading-relaxed text-gray-700">
                {config.introMessage || birthdayConfig.introMessage}
              </p>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <span className="font-romantic text-lg sm:text-xl font-bold" style={{ color: theme.primary }}>
                  Forever yours, always ♡
                </span>
                <Sparkles className="h-4 w-4 animate-spin-slow" style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ScrollDownButton targetId="memories" label="Next Chapter • Scrapbook Gallery ↓" />
    </section>
  );
};
