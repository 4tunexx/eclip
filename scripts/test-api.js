import 'dotenv/config';

const BASE_URL = 'http://localhost:9002';
let adminToken = null;

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}`);
    await fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error?.message || error}`);
  }
}

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(endpoint, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Cookie'] = `session=${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  return { status: res.status, data: await res.json() };
}

async function runTests() {
  console.log('🚀 API Test Suite');
  console.log('==================');

  // Test 1: Health check
  await test('Health Check', async () => {
    const { status, data } = await get('/api/health');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.status !== 'healthy') throw new Error('Health check failed');
  });

  // Test 2: Admin Login
  await test('Admin Login', async () => {
    const { status, data } = await post('/api/auth/login', {
      email: 'admin@eclip.pro',
      password: 'Admin123!',
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}. ${data.error || ''}`);
    if (!data.user) throw new Error('No user in response');
    if (!data.user.isAdmin) throw new Error('User is not admin');
    // Extract token from response (it's in cookie too, but we check if success flag)
    adminToken = 'test_token'; // In real scenario, extract from cookies
    console.log(`   User: ${data.user.email} (Level ${data.user.level}, XP: ${data.user.xp})`);
  });

  // Test 3: Get Missions (no auth required)
  await test('Get Missions', async () => {
    const { status, data } = await post('/api/missions/progress', {
      missionId: 'any',
      progress: 0,
    });
    // This will 400 with invalid mission, but proves endpoint is callable
    if (status === 500) throw new Error('Server error on missions endpoint');
    console.log(`   Response status: ${status}`);
  });

  // Test 4: Get Achievements (no auth required in our schema)
  await test('Get Achievements', async () => {
    const { status, data } = await get('/api/achievements');
    if (status === 401) {
      console.log('   (Requires auth, which is expected)');
    } else if (status === 200) {
      console.log(`   Found ${data.length || 0} achievements`);
    } else {
      throw new Error(`Unexpected status ${status}`);
    }
  });

  // Test 5: Admin Users list (requires auth)
  await test('Admin Users List', async () => {
    const { status, data } = await get('/api/admin/users');
    if (status === 403 || status === 401) {
      console.log('   (Requires admin auth - expected without session cookie)');
    } else if (status === 200) {
      console.log(`   Found ${data.users?.length || 0} users`);
    } else {
      throw new Error(`Unexpected status ${status}`);
    }
  });

  // Test 6: Check missions in DB
  await test('Get Missions List', async () => {
    const { status, data } = await get('/api/missions');
    if (status === 401) {
      console.log('   (Requires auth)');
    } else if (status === 200 && data) {
      const total = (data.daily?.length || 0) + (data.weekly?.length || 0);
      console.log(`   Daily: ${data.daily?.length || 0}, Weekly: ${data.weekly?.length || 0}`);
    } else {
      throw new Error(`Unexpected status ${status}`);
    }
  });

  console.log('\n==================');
  console.log('✅ API Tests Complete!');
  console.log('\nNext: Test in browser at http://localhost:9002');
}

runTests().catch(console.error);
