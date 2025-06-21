import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt:', { username, passwordLength: password?.length });

    // Check credentials using your environment variables
    const correctUsername = 'admin';
    const correctPassword = process.env.INVOICE_PASSWORD || 'MandarinDecor2025';

    if (username === correctUsername && password === correctPassword) {
      console.log('✅ Valid credentials');
      
      // Create response with success
      const response = NextResponse.json({ success: true });
      
      // Set authentication cookie
      response.cookies.set('invoice-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      console.log('✅ Cookie set successfully');
      return response;
    } else {
      console.log('❌ Invalid credentials');
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
