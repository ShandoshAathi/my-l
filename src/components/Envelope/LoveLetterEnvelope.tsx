import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, X, Heart, Mail } from 'lucide-react';
import { birthdayConfig } from '../../config/birthdayConfig';
import { triggerHeartBurst } from '../Common/ConfettiTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

export const LoveLetterEnvelope: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { theme } = useTheme();
  const { config } = useGiftConfig();

  const recipient = config.recipientName || birthdayConfig.recipientName;
  const rawLetterLines = config.loveLetter?.length > 0 ? config.loveLetter : birthdayConfig.loveLetter;
  // Filter out completely blank lines if any
  const letterLines = rawLetterLines.filter((l) => l && l.trim().length > 0);

  const handleOpenLetter = () => {
    if (!isOpen) {
      triggerHeartBurst(0.5, 0.45);
    }
    setIsOpen(true);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleFoldEnvelope = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFullScreen(false);
    setIsOpen(false);
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-2 select-none">
      {/* ======================================================== */}
      {/* 3D Interactive Sealed Envelope on Section Page           */}
      {/* ======================================================== */}
      <div
        className="relative w-full max-w-sm sm:max-w-md aspect-[1.55/1] min-h-[210px] sm:min-h-[240px] cursor-pointer select-none perspective-1000 group"
        onClick={handleOpenLetter}
        title="Click to open your love letter"
      >
        {/* Envelope Base Shadow & Glow */}
        <div
          className="absolute -inset-1 rounded-3xl opacity-30 blur-lg transition-opacity duration-500 group-hover:opacity-50"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Envelope Outer Shell */}
        <div
          className="relative h-full w-full rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden transition-all duration-500"
          style={{ backgroundColor: theme.secondary }}
        >
          {/* Inner Pocket Backdrop (Slightly deeper tone) */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: theme.primary, opacity: 0.18 }}
          />

          {/* ======================================================== */}
          {/* Folded Parchment Preview Sheet INSIDE Envelope          */}
          {/* When closed, neatly contained inside; when opened, peeks */}
          {/* ======================================================== */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { y: -52, opacity: 1, scale: 0.98 }
                : { y: 0, opacity: 0.85, scale: 0.95 }
            }
            transition={{ type: 'spring', damping: 22, stiffness: 140 }}
            className="absolute left-6 right-6 top-3 h-36 sm:h-40 rounded-xl bg-[#FFFDF9] p-4 shadow-md border border-amber-100 z-10 flex flex-col justify-between cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLetter();
            }}
          >
            {/* Header detail on folded letter */}
            <div className="flex items-center justify-between border-b border-pink-100/60 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🌸</span>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
                  To: {recipient}
                </span>
              </div>
              <span className="font-romantic text-xs text-gray-400">With all my heart</span>
            </div>

            {/* Teaser peek lines */}
            <div className="py-1">
              <p className="font-romantic text-base sm:text-lg font-bold text-gray-700 truncate" style={{ color: theme.primary }}>
                {letterLines[0] || 'To the love of my life,'}
              </p>
              <p className="font-anime text-[11px] sm:text-xs text-gray-500 line-clamp-1 italic mt-0.5">
                {letterLines[1] || 'Thank you for making my life brighter...'}
              </p>
            </div>

            {/* Click to read full screen indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-dashed border-gray-200 text-[10px] font-semibold text-gray-500">
              <Sparkles className="h-3 w-3" style={{ color: theme.primary }} />
              <span>Click to read in Full Screen ✨</span>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* Envelope Front Pocket Triangular Flaps (Z-Index 20)      */}
          {/* ======================================================== */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Left Triangle Flap */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
                backgroundColor: theme.secondary,
                filter: 'brightness(0.97)'
              }}
            />

            {/* Right Triangle Flap */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
                backgroundColor: theme.secondary,
                filter: 'brightness(0.93)'
              }}
            />

            {/* Bottom Triangle Flap (Front Pocket Base) */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(0% 100%, 50% 48%, 100% 100%)',
                backgroundColor: theme.secondary,
                filter: 'brightness(0.90)'
              }}
            />
          </div>

          {/* ======================================================== */}
          {/* Envelope Top Flap (Animated 3D Opening Fold)            */}
          {/* ======================================================== */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { rotateX: 180, zIndex: 5 }
                : { rotateX: 0, zIndex: 30 }
            }
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
            className="absolute inset-x-0 top-0 h-[52%] pointer-events-none"
          >
            <div
              className="w-full h-full shadow-md"
              style={{
                clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
                backgroundColor: theme.secondary,
                filter: 'brightness(1.04)'
              }}
            />
          </motion.div>

          {/* ======================================================== */}
          {/* Wax Seal (Centered on fold when envelope is closed)      */}
          {/* ======================================================== */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg border-2 border-white/90 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`,
                  boxShadow: `0 4px 14px ${theme.accent}60`
                }}
              >
                <span className="text-lg sm:text-xl filter drop-shadow">💌</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Button Controls Below Envelope                           */}
      {/* ======================================================== */}
      <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleOpenLetter}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            boxShadow: `0 6px 18px ${theme.primary}35`
          }}
        >
          {isOpen ? (
            <>
              <BookOpen className="h-4 w-4" />
              <span>Read in Full Screen 📖</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Open My Love Letter ♡</span>
              <Heart className="h-3.5 w-3.5 fill-white" />
            </>
          )}
        </motion.button>

        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleFoldEnvelope}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs text-gray-600 bg-white/80 hover:bg-white border border-gray-200/80 shadow-sm transition-all"
          >
            <Mail className="h-3.5 w-3.5 text-gray-500" />
            <span>Fold Envelope 💌</span>
          </motion.button>
        )}
      </div>

      {/* ======================================================== */}
      {/* FULLSCREEN LOVE LETTER MODAL                            */}
      {/* Displays the entire letter in glorious fullscreen view    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFullScreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 select-text">
            {/* Dimmed Blurred Romantic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseFullScreen}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Stationery Paper Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="relative z-10 w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border-2 border-white/90"
              style={{
                background: 'linear-gradient(180deg, #FFFDF9 0%, #FFF9F2 100%)',
                boxShadow: `0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 50px ${theme.primary}25`
              }}
            >
              {/* Delicate Vintage Inner Frame with Corner Accents */}
              <div className="absolute inset-3 sm:inset-4 rounded-2xl border border-amber-300/40 pointer-events-none" />

              {/* Top Corner Floral Accents */}
              <span className="absolute top-4 left-5 text-base sm:text-lg select-none opacity-80 pointer-events-none">🌸</span>
              <span className="absolute top-4 right-14 text-base sm:text-lg select-none opacity-80 pointer-events-none">🌸</span>
              <span className="absolute bottom-4 left-5 text-base sm:text-lg select-none opacity-80 pointer-events-none">🌸</span>
              <span className="absolute bottom-4 right-5 text-base sm:text-lg select-none opacity-80 pointer-events-none">🌸</span>

              {/* ======================================================== */}
              {/* Header Bar: Stamp, Subtitle, and Close Button            */}
              {/* ======================================================== */}
              <div className="relative z-20 flex items-center justify-between px-6 sm:px-8 pt-6 pb-3 border-b border-pink-100/70">
                {/* Postage Stamp & Recipient */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full shadow-xs border"
                    style={{
                      backgroundColor: `${theme.primary}12`,
                      borderColor: `${theme.primary}30`
                    }}
                  >
                    <span className="text-sm">🌸</span>
                    <span className="font-anime text-xs font-bold uppercase tracking-wider" style={{ color: theme.primary }}>
                      To: {recipient}
                    </span>
                  </div>
                  <span className="hidden sm:inline font-romantic text-sm text-gray-500">
                    • With all my heart
                  </span>
                </div>

                {/* Round Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseFullScreen}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shadow-sm"
                  title="Close Letter"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </div>

              {/* ======================================================== */}
              {/* Scrollable Letter Body                                   */}
              {/* ======================================================== */}
              <div
                className="relative z-20 flex-1 overflow-y-auto px-6 sm:px-12 py-5 sm:py-7 space-y-4 text-left"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${theme.primary}40 transparent`
                }}
              >
                {/* Salutation / First Line */}
                {letterLines.length > 0 && (
                  <p
                    className="font-romantic text-3xl sm:text-4xl font-bold tracking-tight pb-1"
                    style={{ color: theme.primary }}
                  >
                    {letterLines[0]}
                  </p>
                )}

                {/* Body Paragraphs */}
                {letterLines.slice(1, -1).map((line, idx) => (
                  <p
                    key={idx}
                    className="font-anime text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-medium"
                  >
                    {line}
                  </p>
                ))}

                {/* Closing Signature / Last Line */}
                {letterLines.length > 1 && (
                  <div className="pt-6 sm:pt-8 text-right space-y-1">
                    <span className="font-anime text-[11px] sm:text-xs uppercase tracking-widest text-gray-400 block">
                      Forever & Always
                    </span>
                    <p
                      className="font-romantic text-3xl sm:text-4xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      {letterLines[letterLines.length - 1]}
                    </p>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* Footer Bar: Return to Envelope Button                   */}
              {/* ======================================================== */}
              <div className="relative z-20 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/70 border-t border-pink-100/60 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCloseFullScreen}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                    boxShadow: `0 4px 14px ${theme.primary}35`
                  }}
                >
                  <Mail className="h-4 w-4" />
                  <span>Fold & Return to Envelope 💌</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
