import 'dotenv/config';
import * as dns from 'dns';

const hostname = 'ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech';

console.log(`Attempting to resolve: ${hostname}`);
console.log('');

// Try different DNS lookup methods
dns.resolve(hostname, (err, addresses) => {
  if (err) {
    console.error('dns.resolve failed:', err.message);
  } else {
    console.log('dns.resolve successful:', addresses);
  }
});

dns.resolve4(hostname, (err, addresses) => {
  if (err) {
    console.error('dns.resolve4 failed:', err.message);
  } else {
    console.log('dns.resolve4 successful:', addresses);
  }
});

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('dns.lookup failed:', err.message);
  } else {
    console.log('dns.lookup successful:', address, 'family:', family);
  }
});

// Try promises API
dns.promises.resolve4(hostname)
  .then(addresses => {
    console.log('dns.promises.resolve4 successful:', addresses);
  })
  .catch(err => {
    console.error('dns.promises.resolve4 failed:', err.message);
    console.error('This means the Neon server hostname cannot be resolved from this network.');
    console.error('');
    console.error('Possible causes:');
    console.error('1. Network/firewall is blocking external DNS queries');
    console.error('2. The dev container does not have internet access');
    console.error('3. There is a proxy/VPN requirement that is not configured');
    console.error('');
    console.error('Try testing from your host machine:');
    console.error(`  nslookup ${hostname}`);
    console.error(`  psql '${process.env.DATABASE_URL}'`);
  });
