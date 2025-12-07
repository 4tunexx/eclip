import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  avatarUrl: z
    .string()
    .min(1)
    .refine(
      (v) => v.startsWith('data:') || /^https?:\/\//i.test(v),
      'Avatar must be a data URL or http/https URL'
    ),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { avatarUrl } = schema.parse(body);

    await db.update(users)
      .set({ avatar: avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('[API/User/Avatar] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
