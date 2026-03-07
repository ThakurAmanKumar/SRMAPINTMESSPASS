'use client';

import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Shield, CheckCircle, AlertCircle, X, Search, ImageIcon } from 'lucide-react';

export default function VerifyPassPage() {
  const [inputValue, setInputValue] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationError, setVerificationError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'error' | 'not_found' | 'not_approved'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);
  };

  const handleVerifyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationData(null);

    if (!inputValue.trim()) {
      setVerificationError('Please enter the issue number');
      return;
    }

    setIsLoading(true);
    setVerificationStatus('pending');

    try {
      // Construct the full Issue ID
      const fullIssueId = `SRMAPIM${inputValue.padStart(2, '0')}`;

      const response = await axios.post('/api/verify-pass', {
        issueId: fullIssueId,
      });

      setVerificationData(response.data.data);
      setVerificationStatus('verified');
    } catch (err: any) {
      const errorResponse = err.response?.data;
      
      if (err.response?.status === 404) {
        setVerificationStatus('not_found');
        setVerificationError('This pass number does not exist.');
      } else if (err.response?.status === 403) {
        setVerificationStatus('not_approved');
        setVerificationError('This request is still under review.');
      } else {
        setVerificationStatus('error');
        setVerificationError(errorResponse?.error || 'Failed to verify pass. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#efeee3' }}>
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#484622] via-[#5d5a2f] to-[#484622] text-white py-20 px-4 md:px-8 shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-white/5 rounded-full"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Shield size={16} />
            <span className="text-sm font-medium">SRMAP International Mess Committee</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-poppins tracking-tight">
            Verify Mess Pass
          </h1>
          <p className="text-xl text-white/90 mb-8 font-inter max-w-2xl mx-auto">
            Enter the pass Issue ID to verify if the student has a valid International Mess Pass.
          </p>

          {/* Decorative Line */}
          <div className="mt-10 flex justify-center items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-32"></div>
            <div className="w-2 h-2 bg-white/60 rotate-45"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-2xl mx-auto px-4 md:px-8 py-16">
        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Card Header */}
          <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-gray-100">
            <div className="bg-gradient-to-br from-[#484622] to-[#5d5a2f] text-white p-4 rounded-2xl shadow-lg">
              <Search size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#484622] font-poppins">
                Verify Pass
              </h2>
              <p className="text-gray-500 text-sm">Enter the Issue ID number</p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleVerifyPass} className="space-y-6 mb-8">
            {/* Issue ID Input */}
            <div className="space-y-3">
              <label className="block text-gray-700 font-semibold text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#484622] rounded-full"></span>
                Enter Issue ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold pointer-events-none">
                  SRMAPIM
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="01"
                  maxLength="5"
                  className="w-full pl-32 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white text-gray-800 font-mono text-lg font-bold"
                />
              </div>
              <p className="text-gray-500 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} />
                Example format: 01 (System will create SRMAPIM01)
              </p>
            </div>

            {/* Error Messages */}
            {verificationError && verificationStatus !== 'verified' && (
              <div
                className={`rounded-xl p-4 flex items-start gap-3 ${
                  verificationStatus === 'not_found'
                    ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                    : verificationStatus === 'not_approved'
                    ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700'
                    : 'bg-red-50 border-l-4 border-red-500 text-red-700'
                }`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {verificationStatus === 'not_found' || verificationStatus === 'not_approved' ? (
                    <AlertCircle size={20} />
                  ) : (
                    <X size={20} />
                  )}
                </span>
                <p className="font-medium text-sm">{verificationError}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-full bg-gradient-to-r from-[#484622] to-[#5d5a2f] hover:from-[#5d5a2f] hover:to-[#484622] disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Verify Pass
                </>
              )}
            </button>
          </form>

          {/* Success Result */}
          {verificationStatus === 'verified' && verificationData && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Badge */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 rounded-full p-4 shadow-lg">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="text-green-900 font-bold text-xl">PASS VERIFIED</p>
                    <p className="text-green-700 text-sm">Valid Mess Pass Detected</p>
                  </div>
                </div>
              </div>

              {/* Pass Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-[#484622] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                  Pass Details
                </h3>

                {/* Photo Display */}
                {verificationData.photoUrl && (
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-48 bg-gray-200 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                      <Image
                        src={verificationData.photoUrl}
                        alt={verificationData.studentName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Student Name</p>
                    <p className="text-lg font-bold text-gray-900">{verificationData.studentName}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Registration Number</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{verificationData.registrationNumber}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Issue ID</p>
                    <p className="text-lg font-bold text-gray-900 font-mono tracking-wider">{verificationData.issueId}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Issued Date</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(verificationData.issuedDate)}</p>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm">
                  This student has been verified and has a valid International Mess Pass. They are authorized to access the International Mess facilities.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setInputValue('');
                  setVerificationData(null);
                  setVerificationStatus('idle');
                  setVerificationError('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Verify Another Pass
              </button>
            </div>
          )}

          {/* Invalid Pass Result */}
          {verificationStatus === 'not_found' && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 rounded-full p-4 shadow-lg">
                    <X size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="text-red-900 font-bold text-xl">Invalid Pass</p>
                    <p className="text-red-700 text-sm">Pass number not found</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  This pass number does not exist in the system. Please verify the Issue ID and try again.
                </p>
              </div>

              <button
                onClick={() => {
                  setInputValue('');
                  setVerificationStatus('idle');
                  setVerificationError('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Not Approved Result */}
          {verificationStatus === 'not_approved' && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500 rounded-full p-4 shadow-lg">
                    <AlertCircle size={32} className="text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-900 font-bold text-xl">Pass Not Approved Yet</p>
                    <p className="text-yellow-700 text-sm">Request under review</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4">
                <p className="text-yellow-700 text-sm">
                  This request is still under review by the International Mess Committee. The pass has not been approved yet. Please check back later.
                </p>
              </div>

              <button
                onClick={() => {
                  setInputValue('');
                  setVerificationStatus('idle');
                  setVerificationError('');
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
          <h3 className="text-xl font-bold text-[#484622] font-poppins mb-6">Help & Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="bg-[#484622]/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <SearchIcon size={24} className="text-[#484622]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">How to Use</p>
                <p className="text-gray-600 text-xs">Enter the last few digits of the pass Issue ID. Only numeric values are accepted.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-[#484622]/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-[#484622]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Validity Check</p>
                <p className="text-gray-600 text-xs">A pass is valid only if it has been approved by the committee and is active.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-[#484622]/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-[#484622]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Not Found?</p>
                <p className="text-gray-600 text-xs">If a pass is not found, it may still be under review or the Issue ID may be incorrect.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-[#484622]/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-[#484622]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Support</p>
                <p className="text-gray-600 text-xs">Contact the International Mess Committee for assistance with pass verification.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for icons in help section
function SearchIcon(props: any) {
  return <Search {...props} />;
}
