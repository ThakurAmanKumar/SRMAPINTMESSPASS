import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find super admin
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!superAdmin) {
      return NextResponse.json(
        { error: 'This account is not verified or does not exist' },
        { status: 404 }
      );
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'password-reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Hash new password and update (pre-save hook will hash it)
    superAdmin.password = newPassword;
    await superAdmin.save();

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
