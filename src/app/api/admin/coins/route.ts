import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !isUserAdmin(user)) {
      console.warn('[Admin Coins] Unauthorized access attempt by user:', user?.id, 'role:', user?.role);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, amount, action } = body; // action: 'add' | 'remove' | 'set'

    if (!userId || amount === undefined || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;

    if (action === 'set') {
      result = await sql`UPDATE users SET coins = ${amount} WHERE id = ${userId} RETURNING id, username, coins`;
    } else if (action === 'add') {
      result = await sql`UPDATE users SET coins = coins + ${amount} WHERE id = ${userId} RETURNING id, username, coins`;
    } else if (action === 'remove') {
      result = await sql`UPDATE users SET coins = GREATEST(0, coins - ${amount}) WHERE id = ${userId} RETURNING id, username, coins`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('Error managing coins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get user's current coin balance
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role?.toUpperCase() !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const result = await sql`SELECT id, username, email, coins FROM users WHERE id = ${userId}`;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error('Error fetching coins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
