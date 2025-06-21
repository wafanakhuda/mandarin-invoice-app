// app/api/auth/route.ts (SIMPLE VERSION)
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
    console.log('AUTH_TOKEN exists:', !!process.env.AUTH_TOKEN);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Use exact values from your Vercel env
    const correctUsername = 'admin';
    const correctPassword = process.env.INVOICE_PASSWORD || 'MandarinDecor2025';

    console.log('Expected password:', correctPassword);
    console.log('Passwords match:', password === correctPassword);

    if (username === correctUsername && password === correctPassword) {
      console.log('✅ Credentials valid - setting simple cookie');
      
      // Set SIMPLE cookie first
      const cookieStore = await cookies();
      cookieStore.set('invoice-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      console.log('✅ Cookie set');
      return NextResponse.json({ success: true });
    } else {
      console.log('❌ Invalid credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
