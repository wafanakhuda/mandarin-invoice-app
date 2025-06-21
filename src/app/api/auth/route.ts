import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Debug: Log what's happening
    const correctPassword = process.env.INVOICE_PASSWORD;
    const fallbackPassword = 'mandarin2025';
    
    console.log('🔐 Auth Debug:');
    console.log('- Received password:', password);
    console.log('- Environment password:', correctPassword ? 'SET' : 'NOT SET');
    console.log('- Using fallback:', !correctPassword);
    
    const passwordToCheck = correctPassword || fallbackPassword;
    
    if (password === passwordToCheck) {
      console.log('✅ Password correct');
      
      const response = NextResponse.json({ 
        success: true,
        debug: {
          usedFallback: !correctPassword,
          passwordLength: passwordToCheck.length
        }
      });
      
      response.cookies.set('invoice-auth', process.env.AUTH_TOKEN || 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return response;
    } else {
      console.log('❌ Password incorrect');
      return NextResponse.json({ 
        error: 'Invalid password',
        debug: {
          expectedLength: passwordToCheck.length,
          receivedLength: password.length
        }
      }, { status: 401 });
    }
  } catch (error) {
    console.log('💥 Auth error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// Add logout endpoint
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  
  // Clear the auth cookie
  response.cookies.delete('invoice-auth');
  
  return response;
}
