import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import OTP from '@/models/OTP';
import { sendEmail } from '@/lib/mailer';
import { generateOTP } from '@/lib/otp';

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

    // Check if super admin exists
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });

    if (!superAdmin) {
      return NextResponse.json(
        { error: 'This account is not verified or does not exist' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this email and type
    await OTP.deleteMany({
      email: email.toLowerCase(),
      type: 'login',
    });

    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'login',
      expiresAt,
    });

    // Send OTP email
    try {
      await sendEmail({
        to: email,
        subject: 'SRMAP Super Admin - Login OTP',
        html: `
          <h2>SRMAP International Mess Pass Portal</h2>
          <h3>Super Admin Login Verification</h3>
          <p>Your login OTP is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr>
          <small>SRMAP International Mess Pass Portal</small>
        `,
        text: `Your SRMAP Super Admin login OTP is: ${otp}. This OTP will expire in 10 minutes.`,
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
