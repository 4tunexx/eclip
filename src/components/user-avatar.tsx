'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl: string;
  username: string;
  frameUrl?: string;
  className?: string;
}

export function UserAvatar({ avatarUrl, username, frameUrl, className }: UserAvatarProps) {
  return (
    <div className={cn('relative', className)}>
      <Avatar className="h-full w-full">
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      {frameUrl && (
        <div className="absolute inset-0">
          <Image src={frameUrl} alt="Avatar Frame" fill style={{objectFit: "contain"}} sizes="100vw" />
        </div>
      )}
    </div>
  );
}
