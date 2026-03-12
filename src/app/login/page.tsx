'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

type LoginStep = 'credentials' | 'otp' | 'forgot-password' | 'forgot-password-otp' | 'reset-password';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.requiresOTP) {
        setSuccessMessage('OTP sent to your email. Please enter it below.');
        setOtp('');
        setStep('otp');
        
        // Auto-initiate OTP sending
        await axios.post('/api/auth/send-otp', {
          email: email.toLowerCase(),
          type: 'login',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-login-otp', {
        email: email.toLowerCase(),
        otp,
      });

      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', {
        email: email.toLowerCase(),
      });

      setSuccessMessage('OTP sent to your email. Please check your inbox.');
      setOtp('');
      setStep('forgot-password-otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Just verify the OTP format and move to password reset
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setStep('reset-password');
    setSuccessMessage('Please enter your new password');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      await axios.post('/api/auth/reset-password', {
        email: email.toLowerCase(),
        otp,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setStep('credentials');
        setEmail('');
        setPassword('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/send-otp', {
        email: email.toLowerCase(),
        type: step === 'otp' ? 'login' : 'password-reset',
      });
      setSuccessMessage('OTP resent successfully!');
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundImage: 'url(/Adminlogin-pagebackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-lg shadow-md border-2" style={{ borderColor: '#484622' }}>
              <Image
                src="/LOGO/dashboardsidebarlogo.png"
                alt="SRMAP Logo"
                width={100}
                height={100}
                className="rounded"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mess Pass Portal</h1>
          <p className="text-gray-600 text-sm mt-2">International Mess Committee</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Login Credentials Step */}
        {step === 'credentials' && (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ focusRingColor: '#484622' }}
                  onFocus={(e) => e.target.style.borderColor = '#484622'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                  disabled={loading}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('forgot-password');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-sm text-primary hover:text-yellow-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Verification code sent to:</strong> {email}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl letter-spacing border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">OTP expires in 5 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="flex-1 text-center text-sm text-primary hover:text-yellow-700 font-medium"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError('');
                  setSuccessMessage('');
                  setOtp('');
                }}
                disabled={loading}
                className="flex-1 text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Step */}
        {step === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Password Reset:</strong> Enter your email to receive a reset code.
              </p>
            </div>

            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setError('');
                setSuccessMessage('');
              }}
              disabled={loading}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Forgot Password OTP Step */}
        {step === 'forgot-password-otp' && (
          <form onSubmit={handleForgotPasswordOTPSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Verification code sent to:</strong> {email}
              </p>
            </div>

            <div>
              <label htmlFor="reset-otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                id="reset-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl letter-spacing border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">OTP expires in 15 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify and Continue'}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="flex-1 text-center text-sm text-primary hover:text-yellow-700 font-medium"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('forgot-password');
                  setError('');
                  setSuccessMessage('');
                  setOtp('');
                }}
                disabled={loading}
                className="flex-1 text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Step */}
        {step === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ OTP Verified:</strong> Please enter your new password.
              </p>
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  onFocus={(e) => e.target.style.borderColor = '#484622'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  onFocus={(e) => e.target.style.borderColor = '#484622'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                  disabled={loading}
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
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setError('');
                setSuccessMessage('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={loading}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Setup Instructions */}
        {step === 'credentials' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-semibold mb-2">First Time Admin Setup:</p>
            <p className="text-xs text-gray-600">Use your admin email and password configured in environment variables. If you don&apos;t have an admin account, contact your system administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
}
