import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST() {
  await logout();
  
  // Create response with explicit cookie deletion
  const response = NextResponse.json({ success: true });
  
  // Determine if production
  const isProduction = process.env.API_BASE_URL?.includes('www.eclip.pro') || 
                      process.env.STEAM_REALM?.includes('www.eclip.pro');
  
  // Delete cookie in response as well
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
    maxAge: 0,
    ...(isProduction && { domain: '.eclip.pro' }),
  });
  
  return response;
}

