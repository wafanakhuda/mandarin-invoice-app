
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow login page and API routes
  if (path.startsWith('/login') || path.startsWith('/api/') || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Check for authentication cookie with environment-based validation
  const authCookie = request.cookies.get('invoice-auth');
  const expectedAuthValue = `authenticated-${process.env.AUTH_TOKEN || 'fallback-secret'}`;
  
  console.log('🔍 Middleware check:', { 
    path, 
    hasAuthCookie: !!authCookie,
    isValidAuth: authCookie?.value === expectedAuthValue
  });

  // Redirect to login if not authenticated
  if (!authCookie || authCookie.value !== expectedAuthValue) {
    console.log('🔒 Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('✅ Allowing access to', path);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
