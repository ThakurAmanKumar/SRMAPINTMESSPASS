'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Download, Trash2, Eye, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { PassCard } from '@/components/PassCard';
import html2canvas from 'html2canvas';

interface Pass {
  _id: string;
  issueId: string;
  fullName: string;
  regNumber: string;
  photoUrl: string;
  issuedDate: string;
  authorizationText?: string;
}

export default function IssuedPassesPage() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [filteredPasses, setFilteredPasses] = useState<Pass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch passes
  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/passes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPasses(response.data.passes);
        setFilteredPasses(response.data.passes);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch passes');
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPasses(passes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = passes.filter(
      pass =>
        pass.fullName.toLowerCase().includes(query) ||
        pass.regNumber.toLowerCase().includes(query) ||
        pass.issueId.toLowerCase().includes(query)
    );
    setFilteredPasses(filtered);
  }, [searchQuery, passes]);

  // Handle JPG download
  const handleDownloadJPG = async (pass: Pass) => {
    try {
      // Create a div to hold the pass card
      const element = document.createElement('div');
      element.style.padding = '0';
      element.style.margin = '0';
      element.style.background = 'transparent';
      element.innerHTML = `
        <div style="width: 360px; border: 4px solid #484622; border-radius: 16px; overflow: hidden; background: #efeee3; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);">
          
          <!-- HEADER SECTION -->
          <div style="background: #484622; padding: 20px 16px; text-align: center;">
            <div style="margin-bottom: 12px; display: flex; justify-content: center;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(239, 238, 227, 0.6); display: flex; align-items: center; justify-content: center;">
                <img src="https://raw.githubusercontent.com/ThakurAmanKumar/webIMG/refs/heads/main/img%20for%20site/SRM_University%2C_Andhra_Pradesh_logo.png" alt="Logo" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
            </div>
            <div style="color: #efeee3; font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 6px;">SRM UNIVERSITY AP</div>
            <div style="color: #efeee3; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; line-height: 1.4;">INTERNATIONAL MESS ACCESS PASS</div>
          </div>

          <!-- PHOTO SECTION -->
          <div style="padding: 20px 16px; text-align: center; background: #efeee3;">
            <div style="width: 110px; height: 130px; margin: 0 auto; border: 3px solid #484622; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(72, 70, 34, 0.15);">
              <img src="${pass.photoUrl}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </div>

          <!-- STUDENT INFORMATION SECTION -->
          <div style="padding: 6px 16px 12px 16px; text-align: center; background: #efeee3;">
            <div style="margin-bottom: 12px;">
              <div style="font-size: 8px; font-weight: 700; color: #484622; letter-spacing: 1.2px; margin-bottom: 4px; text-transform: uppercase;">Student Name</div>
              <div style="font-size: 14px; font-weight: 700; color: #1a1a1a; line-height: 1.4; letter-spacing: 0.3px;">${pass.fullName}</div>
            </div>
            <div>
              <div style="font-size: 8px; font-weight: 700; color: #484622; letter-spacing: 1.2px; margin-bottom: 4px; text-transform: uppercase;">Registration Number</div>
              <div style="font-size: 10px; font-weight: 600; color: #1a1a1a; letter-spacing: 0.5px; line-height: 1.5;">${pass.regNumber}</div>
            </div>
          </div>

          <!-- AUTHORIZATION BLOCK -->
          <div style="margin: 2px 12px 12px 12px; padding: 14px 12px; border: 2px solid #484622; border-radius: 8px; background: #efeee3; box-shadow: 0 2px 8px rgba(72, 70, 34, 0.1);">
            <div style="font-size: 11px; font-weight: 700; color: #484622; letter-spacing: 0.8px; margin-bottom: 10px; text-align: center; font-family: Georgia, 'Times New Roman', serif; text-transform: uppercase;">✦ Authorization ✦</div>
            <div style="font-size: 8.5px; line-height: 1.7; color: #333333; text-align: justify; font-weight: 400; letter-spacing: 0.1px;">As per verification by the <span style="font-weight: 700;">International Mess Committee, SRM University-AP</span>, the bearer of this pass is authorized to access and use the services of the International Mess.</div>
          </div>

          <!-- CONTACT SECTION -->
          <div style="padding: 8px 16px; background: #efeee3; text-align: center; border-top: 1px solid #484622;">
            <div style="font-size: 6px; font-weight: 700; color: #484622; letter-spacing: 0.6px; margin-bottom: 3px; text-transform: uppercase;">Contact</div>
            <div style="font-size: 7.5px; font-weight: 700; color: #484622; letter-spacing: 0.2px; margin-bottom: 2px; line-height: 1.2;">International Mess Committee</div>
            <div style="font-size: 6.5px; font-weight: 600; color: #484622; letter-spacing: 0.1px; line-height: 1.3;"><span style="font-weight: 700;">E-mail :</span> international.mc@srmap.edu.in</div>
          </div>

          <!-- FOOTER SECTION -->
          <div style="padding: 12px 16px; background: #484622; border-top: 2px solid #484622; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="flex: 1; text-align: center;">
              <div style="font-size: 8px; font-weight: 700; color: #efeee3; letter-spacing: 0.6px; margin-bottom: 2px; text-transform: uppercase;">Issue ID</div>
              <div style="font-size: 12px; font-weight: 700; color: #efeee3;">${pass.issueId}</div>
            </div>
            <div style="width: 1px; height: 28px; background: #efeee3; opacity: 0.4;"></div>
            <div style="flex: 1; text-align: center;">
              <div style="font-size: 8px; font-weight: 700; color: #efeee3; letter-spacing: 0.6px; margin-bottom: 2px; text-transform: uppercase;">Issued Date</div>
              <div style="font-size: 11px; font-weight: 600; color: #efeee3;">${new Date(pass.issuedDate).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(element);

      const canvas = await html2canvas(element, { 
        scale: 1.5,
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        onclone: (doc) => {
          doc.querySelectorAll('*').forEach(el => {
            const htmlEl = el as HTMLElement;
            (htmlEl.style as any).fontSmoothing = 'antialiased';
            (htmlEl.style as any).WebkitFontSmoothing = 'antialiased';
            htmlEl.style.textRendering = 'geometricPrecision';
          });
        }
      });
      document.body.removeChild(element);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.download = `${pass.issueId}_Pass.jpg`;
      link.click();
    } catch (err) {
      console.error('JPG generation failed:', err);
      alert('Failed to generate JPG');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pass?')) {
      return;
    }

    setDeleting(id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/passes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPasses(passes.filter(pass => pass._id !== id));
      if (selectedPass?._id === id) {
        setSelectedPass(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete pass');
    } finally {
      setDeleting(null);
    }
  };

  // Handle Print Report
  const handlePrintReport = async () => {
    const printWindow = window.open('', '', 'width=1100,height=750');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');
    
    // Load logo image as base64
    let logoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
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
        <title>SRMAP - Mess Pass Report</title>
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
            padding: 8px;
          }
          
          .document {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
          }
          
          /* SECTION: Header */
          .header {
            background: linear-gradient(135deg, #484622 0%, #5a5a2e 100%);
            color: #fff;
            padding: 12px 18px;
            border-radius: 6px 6px 0 0;
            border-bottom: 3px solid #efeee3;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
          }
          
          .header-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
          }
          
          .logo-circle {
            width: 50px;
            height: 50px;
            background: #fff;
            border-radius: 50%;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #efeee3;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            flex-shrink: 0;
          }
          
          .logo-circle img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
          }
          
          .brand-text h1 {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 2px;
            letter-spacing: 0.5px;
          }
          
          .brand-text p {
            font-size: 9px;
            color: #e8e8d0;
            margin: 0;
            line-height: 1.2;
          }
          
          .header-right {
            text-align: right;
            min-width: 100px;
          }
          
          .header-right .label {
            font-size: 7px;
            font-weight: 600;
            color: #efeee3;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 2px;
          }
          
          .header-right .value {
            font-size: 10px;
            font-weight: 600;
          }
          
          /* SECTION: Title & Info Bar */
          .info-banner {
            background: linear-gradient(to right, #fafafa, #f5f5f5);
            padding: 10px 18px;
            border-bottom: 1.5px solid #e0e0e0;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
            align-items: center;
          }
          
          .info-item {
            text-align: center;
            padding: 0 6px;
            border-right: 1px solid #ddd;
          }
          
          .info-item:last-child {
            border-right: none;
          }
          
          .info-label {
            font-size: 7px;
            font-weight: 700;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 3px;
          }
          
          .info-value {
            font-size: 12px;
            font-weight: 700;
            color: #484622;
          }
          
          /* SECTION: Main Content */
          .content {
            padding: 12px 18px;
            background: #fff;
          }
          
          .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #fff;
            background: linear-gradient(135deg, #484622 0%, #5a5a2e 100%);
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            background: #fff;
            border: 1.5px solid #484622;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          }
          
          thead tr {
            background: linear-gradient(135deg, #484622 0%, #5a5a2e 100%);
            color: #fff;
            border-bottom: 2px solid #3a3a1a;
          }
          
          th {
            padding: 8px 8px;
            text-align: left;
            font-weight: 700;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            border-right: 1px solid rgba(255,255,255,0.15);
            vertical-align: middle;
          }
          
          th:last-child {
            border-right: none;
          }
          
          td {
            padding: 7px 8px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 9px;
            vertical-align: middle;
          }
          
          tbody tr {
            background: #fff;
            transition: background-color 0.2s;
          }
          
          tbody tr:nth-child(odd) {
            background: #fafafa;
          }
          
          tbody tr:last-child td {
            border-bottom: 1.5px solid #484622;
          }
          
          .col-sno {
            width: 32px;
            text-align: center;
            font-weight: 700;
            color: #484622;
            background: #f5f5f5;
          }
          
          .col-photo {
            width: 45px;
            text-align: center;
          }
          
          .col-photo img {
            width: 28px;
            height: 28px;
            object-fit: cover;
            border-radius: 3px;
            border: 1px solid #ddd;
            display: inline-block;
          }
          
          .col-issueid {
            font-weight: 700;
            font-size: 8px;
            color: #fff;
            background: #484622;
            padding: 3px 8px;
            border-radius: 2px;
            display: inline-block;
            letter-spacing: 0.3px;
          }
          
          .col-name {
            font-weight: 700;
            color: #222;
            font-size: 9px;
          }
          
          /* SECTION: Footer */
          .footer-section {
            background: linear-gradient(to right, #f9f9f9, #f5f5f5);
            padding: 10px 18px;
            border-top: 1.5px solid #e0e0e0;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }
          
          .footer-block {
            text-align: center;
            padding-top: 8px;
            border-top: 1px solid #ddd;
          }
          
          .footer-block h4 {
            font-size: 8px;
            font-weight: 700;
            color: #484622;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 6px;
          }
          
          .signature-line {
            border-top: 1.5px solid #333;
            margin: 12px 0 4px 0;
            padding-top: 4px;
            font-size: 7px;
            color: #666;
            font-weight: 500;
          }
          
          .footer-info {
            font-size: 8px;
            color: #666;
            line-height: 1.4;
          }
          
          .footer-info p {
            margin: 2px 0;
          }
          
          .footer-info strong {
            color: #484622;
            display: block;
            margin-bottom: 2px;
          }
          
          /* SECTION: Document Footer */
          .doc-footer {
            background: linear-gradient(135deg, #484622 0%, #5a5a2e 100%);
            color: #efeee3;
            padding: 10px 18px;
            text-align: center;
            font-size: 8px;
            border-radius: 0 0 6px 6px;
            border-top: 3px solid #efeee3;
            line-height: 1.4;
          }
          
          .doc-footer p {
            margin: 2px 0;
          }
          
          .doc-footer .footer-title {
            font-weight: 700;
            font-size: 8px;
            margin-bottom: 3px;
          }
          
          @media print {
            body {
              padding: 0;
              background: #fff;
            }
            .document {
              margin: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="document">
          <!-- HEADER SECTION -->
          <div class="header">
            <div class="header-brand">
              <div class="logo-circle">
                <img src="${logoDataUrl}" alt="SRMAP Logo">
              </div>
              <div class="brand-text">
                <h1>SRMAP MESS PASS PORTAL</h1>
                <p>International Mess Committee</p>
                <p>SRM University AP</p>
              </div>
            </div>
            <div class="header-right">
              <div class="label">Report Generated</div>
              <div class="value">${currentDate}</div>
              <div style="font-size: 11px; color: #efeee3; margin-top: 4px;">${currentTime}</div>
            </div>
          </div>

          <!-- INFO BANNER -->
          <div class="info-banner">
            <div class="info-item">
              <div class="info-label">Report Date</div>
              <div class="info-value">${currentDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Passes</div>
              <div class="info-value">${filteredPasses.length}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Document Type</div>
              <div class="info-value">Official Pass List</div>
            </div>
            <div class="info-item">
              <div class="info-label">Institution</div>
              <div class="info-value">SRMAP</div>
            </div>
          </div>

          <!-- MAIN CONTENT -->
          <div class="content">
            <div class="section-title">Pass Details</div>
            
            <table>
              <thead>
                <tr>
                  <th class="col-sno">S.No</th>
                  <th class="col-photo">Photo</th>
                  <th style="width: 14%;">Issue ID</th>
                  <th style="width: 35%;">Student Name</th>
                  <th style="width: 18%;">Reg Number</th>
                  <th style="width: 15%;">Issued Date</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPasses.map((pass, idx) => `
                  <tr>
                    <td class="col-sno">${idx + 1}</td>
                    <td class="col-photo">
                      <img src="${pass.photoUrl}" alt="${pass.fullName}">
                    </td>
                    <td><span class="col-issueid">${pass.issueId}</span></td>
                    <td class="col-name">${pass.fullName}</td>
                    <td>${pass.regNumber}</td>
                    <td>${new Date(pass.issuedDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- FOOTER SECTION -->
          <div class="footer-section">
            <div class="footer-block">
              <h4>Verified By</h4>
              <div style="font-size: 8px; margin-top: 10px; line-height: 1.6;">
                <div style="border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 6px;">__________________</div>
                <div style="font-weight: 700; color: #333;">Authorized Officer</div>
                <div style="color: #666; font-weight: 500; font-size: 7px;">Mess Committee Head</div>
              </div>
            </div>
            
            <div class="footer-block">
              <h4>Report Summary</h4>
              <div class="footer-info">
                <p><strong>Generated:</strong> ${currentDate}</p>
                <p><strong>Time:</strong> ${currentTime}</p>
                <p><strong>Total Records:</strong> ${filteredPasses.length}</p>
              </div>
            </div>
            
            <div class="footer-block">
              <h4>Contact Details</h4>
              <div class="footer-info">
                <p><strong>Email:</strong> international.mc@srmap.edu.in</p>
                <p><strong>Organization:</strong> SRM University AP</p>
              </div>
            </div>
          </div>

          <!-- DOCUMENT FOOTER -->
          <div class="doc-footer">
            <div class="footer-title">SRMAP - International Mess Pass Management System</div>
            <p>This is an official document generated from the SRMAP Mess Pass Portal. All information contained herein is confidential and intended for authorized personnel only.</p>
            <p style="margin-top: 8px; font-size: 9px;">E-mail : international.mc@srmap.edu.in</p>
          </div>
        </div>

        <script>
          window.print();
          window.close();
        </script>
      </body>
      </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
  };

  // Handle Excel Export
  const handleExcelExport = async () => {
    try {
      // Import xlsx library
      const XLSX = require('xlsx');

      const data = filteredPasses.map((pass, idx) => ({
        'S.No': idx + 1,
        'Issue ID': pass.issueId,
        'Student Name': pass.fullName,
        'Registration Number': pass.regNumber,
        'Issued Date': new Date(pass.issuedDate).toLocaleDateString('en-IN'),
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Issued Passes');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 8 },  // S.No
        { wch: 15 }, // Issue ID
        { wch: 25 }, // Student Name
        { wch: 18 }, // Registration Number
        { wch: 15 }, // Issued Date
      ];

      // Style header row
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

      // Generate and save the file
      const fileName = `SRMAP INTERNATIONAL MESS PASS.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#efeee3' }}>
        <div className="p-4 lg:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Issued Passes</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">Loading...</p>
          </div>
          
          {/* Skeleton Loader */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 md:p-6 animate-pulse">
                <div className="flex gap-4 md:gap-6">
                  <div className="w-16 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#efeee3' }}>
      <div className="p-3 md:p-4 lg:p-8">
        {/* Header Section */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Issued Passes</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-lg">Manage all international mess access passes</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Search Bar Section with Action Buttons */}
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, reg number, or issue ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <button
                  onClick={handlePrintReport}
                  disabled={filteredPasses.length === 0}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg transition"
                  title="Print Report"
                >
                  <Printer size={18} />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={handleExcelExport}
                  disabled={filteredPasses.length === 0}
                  className="flex items-center gap-2 text-white font-semibold py-2.5 px-4 rounded-lg transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#4CAF50' }}
                  title="Export to Excel"
                >
                  <FileSpreadsheet size={18} />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table/Card Section */}
          {filteredPasses.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="text-gray-400 mb-2">
                <FileText size={48} className="mx-auto mb-4" />
              </div>
              <p className="text-gray-600 font-medium text-sm md:text-base">
                {passes.length === 0 ? 'No passes issued yet' : 'No passes match your search'}
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                {passes.length === 0 && 'Start by issuing a new pass'}
              </p>
            </div>
          ) : (
            <div>
              {/* Mobile Cards View (hidden on md and above) */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredPasses.map((pass, index) => (
                  <div key={pass._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex gap-4 mb-3">
                      <img
                        src={pass.photoUrl}
                        alt={pass.fullName}
                        className="w-16 h-20 rounded-lg object-cover border-2 border-gray-300 flex-shrink-0"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Issue ID</div>
                        <p className="text-sm font-bold text-primary mb-2">{pass.issueId}</p>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</div>
                        <p className="text-sm font-bold text-gray-900 truncate mb-2">{pass.fullName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="inline-block text-2xl font-bold text-gray-400">#{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-gray-100 text-xs">
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Reg No.</p>
                        <p className="text-gray-700 font-medium">{pass.regNumber}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Date</p>
                        <p className="text-gray-700 font-medium">{new Date(pass.issuedDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedPass(pass)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-lg text-xs font-semibold hover:bg-opacity-20 transition"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadJPG(pass)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(pass._id)}
                        disabled={deleting === pass._id}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition"
                      >
                        <Trash2 size={14} />
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
                        <span className="flex items-center gap-2">Photo</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Issue ID</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Name</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Reg Number</span>
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest border-r border-white/20">
                        <span className="flex items-center gap-2">Issued Date</span>
                      </th>
                      <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-widest">
                        <span className="flex items-center justify-center gap-2">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPasses.map((pass, index) => (
                      <tr
                        key={pass._id}
                        className={`border-b border-gray-300 hover:bg-primary hover:bg-opacity-5 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-5 text-center text-sm font-bold text-gray-800 border-r border-gray-200">{index + 1}</td>
                        <td className="px-6 py-5 border-r border-gray-200">
                          <div className="flex items-center">
                            <img
                              src={pass.photoUrl}
                              alt={pass.fullName}
                              className="w-11 h-11 rounded-lg object-cover border-2 border-gray-300 shadow-sm"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-5 border-r border-gray-200">
                          <span className="inline-block bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-full text-sm font-bold border border-primary border-opacity-30">
                            {pass.issueId}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-gray-900 border-r border-gray-200">{pass.fullName}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-700 border-r border-gray-200">{pass.regNumber}</td>
                        <td className="px-6 py-5 text-sm text-gray-700 font-medium border-r border-gray-200">
                          {new Date(pass.issuedDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedPass(pass)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-primary hover:bg-opacity-10 transition"
                              title="View Pass"
                            >
                              <Eye size={19} />
                            </button>
                            <button
                              onClick={() => handleDownloadJPG(pass)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-primary hover:bg-opacity-10 transition"
                              title="Download JPG"
                            >
                              <Download size={19} />
                            </button>
                            <button
                              onClick={() => handleDelete(pass._id)}
                              disabled={deleting === pass._id}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                              title="Delete Pass"
                            >
                              <Trash2 size={19} />
                            </button>
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Footer Stats */}
          {filteredPasses.length > 0 && (
            <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredPasses.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{passes.length}</span> passes
              </p>
            </div>
          )}
        </div>

        {/* Pass Preview Modal */}
        {selectedPass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-primary text-white p-6 flex items-center justify-between border-b border-primary/30 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/30 p-2 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Pass Preview</h3>
                    <p className="text-white/90 text-sm">Issue ID: {selectedPass.issueId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="text-white hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Pass Card */}
                <div className="mb-6">
                  <PassCard
                    issueId={selectedPass.issueId}
                    fullName={selectedPass.fullName}
                    regNumber={selectedPass.regNumber}
                    photoUrl={selectedPass.photoUrl}
                    issuedDate={selectedPass.issuedDate}
                    authorizationText={selectedPass.authorizationText}
                  />
                </div>

                {/* Pass Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Pass Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Student Name</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedPass.fullName}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Registration No.</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedPass.regNumber}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Issue ID</span>
                      <span className="text-sm font-bold text-blue-600 text-right">{selectedPass.issueId}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Issued Date</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">
                        {new Date(selectedPass.issuedDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
                <button
                  onClick={() => handleDownloadJPG(selectedPass)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-sm"
                  title="Download as JPG"
                >
                  <Download size={18} />
                  <span>Download JPG</span>
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
                  title="Close Modal"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
