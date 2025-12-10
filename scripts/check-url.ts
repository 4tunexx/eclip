import 'dotenv/config';

console.log('Database URL analysis:');
console.log('');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

console.log('Full URL:', dbUrl);
console.log('');

// Parse the URL
try {
  const urlObj = new URL(dbUrl);
  console.log('Parsed URL components:');
  console.log('  Protocol:', urlObj.protocol);
  console.log('  Username:', urlObj.username);
  console.log('  Password:', urlObj.password ? '***' : '(none)');
  console.log('  Hostname:', urlObj.hostname);
  console.log('  Port:', urlObj.port || '(default)');
  console.log('  Database:', urlObj.pathname.slice(1));
  console.log('  Search params:', urlObj.search);
  console.log('');
  console.log('✓ Database URL is properly formatted');

} catch (error) {
  console.error('Failed to parse DATABASE_URL:', (error as Error).message);
  process.exit(1);
}
