'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/auth/AuthDialog';

export function CollapsibleHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
          'absolute top-0 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-in-out',
           isOpen ? 'translate-y-2' : '-translate-y-8'
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-background/50 backdrop-blur-sm"
        >
          {isOpen ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-primary" />}
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
            <AuthDialog
                defaultTab="login"
                trigger={<Button variant="ghost">Login</Button>}
            />
            <AuthDialog
                defaultTab="register"
                trigger={<Button>Register</Button>}
            />
            <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
            </Button>
        </div>
      </header>
    </div>
  );
}
