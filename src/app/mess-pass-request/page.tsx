'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Upload, Check, X, Search, AlertCircle, CheckCircle, Clock, Zap, Mail, Phone, MapPin, ChevronRight, FileText, Shield, Activity } from 'lucide-react';

export default function MessPassRequestPage() {
  // Form submission section
  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    email: '',
    reason: '',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Status check section
  const [checkRequestNumber, setCheckRequestNumber] = useState('');
  const [statusData, setStatusData] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmissionError('Photo size must be less than 5MB');
      return;
    }

    setFormData({ ...formData, photo: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError('');
    setSubmissionSuccess(null);

    if (!formData.fullName || !formData.registrationNumber || !formData.email || !formData.reason || !formData.photo) {
      setSubmissionError('Please fill all fields and upload a photo');
      return;
    }

    setLoadingSubmit(true);

    try {
      // Convert photo to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const photoUrl = reader.result as string;

          const response = await axios.post('/api/pass-requests', {
            fullName: formData.fullName,
            registrationNumber: formData.registrationNumber,
            email: formData.email,
            photoUrl,
            reason: formData.reason,
          });

          setSubmissionSuccess(response.data.requestNumber);

          // Reset form
          setFormData({
            fullName: '',
            registrationNumber: '',
            email: '',
            reason: '',
            photo: null,
          });
          setPhotoPreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err: any) {
          setSubmissionError(err.response?.data?.error || 'Failed to submit request');
        } finally {
          setLoadingSubmit(false);
        }
      };
      reader.readAsDataURL(formData.photo);
    } catch (error: any) {
      setSubmissionError('Failed to process photo');
      setLoadingSubmit(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    setStatusData(null);

    if (!checkRequestNumber.trim()) {
      setStatusError('Please enter a request number');
      return;
    }

    setStatusLoading(true);

    try {
      const response = await axios.get(`/api/pass-requests/${checkRequestNumber.trim()}`);
      setStatusData(response.data);
    } catch (err: any) {
      setStatusError(err.response?.data?.error || 'Request not found');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'rejected':
        return <X size={24} className="text-red-600" />;
      case 'pending':
        return <Clock size={24} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!mounted) return null;

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
            International Mess Pass
          </h1>
          <p className="text-xl text-white/90 mb-8 font-inter max-w-2xl mx-auto">
            Submit your request and track status in real-time. Get access to international dining facilities within 24-48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#submit" className="inline-flex items-center gap-2 bg-white text-[#484622] hover:bg-white/90 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Upload size={20} />
              Submit Request
            </a>
            <a href="#status" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 border border-white/30">
              <Search size={20} />
              Check Status
            </a>
            <a href="/VerifyPass" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 border border-white/30">
              <Shield size={20} />
              Verify Pass
            </a>
          </div>
          
          {/* Decorative Line */}
          <div className="mt-10 flex justify-center items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-32"></div>
            <div className="w-2 h-2 bg-white/60 rotate-45"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#484622] font-poppins mb-4">
            Get Your Pass Today
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose to submit a new request or check the status of your existing application
          </p>
        </div>

        {/* Important Information Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#484622] text-white p-3 rounded-xl">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#484622] font-poppins">
                Important Information
              </h2>
              <p className="text-gray-500 text-sm">Please read before submitting your request</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-[#484622]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#484622] group-hover:text-white transition-colors">
                <FileText size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Required Documents</h3>
              <p className="text-gray-600 text-sm">Recent passport-size photograph is mandatory for your pass</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-[#484622]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#484622] group-hover:text-white transition-colors">
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Time</h3>
              <p className="text-gray-600 text-sm">Your request will be processed within 24-48 business hours</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-[#484622]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#484622] group-hover:text-white transition-colors">
                <Mail size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-gray-600 text-sm">Once approved, you will receive confirmation and pass details via email</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-[#484622]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#484622] group-hover:text-white transition-colors">
                <Phone size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Query Support</h3>
              <p className="text-gray-600 text-sm">Contact the International Mess Committee for additional queries or support</p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#484622] font-poppins mb-4">
            Submit Your Request
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose to submit a new request or check the status of your existing application
          </p>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Submission Form */}
          <div id="submit" className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 border-[#484622] ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#484622] text-white p-2.5 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#484622] font-poppins">
                  Submit Request
                </h2>
                <p className="text-gray-500 text-xs">Fill in your details below</p>
              </div>
            </div>

            {submissionSuccess ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-500 rounded-full p-5 shadow-lg">
                    <CheckCircle size={56} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-3 font-poppins">Request Submitted Successfully!</h3>
                <p className="text-green-700 mb-2">Your pass request has been submitted successfully</p>
                <div className="bg-white border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2 justify-center">
                  <Mail size={16} className="text-green-600 flex-shrink-0" />
                  <p className="text-green-700 text-sm"><strong>Committee notified!</strong> The committee will review your request shortly.</p>
                </div>
                <div className="bg-white border-2 border-green-400 rounded-xl p-4 mb-6 shadow-md">
                  <p className="text-gray-600 text-xs mb-2">Your Request Number</p>
                  <p className="text-2xl font-bold text-green-600 font-mono tracking-wider">{submissionSuccess}</p>
                </div>
                <div className="bg-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-900 text-sm font-semibold flex items-center justify-center gap-2">
                    <Check size={18} />
                    Take a screenshot of this for your records.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setCheckRequestNumber(submissionSuccess);
                    document.getElementById('status')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <Search size={20} />
                  Track Status
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submissionError && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm animate-shake">
                    <X className="flex-shrink-0 mt-0.5 text-red-600" size={20} />
                    <span className="font-medium">{submissionError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white text-gray-800 text-sm"
                  />
                </div>

                {/* Registration Number */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g., AP2311001168008"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white text-gray-800 font-mono text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@srmap.edu.in"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white text-gray-800 text-sm"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                    Reason for Request <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Explain why you need access to the international mess..."
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white text-gray-800 resize-none text-sm"
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                    Profile Photo <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#484622]/30 rounded-lg p-4 text-center cursor-pointer hover:border-[#484622] hover:bg-[#efeee3]/50 transition-all duration-300 bg-gradient-to-b from-gray-50 to-white group"
                  >
                    {photoPreview ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg shadow-md ring-2 ring-[#484622]/10"
                        />
                        <button
                          type="button"
                          aria-label="Remove photo"
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition shadow-md transform hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoPreview('');
                            setFormData({ ...formData, photo: null });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="py-3">
                        <div className="bg-[#484622]/10 rounded-lg w-14 h-14 flex items-center justify-center mx-auto mb-2.5 group-hover:bg-[#484622]/20 transition-colors">
                          <Upload size={24} className="text-[#484622]" />
                        </div>
                        <p className="text-gray-800 font-semibold mb-0.5 text-xs">Click to upload photo</p>
                        <p className="text-gray-500 text-xs text-opacity-80 text-[0.65rem]">PNG, JPG (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="photo-upload"
                      aria-label="Upload profile photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="w-full bg-gradient-to-r from-[#484622] to-[#5d5a2f] hover:from-[#5d5a2f] hover:to-[#484622] disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  {loadingSubmit ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Status Check */}
          <div id="status" className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 border-[#484622] ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#484622] text-white p-2.5 rounded-xl">
                <Search size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#484622] font-poppins">
                  Check Status
                </h2>
                <p className="text-gray-500 text-xs">Enter your request number below</p>
              </div>
            </div>

            <form onSubmit={handleCheckStatus} className="space-y-5">
              {statusError && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 font-medium">{statusError}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#484622] rounded-full"></span>
                  Request Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={checkRequestNumber}
                  onChange={(e) => setCheckRequestNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., REQSRMAPIMP1"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#484622]/30 focus:border-[#484622] transition-all bg-gray-50 focus:bg-white font-mono text-base tracking-wide text-gray-800"
                />
                <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Enter the request number from your submission confirmation
                </p>
              </div>

              <button
                type="submit"
                disabled={statusLoading}
                className="w-full bg-gradient-to-r from-[#484622] to-[#5d5a2f] hover:from-[#5d5a2f] hover:to-[#484622] disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                {statusLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Check Status
                  </>
                )}
              </button>
            </form>

            {statusData && (
              <div className={`mt-8 border-t-4 rounded-2xl p-8 shadow-lg animate-fade-in ${getStatusColor(statusData.status)}`}>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b-2 border-current border-opacity-20">
                  <div className="bg-white rounded-2xl p-4 shadow-md">
                    {getStatusIcon(statusData.status)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold capitalize font-poppins text-gray-900">
                      {statusData.status === 'approved' ? 'Approved' : statusData.status === 'rejected' ? 'Rejected' : 'Under Review'}
                    </h3>
                    <p className="text-gray-500 text-sm">Request Status</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Request Number</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{statusData.requestNumber}</p>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{statusData.fullName}</p>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4 sm:col-span-2">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900 break-all">{statusData.email}</p>
                  </div>

                  <div className="bg-white/60 rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Submitted Date</p>
                    <p className="text-lg font-semibold text-gray-900">{new Date(statusData.submittedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                {statusData.status === 'approved' && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-500 rounded-full p-2 text-white flex-shrink-0">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <p className="text-green-900 font-bold text-lg mb-2">Your Pass Request Approved!</p>
                          <p className="text-green-800 text-sm">
                            Your pass will be sent to <span className="font-bold">{statusData.email}</span> within 24 hours. Check your email for further instructions.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {statusData.issueId ? (
                      <a
                        href={`/api/passes/${statusData.issueId}/download#noprint`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base"
                      >
                        <FileText size={20} />
                        Download Pass (JPG)
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 w-full justify-center bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg text-base opacity-50 cursor-not-allowed"
                      >
                        <FileText size={20} />
                        Pass Not Yet Generated
                      </button>
                    )}
                  </div>
                )}

                {statusData.status === 'rejected' && (
                  <div className="bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500 rounded-xl p-6 mt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-500 rounded-full p-2 text-white flex-shrink-0">
                        <X size={20} />
                      </div>
                      <div>
                        <p className="text-red-900 font-bold text-lg mb-2">Request Rejected</p>
                        <p className="text-red-800 text-sm">
                          <span className="font-semibold">Reason:</span> {statusData.rejectionReason || 'You can contact the admin for more details'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {statusData.status === 'pending' && (
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-500 rounded-xl p-6 mt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 rounded-full p-2 text-white flex-shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-blue-900 font-bold text-lg mb-2">Request Under Review</p>
                        <p className="text-blue-800 text-sm">
                          We are currently reviewing your request. This typically takes 24-48 hours. Please check back later for updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Footer Section */}
      <div className="bg-gradient-to-r from-[#484622] to-[#5d5a2f] text-white overflow-hidden relative w-full">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-poppins mb-1">Need Help?</h2>
            <p className="text-white/80 max-w-2xl mx-auto text-xs">Contact us for any questions or assistance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail size={18} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Email</h3>
              <p className="text-white/90 text-xs break-all">international.mc@srmap.edu.in</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone size={18} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Phone</h3>
              <p className="text-white/90 text-xs">+91-7042190865</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin size={18} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">Location</h3>
              <p className="text-white/90 text-xs">SRM University AP, Amaravati</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 text-center">
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} SRMAP International Mess Committee. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
