import { useState, useEffect, useRef, useCallback } from 'react';
import { birthdayConfig } from '../config/birthdayConfig';

// Romantic anime chords (pentatonic and tender lydian progression)
// Frequencies in Hz: C4, D4, E4, G4, A4, B4, C5, D5, E5, G5
const CHORD_NOTES: number[][] = [
  // Cmaj7 (C, E, G, B)
  [261.63, 329.63, 392.00, 493.88, 523.25],
  // Am7 (A, C, E, G)
  [220.00, 261.63, 329.63, 392.00, 440.00],
  // Fmaj7 (F, A, C, E)
  [174.61, 220.00, 261.63, 329.63, 349.23],
  // G7sus4 -> G (G, C, D, G)
  [196.00, 261.63, 293.66, 392.00, 493.88]
];

export function useProceduralMusic(customTrack?: { src?: string; title?: string; artist?: string } | null) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [isUsingProcedural, setIsUsingProcedural] = useState<boolean>(false);

  const activeTrack = customTrack && customTrack.src ? {
    title: customTrack.title || birthdayConfig.music.title,
    artist: customTrack.artist || birthdayConfig.music.artist,
    src: customTrack.src,
    fallbackProcedural: true
  } : birthdayConfig.music;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const sequenceTimerRef = useRef<number | null>(null);

  // Play a single soft music note
  const playNote = useCallback((freq: number, startTime: number, duration: number, gainVal: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Soft warm chime timbre
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + duration);

    // Gentle exponential envelope
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(gainVal * volume * 0.25, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, [volume]);

  // Start procedural generative piano loop
  const startProceduralSynth = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      setIsUsingProcedural(true);
      let chordIndex = 0;
      let step = 0;

      const scheduleLoop = () => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;
        const currentChord = CHORD_NOTES[chordIndex];

        // Play gentle arpeggiated chime
        const note = currentChord[step % currentChord.length];
        playNote(note, now, 1.8, 0.4);

        // Sub-bass note on beat 0
        if (step === 0) {
          playNote(currentChord[0] / 2, now, 3.2, 0.5);
        }

        step = (step + 1) % 8;
        if (step === 0) {
          chordIndex = (chordIndex + 1) % CHORD_NOTES.length;
        }

        sequenceTimerRef.current = window.setTimeout(scheduleLoop, 450);
      };

      scheduleLoop();
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }, [playNote]);

  const stopProceduralSynth = useCallback(() => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.suspend().catch(() => {});
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Initialize standard audio element
  useEffect(() => {
    if (!activeTrack.src) {
      setIsUsingProcedural(true);
      return;
    }

    const audio = new Audio(activeTrack.src);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      console.info('Custom audio file not found; falling back to procedural romantic synthesizer.');
      if (isPlayingRef.current) {
        startProceduralSynth();
      }
    });

    return () => {
      try {
        audio.pause();
      } catch (e) {
        // ignore
      }
      audio.src = '';
      stopProceduralSynth();
    };
  }, [activeTrack.src, startProceduralSynth, stopProceduralSynth, volume]);

  const playMusic = useCallback(async () => {
    isPlayingRef.current = true;
    setIsPlaying(true);

    if (audioRef.current && audioRef.current.src && !isUsingProcedural) {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn('HTML5 audio play blocked or failed, using procedural synth:', err);
        startProceduralSynth();
      }
    } else {
      startProceduralSynth();
    }
  }, [isUsingProcedural, startProceduralSynth]);

  const pauseMusic = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopProceduralSynth();
  }, [stopProceduralSynth]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }, [isPlaying, pauseMusic, playMusic]);

  const changeVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  return {
    isPlaying,
    volume,
    isUsingProcedural,
    playMusic,
    pauseMusic,
    toggleMusic,
    changeVolume,
    trackInfo: activeTrack
  };
}
