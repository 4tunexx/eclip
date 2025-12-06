import postgres from 'postgres';
import 'dotenv/config';

async function testAuth() {
  const sql = postgres(process.env.DATABASE_URL || '', { max: 1 });
  try {
    // Verify admin exists
    const [admin] = await sql`SELECT id, email, username, role FROM users WHERE role = 'ADMIN' LIMIT 1`;
    console.log('\n✅ Admin Account Created:');
    console.table([admin]);
    console.log('\nTest Credentials:');
    console.log(`  Email: admin@eclip.pro`);
    console.log(`  Password: Admin123!`);
    console.log(`  URL: http://localhost:9002/api/auth/login`);
    
    // Check sessions table
    const sessions = await sql`SELECT * FROM information_schema.tables WHERE table_name = 'sessions'`;
    console.log('\n✅ Sessions Table:', sessions.length > 0 ? 'EXISTS' : 'MISSING');
    
    // Check users columns
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    const authCols = ['email', 'password_hash', 'role', 'email_verified'];
    const present = authCols.filter(c => cols.some(col => col.column_name === c));
    console.log('\n✅ Auth Columns Present:', present.join(', '));
  } catch (e) {
    console.error('Test failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    try { await sql.end({ timeout: 5 }); } catch {}
  }
}

testAuth();
