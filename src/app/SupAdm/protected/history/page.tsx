'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { AlertCircle, X, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface HistoryRecord {
  _id: string;
  adminEmail: string;
  actionType: string;
  actionDetails: string;
  targetId?: string;
  status: string;
  createdAt: string;
}

interface DeletedDocument {
  passNumber?: string;
  studentName?: string;
  registrationNumber?: string;
  messStartDate?: string;
  messEndDate?: string;
  status?: string;
  requestNumber?: string;
  [key: string]: any;
}

export default function AdminHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [adminFilter, setAdminFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [admins, setAdmins] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DeletedDocument | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const limit = 20;

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('superadmin-token');
      const response = await axios.get('/api/superadmin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminEmails = response.data.admins.map((a: any) => a.email);
      setAdmins(adminEmails);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin-token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(adminFilter && { adminEmail: adminFilter }),
        ...(actionTypeFilter && { actionType: actionTypeFilter }),
      });

      const response = await axios.get(`/api/superadmin/admin-history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistory(response.data.history);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [page, adminFilter, actionTypeFilter, limit]);

  useEffect(() => {
    fetchHistory();
    fetchAdmins();
  }, [fetchHistory]);

  const handleDeletedDocumentClick = async (record: HistoryRecord) => {
    if (record.actionType !== 'DELETE_PASS' && record.actionType !== 'DELETE_REQUEST') {
      return;
    }

    try {
      setModalLoading(true);
      const token = localStorage.getItem('superadmin-token');
      const response = await axios.get(`/api/superadmin/deleted-document/${record._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedDocument(response.data.document);
      setShowModal(true);
    } catch (err: any) {
      console.error('Failed to fetch deleted document:', err);
      alert('Failed to load deleted document details: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setModalLoading(false);
    }
  };

  const generatePrintReport = () => {
    const reportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups for printing');
      return;
    }

    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Activity History Report</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #484622;
            padding-bottom: 15px;
          }
          .logo-text {
            color: #484622;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .portal-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .metadata {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 12px;
            color: #555;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          thead {
            background-color: #efeee3;
            border-bottom: 2px solid #484622;
          }
          th {
            color: #484622;
            font-weight: bold;
            padding: 12px;
            text-align: left;
            border-right: 1px solid #ccc;
            font-size: 12px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
            border-right: 1px solid #eee;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f0f0f0;
          }
          .action-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
          }
          .delete { background-color: #fee2e2; color: #dc2626; }
          .revoke { background-color: #fed7aa; color: #ea580c; }
          .approve { background-color: #dcfce7; color: #16a34a; }
          .reject { background-color: #fef3c7; color: #ca8a04; }
          .create { background-color: #dbeafe; color: #0284c7; }
          .update { background-color: #e9d5ff; color: #7c3aed; }
          .other { background-color: #f3f4f6; color: #374151; }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #999;
          }
          @media print {
            body { margin: 0; padding: 10mm; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">SRMAP - Admin Activity History</div>
          <div class="portal-text">International Mess Pass Portal</div>
        </div>
        
        <div class="metadata">
          <span>Report Generated: ${reportDate}</span>
          <span>Total Records: ${history.length}</span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Admin Email</th>
              <th>Action Type</th>
              <th>Details</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            ${
              history.map((record, index) => {
                const sNo = ((page - 1) * limit) + index + 1;
                const dateStr = new Date(record.createdAt).toLocaleString('en-IN');
                const actionClass = record.actionType.includes('DELETE')
                  ? 'delete'
                  : record.actionType.includes('REVOKE')
                  ? 'revoke'
                  : record.actionType.includes('APPROVE')
                  ? 'approve'
                  : record.actionType.includes('REJECT')
                  ? 'reject'
                  : record.actionType.includes('CREATE')
                  ? 'create'
                  : record.actionType.includes('UPDATE')
                  ? 'update'
                  : 'other';

                return `
                  <tr>
                    <td>${sNo}</td>
                    <td>${record.adminEmail}</td>
                    <td><span class="action-badge ${actionClass}">${record.actionType}</span></td>
                    <td>${record.actionDetails}</td>
                    <td>${dateStr}</td>
                  </tr>
                `;
              }).join('')
            }
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is an official report from SRMAP Mess Pass Portal Management System</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const generateExcelReport = async () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel with specific columns only
      const excelData = history.map((record, index) => ({
        'S.No': ((page - 1) * limit) + index + 1,
        'Admin Email': record.adminEmail,
        'Action Type': record.actionType,
        'Details': record.actionDetails,
        'Date & Time': new Date(record.createdAt).toLocaleString('en-IN'),
      }));

      // Add data sheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths for better visibility
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 30 },  // Admin Email
        { wch: 20 },  // Action Type
        { wch: 40 },  // Details
        { wch: 25 },  // Date & Time
      ];
      worksheet['!cols'] = colWidths;

      // Style header row
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '484622' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { bottom: { style: 'thin' } },
        };
      }

      // Add history sheet with formatted data
      XLSX.utils.book_append_sheet(workbook, worksheet, 'History');

      // Add summary sheet
      const summaryData = [
        ['SRMAP Admin Activity History Report', '', ''],
        ['', '', ''],
        ['Report Details', '', ''],
        ['Generated Date', new Date().toLocaleString('en-IN'), ''],
        ['Total Records', history.length, ''],
        ['Portal', 'SRMAP - International Mess Pass Portal', ''],
        ['', '', ''],
        ['Action Summary', 'Count', ''],
        ...Object.entries(
          history.reduce((acc: Record<string, number>, record) => {
            acc[record.actionType] = (acc[record.actionType] || 0) + 1;
            return acc;
          }, {})
        ).map(([action, count]) => [action, count, '']),
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

      // Create workbook with multiple sheets
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Save file
      XLSX.writeFile(workbook, `admin-history-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel report');
    }
  };

  const actionColors: Record<string, { bg: string; text: string }> = {
    DELETE_PASS: { bg: '#fee2e2', text: '#dc2626' },
    DELETE_REQUEST: { bg: '#fee2e2', text: '#dc2626' },
    REVOKE_PASS: { bg: '#fed7aa', text: '#ea580c' },
    APPROVE_REQUEST: { bg: '#dcfce7', text: '#16a34a' },
    REJECT_REQUEST: { bg: '#fef3c7', text: '#ca8a04' },
    CREATE_ADMIN: { bg: '#dbeafe', text: '#0284c7' },
    DELETE_ADMIN: { bg: '#fee2e2', text: '#dc2626' },
    UPDATE_ADMIN: { bg: '#e9d5ff', text: '#7c3aed' },
    OTHER: { bg: '#f3f4f6', text: '#374151' },
  };

  if (loading && history.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#484622' }}>Admin Activity History</h1>
          <p className="text-gray-600 mt-1">Track all administrative actions performed in the system</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-3" size={20} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4" style={{ borderColor: '#484622' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#484622' }}>Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Filter by Admin</label>
            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => e.target.style.borderColor = '#484622'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Admins</option>
              {admins.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Filter by Action Type</label>
            <select
              value={actionTypeFilter}
              onChange={(e) => {
                setActionTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
              onFocus={(e) => e.target.style.borderColor = '#484622'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Actions</option>
              <option value="DELETE_PASS">Delete Pass</option>
              <option value="DELETE_REQUEST">Delete Request</option>
              <option value="REVOKE_PASS">Revoke Pass</option>
              <option value="APPROVE_REQUEST">Approve Request</option>
              <option value="REJECT_REQUEST">Reject Request</option>
              <option value="CREATE_ADMIN">Create Admin</option>
              <option value="DELETE_ADMIN">Delete Admin</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setAdminFilter('');
                setActionTypeFilter('');
                setPage(1);
              }}
              className="w-full text-white py-2 rounded-lg font-semibold transition"
              style={{ backgroundColor: '#6b7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={generatePrintReport}
          disabled={history.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md font-medium transition disabled:opacity-50 text-sm"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
          title="Print Report"
        >
          <Printer size={14} />
          Print
        </button>
        <button
          onClick={generateExcelReport}
          disabled={history.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white rounded-md font-medium transition disabled:opacity-50 text-sm"
          style={{ backgroundColor: '#16a34a' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          title="Download as Excel"
        >
          <Download size={14} />
          Excel
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4" style={{ borderColor: '#484622' }}>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: '#efeee3' }}>
                <tr style={{ borderBottom: '2px solid #484622' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Admin Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Action Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Details</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622' }}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const colors = actionColors[record.actionType] || actionColors.OTHER;
                  const isDeletable = record.actionType === 'DELETE_PASS' || record.actionType === 'DELETE_REQUEST';
                  
                  return (
                    <tr
                      key={record._id}
                      style={{ 
                        borderBottom: '1px solid #d1d5db',
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafaf9',
                        cursor: isDeletable ? 'pointer' : 'default',
                      }}
                      onClick={() => isDeletable && handleDeletedDocumentClick(record)}
                      onMouseEnter={(e) => {
                        if (isDeletable) {
                          e.currentTarget.style.backgroundColor = '#fef3c7';
                        } else {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#efeee3' : '#ddd9cc';
                        }
                      }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafaf9'}
                    >
                      <td className="px-6 py-4 text-gray-800 font-semibold text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                        {((page - 1) * limit) + index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                        {record.adminEmail}
                      </td>
                      <td className="px-6 py-4" style={{ borderRight: '1px solid #d1d5db' }}>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {record.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate text-sm" style={{ borderRight: '1px solid #d1d5db' }} title={record.actionDetails}>
                        {isDeletable ? (
                          <span className="underline font-medium hover:font-bold transition">{record.actionDetails}</span>
                        ) : (
                          record.actionDetails
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {new Date(record.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No activity history found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="px-4 py-2 text-white rounded-lg disabled:opacity-50 transition font-semibold"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700 font-semibold">
          Page <span style={{ color: '#484622' }}>{page}</span>
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={history.length < limit || loading}
          className="px-4 py-2 text-white rounded-lg disabled:opacity-50 transition font-semibold"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
        >
          Next
        </button>
      </div>

      {/* Deleted Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-t-4" style={{ borderColor: '#484622' }}>
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center p-6 border-b" style={{ backgroundColor: '#efeee3', borderColor: '#d1d5db' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#484622' }}>
                Deleted Document Details
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDocument(null);
                }}
                className="p-2 hover:bg-gray-200 rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin"></div>
                </div>
              ) : selectedDocument ? (
                <div className="space-y-4">
                  {/* Document Type Badge */}
                  <div className="mb-6">
                    <span
                      className="inline-block px-4 py-2 rounded-full font-bold text-sm"
                      style={{
                        backgroundColor: selectedDocument.type === 'Pass Document' ? '#dbeafe' : selectedDocument.type === 'Pass Request Document' ? '#dcfce7' : '#f3f4f6',
                        color: selectedDocument.type === 'Pass Document' ? '#0284c7' : selectedDocument.type === 'Pass Request Document' ? '#16a34a' : '#6b7280',
                      }}
                    >
                      {selectedDocument.type || 'Document'}
                    </span>
                  </div>

                  {/* Document Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pass/Request Number */}
                    {(selectedDocument.passNumber || selectedDocument.requestNumber) && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">
                          {selectedDocument.passNumber ? 'Pass Number' : 'Request Number'}
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.passNumber || selectedDocument.requestNumber}
                        </p>
                      </div>
                    )}

                    {/* Student Name */}
                    {selectedDocument.studentName && selectedDocument.studentName !== 'N/A' && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Student Name</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.studentName}
                        </p>
                      </div>
                    )}

                    {/* Registration Number */}
                    {selectedDocument.registrationNumber && selectedDocument.registrationNumber !== 'N/A' && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.registrationNumber}
                        </p>
                      </div>
                    )}

                    {/* Mess Start Date */}
                    {selectedDocument.messStartDate && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Mess Start Date</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.messStartDate}
                        </p>
                      </div>
                    )}

                    {/* Mess End Date */}
                    {selectedDocument.messEndDate && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Mess End Date</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.messEndDate}
                        </p>
                      </div>
                    )}

                    {/* Deleted By */}
                    {selectedDocument.deletedBy && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Deleted By</p>
                        <p className="text-sm font-bold break-words" style={{ color: '#484622', wordBreak: 'break-all' }}>
                          {selectedDocument.deletedBy}
                        </p>
                      </div>
                    )}

                    {/* Deleted At */}
                    {selectedDocument.deletedAt && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 mb-1">Deleted At</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {new Date(selectedDocument.deletedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Full Details Section */}
                  {selectedDocument.fullDetails && (
                    <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#efeee3', borderColor: '#484622' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#484622' }}>Full Details:</p>
                      <p className="text-sm text-gray-700 break-words">{selectedDocument.fullDetails}</p>
                    </div>
                  )}

                  {/* Information (fallback) */}
                  {selectedDocument.information && (
                    <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#efeee3', borderColor: '#484622' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#484622' }}>Information:</p>
                      <p className="text-sm text-gray-700 break-words">{selectedDocument.information}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600">No document details found</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 flex justify-end space-x-3" style={{ borderColor: '#d1d5db' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDocument(null);
                }}
                className="px-6 py-2 rounded-lg font-semibold transition text-white"
                style={{ backgroundColor: '#484622' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3419')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#484622')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
