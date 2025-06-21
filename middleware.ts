import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', path);
  
  // Allow login and API routes
  if (path.startsWith('/login') || path.startsWith('/api/') || path.startsWith('/_next/')) {
    console.log('✅ Allowing:', path);
    return NextResponse.next();
  }

  // Check for simple auth cookie
  const authCookie = request.cookies.get('invoice-auth');
  console.log('Cookie exists:', !!authCookie);
  console.log('Cookie value:', authCookie?.value);
  
  if (!authCookie || authCookie.value !== 'authenticated') {
    console.log('🔒 No valid cookie, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('✅ Valid cookie, allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
