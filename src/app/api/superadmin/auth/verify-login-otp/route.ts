import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import OTP from '@/models/OTP';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'login',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Verify super admin exists
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!superAdmin) {
      return NextResponse.json(
        { error: 'Super Admin not found' },
        { status: 404 }
      );
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = generateToken(
      {
        email: superAdmin.email,
        id: superAdmin._id.toString(),
      },
      '24h'
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        token,
        email: superAdmin.email,
      },
      { status: 200 }
    );

    response.cookies.set('superadmin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
