'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/user-avatar';
import { UserHover } from '@/components/user-hover';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

type Message = {
  id: string;
  text: string;
  userId: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
    equippedFrame?: string;
  };
  timestamp: Date;
};

export function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesHashRef = useRef<string>('');
  const { user: currentUser } = useUser();

  // Load initial messages
  useEffect(() => {
    fetchMessages();
    
    // Start polling with 10 second interval - only when window is visible
    const startPolling = () => {
      pollIntervalRef.current = setInterval(fetchMessages, 10000);
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };

    // Check visibility and start/stop polling accordingly
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages?limit=50');
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          userId: msg.userId,
          user: {
            id: msg.userId,
            username: msg.user?.username || 'Unknown',
            avatarUrl: msg.user?.avatarUrl || '',
          },
          timestamp: new Date(msg.createdAt || Date.now()),
        }));
        
        // Compare only message IDs and text to avoid timestamp differences
        const newHash = formattedMessages.map((m: any) => `${m.id}:${m.text}`).join('|');
        
        // Only update if messages changed
        if (messagesHashRef.current !== newHash) {
          setMessages(formattedMessages);
          messagesHashRef.current = newHash;
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        // Fetch immediately after sending instead of waiting for poll
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 flex flex-col h-[380px]">
        <CardContent className="p-4 flex-grow flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 flex flex-col h-[380px]">
      <CardContent className="p-4 flex-grow">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Be the first!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-start gap-2',
                    msg.userId === currentUser?.id ? 'flex-row-reverse' : ''
                  )}
                >
                  <UserHover userId={msg.user.id} username={msg.user.username}>
                    <UserAvatar
                      avatarUrl={msg.user.avatarUrl}
                      username={msg.user.username}
                      frameData={msg.user.equippedFrame}
                      className="w-7 h-7 cursor-pointer flex-shrink-0 hover:ring-2 hover:ring-primary/80 transition-all rounded-full"
                    />
                  </UserHover>
                  <div className={cn(
                    'rounded-lg px-3 py-2 text-sm max-w-[70%] break-words',
                    msg.userId === currentUser?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}>
                    <UserHover userId={msg.user.id} username={msg.user.username}>
                      <p className="font-bold text-xs mb-1 hover:underline cursor-pointer">{msg.user.username}</p>
                    </UserHover>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder={currentUser ? "Type a message..." : "Sign in to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!currentUser || isSending}
            className="flex-1 text-sm"
          />
          <Button type="submit" size="icon" disabled={!currentUser || isSending || !newMessage.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
