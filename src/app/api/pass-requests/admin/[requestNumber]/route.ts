import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-middleware';
import Admin from '@/models/Admin';
import { logAdminAction } from '@/lib/admin-action-logger';
import { getClientIP } from '@/lib/superadmin-middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { requestNumber: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(req);
    if (!authResult.valid || !authResult.payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify if user is admin
    await connectDB();
    const admin = await Admin.findOne({ email: authResult.payload.email });
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { requestNumber } = params;

    // Find and delete the pass request
    const passRequest = await PassRequest.findOneAndDelete({ requestNumber });

    if (!passRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Log the action
    await logAdminAction({
      adminEmail: authResult.payload.email,
      actionType: 'DELETE_REQUEST',
      actionDetails: `Deleted pass request: ${requestNumber} (Student: ${passRequest.fullName})`,
      targetId: passRequest._id.toString(),
      targetType: 'REQUEST',
      status: 'SUCCESS',
      ipAddress: getClientIP(req),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pass request deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete pass request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete pass request' },
      { status: 500 }
    );
  }
}
