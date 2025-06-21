'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    // Check if there's already an auth cookie
    if (document.cookie.includes('invoice-auth=authenticated')) {
      setStatus('Already logged in, redirecting...');
      window.location.href = '/';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Logging in...');

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Username:', username);
      console.log('Password length:', password.length);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Important for cookies
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setStatus('✅ Success! Redirecting...');
        console.log('✅ Login successful');
        
        // Wait a moment for cookie to be set, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to home page');
          // Use window.location.replace to avoid back button issues
          window.location.replace('/');
        }, 1500);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus(`❌ Network error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const autoFill = () => {
    setUsername('admin');
    setPassword('MandarinDecor2025');
    setStatus('Credentials auto-filled');
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    console.log('Current cookies:', cookies);
    setStatus(`Cookies: ${cookies}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Invoice Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex gap-2 mt-4">
          <button
            onClick={autoFill}
            className="flex-1 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            Auto-fill Credentials
          </button>
          <button
            onClick={checkCookies}
            className="flex-1 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 text-sm"
          >
            Check Cookies
          </button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <strong>Status:</strong> {status}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 text-center">
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> MandarinDecor2025</p>
        </div>
      </div>
    </div>
  );
}
