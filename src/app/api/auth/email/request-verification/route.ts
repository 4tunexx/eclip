import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/email/request-verification
 * Sends an email verification link to the user's email address
 * Used by Steam users who want to verify their email
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user already has verified email
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check if user has a real email (not the steam.local placeholder)
    const email = user.email;
    if (!email || email.includes('@steam.local')) {
      return NextResponse.json(
        { error: 'User does not have a valid email address' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email: newEmail } = body;

    // If user is providing a new email, update it first
    if (newEmail && newEmail !== email) {
      // Check if new email is already in use
      const [existing] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, newEmail))
        .limit(1);

      if (existing) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      await db.update(users)
        .set({ email: newEmail })
        .where(eq(users.id, user.id));
    }

    // Generate verification token
    const emailVerificationToken = crypto.randomUUID();

    // Update user with verification token
    await db.update(users)
      .set({ emailVerificationToken })
      .where(eq(users.id, user.id));

    // Send verification email
    const targetEmail = newEmail || email;
    const username = user.username || 'User';
    await sendVerificationEmail(targetEmail, emailVerificationToken, username);

    console.log('[Email Verification Request] Sent to:', targetEmail);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      email: targetEmail,
    });
  } catch (error) {
    console.error('[Email Verification Request] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
