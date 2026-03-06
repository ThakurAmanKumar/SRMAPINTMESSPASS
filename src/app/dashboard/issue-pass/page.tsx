'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { PassCard } from '@/components/PassCard';
import { Upload, Check, X, Download } from 'lucide-react';

interface IssuedPass {
  _id: string;
  issueId: string;
  fullName: string;
  regNumber: string;
  photoUrl: string;
  issuedDate: string;
}

export default function IssuePassPage() {
  const passCardRef = useRef<HTMLDivElement>(null);
  const [downloadingPass, setDownloadingPass] = useState(false);
  
  const handleDownloadJPG = async () => {
    if (!passCardRef.current) return;
    
    try {
      setDownloadingPass(true);
      const canvas = await html2canvas(passCardRef.current, {
        backgroundColor: '#efeee3',
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `SRMAP-Pass-${issuedPass?.issueId || 'preview'}.jpg`;
      link.click();
    } catch (error) {
      console.error('Error downloading JPG:', error);
      alert('Failed to download JPG');
    } finally {
      setDownloadingPass(false);
    }
  };
  
  const [formData, setFormData] = useState({
    fullName: 'Aman Kumar Thakur',
    regNumber: 'AP2311001168008',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [issuedPass, setIssuedPass] = useState<IssuedPass | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, photo: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhotoToCloudinary = async (file: File): Promise<string> => {
    try {
      setUploadingPhoto(true);
      
      // Convert file to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.regNumber || !formData.photo) {
      setError('Please fill all fields and upload a photo');
      return;
    }

    setLoading(true);

    try {
      // Upload photo to Cloudinary
      const photoUrl = await uploadPhotoToCloudinary(formData.photo);

      // Send pass data to API
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/passes',
        {
          fullName: formData.fullName,
          regNumber: formData.regNumber,
          photoUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIssuedPass(response.data.pass);

      // Reset form
      setFormData({
        fullName: '',
        regNumber: '',
        photo: null,
      });
      setPhotoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to issue pass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 xl:p-8 min-h-screen" style={{ backgroundColor: '#efeee3' }}>
      {/* Header */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Issue New Pass</h1>
        <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Create a new international mess access pass</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start">
                <X className="mr-2 flex-shrink-0 mt-0.5" size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Photo
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-input"
                />
                <label
                  htmlFor="photo-input"
                  className="block border-2 border-dashed border-primary rounded-lg p-6 text-center cursor-pointer hover:bg-yellow-50 transition"
                >
                  {photoPreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded mb-2"
                      />
                      <span className="text-sm text-primary font-medium">Click to change photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mx-auto mb-2 text-primary" size={32} />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter student full name"
                required
              />
            </div>

            {/* Registration Number */}
            <div>
              <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                id="regNumber"
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter registration number"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="w-full bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {loading || uploadingPhoto ? 'Processing...' : 'Issue Pass'}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div>
          {issuedPass ? (
            <div className="space-y-6">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-start">
                <Check className="mr-2 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold">Pass Issued Successfully!</p>
                  <p className="text-sm">Issue ID: {issuedPass.issueId}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pass Preview</h3>
                <div ref={passCardRef}>
                  <PassCard
                    issueId={issuedPass.issueId}
                    fullName={issuedPass.fullName}
                    regNumber={issuedPass.regNumber}
                    photoUrl={issuedPass.photoUrl}
                    issuedDate={issuedPass.issuedDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadJPG}
                  disabled={downloadingPass}
                  className="bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} className="mr-2" />
                  {downloadingPass ? 'Generating...' : 'Download JPG'}
                </button>
                <button
                  onClick={() => setIssuedPass(null)}
                  className="bg-primary hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Issue Another Pass
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-96 text-center">
              <div>
                <p className="text-gray-600 text-lg">Pass preview will appear here</p>
                <p className="text-gray-400 text-sm mt-2">Fill the form and submit to see the pass card</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
