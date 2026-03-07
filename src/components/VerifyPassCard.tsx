import React from 'react';
import Image from 'next/image';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface VerifyPassCardProps {
  status: 'verified' | 'not_found' | 'not_approved' | 'error';
  studentName?: string;
  registrationNumber?: string;
  issueId?: string;
  issuedDate?: string;
  photoUrl?: string;
  errorMessage?: string;
}

export function VerifyPassCard({
  status,
  studentName,
  registrationNumber,
  issueId,
  issuedDate,
  photoUrl,
  errorMessage,
}: VerifyPassCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Verified Pass
  if (status === 'verified') {
    return (
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
          {photoUrl && (
            <div className="flex justify-center mb-6">
              <div className="relative w-40 h-48 bg-gray-200 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                <Image
                  src={photoUrl}
                  alt={studentName || 'Student Photo'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                Student Name
              </p>
              <p className="text-lg font-bold text-gray-900">{studentName}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                Registration Number
              </p>
              <p className="text-lg font-bold text-gray-900 font-mono">
                {registrationNumber}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                Issue ID
              </p>
              <p className="text-lg font-bold text-gray-900 font-mono tracking-wider">
                {issueId}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                Issued Date
              </p>
              <p className="text-lg font-bold text-gray-900">
                {issuedDate ? formatDate(issuedDate) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm">
            This student has been verified and has a valid International Mess Pass. They are
            authorized to access the International Mess facilities.
          </p>
        </div>
      </div>
    );
  }

  // Invalid Pass
  if (status === 'not_found') {
    return (
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
            {errorMessage || 'This pass number does not exist in the system. Please verify the Issue ID and try again.'}
          </p>
        </div>
      </div>
    );
  }

  // Not Approved
  if (status === 'not_approved') {
    return (
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
            {errorMessage ||
              'This request is still under review by the International Mess Committee. The pass has not been approved yet. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 rounded-full p-4 shadow-lg">
              <X size={32} className="text-white" />
            </div>
            <div>
              <p className="text-red-900 font-bold text-xl">Error</p>
              <p className="text-red-700 text-sm">Verification failed</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
          <p className="text-red-700 text-sm">
            {errorMessage || 'Failed to verify pass. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
