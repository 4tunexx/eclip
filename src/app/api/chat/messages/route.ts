import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatMessages, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const pageLimit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
    
    // Fetch messages from database with user info
    const messages = await db
      .select({
        id: chatMessages.id,
        text: chatMessages.text,
        userId: chatMessages.userId,
        createdAt: chatMessages.createdAt,
        username: users.username,
        avatarUrl: users.avatar,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(pageLimit);

    // Reverse to get chronological order (oldest to newest)
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.id,
      text: msg.text,
      userId: msg.userId,
      createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
      user: {
        id: msg.userId,
        username: msg.username || 'Unknown',
        avatarUrl: msg.avatarUrl || '',
      },
    }));

    const response = NextResponse.json({ messages: formattedMessages });
    
    // Add caching headers: cache for 2 seconds to reduce API spam
    response.headers.set('Cache-Control', 'private, max-age=2, stale-while-revalidate=5');
    
    return response;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', messages: [] },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Insert message into database
    const newMessage = await db
      .insert(chatMessages)
      .values({
        userId: user.id,
        text: text.trim(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage[0]?.id,
        text: newMessage[0]?.text,
        userId: newMessage[0]?.userId,
        createdAt: newMessage[0]?.createdAt?.toISOString(),
        user: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl || user.avatar || '',
        },
      },
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
