import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PolaroidCard } from './PolaroidCard';
import { LightboxModal } from './LightboxModal';
import { BirthdayPhoto } from '../../types';
import { ChevronLeft, ChevronRight, ImageOff, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PhotoGalleryProps {
  photos: BirthdayPhoto[];
  loading: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, loading }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const { theme } = useTheme();

  // Show 3 cards per view on desktop, 1 on mobile
  const itemsPerPage = 3;
  const totalPages = Math.ceil((photos.length || 1) / itemsPerPage);

  const handleNextPage = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-4 py-8 max-h-[360px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 w-48 rounded-2xl bg-white/60 p-3 shadow-sm animate-pulse flex flex-col items-center justify-center border border-white"
          >
            <div className="h-44 w-full rounded-xl bg-gray-200/50 mb-3" />
            <div className="h-3 w-3/4 rounded bg-gray-200/60" />
          </div>
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl glass-card p-6 text-center border border-white/60 my-auto">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-3"
          style={{ backgroundColor: `${theme.secondary}80`, color: theme.primary }}
        >
          <ImageOff className="h-6 w-6" />
        </div>
        <h4 className="font-heading text-base font-bold text-gray-800">No Memories Uploaded</h4>
        <p className="font-anime text-xs text-gray-600 mt-1">
          Upload sweet photos at <span className="font-bold" style={{ color: theme.primary }}>/admin</span>
        </p>
      </div>
    );
  }

  const currentPhotos = photos.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center my-auto min-h-0">
      {/* Top Hint */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 animate-spin-slow" style={{ color: theme.primary }} />
        <span
          className="text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: theme.primary }}
        >
          Click any photo to enlarge • Slide to explore ({page + 1}/{totalPages})
        </span>
        <Sparkles className="h-3.5 w-3.5 animate-spin-slow" style={{ color: theme.primary }} />
      </div>

      {/* Cards Row with Navigation Arrows */}
      <div className="relative w-full flex items-center justify-center gap-2 sm:gap-4 px-2">
        {/* Left Arrow */}
        {totalPages > 1 && (
          <button
            onClick={handlePrevPage}
            className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md border border-white/80 hover:scale-110 transition-transform z-10"
            aria-label="Previous memories page"
          >
            <ChevronLeft className="h-5 w-5" style={{ color: theme.primary }} />
          </button>
        )}

        {/* Dynamic Polaroids Container */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-6 overflow-hidden py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="flex items-center justify-center gap-3 sm:gap-6"
            >
              {currentPhotos.map((photo, index) => {
                const globalIndex = page * itemsPerPage + index;
                return (
                  <div key={photo.id} className="w-40 sm:w-52 md:w-56 flex-shrink-0">
                    <PolaroidCard
                      photo={photo}
                      index={globalIndex}
                      onClick={() => setSelectedIndex(globalIndex)}
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        {totalPages > 1 && (
          <button
            onClick={handleNextPage}
            className="flex-shrink-0 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md border border-white/80 hover:scale-110 transition-transform z-10"
            aria-label="Next memories page"
          >
            <ChevronRight className="h-5 w-5" style={{ color: theme.primary }} />
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all ${
                i === page ? 'w-5 shadow-sm' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              style={{
                backgroundColor: i === page ? theme.primary : undefined
              }}
              aria-label={`Go to memories page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        photos={photos}
        currentIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNext={() => {
          if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % photos.length);
          }
        }}
        onPrev={() => {
          if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
          }
        }}
      />
    </div>
  );
};
