import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { directMessages, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, or, and, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const withId = searchParams.get('withId'); // Get messages with specific user
    const limit = parseInt(searchParams.get('limit') || '50');

    // If requesting messages with a specific user
    if (withId) {
      const messages = await db
        .select({
          id: directMessages.id,
          senderId: directMessages.senderId,
          recipientId: directMessages.recipientId,
          content: directMessages.content,
          read: directMessages.read,
          createdAt: directMessages.createdAt,
        })
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, user.id),
              eq(directMessages.recipientId, withId)
            ),
            and(
              eq(directMessages.senderId, withId),
              eq(directMessages.recipientId, user.id)
            )
          )
        )
        .orderBy(desc(directMessages.createdAt))
        .limit(limit);

      return NextResponse.json({ messages: messages.reverse() });
    }

    // Get conversation list with unread counts
    const conversations = await db
      .select({
        userId: users.id,
        username: users.username,
        avatar: users.avatar,
        unreadCount: count(directMessages.id),
        lastMessage: directMessages.content,
        lastMessageTime: directMessages.createdAt,
      })
      .from(directMessages)
      .leftJoin(
        users,
        or(
          and(
            eq(directMessages.senderId, user.id),
            eq(directMessages.recipientId, users.id)
          ),
          and(
            eq(directMessages.recipientId, user.id),
            eq(directMessages.senderId, users.id)
          )
        )
      )
      .where(
        or(
          eq(directMessages.senderId, user.id),
          eq(directMessages.recipientId, user.id)
        )
      )
      .groupBy(users.id, directMessages.id)
      .orderBy(desc(directMessages.createdAt))
      .limit(limit);

    // Count total unread messages for this user
    const unreadResult = await db
      .select({ count: count(directMessages.id) })
      .from(directMessages)
      .where(
        and(
          eq(directMessages.recipientId, user.id),
          eq(directMessages.read, false)
        )
      );

    const totalUnread = unreadResult[0]?.count || 0;

    return NextResponse.json({
      conversations,
      totalUnread,
    });
  } catch (error) {
    console.error('[Messages GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, content } = body;

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate recipient exists
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Prevent sending message to self
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    const message = await db
      .insert(directMessages)
      .values({
        senderId: user.id,
        recipientId,
        content,
      })
      .returning();

    return NextResponse.json(message[0]);
  } catch (error) {
    console.error('[Messages POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, read, markAllAsRead, fromUserId } = body;

    if (markAllAsRead && fromUserId) {
      // Mark all messages from a specific user as read
      await db
        .update(directMessages)
        .set({ read: true })
        .where(
          and(
            eq(directMessages.recipientId, user.id),
            eq(directMessages.senderId, fromUserId),
            eq(directMessages.read, false)
          )
        );
      return NextResponse.json({ success: true });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }

    // Verify message belongs to user (as recipient)
    const [message] = await db
      .select()
      .from(directMessages)
      .where(eq(directMessages.id, messageId))
      .limit(1);

    if (!message || message.recipientId !== user.id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await db
      .update(directMessages)
      .set({ read })
      .where(eq(directMessages.id, messageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messages PUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
