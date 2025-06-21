
'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('invoice-auth-token');
    if (token === 'invoice-authenticated-token') {
      setStatus('Already logged in, redirecting...');
      window.location.href = '/';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Logging in...');

    try {
      console.log('🔐 Attempting login...');
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('📡 Response:', data);

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('invoice-auth-token', data.token);
        setStatus('✅ Login successful! Redirecting...');
        console.log('✅ Token stored, redirecting...');
        
        // Redirect to main page
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('❌ Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = () => {
    setUsername('admin');
    setPassword('MandarinDecor2025');
    setStatus('Credentials filled');
  };

  const checkStorage = () => {
    const token = localStorage.getItem('invoice-auth-token');
    setStatus(`Storage: ${token ? 'Token exists' : 'No token'}`);
    console.log('Current token:', token);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Invoice Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border rounded"
            required
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border rounded"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="space-y-2 mt-4">
          <button
            onClick={handleAutoFill}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Fill: admin / MandarinDecor2025
          </button>
          
          <button
            onClick={checkStorage}
            className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
          >
            Check Storage
          </button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <strong>Status:</strong> {status}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> MandarinDecor2025</p>
        </div>
      </div>
    </div>
  );
}
