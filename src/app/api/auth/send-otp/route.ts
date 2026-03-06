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
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['login', 'password-reset'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid OTP type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Set expiration to 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({ email: email.toLowerCase(), type });

    // Create new OTP record
    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      type,
      expiresAt,
    });

    await otpRecord.save();

    // Send email with OTP
    const emailSubject = type === 'login' ? 'Login OTP - SRMAP Mess Pass Portal' : 'Password Reset OTP - SRMAP Mess Pass Portal';
    const emailType = type === 'login' ? 'Login' : 'Password Reset';

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
    
    <p>You requested a ${emailType} OTP for your SRMAP Mess Pass Portal account.</p>
    
    <div style="background-color: #f0f8ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
      <h2 style="color: #007bff; letter-spacing: 5px; margin: 10px 0; font-family: monospace; font-size: 32px;">${otp}</h2>
      <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">This code expires in 5 minutes</p>
    </div>
    
    <p><strong>Important Security Notes:</strong></p>
    <ul style="color: #666;">
      <li>Never share this OTP with anyone</li>
      <li>SRMAP staff will never ask for your OTP</li>
      <li>This OTP is valid for 5 minutes only</li>
    </ul>
    
    <p>If you did not request this code, please ignore this email.</p>
    
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

You requested a ${emailType} OTP for your SRMAP Mess Pass Portal account.

Your verification code is: ${otp}

This code expires in 5 minutes.

Important Security Notes:
- Never share this OTP with anyone
- SRMAP staff will never ask for your OTP
- This OTP is valid for 5 minutes only

If you did not request this code, please ignore this email.

© SRMAP International Mess Committee
This is an automated message. Please do not reply.
    `;

    await sendEmail({
      to: email.toLowerCase(),
      subject: emailSubject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        email: email.toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
