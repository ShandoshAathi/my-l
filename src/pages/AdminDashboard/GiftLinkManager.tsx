import React, { useState, useMemo } from 'react';
import { GiftConfig, BirthdayPhoto } from '../../types';
import { generateSurpriseLink, generatePortableSurpriseLink } from '../../services/giftService';
import {
  Key,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Sparkles,
  Shield,
  Heart,
  Globe,
  Cloud,
  Smartphone
} from 'lucide-react';

interface GiftLinkManagerProps {
  config: GiftConfig;
  photos?: BirthdayPhoto[];
  onUpdateConfig: (partial: Partial<GiftConfig>) => void;
  onSave: () => Promise<GiftConfig>;
}

export const GiftLinkManager: React.FC<GiftLinkManagerProps> = ({
  config,
  photos = [],
  onUpdateConfig,
  onSave
}) => {
  const [linkType, setLinkType] = useState<'cloud' | 'portable'>('cloud');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Allow custom base URL override if testing on phone over LAN or deployed on Vercel
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [customDomain, setCustomDomain] = useState<string>('');

  const effectiveBaseUrl = useMemo(() => {
    if (customDomain.trim()) {
      let trimmed = customDomain.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      return trimmed;
    }
    return window.location.origin;
  }, [customDomain]);

  // Compute portable link (contains all custom data & photos)
  const portableUrl = useMemo(() => {
    return generatePortableSurpriseLink(config, photos, effectiveBaseUrl);
  }, [config, photos, effectiveBaseUrl]);

  // Compute cloud slug link
  const cloudUrl = useMemo(() => {
    return generateSurpriseLink(config, effectiveBaseUrl);
  }, [config, effectiveBaseUrl]);

  const activeUrl = linkType === 'portable' ? portableUrl : cloudUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndGenerate = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hey ${config.recipientName || 'my love'} ♡ I created a special romantic anime world just for you! 🌸\n\nOpen your surprise here: ${activeUrl}\n${
      config.passcode
        ? `Secret Passcode to unlock: ${config.passcode}\n(Hint: ${config.passcodeHint || 'From my heart to yours'})`
        : ''
    }`
  );

  return (
    <div className="space-y-6">
      {/* Main Share Card */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-glass border border-pastel-pink/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pastel-rose to-pastel-purple flex items-center justify-center text-white shadow-glow-rose">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-gray-800">
              Public Shareable Gift Link & Secret Passkey
            </h3>
            <p className="font-anime text-xs text-gray-500">
              Share this link with your love. When opened, they verify your passkey and your customized romantic world blossoms!
            </p>
          </div>
        </div>

        {/* Step-by-Step Flow Instruction Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-pastel-pink/30 via-white to-pastel-purple/20 p-4 border border-pastel-pink/60 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-pastel-rose flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 leading-relaxed">
            <p className="font-bold text-gray-800 text-sm mb-1">
              How Your Gift Experience Works:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li><strong className="text-gray-800">Customize:</strong> Edit your love letters, photos, cake wish & romantic music in the tabs above.</li>
              <li><strong className="text-gray-800">Set Secret Passkey:</strong> Set your secret passkey below (e.g. 143 or your special date).</li>
              <li><strong className="text-gray-800">Share Public Link:</strong> Copy the link or tap Share on WhatsApp.</li>
              <li><strong className="text-gray-800">Magical Reveal:</strong> Your love opens the link, enters your passkey, flowers bloom on screen, and your customized surprise plays!</li>
            </ol>
          </div>
        </div>

        {/* Link Format Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setLinkType('cloud')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              linkType === 'cloud'
                ? 'border-pastel-rose bg-white shadow-sm ring-2 ring-pastel-rose/30'
                : 'border-pastel-pink/40 bg-white/60 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                <Cloud className="h-4 w-4 text-pastel-rose" />
                <span>Short Clean Link</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                Recommended • Short
              </span>
            </div>
            <p className="font-anime text-[11px] text-gray-500">
              Clean short URL (e.g. <code className="text-pastel-rose font-bold">/gift?gift={config.slug}</code>). Perfect for sharing on WhatsApp and social media.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setLinkType('portable')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              linkType === 'portable'
                ? 'border-pastel-rose bg-white shadow-sm ring-2 ring-pastel-rose/30'
                : 'border-pastel-pink/40 bg-white/60 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-pastel-rose" />
                <span>Full Offline Link</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                Long URL
              </span>
            </div>
            <p className="font-anime text-[11px] text-gray-500">
              Encodes full data directly inside the URL without database. Note: This creates a very long link.
            </p>
          </button>
        </div>

        {/* Live URL Display Box */}
        <div className="p-4 rounded-2xl bg-white/95 border border-pastel-pink/50 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <LinkIcon className="h-4 w-4 text-pastel-rose flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm text-gray-700 truncate select-all font-medium">
              {activeUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-pastel-rose hover:bg-pastel-rose/90 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Copied! ✨</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white text-gray-600 hover:text-pastel-rose hover:bg-pastel-pink/20 border border-pastel-pink/40 transition-colors"
              title="Test Recipient View"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Multi-Device Host Advice */}
        {isLocalhost && (
          <div className="mb-6 rounded-2xl bg-pastel-blush/80 p-3.5 border border-pastel-pink/60 text-xs text-gray-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-pastel-rose">
              <Smartphone className="h-4 w-4" />
              <span>Opening on Another Phone or Device over Wi-Fi / Web</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              You are currently on <code className="bg-white px-1.5 py-0.5 rounded border">localhost:5173</code>. A phone on the same Wi-Fi cannot open <code className="bg-white px-1 rounded">localhost</code> directly.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-gray-600">
                Custom Domain or Wi-Fi IP:
              </span>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. 192.168.1.15:5173 or my-site.vercel.app"
                className="px-2.5 py-1 text-xs rounded-lg border border-pastel-pink/60 bg-white font-mono flex-1 w-full sm:w-auto"
              />
            </div>
          </div>
        )}

        {/* Passcode Lock Settings */}
        <div className="pt-2 border-t border-pastel-pink/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-pastel-rose" />
              <h4 className="font-heading text-sm font-bold text-gray-800">
                Secret Passcode Protection
              </h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.isPasscodeProtected}
                onChange={(e) => onUpdateConfig({ isPasscodeProtected: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pastel-rose"></div>
            </label>
          </div>

          <p className="font-anime text-xs text-gray-500">
            When enabled, the recipient must enter your secret password before the romantic website blooms and reveals itself.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-pastel-rose" />
                <span>Recipient Passcode / Password</span>
              </label>
              <input
                type="text"
                value={config.passcode}
                onChange={(e) =>
                  onUpdateConfig({
                    passcode: e.target.value,
                    isPasscodeProtected: Boolean(e.target.value.trim().length > 0)
                  })
                }
                placeholder="e.g. 143 or ouranniversary"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                The password the recipient must enter to open their gift.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pastel-rose" />
                <span>Passcode Hint (Optional)</span>
              </label>
              <input
                type="text"
                value={config.passcodeHint || ''}
                onChange={(e) => onUpdateConfig({ passcodeHint: e.target.value })}
                placeholder="e.g. The year we first fell in love ♡"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Displayed on the recipient's lock screen as a cute clue.
              </span>
            </div>
          </div>

          {/* Custom Link Slug */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Custom Link Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">/gift?gift=</span>
              <input
                type="text"
                value={config.slug}
                onChange={(e) =>
                  onUpdateConfig({
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
                  })
                }
                placeholder="for-my-love"
                className="flex-1 px-3.5 py-2 rounded-xl border border-pastel-pink/50 bg-white text-xs font-mono font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAndGenerate}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Save & Activate Link</span>
              </>
            )}
          </button>

          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share via WhatsApp</span>
          </a>

          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
              <Check className="h-3.5 w-3.5" />
              Gift Link Activated!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
