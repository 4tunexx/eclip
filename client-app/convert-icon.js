#!/usr/bin/env node

/**
 * Convert PNG to ICO using Node.js
 * Uses the 'to-ico' package
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const inputPath = path.join(__dirname, 'assets', 'min-logo.png');
const outputPath = path.join(__dirname, 'assets', 'icon.ico');

console.log('🔄 Converting logo to icon format...');
console.log(`   Input:  ${inputPath}`);
console.log(`   Output: ${outputPath}`);

// Check if PNG exists
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Error: ${inputPath} not found`);
  process.exit(1);
}

// Install to-ico package
console.log('📦 Installing conversion tool...');
exec('npm install to-ico', { cwd: __dirname }, (error) => {
  if (error) {
    console.error('❌ Failed to install to-ico:', error.message);
    console.log('\n📝 Alternative: Convert manually at https://icoconvert.com/');
    process.exit(1);
  }

  console.log('✓ Tool installed');

  // Convert the image
  try {
    const toIco = require('to-ico');
    const sharp = require('sharp');

    (async () => {
      try {
        // Read and resize the PNG
        const buffer = await sharp(inputPath)
          .resize(256, 256, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer();

        // Convert to ICO
        const icoBuffer = await toIco([buffer]);

        // Write ICO file
        fs.writeFileSync(outputPath, icoBuffer);

        console.log('✓ Successfully converted!');
        console.log(`✓ Icon size: 256x256`);
        process.exit(0);
      } catch (err) {
        console.error('❌ Conversion failed:', err.message);
        process.exit(1);
      }
    })();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
});
