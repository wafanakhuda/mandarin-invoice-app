
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Credentials from environment variables
const VALID_CREDENTIALS = {
  username: 'admin',
  password: process.env.INVOICE_PASSWORD || 'admin123' // Fallback for development
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('🔐 Login attempt:', { username });

    // Validate credentials
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      console.log('✅ Valid credentials');
      
      // Set authentication cookie with environment-based secret
      const cookieStore = await cookies();
      const authToken = process.env.AUTH_TOKEN || 'fallback-secret';
      
      cookieStore.set('invoice-auth', `authenticated-${authToken}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Login successful' 
      });
    } else {
      console.log('❌ Invalid credentials');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
