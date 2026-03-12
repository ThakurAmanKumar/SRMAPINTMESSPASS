import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import Pass from '@/models/Pass';
import PassRequest from '@/models/PassRequest';
import { verifySuperAdminAuth } from '@/lib/superadmin-middleware';
import { getActivityStats } from '@/lib/admin-action-logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    await connectDB();

    // Fetch all statistics
    const [adminCount, passCount, requestCount, activityStats] = await Promise.all([
      Admin.countDocuments({}),
      Pass.countDocuments({}),
      PassRequest.countDocuments({}),
      getActivityStats(),
    ]);

    // Count deleted/revoked passes
    const deletedPassCount = await Pass.countDocuments({ status: 'REVOKED' });

    return NextResponse.json(
      {
        success: true,
        statistics: {
          totalAdmins: adminCount,
          totalPasses: passCount,
          totalRequests: requestCount,
          revokedPasses: deletedPassCount,
          activityStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
