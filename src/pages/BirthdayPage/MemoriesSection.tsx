import React from 'react';
import { motion } from 'framer-motion';
import { PhotoGallery } from '../../components/PhotoGallery/PhotoGallery';
import { BirthdayPhoto } from '../../types';
import { Camera } from 'lucide-react';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';

interface MemoriesSectionProps {
  photos: BirthdayPhoto[];
  loading: boolean;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({ photos, loading }) => {
  const { theme } = useTheme();

  return (
    <section
      id="memories"
      className="relative snap-section flex flex-col justify-between items-center pt-16 sm:pt-20 pb-2 px-4 overflow-hidden"
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
          <Camera className="h-3.5 w-3.5" />
          <span>Chapter I • Scrapbook Moments</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-romantic text-3xl sm:text-5xl font-bold text-gray-800"
        >
          Our Sweetest Memories ♡
        </motion.h2>

        <p className="mt-1 font-anime text-xs sm:text-sm text-gray-600">
          Every smile and quiet moment spent by your side.
        </p>
      </div>

      {/* Gallery Showcase Carousel */}
      <PhotoGallery photos={photos} loading={loading} />

      {/* Scroll Navigation */}
      <ScrollDownButton targetId="orbit" label="Next Chapter • Cupid's Balloon Game ↓" />
    </section>
  );
};
