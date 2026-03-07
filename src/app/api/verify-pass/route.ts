import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pass from '@/models/Pass';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { issueId } = await request.json();

    // Validate issueId format
    if (!issueId || typeof issueId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid issue ID format' },
        { status: 400 }
      );
    }

    // Sanitize and format the issueId
    const sanitizedId = issueId.trim().toUpperCase();
    
    // Validate that issueId follows the pattern SRMAPIM + numbers
    const issueIdPattern = /^SRMAPIM\d+$/;
    if (!issueIdPattern.test(sanitizedId)) {
      return NextResponse.json(
        { error: 'Invalid issue ID format. Expected format: SRMAPIM01' },
        { status: 400 }
      );
    }

    await connectDB();

    // Search for the pass
    const pass = await Pass.findOne({ issueId: sanitizedId });

    if (!pass) {
      return NextResponse.json(
        { 
          status: 'not_found',
          message: 'This pass number does not exist.',
          error: 'Invalid Pass'
        },
        { status: 404 }
      );
    }

    // Check if pass is approved
    if (pass.status !== 'approved') {
      return NextResponse.json(
        { 
          status: 'not_approved',
          message: 'This request is still under review.',
          error: 'Pass Not Approved Yet'
        },
        { status: 403 }
      );
    }

    // Return pass details
    return NextResponse.json(
      {
        status: 'verified',
        message: 'Valid Pass',
        data: {
          issueId: pass.issueId,
          studentName: pass.fullName,
          registrationNumber: pass.regNumber,
          photoUrl: pass.photoUrl,
          issuedDate: pass.issuedDate,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify pass error:', error);
    return NextResponse.json(
      { error: 'Failed to verify pass. Please try again.' },
      { status: 500 }
    );
  }
}
