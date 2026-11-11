export interface BirthdayPhoto {
  id: string;
  title: string;
  storage_path: string;
  signed_url?: string;
  created_at: string;
  created_by?: string;
}

export interface BirthdayConfig {
  recipientName: string;
  birthdayHeading: string;
  subtitle: string;
  introHeading: string;
  introMessage: string;
  loveLetterHeading: string;
  loveLetter: string[];
  cakeHeading: string;
  cakeSubtitle: string;
  cakeWishMessage: string;
  finalHeading: string;
  finalMessage: string;
  music: {
    title: string;
    artist: string;
    src: string;
    fallbackProcedural: boolean;
  };
  adminEmail: string;
}

export interface GiftConfig {
  id?: string;
  slug: string;
  recipientName: string;
  relationship: 'lover' | 'friend' | 'soulmate';
  heroHeading: string;
  subtitle: string;
  introHeading: string;
  introMessage: string;
  loveLetterHeading: string;
  loveLetter: string[];
  cakeHeading: string;
  cakeSubtitle: string;
  cakeWishMessage: string;
  finalHeading: string;
  finalMessage: string;
  themeId: ThemeId;
  music: {
    title: string;
    artist: string;
    src: string;
    isCustomUpload?: boolean;
    audioData?: string; // base64 or object URL fallback
  };
  passcode: string;
  passcodeHint?: string;
  isPasscodeProtected: boolean;
  photos?: Array<{ id: string; title: string; url: string }>;
  createdAt?: string;
}

export type ThemeId = 'sakura' | 'lavender' | 'peach' | 'mint' | 'sky' | 'roseGold';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  emoji: string;
  primary: string;       // main accent e.g. button gradient, title
  secondary: string;     // soft pastel e.g. tags, borders
  accent: string;        // vibrant highlight
  bgGradientFrom: string;// main page gradient start
  bgGradientVia: string; // main page gradient middle
  bgGradientTo: string;  // main page gradient end
  cardBg: string;        // glass panel tint
  textColor: string;     // primary text
  foliageColor: string;  // tree leaves color in 3D
  petalColors: string[]; // blossom colors for falling & bloom
}
