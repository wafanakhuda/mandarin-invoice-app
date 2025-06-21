// app/api/auth/route.ts (WITH DEBUGGING)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Debug: Log environment variables (be careful in production)
    console.log('🔐 Environment check:', {
      hasInvoicePassword: !!process.env.INVOICE_PASSWORD,
      hasAuthToken: !!process.env.AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });

    // Credentials from environment variables
    const expectedUsername = 'admin';
    const expectedPassword = process.env.INVOICE_PASSWORD || 'MandarinDecor2025';

    console.log('🔐 Login attempt:', { 
      username,
      passwordLength: password?.length,
      expectedPasswordLength: expectedPassword.length
    });

    // Validate credentials
    if (username === expectedUsername && password === expectedPassword) {
      console.log('✅ Valid credentials - setting cookie');
      
      try {
        // Set authentication cookie
        const cookieStore = await cookies();
        const authToken = process.env.AUTH_TOKEN || 'mandarin_auth_token_secret';
        const cookieValue = `authenticated-${authToken}`;
        
        cookieStore.set('invoice-auth', cookieValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        console.log('✅ Cookie set successfully');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Login successful',
          debug: {
            cookieValue: cookieValue.substring(0, 20) + '...' // Partial for security
          }
        });
      } catch (cookieError) {
        console.error('❌ Cookie setting error:', cookieError);
        return NextResponse.json(
          { error: 'Failed to set authentication cookie' },
          { status: 500 }
        );
      }
    } else {
      console.log('❌ Invalid credentials:', {
        usernameMatch: username === expectedUsername,
        passwordMatch: password === expectedPassword,
        receivedPassword: password,
        expectedPassword: expectedPassword
      });
      
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
