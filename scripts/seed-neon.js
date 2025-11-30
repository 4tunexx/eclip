require('dotenv').config();
const postgres = require('postgres');
const { randomUUID } = require('crypto');

async function upsertKV(sql, key, value) {
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  const row = await sql.unsafe('SELECT "key" FROM "public"."KeyValueConfig" WHERE "key" = $1 LIMIT 1;', [key]);
  if (row.length) {
    await sql.unsafe('UPDATE "public"."KeyValueConfig" SET "value" = $1 WHERE "key" = $2;', [v, key]);
  } else {
    await sql.unsafe('INSERT INTO "public"."KeyValueConfig" ("key","value") VALUES ($1,$2);', [key, v]);
  }
}

async function ensureCosmetic(sql, item) {
  const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2;', ['public','Cosmetic']);
  const set = new Set(cols.map(c=>c.column_name));
  const nameCol = set.has('name') ? 'name' : null;
  const activeCol = set.has('is_active') ? 'is_active' : (set.has('isActive')?'isActive':null);
  const typeCol = set.has('type') ? 'type' : null;
  const rarityCol = set.has('rarity') ? 'rarity' : null;
  const exists = await sql.unsafe(`SELECT id FROM "public"."Cosmetic" WHERE "${nameCol||'name'}" = $1 LIMIT 1;`, [item.name]);
  if (!exists.length) {
    const fields = ['id','name','description'];
    if (set.has('image_url') || set.has('imageUrl')) fields.push(set.has('image_url')?'image_url':'imageUrl');
    if (activeCol) fields.push(activeCol);
    const placeholders = fields.map((_,i)=>`$${i+1}`).join(', ');
    const values = [randomUUID(), item.name, item.description||null, item.imageUrl||null];
    if (activeCol) values.push(true);
    // Build dynamic insert with enums
    let extraFields = '';
    let extraPlaceholders = '';
    const extraValues = [];
    if (typeCol) {
      let typeVal = item.type;
      try {
        const e = await sql.unsafe("SELECT enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='CosmeticType' LIMIT 1;");
        if (e.length) typeVal = e[0].enumlabel;
      } catch {}
      extraFields += `, "${typeCol}"`;
      extraPlaceholders += `, $${values.length + extraValues.length + 1}`;
      extraValues.push(typeVal);
    }
    if (rarityCol) {
      let rarityVal = item.rarity;
      try {
        const e = await sql.unsafe("SELECT enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='CosmeticRarity' LIMIT 1;");
        if (e.length) rarityVal = e[0].enumlabel;
      } catch {}
      extraFields += `, "${rarityCol}"`;
      extraPlaceholders += `, $${values.length + extraValues.length + 1}`;
      extraValues.push(rarityVal);
    }
    await sql.unsafe(`INSERT INTO "public"."Cosmetic" (${fields.map(f=>`"${f}"`).join(', ')}${extraFields}) VALUES (${placeholders}${extraPlaceholders});`, [...values, ...extraValues]);
  }
}

async function ensureThread(sql, thread) {
  const cols = await sql.unsafe('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2;', ['public','Thread']);
  const set = new Set(cols.map(c=>c.column_name));
  const catCol = set.has('category_id')?'category_id':(set.has('categoryId')?'categoryId':null);
  const authorCol = set.has('author_id')?'author_id':(set.has('authorId')?'authorId':null);
  const replyCol = set.has('reply_count')?'reply_count':(set.has('replyCount')?'replyCount':null);
  const viewsCol = set.has('views')?'views':null;
  const typeCol = set.has('type')?'type':null;
  const titleCol = 'title';
  const exists = await sql.unsafe(`SELECT id FROM "public"."Thread" WHERE "${titleCol}" = $1 LIMIT 1;`, [thread.title]);
  if (!exists.length) {
    const fields = ['id', titleCol];
    const vals = [randomUUID(), thread.title];
    if (catCol) { fields.push(catCol); vals.push(thread.categoryId); }
    if (authorCol) { fields.push(authorCol); vals.push(thread.authorId); }
    if (replyCol) { fields.push(replyCol); vals.push(thread.replyCount||0); }
    if (viewsCol) { fields.push(viewsCol); vals.push(thread.views||0); }
    if (typeCol) {
      let enumVal = thread.type || 'GENERAL';
      try {
        const enums = await sql.unsafe("SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'ThreadType';");
        if (enums.length) enumVal = enums[0].enumlabel;
      } catch {}
      fields.push(typeCol); vals.push(enumVal);
    }
    const pinCol = set.has('is_pinned')?'is_pinned':(set.has('isPinned')?'isPinned':null);
    const lockCol = set.has('is_locked')?'is_locked':(set.has('isLocked')?'isLocked':null);
    if (pinCol) { fields.push(pinCol); vals.push(!!thread.isPinned); }
    if (lockCol) { fields.push(lockCol); vals.push(!!thread.isLocked); }
    const placeholders = vals.map((_,i)=>`$${i+1}`).join(', ');
    await sql.unsafe(`INSERT INTO "public"."Thread" (${fields.map(f=>`"${f}"`).join(', ')}) VALUES (${placeholders});`, vals);
  }
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const updatesCat = { id: randomUUID(), title: 'Updates', description: 'Official updates and announcements' };
    const newsCat = { id: randomUUID(), title: 'News', description: 'Latest news from the team' };
    const generalCat = { id: randomUUID(), title: 'General Discussion', description: 'Talk about anything related to Eclip.pro' };
    const categories = [updatesCat, newsCat, generalCat];
    await upsertKV(sql, 'forum_categories', categories);

    const adminEmail = 'admin@eclip.pro';
    const adminRow = await sql.unsafe('SELECT id FROM "public"."User" WHERE "email" = $1 LIMIT 1;', [adminEmail]);
    const adminId = adminRow[0]?.id || null;

    if (adminId) {
      try { await ensureThread(sql, { categoryId: updatesCat.id, authorId: adminId, title: 'Welcome to Eclip.pro', isPinned: true, type: 'UPDATE' }); } catch {}
      try { await ensureThread(sql, { categoryId: newsCat.id, authorId: adminId, title: 'Season Announcement', isPinned: false, type: 'NEWS' }); } catch {}
      try { await ensureThread(sql, { categoryId: generalCat.id, authorId: adminId, title: 'General chat', isPinned: false, type: 'GENERAL' }); } catch {}
    }

    const items = [
      { name: 'Cyberpunk Neon', description: 'Vibrant glowing frame.', type: 'Frame', rarity: 'Legendary', price: 1500, imageUrl: 'https://i.postimg.cc/PqYp5d7C/frame-legendary.png' },
      { name: 'Synthwave Sunset', description: 'Animated retro banner.', type: 'Banner', rarity: 'Epic', price: 800, imageUrl: 'https://i.postimg.cc/tJ5gST8z/banner-animated.gif' },
      { name: 'Pro League 2024', description: 'Badge for the pro league.', type: 'Badge', rarity: 'Epic', price: 500, imageUrl: 'https://i.postimg.cc/KzCjz1fS/badge-epic.png' },
      { name: 'Headshot Machine', description: 'Title to show off your aim.', type: 'Title', rarity: 'Rare', price: 250 },
    ];
    for (const item of items) {
      await ensureCosmetic(sql, item);
    }

    console.log('Seed completed');
  } catch (e) {
    console.error('Seed error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

main();
