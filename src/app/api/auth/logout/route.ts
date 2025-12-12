import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    console.log('[Logout API] Starting logout process');
    
    // Delete session from DB first
    await logout();
    console.log('[Logout API] Session deleted from database');
    
    // Get cookies to delete
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    console.log('[Logout API] Session cookie exists:', !!sessionCookie);
    
    // Determine if production
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.API_BASE_URL?.includes('eclip.pro');
    
    // Create response
    const response = NextResponse.json({ 
      success: true,
      redirect: '/',
      message: 'Logged out successfully'
    });
    
    // Delete the session cookie - multiple methods to ensure it works
    // Method 1: Standard deletion (no domain)
    response.cookies.delete({
      name: 'session',
      path: '/',
    });
    
    response.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: -1,
    });
    
    // Method 2: Production domain variations
    if (isProduction) {
      response.cookies.delete({
        name: 'session',
        path: '/',
        domain: '.eclip.pro',
      });
      
      response.cookies.set({
        name: 'session',
        value: '',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: new Date(0),
        path: '/',
        maxAge: -1,
        domain: '.eclip.pro',
      });
    }
    
    console.log('[Logout API] Cookies cleared, returning response');
    return response;
  } catch (error) {
    console.error('[Logout] Error:', error);
    // Even on error, return success to allow client-side cleanup
    const response = NextResponse.json({ success: true, redirect: '/', message: 'Logout completed with errors' });
    response.cookies.delete({ name: 'session', path: '/' });
    return response;
  }
}


