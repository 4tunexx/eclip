import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const [existingUsername] = await db.select()
      .from(users)
      .where(eq(users.username, validated.username))
      .limit(1);

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(validated.password);
    const emailVerificationToken = crypto.randomUUID();

    const [user] = await db.insert(users).values({
      email: validated.email,
      username: validated.username,
      passwordHash,
      emailVerificationToken,
      emailVerified: false,
      level: 1,
      xp: 0,
      mmr: 1000,
      rank: 'Bronze',
      coins: '0',
      role: 'USER',
    }).returning();

    // Send email verification
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(user.email, emailVerificationToken, user.username);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

