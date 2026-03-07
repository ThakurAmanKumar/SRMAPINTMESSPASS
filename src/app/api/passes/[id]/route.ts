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

    // Explicitly extract all fields with proper authorizationText handling
    const passObject = {
      _id: String(pass._id),
      issueId: pass.issueId,
      fullName: pass.fullName,
      regNumber: pass.regNumber,
      photoUrl: pass.photoUrl,
      issuedDate: pass.issuedDate?.toISOString?.() || pass.issuedDate,
      authorizationText: String(pass.authorizationText || 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.'),
      createdAt: pass.createdAt?.toISOString?.() || pass.createdAt,
      updatedAt: pass.updatedAt?.toISOString?.() || pass.updatedAt,
    };

    return NextResponse.json(
      { pass: passObject },
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
