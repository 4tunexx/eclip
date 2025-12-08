#!/usr/bin/env python3
"""
Convert min-logo.png to icon.ico for the EclipAC application
"""

import os
import sys

def convert_png_to_ico():
    """Convert PNG to ICO using PIL"""
    try:
        from PIL import Image
    except ImportError:
        print("❌ PIL not installed. Installing...")
        os.system("pip install pillow")
        from PIL import Image
    
    input_path = os.path.join(os.path.dirname(__file__), "assets", "min-logo.png")
    output_path = os.path.join(os.path.dirname(__file__), "assets", "icon.ico")
    
    if not os.path.exists(input_path):
        print(f"❌ Error: {input_path} not found")
        return False
    
    try:
        # Open the PNG image
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            # Create a white background
            background = Image.new('RGB', img.size, (0, 0, 0))
            background.paste(img, mask=img.split()[3])
            img = background
        
        # Resize to appropriate icon size
        img = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        # Save as ICO
        img.save(output_path, format='ICO')
        
        print(f"✓ Successfully converted!")
        print(f"  Input:  {input_path}")
        print(f"  Output: {output_path}")
        print(f"  Size:   256x256")
        return True
    except Exception as e:
        print(f"❌ Conversion error: {e}")
        return False

if __name__ == "__main__":
    success = convert_png_to_ico()
    sys.exit(0 if success else 1)
