import { useCallback, useRef } from 'react';

interface RequestCache<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

interface RequestOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  deduplicate?: boolean; // Deduplicate in-flight requests (default: true)
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const requestCache = new Map<string, RequestCache<any>>();
const inflightRequests = new Map<string, Promise<any>>();

/**
 * Hook for deduplicating and caching API requests
 * - Deduplicates simultaneous requests to the same endpoint
 * - Caches responses to avoid redundant calls
 * - Allows TTL-based cache invalidation
 */
export function useAPIRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: RequestOptions = {}
) {
  const { ttl = DEFAULT_TTL, deduplicate = true } = options;
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    const now = Date.now();

    // Check if we have a fresh cached response
    const cached = requestCache.get(key);
    if (cached && now - cached.timestamp < ttl) {
      console.log(`✓ Cache hit for ${key}`);
      return cached.data;
    }

    // If deduplication is enabled, check for in-flight request
    if (deduplicate && inflightRequests.has(key)) {
      console.log(`↔ Deduplicating request to ${key}`);
      return inflightRequests.get(key)!;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Execute the fetch
    const promise = fetcher()
      .then((data) => {
        // Cache the response
        requestCache.set(key, { data, timestamp: now });
        // Clear in-flight marker
        inflightRequests.delete(key);
        console.log(`✓ Fetched and cached ${key}`);
        return data;
      })
      .catch((error) => {
        // Clear in-flight marker on error
        inflightRequests.delete(key);
        console.error(`✗ Request failed for ${key}:`, error);
        throw error;
      });

    // Track in-flight request
    if (deduplicate) {
      inflightRequests.set(key, promise);
    }

    return promise;
  }, [key, fetcher, ttl, deduplicate]);

  const invalidate = useCallback(() => {
    requestCache.delete(key);
    console.log(`Invalidated cache for ${key}`);
  }, [key]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      inflightRequests.delete(key);
    }
  }, [key]);

  return { execute, invalidate, cancel };
}

/**
 * Global function to clear all caches
 */
export function clearAllAPICache() {
  requestCache.clear();
  inflightRequests.clear();
  console.log('Cleared all API caches');
}

/**
 * Global function to invalidate cache by pattern
 */
export function invalidateAPICache(pattern: string | RegExp) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  let count = 0;

  for (const key of requestCache.keys()) {
    if (regex.test(key)) {
      requestCache.delete(key);
      count++;
    }
  }

  console.log(`Invalidated ${count} cache entries matching ${pattern}`);
}
