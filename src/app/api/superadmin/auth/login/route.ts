import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import Admin from '@/models/Admin';
import OTP from '@/models/OTP';
import { sendEmail } from '@/lib/mailer';
import { generateOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if super admin exists first
    let user = await SuperAdmin.findOne({ email: email.toLowerCase() });
    let userType = 'SuperAdmin';

    // If not a super admin, check if admin exists
    if (!user) {
      user = await Admin.findOne({ email: email.toLowerCase() });
      userType = 'Admin';
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
        subject: 'SRMAP Admin - Login OTP',
        html: `
          <h2>SRMAP International Mess Pass Portal</h2>
          <h3>Admin Login Verification</h3>
          <p>Your login OTP is:</p>
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr>
          <small>SRMAP International Mess Pass Portal</small>
        `,
        text: `Your SRMAP Admin login OTP is: ${otp}. This OTP will expire in 10 minutes.`,
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        requiresOTP: true,
        email: user.email,
        userType,
        message: 'OTP has been sent to your email',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
