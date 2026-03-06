import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
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
      expiresAt: { $gt: new Date() }, // OTP not expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Verify admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token for session
    const token = generateToken({ email: admin.email, id: admin._id.toString() });

    // Login successful
    return NextResponse.json(
      { 
        token,
        email: admin.email,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify login OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
