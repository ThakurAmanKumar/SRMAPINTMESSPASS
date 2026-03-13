/**
 * Email Templates for Pass Request Notifications
 */

export interface PassApprovedEmailParams {
  studentName: string;
  email: string;
  requestNumber: string;
  registrationNumber: string;
  issueId: string;
  issuedDate: string;
}

export interface PassRejectedEmailParams {
  studentName: string;
  email: string;
  requestNumber: string;
  registrationNumber: string;
  rejectionReason?: string;
}

export interface NewAdminEmailParams {
  email: string;
  createdByEmail: string;
}

/**
 * Generate HTML email for approved pass
 */
export function getPassApprovedEmailHTML(params: PassApprovedEmailParams): string {
  const statusLink = 'https://srmapimpass.indevs.in';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #484622 0%, #6b6b32 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { background: white; padding: 30px; }
          .success-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
          .details-section { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #484622; }
          .detail-value { color: #666; font-family: 'Courier New', monospace; }
          .button-section { text-align: center; margin: 30px 0; }
          .action-button { display: inline-block; background: linear-gradient(135deg, #484622 0%, #6b6b32 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; transition: transform 0.2s; }
          .action-button:hover { transform: translateY(-2px); }
          .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
          .committee-note { background: #e8f4f8; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Pass Approved!</h1>
            <p>Your International Mess Pass Request Has Been Approved</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Dear <strong>${params.studentName}</strong>,</p>
            
            <p>Great news! Your International Mess Pass request has been <strong style="color: #10b981;">APPROVED</strong> by the International Mess Committee.</p>

            <div class="success-badge">PASS VERIFIED ✓ APPROVED</div>

            <!-- Details Section -->
            <div class="details-section">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #10b981;">Pass Details:</p>
              <div class="detail-row">
                <span class="detail-label">Pass Issue ID:</span>
                <span class="detail-value">${params.issueId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Request Number:</span>
                <span class="detail-value">${params.requestNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Registration Number:</span>
                <span class="detail-value">${params.registrationNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Issued Date:</span>
                <span class="detail-value">${new Date(params.issuedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981; font-weight: bold;">APPROVED</span>
              </div>
            </div>

            <!-- Action Section -->
            <div class="button-section">
              <p style="margin: 0 0 15px 0; font-weight: bold;">Download your pass now:</p>
              <a href="${statusLink}" class="action-button" style="color: white !important;">View & Download Pass</a>
            </div>

            <!-- Info Box -->
            <div class="info-box">
              <p><strong>📌 Next Steps:</strong></p>
              <p>1. Visit: <a href="${statusLink}" style="color: #f59e0b; text-decoration: none;">${statusLink}</a></p>
              <p>- Click "Check Status" to view your status</p>
              <p>2. Check your status using Request Number: <strong>${params.requestNumber}</strong></p>
              <p>3. Download your pass (HTML file with print-to-PDF option)</p>
              <p>4. Print to PDF or save as image, then present at the International Mess</p>
            </div>

            <!-- Committee Note -->
            <div class="committee-note">
              <p style="margin: 0; font-size: 13px;"><strong>📋 Authorization:</strong> As per verification by the International Mess Committee, SRM University-AP, you are now authorized to access and use the services of the International Mess.</p>
            </div>

            <p style="margin-top: 30px; color: #666;">If you have any questions or need assistance, please contact the International Mess Committee.</p>
            
            <p><strong>Best Regards,</strong><br>SRMAP International Mess Committee<br>SRM University-AP</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>This is an automated email from SRMAP International Mess Pass System.</p>
            <p>© 2026 SRM University-AP. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text email for approved pass
 */
export function getPassApprovedEmailText(params: PassApprovedEmailParams): string {
  const statusLink = 'https://srmapimpass.indevs.in';
  
  return `
INTERNATIONAL MESS PASS - APPROVED

Dear ${params.studentName},

Great news! Your International Mess Pass request has been APPROVED.

PASS DETAILS:
- Pass Issue ID: ${params.issueId}
- Request Number: ${params.requestNumber}
- Registration Number: ${params.registrationNumber}
- Issued Date: ${new Date(params.issuedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
- Status: APPROVED

DOWNLOAD YOUR PASS:
Visit: ${statusLink}
Use Request Number: ${params.requestNumber}

NEXT STEPS:
1. Visit: ${statusLink}
- Click "Check Status" to view your status
2. Enter your request number
3. Download your pass (printable HTML file)
4. Print to PDF or save as image
5. Present it at the International Mess

Authorization: As per verification by the International Mess Committee, SRM University-AP, you are now authorized to access the International Mess services.

If you need assistance, contact the International Mess Committee.

Best Regards,
SRMAP International Mess Committee
SRM University-AP

© 2026 SRM University-AP. All rights reserved.
  `;
}

/**
 * Generate HTML email for rejected pass
 */
export function getPassRejectedEmailHTML(params: PassRejectedEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { background: white; padding: 30px; }
          .rejected-badge { display: inline-block; background: #ef4444; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
          .details-section { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #484622; }
          .detail-value { color: #666; font-family: 'Courier New', monospace; }
          .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reason-box p { margin: 5px 0; }
          .contact-box { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Request Not Approved</h1>
            <p>Your International Mess Pass Request Status Update</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Dear <strong>${params.studentName}</strong>,</p>
            
            <p>Thank you for submitting your International Mess Pass request. We regret to inform you that your request has been <strong style="color: #ef4444;">REJECTED</strong> by the International Mess Committee after careful review.</p>

            <div class="rejected-badge">REQUEST REJECTED</div>

            <!-- Details Section -->
            <div class="details-section">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #ef4444;">Request Details:</p>
              <div class="detail-row">
                <span class="detail-label">Request Number:</span>
                <span class="detail-value">${params.requestNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Registration Number:</span>
                <span class="detail-value">${params.registrationNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #ef4444; font-weight: bold;">REJECTED</span>
              </div>
            </div>

            <!-- Rejection Reason -->
            ${params.rejectionReason ? `
            <div class="reason-box">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Reason for Rejection:</p>  
              <p>${params.rejectionReason}</p>
            </div>
            ` : ''}

            <!-- Contact Section -->
            <div class="contact-box">
              <p style="margin: 0 0 10px 0; font-weight: bold;">❓ Need Help?</p>
              <p>If you believe this rejection was made in error or would like more information about the reason, please contact the International Mess Committee directly.</p>
              <p><strong>You can reapply</strong> after addressing the concerns mentioned above.</p>
            </div>

            <p style="margin-top: 30px; color: #666;">We appreciate your understanding. The International Mess Committee maintains strict standards to ensure the quality of our services.</p>
            
            <p><strong>Best Regards,</strong><br>SRMAP International Mess Committee<br>SRM University-AP</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>This is an automated email from SRMAP International Mess Pass System.</p>
            <p>© 2026 SRM University-AP. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text email for rejected pass
 */
export function getPassRejectedEmailText(params: PassRejectedEmailParams): string {
  return `
INTERNATIONAL MESS PASS - REQUEST REJECTED

Dear ${params.studentName},

Thank you for submitting your International Mess Pass request. We regret to inform you that your request has been REJECTED after careful review.

REQUEST DETAILS:
- Request Number: ${params.requestNumber}
- Registration Number: ${params.registrationNumber}
- Status: REJECTED

${params.rejectionReason ? `REASON FOR REJECTION:
${params.rejectionReason}

` : ''}NEXT STEPS:
If you believe this was made in error, please contact the International Mess Committee.
You can reapply after addressing the concerns mentioned above.

We appreciate your understanding. The International Mess Committee maintains strict standards for all services.

Best Regards,
SRMAP International Mess Committee
SRM University-AP

© 2026 SRM University-AP. All rights reserved.
  `;
}

/**
 * Generate HTML email for new admin
 */
export function getNewAdminEmailHTML(params: NewAdminEmailParams): string {
  const loginURL = 'https://srmapimpass.indevs.in/login';
  const forgotPasswordURL = 'https://srmapimpass.indevs.in/login';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: linear-gradient(135deg, #484622 0%, #6b6b32 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { background: white; padding: 30px; }
          .badge { display: inline-block; background: #0284c7; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
          .steps-section { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .step { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #10b981; border-radius: 4px; }
          .step-number { display: inline-block; background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
          .step-content { display: inline-block; vertical-align: middle; }
          .action-button { display: inline-block; background: linear-gradient(135deg, #484622 0%, #6b6b32 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .action-button:hover { opacity: 0.9; }
          .info-box { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .security-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Welcome to Admin Panel!</h1>
            <p>You've been added as an Admin</p>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Dear <strong>${params.email}</strong>,</p>
            
            <p>Congratulations! You have been successfully added as an <strong style="color: #484622;">Admin</strong> to the SRMAP International Mess Pass Portal.</p>

            <div class="badge">🎉 ADMIN ACCESS GRANTED</div>

            <!-- Steps Section -->
            <div class="steps-section">
              <p style="margin: 0 0 20px 0; font-weight: bold; color: #10b981; font-size: 16px;">📋 Steps to Setup Your Credentials:</p>
              
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-content">
                  <strong>Visit the Login Portal</strong><br>
                  <a href="${loginURL}" style="color: #0284c7; text-decoration: none;">${loginURL}</a>
                </span>
              </div>

              <div class="step">
                <span class="step-number">2</span>
                <span class="step-content">
                  <strong>Click on "Forgot Password?"</strong><br>
                  This will allow you to set your initial password
                </span>
              </div>

              <div class="step">
                <span class="step-number">3</span>
                <span class="step-content">
                  <strong>Enter Your Email</strong><br>
                  Use: <strong>${params.email}</strong><br>
                  You'll receive an OTP to verify your identity
                </span>
              </div>

              <div class="step">
                <span class="step-number">4</span>
                <span class="step-center">
                  <strong>Set Your Password</strong><br>
                  Choose a strong password (minimum 6 characters)
                </span>
              </div>

              <div class="step">
                <span class="step-number">5</span>
                <span class="step-content">
                  <strong>Return to Login</strong><br>
                  Go back to the login page
                </span>
              </div>

              <div class="step">
                <span class="step-number">6</span>
                <span class="step-content">
                  <strong>Enter Your Credentials</strong><br>
                  Use your email and newly set password
                </span>
              </div>

              <div class="step">
                <span class="step-number">7</span>
                <span class="step-content">
                  <strong>Verify Email OTP</strong><br>
                  Complete the OTP verification for secure access
                </span>
              </div>

              <div class="step">
                <span class="step-number">8</span>
                <span class="step-content">
                  <strong>Access Admin Dashboard</strong><br>
                  You're ready to manage the system!
                </span>
              </div>
            </div>

            <!-- Quick Start Button -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 15px 0; font-weight: bold;">Ready to get started?</p>
              <a href="${loginURL}" class="action-button" style="color: white !important;">Go to Login Portal</a>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Public/Student Page: <strong style="color: #484622;">https://srmapimpass.indevs.in</strong></p>
            </div>

            <p style="margin-top: 30px; color: #666;">If you have any questions or need assistance, please contact the Super Administrator.</p>
            
            <p><strong>Best Regards,</strong><br>SRMAP International Mess Committee<br>SRM University-AP</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>This is an automated email from SRMAP International Mess Pass System.</p>
            <p>© 2026 SRM University-AP. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate text email for new admin
 */
export function getNewAdminEmailText(params: NewAdminEmailParams): string {
  const loginURL = 'https://srmapimpass.indevs.in/login';
  
  return `
WELCOME TO ADMIN PANEL
You've Been Added as an Admin

Dear ${params.email},

Congratulations! You have been successfully added as an Admin to the SRMAP International Mess Pass Portal.

STEPS TO SETUP YOUR CREDENTIALS:

1. Visit the Login Portal
   ${loginURL}

2. Click on "Forgot Password?"
   This will allow you to set your initial password

3. Enter Your Email
   Use: ${params.email}
   You'll receive an OTP to verify your identity

4. Set Your Password
   Choose a strong password (minimum 6 characters)

5. Return to Login
   Go back to the login page

6. Enter Your Credentials
   Use your email and newly set password

7. Verify Email OTP
   Complete the OTP verification for secure access

8. Access Admin Dashboard
   You're ready to manage the system!

QUICK START:
${loginURL}

Public/Student Page: https://srmapimpass.indevs.in

If you have any questions or need assistance, please contact the Super Administrator.

Best Regards,
SRMAP International Mess Committee
SRM University-AP

© 2026 SRM University-AP. All rights reserved.
  `;
}
