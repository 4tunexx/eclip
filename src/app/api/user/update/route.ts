import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userProfiles } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';

const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  title: z.string().max(50).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if this is a password change
    if ('currentPassword' in body) {
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);

      // Verify current password
      const [currentUser] = await db.select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!currentUser || !currentUser.passwordHash) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const { verifyPassword } = await import('@/lib/auth');
      const isValid = await verifyPassword(currentPassword, currentUser.passwordHash);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Update password
      const newPasswordHash = await hashPassword(newPassword);
      await db.update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json({ success: true });
    }

    // Regular profile update
    const updates = updateUserSchema.parse(body);

    const updateData: any = { updatedAt: new Date() };
    if (updates.username !== undefined) {
      // Check if username is taken
      const [existing] = await db.select()
        .from(users)
        .where(eq(users.username, updates.username))
        .limit(1);

      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }

      updateData.username = updates.username;
    }

    if (updates.email !== undefined) {
      // Check if email is taken
      const [existing] = await db.select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      updateData.email = updates.email;
      updateData.emailVerified = false; // Require re-verification
    }

    // Update user
    if (Object.keys(updateData).length > 1) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
    }

    // Update profile
    if (updates.title !== undefined) {
      const [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, user.id))
        .limit(1);

      if (profile) {
        await db.update(userProfiles)
          .set({
            title: updates.title,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.id, profile.id));
      } else {
        await db.insert(userProfiles).values({
          userId: user.id,
          title: updates.title,
        });
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

