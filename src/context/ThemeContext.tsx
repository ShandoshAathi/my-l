import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeId, ThemePalette } from '../types';

export const THEME_PALETTES: Record<ThemeId, ThemePalette> = {
  sakura: {
    id: 'sakura',
    name: 'Sakura Blush',
    emoji: '🌸',
    primary: '#E98AB3',
    secondary: '#F8C8DC',
    accent: '#FF3377',
    bgGradientFrom: '#FFF1F7',
    bgGradientVia: '#FFF5F9',
    bgGradientTo: '#FFE8F2',
    cardBg: 'rgba(255, 241, 247, 0.85)',
    textColor: '#4A3B44',
    foliageColor: '#FFB7C5',
    petalColors: ['#FFD1DC', '#F8C8DC', '#FFAEC9', '#FFB7C5', '#FFE4E1']
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Starlight',
    emoji: '💜',
    primary: '#9D72FF',
    secondary: '#DCCBFF',
    accent: '#7B42F6',
    bgGradientFrom: '#F7F3FF',
    bgGradientVia: '#FBF9FF',
    bgGradientTo: '#EFE7FF',
    cardBg: 'rgba(247, 243, 255, 0.85)',
    textColor: '#3A324A',
    foliageColor: '#CDB4DB',
    petalColors: ['#DCCBFF', '#E7DCFF', '#CDB4DB', '#B9A4E8', '#F1EAFF']
  },
  peach: {
    id: 'peach',
    name: 'Sunset Peach',
    emoji: '🍑',
    primary: '#FF7E67',
    secondary: '#FFE0CC',
    accent: '#FF5733',
    bgGradientFrom: '#FFF6F0',
    bgGradientVia: '#FFFAF5',
    bgGradientTo: '#FFE8DA',
    cardBg: 'rgba(255, 246, 240, 0.85)',
    textColor: '#4A362D',
    foliageColor: '#FFAAA6',
    petalColors: ['#FFE0CC', '#FFD1BA', '#FFB399', '#FFAAA6', '#FFF0E5']
  },
  mint: {
    id: 'mint',
    name: 'Mint Blossom',
    emoji: '🍃',
    primary: '#2FA893',
    secondary: '#B8EFE5',
    accent: '#1D8271',
    bgGradientFrom: '#F0FAF7',
    bgGradientVia: '#F7FCFA',
    bgGradientTo: '#E2F7F2',
    cardBg: 'rgba(240, 250, 247, 0.85)',
    textColor: '#273E38',
    foliageColor: '#88D49E',
    petalColors: ['#B8EFE5', '#A8E6CF', '#88D49E', '#C2F3E8', '#E6FAF5']
  },
  sky: {
    id: 'sky',
    name: 'Celestial Sky',
    emoji: '☁️',
    primary: '#468EE5',
    secondary: '#C9E2FD',
    accent: '#266DC4',
    bgGradientFrom: '#F2F7FF',
    bgGradientVia: '#FAFCFF',
    bgGradientTo: '#E4F0FF',
    cardBg: 'rgba(242, 247, 255, 0.85)',
    textColor: '#2A384A',
    foliageColor: '#93C5FD',
    petalColors: ['#C9E2FD', '#BEE1E6', '#93C5FD', '#BFDBFE', '#E0F2FE']
  },
  roseGold: {
    id: 'roseGold',
    name: 'Rose Gold Glow',
    emoji: '✨',
    primary: '#D97757',
    secondary: '#F6D5C2',
    accent: '#C45732',
    bgGradientFrom: '#FFF8F4',
    bgGradientVia: '#FFFBF8',
    bgGradientTo: '#FBE8DD',
    cardBg: 'rgba(255, 248, 244, 0.85)',
    textColor: '#47352D',
    foliageColor: '#F4A261',
    petalColors: ['#F6D5C2', '#F4A261', '#E76F51', '#FCD5CE', '#FFDDD2']
  }
};

interface ThemeContextType {
  theme: ThemePalette;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('sakura');

  const theme = THEME_PALETTES[themeId] || THEME_PALETTES.sakura;

  // Apply CSS variables to root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-bg-from', theme.bgGradientFrom);
    root.style.setProperty('--color-bg-via', theme.bgGradientVia);
    root.style.setProperty('--color-bg-to', theme.bgGradientTo);
    root.style.setProperty('--color-foliage', theme.foliageColor);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        availableThemes: Object.values(THEME_PALETTES)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
