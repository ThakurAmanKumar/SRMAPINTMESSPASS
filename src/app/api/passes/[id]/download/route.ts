import { NextRequest, NextResponse } from 'next/server';
import Pass from '@/models/Pass';
import connectDB from '@/lib/mongodb';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let browser;
  try {
    await connectDB();

    // Check if id is an issueId format (starts with SRMAPIM)
    let pass;
    if (params.id.startsWith('SRMAPIM')) {
      pass = await Pass.findOne({
        issueId: params.id,
        status: 'approved'
      });
    } else {
      // Try to find by _id
      try {
        pass = await Pass.findOne({
          _id: params.id,
          status: 'approved'
        });
      } catch (e) {
        pass = null;
      }
    }

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found or not approved' },
        { status: 404 }
      );
    }

    // Generate HTML for the pass
    const passHTML = generatePassHTML(pass);

    // Convert HTML to JPG using Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(passHTML, { waitUntil: 'networkidle2' });
    
    // Set viewport to match pass card dimensions
    await page.setViewport({ width: 360, height: 800 });
    
    const jpgBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 95,
      fullPage: false,
    });

    await browser.close();

    // Return as JPG file
    return new NextResponse(jpgBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="Pass_${pass.issueId}.jpg"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error downloading pass:', error);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json(
      { error: error.message || 'Failed to download pass' },
      { status: 500 }
    );
  }
}

function generatePassHTML(pass: any): string {
  const issuedDate = new Date(pass.issuedDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>International Mess Pass - ${pass.issueId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f0f0;
            padding: 20px;
        }
        
        .pass-container {
            width: 360px;
            border: 4px solid #484622;
            border-radius: 16px;
            background-color: #efeee3;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        
        .pass-header {
            background-color: #484622;
            padding: 20px 16px;
            text-align: center;
        }
        
        .logo-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: rgba(239, 238, 227, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
        }
        
        .logo-img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        
        .university-name {
            color: #efeee3;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }
        
        .pass-type {
            color: #efeee3;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            line-height: 1.4;
        }
        
        .photo-section {
            padding: 20px 16px;
            text-align: center;
            background-color: #efeee3;
        }
        
        .photo-box {
            width: 110px;
            height: 130px;
            margin: 0 auto;
            border: 3px solid #484622;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(72, 70, 34, 0.15);
        }
        
        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .student-info {
            padding: 6px 16px 12px 16px;
            text-align: center;
            background-color: #efeee3;
        }
        
        .info-field {
            margin-bottom: 12px;
        }
        
        .info-label {
            font-size: 8px;
            font-weight: 700;
            color: #484622;
            letter-spacing: 1.2px;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.4;
            letter-spacing: 0.3px;
        }
        
        .reg-value {
            font-size: 10px;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            line-height: 1.5;
        }
        
        .authorization {
            margin: 2px 12px 12px 12px;
            padding: 14px 12px;
            border: 2px solid #484622;
            border-radius: 8px;
            background-color: #efeee3;
            box-shadow: 0 2px 8px rgba(72, 70, 34, 0.1);
        }
        
        .auth-title {
            font-size: 11px;
            font-weight: 700;
            color: #484622;
            letter-spacing: 0.8px;
            margin-bottom: 10px;
            text-align: center;
            text-transform: uppercase;
        }
        
        .auth-text {
            font-size: 8.5px;
            line-height: 1.7;
            color: #333333;
            text-align: justify;
            font-weight: 400;
            letter-spacing: 0.1px;
        }
        
        .contact-section {
            padding: 8px 16px;
            background-color: #efeee3;
            text-align: center;
            border-top: 1px solid #484622;
        }
        
        .contact-label {
            font-size: 6px;
            font-weight: 700;
            color: #484622;
            letter-spacing: 0.6px;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        
        .contact-name {
            font-size: 7.5px;
            font-weight: 700;
            color: #484622;
            letter-spacing: 0.2px;
            margin-bottom: 2px;
            line-height: 1.2;
        }
        
        .contact-email {
            font-size: 6.5px;
            font-weight: 600;
            color: #484622;
            letter-spacing: 0.1px;
            line-height: 1.3;
        }
        
        .pass-footer {
            padding: 12px 16px;
            background-color: #484622;
            border-top: 2px solid #484622;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        
        .footer-item {
            flex: 1;
            text-align: center;
        }
        
        .footer-label {
            font-size: 8px;
            font-weight: 700;
            color: #efeee3;
            letter-spacing: 0.6px;
            margin-bottom: 2px;
            text-transform: uppercase;
        }
        
        .footer-value {
            font-size: 12px;
            font-weight: 700;
            color: #efeee3;
        }
        
        .footer-divider {
            width: 1px;
            height: 28px;
            background-color: #efeee3;
            opacity: 0.4;
        }
        
        @media print {
            body {
                background: white;
            }
            .pass-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="pass-container">
        <!-- Header -->
        <div class="pass-header">
            <div class="logo-circle">
                <img src="https://raw.githubusercontent.com/ThakurAmanKumar/webIMG/refs/heads/main/img%20for%20site/SRM_University%2C_Andhra_Pradesh_logo.png" alt="Mess Logo" class="logo-img" onerror="this.style.display='none'">
            </div>
            <div class="university-name">SRM UNIVERSITY AP</div>
            <div class="pass-type">INTERNATIONAL MESS ACCESS PASS</div>
        </div>
        
        <!-- Photo Section -->
        <div class="photo-section">
            <div class="photo-box">
                <img src="${pass.photoUrl}" alt="${pass.fullName}">
            </div>
        </div>
        
        <!-- Student Info -->
        <div class="student-info">
            <div class="info-field">
                <div class="info-label">Student Name</div>
                <div class="info-value">${pass.fullName}</div>
            </div>
            <div class="info-field">
                <div class="info-label">Registration Number</div>
                <div class="reg-value">${pass.regNumber}</div>
            </div>
        </div>
        
        <!-- Authorization Block -->
        <div class="authorization">
            <div class="auth-title">✦ Authorization ✦</div>
            <div class="auth-text">${pass.authorizationText}</div>
        </div>
        
        <!-- Contact Section -->
        <div class="contact-section">
            <div class="contact-label">Contact</div>
            <div class="contact-name">International Mess Committee</div>
            <div class="contact-email"><span style="font-weight: 700;">E-mail :</span> international.mc@srmap.edu.in</div>
        </div>
        
        <!-- Footer -->
        <div class="pass-footer">
            <div class="footer-item">
                <div class="footer-label">Issue ID</div>
                <div class="footer-value">${pass.issueId}</div>
            </div>
            <div class="footer-divider"></div>
            <div class="footer-item">
                <div class="footer-label">Issued Date</div>
                <div class="footer-value">${issuedDate}</div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
