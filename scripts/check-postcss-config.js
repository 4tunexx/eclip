// This script loads the PostCSS config and prints it to the console.
// Use this to detect any syntax errors when Node loads the config.
try {
  const cfg = require('../postcss.config.cjs');
  console.log('PostCSS config loaded:', JSON.stringify(cfg, null, 2));
  process.exit(0);
} catch (err) {
  console.error('Error loading PostCSS config:', err);
  process.exit(1);
}
