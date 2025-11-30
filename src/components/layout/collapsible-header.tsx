'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useUser } from '@/hooks/use-user';
import { UserAvatar } from '@/components/user-avatar';
import { UserName } from '@/components/user-name';

export function CollapsibleHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser();
  const isAdmin = (((user as any)?.isAdmin as boolean) || (((user as any)?.role || '').toUpperCase() === 'ADMIN')) ?? false;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'fixed top-2 left-1/2 -translate-x-1/2 z-[60] transition-transform duration-300 ease-in-out',
          'translate-y-0'
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle"
          className={cn(
            'w-8 h-8 rounded-full bg-muted/60 backdrop-blur-sm ring-1 ring-border shadow-md flex items-center justify-center hover:bg-muted/80',
            'animate-up-down-slow transition-opacity',
            isOpen && 'opacity-0 pointer-events-none'
          )}
        >
          <ChevronDown className="h-4 w-4 text-green-500" />
        </button>
      </div>

      <header
        className={cn(
          'container mx-auto flex h-20 items-center justify-between px-4 transition-transform duration-300 ease-in-out transform',
          'bg-background/50 backdrop-blur-sm rounded-b-xl border-x border-b border-border',
          isOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="w-1/3">
          <Logo variant="minimal" />
        </div>
        <div className="w-1/3 flex justify-center">
            {/* Center empty for spacing */}
        </div>
        <div className="w-1/3 flex justify-end items-center gap-2">
            {user ? (
              <Button variant="ghost" className="flex items-center gap-2">
                <UserAvatar avatarUrl={user.avatarUrl || ''} username={user.username || ''} className="h-8 w-8" />
                <UserName username={user.username} role={isAdmin ? 'ADMIN' : (user as any).role} className="hidden md:inline" />
              </Button>
            ) : (
              <>
                <AuthDialog defaultTab="login" trigger={<Button variant="ghost">Login</Button>} />
                <AuthDialog defaultTab="register" trigger={<Button>Register</Button>} />
              </>
            )}
        </div>
      </header>
    </div>
  );
}
