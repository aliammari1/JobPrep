import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface LiveKitTokenCache {
  token: string;
  expiresAt: number;
  roomUrl: string;
}

const TOKEN_CACHE: Map<string, LiveKitTokenCache> = new Map();
const TOKEN_EXPIRY_BUFFER = 60000; // 1 minute buffer before actual expiry
const TOKEN_RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

/**
 * Hook to get LiveKit token with caching and retry logic
 * Prevents multiple token fetches and reuses valid tokens
 */
export function useLiveKitToken(roomName: string) {
  const retryCountRef = useRef(0);
  const requestInFlightRef = useRef<Promise<string> | null>(null);

  const fetchTokenWithRetry = useCallback(
    async (attempt = 0): Promise<string> => {
      try {
        // Check cache first
        const cached = TOKEN_CACHE.get(roomName);
        if (cached && cached.expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER) {
          console.log('✅ Using cached LiveKit token');
          return cached.token;
        }

        console.log(`🔄 Fetching LiveKit token (attempt ${attempt + 1}/${MAX_RETRIES})`);

        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, retry with exponential backoff
            throw new Error('Rate limited');
          }
          throw new Error(`Token fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        const { token, url } = data;

        // Decode JWT to get expiry
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token format');
        
        const decoded = JSON.parse(atob(parts[1]));
        const expiresAt = decoded.exp * 1000; // Convert to ms

        // Cache token
        TOKEN_CACHE.set(roomName, {
          token,
          expiresAt,
          roomUrl: url,
        });

        console.log('✅ LiveKit token obtained and cached');
        retryCountRef.current = 0; // Reset retry count on success
        return token;
      } catch (error) {
        if (attempt < MAX_RETRIES - 1) {
          console.warn(
            `⚠️  Token fetch attempt ${attempt + 1} failed, retrying...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, TOKEN_RETRY_DELAY * (attempt + 1))
          );
          return fetchTokenWithRetry(attempt + 1);
        }

        console.error('❌ Failed to fetch LiveKit token after retries');
        throw error;
      }
    },
    [roomName]
  );

  // Deduplicate concurrent requests
  const getToken = useCallback(async (): Promise<string> => {
    if (requestInFlightRef.current) {
      console.log('⏳ Waiting for in-flight token request');
      return requestInFlightRef.current;
    }

    requestInFlightRef.current = fetchTokenWithRetry();

    try {
      const token = await requestInFlightRef.current;
      return token;
    } finally {
      requestInFlightRef.current = null;
    }
  }, [fetchTokenWithRetry]);

  // Invalidate cache on unmount
  useEffect(() => {
    return () => {
      console.log('🗑️  Cleaning up LiveKit token cache');
      TOKEN_CACHE.delete(roomName);
    };
  }, [roomName]);

  return { getToken, clearCache: () => TOKEN_CACHE.delete(roomName) };
}

/**
 * Hook for LiveKit connection with timeout and recovery
 */
export function useLiveKitConnection(roomName: string, participantName: string) {
  const { getToken } = useLiveKitToken(roomName);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connectWithTimeout = useCallback(async () => {
    return new Promise<string>((resolve, reject) => {
      connectionTimeoutRef.current = setTimeout(() => {
        reject(new Error('LiveKit connection timeout (15s)'));
      }, 15000);

      getToken()
        .then((token) => {
          if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
          resolve(token);
        })
        .catch((error) => {
          if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
          reject(error);
        });
    });
  }, [getToken]);

  const reconnectWithBackoff = useCallback(async (): Promise<string | null> => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      toast.error(
        'Failed to reconnect to LiveKit after multiple attempts. Please refresh the page.'
      );
      return null;
    }

    reconnectAttemptsRef.current++;
    const delayMs = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff

    console.log(
      `🔄 Reconnecting to LiveKit (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}) in ${delayMs}ms`
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
      return await connectWithTimeout();
    } catch (error) {
      console.error('Reconnection failed:', error);
      return reconnectWithBackoff(); // Recursive retry
    }
  }, [connectWithTimeout]);

  const resetReconnectAttempts = useCallback(() => {
    reconnectAttemptsRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectWithTimeout,
    reconnectWithBackoff,
    resetReconnectAttempts,
  };
}
