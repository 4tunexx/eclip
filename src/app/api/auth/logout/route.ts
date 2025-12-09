import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST() {
  // Delete session from DB first
  await logout();
  
  // Create response
  const response = NextResponse.json({ success: true });
  
  // Determine if production based on URL
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Delete the session cookie multiple ways to ensure it's cleared
  // Method 1: Standard cookie deletion (no domain)
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    secure: isProduction,  // Only secure in production
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
    maxAge: 0,
  });
  
  // Method 2: Also delete with domain for production
  if (isProduction) {
    response.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0,
      domain: '.eclip.pro',
    });
    
    // Method 3: Also delete root domain
    response.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0,
      domain: 'eclip.pro',
    });
  }
  
  return response;
}


