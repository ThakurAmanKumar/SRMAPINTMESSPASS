'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #484622 0%, #5d5a2f 100%)' }}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-primary mb-2">SRMAP</div>
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
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 active:text-primary transition-colors p-1 rounded hover:bg-gray-100"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M15.171 11.586a4 4 0 111.414-1.414l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.121z" />
                    </svg>
                  )}
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
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 active:text-primary transition-colors p-1 rounded hover:bg-gray-100"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M15.171 11.586a4 4 0 111.414-1.414l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.121z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              />
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
