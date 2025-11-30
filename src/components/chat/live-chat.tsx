'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/user-avatar';
import { Send } from 'lucide-react';
import { currentUser, topPlayers } from '@/lib/placeholder-data';
import { cn } from '@/lib/utils';
import { CollapsibleContent } from '@/components/ui/collapsible';

type Message = {
  id: string;
  text: string;
  user: {
    username: string;
    avatarUrl: string;
    equippedFrame?: string;
  };
};

const initialMessages: Message[] = [
  { id: '1', user: topPlayers[0], text: 'GG! That was a close one on Mirage.' },
  { id: '2', user: topPlayers[1], text: "Yeah, you guys played well. That last clutch was insane." },
  { id: '3', user: topPlayers[2], text: 'Anyone up for another match?' },
  { id: '4', user: topPlayers[3], text: 'I am down, just need to warm up a bit.' },
];

export function LiveChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: (messages.length + 1).toString(),
      text: newMessage,
      user: currentUser,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 flex flex-col">
        <CardContent className="p-4 flex-grow">
            <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                    'flex items-start gap-3',
                    msg.user.username === currentUser.username ? 'flex-row-reverse' : ''
                    )}
                >
                    <UserAvatar
                    avatarUrl={msg.user.avatarUrl}
                    username={msg.user.username}
                    frameUrl={msg.user.equippedFrame}
                    className="w-8 h-8"
                    />
                    <div className={cn(
                    'rounded-lg px-3 py-2 text-sm max-w-[75%]',
                    msg.user.username === currentUser.username
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    )}>
                    <p className="font-bold text-xs mb-1">{msg.user.username}</p>
                    <p>{msg.text}</p>
                    </div>
                </div>
                ))}
            </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
            />
            <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
            </Button>
            </form>
        </CardFooter>
    </Card>
  );
}
