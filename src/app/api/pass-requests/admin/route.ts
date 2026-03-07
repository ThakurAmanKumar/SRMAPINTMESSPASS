import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-middleware';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    const passRequests = await PassRequest.find()
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests: passRequests,
    });
  } catch (error: any) {
    console.error('Error fetching pass requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pass requests' },
      { status: 500 }
    );
  }
}
