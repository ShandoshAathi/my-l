import React, { useState } from 'react';
import { GiftConfig } from '../../types';
import { Heart, Sparkles, Plus, Trash2, Check, MessageSquareHeart } from 'lucide-react';

interface LetterCustomizerProps {
  config: GiftConfig;
  onUpdateConfig: (partial: Partial<GiftConfig>) => void;
  onSave: () => Promise<GiftConfig>;
}

export const LetterCustomizer: React.FC<LetterCustomizerProps> = ({ config, onUpdateConfig, onSave }) => {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLineChange = (index: number, val: string) => {
    const updated = [...config.loveLetter];
    updated[index] = val;
    onUpdateConfig({ loveLetter: updated });
  };

  const handleAddLine = () => {
    onUpdateConfig({ loveLetter: [...config.loveLetter, ''] });
  };

  const handleRemoveLine = (index: number) => {
    const updated = config.loveLetter.filter((_, i) => i !== index);
    onUpdateConfig({ loveLetter: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Recipient & Relationship Card */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50">
        <h3 className="font-heading text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Heart className="h-4 w-4 text-pastel-rose fill-pastel-rose" />
          <span>Gift Recipient Information</span>
        </h3>
        <p className="font-anime text-xs text-gray-500 mb-4">
          Choose whether this gift website is for a lover, partner, or dear friend.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Recipient Pet Name / Real Name
            </label>
            <input
              type="text"
              value={config.recipientName}
              onChange={(e) => onUpdateConfig({ recipientName: e.target.value })}
              placeholder="e.g. My Princess, Sweetheart, Sarah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Relationship / Occasion
            </label>
            <select
              value={config.relationship}
              onChange={(e) => onUpdateConfig({ relationship: e.target.value as GiftConfig['relationship'] })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            >
              <option value="lover">Romantic Lover / Partner ♡</option>
              <option value="friend">Best Friend / Forever Buddy ✨</option>
              <option value="soulmate">Soulmate / Special Bond 💖</option>
            </select>
          </div>
        </div>
      </div>

      {/* Headings & Intro Note */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 space-y-4">
        <h3 className="font-heading text-lg font-bold text-gray-800 flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4 text-pastel-rose" />
          <span>Welcome Headings & Introduction</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Main Welcome Heading (Hero)
            </label>
            <input
              type="text"
              value={config.heroHeading}
              onChange={(e) => onUpdateConfig({ heroHeading: e.target.value })}
              placeholder="For You, My Love ♡"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Welcome Subtitle
            </label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => onUpdateConfig({ subtitle: e.target.value })}
              placeholder="A magical little world crafted just for you..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Intro Note Heading
          </label>
          <input
            type="text"
            value={config.introHeading}
            onChange={(e) => onUpdateConfig({ introHeading: e.target.value })}
            placeholder="Hey, My Princess ♡"
            className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Intro Note Body Message
          </label>
          <textarea
            rows={3}
            value={config.introMessage}
            onChange={(e) => onUpdateConfig({ introMessage: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose leading-relaxed"
          />
        </div>
      </div>

      {/* Love Letter Customizer */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pastel-rose" />
              <span>3D Love Letter Envelope Message</span>
            </h3>
            <p className="font-anime text-xs text-gray-500">
              Revealed when the recipient taps the heart seal on the 3D envelope.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddLine}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-pastel-rose bg-pastel-pink/30 hover:bg-pastel-pink/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Line</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Letter Section Heading
          </label>
          <input
            type="text"
            value={config.loveLetterHeading}
            onChange={(e) => onUpdateConfig({ loveLetterHeading: e.target.value })}
            placeholder="A Little Letter From My Heart"
            className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
          />
        </div>

        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-gray-600">
            Letter Paragraphs / Sentences
          </label>
          {config.loveLetter.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-gray-400 w-5 text-right">{idx + 1}.</span>
              <input
                type="text"
                value={line}
                onChange={(e) => handleLineChange(idx, e.target.value)}
                placeholder="Write your heartfelt sentence..."
                className="flex-1 px-3 py-2 rounded-xl border border-pastel-pink/40 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
              />
              {config.loveLetter.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLine(idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Remove sentence"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cake Wish & Finale */}
      <div className="rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 space-y-4">
        <h3 className="font-heading text-lg font-bold text-gray-800">
          Cake Wish & Finale Surprise
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Cake Wish Message (Revealed on Candle Blow)
            </label>
            <input
              type="text"
              value={config.cakeWishMessage}
              onChange={(e) => onUpdateConfig({ cakeWishMessage: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Final Scene Heading
            </label>
            <input
              type="text"
              value={config.finalHeading}
              onChange={(e) => onUpdateConfig({ finalHeading: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Closing Romantic Message
          </label>
          <textarea
            rows={3}
            value={config.finalMessage}
            onChange={(e) => onUpdateConfig({ finalMessage: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose leading-relaxed"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {isSaving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Save All Letter Changes</span>
            </>
          )}
        </button>

        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            Letters & Messages Saved!
          </span>
        )}
      </div>
    </form>
  );
};
