import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    // Validate userId is valid UUID
    if (!userId || typeof userId !== 'string' || userId.length !== 36) {
      console.error('[Notifications] Invalid userId:', userId, 'for user:', user.username);
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const limit = request.nextUrl.searchParams.get('limit') || '50';
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';

    let query = db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        read: notifications.read,
        data: notifications.data,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(parseInt(limit));

    if (unreadOnly) {
      query = db
        .select({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          read: notifications.read,
          data: notifications.data,
          createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(parseInt(limit));
    }

    const userNotifications = await query;

    // Count unread
    const unreadCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: unreadCount.length > 0 ? unreadCount.length : 0,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate userId
    if (!user.id || typeof user.id !== 'string' || user.id.length !== 36) {
      console.error('[Notifications PUT] Invalid userId:', user.id);
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, read, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, user.id),
            eq(notifications.read, false)
          )
        );

      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }

    // Verify notification belongs to user - THIS IS CRITICAL FOR SECURITY
    const notif = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (!notif || notif.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // SECURITY: Ensure notification belongs to current user
    if (notif[0].userId !== user.id) {
      console.error('[Notifications] Unauthorized access attempt:', { requestedBy: user.id, notificationOwner: notif[0].userId });
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await db
      .update(notifications)
      .set({ read })
      .where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, message, data } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notif = await db.insert(notifications).values({
      userId: user.id,
      type,
      title,
      message,
      data: data || null,
      read: false,
    }).returning();

    return NextResponse.json(notif[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a specific notification or clear all notifications
 * Query params: id=<notificationId> or clearAll=true
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Delete all notifications for this user
      const deleted = await db.delete(notifications).where(eq(notifications.userId, user.id)).returning();
      console.log('[Notifications] Cleared all notifications for user:', user.username, '- Count:', deleted.length);
      return NextResponse.json({ success: true, message: 'All notifications cleared', count: deleted.length });
    } else if (notificationId) {
      // Delete specific notification (must belong to user)
      const deleted = await db.delete(notifications).where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      ).returning();
      
      if (deleted.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found or unauthorized' },
          { status: 404 }
        );
      }
      
      console.log('[Notifications] Deleted notification:', notificationId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Missing notification ID or clearAll parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Notifications] Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Delete all notifications for this user
      await db.delete(notifications).where(eq(notifications.userId, user.id));
      console.log('[Notifications] Cleared all notifications for user:', user.username);
      return NextResponse.json({ success: true, message: 'All notifications cleared' });
    } else if (notificationId) {
      // Delete specific notification
      await db.delete(notifications).where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      );
      console.log('[Notifications] Deleted notification:', notificationId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Missing notification ID or clearAll parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Notifications] Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
