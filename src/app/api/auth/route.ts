import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('🔐 Login attempt:', username);

    // Simple credential check
    const correctUsername = 'admin';
    const correctPassword = process.env.INVOICE_PASSWORD || 'MandarinDecor2025';

    if (username === correctUsername && password === correctPassword) {
      console.log('✅ Login successful');
      return NextResponse.json({ 
        success: true,
        token: 'invoice-authenticated-token' // Simple token
      });
    } else {
      console.log('❌ Invalid credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
