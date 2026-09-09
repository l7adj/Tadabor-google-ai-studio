import { useEffect, useRef } from 'react';
import { TadabburMap } from '../types';
import { saveStoredMaps } from '../lib/storage';

const DEBOUNCE_DELAY_MS = 750;

/**
 * Service hook to manage debounced persistent saving of maps.
 * Ensures localStorage operations never block interactive high-frequency canvas interactions,
 * while guaranteeing synchronous persistence before browser/tab unload.
 */
export function useMapPersistence(maps: TadabburMap[]) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveStoredMaps(maps);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [maps]);

  // Synchronous flush on page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveStoredMaps(maps);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [maps]);
}
