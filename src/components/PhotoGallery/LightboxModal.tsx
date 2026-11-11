import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { BirthdayPhoto } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface LightboxModalProps {
  photos: BirthdayPhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev
}) => {
  const currentPhoto = currentIndex !== null && photos[currentIndex] ? photos[currentIndex] : null;
  const { theme } = useTheme();

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, handleKeyDown]);

  if (currentIndex === null || !currentPhoto) return null;

  const imageUrl = currentPhoto.signed_url || 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          aria-label="Close photo preview"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Left / Prev Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 sm:left-8 z-50 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Right / Next Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 sm:right-8 z-50 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Photo Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-h-[88vh] max-w-4xl z-10 flex flex-col items-center rounded-3xl bg-white p-3 sm:p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative max-h-[70vh] overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={imageUrl}
              alt={currentPhoto.title}
              className="max-h-[70vh] w-auto object-contain rounded-2xl"
            />
          </div>

          <div className="mt-4 flex flex-col items-center text-center px-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-current" style={{ color: theme.primary }} />
              <h3 className="font-romantic text-2xl sm:text-3xl font-bold text-gray-800">
                {currentPhoto.title}
              </h3>
            </div>
            <span className="font-anime text-xs text-gray-500 mt-1">
              Memory {currentIndex + 1} of {photos.length}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
