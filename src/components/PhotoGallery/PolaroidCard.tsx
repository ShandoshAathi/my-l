import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { BirthdayPhoto } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface PolaroidCardProps {
  photo: BirthdayPhoto;
  index: number;
  onClick: () => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ photo, index, onClick }) => {
  const { theme } = useTheme();

  // Gentle alternating tilt angles
  const rotations = [-2, 1.5, -1, 2, -1.5, 1.2];
  const rot = rotations[index % rotations.length];

  const imageUrl = photo.signed_url || 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, rotate: rot }}
      animate={{ opacity: 1, y: 0, rotate: rot }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl bg-white p-3 pt-4 pb-3.5 shadow-md hover:shadow-xl transition-all duration-300 border border-white"
    >
      {/* Decorative Washi Tape at Top */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 backdrop-blur-sm -rotate-2 rounded-sm shadow-sm opacity-90 border-t border-b border-white/60 pointer-events-none"
        style={{ backgroundColor: `${theme.secondary}99` }}
      />

      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
        <img
          src={imageUrl}
          alt={photo.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle hover heart overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
          <Heart className="h-8 w-8 text-white fill-white drop-shadow-md animate-pulse" />
        </div>
      </div>

      {/* Caption footer */}
      <div className="mt-2 px-1 text-center">
        <p className="font-romantic text-sm sm:text-base text-gray-800 line-clamp-1 font-bold">
          {photo.title}
        </p>
        <span
          className="font-anime text-[10px] font-semibold mt-0.5 block"
          style={{ color: theme.primary }}
        >
          {new Date(photo.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
    </motion.div>
  );
};
