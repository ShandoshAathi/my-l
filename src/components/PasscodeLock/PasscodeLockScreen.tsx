import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart, Sparkles, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGiftConfig } from '../../context/GiftConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { triggerRomanticConfetti, triggerHeartBurst } from '../Common/ConfettiTrigger';

interface PasscodeLockScreenProps {
  onUnlockSuccess?: () => void;
}

export const PasscodeLockScreen: React.FC<PasscodeLockScreenProps> = ({ onUnlockSuccess }) => {
  const { config, unlockWithPasscode, lockPasscodeError, clearLockError } = useGiftConfig();
  const { theme } = useTheme();

  const [enteredCode, setEnteredCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) return;

    const success = unlockWithPasscode(enteredCode.trim());
    if (success) {
      triggerHeartBurst(0.5, 0.5);
      triggerRomanticConfetti();
      onUnlockSuccess?.();
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${theme.bgGradientFrom} 0%, ${theme.bgGradientVia} 50%, ${theme.bgGradientTo} 100%)`
      }}
    >
      {/* Soft glowing aura */}
      <div
        className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full blur-3xl pointer-events-none opacity-60"
        style={{
          background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary}40 60%, transparent 80%)`
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0
        }}
        transition={{ duration: isShaking ? 0.4 : 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl glass-card p-7 sm:p-9 shadow-glass border border-white/80 text-center"
      >
        {/* Floating Heart Lock Emblem */}
        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md animate-bounce"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            boxShadow: `0 8px 24px ${theme.primary}40`
          }}
        >
          <Lock className="h-8 w-8" />
          <Heart className="absolute -top-1.5 -right-1.5 h-5 w-5 fill-white text-white animate-pulse" />
        </div>

        {/* Header Titles */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white text-[11px] font-bold tracking-wider uppercase mb-2"
          style={{ color: theme.primary }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>A Secret Gift For You</span>
        </div>

        <h2 className="font-romantic text-3xl sm:text-4xl font-bold text-gray-800">
          To: {config.recipientName || 'My Princess'} ♡
        </h2>

        <p className="font-anime text-xs sm:text-sm text-gray-600 mt-2 mb-6">
          This magical little world is protected with a secret password chosen just for you. Enter it below to unlock your surprise!
        </p>

        {/* Passcode Hint if present */}
        {config.passcodeHint && (
          <div className="mb-5 rounded-2xl bg-white/90 p-3 border border-pastel-pink/40 text-xs text-gray-600 flex items-center justify-center gap-2">
            <Heart className="h-3.5 w-3.5 fill-current" style={{ color: theme.primary }} />
            <span className="font-medium">Hint: {config.passcodeHint}</span>
          </div>
        )}

        {/* Error message */}
        <AnimatePresence>
          {lockPasscodeError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-xl bg-red-50 p-2.5 border border-red-200 text-red-600 text-xs flex items-center justify-center gap-2"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{lockPasscodeError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Key className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              value={enteredCode}
              onChange={(e) => {
                clearLockError();
                setEnteredCode(e.target.value);
              }}
              placeholder="Enter secret passcode..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-pastel-pink/50 bg-white text-sm text-center font-mono font-bold tracking-widest text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
              boxShadow: `0 8px 20px ${theme.primary}40`
            }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Unlock My Surprise World ♡</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
