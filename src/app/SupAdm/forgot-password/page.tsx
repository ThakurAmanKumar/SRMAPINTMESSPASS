'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp-password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/superadmin/auth/forgot-password', { email });
      setStep('otp-password');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/superadmin/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/superadmin/auth/forgot-password', { email });
      alert('OTP sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundImage: 'url(/SuperAdminlogin-backgroundimg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border-t-4 relative z-10" style={{ borderColor: '#484622' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg shadow-md border-2" style={{ borderColor: '#484622' }}>
              <Image
                src="/LOGO/dashboardsidebarlogo.png"
                alt="SRMAP Logo"
                width={80}
                height={80}
                className="rounded"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#484622' }}>Reset Password</h1>
          <p className="text-gray-600">SRMAP International Mess Pass Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>
                Enter Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => (e.target.style.borderColor = '#484622')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                placeholder="super.admin@srmap.edu.in"
                required
              />
            </div>

            <p className="text-sm text-gray-600">
              We&apos;ll send an OTP to verify your identity and let you reset your password.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3419')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#484622')}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <Link
              href="/SupAdm/login"
              className="flex items-center justify-center space-x-2 py-2 rounded-lg font-semibold transition"
              style={{ color: '#484622' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <ArrowLeft size={18} />
              <span>Back to Login</span>
            </Link>
          </form>
        ) : step === 'otp-password' ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="p-3 rounded" style={{ backgroundColor: '#efeee3', borderLeft: '4px solid #484622' }}>
              <p className="text-sm" style={{ color: '#484622' }}>
                OTP sent to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition text-center text-2xl"
                onFocus={(e) => (e.target.style.borderColor = '#484622')}
                onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                placeholder="000000"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition pr-10"
                  onFocus={(e) => (e.target.style.borderColor = '#484622')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition"
                  style={{ color: '#484622' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#efeee3';
                    e.currentTarget.style.color = '#3a3419';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#484622';
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition pr-10"
                  onFocus={(e) => (e.target.style.borderColor = '#484622')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition"
                  style={{ color: '#484622' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#efeee3';
                    e.currentTarget.style.color = '#3a3419';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#484622';
                  }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3419')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#484622')}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full py-2 rounded-lg font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: '#efeee3', color: '#484622' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ddd9cc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#efeee3')}
            >
              Resend OTP
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#efeee3' }}>
              <span className="text-3xl">✓</span>
            </div>

            <h2 className="text-2xl font-bold" style={{ color: '#484622' }}>
              Password Reset Successful!
            </h2>

            <p className="text-gray-600">
              Your password has been successfully reset. You can now login with your new password.
            </p>

            <Link
              href="/SupAdm/login"
              className="w-full block text-center px-6 py-2 text-white font-semibold rounded-lg transition"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3419')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#484622')}
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
