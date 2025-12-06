import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      level: users.level,
      esr: users.esr,
      rank: users.rank,
      coins: users.coins,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
      .from(users)
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.where(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      ) as any;
    }

    const userList = await query;

    return NextResponse.json({
      users: userList.map(u => ({
        ...u,
        coins: Number(u.coins),
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

