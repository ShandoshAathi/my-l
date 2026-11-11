import { useState, useEffect, useCallback } from 'react';
import { BirthdayPhoto } from '../types';
import { fetchPhotos } from '../services/photoService';
import { useGiftConfig } from '../context/GiftConfigContext';

export function usePhotos() {
  const { sharedPhotos } = useGiftConfig();
  const [photos, setPhotos] = useState<BirthdayPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    if (sharedPhotos && sharedPhotos.length > 0) {
      setPhotos(sharedPhotos);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load photos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sharedPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    error,
    refreshPhotos: loadPhotos
  };
}
