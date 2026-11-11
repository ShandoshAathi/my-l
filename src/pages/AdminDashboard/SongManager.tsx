import React, { useState, useRef } from 'react';
import { Music, Upload, Play, Pause, Sparkles, Check, Disc3 } from 'lucide-react';
import { MUSIC_PRESETS, uploadCustomAudio } from '../../services/giftService';
import { GiftConfig } from '../../types';

interface SongManagerProps {
  config: GiftConfig;
  onUpdateMusic: (music: GiftConfig['music']) => void;
}

export const SongManager: React.FC<SongManagerProps> = ({ config, onUpdateMusic }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('piano-chimes');
  const [title, setTitle] = useState(config.music.title);
  const [artist, setArtist] = useState(config.music.artist);
  const [src, setSrc] = useState(config.music.src);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const togglePreview = () => {
    if (!audioPreviewRef.current) {
      if (!src) return;
      const audio = new Audio(src);
      audio.loop = true;
      audioPreviewRef.current = audio;
      audio.play().then(() => setIsPlayingPreview(true)).catch(() => setIsPlayingPreview(false));
      return;
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.src = src;
      audioPreviewRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => setIsPlayingPreview(false));
    }
  };

  const handleSelectPreset = (preset: typeof MUSIC_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setArtist(preset.artist);
    setSrc(preset.src);

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = preset.src;
      if (isPlayingPreview && preset.src) {
        audioPreviewRef.current.play().catch(() => {});
      }
    }

    onUpdateMusic({
      title: preset.title,
      artist: preset.artist,
      src: preset.src,
      isCustomUpload: false
    });

    triggerSavedFeedback();
  };

  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await uploadCustomAudio(file);
      setTitle(res.title);
      setArtist('Personal Upload');
      setSrc(res.src);
      setSelectedPresetId('custom');

      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.src = res.src;
        setIsPlayingPreview(false);
      }

      onUpdateMusic({
        title: res.title,
        artist: 'Personal Upload',
        src: res.src,
        isCustomUpload: true
      });

      triggerSavedFeedback();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Audio upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMusic({
      title: title.trim() || 'Romantic Melody',
      artist: artist.trim() || 'Special Song',
      src,
      isCustomUpload: selectedPresetId === 'custom'
    });
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Active Song Banner */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pastel-rose to-pastel-purple flex items-center justify-center text-white shadow-glow-rose flex-shrink-0 animate-pulse-soft">
            <Disc3 className={`h-7 w-7 ${isPlayingPreview ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pastel-pink/40 text-pastel-rose text-[11px] font-bold mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Current Gift Song</span>
            </div>
            <h4 className="font-heading text-lg font-bold text-gray-800">{title}</h4>
            <p className="font-anime text-xs text-gray-500">{artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={togglePreview}
            disabled={!src}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all ${
              isPlayingPreview
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-gradient-to-r from-pastel-rose to-pastel-purple hover:shadow-lg'
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Play Preview</span>
              </>
            )}
          </button>

          {savedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
              <Check className="h-3.5 w-3.5" />
              Saved!
            </span>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-xs sm:text-sm">
          {uploadError}
        </div>
      )}

      {/* Option 1: Upload Custom Song */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50">
        <h4 className="font-heading text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Upload className="h-4 w-4 text-pastel-rose" />
          <span>Upload Custom Romantic Song</span>
        </h4>
        <p className="font-anime text-xs text-gray-500 mb-4">
          Upload your girlfriend or friend's favorite song (MP3, WAV, OGG, or M4A up to 25 MB).
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleCustomAudioUpload}
          accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a"
          className="hidden"
          id="custom-audio-upload"
        />

        <label
          htmlFor="custom-audio-upload"
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isUploading
              ? 'border-pastel-rose bg-pastel-blush/40'
              : 'border-pastel-pink/60 hover:border-pastel-rose hover:bg-white/80 bg-white/40'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-full border-2 border-pastel-rose border-t-transparent animate-spin" />
              <span className="font-anime text-xs font-semibold text-pastel-rose">Uploading romantic track...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="h-10 w-10 rounded-xl bg-pastel-pink/50 text-pastel-rose flex items-center justify-center">
                <Music className="h-5 w-5" />
              </div>
              <p className="font-anime text-xs font-bold text-gray-700">
                Click to browse and upload an audio file
              </p>
              <p className="font-anime text-[11px] text-gray-400">
                Supports .mp3, .wav, .m4a, .ogg (Max 25 MB)
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Option 2: Choose from Curated Melodies */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50">
        <h4 className="font-heading text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pastel-rose" />
          <span>Or Choose from Romantic Presets</span>
        </h4>
        <p className="font-anime text-xs text-gray-500 mb-4">
          Select ready-to-play anime melodies that loop seamlessly during their visit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MUSIC_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'border-pastel-rose bg-white shadow-sm ring-2 ring-pastel-rose/30'
                    : 'border-pastel-pink/40 bg-white/60 hover:bg-white hover:border-pastel-rose'
                }`}
              >
                <div>
                  <p className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <span>{preset.title}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-pastel-rose" />}
                  </p>
                  <p className="font-anime text-[11px] text-pastel-rose font-medium mt-0.5">{preset.artist}</p>
                  <p className="font-anime text-[10px] text-gray-500 mt-1 leading-snug">{preset.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Title & Artist Labels */}
      <form onSubmit={handleSaveMeta} className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 space-y-4">
        <h4 className="font-heading text-base font-bold text-gray-800">Song Information Labels</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Can't Help Falling in Love"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Artist / Dedication</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Dedicated by your lover ♡"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-pastel-rose hover:bg-pastel-rose/90 shadow-sm transition-all"
        >
          Update Song Labels
        </button>
      </form>
    </div>
  );
};
