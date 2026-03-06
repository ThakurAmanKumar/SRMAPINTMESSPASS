import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import connectDB from '@/lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { requestNumber: string } }
) {
  try {
    await connectDB();

    const requestNumber = params.requestNumber;

    if (!requestNumber) {
      return NextResponse.json(
        { error: 'Request number is required' },
        { status: 400 }
      );
    }

    const passRequest = await PassRequest.findOne({ requestNumber });

    if (!passRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        requestNumber: passRequest.requestNumber,
        fullName: passRequest.fullName,
        email: passRequest.email,
        status: passRequest.status,
        rejectionReason: passRequest.rejectionReason,
        submittedAt: passRequest.submittedAt,
        approvedAt: passRequest.approvedAt,
        rejectedAt: passRequest.rejectedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching pass request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pass request' },
      { status: 500 }
    );
  }
}
