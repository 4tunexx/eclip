'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  level: number;
  role?: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const clearUser = useCallback(() => {
    console.log('[UserContext] Clearing user state');
    setUser(null);
    setIsLoading(false);
    hasFetchedRef.current = false; // Reset so next login triggers fetch
    isFetchingRef.current = false; // Reset fetch lock
    localStorage.setItem('logout_timestamp', Date.now().toString());
  }, []);

  const fetchUser = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[UserContext] User data fetched:', { id: data.id, username: data.username, role: data.role });
        setUser(data);
      } else if (response.status === 401) {
        // Explicitly clear user on 401 (not authenticated)
        console.log('[UserContext] 401 - Clearing user state');
        setUser(null);
      } else {
        // Other errors - also clear user to be safe
        console.log('[UserContext] Error response - Clearing user state');
        setUser(null);
      }
    } catch (error) {
      const name = (error as any)?.name;
      const msg = (error as any)?.message || '';
      const isAbort = name === 'AbortError' || /Failed to fetch/i.test(msg);
      if (!isAbort) {
        console.error('[UserContext] Error fetching user:', error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Check if user just logged out
    const logoutTime = localStorage.getItem('logout_timestamp');
    if (logoutTime) {
      const timeSinceLogout = Date.now() - parseInt(logoutTime);
      if (timeSinceLogout < 2000) {
        // User just logged out, don't fetch user data
        console.log('[UserContext] Skipping fetch - user just logged out');
        setIsLoading(false);
        setUser(null);
        hasFetchedRef.current = true;
        isFetchingRef.current = false;
        return;
      }
      // Clear old logout timestamp
      localStorage.removeItem('logout_timestamp');
    }
    
    // Only fetch once on mount or when hasFetchedRef is reset
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUser();
    }
  }, [fetchUser]);

  // Refetch when page becomes visible (user returned from auth flow)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to tab - refetch to get latest auth state
        console.log('[UserContext] Page became visible, refetching user...');
        hasFetchedRef.current = false;
        isFetchingRef.current = false; // Reset lock
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, isLoading, refetch: fetchUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
