import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle, Image as ImageIcon, Link2, Plus } from 'lucide-react';
import { uploadPhoto, addPhotoByUrl } from '../../services/photoService';

interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface PhotoUploaderProps {
  onUploadComplete: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUploadComplete }) => {
  const [tab, setTab] = useState<'files' | 'url'>('files');

  // File upload state
  const [items, setItems] = useState<SelectedFileItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // URL input state
  const [webUrl, setWebUrl] = useState('');
  const [webCaption, setWebCaption] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [urlSuccess, setUrlSuccess] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setGlobalError(null);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const newItems: SelectedFileItem[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setGlobalError(`"${file.name}" has an unsupported format. Please use JPG, PNG, or WEBP.`);
        return;
      }
      if (file.size > maxSize) {
        setGlobalError(`"${file.name}" exceeds the 10 MB size limit.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const cleanTitle = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[_-]/g, ' ') || 'Sweet memory ♡';

      newItems.push({
        id: Math.random().toString(36).substring(2),
        file,
        previewUrl,
        caption: cleanTitle,
        status: 'pending'
      });
    });

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption: newCaption } : item))
    );
  };

  const handleUploadAll = async () => {
    if (items.length === 0) return;
    setIsUploading(true);
    setGlobalError(null);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'success') continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'uploading' } : it))
      );

      try {
        await uploadPhoto(item.file, item.caption);
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'success' } : it))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'error', errorMessage: msg } : it
          )
        );
      }
    }

    setIsUploading(false);
    onUploadComplete();
  };

  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    setGlobalError(null);
    setIsAddingUrl(true);
    setUrlSuccess(false);

    try {
      await addPhotoByUrl(webUrl.trim(), webCaption.trim() || 'Sweet Memory ♡');
      setWebUrl('');
      setWebCaption('');
      setUrlSuccess(true);
      setTimeout(() => setUrlSuccess(false), 2500);
      onUploadComplete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add photo URL';
      setGlobalError(msg);
    } finally {
      setIsAddingUrl(false);
    }
  };

  return (
    <div className="rounded-3xl glass-card p-6 sm:p-8 shadow-glass border border-pastel-pink/50">
      <h3 className="font-heading text-xl font-bold text-gray-800 mb-1">
        Add Memories
      </h3>
      <p className="font-anime text-xs text-gray-500 mb-4">
        Upload photos or paste permanent image URLs that open across every phone and computer.
      </p>

      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-pastel-pink/20 p-1 mb-5 border border-pastel-pink/40">
        <button
          type="button"
          onClick={() => {
            setTab('files');
            setGlobalError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            tab === 'files' ? 'bg-white text-pastel-rose shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload Local Files
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('url');
            setGlobalError(null);
          }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
            tab === 'url' ? 'bg-white text-pastel-rose shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link2 className="h-3.5 w-3.5" />
          <span>Add by Web URL</span>
        </button>
      </div>

      {globalError && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* MODE 1: FILE UPLOADS */}
      {tab === 'files' && (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pastel-pink hover:border-pastel-rose bg-pastel-blush/40 hover:bg-pastel-pink/20 p-6 sm:p-8 cursor-pointer transition-colors text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-pastel-rose group-hover:scale-110 transition-transform mb-2">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-800">
              Click or drag & drop photos here
            </p>
            <p className="font-anime text-[11px] text-gray-500 mt-1">
              Supports JPG, PNG, WEBP (Up to 10 MB each)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Previews List */}
          {items.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Selected Photos ({items.length})
                </span>
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-xl bg-white/90 p-2 border border-pastel-pink/30 text-xs"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.caption}
                      className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-pastel-pink/30"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                        placeholder="Caption..."
                        className="w-full text-xs px-2 py-1 rounded border border-pastel-pink/30 bg-white"
                      />
                    </div>
                    {item.status !== 'uploading' && (
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadAll}
                disabled={isUploading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Save {items.length} Photos to Vault</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: WEB URL INPUT */}
      {tab === 'url' && (
        <form onSubmit={handleAddByUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Image Web Link (URL)
            </label>
            <input
              type="url"
              required
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or Imgur link"
              className="w-full px-3 py-2 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Tip: Paste links from Cloudinary, Imgur, Unsplash, or Google Drive direct image links.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Memory Caption / Story
            </label>
            <input
              type="text"
              value={webCaption}
              onChange={(e) => setWebCaption(e.target.value)}
              placeholder="e.g. Our favorite sunset walk ♡"
              className="w-full px-3 py-2 rounded-xl border border-pastel-pink/50 bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-pastel-rose"
            />
          </div>

          <button
            type="submit"
            disabled={isAddingUrl}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pastel-rose to-pastel-purple shadow-glow-rose hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
          >
            {isAddingUrl ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Add Web Photo</span>
              </>
            )}
          </button>

          {urlSuccess && (
            <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
              Photo added successfully! ✨
            </div>
          )}
        </form>
      )}
    </div>
  );
};
