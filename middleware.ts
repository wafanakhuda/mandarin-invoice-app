// middleware.ts (FIXED VERSION)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', path);
  console.log('URL:', request.url);
  
  // Allow login, API routes, and static files
  if (
    path.startsWith('/login') || 
    path.startsWith('/api/') || 
    path.startsWith('/_next/') ||
    path.includes('.') // Allow files with extensions (css, js, images)
  ) {
    console.log('✅ Skipping middleware for:', path);
    return NextResponse.next();
  }

  // Get all cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value })));
  
  // Check for auth cookie
  const authCookie = request.cookies.get('invoice-auth');
  console.log('Auth cookie found:', !!authCookie);
  console.log('Auth cookie value:', authCookie?.value);
  
  // Check if authenticated
  const isAuthenticated = authCookie?.value === 'authenticated';
  console.log('Is authenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    console.log('Redirecting to:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  console.log('✅ Authenticated, allowing access to:', path);
  return NextResponse.next();
}

// More specific matcher to avoid conflicts
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - Any file with extension (images, css, js, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.).*)',
  ],
};
