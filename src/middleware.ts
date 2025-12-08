import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/steam',
  '/api/auth/steam/return',
  '/api/auth/logout',
  '/api/stats/public',
  '/api/leaderboards/public',
  '/api/health',
  '/api/download',
];

// Static file patterns
const STATIC_FILES = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/downloads',
];

function isPublicRoute(pathname: string): boolean {
  // Exact match for root
  if (pathname === '/') return true;
  
  // Check public routes
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isStaticFile(pathname: string): boolean {
  return STATIC_FILES.some(pattern => pathname.startsWith(pattern));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get('session')?.value;

  // No token - redirect to landing page
  if (!sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Token exists - allow access (validation happens in API routes)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
