import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import OTP from '@/models/OTP';
import { sendEmail } from '@/lib/mailer';

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        { 
          message: 'If this email exists, a password reset OTP has been sent',
          email: email.toLowerCase(),
        },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Set expiration to 15 minutes for password reset
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any existing password-reset OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });

    // Create new OTP record
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'password-reset',
      expiresAt,
    });

    await otpRecord.save();

    // Send email with OTP
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #f39c12; margin: 0;">SRMAP</h1>
      <p style="color: #666; margin: 5px 0;">International Mess Pass Portal</p>
    </div>
    
    <p>Hi Admin,</p>
    
    <p>You requested to reset your password for your SRMAP Mess Pass Portal account.</p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 20px; margin: 20px 0;">
      <p style="color: #d32f2f; margin: 0 0 5px 0; font-weight: bold;">⚠️ Security Alert</p>
      <p style="color: #666; margin: 5px 0;">If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
    
    <p style="margin-top: 20px;">To reset your password, use the following OTP:</p>
    
    <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your password reset code is:</p>
      <h2 style="color: #007bff; letter-spacing: 5px; margin: 10px 0; font-family: monospace; font-size: 32px;">${otp}</h2>
      <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">This code expires in 15 minutes</p>
    </div>
    
    <p><strong>Steps to reset your password:</strong></p>
    <ol style="color: #666;">
      <li>Enter the OTP code above on the password reset page</li>
      <li>Create a new strong password</li>
      <li>Confirm the new password</li>
      <li>Your password will be updated immediately</li>
    </ol>
    
    <p style="color: #d32f2f;"><strong>Important Security Notes:</strong></p>
    <ul style="color: #666;">
      <li>Never share this OTP with anyone</li>
      <li>SRMAP staff will never ask for your OTP or password</li>
      <li>This OTP is valid for 15 minutes only</li>
      <li>Use a strong password with mix of uppercase, lowercase, numbers and symbols</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px; text-align: center;">
      © SRMAP International Mess Committee<br>
      This is an automated message. Please do not reply.
    </p>
  </div>
</body>
</html>
    `;

    const textContent = `
SRMAP International Mess Pass Portal

Hi Admin,

You requested to reset your password for your SRMAP Mess Pass Portal account.

⚠️ Security Alert:
If you did not request this password reset, please ignore this email and your password will remain unchanged.

Your password reset code is: ${otp}

This code expires in 15 minutes.

Steps to reset your password:
1. Enter the OTP code above on the password reset page
2. Create a new strong password
3. Confirm the new password
4. Your password will be updated immediately

Important Security Notes:
- Never share this OTP with anyone
- SRMAP staff will never ask for your OTP or password
- This OTP is valid for 15 minutes only
- Use a strong password with mix of uppercase, lowercase, numbers and symbols

© SRMAP International Mess Committee
This is an automated message. Please do not reply.
    `;

    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Password Reset OTP - SRMAP Mess Pass Portal',
      html: htmlContent,
      text: textContent,
    });

    // For security, don't reveal if email exists
    return NextResponse.json(
      { 
        message: 'If this email exists, a password reset OTP has been sent',
        email: email.toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
