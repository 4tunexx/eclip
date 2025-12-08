import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
  try {
    // Path to the built executable
    const exePath = path.join(process.cwd(), 'public', 'downloads', 'EclipAC-Setup.exe');
    
    // Check if file exists
    if (!existsSync(exePath)) {
      return NextResponse.json(
        { 
          error: 'Installer not found',
          message: 'Please build the client app first: cd client-app && npm run build:win'
        },
        { status: 404 }
      );
    }

    // Read the file
    const file = await readFile(exePath);
    
    // Return the file with appropriate headers
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="EclipAC-Setup.exe"',
        'Content-Length': file.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download installer' },
      { status: 500 }
    );
  }
}
