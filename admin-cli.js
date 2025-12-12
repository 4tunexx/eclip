#!/usr/bin/env node

/**
 * Admin CLI Tool
 * Direct command-line access to admin functions
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local not found!');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    Object.assign(process.env, envVars);

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not found!');
      process.exit(1);
    }

    const postgres = require('postgres');
    const sql = postgres(DATABASE_URL, { max: 1 });

    const command = process.argv[2];
    const args = process.argv.slice(3);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              ADMIN CLI TOOL                                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    switch (command) {
      case 'list-users':
        await listUsers(sql);
        break;

      case 'get-user':
        if (!args[0]) {
          console.error('Usage: node admin-cli.js get-user <username>');
          process.exit(1);
        }
        await getUser(sql, args[0]);
        break;

      case 'set-role':
        if (args.length < 2) {
          console.error('Usage: node admin-cli.js set-role <username> <role>');
          console.error('Roles: USER, VIP, INSIDER, MODERATOR, ADMIN');
          process.exit(1);
        }
        await setRole(sql, args[0], args[1]);
        break;

      case 'add-coins':
        if (args.length < 2) {
          console.error('Usage: node admin-cli.js add-coins <username> <amount>');
          process.exit(1);
        }
        await addCoins(sql, args[0], parseInt(args[1]));
        break;

      case 'set-stats':
        if (args.length < 4) {
          console.error('Usage: node admin-cli.js set-stats <username> <level> <xp> <esr>');
          process.exit(1);
        }
        await setStats(sql, args[0], parseInt(args[1]), parseInt(args[2]), parseInt(args[3]));
        break;

      case 'delete-user':
        if (!args[0]) {
          console.error('Usage: node admin-cli.js delete-user <username>');
          process.exit(1);
        }
        await deleteUser(sql, args[0]);
        break;

      case 'status':
        await status(sql);
        break;

      default:
        showHelp();
        process.exit(0);
    }

    await sql.end();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Commands:

  list-users              List all users in database
  get-user <username>     Get user details
  set-role <username> <role>    Assign role to user
  add-coins <username> <amount> Add coins to user
  set-stats <user> <lvl> <xp> <esr>    Set user stats
  delete-user <username>  Delete a user
  status                  Show system status

Examples:

  node admin-cli.js list-users
  node admin-cli.js get-user john_doe
  node admin-cli.js set-role john_doe VIP
  node admin-cli.js add-coins john_doe 1000
  node admin-cli.js set-stats john_doe 20 50000 1500
  node admin-cli.js delete-user john_doe
  node admin-cli.js status

Available Roles:
  USER, VIP, INSIDER, MODERATOR, ADMIN
  `);
}

async function listUsers(sql) {
  console.log('📋 ALL USERS IN DATABASE\n');
  
  const users = await sql`
    SELECT id, username, email, level, esr, role, coins, created_at
    FROM "users"
    ORDER BY created_at DESC
  `;

  if (users.length === 0) {
    console.log('No users found.');
    return;
  }

  console.log(`Found ${users.length} users:\n`);
  users.forEach((u, i) => {
    const createdDate = new Date(u.created_at).toLocaleDateString();
    console.log(`${i + 1}. ${u.username}`);
    console.log(`   Email: ${u.email || 'Not set'}`);
    console.log(`   Role: ${u.role}`);
    console.log(`   Level: ${u.level}, ESR: ${u.esr}, Coins: ${u.coins}`);
    console.log(`   Created: ${createdDate}\n`);
  });
}

async function getUser(sql, username) {
  const users = await sql`
    SELECT * FROM "users" WHERE LOWER(username) = LOWER(${username})
  `;

  if (users.length === 0) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  const user = users[0];
  console.log(`\n✅ User Found: ${user.username}\n`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email || 'Not set'}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Role Color: ${user.role_color}`);
  console.log(`  Level: ${user.level}`);
  console.log(`  XP: ${user.xp}`);
  console.log(`  ESR: ${user.esr}`);
  console.log(`  Coins: ${user.coins}`);
  console.log(`  Verified: ${user.email_verified ? 'Yes' : 'No'}`);
  console.log(`  Created: ${new Date(user.created_at).toLocaleString()}\n`);
}

async function setRole(sql, username, role) {
  const users = await sql`
    SELECT id FROM "users" WHERE LOWER(username) = LOWER(${username})
  `;

  if (users.length === 0) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  const validRoles = ['USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN'];
  const normalizedRole = role.toUpperCase();
  
  if (!validRoles.includes(normalizedRole)) {
    console.log(`❌ Invalid role "${role}". Valid roles: ${validRoles.join(', ')}`);
    return;
  }

  const roleColors = {
    'USER': '#808080',
    'VIP': '#FFD700',
    'INSIDER': '#87CEEB',
    'MODERATOR': '#FF8C00',
    'ADMIN': '#FF1493'
  };

  const userId = users[0].id;
  
  await sql`
    UPDATE "users" 
    SET role = ${normalizedRole}, 
        role_color = ${roleColors[normalizedRole]},
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`✅ Role Updated!\n`);
  console.log(`  User: ${username}`);
  console.log(`  Role: ${normalizedRole}`);
  console.log(`  Color: ${roleColors[normalizedRole]}\n`);
}

async function addCoins(sql, username, amount) {
  const users = await sql`
    SELECT id, coins FROM "users" WHERE LOWER(username) = LOWER(${username})
  `;

  if (users.length === 0) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  const userId = users[0].id;
  const newCoins = parseFloat(users[0].coins) + amount;

  await sql`
    UPDATE "users" 
    SET coins = ${newCoins.toString()},
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`✅ Coins Added!\n`);
  console.log(`  User: ${username}`);
  console.log(`  Added: ${amount}`);
  console.log(`  New Total: ${newCoins}\n`);
}

async function setStats(sql, username, level, xp, esr) {
  const users = await sql`
    SELECT id FROM "users" WHERE LOWER(username) = LOWER(${username})
  `;

  if (users.length === 0) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  const userId = users[0].id;

  await sql`
    UPDATE "users" 
    SET level = ${level},
        xp = ${xp},
        esr = ${esr},
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`✅ Stats Updated!\n`);
  console.log(`  User: ${username}`);
  console.log(`  Level: ${level}`);
  console.log(`  XP: ${xp}`);
  console.log(`  ESR: ${esr}\n`);
}

async function deleteUser(sql, username) {
  const users = await sql`
    SELECT id, username FROM "users" WHERE LOWER(username) = LOWER(${username})
  `;

  if (users.length === 0) {
    console.log(`❌ User "${username}" not found`);
    return;
  }

  const userId = users[0].id;

  // Confirm deletion
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`⚠️  Are you sure you want to delete user "${username}"? (yes/no): `, async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      try {
        await sql`DELETE FROM "users" WHERE id = ${userId}`;
        console.log(`✅ User deleted: ${username}\n`);
      } catch (err) {
        console.log(`❌ Failed to delete user: ${err.message}\n`);
      }
    } else {
      console.log(`❌ Deletion cancelled\n`);
    }
    rl.close();
  });
}

async function status(sql) {
  console.log('🔍 SYSTEM STATUS\n');

  const tables = await sql`
    SELECT COUNT(*) as count FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;

  const users = await sql`SELECT COUNT(*) as count FROM "users"`;
  const roles = await sql`
    SELECT DISTINCT role, COUNT(*) as count FROM "users" GROUP BY role
  `;

  console.log(`Database Tables: ${tables[0].count}`);
  console.log(`Total Users: ${users[0].count}\n`);
  console.log('Users by Role:');
  
  roles.forEach(r => {
    console.log(`  ${r.role}: ${r.count}`);
  });

  console.log('\n✅ Status check complete\n');
}

main();
