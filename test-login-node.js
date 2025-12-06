const http = require('http');

const postData = JSON.stringify({
  email: 'airijuz@gmail.com',
  password: 'Rojus1990'
});

const options = {
  hostname: 'localhost',
  port: 9002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('\n🔐 Testing Login API...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('\nResponse Headers:');
  Object.entries(res.headers).forEach(([key, val]) => {
    if (key.toLowerCase() === 'set-cookie') {
      console.log(`  ${key}: ${val}`);
    }
  });
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
