import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthdayPhoto } from '../../types';
import { Heart, Sparkles, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { triggerHeartBurst, triggerRomanticConfetti } from '../Common/ConfettiTrigger';

interface BalloonGameProps {
  photos: BirthdayPhoto[];
  onSelectPhoto?: (photo: BirthdayPhoto) => void;
}

interface BalloonItem {
  id: string;
  photo: BirthdayPhoto;
  color: string;
  stringLength: number;
  floatDelay: number;
}

const BALLOON_COLORS = [
  '#FF94B8', // Rose Pink
  '#B9A4E8', // Lavender
  '#FFB085', // Peach
  '#74D6C4', // Mint
  '#89C2F8', // Sky Blue
  '#FFD166', // Golden Sun
  '#FFAAA6', // Blush Coral
  '#D4A5FF', // Soft Violet
];

// Web Audio API Bow Release Sound
function playBowReleaseSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Ignore audio restriction errors
  }
}

// Web Audio API Balloon Pop Sound
function playBalloonPopSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio restriction errors
  }
}

export const BalloonGame: React.FC<BalloonGameProps> = ({ photos, onSelectPhoto }) => {
  const { theme } = useTheme();
  const [poppedIds, setPoppedIds] = useState<Set<string>>(new Set());
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [flyingArrow, setFlyingArrow] = useState<{
    id: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    angle: number;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const archerRef = useRef<HTMLDivElement | null>(null);

  // Take up to 8 photos for the balloon game
  const gamePhotos = photos.slice(0, 8);

  const balloons: BalloonItem[] = gamePhotos.map((photo, i) => ({
    id: photo.id,
    photo,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    stringLength: 16 + (i % 3) * 5,
    floatDelay: (i % 4) * 0.35
  }));

  // Track mouse to aim the archer smoothly
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isShooting || !archerRef.current || !stageRef.current) return;

    const archerRect = archerRef.current.getBoundingClientRect();
    const archerCenterX = archerRect.left + archerRect.width / 2;
    const archerCenterY = archerRect.top + archerRect.height * 0.4;

    const deltaX = e.clientX - archerCenterX;
    const deltaY = e.clientY - archerCenterY;

    // Angle in degrees where 0deg is straight up (-90 from standard atan2)
    const rad = Math.atan2(deltaY, deltaX);
    let deg = rad * (180 / Math.PI) + 90;

    // Clamp angle so archer doesn't bend backwards
    deg = Math.max(-65, Math.min(65, deg));
    setAimAngle(deg);
  }, [isShooting]);

  const handlePop = useCallback((item: BalloonItem, event: React.MouseEvent<HTMLDivElement>) => {
    if (poppedIds.has(item.id)) {
      onSelectPhoto?.(item.photo);
      return;
    }

    if (isShooting) return;

    const stageRect = stageRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 400, height: 400 };
    const balloonRect = event.currentTarget.getBoundingClientRect();
    const archerRect = archerRef.current?.getBoundingClientRect() || {
      left: stageRect.left + stageRect.width / 2,
      top: stageRect.top + stageRect.height * 0.85,
      width: 60,
      height: 60
    };

    const targetX = balloonRect.left - stageRect.left + balloonRect.width / 2;
    const targetY = balloonRect.top - stageRect.top + balloonRect.height / 2;

    const startX = archerRect.left - stageRect.left + archerRect.width / 2;
    const startY = archerRect.top - stageRect.top + 20;

    // Calculate shot angle
    const rad = Math.atan2(targetY - startY, targetX - startX);
    const deg = rad * (180 / Math.PI) + 90;
    setAimAngle(deg);

    // Release bowstring
    setIsShooting(true);
    playBowReleaseSound();

    // Spawn arrow flying toward target
    setFlyingArrow({
      id: item.id,
      startX,
      startY,
      targetX,
      targetY,
      angle: rad * (180 / Math.PI) + 90
    });

    // Arrow impact delay
    setTimeout(() => {
      playBalloonPopSound();
      triggerHeartBurst(balloonRect.left / window.innerWidth, balloonRect.top / window.innerHeight);

      setPoppedIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        if (next.size === balloons.length) {
          triggerRomanticConfetti();
        }
        return next;
      });

      setFlyingArrow(null);
      setIsShooting(false);
    }, 320);
  }, [balloons.length, isShooting, onSelectPhoto, poppedIds]);

  const handleReset = () => {
    setPoppedIds(new Set());
    setFlyingArrow(null);
    setIsShooting(false);
  };

  const poppedCount = poppedIds.size;
  const totalCount = balloons.length;
  const allPopped = totalCount > 0 && poppedCount === totalCount;

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-between my-auto flex-1 min-h-0 select-none px-2"
    >
      {/* Top Game Status Bar */}
      <div className="flex items-center justify-between w-full max-w-md px-3.5 py-1.5 rounded-full glass-card border border-white/70 shadow-sm mb-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.primary }}>
          <span className="text-sm">🏹</span>
          <span>Aim with the Archer • Tap balloons to strike!</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-anime font-bold text-gray-700">
            {poppedCount}/{totalCount}
          </span>
          {poppedCount > 0 && (
            <button
              onClick={handleReset}
              className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-white/80 transition-colors"
              title="Reset Balloons"
              aria-label="Reset balloons"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative w-full flex-1 min-h-[260px] max-h-[52vh] flex flex-col justify-between items-center p-3 rounded-3xl glass-panel border border-white/60 shadow-glass overflow-hidden">
        {/* Soft Sky Aura */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/70 pointer-events-none" />

        {/* --- BALLOONS ROW (Grid of 8) --- */}
        <div className="relative z-10 grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 w-full max-w-2xl px-2 pt-2">
          {balloons.map((item) => {
            const isPopped = poppedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={(e) => handlePop(item, e)}
                className="relative flex flex-col items-center justify-center cursor-pointer group"
              >
                <AnimatePresence mode="wait">
                  {!isPopped ? (
                    /* Floating Balloon */
                    <motion.div
                      key="balloon"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        y: [0, -6, 0],
                        rotate: [-2, 2, -2]
                      }}
                      exit={{
                        scale: [1, 1.25, 0],
                        opacity: [1, 0.8, 0]
                      }}
                      transition={{
                        y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: item.floatDelay },
                        rotate: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: item.floatDelay },
                        exit: { duration: 0.22 }
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      className="relative flex flex-col items-center"
                    >
                      {/* Target crosshair indicator on hover */}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <span className="text-xs">🎯</span>
                      </div>

                      {/* Balloon Body */}
                      <div
                        className="relative w-13 h-17 sm:w-16 sm:h-20 rounded-full shadow-md flex items-center justify-center transition-transform"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${item.color} 55%, ${item.color} 100%)`,
                          boxShadow: `0 8px 16px ${item.color}40`
                        }}
                      >
                        {/* Balloon Highlight Glare */}
                        <div className="absolute top-2 left-2.5 w-2.5 h-4.5 rounded-full bg-white/70 -rotate-25 blur-[0.5px]" />
                        <Heart className="h-4 w-4 text-white/90 fill-white/80 drop-shadow-sm" />
                      </div>

                      {/* Balloon Knot */}
                      <div
                        className="w-2.5 h-1.5 -mt-0.5 rounded-b-sm"
                        style={{ backgroundColor: item.color }}
                      />

                      {/* Balloon String */}
                      <svg width="10" height={item.stringLength} className="opacity-60 overflow-visible">
                        <path
                          d={`M5,0 Q2,${item.stringLength / 2} 5,${item.stringLength}`}
                          stroke="#999"
                          strokeWidth="1.2"
                          fill="none"
                        />
                      </svg>
                    </motion.div>
                  ) : (
                    /* Revealed Polaroid Photo */
                    <motion.div
                      key="photo"
                      initial={{ scale: 0, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: (item.stringLength % 6) - 3, opacity: 1 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 180 }}
                      whileHover={{ scale: 1.1, rotate: 0 }}
                      className="relative rounded-xl bg-white p-1.5 shadow-lg border border-pink-100 flex flex-col items-center cursor-pointer group-hover:shadow-glow-rose transition-shadow"
                    >
                      <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.photo.signed_url}
                          alt={item.photo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-romantic text-[10px] text-gray-700 font-bold truncate max-w-[55px] sm:max-w-[70px] mt-1 text-center">
                        {item.photo.title}
                      </p>
                      <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] shadow-sm">
                        ✨
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* --- FLYING CUPID ARROW (TRAJECTORY) --- */}
        <AnimatePresence>
          {flyingArrow && (
            <motion.div
              initial={{
                left: flyingArrow.startX,
                top: flyingArrow.startY,
                opacity: 1,
                scale: 0.9,
                rotate: flyingArrow.angle
              }}
              animate={{
                left: flyingArrow.targetX,
                top: flyingArrow.targetY,
                opacity: 1,
                scale: 1.15,
                rotate: flyingArrow.angle
              }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            >
              {/* Cupid Heart Arrow Graphic */}
              <div className="flex flex-col items-center drop-shadow-lg">
                {/* Arrowhead */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-red-500" />
                <div className="h-3 w-3 -mt-1 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">
                  ♡
                </div>
                {/* Golden Shaft */}
                <div className="w-1 h-9 bg-amber-400 rounded-sm shadow-sm" />
                {/* Feather Fletchings */}
                <div className="flex gap-1 -mt-1">
                  <div className="w-2 h-3.5 bg-pink-300 rounded-bl-md -rotate-12" />
                  <div className="w-2 h-3.5 bg-pink-300 rounded-br-md rotate-12" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- THE CUPID ARCHER (AIMS AT BALLOONS) --- */}
        <div
          ref={archerRef}
          className="relative z-20 flex flex-col items-center justify-end mt-auto pt-2"
        >
          {/* Animated Aiming Bow & Character */}
          <div className="relative flex items-center justify-center">
            {/* The Aiming Bow (Rotates to track balloons) */}
            <motion.div
              animate={{ rotate: aimAngle }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{ transformOrigin: 'center 75%' }}
              className="relative z-20 flex flex-col items-center"
            >
              {/* Bow Vector Graphic */}
              <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-md">
                {/* Bow Curved Limb */}
                <path
                  d="M15,50 Q50,15 85,50"
                  stroke="#D97706"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Bow Grip Detail */}
                <path
                  d="M44,32 Q50,30 56,32"
                  stroke="#92400E"
                  strokeWidth="7"
                  fill="none"
                />
                {/* Bowstring */}
                <line
                  x1="17"
                  y1="50"
                  x2={isShooting ? '50' : '50'}
                  y2={isShooting ? '45' : '65'}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeDasharray="2,2"
                />
                <line
                  x1="83"
                  y1="50"
                  x2={isShooting ? '50' : '50'}
                  y2={isShooting ? '45' : '65'}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeDasharray="2,2"
                />
                {/* Nocked Arrow (Ready to shoot) */}
                {!isShooting && (
                  <g>
                    {/* Arrow Shaft */}
                    <line x1="50" y1="18" x2="50" y2="65" stroke="#F59E0B" strokeWidth="2.5" />
                    {/* Arrow Tip */}
                    <polygon points="50,10 44,22 56,22" fill="#EF4444" />
                    {/* Fletchings */}
                    <polygon points="50,60 43,68 47,68" fill="#F472B6" />
                    <polygon points="50,60 57,68 53,68" fill="#F472B6" />
                  </g>
                )}
              </svg>
            </motion.div>

            {/* Cupid Archer Character Body */}
            <div className="absolute top-7 z-10 flex flex-col items-center pointer-events-none">
              {/* Angel / Fairy Wings behind */}
              <div className="absolute -top-3 flex items-center justify-center gap-12 w-28 opacity-80 animate-pulse">
                <div className="w-8 h-10 bg-white rounded-full -rotate-30 shadow-md border border-pink-100" />
                <div className="w-8 h-10 bg-white rounded-full rotate-30 shadow-md border border-pink-100" />
              </div>

              {/* Character Head */}
              <div className="relative w-9 h-9 rounded-full bg-[#FFE5D9] border border-amber-200/80 shadow-sm flex items-center justify-center">
                {/* Cute Hair */}
                <div
                  className="absolute -top-1 inset-x-0 h-4 rounded-t-full"
                  style={{ backgroundColor: theme.primary }}
                />
                {/* Eyes focused on target */}
                <div className="flex gap-2.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                </div>
                {/* Blush cheeks */}
                <div className="absolute bottom-1.5 left-1 w-2 h-1 rounded-full bg-pink-300 opacity-60" />
                <div className="absolute bottom-1.5 right-1 w-2 h-1 rounded-full bg-pink-300 opacity-60" />
              </div>

              {/* Tunic & Quiver */}
              <div
                className="w-8 h-6 rounded-b-xl shadow-sm -mt-1"
                style={{
                  background: `linear-gradient(180deg, ${theme.secondary} 0%, ${theme.primary} 100%)`
                }}
              />
            </div>
          </div>

          {/* Archer Pedestal / Cloud Stand */}
          <div className="h-3 w-32 rounded-full bg-white/80 shadow-sm border border-white/70 -mt-0.5" />
        </div>

        {/* All Memories Popped Celebration Banner */}
        <AnimatePresence>
          {allPopped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-40 mx-auto max-w-sm rounded-2xl glass-card p-4 shadow-2xl text-center border-2 border-white"
            >
              <div className="flex items-center justify-center gap-1.5 text-pink-500 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xl">🎉</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="font-romantic text-xl font-bold text-gray-800">
                You Popped All Balloons! ♡
              </h4>
              <p className="font-anime text-xs text-gray-600 mt-1">
                Cupid's arrow hit every target! Click any photo to view in full size.
              </p>
              <button
                onClick={handleReset}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
                style={{ background: theme.primary }}
              >
                Pop Them Again ↺
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-gray-500 flex-shrink-0">
        <span>Move to aim bow • Click to shoot and pop balloons!</span>
      </div>
    </div>
  );
};
