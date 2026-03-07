import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pass from '@/models/Pass';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify token
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    await connectDB();

    // Search by name, registration number, or issue ID
    const passes = await Pass.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { regNumber: { $regex: query, $options: 'i' } },
        { issueId: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      { passes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search passes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
