import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BirthdayPhoto } from '../types';

export const PRIVATE_BUCKET = 'birthday-private';

export const DEMO_MEMORIES: BirthdayPhoto[] = [
  {
    id: 'demo-1',
    title: 'The day our love story bloomed 🌸',
    storage_path: 'demo/memory-1.jpg',
    signed_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'Your radiant smile under golden skies 🌅',
    storage_path: 'demo/memory-2.jpg',
    signed_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3',
    title: 'A sweet afternoon filled with laughter ✨',
    storage_path: 'demo/memory-3.jpg',
    signed_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'demo-4',
    title: 'Walking together under cherry blossoms 🌸',
    storage_path: 'demo/memory-4.jpg',
    signed_url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'demo-5',
    title: 'Little quiet moments, everlasting warmth ♡',
    storage_path: 'demo/memory-5.jpg',
    signed_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 'demo-6',
    title: 'You, my sweetest dream come true 💖',
    storage_path: 'demo/memory-6.jpg',
    signed_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'demo-7',
    title: 'Hand in hand beneath the starlight 🌌',
    storage_path: 'demo/memory-7.jpg',
    signed_url: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 518400000).toISOString()
  },
  {
    id: 'demo-8',
    title: 'That spontaneous coffee date smile ☕',
    storage_path: 'demo/memory-8.jpg',
    signed_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: 'demo-9',
    title: 'Wrapped in cozy warm hugs on a rainy day ☔',
    storage_path: 'demo/memory-9.jpg',
    signed_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 691200000).toISOString()
  },
  {
    id: 'demo-10',
    title: 'Watching the ocean waves at dusk 🌊',
    storage_path: 'demo/memory-10.jpg',
    signed_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 777600000).toISOString()
  },
  {
    id: 'demo-11',
    title: 'Your laughter lights up my entire world ✨',
    storage_path: 'demo/memory-11.jpg',
    signed_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: 'demo-12',
    title: 'Every day with you is my favorite adventure 💫',
    storage_path: 'demo/memory-12.jpg',
    signed_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80',
    created_at: new Date(Date.now() - 950400000).toISOString()
  }
];

const LOCAL_PHOTOS_KEY = 'birthday_bloom_photos';

function getLocalStoredPhotos(): BirthdayPhoto[] {
  try {
    const raw = localStorage.getItem(LOCAL_PHOTOS_KEY);
    if (!raw) return DEMO_MEMORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_MEMORIES;
  } catch {
    return DEMO_MEMORIES;
  }
}

function saveLocalPhotos(photos: BirthdayPhoto[]): void {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

export async function fetchPhotos(): Promise<BirthdayPhoto[]> {
  if (!isSupabaseConfigured()) {
    return getLocalStoredPhotos();
  }

  try {
    const { data, error } = await supabase
      .from('birthday_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalStoredPhotos();
    }

    // Resolve URLs for each photo
    const photosWithUrls = await Promise.all(
      data.map(async (photo) => {
        try {
          if (photo.storage_path.startsWith('http://') || photo.storage_path.startsWith('https://')) {
            return {
              ...photo,
              signed_url: photo.storage_path
            };
          }

          const { data: publicData } = supabase.storage
            .from(PRIVATE_BUCKET)
            .getPublicUrl(photo.storage_path);

          if (publicData?.publicUrl) {
            return {
              ...photo,
              signed_url: publicData.publicUrl
            };
          }

          const { data: signedData } = await supabase.storage
            .from(PRIVATE_BUCKET)
            .createSignedUrl(photo.storage_path, 86400 * 30);

          return {
            ...photo,
            signed_url: signedData?.signedUrl || photo.storage_path
          };
        } catch {
          return photo;
        }
      })
    );

    // If less than 10 photos uploaded to Supabase, supplement with demo memories to ensure at least 10 photos on tree
    if (photosWithUrls.length < 10) {
      const needed = 10 - photosWithUrls.length;
      return [...photosWithUrls, ...DEMO_MEMORIES.slice(0, needed)];
    }

    return photosWithUrls;
  } catch {
    return getLocalStoredPhotos();
  }
}

export async function uploadPhoto(file: File, title: string): Promise<BirthdayPhoto> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WEBP images are supported.');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File exceeds the 10 MB maximum upload limit.');
  }

  // Graceful fallback for local demo mode if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newPhoto: BirthdayPhoto = {
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: title.trim() || 'Sweet Memory ♡',
          storage_path: `local/${file.name}`,
          signed_url: reader.result as string,
          created_at: new Date().toISOString()
        };
        const current = getLocalStoredPhotos();
        const updated = [newPhoto, ...current.filter((p) => !p.id.startsWith('demo-'))];
        saveLocalPhotos(updated);
        resolve(newPhoto);
      };
      reader.onerror = () => reject(new Error('Failed to read image file locally.'));
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBase = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniquePath = `memories/${Date.now()}-${cleanBase}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp?.user?.id;
  const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  const { data: insertData, error: dbError } = await supabase
    .from('birthday_photos')
    .insert([
      {
        title: title.trim() || 'Sweet Memory ♡',
        storage_path: uniquePath,
        created_by: isValidUuid ? userId : null
      }
    ])
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from(PRIVATE_BUCKET).remove([uniquePath]);
    throw new Error(`Database record creation failed: ${dbError.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(PRIVATE_BUCKET)
    .getPublicUrl(uniquePath);

  return {
    ...insertData,
    signed_url: publicData?.publicUrl || uniquePath
  };
}

