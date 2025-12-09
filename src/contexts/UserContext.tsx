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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

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
        setUser(data);
      } else if (response.status === 401) {
        // Explicitly clear user on 401 (not authenticated)
        setUser(null);
      } else {
        // Other errors - also clear user to be safe
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
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUser();
    }
  }, []); // Empty deps - only run on mount

  return (
    <UserContext.Provider value={{ user, isLoading, refetch: fetchUser }}>
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
