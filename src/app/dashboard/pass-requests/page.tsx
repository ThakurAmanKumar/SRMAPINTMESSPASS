'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Search, Check, X, Clock, AlertCircle, Mail, Printer, FileSpreadsheet, Download, Filter, Trash2 } from 'lucide-react';

interface PassRequest {
  _id: string;
  requestNumber: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  photoUrl: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
}

export default function PassRequestsAdminPage() {
  const [requests, setRequests] = useState<PassRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PassRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PassRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const itemsPerPage = 10;
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Handle clicking outside filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilterPanel(false);
      }
    };

    if (showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterPanel]);

  // Fetch pass requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/pass-requests/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data.requests);
        setFilteredRequests(response.data.requests);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = requests;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.fullName.toLowerCase().includes(query) ||
          req.registrationNumber.toLowerCase().includes(query) ||
          req.requestNumber.toLowerCase().includes(query) ||
          req.email.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [searchQuery, requests, statusFilter]);

  const handleApprove = async (request: PassRequest) => {
    setProcessingId(request._id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(
        `/api/pass-requests/admin/${request.requestNumber}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setRequests(
        requests.map((req) =>
          req._id === request._id ? { ...req, status: 'approved' } : req
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (request: PassRequest) => {
    setRejectingId(request._id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    const request = requests.find((r) => r._id === rejectingId);
    if (!request) return;

    setProcessingId(rejectingId);
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `/api/pass-requests/admin/${request.requestNumber}/reject`,
        { rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setRequests(
        requests.map((req) =>
          req._id === rejectingId
            ? { ...req, status: 'rejected', rejectionReason }
            : req
        )
      );

      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject request');
    } finally {
      setProcessingId(null);
      setRejectingId(null);
    }
  };

  const handleExcelExport = async () => {
    try {
      const XLSX = require('xlsx');

      const data = filteredRequests.map((request, idx) => ({
        'S.No': idx + 1,
        'Request': request.requestNumber,
        'Student Name': request.fullName,
        'Reg Number': request.registrationNumber,
        'Email': request.email,
        'Submitted Date': new Date(request.submittedAt).toLocaleDateString('en-IN'),
        'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pass Requests');

      worksheet['!cols'] = [
        { wch: 8 },   // S.No
        { wch: 15 },  // Request #
        { wch: 25 },  // Student Name
        { wch: 18 },  // Reg Number
        { wch: 25 },  // Email
        { wch: 15 },  // Submitted Date
        { wch: 12 },  // Status
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_col(col) + '1';
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '484622' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          };
        }
      }

      const fileName = `SRMAP Pass Requests Report.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  const handlePrintReport = async () => {
    try {
      let logoDataUrl = '';
      try {
        const response = await fetch('/LOGO/dashboardsidebarlogo.png');
        if (response.ok) {
          const blob = await response.blob();
          logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (error) {
        console.log('Logo loading failed, using placeholder');
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SRMAP - Pass Requests Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              font-family: 'Segoe UI', 'Tahoma', sans-serif;
              color: #2c2c2c;
              background: #fff;
              line-height: 1.5;
            }
            body {
              padding: 20px;
            }
            .document {
              max-width: 1200px;
              margin: 0 auto;
              background: #fff;
            }
            .header {
              background: linear-gradient(135deg, #484622 0%, #5a5a2e 100%);
              color: #fff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .header-logo {
              width: 60px;
              height: 60px;
              background: #efeee3;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .header-logo img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .header-content h1 {
              font-size: 24px;
              margin-bottom: 4px;
              font-weight: 700;
            }
            .header-content p {
              font-size: 12px;
              opacity: 0.9;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            thead {
              background: #484622;
              color: white;
            }
            th {
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 700;
              border: 1px solid #ddd;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #ddd;
              font-size: 11px;
            }
            tbody tr:nth-child(odd) {
              background: #f9f9f9;
            }
            tbody tr:hover {
              background: #efeee3;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #484622;
              font-size: 10px;
              color: #666;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
              .document { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              ${logoDataUrl ? `<div class="header-logo"><img src="${logoDataUrl}" alt="Logo"></div>` : ''}
              <div class="header-content">
                <h1>SRMAP International Mess Pass Requests</h1>
                <p>Report Generated on ${new Date().toLocaleString('en-IN')}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Request</th>
                  <th>Student Name</th>
                  <th>Reg Number</th>
                  <th>Email</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRequests.map((request, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${request.requestNumber}</strong></td>
                    <td>${request.fullName}</td>
                    <td>${request.registrationNumber}</td>
                    <td>${request.email}</td>
                    <td>${new Date(request.submittedAt).toLocaleDateString('en-IN')}</td>
                    <td>${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>© 2024 SRM University AP. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err) {
      console.error('Print error:', err);
      alert('Failed to generate print document. Please try again.');
    }
  };

  const handleDownloadPhoto = async (photoUrl: string, fileName: string) => {
    try {
      const response = await fetch(photoUrl);
      if (!response.ok) throw new Error('Failed to download image');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'profile-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleDelete = async (request: PassRequest) => {
    if (!confirm(`Are you sure you want to delete request ${request.requestNumber}?`)) {
      return;
    }

    setProcessingId(request._id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/pass-requests/admin/${request.requestNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state
      setRequests(requests.filter((req) => req._id !== request._id));
      setFilteredRequests(filteredRequests.filter((req) => req._id !== request._id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"><Check size={16} /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold"><X size={16} /> Rejected</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold"><Clock size={16} /> Pending</span>;
    }
  };

  // Pagination calculations
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  const displayStart = totalItems === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, totalItems);

  if (loading) {
    return (
      <ProtectedRoute requiredAdmin>
        <div className="p-4 lg:p-8" style={{ backgroundColor: '#efeee3', minHeight: '100vh' }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Pass Requests</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-lg">Loading...</p>
          </div>
          
          {/* Skeleton Loader for Mobile and Desktop */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 md:p-6 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredAdmin>
      <div className="p-3 md:p-4 lg:p-8" style={{ backgroundColor: '#efeee3', minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Pass Requests</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">Review and manage student pass requests</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg p-3 border-2 border-yellow-400" style={{ backgroundColor: '#fffacd' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#FF9800' }}>Pending</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF9800' }}>
                {requests.filter((r) => r.status === 'pending').length}
              </p>
            </div>
            <div className="rounded-lg p-3 border-2 border-green-400" style={{ backgroundColor: '#f0fff4' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#4CAF50' }}>Approved</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#4CAF50' }}>
                {requests.filter((r) => r.status === 'approved').length}
              </p>
            </div>
            <div className="rounded-lg p-3 border-2 border-red-400" style={{ backgroundColor: '#fff5f5' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#E74C3C' }}>Rejected</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#E74C3C' }}>
                {requests.filter((r) => r.status === 'rejected').length}
              </p>
            </div>
            <div className="rounded-lg p-3 border-2" style={{ backgroundColor: '#efeee3', borderColor: '#484622' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#484622' }}>Total</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#484622' }}>{requests.length}</p>
            </div>
          </div>

          {/* Search and Export Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, registration number, request number, or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
            <div className="flex gap-2 relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition duration-200 whitespace-nowrap hover:opacity-90 relative"
                style={{ backgroundColor: '#2196F3' }}
                title="Click to filter by status"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filter</span>
                {statusFilter !== 'all' && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition duration-200 whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: '#484622' }}
              >
                <Printer size={18} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleExcelExport}
                className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition duration-200 whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: '#4CAF50' }}
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Excel</span>
              </button>

              {/* Filter Panel - Positioned with z-index */}
              {showFilterPanel && (
                <div ref={filterPanelRef} className="fixed top-auto left-auto right-8 mt-2 rounded-lg shadow-2xl p-5 w-72 z-50 border-2" style={{ backgroundColor: '#efeee3', borderColor: '#484622' }}>
                  <div className="mb-4">
                    <p className="text-sm font-bold mb-1" style={{ color: '#484622' }}>Filter by Status</p>
                    <p className="text-xs mb-4" style={{ color: '#666' }}>Currently: <span className="font-semibold" style={{ color: '#484622' }}>{statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span></p>
                    <div className="space-y-2.5">
                      {[
                        { value: 'all', label: 'All Status', color: 'blue' },
                        { value: 'pending', label: 'Pending', color: 'yellow' },
                        { value: 'approved', label: 'Approved', color: 'green' },
                        { value: 'rejected', label: 'Rejected', color: 'red' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition" style={{ backgroundColor: '#fff', color: '#484622' }}>
                          <input
                            type="radio"
                            name="status-filter"
                            value={option.value}
                            checked={statusFilter === option.value}
                            onChange={(e) => {
                              setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected');
                              setShowFilterPanel(false);
                            }}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <span className="text-sm font-medium" style={{ color: '#484622' }}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requests Display - Mobile Cards & Desktop Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
          {filteredRequests.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <p className="text-gray-500 text-sm md:text-lg">No requests found</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View (hidden on md and above) */}
              <div className="md:hidden divide-y divide-gray-200 w-full">
                {paginatedRequests.map((request, index) => (
                  <div key={request._id} className="p-4 hover:bg-gray-50 transition w-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
                        {request.requestNumber}
                      </span>
                      <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student Name</p>
                        <p className="text-sm font-bold text-gray-900">{request.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration</p>
                        <p className="text-sm font-medium text-gray-700">{request.registrationNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                        <a href={`mailto:${request.email}`} className="text-sm text-primary hover:underline">
                          {request.email}
                        </a>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="text-sm text-gray-700">{new Date(request.submittedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request._id}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 disabled:opacity-50 transition"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            disabled={processingId === request._id}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(request)}
                        disabled={processingId === request._id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary to-primary text-white border-b-4 border-primary/30">
                    <tr>
                      <th className="px-4 py-5 text-center text-xs font-bold uppercase tracking-widest w-12 border-r border-white/20">
                        <span className="flex items-center justify-center">S.No</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Request</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Student Name</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Reg No.</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Email</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Submitted</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Status</span>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-widest">
                        <span className="flex items-center justify-center gap-2">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((request, index) => (
                      <tr
                        key={request._id}
                        className={`border-b border-gray-300 hover:bg-primary hover:bg-opacity-5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-5 text-center text-sm font-bold text-gray-800 border-r border-gray-200">{index + 1}</td>
                        <td className="px-6 py-5 border-r border-gray-200">
                          <span className="inline-block bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-full text-sm font-bold border border-primary border-opacity-30">
                            {request.requestNumber}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-gray-900 border-r border-gray-200">{request.fullName}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-700 border-r border-gray-200">{request.registrationNumber}</td>
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium border-r border-gray-200">
                          <a href={`mailto:${request.email}`} className="text-primary hover:underline flex items-center gap-1">
                            <Mail size={14} />
                            {request.email}
                          </a>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium border-r border-gray-200">
                          {new Date(request.submittedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-5 text-sm border-r border-gray-200">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request._id}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-green-600 hover:bg-green-100 hover:text-green-700 disabled:text-gray-400 transition"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleRejectClick(request)}
                                  disabled={processingId === request._id}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 disabled:text-gray-400 transition"
                                  title="Reject"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(request)}
                              disabled={processingId === request._id}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 disabled:text-gray-400 transition"
                              title="Delete Request"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2.5 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
              <div className="bg-gradient-to-r from-[#484622] to-[#5a5830] border-b-4" style={{ borderColor: '#484622' }}>
                <div className="px-8 py-6">
                  <h2 className="text-2xl font-bold text-white">Reject Request</h2>
                  <p className="text-gray-200 text-sm mt-1">Provide a reason for rejecting this pass request</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block font-bold mb-3 uppercase text-sm tracking-wide" style={{ color: '#484622' }}>Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none transition"
                    style={{ borderColor: '#484622', color: '#333' }}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px #efeee3'; e.target.style.borderColor = '#484622'; }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 text-gray-900 font-bold py-3 rounded-lg transition border-2"
                    style={{ backgroundColor: '#efeee3', borderColor: '#484622', color: '#484622' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={processingId === rejectingId}
                    className="flex-1 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                    style={{ backgroundColor: '#c62828' }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
