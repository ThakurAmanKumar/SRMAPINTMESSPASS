'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SuperAdmin {
  _id: string;
  email: string;
  createdAt: string;
}

export default function SuperAdminsPage() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/superadmins', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('superadmin-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch super admins');
      }

      const data = await response.json();
      setSuperAdmins(data.superadmins || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch super admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/superadmin/superadmins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('superadmin-token')}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create super admin');
      }

      setEmail('');
      setPassword('');
      setError('');
      await fetchSuperAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create super admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSuperAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this super admin?')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/superadmins/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('superadmin-token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete super admin');
      }

      await fetchSuperAdmins();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete super admin');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
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
        <title>Super Admin List Report</title>
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
          <div class="logo-text">SRMAP - Super Admin List</div>
          <div class="portal-text">International Mess Pass Portal</div>
        </div>
        
        <div class="metadata">
          <span>Report Generated: ${reportDate}</span>
          <span>Total Super Admins: ${superAdmins.length}</span>
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
              superAdmins.map((admin, index) => {
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
      const excelData = superAdmins.map((admin, index) => ({
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

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Super Admin List');

      // Add summary sheet
      const summaryData = [
        ['SRMAP Super Admin List Report', '', ''],
        ['', '', ''],
        ['Report Details', '', ''],
        ['Generated Date', new Date().toLocaleString('en-IN'), ''],
        ['Total Super Admins', superAdmins.length, ''],
        ['Portal', 'SRMAP - International Mess Pass Portal', ''],
        ['', '', ''],
        ['Super Admin Status Summary', 'Count', ''],
        ['Active', superAdmins.length, ''],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }];

      // Create workbook with multiple sheets
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Save file
      XLSX.writeFile(workbook, `super-admin-list-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel report');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#484622' }}>
          Super Admin Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage Super Admins for the Super Admin Dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Add Super Admin Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4" style={{ borderTopColor: '#484622' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#484622' }}>
          <Plus className="inline mr-2" size={20} />
          Add New Super Admin
        </h2>

        <form onSubmit={handleAddSuperAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
              placeholder="superadmin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2 text-white font-medium rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: submitting ? '#99886a' : '#484622' }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#3a3419';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#484622';
              }}
            >
              {submitting ? 'Adding...' : 'Add Super Admin'}
            </button>
          </div>
        </form>
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={generatePrintReport}
          disabled={superAdmins.length === 0}
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
          disabled={superAdmins.length === 0}
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

      {/* Super Admins Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4" style={{ borderTopColor: '#484622' }}>
        <h2 className="text-lg font-semibold p-6 pb-4" style={{ color: '#484622' }}>
          Super Admins List
        </h2>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading super admins...</p>
          </div>
        ) : superAdmins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No super admins found. Create one using the form above.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ backgroundColor: '#efeee3' }}>
              <tr style={{ borderBottom: '2px solid #484622' }}>
                <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>
                  S.No
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#484622', borderRight: '1px solid #d1d5db' }}>
                  Created Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold" style={{ color: '#484622' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {superAdmins.map((admin, index) => (
                <tr
                  key={admin._id}
                  style={{ borderBottom: '1px solid #d1d5db', backgroundColor: index % 2 === 0 ? 'white' : '#fafaf9' }}
                >
                  <td className="px-6 py-4 text-gray-800 font-semibold text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm" style={{ borderRight: '1px solid #d1d5db' }}>
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteSuperAdmin(admin._id)}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg transition text-white"
                      style={{ backgroundColor: '#dc2626' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    >
                      <Trash2 size={18} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
