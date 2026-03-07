import { NextRequest, NextResponse } from 'next/server';
import Pass from '@/models/Pass';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const pass = await Pass.findOne({
      $or: [
        { issueId: params.id },
        { _id: params.id }
      ],
      status: 'approved'
    });

    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found or not approved' },
        { status: 404 }
      );
    }

    // Generate HTML for the pass that can be rendered as JPG
    const passHTML = generatePassHTML(pass);

    // Return as HTML with instructions for download
    // Client-side can use html2canvas or similar to convert to JPG
    return new NextResponse(passHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Pass_${pass.issueId}.html"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error downloading pass:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download pass' },
      { status: 500 }
    );
  }
}

function generatePassHTML(pass: any): string {
  const issuedDate = new Date(pass.issuedDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
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
        
        .pass-card {
            width: 100%;
            max-width: 600px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .pass-card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
        }
        
        .pass-content {
            position: relative;
            z-index: 1;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 20px;
        }
        
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .pass-type {
            font-size: 14px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .student-photo {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            border-radius: 10px;
            border: 3px solid white;
            overflow: hidden;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #999;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .student-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .student-info {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .student-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .student-reg {
            font-size: 16px;
            opacity: 0.95;
            letter-spacing: 0.5px;
        }
        
        .divider {
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            margin: 20px 0;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .detail-item {
            text-align: center;
        }
        
        .detail-label {
            font-size: 12px;
            opacity: 0.85;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .footer {
            text-align: center;
            border-top: 2px solid rgba(255, 255, 255, 0.3);
            padding-top: 15px;
            font-size: 11px;
            opacity: 0.85;
            line-height: 1.6;
        }
        
        .status-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.4);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        @media print {
            body {
                background: white;
            }
            .pass-card {
                box-shadow: none;
            }
        }
        
        .print-button {
            display: none;
        }
        
        @media (max-width: 600px) {
            .pass-card {
                padding: 25px;
            }
            
            .logo-text {
                font-size: 22px;
            }
            
            .student-name {
                font-size: 20px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="pass-card">
        <div class="pass-content">
            <div class="header">
                <div class="logo-text">🎓 SRM University-AP</div>
                <div class="pass-type">International Mess Pass</div>
            </div>
            
            <div style="text-align: center;">
                <div class="status-badge">✓ VERIFIED & APPROVED</div>
            </div>
            
            <div class="student-photo">
                ${pass.photoUrl ? `<img src="${pass.photoUrl}" alt="Student Photo" />` : 'No Photo'}
            </div>
            
            <div class="student-info">
                <div class="student-name">${pass.fullName}</div>
                <div class="student-reg">${pass.regNumber}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Issue ID</div>
                    <div class="detail-value">${pass.issueId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Issued Date</div>
                    <div class="detail-value">${issuedDate}</div>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                <p>${pass.authorizationText || 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.'}</p>
                <p style="margin-top: 10px; opacity: 0.7;">
                    Valid for the current academic session<br>
                    Present this pass at the International Mess
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print on load
        window.addEventListener('load', function() {
            if (window.location.hash !== '#noprint') {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        });
    </script>
</body>
</html>
  `;
}
