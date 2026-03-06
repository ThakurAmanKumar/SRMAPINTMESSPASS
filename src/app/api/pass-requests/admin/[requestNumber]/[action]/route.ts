import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-middleware';
import Admin from '@/models/Admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { action: string; requestNumber: string } }
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

    await connectDB();

    const { action, requestNumber } = params;
    const { rejectionReason } = await req.json();

    const passRequest = await PassRequest.findOne({ requestNumber });

    if (!passRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      passRequest.status = 'approved';
      passRequest.approvedAt = new Date();
      passRequest.rejectionReason = undefined;
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }
      passRequest.status = 'rejected';
      passRequest.rejectionReason = rejectionReason;
      passRequest.rejectedAt = new Date();
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await passRequest.save();

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
      request: passRequest,
    });
  } catch (error: any) {
    console.error('Error updating pass request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update pass request' },
      { status: 500 }
    );
  }
}
