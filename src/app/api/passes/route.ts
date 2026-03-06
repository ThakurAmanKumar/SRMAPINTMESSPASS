import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pass from '@/models/Pass';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verify token
    const token = getTokenFromRequest(request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fullName, regNumber, photoUrl } = await request.json();

    if (!fullName || !regNumber || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if student already has a pass
    const existingPass = await Pass.findOne({ regNumber });
    if (existingPass) {
      return NextResponse.json(
        { error: 'Student already has a pass' },
        { status: 400 }
      );
    }

    // Generate Issue ID
    const latestPass = await Pass.find().sort({ createdAt: -1 }).limit(1);
    let issueNumber = 1;
    
    if (latestPass.length > 0) {
      const lastIssueId = latestPass[0].issueId;
      const lastNumber = parseInt(lastIssueId.replace('SRMAPIM', ''), 10);
      issueNumber = lastNumber + 1;
    }

    const issueId = `SRMAPIM${String(issueNumber).padStart(2, '0')}`;

    // Create new pass
    const pass = new Pass({
      issueId,
      fullName,
      regNumber,
      photoUrl,
      issuedDate: new Date(),
    });

    await pass.save();

    return NextResponse.json(
      { pass },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create pass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    await connectDB();

    const passes = await Pass.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { passes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get passes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
