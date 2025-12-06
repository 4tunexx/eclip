'use client';

import { useState, useEffect } from 'react';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchUser = async (signal?: AbortSignal) => {
    try {
      console.log('[useUser] Fetching user from /api/auth/me');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        signal,
      });
      console.log('[useUser] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[useUser] User data received:', data);
        setUser(data);
      } else {
        console.log('[useUser] Auth failed, clearing user');
        setUser(null);
      }
    } catch (error) {
      const name = (error as any)?.name;
      const msg = (error as any)?.message || '';
      const isAbort = name === 'AbortError' || /Failed to fetch/i.test(msg);
      if (!isAbort) {
        console.error('Error fetching user:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, refetch: fetchUser };
}