export async function addPhotoByUrl(url: string, title: string): Promise<BirthdayPhoto> {
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:')) {
    throw new Error('Please enter a valid image URL starting with https://');
  }

  const newPhoto: BirthdayPhoto = {
    id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    title: title.trim() || 'Sweet Memory ♡',
    storage_path: cleanUrl,
    signed_url: cleanUrl,
    created_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured()) {
    const current = getLocalStoredPhotos();
    const updated = [newPhoto, ...current.filter((p) => !p.id.startsWith('demo-'))];
    saveLocalPhotos(updated);
    return newPhoto;
  }

  try {
    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp?.user?.id;
    const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const { data: insertData, error: dbError } = await supabase
      .from('birthday_photos')
      .insert([
        {
          title: title.trim() || 'Sweet Memory ♡',
          storage_path: cleanUrl,
          created_by: isValidUuid ? userId : null
        }
      ])
      .select()
      .single();

    if (dbError) {
      const current = getLocalStoredPhotos();
      const updated = [newPhoto, ...current.filter((p) => !p.id.startsWith('demo-'))];
      saveLocalPhotos(updated);
      return newPhoto;
    }

    return {
      ...insertData,
      signed_url: cleanUrl
    };
  } catch {
    const current = getLocalStoredPhotos();
    const updated = [newPhoto, ...current.filter((p) => !p.id.startsWith('demo-'))];
    saveLocalPhotos(updated);
    return newPhoto;
  }
}

export async function replacePhoto(
  id: string,
  oldStoragePath: string,
  newFile: File,
  newTitle?: string
): Promise<BirthdayPhoto> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(newFile.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WEBP images are supported.');
  }

  const maxSize = 10 * 1024 * 1024;
  if (newFile.size > maxSize) {
    throw new Error('File exceeds the 10 MB maximum upload limit.');
  }

  // Local fallback
  if (!isSupabaseConfigured() || id.startsWith('demo-') || id.startsWith('local-')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const current = getLocalStoredPhotos();
        const photoIdx = current.findIndex((p) => p.id === id);
        const updatedPhoto: BirthdayPhoto = {
          id: id.startsWith('demo-') ? 'local-' + Date.now() : id,
          title: newTitle || (photoIdx >= 0 ? current[photoIdx].title : 'Replaced Memory ♡'),
          storage_path: `local/${newFile.name}`,
          signed_url: reader.result as string,
          created_at: new Date().toISOString()
        };

        let updatedList: BirthdayPhoto[];
        if (photoIdx >= 0) {
          updatedList = [...current];
          updatedList[photoIdx] = updatedPhoto;
        } else {
          updatedList = [updatedPhoto, ...current];
        }
        saveLocalPhotos(updatedList);
        resolve(updatedPhoto);
      };
      reader.onerror = () => reject(new Error('Failed to replace photo locally.'));
      reader.readAsDataURL(newFile);
    });
  }

  // Supabase replace
  const ext = newFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBase = newFile.name.substring(0, newFile.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniquePath = `memories/${Date.now()}-${cleanBase}.${ext}`;

  // 1. Upload new file
  const { error: uploadError } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .upload(uniquePath, newFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload replacement image: ${uploadError.message}`);
  }

  // 2. Update DB record
  const updatePayload: { storage_path: string; title?: string } = {
    storage_path: uniquePath
  };
  if (newTitle) updatePayload.title = newTitle.trim();

  const { data: updatedRecord, error: updateError } = await supabase
    .from('birthday_photos')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    await supabase.storage.from(PRIVATE_BUCKET).remove([uniquePath]);
    throw new Error(`Failed to update photo record: ${updateError.message}`);
  }

  // 3. Remove old storage object if not demo
  if (oldStoragePath && !oldStoragePath.startsWith('demo/')) {
    await supabase.storage.from(PRIVATE_BUCKET).remove([oldStoragePath]);
  }

  // 4. Generate signed URL
  const { data: signedData } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .createSignedUrl(uniquePath, 3600);

  return {
    ...updatedRecord,
    signed_url: signedData?.signedUrl
  };
}

export async function deletePhoto(id: string, storagePath: string): Promise<void> {
  if (!isSupabaseConfigured() || id.startsWith('demo-') || id.startsWith('local-')) {
    const current = getLocalStoredPhotos();
    const filtered = current.filter((p) => p.id !== id);
    saveLocalPhotos(filtered);
    return;
  }

  await supabase.storage.from(PRIVATE_BUCKET).remove([storagePath]);

  const { error: dbError } = await supabase
    .from('birthday_photos')
    .delete()
    .eq('id', id);

  if (dbError) {
    throw new Error(`Failed to delete database record: ${dbError.message}`);
  }
}

export async function updatePhotoCaption(id: string, newTitle: string): Promise<void> {
  if (!isSupabaseConfigured() || id.startsWith('demo-') || id.startsWith('local-')) {
    const current = getLocalStoredPhotos();
    const updated = current.map((p) =>
      p.id === id ? { ...p, title: newTitle.trim() } : p
    );
    saveLocalPhotos(updated);
    return;
  }

  const { error } = await supabase
    .from('birthday_photos')
    .update({ title: newTitle.trim() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update caption: ${error.message}`);
  }
}
