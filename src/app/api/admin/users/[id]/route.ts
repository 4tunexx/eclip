import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, transactions, bans, acEvents } from '@/lib/db/schema';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateUserSchema = z.object({
  coins: z.number().optional(),
  xp: z.number().optional(),
  level: z.number().optional(),
  esr: z.number().optional(),
  rank: z.string().optional(),
  role: z.enum(['USER', 'VIP', 'INSIDER', 'MOD', 'MODERATOR', 'ADMIN']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !isUserAdmin(user)) {
      console.warn('[Admin GET User] Unauthorized access attempt by user:', user?.id, 'role:', user?.role);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userId = id;

    const [targetUser] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get transactions
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .limit(50);

    // Get bans
    const userBans = await db.select()
      .from(bans)
      .where(eq(bans.userId, userId));

    // Get AC events
    const userAcEvents = await db.select()
      .from(acEvents)
      .where(eq(acEvents.userId, userId))
      .limit(50);

    return NextResponse.json({
      user: {
        ...targetUser,
        coins: Number(targetUser.coins),
        xp: Number(targetUser.xp),
      },
      transactions: userTransactions.map(t => ({
        ...t,
        amount: Number(t.amount),
      })),
      bans: userBans,
      acEvents: userAcEvents,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getCurrentUser();
    if (!admin || !isUserAdmin(admin)) {
      console.warn('[Admin PATCH User] Unauthorized access attempt by user:', admin?.id, 'role:', admin?.role);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userId = id;
    const body = await request.json();
    const updates = updateUserSchema.parse(body);

    const updateData: any = {};
    if (updates.coins !== undefined) updateData.coins = updates.coins.toString();
    if (updates.xp !== undefined) updateData.xp = updates.xp;
    if (updates.level !== undefined) updateData.level = updates.level;
    if (updates.esr !== undefined) updateData.esr = updates.esr;
    if (updates.rank !== undefined) updateData.rank = updates.rank;
    if (updates.role !== undefined) updateData.role = updates.role;
    updateData.updatedAt = new Date();

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    // Log transaction if coins changed
    if (updates.coins !== undefined) {
      const [currentUser] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (currentUser) {
        const coinDiff = updates.coins - Number(currentUser.coins);
        if (coinDiff !== 0) {
          await db.insert(transactions).values({
            userId,
            type: coinDiff > 0 ? 'REWARD' : 'PURCHASE',
            amount: Math.abs(coinDiff).toString(),
            description: `Admin adjustment by ${admin.username}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

