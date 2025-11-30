import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const direction = (body?.direction || '').toString().toLowerCase()
    if (!['up','down'].includes(direction)) return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })

    const sql = postgres(process.env.DATABASE_URL!, { max: 1 })
    const repKey = `rep_post_${params.id}`
    const voteKey = `vote_post_${params.id}_${user.id}`

    try {
      const prev = await sql.unsafe('SELECT "value" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', [voteKey])
      const prevVote = prev[0]?.value === 'up' ? 1 : (prev[0]?.value === 'down' ? -1 : 0)
      const newVote = direction === 'up' ? 1 : -1
      const delta = newVote - prevVote

      if (prev.length) {
        await sql.unsafe('UPDATE "public"."KeyValueConfig" SET "value" = $1, "updated_at" = NOW() WHERE "key" = $2;', [direction, voteKey])
      } else {
        await sql.unsafe('INSERT INTO "public"."KeyValueConfig" ("key","value","updated_at") VALUES ($1,$2,NOW());', [voteKey, direction])
      }

      const repRow = await sql.unsafe('SELECT "value" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', [repKey])
      const current = parseInt(repRow[0]?.value || '0', 10) || 0
      const updated = current + delta
      if (repRow.length) {
        await sql.unsafe('UPDATE "public"."KeyValueConfig" SET "value" = $1, "updated_at" = NOW() WHERE "key" = $2;', [String(updated), repKey])
      } else {
        await sql.unsafe('INSERT INTO "public"."KeyValueConfig" ("key","value","updated_at") VALUES ($1,$2,NOW());', [repKey, String(updated)])
      }

      await sql.end({ timeout: 5 })
      return NextResponse.json({ success: true, rep: updated })
    } catch (e) {
      try { await sql.end({ timeout: 5 }) } catch {}
      throw e
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

