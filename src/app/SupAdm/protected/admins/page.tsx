'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertCircle, Check, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Admin {
  _id: string;
  email: string;
  createdAt: string;
}

export default function AdminsManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin-token');
      const response = await axios.get('/api/superadmin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.admins);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('superadmin-token');
      await axios.post('/api/superadmin/admins', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Admin added successfully');
      setFormData({ email: '', password: '' });
      setShowAddForm(false);
      await fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${adminEmail}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('superadmin-token');
      await axios.delete(`/api/superadmin/admins?id=${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Admin deleted successfully');
      await fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete admin');
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
        <title>Admin List Report</title>
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
          <div class="logo-text">SRMAP - Admin List Report</div>
          <div class="portal-text">International Mess Pass Portal</div>
        </div>
        
        <div class="metadata">
          <span>Report Generated: ${reportDate}</span>
          <span>Total Admins: ${admins.length}</span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Email</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            ${
              admins.map((admin, index) => {
                const dateStr = new Date(admin.createdAt).toLocaleString('en-IN');
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${admin.email}</td>
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
      
      // Prepare data for Excel with specific columns
      const excelData = admins.map((admin, index) => ({
        'S.No': index + 1,
        'Email': admin.email,
        'Created Date': new Date(admin.createdAt).toLocaleString('en-IN'),
        'Status': 'Active',
      }));

      // Add data sheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths for better visibility
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 30 },  // Email
        { wch: 25 },  // Created Date
        { wch: 12 },  // Status
      ];
      worksheet['!cols'] = colWidths;

      // Style header row like history page
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

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin List');

      // Add summary sheet
      const summaryData = [
        ['SRMAP Admin List Report', '', ''],
        ['', '', ''],
        ['Report Details', '', ''],
        ['Generated Date', new Date().toLocaleString('en-IN'), ''],
        ['Total Admins', admins.length, ''],
        ['Portal', 'SRMAP - International Mess Pass Portal', ''],
        ['', '', ''],
        ['Admin Status Summary', 'Count', ''],
        ['Active', admins.length, ''],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

      // Create workbook with multiple sheets
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Save file
      XLSX.writeFile(workbook, `admin-list-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel report');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#484622' }}>Manage Admins</h1>
          <p className="text-gray-600 mt-1">Total Admins: <span className="font-bold" style={{ color: '#484622' }}>{admins.length}</span></p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition font-semibold"
          style={{ backgroundColor: '#484622' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
        >
          <Plus size={20} />
          <span>Add New Admin</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-3" size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <Check className="mr-3" size={20} />
          {success}
        </div>
      )}

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: '#484622' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#484622' }}>Create New Admin</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="admin@srmap.edu.in"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: '#484622' }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                onFocus={(e) => e.target.style.borderColor = '#484622'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition"
                style={{ backgroundColor: '#10b981' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 text-white py-2 rounded-lg font-semibold transition"
                style={{ backgroundColor: '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Export Buttons */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={generatePrintReport}
          disabled={admins.length === 0}
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
          disabled={admins.length === 0}
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

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border-t-4" style={{ borderColor: '#484622' }}>
        {admins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{ backgroundColor: '#efeee3' }}>
                <tr style={{ borderBottom: '2px solid #484622' }}>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>S.No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>Created Date</th>
                  <th className="px-6 py-4 text-right text-sm font-bold" style={{ color: '#484622' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr
                    key={admin._id}
                    style={{ 
                      borderBottom: '1px solid #d1d5db',
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafaf9'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#efeee3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafaf9'}
                  >
                    <td className="px-6 py-4 text-gray-800 font-semibold text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                      {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                        className="font-semibold flex items-center space-x-1 ml-auto transition px-3 py-1 rounded"
                        style={{ color: '#dc2626' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={18} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No admins found. Click &quot;Add New Admin&quot; to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
