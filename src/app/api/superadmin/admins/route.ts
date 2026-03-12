import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { verifySuperAdminAuth, getClientIP } from '@/lib/superadmin-middleware';
import { logAdminAction } from '@/lib/admin-action-logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    await connectDB();

    const admins = await Admin.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: admins.length,
        admins,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password,
    });

    await newAdmin.save();

    // Log the action
    await logAdminAction({
      adminEmail: auth.payload!.email,
      actionType: 'CREATE_ADMIN',
      actionDetails: `Created new admin: ${email}`,
      targetId: newAdmin._id.toString(),
      targetType: 'ADMIN',
      status: 'SUCCESS',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin created successfully',
        admin: {
          _id: newAdmin._id,
          email: newAdmin.email,
          createdAt: newAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');
    const adminEmail = searchParams.get('email');

    if (!adminId && !adminEmail) {
      return NextResponse.json(
        { error: 'Admin ID or email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const query = adminId ? { _id: adminId } : { email: adminEmail!.toLowerCase() };
    const admin = await Admin.findOne(query);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const adminEmailForLogging = admin.email;

    await Admin.deleteOne(query);

    // Log the action
    await logAdminAction({
      adminEmail: auth.payload!.email,
      actionType: 'DELETE_ADMIN',
      actionDetails: `Deleted admin: ${adminEmailForLogging}`,
      targetId: admin._id.toString(),
      targetType: 'ADMIN',
      status: 'SUCCESS',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
