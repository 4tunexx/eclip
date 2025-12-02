import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/ac/status
 * 
 * Check if current user has AC client active
 * Used by the platform to verify protection before allowing queue
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // TODO: When real Windows client is built, check Redis for recent heartbeat
    // const heartbeat = await redis.get(`ac:heartbeat:${user.id}`);
    // const isActive = heartbeat !== null;
    
    // For now, return structure that real client will use
    return NextResponse.json({
      userId: user.id,
      isActive: false, // Will check Redis heartbeat when Windows .exe is ready
      lastHeartbeat: null,
      version: null,
      message: 'AC status check endpoint ready for Windows client integration'
    });
  } catch (error) {
    console.error('Error checking AC status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
