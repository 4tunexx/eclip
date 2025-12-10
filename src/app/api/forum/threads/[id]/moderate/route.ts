import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forumThreads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import postgres from 'postgres'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    // Strict role validation - require explicit MODERATOR or ADMIN role
    const role = (user as any).role?.toUpperCase?.() || 'USER'
    const isAuthorized = role === 'ADMIN' || role === 'MODERATOR' || role === 'MOD'
    
    if (!isAuthorized) {
      console.warn('[Forum Moderation] Unauthorized moderation attempt by user:', user.id, 'role:', role);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const action = (body?.action || '').toString().toLowerCase()
    if (!['pin','unpin','lock','unlock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    let updated = false
    try {
      if (action === 'pin' || action === 'unpin') {
        await db.update(forumThreads).set({ isPinned: action === 'pin', updatedAt: new Date() }).where(eq(forumThreads.id, id))
      } else {
        await db.update(forumThreads).set({ isLocked: action === 'lock', updatedAt: new Date() }).where(eq(forumThreads.id, id))
      }
      updated = true
    } catch {
      const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
      try {
        const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2;', ['public','Thread'])
        const set = new Set(cols.map((c:any)=>c.column_name))
        const pinCol = set.has('pinned') ? 'pinned' : (set.has('is_pinned') ? 'is_pinned' : null)
        const lockCol = set.has('locked') ? 'locked' : (set.has('is_locked') ? 'is_locked' : null)
        if ((action === 'pin' || action === 'unpin') && pinCol) {
          await sql.unsafe(`UPDATE "public"."Thread" SET "${pinCol}" = $1 WHERE "id" = $2;`, [action === 'pin', id])
          updated = true
        }
        if ((action === 'lock' || action === 'unlock') && lockCol) {
          await sql.unsafe(`UPDATE "public"."Thread" SET "${lockCol}" = $1 WHERE "id" = $2;`, [action === 'lock', id])
          updated = true
        }
        await sql.end({ timeout: 5 })
      } catch (e) {
        try { await sql.end({ timeout: 5 }) } catch {}
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

