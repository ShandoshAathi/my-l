import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GiftConfig, ThemeId, BirthdayPhoto } from '../types';
import {
  DEFAULT_GIFT_CONFIG,
  getStoredGiftConfig,
  saveGiftSurprise,
  fetchGiftSurpriseBySlug,
  decodePortableSurprise
} from '../services/giftService';
import { useTheme } from './ThemeContext';

interface GiftConfigContextType {
  config: GiftConfig;
  updateConfig: (partial: Partial<GiftConfig>) => void;
  saveConfig: () => Promise<GiftConfig>;
  resetToDefaults: () => void;
  isLocked: boolean;
  unlockWithPasscode: (code: string) => boolean;
  lockPasscodeError: string | null;
  clearLockError: () => void;
  isLoading: boolean;
  activeSlug: string;
  sharedPhotos: BirthdayPhoto[] | null;
}

const GiftConfigContext = createContext<GiftConfigContextType | undefined>(undefined);

export const GiftConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GiftConfig>(getStoredGiftConfig());
  const [sharedPhotos, setSharedPhotos] = useState<BirthdayPhoto[] | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockPasscodeError, setLockPasscodeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSlug, setActiveSlug] = useState<string>('default');

  const { setThemeId } = useTheme();

  // On mount, check URL query parameters (?surprise=compressed or ?gift=slug)
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(window.location.search);
      const surpriseData = params.get('surprise');
      const giftSlug = params.get('gift');

      // 1. Check for Universal Portable Encoded Surprise (?surprise=...)
      if (surpriseData) {
        setActiveSlug('portable-surprise');
        const res = decodePortableSurprise(surpriseData);
        if (res) {
          setConfig(res.config);
          if (res.photos && res.photos.length > 0) {
            setSharedPhotos(res.photos);
          }
          if (res.config.themeId) {
            setThemeId(res.config.themeId as ThemeId);
          }

          const hasPasscode = Boolean(
            res.config.passcode &&
            res.config.passcode.trim().length > 0 &&
            res.config.isPasscodeProtected
          );
          const isSessionUnlocked = sessionStorage.getItem('gift_unlocked_portable') === 'true';

          if (hasPasscode && !isSessionUnlocked) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
          setIsLoading(false);
          return;
        }
      }

      // 2. Check for Cloud Slug Surprise (?gift=slug)
      if (giftSlug) {
        setActiveSlug(giftSlug);
        const fetched = await fetchGiftSurpriseBySlug(giftSlug);
        if (fetched) {
          setConfig(fetched);
          if (fetched.photos && fetched.photos.length > 0) {
            const mappedPhotos: BirthdayPhoto[] = fetched.photos.map((p) => ({
              id: p.id,
              title: p.title,
              storage_path: p.url,
              signed_url: p.url,
              created_at: new Date().toISOString()
            }));
            setSharedPhotos(mappedPhotos);
          }
          if (fetched.themeId) {
            setThemeId(fetched.themeId as ThemeId);
          }

          const hasPasscode = Boolean(
            fetched.passcode &&
            fetched.passcode.trim().length > 0 &&
            fetched.isPasscodeProtected
          );
          const isSessionUnlocked = sessionStorage.getItem(`gift_unlocked_${giftSlug}`) === 'true';

          if (hasPasscode && !isSessionUnlocked) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback: If no query params, check Supabase for saved gift
      try {
        const cloudDefault = await fetchGiftSurpriseBySlug('for-my-love');
        if (cloudDefault) {
          setConfig(cloudDefault);
          if (cloudDefault.themeId) {
            setThemeId(cloudDefault.themeId as ThemeId);
          }
          const hasPasscode = Boolean(
            cloudDefault.passcode &&
            cloudDefault.passcode.trim().length > 0 &&
            cloudDefault.isPasscodeProtected
          );
          const isSessionUnlocked = sessionStorage.getItem('gift_unlocked_for-my-love') === 'true';
          if (hasPasscode && !isSessionUnlocked) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
          setIsLoading(false);
          return;
        }
      } catch {
        // Continue to local storage fallback
      }

      // 4. Fallback to locally stored admin configuration
      const stored = getStoredGiftConfig();
      setConfig(stored);
      if (stored.themeId) {
        setThemeId(stored.themeId as ThemeId);
      }

      const hasPasscode = Boolean(
        stored.passcode &&
        stored.passcode.trim().length > 0 &&
        stored.isPasscodeProtected
      );
      const isSessionUnlocked = sessionStorage.getItem('gift_unlocked_local') === 'true';
      if (hasPasscode && !isSessionUnlocked) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }

      setIsLoading(false);
    };

    init();
  }, [setThemeId]);

  const updateConfig = useCallback((partial: Partial<GiftConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      if (partial.themeId) {
        setThemeId(partial.themeId);
      }
      return next;
    });
  }, [setThemeId]);

  const saveConfig = useCallback(async (): Promise<GiftConfig> => {
    const saved = await saveGiftSurprise(config);
    setConfig(saved);
    return saved;
  }, [config]);

  const resetToDefaults = useCallback(() => {
    setConfig(DEFAULT_GIFT_CONFIG);
    setThemeId(DEFAULT_GIFT_CONFIG.themeId);
  }, [setThemeId]);

  const unlockWithPasscode = useCallback((enteredCode: string): boolean => {
    const targetPass = (config.passcode || '').trim();
    const input = enteredCode.trim();

    if (!targetPass || input.toLowerCase() === targetPass.toLowerCase()) {
      setIsLocked(false);
      setLockPasscodeError(null);
      const sessionKey =
        activeSlug === 'portable-surprise'
          ? 'gift_unlocked_portable'
          : activeSlug !== 'default'
          ? `gift_unlocked_${activeSlug}`
          : 'gift_unlocked_local';
      sessionStorage.setItem(sessionKey, 'true');
      return true;
    } else {
      setLockPasscodeError('Secret passcode incorrect. Try again my love ♡');
      return false;
    }
  }, [config.passcode, activeSlug]);

  const clearLockError = useCallback(() => {
    setLockPasscodeError(null);
  }, []);

  return (
    <GiftConfigContext.Provider
      value={{
        config,
        updateConfig,
        saveConfig,
        resetToDefaults,
        isLocked,
        unlockWithPasscode,
        lockPasscodeError,
        clearLockError,
        isLoading,
        activeSlug,
        sharedPhotos
      }}
    >
      {children}
    </GiftConfigContext.Provider>
  );
};

export const useGiftConfig = () => {
  const context = useContext(GiftConfigContext);
  if (!context) {
    throw new Error('useGiftConfig must be used within a GiftConfigProvider');
  }
  return context;
};
