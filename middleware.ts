import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow login page and API routes
  if (path.startsWith('/login') || path.startsWith('/api/') || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('invoice-auth');
  const authToken = process.env.AUTH_TOKEN || 'mandarin_auth_token_secret';
  const expectedAuthValue = `authenticated-${authToken}`;
  
  console.log('🔍 Middleware check:', { 
    path,
    hasAuthCookie: !!authCookie,
    cookieValue: authCookie?.value?.substring(0, 20) + '...',
    expectedValue: expectedAuthValue.substring(0, 20) + '...',
    isValidAuth: authCookie?.value === expectedAuthValue
  });

  // Redirect to login if not authenticated
  if (!authCookie || authCookie.value !== expectedAuthValue) {
    console.log('🔒 Redirecting to login from:', path);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('✅ Allowing access to:', path);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
