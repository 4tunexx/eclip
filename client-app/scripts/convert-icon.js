#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Simple PNG to ICO converter with proper dimensions
(async () => {
  try {
    const Sharp = require('sharp');
    const input = path.join(__dirname, '..', 'assets', 'min-logo.png');
    const output = path.join(__dirname, '..', 'assets', 'icon.ico');

    if (!fs.existsSync(input)) {
      throw new Error(`Logo not found: ${input}`);
    }

    console.log('🔄 Converting logo to 256x256 ICO format...');

    // Resize to 256x256
    const buffer = await Sharp(input)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0 }
      })
      .toFormat('png')
      .toBuffer();

    // Create proper ICO header with PNG data
    const icoHeader = Buffer.alloc(22);
    icoHeader.writeUInt16LE(0, 0);         // Reserved
    icoHeader.writeUInt16LE(1, 2);         // Type (1 = icon)
    icoHeader.writeUInt16LE(1, 4);         // Number of images
    icoHeader.writeUInt8(0, 6);            // Width (0 = 256)
    icoHeader.writeUInt8(0, 7);            // Height (0 = 256)
    icoHeader.writeUInt8(0, 8);            // Color palette
    icoHeader.writeUInt8(0, 9);            // Reserved
    icoHeader.writeUInt16LE(1, 10);        // Color planes
    icoHeader.writeUInt16LE(32, 12);       // Bits per pixel
    icoHeader.writeUInt32LE(buffer.length, 14);  // Image size
    icoHeader.writeUInt32LE(22, 18);       // Image offset

    // Write ICO file
    const icoData = Buffer.concat([icoHeader, buffer]);
    fs.writeFileSync(output, icoData);

    console.log('✓ Icon created successfully!');
    console.log(`  Size: 256x256`);
    console.log(`  Output: ${output}`);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    
    // Fallback: copy PNG directly
    try {
      const input = path.join(__dirname, '..', 'assets', 'min-logo.png');
      const output = path.join(__dirname, '..', 'assets', 'icon.ico');
      fs.copyFileSync(input, output);
      console.log('✓ Using PNG as ICO fallback');
    } catch (err) {
      console.error('❌ Fallback also failed:', err.message);
      process.exit(1);
    }
  }
})();
