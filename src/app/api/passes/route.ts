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

    const { fullName, regNumber, photoUrl, authorizationText } = await request.json();

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

    // Explicitly set authorizationText
    if (authorizationText && authorizationText.trim()) {
      pass.authorizationText = authorizationText;
    } else {
      pass.authorizationText = 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.';
    }
    
    await pass.save();

    // IMPORTANT: Re-fetch the document from the database to ensure all fields are included
    const savedPassFromDB = await Pass.findById(pass._id);

    // Create response object with ALL fields explicitly set
    const passData = {
      _id: String(savedPassFromDB?._id || pass._id),
      issueId: savedPassFromDB?.issueId || pass.issueId,
      fullName: savedPassFromDB?.fullName || pass.fullName,
      regNumber: savedPassFromDB?.regNumber || pass.regNumber,
      photoUrl: savedPassFromDB?.photoUrl || pass.photoUrl,
      issuedDate: (savedPassFromDB?.issuedDate || pass.issuedDate)?.toISOString?.() || (savedPassFromDB?.issuedDate || pass.issuedDate),
      authorizationText: String(savedPassFromDB?.authorizationText || 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.'),
      createdAt: (savedPassFromDB?.createdAt || pass.createdAt)?.toISOString?.() || (savedPassFromDB?.createdAt || pass.createdAt),
      updatedAt: (savedPassFromDB?.updatedAt || pass.updatedAt)?.toISOString?.() || (savedPassFromDB?.updatedAt || pass.updatedAt),
    };
    


    return NextResponse.json(
      { pass: passData },
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

    // Explicitly extract all fields from each pass document with proper authorizationText handling
    const passesData = passes.map(pass => ({
      _id: String(pass._id),
      issueId: pass.issueId,
      fullName: pass.fullName,
      regNumber: pass.regNumber,
      photoUrl: pass.photoUrl,
      issuedDate: pass.issuedDate?.toISOString?.() || pass.issuedDate,
      authorizationText: String(pass.authorizationText || 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.'),
      createdAt: pass.createdAt?.toISOString?.() || pass.createdAt,
      updatedAt: pass.updatedAt?.toISOString?.() || pass.updatedAt,
    }));

    return NextResponse.json(
      { passes: passesData },
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
