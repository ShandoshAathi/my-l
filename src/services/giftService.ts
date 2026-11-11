import { GiftConfig, BirthdayPhoto } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PRIVATE_BUCKET } from './photoService';
import LZString from 'lz-string';

export const DEFAULT_GIFT_CONFIG: GiftConfig = {
  slug: 'for-my-love',
  recipientName: 'My Princess',
  relationship: 'lover',
  heroHeading: 'For You, My Love ♡',
  subtitle: 'A magical little world crafted just for you...',
  introHeading: 'Hey, My Princess ♡',
  introMessage:
    'Today is the most special day because the most beautiful, wonderful person in my world was born. I created this magical little anime universe just for you, filled with every ounce of my love.',
  loveLetterHeading: 'A Little Letter From My Heart',
  loveLetter: [
    'To the love of my life,',
    'Thank you for making my life brighter, my days happier, and my heart so much fuller.',
    'You are my favorite person, my sweetest memory, and my most beautiful tomorrow.',
    'I hope each day brings you all the gentle joy, soft laughter, and endless dreams you deserve.',
    'I love you today, tomorrow, and forever.',
    'Forever yours. ♡'
  ],
  cakeHeading: 'A Cake Just For You 🎂',
  cakeSubtitle: 'Close your eyes, make a secret wish, and blow out the candles...',
  cakeWishMessage: 'May all your beautiful wishes come true, now and forever. ♡',
  finalHeading: 'You Make My World Special ♡',
  finalMessage:
    'Thank you for being the brightest light and the sweetest melody in my life. May every step you take this year be filled with wonder, blooming cherry blossoms, and endless smiles.\n\nI love you more than words could ever say. Forever and always. ♡',
  themeId: 'sakura',
  music: {
    title: 'Romantic Anime Melody',
    artist: 'Acoustic Piano & Chimes',
    src: '/audio/romantic-piano.mp3',
    isCustomUpload: false
  },
  passcode: '143',
  passcodeHint: 'The magic 3-letter number for I Love You ♡',
  isPasscodeProtected: true
};

export const MUSIC_PRESETS = [
  {
    id: 'piano-chimes',
    title: 'Romantic Anime Melody',
    artist: 'Acoustic Piano & Chimes',
    src: '/audio/romantic-piano.mp3',
    desc: 'Soft acoustic piano with gentle music-box bells'
  },
  {
    id: 'lofi-sunset',
    title: 'Pink Sunset Romance',
    artist: 'Lo-Fi Chill Beats',
    src: 'https://cdn.freesound.org/previews/612/612627_11861866-lq.mp3',
    desc: 'Dreamy relaxed lo-fi vibes with warm vinyl warmth'
  },
  {
    id: 'music-box',
    title: 'Sweet Anime Music Box',
    artist: 'Studio Ghibli Inspired Chimes',
    src: 'https://cdn.freesound.org/previews/476/476558_9949987-lq.mp3',
    desc: 'Whimsical fairytale music box melody'
  },
  {
    id: 'guitar-warmth',
    title: 'Acoustic Love Song',
    artist: 'Warm Fingerstyle Guitar',
    src: 'https://cdn.freesound.org/previews/518/518428_649468-lq.mp3',
    desc: 'Tender fingerpicked guitar chords full of warmth'
  },
  {
    id: 'procedural-synth',
    title: 'Generative Lydian Harmonies',
    artist: 'Live Web Audio Synthesizer',
    src: '',
    desc: 'Endless procedurally generated romantic arpeggios'
  }
];

const LOCAL_GIFT_KEY = 'birthday_bloom_gift_config';

export function getStoredGiftConfig(): GiftConfig {
  try {
    const raw = localStorage.getItem(LOCAL_GIFT_KEY);
    if (!raw) return DEFAULT_GIFT_CONFIG;
    const parsed = JSON.parse(raw);
    const config = { ...DEFAULT_GIFT_CONFIG, ...parsed };
    if (!config.passcode || config.passcode.trim().length === 0) {
      config.passcode = '143';
      config.passcodeHint = config.passcodeHint || 'The magic 3-letter number for I Love You ♡';
      config.isPasscodeProtected = true;
    }
    return config;
  } catch {
    return DEFAULT_GIFT_CONFIG;
  }
}

