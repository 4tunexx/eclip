import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email';

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a reset request or password reset
    if ('email' in body && !('token' in body)) {
      // Request password reset
      const { email } = requestResetSchema.parse(body);

      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      // Don't reveal if email exists
      if (!user) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        });
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Send reset email
      const emailAddress = user.email;
      if (!emailAddress) {
        return NextResponse.json(
          { error: 'User email not available' },
          { status: 400 }
        );
      }

      await sendPasswordResetEmail(emailAddress, resetToken, user.username);

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } else {
      // Reset password with token
      const { token, password } = resetPasswordSchema.parse(body);

      const [user] = await db.select()
        .from(users)
        .where(
          and(
            eq(users.passwordResetToken, token),
            gt(users.passwordResetExpires || new Date(0), new Date())
          )
        )
        .limit(1);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      // Update password
      const passwordHash = await hashPassword(password);
      await db.update(users)
        .set({
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

