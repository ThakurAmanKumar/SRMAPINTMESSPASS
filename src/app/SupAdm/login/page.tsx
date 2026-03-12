'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/superadmin/auth/login', {
        email,
        password,
      });

      if (response.data.requiresOTP) {
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/superadmin/auth/verify-login-otp', {
        email,
        otp,
      });

      if (response.data.token) {
        localStorage.setItem('superadmin-token', response.data.token);
        router.push('/SupAdm/protected/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/superadmin/auth/send-otp', { email });
      setError('');
      alert('OTP sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4" style={{ borderColor: '#484622' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border-4" style={{ borderColor: '#484622' }}>
              <Image
                src="/LOGO/dashboardsidebarlogo.png"
                alt="SRMAP Logo"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#484622' }}>Super Admin Panel</h1>
          <p className="text-gray-600">SRMAP International Mess Pass Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="super.admin@srmap.edu.in"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="••••••••"
                required
              />
              <div className="mt-2 text-right">
                <Link href="/SupAdm/forgot-password" className="text-sm hover:underline" style={{ color: '#484622' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-3 rounded" style={{ backgroundColor: '#efeee3', borderLeft: '4px solid #484622' }}>
              <p className="text-sm" style={{ color: '#484622' }}>OTP has been sent to <strong>{email}</strong></p>
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition text-center text-2xl"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#efeee3', color: '#484622' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd9cc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#efeee3'}
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full py-2 rounded-lg font-semibold transition"
              style={{ color: '#484622' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
