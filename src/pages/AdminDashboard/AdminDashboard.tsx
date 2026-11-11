import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePhotos } from '../../hooks/usePhotos';
import { useGiftConfig } from '../../context/GiftConfigContext';
import { useTheme } from '../../context/ThemeContext';
import { THEME_PALETTES } from '../../context/ThemeContext';
import { AdminLogin } from './AdminLogin';
import { PhotoUploader } from './PhotoUploader';
import { SongManager } from './SongManager';
import { GiftLinkManager } from './GiftLinkManager';
import { LetterCustomizer } from './LetterCustomizer';
import { deletePhoto, updatePhotoCaption, replacePhoto } from '../../services/photoService';
import {
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Image as ImageIcon,
  Share2,
  Music,
  Heart,
  Palette,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';

type AdminTab = 'share' | 'photos' | 'music' | 'letter' | 'theme';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, signIn, sendOtp, verifyOtp, setPassword, isConfigured } = useAuth();
  const { photos, loading: photosLoading, refreshPhotos } = usePhotos();
  const { config, updateConfig, saveConfig } = useGiftConfig();
  const { themeId, setThemeId } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>('photos');

  // Photo actions
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetReplacePhoto, setTargetReplacePhoto] = useState<{ id: string; storagePath: string } | null>(null);

  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-blush">
        <div className="h-8 w-8 rounded-full border-3 border-pastel-rose border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in -> show login screen
  if (!user) {
    return (
      <AdminLogin
        onLogin={async (email, pass) => {
          await signIn(email, pass);
        }}
        onSendOtp={async (email) => {
          return await sendOtp(email);
        }}
        onVerifyOtp={async (email, code) => {
          return await verifyOtp(email, code);
        }}
        onSetPassword={async (pass) => {
          await setPassword(pass);
        }}
        isConfigured={isConfigured}
      />
    );
  }

  const handleDelete = async (id: string, storagePath: string) => {
    setActionError(null);
    try {
      await deletePhoto(id, storagePath);
      setDeleteConfirmId(null);
      await refreshPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      setActionError(msg);
    }
  };

  const handleSaveCaption = async (id: string) => {
    setActionError(null);
    try {
      await updatePhotoCaption(id, editingTitle);
      setEditingId(null);
      await refreshPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      setActionError(msg);
    }
  };

  const handleTriggerReplace = (id: string, storagePath: string) => {
    setTargetReplacePhoto({ id, storagePath });
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleFilePickedForReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetReplacePhoto) return;

    setActionError(null);
    setReplacingId(targetReplacePhoto.id);

    try {
      await replacePhoto(targetReplacePhoto.id, targetReplacePhoto.storagePath, file);
      await refreshPhotos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo replacement failed';
      setActionError(msg);
    } finally {
      setReplacingId(null);
      setTargetReplacePhoto(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blush via-white to-pastel-pink/20 pb-16 overflow-y-auto">
      <Navbar />

      {/* Hidden File Input for instant photo replacement */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleFilePickedForReplace}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl glass-card p-6 shadow-glass border border-pastel-pink/50 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-pink/50 text-pastel-rose text-xs font-bold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gift Creator & Admin Portal</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">
              Personalized Surprise Studio
            </h1>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="/gift"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-sm hover:shadow-md transition-all"
            >
              <Eye className="h-4 w-4" />
              <span>Preview As Recipient ♡</span>
            </a>

            <button
              onClick={() => {
                setActiveTab('share');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-pastel-pink/20 border border-pastel-pink/40 shadow-sm transition-all"
            >
              <Share2 className="h-4 w-4 text-pastel-rose" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {actionError && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('photos')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-pastel-rose to-pastel-purple text-white shadow-glow-rose'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-pastel-pink/40'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>1. Photos ({photos.length}) & Replace</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'music'
                ? 'bg-gradient-to-r from-pastel-rose to-pastel-purple text-white shadow-glow-rose'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-pastel-pink/40'
            }`}
          >
            <Music className="h-4 w-4" />
            <span>2. Romantic Song / Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'letter'
                ? 'bg-gradient-to-r from-pastel-rose to-pastel-purple text-white shadow-glow-rose'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-pastel-pink/40'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>3. Love Letter & Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'theme'
                ? 'bg-gradient-to-r from-pastel-rose to-pastel-purple text-white shadow-glow-rose'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-pastel-pink/40'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>4. World Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'share'
                ? 'bg-gradient-to-r from-pastel-rose to-pastel-purple text-white shadow-glow-rose'
                : 'bg-white/80 text-gray-600 hover:bg-white border border-pastel-pink/40'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>5. Secret Link & Passcode</span>
          </button>
        </div>

        {/* TAB 2: PHOTO VAULT & REPLACEMENT */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Uploader Column */}
            <div className="lg:col-span-1">
              <PhotoUploader onUploadComplete={refreshPhotos} />
            </div>

            {/* Existing Photos List with Instant Replace */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-glass border border-pastel-pink/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-gray-800">
                      Personal Memory Vault ({photos.length})
                    </h3>
                    <p className="font-anime text-xs text-gray-500">
                      Click <span className="font-bold text-pastel-rose">Replace Photo</span> to swap any image instantly without losing its slot or caption.
                    </p>
                  </div>
                </div>

                {photosLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-2xl bg-pastel-pink/20 animate-pulse" />
                    ))}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="font-anime text-sm">No photos uploaded yet. Upload memories on the left!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white/90 p-4 shadow-sm border border-pastel-pink/30 hover:border-pastel-rose transition-colors"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="relative">
                            <img
                              src={photo.signed_url}
                              alt={photo.title}
                              className="h-16 w-16 rounded-xl object-cover border border-pastel-pink/40 flex-shrink-0"
                            />
                            {replacingId === photo.id && (
                              <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full border-2 border-pastel-rose border-t-transparent animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {editingId === photo.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  className="text-sm px-2.5 py-1 rounded-lg border border-pastel-rose focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSaveCaption(photo.id)}
                                  className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                                  title="Save Caption"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px] sm:max-w-xs">
                                {photo.title}
                              </p>
                            )}
                            <span className="font-anime text-[11px] text-gray-400 block mt-0.5">
                              {new Date(photo.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Photo Controls: Replace, Edit Caption, Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Replace Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleTriggerReplace(photo.id, photo.storage_path)}
                            disabled={replacingId === photo.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-pastel-rose bg-pastel-pink/20 hover:bg-pastel-pink/40 border border-pastel-pink/40 transition-colors"
                            title="Replace this image"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${replacingId === photo.id ? 'animate-spin' : ''}`} />
                            <span>Replace</span>
                          </button>

                          {/* Edit Caption */}
                          <button
                            onClick={() => {
                              setEditingId(photo.id);
                              setEditingTitle(photo.title);
                            }}
                            className="p-2 rounded-xl text-gray-600 hover:text-pastel-rose hover:bg-pastel-pink/20 transition-colors"
                            title="Edit Caption"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Delete Photo */}
                          {deleteConfirmId === photo.id ? (
                            <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200">
                              <button
                                onClick={() => handleDelete(photo.id, photo.storage_path)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(photo.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROMANTIC SONG & AUDIO */}
        {activeTab === 'music' && (
          <SongManager
            config={config}
            onUpdateMusic={(music) => updateConfig({ music })}
          />
        )}

        {/* TAB 4: LOVE LETTER & ROMANTIC MESSAGES */}
        {activeTab === 'letter' && (
          <LetterCustomizer
            config={config}
            onUpdateConfig={updateConfig}
            onSave={saveConfig}
          />
        )}

        {/* TAB 4: WORLD THEME SELECTION */}
        {activeTab === 'theme' && (
          <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-glass border border-pastel-pink/50">
            <h3 className="font-heading text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Palette className="h-5 w-5 text-pastel-rose" />
              <span>Default Theme & Atmosphere</span>
            </h3>
            <p className="font-anime text-xs text-gray-500 mb-6">
              Pick the world color aesthetic that blossoms when your recipient opens the website.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.values(THEME_PALETTES).map((pal) => {
                const isSelected = pal.id === config.themeId || pal.id === themeId;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      updateConfig({ themeId: pal.id });
                      setThemeId(pal.id);
                      saveConfig();
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-pastel-rose bg-white shadow-md ring-2 ring-pastel-rose/40'
                        : 'border-pastel-pink/40 bg-white/60 hover:bg-white hover:border-pastel-rose'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{pal.emoji}</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pastel-rose">
                          <Check className="h-3 w-3" /> Selected
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-gray-800">{pal.name}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ background: pal.primary }} />
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ background: pal.secondary }} />
                      <div className="h-4 w-4 rounded-full border border-black/10" style={{ background: pal.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: GIFT LINK & SECRET PASSCODE */}
        {activeTab === 'share' && (
          <GiftLinkManager
            config={config}
            photos={photos}
            onUpdateConfig={updateConfig}
            onSave={saveConfig}
          />
        )}
      </main>
    </div>
  );
};
