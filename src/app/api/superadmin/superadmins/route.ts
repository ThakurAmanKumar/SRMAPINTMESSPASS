import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SuperAdmin from '@/models/SuperAdmin';
import { verifySuperAdminAuth, getClientIP } from '@/lib/superadmin-middleware';
import { logAdminAction } from '@/lib/admin-action-logger';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    await dbConnect();

    const superAdmins = await SuperAdmin.find({}, { password: 0 })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { superadmins: superAdmins },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching super admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch super admins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Super admin with this email already exists' },
        { status: 409 }
      );
    }

    // Create new super admin
    const newSuperAdmin = new SuperAdmin({
      email: email.toLowerCase(),
      password,
    });

    await newSuperAdmin.save();

    // Log action
    await logAdminAction({
      adminEmail: auth.payload!.email,
      actionType: 'CREATE_ADMIN',
      actionDetails: `Created new super admin: ${email}`,
      targetId: newSuperAdmin._id.toString(),
      targetType: 'ADMIN',
      status: 'SUCCESS',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(
      {
        message: 'Super admin created successfully',
        superadmin: {
          _id: newSuperAdmin._id,
          email: newSuperAdmin.email,
          createdAt: newSuperAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating super admin:', error);
    
    // Log failed action
    try {
      const authRetry = await verifySuperAdminAuth(request);
      if (authRetry.valid && authRetry.payload) {
        await logAdminAction({
          adminEmail: authRetry.payload.email,
          actionType: 'CREATE_ADMIN',
          actionDetails: `Failed to create super admin`,
          targetId: '',
          targetType: 'ADMIN',
          status: 'FAILED',
          ipAddress: getClientIP(request),
        });
      }
    } catch {}

    return NextResponse.json(
      { error: 'Failed to create super admin' },
      { status: 500 }
    );
  }
}
