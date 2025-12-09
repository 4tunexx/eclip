import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Delete session from DB first
    await logout();
    
    // Get cookies to delete
    const cookieStore = await cookies();
    
    // Determine if production
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.API_BASE_URL?.includes('eclip.pro');
    
    // Create response
    const response = NextResponse.json({ 
      success: true,
      redirect: '/' // Tell client where to go
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
    
    return response;
  } catch (error) {
    console.error('[Logout] Error:', error);
    // Even on error, return success to allow client-side cleanup
    const response = NextResponse.json({ success: true, redirect: '/' });
    response.cookies.delete({ name: 'session', path: '/' });
    return response;
  }
}