export function saveStoredGiftConfig(config: GiftConfig): void {
  try {
    localStorage.setItem(LOCAL_GIFT_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save gift config to localStorage:', e);
  }
}

/**
 * Save gift surprise to Supabase `gift_surprises` table and localStorage
 */
export async function saveGiftSurprise(config: GiftConfig): Promise<GiftConfig> {
  saveStoredGiftConfig(config);

  if (!isSupabaseConfigured()) {
    return config;
  }

  try {
    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp?.user?.id;

    const payload = {
      slug: config.slug.trim().toLowerCase(),
      recipient_name: config.recipientName,
      passcode: config.passcode ? config.passcode.trim() : null,
      passcode_hint: config.passcodeHint || null,
      config: config,
      created_by: userId
    };

    const { data, error } = await supabase
      .from('gift_surprises')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase gift_surprises save error (using local storage):', error.message);
      return config;
    }

    return {
      ...config,
      id: data?.id
    };
  } catch (err) {
    console.warn('Failed to save to Supabase, local storage preserved:', err);
    return config;
  }
}

/**
 * Fetch a gift surprise by slug (e.g. from ?gift=my-love)
 */
export async function fetchGiftSurpriseBySlug(slug: string): Promise<GiftConfig | null> {
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Check local storage first
  const local = getStoredGiftConfig();
  if (local.slug.toLowerCase() === cleanSlug) {
    return local;
  }

  // 2. Fetch from Supabase
  if (!isSupabaseConfigured()) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('gift_surprises')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    if (error || !data) {
      return null;
    }

    const fetchedConfig: GiftConfig = {
      ...DEFAULT_GIFT_CONFIG,
      ...(data.config || {}),
      id: data.id,
      slug: data.slug,
      recipientName: data.recipient_name,
      passcode: data.passcode || '',
      passcodeHint: data.passcode_hint || '',
      isPasscodeProtected: Boolean(data.passcode && data.passcode.trim().length > 0)
    };

    return fetchedConfig;
  } catch {
    return null;
  }
}

/**
 * Upload custom romantic audio file to storage (or base64 fallback)
 */
