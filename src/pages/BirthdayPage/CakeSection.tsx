import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CakeCanvas } from '../../components/CakeScene/CakeCanvas';
import { birthdayConfig } from '../../config/birthdayConfig';
import { triggerRomanticConfetti, triggerHeartBurst } from '../../components/Common/ConfettiTrigger';
import { Flame, Wind, RotateCcw, Heart, Sparkles, Utensils, Maximize2, X } from 'lucide-react';
import { ScrollDownButton } from '../../components/Common/ScrollDownButton';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';

// Procedural audio for realistic wind blowing sound and celebratory cake cut fanfare
function playBlowSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    // Realistic rushing wind breath audio
    const bufferSize = Math.floor(ctx.sampleRate * 0.9);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(680, ctx.currentTime + 0.25);
    filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.85);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // AudioContext not permitted before user gesture
  }
}

function playCutSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.65);
    });
  } catch {
    // AudioContext not permitted before user gesture
  }
}

export const CakeSection: React.FC = () => {
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [isCut, setIsCut] = useState<boolean>(false);
  const [isCutting, setIsCutting] = useState<boolean>(false);
  const [isFullScreenView, setIsFullScreenView] = useState<boolean>(false);

  const { theme } = useTheme();
  const { config } = useGiftConfig();

  const handleBlow = () => {
    if (!candlesBlown && !isBlowing) {
      setIsBlowing(true);
      playBlowSound();

      // 3D wind gust swooshes into screen for 850ms, then flames blow out
      setTimeout(() => {
        setCandlesBlown(true);
        setIsBlowing(false);
        triggerHeartBurst(0.5, 0.45);
        triggerRomanticConfetti();
      }, 850);
    }
  };

  const handleCut = () => {
    if (!isCut && !isCutting) {
      setIsCutting(true);
      playCutSound();
    }
  };

  const handleCutComplete = () => {
    setIsCutting(false);
    setIsCut(true);
    triggerRomanticConfetti();
    triggerHeartBurst(0.5, 0.4);
  };

  const handleReset = () => {
    setIsCut(false);
    setIsCutting(false);
    setCandlesBlown(false);
    setIsBlowing(false);
  };

  return (
    <section
      id="cake"
      className="relative snap-section flex flex-col justify-between items-center pt-10 sm:pt-14 pb-2 px-4 overflow-hidden text-center"
    >
      {/* Top Header Information */}
      <div className="relative text-center max-w-xl mx-auto flex-shrink-0">
        {/* Badge & Fullscreen Ceremony Toggle */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-xs bg-white/85 border border-white"
            style={{ color: theme.primary }}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Chapter IV • Sweet Wish & Cake Ceremony</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsFullScreenView(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-gray-600 bg-white/80 hover:bg-white border border-gray-200/70 shadow-xs transition-all"
            title="Expand to Fullscreen Cake View"
          >
            <Maximize2 className="h-3 w-3" style={{ color: theme.primary }} />
            <span className="hidden sm:inline">Fullscreen</span>
          </motion.button>
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-romantic text-3xl sm:text-5xl font-bold text-gray-800"
        >
          {config.cakeHeading || birthdayConfig.cakeHeading}
        </motion.h2>

        <p className="mt-0.5 font-anime text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          {!candlesBlown
            ? config.cakeSubtitle || birthdayConfig.cakeSubtitle
            : !isCut
            ? 'Your wish is cast into the stars! Now cut your birthday cake ♡'
            : 'A sweet slice of happiness, baked with all my love! 🍰💖'}
        </p>
      </div>

      {/* 3D Cake Canvas (Spacious, Fully Visible on All Screens) */}
      <div className="flex-1 w-full max-w-2xl sm:max-w-3xl flex items-center justify-center my-auto min-h-0 py-1">
        <CakeCanvas
          isBlowing={isBlowing}
          candlesBlown={candlesBlown}
          isCut={isCut}
          isCutting={isCutting}
          onBlow={handleBlow}
          onCut={handleCut}
          onCutComplete={handleCutComplete}
        />
      </div>

      {/* Action Buttons & Celebration Cards */}
      <div className="flex flex-col items-center flex-shrink-0 w-full max-w-md mx-auto pb-1">
        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!candlesBlown ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlow}
              disabled={isBlowing}
              className="inline-flex items-center gap-2 px-7 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                boxShadow: `0 6px 18px ${theme.primary}35`
              }}
            >
              <Wind className={`h-4 w-4 ${isBlowing ? 'animate-spin' : ''}`} />
              <span>{isBlowing ? 'Blowing Candles... 💨✨' : 'Blow the Candles 🕯️💨'}</span>
            </motion.button>
          ) : !isCut ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCut}
                disabled={isCutting}
                className="inline-flex items-center gap-2 px-7 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                  boxShadow: `0 6px 18px ${theme.primary}35`
                }}
              >
                <Utensils className="h-4 w-4" />
                <span>{isCutting ? 'Slicing Cake... 🍰' : 'Cut the Cake 🎂🔪'}</span>
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs text-gray-700 bg-white/90 shadow-xs border border-gray-200 hover:bg-white transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                <span>Relight</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-gray-700 bg-white shadow-xs border border-gray-200/80 hover:bg-white transition-all"
            >
              <RotateCcw className="h-4 w-4" style={{ color: theme.primary }} />
              <span>Relight & Cut Again 🔄</span>
            </motion.button>
          )}
        </div>

        {/* Wish Reveal Box (When candles are blown, before cut) */}
        <AnimatePresence>
          {candlesBlown && !isCut && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="mt-2 w-full rounded-2xl glass-card p-2.5 shadow-glass border border-white/70"
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5" style={{ color: theme.primary }}>
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              </div>

              <h3 className="font-romantic text-base sm:text-lg font-bold text-gray-800">
                {config.cakeWishMessage || birthdayConfig.cakeWishMessage}
              </h3>
              <p className="font-anime text-[11px] text-gray-600 mt-0.5">
                May every dream in your heart blossom into reality. Now cut your cake! 🎂✨
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cake Cut Celebration Box (When cake is cut) */}
        <AnimatePresence>
          {isCut && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="mt-2 w-full rounded-2xl glass-card p-2.5 sm:p-3 shadow-glass border border-white/80"
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5" style={{ color: theme.primary }}>
                <span className="text-base">🍰</span>
                <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              </div>

              <h3 className="font-romantic text-lg sm:text-xl font-bold text-gray-800">
                Sweetest Birthday Slice Just For You! 🍰💖
              </h3>
              <p className="font-anime text-[11px] sm:text-xs text-gray-600 mt-0.5">
                Layers of fluffy vanilla sponge, fresh strawberry cream, and endless love. Enjoy your special day!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollDownButton targetId="finale" label="Final Surprise • Sweet Finale ↓" />
      </div>

      {/* ======================================================== */}
      {/* DEDICATED FULLSCREEN CAKE CEREMONY OVERLAY               */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFullScreenView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between items-center p-4 sm:p-6 bg-black/75 backdrop-blur-md select-none"
          >
            {/* Fullscreen Header */}
            <div className="relative z-10 w-full max-w-2xl flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎂</span>
                <span className="font-romantic text-2xl sm:text-3xl font-bold text-white">
                  Sweet Birthday Cake Ceremony
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFullScreenView(false)}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-md"
                title="Exit Fullscreen"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Fullscreen 3D Canvas */}
            <div className="relative z-10 w-full flex-1 max-w-4xl flex items-center justify-center">
              <CakeCanvas
                isBlowing={isBlowing}
                candlesBlown={candlesBlown}
                isCut={isCut}
                isCutting={isCutting}
                onBlow={handleBlow}
                onCut={handleCut}
                onCutComplete={handleCutComplete}
              />
            </div>

            {/* Fullscreen Bottom Controls */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center pb-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {!candlesBlown ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBlow}
                    disabled={isBlowing}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
                    }}
                  >
                    <Wind className={`h-4 w-4 ${isBlowing ? 'animate-spin' : ''}`} />
                    <span>{isBlowing ? 'Blowing Candles... 💨✨' : 'Blow the Candles 🕯️💨'}</span>
                  </motion.button>
                ) : !isCut ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCut}
                      disabled={isCutting}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
                      }}
                    >
                      <Utensils className="h-4 w-4" />
                      <span>{isCutting ? 'Slicing Cake... 🍰' : 'Cut the Cake 🎂🔪'}</span>
                    </motion.button>

                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full font-semibold text-xs text-white bg-white/20 hover:bg-white/30 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Relight</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-xs sm:text-sm text-gray-800 bg-white shadow-md hover:bg-gray-100 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" style={{ color: theme.primary }} />
                    <span>Relight & Cut Again 🔄</span>
                  </button>
                )}
              </div>

              {/* Wish/Celebration message in fullscreen */}
              {candlesBlown && (
                <div className="mt-3 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs sm:text-sm font-anime">
                  {!isCut
                    ? '✨ Your wish is cast into the stars! Now cut the cake ♡'
                    : '🍰 Enjoy your sweet first slice of cake! Made with all my love ♡'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
