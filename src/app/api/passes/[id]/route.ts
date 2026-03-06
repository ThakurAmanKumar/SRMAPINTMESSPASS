import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pass from '@/models/Pass';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify token
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const pass = await Pass.findById(params.id);
    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { pass },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get pass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify token
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const pass = await Pass.findByIdAndDelete(params.id);
    if (!pass) {
      return NextResponse.json(
        { error: 'Pass not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Pass deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete pass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
