#!/bin/bash
# Convert min-logo.png to icon.ico using ImageMagick
# This script converts your logo to Windows icon format

echo "Converting min-logo.png to icon.ico..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not installed. Installing..."
    # For Windows, user needs to install manually or use online converter
    echo "Please visit: https://icoconvert.com/ and convert min-logo.png to icon.ico"
    echo "Save as: client-app/assets/icon.ico"
else
    convert ../public/images/min-logo.png -define icon:auto-resize=256,128,96,64,48,32,16 client-app/assets/icon.ico
    echo "✓ Icon created: client-app/assets/icon.ico"
fi
