'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl: string;
  username: string;
  frameData?: string | null;
  frameUrl?: string; // Legacy support
  className?: string;
}

export function UserAvatar({ avatarUrl, username, frameData, frameUrl, className }: UserAvatarProps) {
  // Parse frame metadata from JSON string
  const parseFrameData = () => {
    if (!frameData) return null;
    try {
      return JSON.parse(frameData);
    } catch {
      return null;
    }
  };

  const frame = parseFrameData();

  // If we have frame metadata, render it with CSS
  if (frame) {
    const {
      border_color = '#9333ea',
      border_gradient,
      border_width = 3,
      border_style = 'solid',
      animation_type = 'none',
      animation_speed = 5
    } = frame;

    return (
      <div className={cn('relative', className)}>
        {border_gradient ? (
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              animation_type === 'pulse' && 'animate-pulse',
              animation_type === 'rotate' && 'animate-spin-slow',
              animation_type === 'glow' && `animate-glow-${animation_speed}`
            )}
            style={{
              background: border_gradient,
              padding: `${border_width}px`,
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-background">
              <Avatar className="h-full w-full">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        ) : (
          <>
            <Avatar className="h-full w-full">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute inset-0 rounded-full pointer-events-none',
                animation_type === 'pulse' && 'animate-pulse',
                animation_type === 'rotate' && 'animate-spin-slow',
                animation_type === 'glow' && `animate-glow-${animation_speed}`
              )}
              style={{
                border: `${border_width}px ${border_style} ${border_color}`,
              }}
            />
          </>
        )}
      </div>
    );
  }

  // Legacy: if frameUrl is provided as image URL
  if (frameUrl) {
    return (
      <div className={cn('relative', className)}>
        <Avatar className="h-full w-full">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0">
          <Image src={frameUrl} alt="Avatar Frame" fill style={{objectFit: "contain"}} sizes="100vw" />
        </div>
      </div>
    );
  }

  // No frame - just avatar
  return (
    <div className={cn('relative', className)}>
      <Avatar className="h-full w-full">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );
}
