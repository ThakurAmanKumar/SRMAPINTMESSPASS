'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { AlertCircle, X, Download, Printer, Eye, EyeOff, Check } from 'lucide-react';
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
  const [seenRecords, setSeenRecords] = useState<Set<string>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);
  const limit = 8;

  // Load seen records from localStorage on mount
  useEffect(() => {
    const savedSeenRecords = localStorage.getItem('history-seen-records');
    if (savedSeenRecords) {
      try {
        setSeenRecords(new Set(JSON.parse(savedSeenRecords)));
      } catch (err) {
        console.error('Failed to load seen records:', err);
      }
    }
  }, []);

  const fetchAdmins = async () => {
    // Admins will be populated from history data - no separate fetch needed
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
      
      // Extract unique admin emails from history to populate the filter
      const adminEmailsSet = new Set<string>();
      response.data.history.forEach((record: HistoryRecord) => {
        adminEmailsSet.add(record.adminEmail);
      });
      setAdmins(Array.from(adminEmailsSet).sort());
      
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [page, adminFilter, actionTypeFilter, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRecordDetailClick = async (record: HistoryRecord) => {
    const clickableActions = ['DELETE_PASS', 'DELETE_REQUEST', 'APPROVE_REQUEST', 'REJECT_REQUEST'];
    if (!clickableActions.includes(record.actionType)) {
      return;
    }

    try {
      setModalLoading(true);
      const token = localStorage.getItem('superadmin-token');
      
      // For DELETE actions, fetch from deleted-document endpoint
      if (record.actionType === 'DELETE_PASS' || record.actionType === 'DELETE_REQUEST') {
        const response = await axios.get(`/api/superadmin/deleted-document/${record._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedDocument(response.data.document);
      } else if (record.actionType === 'APPROVE_REQUEST' || record.actionType === 'REJECT_REQUEST') {
        // For APPROVE/REJECT, extract ID from actionDetails or targetId
        let docId = record.targetId;
        
        // Fetch the pass request or pass details
        let response;
        try {
          // Try to fetch as pass request first (for APPROVE_REQUEST/REJECT_REQUEST)
          response = await axios.get(`/api/pass-requests/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSelectedDocument({
            type: 'Pass Request Document',
            requestNumber: response.data.requestNumber || response.data._id,
            studentName: response.data.studentName || 'N/A',
            registrationNumber: response.data.registrationNumber || 'N/A',
            messStartDate: response.data.messStartDate || 'N/A',
            messEndDate: response.data.messEndDate || 'N/A',
            status: response.data.status,
            reason: response.data.reason || 'N/A',
            fullDetails: JSON.stringify(response.data, null, 2),
            // Add approval/rejection details
            actionType: record.actionType,
            actionBy: record.adminEmail,
            actionAt: record.createdAt,
            actionDetails: record.actionDetails,
          });
        } catch (innerErr) {
          // If that fails, just show the action details
          setSelectedDocument({
            type: record.actionType === 'APPROVE_REQUEST' ? 'Approved Request' : 'Rejected Request',
            information: record.actionDetails,
            // Add approval/rejection details
            actionType: record.actionType,
            actionBy: record.adminEmail,
            actionAt: record.createdAt,
            actionDetails: record.actionDetails,
          });
        }
      }
      
      setShowModal(true);
    } catch (err: any) {
      console.error('Failed to fetch document details:', err);
      alert('Failed to load details: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setModalLoading(false);
    }
  };

  const toggleSeenStatus = (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    const newSeenRecords = new Set(seenRecords);
    if (newSeenRecords.has(recordId)) {
      newSeenRecords.delete(recordId);
    } else {
      newSeenRecords.add(recordId);
    }
    setSeenRecords(newSeenRecords);
    localStorage.setItem('history-seen-records', JSON.stringify(Array.from(newSeenRecords)));
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 mb-8" style={{ borderColor: '#484622' }}>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: '#efeee3' }}>
                <tr style={{ borderBottom: '2px solid #484622' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>S.NO</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>ADMIN EMAIL</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>ACTION TYPE</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>DETAILS</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>DATE</th>
                  <th className="px-6 py-4 text-right text-sm font-bold" style={{ color: '#484622' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const colors = actionColors[record.actionType] || actionColors.OTHER;
                  const isClickable = ['DELETE_PASS', 'DELETE_REQUEST', 'APPROVE_REQUEST', 'REJECT_REQUEST'].includes(record.actionType);
                  const isSeen = seenRecords.has(record._id);
                  
                  return (
                    <tr
                      key={record._id}
                      style={{ 
                        borderBottom: '1px solid #d1d5db',
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafaf9',
                        cursor: isClickable ? 'pointer' : 'default',
                      }}
                      onClick={() => isClickable && handleRecordDetailClick(record)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#efeee3'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafaf9'}
                    >
                      <td className="px-6 py-4 text-gray-800 font-semibold text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                        {((page - 1) * limit) + index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-sm max-w-xs truncate" title={record.adminEmail} style={{ borderRight: '1px solid #d1d5db' }}>
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
                      <td className="px-6 py-4 text-gray-700 text-sm max-w-md truncate" title={record.actionDetails} style={{ borderRight: '1px solid #d1d5db' }}>
                        {isClickable ? (
                          <span className="underline font-medium cursor-pointer hover:font-bold">{record.actionDetails}</span>
                        ) : (
                          record.actionDetails
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap" style={{ borderRight: '1px solid #d1d5db' }}>
                        {new Date(record.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => toggleSeenStatus(e, record._id)}
                          className="font-medium flex items-center space-x-1 transition px-2 py-1 rounded ml-auto text-sm"
                          style={{ color: isSeen ? '#16a34a' : '#dc2626' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSeen ? '#dcfce7' : '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title={isSeen ? 'Click to mark as unseen' : 'Click to mark as seen'}
                        >
                          {isSeen ? (
                            <>
                              <Check size={14} />
                              <span>Seen</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>Not Seen</span>
                            </>
                          )}
                        </button>
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
                {selectedDocument?.type === 'Pass Document' || selectedDocument?.type === 'Deleted Pass'
                  ? 'Pass Details'
                  : selectedDocument?.type === 'Pass Request Document' || selectedDocument?.type === 'Deleted Request'
                  ? 'Request Details'
                  : 'Document Details'}
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
                  <div className="space-y-3">
                    {/* Pass/Request Number */}
                    {(selectedDocument.passNumber || selectedDocument.requestNumber) && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">
                          {selectedDocument.passNumber ? 'Pass Number' : 'Request Number'}
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.passNumber || selectedDocument.requestNumber}
                        </p>
                      </div>
                    )}

                    {/* Student Name */}
                    {selectedDocument.studentName && selectedDocument.studentName !== 'N/A' && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">Student Name</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.studentName}
                        </p>
                      </div>
                    )}

                    {/* Registration Number */}
                    {selectedDocument.registrationNumber && selectedDocument.registrationNumber !== 'N/A' && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">Registration Number</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.registrationNumber}
                        </p>
                      </div>
                    )}

                    {/* Mess Start Date */}
                    {selectedDocument.messStartDate && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">Mess Start Date</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.messStartDate}
                        </p>
                      </div>
                    )}

                    {/* Mess End Date */}
                    {selectedDocument.messEndDate && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">Mess End Date</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.messEndDate}
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    {selectedDocument.status && (
                      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                        <p className="text-sm text-gray-600 font-semibold">Status</p>
                        <p className="text-lg font-bold" style={{ color: '#484622' }}>
                          {selectedDocument.status}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Deletion Details Section */}
                  {selectedDocument.deletedBy && (selectedDocument.deletedBy || selectedDocument.deletedAt) && (
                    <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fee2e2', borderColor: '#dc2626' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
                            Deleted By
                          </p>
                          <p className="text-lg font-bold break-words mt-1" style={{ color: '#484622', wordBreak: 'break-all' }}>
                            {selectedDocument.deletedBy || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
                            Deletion Date
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#484622' }}>
                            {selectedDocument.deletedAt ? new Date(selectedDocument.deletedAt).toLocaleString('en-IN') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
                            Status
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#484622' }}>
                            Deleted
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approval/Rejection Details Section */}
                  {selectedDocument.actionType && (selectedDocument.actionType === 'APPROVE_REQUEST' || selectedDocument.actionType === 'REJECT_REQUEST') && (
                    <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#dcfce7' : '#fef3c7', borderColor: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#16a34a' : '#ca8a04' }}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#16a34a' : '#ca8a04' }}>
                            {selectedDocument.actionType === 'APPROVE_REQUEST' ? 'Approved By' : 'Rejected By'}
                          </p>
                          <p className="text-lg font-bold break-words mt-1" style={{ color: '#484622', wordBreak: 'break-all' }}>
                            {selectedDocument.actionBy || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#16a34a' : '#ca8a04' }}>
                            {selectedDocument.actionType === 'APPROVE_REQUEST' ? 'Approval Date' : 'Rejection Date'}
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#484622' }}>
                            {selectedDocument.actionAt ? new Date(selectedDocument.actionAt).toLocaleString('en-IN') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#16a34a' : '#ca8a04' }}>
                            Status
                          </p>
                          <p className="text-lg font-bold mt-1" style={{ color: '#484622' }}>
                            {selectedDocument.actionType === 'APPROVE_REQUEST' ? 'Approved' : 'Rejected'}
                          </p>
                        </div>
                      </div>
                      {selectedDocument.actionDetails && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: selectedDocument.actionType === 'APPROVE_REQUEST' ? 'rgba(22, 163, 74, 0.3)' : 'rgba(202, 138, 4, 0.3)' }}>
                          <p className="text-sm font-semibold mb-2" style={{ color: selectedDocument.actionType === 'APPROVE_REQUEST' ? '#16a34a' : '#ca8a04' }}>Details</p>
                          <p className="text-sm text-gray-700 break-words">{selectedDocument.actionDetails}</p>
                        </div>
                      )}
                    </div>
                  )}

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
