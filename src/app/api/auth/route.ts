import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('=== AUTH DEBUG ===');
    console.log('Username:', username);
    console.log('Password length:', password?.length);
    console.log('INVOICE_PASSWORD exists:', !!process.env.INVOICE_PASSWORD);

    const correctUsername = 'admin';
    const correctPassword = process.env.INVOICE_PASSWORD || 'MandarinDecor2025';

    console.log('Expected password:', correctPassword);
    console.log('Passwords match:', password === correctPassword);

    if (username === correctUsername && password === correctPassword) {
      console.log('✅ Credentials valid - setting cookie');
      
      const cookieStore = await cookies();
      
      // Set cookie with all necessary options
      cookieStore.set('invoice-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      console.log('✅ Cookie set successfully');

      // Return response with additional cookie header (double insurance)
      const response = NextResponse.json({ success: true });
      
      // Set cookie in response header as backup
      response.cookies.set('invoice-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    } else {
      console.log('❌ Invalid credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