export async function uploadCustomAudio(file: File): Promise<{ src: string; title: string }> {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    throw new Error('Unsupported audio format. Please upload MP3, WAV, OGG, or M4A.');
  }

  const maxSize = 25 * 1024 * 1024; // 25 MB
  if (file.size > maxSize) {
    throw new Error('Audio file exceeds the 25 MB size limit.');
  }

  const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || 'Our Song ♡';

  // If Supabase not configured, encode as base64 / Object URL
  if (!isSupabaseConfigured()) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          src: reader.result as string,
          title: cleanName
        });
      };
      reader.onerror = () => reject(new Error('Failed to read audio file locally.'));
      reader.readAsDataURL(file);
    });
  }

  // Supabase Storage upload
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
  const safeBase = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `audio/${Date.now()}-${safeBase}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .upload(path, file, { cacheControl: '86400', upsert: true });

  if (uploadErr) {
    throw new Error(`Audio upload failed: ${uploadErr.message}`);
  }

  const { data: signedData } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 30); // 30-day signed URL

  return {
    src: signedData?.signedUrl || `/audio/${file.name}`,
    title: cleanName
  };
}

/**
 * Universal Cross-Device Portable Surprise Link
 * Encodes the entire surprise payload (config, letter, passcode, theme, song, and photos)
 * into a single URL-safe string that opens flawlessly on ANY phone, tablet, or PC worldwide
 * with ZERO database dependency!
 */
export function generatePortableSurpriseLink(
  config: GiftConfig,
  photos?: BirthdayPhoto[],
  baseUrl?: string
): string {
  const origin = baseUrl ? baseUrl.replace(/\/$/, '') : window.location.origin;

  // Compact payload to keep URL as lightweight as possible
  const payload = {
    r: config.recipientName,
    rel: config.relationship,
    h: config.heroHeading,
    sub: config.subtitle,
    ih: config.introHeading,
    im: config.introMessage,
    lh: config.loveLetterHeading,
    l: config.loveLetter,
    ch: config.cakeHeading,
    cs: config.cakeSubtitle,
    cw: config.cakeWishMessage,
    fh: config.finalHeading,
    fm: config.finalMessage,
    t: config.themeId,
    m: {
      t: config.music.title,
      a: config.music.artist,
      s: config.music.src
    },
    p: config.passcode || '',
    ph: config.passcodeHint || '',
    pr: config.isPasscodeProtected,
    // Embed lightweight photo list
    pts: (photos || []).map((photo) => ({
      i: photo.id,
      t: photo.title,
      u: photo.signed_url || photo.storage_path
    }))
  };

  const jsonStr = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  return `${origin}/gift?surprise=${compressed}`;
}

/**
 * Decode compressed portable surprise payload
 */
export function decodePortableSurprise(compressed: string): {
  config: GiftConfig;
  photos: BirthdayPhoto[];
} | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(compressed);
    if (!jsonStr) return null;

    const p = JSON.parse(jsonStr);

    const config: GiftConfig = {
      ...DEFAULT_GIFT_CONFIG,
      slug: 'shared-surprise',
      recipientName: p.r || DEFAULT_GIFT_CONFIG.recipientName,
      relationship: p.rel || DEFAULT_GIFT_CONFIG.relationship,
      heroHeading: p.h || DEFAULT_GIFT_CONFIG.heroHeading,
      subtitle: p.sub || DEFAULT_GIFT_CONFIG.subtitle,
      introHeading: p.ih || DEFAULT_GIFT_CONFIG.introHeading,
      introMessage: p.im || DEFAULT_GIFT_CONFIG.introMessage,
      loveLetterHeading: p.lh || DEFAULT_GIFT_CONFIG.loveLetterHeading,
      loveLetter: Array.isArray(p.l) ? p.l : DEFAULT_GIFT_CONFIG.loveLetter,
      cakeHeading: p.ch || DEFAULT_GIFT_CONFIG.cakeHeading,
      cakeSubtitle: p.cs || DEFAULT_GIFT_CONFIG.cakeSubtitle,
      cakeWishMessage: p.cw || DEFAULT_GIFT_CONFIG.cakeWishMessage,
      finalHeading: p.fh || DEFAULT_GIFT_CONFIG.finalHeading,
      finalMessage: p.fm || DEFAULT_GIFT_CONFIG.finalMessage,
      themeId: p.t || DEFAULT_GIFT_CONFIG.themeId,
      music: {
        title: p.m?.t || DEFAULT_GIFT_CONFIG.music.title,
        artist: p.m?.a || DEFAULT_GIFT_CONFIG.music.artist,
        src: p.m?.s || DEFAULT_GIFT_CONFIG.music.src
      },
      passcode: p.p || '',
      passcodeHint: p.ph || '',
      isPasscodeProtected: Boolean(p.pr || (p.p && p.p.trim().length > 0))
    };

    const photos: BirthdayPhoto[] = Array.isArray(p.pts)
      ? p.pts.map((pt: { i: string; t: string; u: string }) => ({
          id: pt.i,
          title: pt.t,
          storage_path: pt.u,
          signed_url: pt.u,
          created_at: new Date().toISOString()
        }))
      : [];

    return { config, photos };
  } catch (err) {
    console.error('Failed to decode portable surprise link:', err);
    return null;
  }
}

/**
 * Generate full shareable URL with optional slug or encoded payload
 */
export function generateSurpriseLink(config: GiftConfig, baseUrl?: string): string {
  const origin = baseUrl ? baseUrl.replace(/\/$/, '') : window.location.origin;
  const slug = encodeURIComponent(config.slug.trim().toLowerCase());
  return `${origin}/gift?gift=${slug}`;
}
