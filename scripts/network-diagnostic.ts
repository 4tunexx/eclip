#!/usr/bin/env node

import 'dotenv/config';
import * as fs from 'fs';
import * as os from 'os';
import * as net from 'net';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                    NETWORK DIAGNOSTIC REPORT                       ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log('');

// 1. Environment
console.log('1️⃣  ENVIRONMENT');
console.log('   OS:', os.platform(), os.release());
console.log('   Node:', process.version);
console.log('   Working dir:', process.cwd());
console.log('');

// 2. .env.local check
console.log('2️⃣  CONFIGURATION');
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  console.log('   ✓ .env.local found');
  console.log('   ✓ DATABASE_URL loaded:', !!process.env.DATABASE_URL);
  const url = process.env.DATABASE_URL;
  if (url) {
    const host = url.split('@')[1]?.split(':')[0] || 'unknown';
    console.log('   ✓ Database host:', host);
  }
} else {
  console.log('   ✗ .env.local NOT found');
}
console.log('');

// 3. Network interfaces
console.log('3️⃣  NETWORK INTERFACES');
const interfaces = os.networkInterfaces();
for (const [name, addrs] of Object.entries(interfaces)) {
  const ipv4 = addrs?.find(a => a.family === 'IPv4');
  if (ipv4) {
    console.log(`   ${name}: ${ipv4.address}`);
  }
}
console.log('');

// 4. DNS configuration
console.log('4️⃣  DNS CONFIGURATION');
if (fs.existsSync('/etc/resolv.conf')) {
  const resolv = fs.readFileSync('/etc/resolv.conf', 'utf-8');
  const nameservers = resolv.split('\n').filter(l => l.startsWith('nameserver'));
  console.log('   Nameservers:');
  nameservers.forEach(ns => console.log('   ', ns));
} else {
  console.log('   /etc/resolv.conf not found');
}
console.log('');

// 5. Connection test
console.log('5️⃣  CONNECTIVITY TEST');
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`   Attempting to test: ${url.hostname}`);
  console.log('');
  
  // Try to make a TCP connection
  const socket = net.createConnection(
    { 
      host: url.hostname, 
      port: 5432,
      timeout: 5000 
    },
    () => {
      console.log('   ✓ TCP connection successful!');
      socket.destroy();
      showSummary('SUCCESS', 'Connection to Neon database works!');
    }
  );

  socket.on('error', (err: any) => {
    console.log(`   ✗ TCP connection failed: ${err.message}`);
    console.log(`   Error code: ${err.code}`);
    console.log('');
    
    if (err.code === 'ENOTFOUND') {
      showSummary('NETWORK ERROR', 'DNS cannot resolve the Neon hostname. The dev container may not have internet access.');
    } else if (err.code === 'ECONNREFUSED') {
      showSummary('CONNECTION REFUSED', 'Host resolved but connection refused. Check firewall or port.');
    } else if (err.code === 'ETIMEDOUT') {
      showSummary('TIMEOUT', 'Connection timed out. Network may be unreachable or very slow.');
    } else {
      showSummary('CONNECTION ERROR', `Error: ${err.message}`);
    }
  });

  socket.on('timeout', () => {
    console.log('   ✗ Connection timeout');
    socket.destroy();
    showSummary('TIMEOUT', 'Connection to Neon server timed out.');
  });
} else {
  console.log('   ✗ DATABASE_URL not set');
  showSummary('CONFIG ERROR', 'DATABASE_URL environment variable not found');
}

function showSummary(title: string, message: string) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log(`║ ${title.padEnd(66)} ║`);
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  const lines = message.match(/.{1,66}/g) || [];
  lines.forEach(line => {
    console.log(`║ ${line.padEnd(66)} ║`);
  });
  console.log('╚════════════════════════════════════════════════════════════════════╝');
}
