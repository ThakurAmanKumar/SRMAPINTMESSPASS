import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import OTP from '@/models/OTP';
import { generateOTP } from '@/lib/otp';
import { sendEmail } from '@/lib/mailer';
import { getClientIP } from '@/lib/superadmin-middleware';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find super admin
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!superAdmin) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        { message: 'If the email exists, an OTP has been sent' },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily (you can use Redis or database)
    // For now, we'll store it in a temporary collection
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });
    
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'password-reset',
      expiresAt: otpExpiry,
    });

    // Send OTP email
    const emailContent = `
      <h2 style="color: #484622;">Password Reset Request</h2>
      <p>You requested to reset your Super Admin password.</p>
      <p style="font-size: 24px; font-weight: bold; color: #484622; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Super Admin Panel',
      html: emailContent,
    });

    return NextResponse.json(
      { message: 'OTP sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
