require('dotenv').config()
const postgres = require('postgres')

async function hasRelation(sql, type, name) {
  if (type === 'view') {
    const r = await sql`SELECT table_name FROM information_schema.views WHERE table_schema='public' AND table_name=${name} LIMIT 1`
    return r.length > 0
  } else {
    const r = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name=${name} LIMIT 1`
    return r.length > 0
  }
}

async function ensureTable(sql, name, createSql) {
  if (!(await hasRelation(sql, 'table', name))) {
    await sql.unsafe(createSql)
  }
}

async function ensureView(sql, name, builder) {
  const exists = await hasRelation(sql, 'view', name)
  const def = await builder(sql)
  if (exists) {
    await sql.unsafe(`CREATE OR REPLACE VIEW "public"."${name}" AS ${def}`)
  } else {
    await sql.unsafe(`CREATE VIEW "public"."${name}" AS ${def}`)
  }
}

async function ensureForumCategories(sql) {
  await ensureTable(sql, 'forum_categories', `CREATE TABLE "public"."forum_categories" ("id" uuid PRIMARY KEY, "title" text NOT NULL, "description" text, "order" int DEFAULT 0, "created_at" timestamp DEFAULT NOW())`)
  const kv = await sql`SELECT value FROM "public"."KeyValueConfig" WHERE key='forum_categories' LIMIT 1`
  if (kv.length) {
    let cats = kv[0].value
    if (typeof cats === 'string') {
      try { cats = JSON.parse(cats) } catch {}
    }
    if (Array.isArray(cats)) {
      for (const c of cats) {
        const id = c.id
        const row = await sql`SELECT id FROM "public"."forum_categories" WHERE id=${id} LIMIT 1`
        if (!row.length) {
          await sql`INSERT INTO "public"."forum_categories" (id,title,description) VALUES (${id}, ${c.title || ''}, ${c.description || null})`
        }
      }
    }
  }
}

async function buildCosmeticsView(sql) {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Cosmetic'`
  const set = new Set(cols.map(c => c.column_name))
  const sel = []
  sel.push('id')
  sel.push('name')
  sel.push('description')
  sel.push(set.has('type') ? 'type::text AS type' : `'Frame'::text AS type`)
  sel.push(set.has('rarity') ? 'rarity::text AS rarity' : `'Common'::text AS rarity`)
  sel.push(set.has('price') ? 'COALESCE(price,0)::numeric AS price' : '0::numeric AS price')
  sel.push(set.has('image_url') ? 'image_url AS image_url' : (set.has('imageUrl') ? 'imageUrl AS image_url' : 'NULL::text AS image_url'))
  sel.push(set.has('is_active') ? 'is_active AS is_active' : (set.has('isActive') ? 'isActive AS is_active' : 'TRUE AS is_active'))
  sel.push(set.has('created_at') ? 'created_at' : 'NOW() AS created_at')
  sel.push(set.has('updated_at') ? 'updated_at' : 'NOW() AS updated_at')
  return `SELECT ${sel.join(', ')} FROM "public"."Cosmetic"`
}

async function buildForumThreadsView(sql) {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Thread'`
  const set = new Set(cols.map(c => c.column_name))
  const sel = []
  sel.push('id')
  sel.push(set.has('category_id') ? 'category_id' : (set.has('categoryId') ? 'categoryId' : 'NULL::uuid AS category_id'))
  sel.push(set.has('author_id') ? 'author_id' : (set.has('authorId') ? 'authorId' : 'NULL::uuid AS author_id'))
  sel.push('title')
  sel.push(set.has('content') ? 'content' : 'NULL::text AS content')
  sel.push(set.has('reply_count') ? 'reply_count' : (set.has('replyCount') ? 'replyCount' : '0::int AS reply_count'))
  sel.push(set.has('views') ? 'views' : '0::int AS views')
  sel.push(set.has('is_pinned') ? 'is_pinned' : (set.has('isPinned') ? 'isPinned' : 'FALSE AS is_pinned'))
  sel.push(set.has('is_locked') ? 'is_locked' : (set.has('isLocked') ? 'isLocked' : 'FALSE AS is_locked'))
  sel.push(set.has('last_reply_at') ? 'last_reply_at' : (set.has('lastReplyAt') ? 'lastReplyAt' : 'NULL::timestamp AS last_reply_at'))
  sel.push(set.has('last_reply_author_id') ? 'last_reply_author_id' : (set.has('lastReplyAuthorId') ? 'lastReplyAuthorId' : 'NULL::uuid AS last_reply_author_id'))
  sel.push(set.has('created_at') ? 'created_at' : (set.has('createdAt') ? 'createdAt' : 'NOW() AS created_at'))
  sel.push(set.has('updated_at') ? 'updated_at' : (set.has('updatedAt') ? 'updatedAt' : 'NOW() AS updated_at'))
  return `SELECT ${sel.join(', ')} FROM "public"."Thread"`
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  try {
    await ensureForumCategories(sql)
    await ensureView(sql, 'cosmetics', buildCosmeticsView)
    await ensureView(sql, 'forum_threads', buildForumThreadsView)
    console.log('Sync completed')
  } catch (e) {
    console.error('Sync error:', e?.message || e)
    process.exitCode = 1
  } finally {
    try { await sql.end({ timeout: 5 }) } catch {}
  }
}

main()

