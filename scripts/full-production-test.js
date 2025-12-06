#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:9002';

function request(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(path, BASE_URL);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (cookie) {
        options.headers['Cookie'] = cookie;
      }

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data ? JSON.parse(data) : null,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data,
            });
          }
        });
      });

      req.on('error', (err) => {
        resolve({
          status: 0,
          headers: {},
          body: { error: err.message },
        });
      });
      if (body) req.write(JSON.stringify(body));
      req.end();
    } catch (err) {
      resolve({
        status: 0,
        headers: {},
        body: { error: err.message },
      });
    }
  });
}

async function test() {
  console.log('\n🚀 FULL PRODUCTION TEST SUITE\n');

  // Test 1: Health check
  console.log('1️⃣  Testing health endpoint...');
  try {
    const health = await request('GET', '/api/health');
    if (health.status === 200) {
      console.log('   ✅ API is healthy');
    } else {
      console.log(`   ❌ Unexpected status: ${health.status}`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }

  // Test 2: Login
  console.log('\n2️⃣  Testing login...');
  try {
    const login = await request('POST', '/api/auth/login', {
      email: 'airijuz@gmail.com',
      password: 'Rojus1990',
    });

    if (login.status === 200) {
      const sessionCookie = login.headers['set-cookie']?.[0];
      if (sessionCookie) {
        console.log('   ✅ Login successful');

        // Test 3: Get user profile (requires auth)
        console.log('\n3️⃣  Testing /api/auth/me (requires auth)...');
        const me = await request('GET', '/api/auth/me', null, sessionCookie);
        if (me.status === 200) {
          console.log(`   ✅ Got user profile: ${me.body.email}`);

          // Test 4: Get missions (requires auth)
          console.log('\n4️⃣  Testing /api/missions (requires auth)...');
          try {
            const missions = await request('GET', '/api/missions', null, sessionCookie);
            if (missions.status === 200) {
              console.log(`   ✅ Missions API working. Count: ${missions.body.length || 0}`);
            } else {
              console.log(`   ❌ Status ${missions.status}: ${missions.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 5: Get achievements (requires auth)
          console.log('\n5️⃣  Testing /api/achievements (requires auth)...');
          try {
            const achievements = await request('GET', '/api/achievements', null, sessionCookie);
            if (achievements.status === 200) {
              console.log(`   ✅ Achievements API working. Count: ${achievements.body.length || 0}`);
            } else {
              console.log(`   ❌ Status ${achievements.status}: ${achievements.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 6: Get shop items
          console.log('\n6️⃣  Testing /api/shop/items...');
          try {
            const shop = await request('GET', '/api/shop/items', null, sessionCookie);
            if (shop.status === 200) {
              console.log(`   ✅ Shop API working. Count: ${shop.body.length || 0}`);
            } else {
              console.log(`   ❌ Status ${shop.status}: ${shop.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 7: Get leaderboards
          console.log('\n7️⃣  Testing /api/leaderboards...');
          try {
            const leaderboards = await request('GET', '/api/leaderboards', null, sessionCookie);
            if (leaderboards.status === 200) {
              console.log(`   ✅ Leaderboards API working. Count: ${leaderboards.body.players?.length || 0}`);
            } else {
              console.log(`   ❌ Status ${leaderboards.status}: ${leaderboards.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 8: Get notifications
          console.log('\n8️⃣  Testing /api/notifications...');
          try {
            const notifs = await request('GET', '/api/notifications', null, sessionCookie);
            if (notifs.status === 200) {
              console.log(`   ✅ Notifications API working. Count: ${notifs.body.length || 0}`);
            } else {
              console.log(`   ❌ Status ${notifs.status}: ${notifs.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 9: Get VIP info
          console.log('\n9️⃣  Testing /api/vip...');
          try {
            const vip = await request('GET', '/api/vip', null, sessionCookie);
            if (vip.status === 200) {
              console.log(`   ✅ VIP API working. Tiers: ${vip.body.tiers?.length || 0}`);
            } else {
              console.log(`   ❌ Status ${vip.status}: ${vip.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }

          // Test 10: Admin coins endpoint
          console.log('\n🔟 Testing /api/admin/coins (admin only)...');
          try {
            const coins = await request('GET', '/api/admin/coins', null, sessionCookie);
            if (coins.status === 200) {
              console.log(`   ✅ Admin coins API working. Current coins: ${coins.body.coins}`);
            } else if (coins.status === 403) {
              console.log(`   ⚠️  Not admin (expected if not admin user)`);
            } else {
              console.log(`   ❌ Status ${coins.status}: ${coins.body.error || 'Unknown error'}`);
            }
          } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
          }
        } else {
          console.log(`   ❌ /api/auth/me failed with status ${me.status}`);
        }
      } else {
        console.log('   ❌ No session cookie returned');
      }
    } else {
      console.log(`   ❌ Login failed with status ${login.status}`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }

  console.log('\n✅ TEST SUITE COMPLETE\n');
}

test().catch(console.error);
