'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '../icons/logo';
import { AuthDialog } from '@/components/auth/AuthDialog';

export function HeroBanner() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

  return (
    <section 
      className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center text-primary-foreground overflow-hidden"
    >
      <Image
        src="https://i.postimg.cc/52X97NSP/de_ancient_night_02.png"
        alt="Eclip.pro banner"
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-500 ease-out"
        style={{
            transform: `scale(1.05) translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
        }}
        priority
      />
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-drop-in">
                <Logo 
                  variant="full" 
                  width={400} 
                  height={100}
                  className="drop-shadow-lg opacity-95 transition-all hover:opacity-100 hover-shake"
                />
                <AuthDialog
                    defaultTab="register"
                    trigger={
                        <Button size="lg" className="font-bold">
                            Join the Arena
                        </Button>
                    }
                />
            </div>
        </div>
      </div>
    </section>
  );
}
