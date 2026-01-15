import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

interface SaveOptions {
  debounceMs?: number; // Debounce interval in milliseconds (default: 10000 = 10 seconds)
  persistToServer?: boolean; // Whether to save to server (default: true)
  persistToLocalStorage?: boolean; // Whether to save to localStorage (default: true)
  localStorageKey?: string; // Key prefix for localStorage
  onSave?: (data: any) => Promise<void>; // Custom save handler
  onError?: (error: Error) => void;
}

/**
 * Hook for debounced auto-save to both local storage and server
 * - Debounces saves to prevent hammering the server
 * - Saves to localStorage for instant recovery
 * - Optionally persists to server with error handling
 * - Prevents loss of data on navigation
 */
export function useAutoSave<T>(
  data: T,
  identifier: string,
  options: SaveOptions = {},
) {
  const {
    debounceMs = 10000, // 10 seconds
    persistToServer = true,
    persistToLocalStorage = true,
    localStorageKey = `autosave_${identifier}`,
    onSave,
    onError,
  } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<T | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    // Skip if data is undefined or null
    if (data === undefined || data === null) {
      return;
    }

    // Skip if data hasn't changed
    if (JSON.stringify(lastSavedRef.current) === JSON.stringify(data)) {
      return;
    }

    // Skip if already saving
    if (isSavingRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;

      // Save to localStorage (instant, no async needed)
      if (persistToLocalStorage) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(data));
          localStorage.setItem(
            `${localStorageKey}_timestamp`,
            new Date().toISOString(),
          );
          console.log(`✓ Saved to localStorage: ${localStorageKey}`);
        } catch (error) {
          console.warn(`Failed to save to localStorage:`, error);
          // Don't throw - localStorage isn't critical
        }
      }

      // Save to server (async, with error handling)
      if (persistToServer && onSave) {
        try {
          await onSave(data);
          console.log(`✓ Saved to server: ${identifier}`);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(`Failed to save to server:`, err);
          if (onError) {
            onError(err);
          }
          toast.error("Failed to save changes to server", {
            description: "Changes saved locally. Will retry when online.",
          });
        }
      }

      lastSavedRef.current = structuredClone(data);
    } finally {
      isSavingRef.current = false;
    }
  }, [
    data,
    identifier,
    localStorageKey,
    persistToServer,
    persistToLocalStorage,
    onSave,
    onError,
  ]);

  // Debounced auto-save on data change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounceMs, save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Save immediately on unmount
      save();
    };
  }, [save]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!persistToLocalStorage) return;

    const loadData = () => {
      try {
        const saved = localStorage.getItem(localStorageKey);
        const timestamp = localStorage.getItem(`${localStorageKey}_timestamp`);

        if (saved && timestamp) {
          console.log(`✓ Loaded from localStorage: ${localStorageKey}`);
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn(`Failed to load from localStorage:`, error);
      }

      return null;
    };

    const loaded = loadData();
    if (loaded) {
      lastSavedRef.current = loaded;
    } else if (data !== undefined) {
      lastSavedRef.current = JSON.parse(JSON.stringify(data));
    }
  }, []);

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await save();
  }, [save]);

  const clearAutoSave = useCallback(() => {
    if (persistToLocalStorage) {
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(`${localStorageKey}_timestamp`);
    }
    requestCache.delete(localStorageKey);
  }, [localStorageKey, persistToLocalStorage]);

  return {
    saveNow,
    clearAutoSave,
    hasUnsavedChanges:
      JSON.stringify(lastSavedRef.current) !== JSON.stringify(data),
  };
}

// Simple cache for saved data
const requestCache = new Map<string, any>();
