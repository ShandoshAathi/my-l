import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Disc } from 'lucide-react';
import { useProceduralMusic } from '../../hooks/useProceduralMusic';
import { useTheme } from '../../context/ThemeContext';

interface MusicPlayerProps {
  musicControls: ReturnType<typeof useProceduralMusic>;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ musicControls }) => {
  const { isPlaying, volume, toggleMusic, changeVolume, trackInfo } = musicControls;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center select-none">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mr-3 flex items-center gap-3 rounded-full glass-panel px-4 py-2.5 shadow-glass border border-white/60 backdrop-blur-lg"
          >
            {/* Track Info */}
            <div className="flex flex-col text-left pr-2">
              <span className="font-anime text-xs font-bold text-gray-800 truncate max-w-[130px]">
                {trackInfo.title}
              </span>
              <span className="font-anime text-[10px] truncate max-w-[130px]" style={{ color: theme.primary }}>
                {trackInfo.artist}
              </span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-gray-400" />
              ) : (
                <Volume2 className="h-4 w-4" style={{ color: theme.primary }} />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="h-1.5 w-16 cursor-pointer rounded-lg bg-gray-200 accent-pink-500"
                style={{ accentColor: theme.primary }}
                aria-label="Volume slider"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (!isPlaying) {
            toggleMusic();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className="relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full p-3 text-white shadow-lg hover:shadow-xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
        }}
        aria-label={isPlaying ? 'Music player controls' : 'Play romantic music'}
        title={isPlaying ? 'Music controls' : 'Play music'}
      >
        {/* Animated outer soundwave ring */}
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full border-2 animate-ping opacity-75"
            style={{ borderColor: theme.secondary }}
          />
        )}

        {/* Spinning Disc or Vinyl */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="relative flex items-center justify-center"
        >
          <Disc className="h-7 w-7 text-white" />
        </motion.div>

        {/* Play/Pause Sub-badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMusic();
          }}
          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:scale-105 transition-transform"
          style={{ color: theme.primary }}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
        </button>
      </motion.button>
    </div>
  );
};
