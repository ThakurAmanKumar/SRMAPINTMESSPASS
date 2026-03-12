import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import SuperAdmin from '@/models/SuperAdmin';
import { generateToken } from '@/lib/jwt';

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

    // Check if this is a SuperAdmin account (they cannot login via admin panel)
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (superAdmin) {
      return NextResponse.json(
        { error: 'This account is not authorized for admin panel access' },
        { status: 403 }
      );
    }

    // Check if admin exists in Admin collection only
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // If admin doesn't exist, return error
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Password is correct, now OTP verification is needed
    // Return a flag indicating OTP verification is needed
    return NextResponse.json(
      { 
        requiresOTP: true,
        email: admin.email,
        message: 'OTP has been sent to your email',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
