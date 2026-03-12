import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifySuperAdminAuth } from '@/lib/superadmin-middleware';
import { getAllActionHistory } from '@/lib/admin-action-logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifySuperAdminAuth(request);
    if (!auth.valid) {
      return auth.error as NextResponse;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminEmail = searchParams.get('adminEmail');
    const actionType = searchParams.get('actionType');

    const skip = (page - 1) * limit;

    await connectDB();

    const filters: any = {};
    if (adminEmail) filters.adminEmail = adminEmail;
    if (actionType) filters.actionType = actionType;

    const history = await getAllActionHistory(limit, skip, filters);

    return NextResponse.json(
      {
        success: true,
        page,
        limit,
        count: history.length,
        history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin history' },
      { status: 500 }
    );
  }
}
