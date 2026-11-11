import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { IntroSection } from './IntroSection';
import { MemoriesSection } from './MemoriesSection';
import { PhotoOrbitSection } from './PhotoOrbitSection';
import { LoveLetterSection } from './LoveLetterSection';
import { CakeSection } from './CakeSection';
import { FinaleSection } from './FinaleSection';
import { SakuraPetals } from '../../components/Background/SakuraPetals';
import { FloatingHearts } from '../../components/Background/FloatingHearts';
import { MusicPlayer } from '../../components/MusicPlayer/MusicPlayer';
import { Navbar } from '../../components/Navbar/Navbar';
import { BloomOverlay } from '../../components/BloomTransition/BloomOverlay';
import { LightboxModal } from '../../components/PhotoGallery/LightboxModal';
import { ColorPickerScreen } from '../../components/ThemePicker/ColorPickerScreen';
import { PasscodeLockScreen } from '../../components/PasscodeLock/PasscodeLockScreen';
import { usePhotos } from '../../hooks/usePhotos';
import { useProceduralMusic } from '../../hooks/useProceduralMusic';
import { triggerRomanticConfetti } from '../../components/Common/ConfettiTrigger';
import { useTheme } from '../../context/ThemeContext';
import { useGiftConfig } from '../../context/GiftConfigContext';
import { BirthdayPhoto } from '../../types';

export const BirthdayPage: React.FC = () => {
  const [isThemePickerOpen, setIsThemePickerOpen] = useState<boolean>(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { photos, loading } = usePhotos();
  const { config, isLocked } = useGiftConfig();
  const musicControls = useProceduralMusic(config.music);
  const { theme } = useTheme();

  const handleOpenSurprise = () => {
    setIsSurpriseOpen(true);
    setIsBlooming(true);
    triggerRomanticConfetti();

    // Start background music on user gesture
    if (!musicControls.isPlaying) {
      musicControls.playMusic();
    }
  };

  const handlePasscodeUnlocked = () => {
    // Automatically open surprise, bloom flowers and start romantic music upon passkey verify!
    setIsSurpriseOpen(true);
    setIsBlooming(true);
    triggerRomanticConfetti();

    if (!musicControls.isPlaying) {
      musicControls.playMusic();
    }
  };

  const handleBloomComplete = () => {
    setIsBlooming(false);
    // Smooth snap scroll down to the intro section after flowers drop
    const introEl = document.getElementById('intro');
    if (introEl) {
      introEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleReplay = () => {
    setIsSurpriseOpen(false);
    setIsBlooming(false);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const welcomeEl = document.getElementById('welcome');
    if (welcomeEl) {
      welcomeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectTreePhoto = (photo: BirthdayPhoto) => {
    const idx = photos.findIndex((p) => p.id === photo.id);
    if (idx !== -1) {
      setLightboxPhotoIndex(idx);
    } else {
      setLightboxPhotoIndex(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="snap-container relative w-full text-gray-800 transition-colors duration-700"
      style={{
        background: `linear-gradient(180deg, ${theme.bgGradientFrom} 0%, ${theme.bgGradientVia} 50%, ${theme.bgGradientTo} 100%)`
      }}
    >
      {/* Passcode Lock Screen if secret password is required */}
      <AnimatePresence>
        {isLocked && <PasscodeLockScreen onUnlockSuccess={handlePasscodeUnlocked} />}
      </AnimatePresence>

      {/* Optional Theme Selection Modal (toggled from navbar) */}
      <AnimatePresence>
        {isThemePickerOpen && (
          <ColorPickerScreen onContinue={() => setIsThemePickerOpen(false)} />
        )}
      </AnimatePresence>

      {/* Background Falling Petals & Floating Hearts */}
      <SakuraPetals />
      <FloatingHearts />

      {/* Screen-covering Flower Bloom Explosion on Surprise Unlock */}
      <BloomOverlay
        isBlooming={isBlooming}
        onBloomComplete={handleBloomComplete}
      />

      {/* Floating Navbar */}
      <Navbar onOpenThemePicker={() => setIsThemePickerOpen(true)} />

      {/* Paged Fullscreen Sections */}
      <main className="relative z-20 w-full">
        <HeroSection
          isSurpriseOpen={isSurpriseOpen}
          onOpenSurprise={handleOpenSurprise}
        />

        <IntroSection />
        <MemoriesSection photos={photos} loading={loading} />
        <PhotoOrbitSection
          photos={photos}
          onSelectPhoto={handleSelectTreePhoto}
        />
        <LoveLetterSection />
        <CakeSection />
        <FinaleSection onReplay={handleReplay} />
      </main>

      {/* Tree & Global Photo Lightbox Modal */}
      <LightboxModal
        photos={photos}
        currentIndex={lightboxPhotoIndex}
        onClose={() => setLightboxPhotoIndex(null)}
        onNext={() => {
          if (lightboxPhotoIndex !== null) {
            setLightboxPhotoIndex((lightboxPhotoIndex + 1) % photos.length);
          }
        }}
        onPrev={() => {
          if (lightboxPhotoIndex !== null) {
            setLightboxPhotoIndex((lightboxPhotoIndex - 1 + photos.length) % photos.length);
          }
        }}
      />

      {/* Floating Music Player */}
      <MusicPlayer musicControls={musicControls} />
    </div>
  );
};
