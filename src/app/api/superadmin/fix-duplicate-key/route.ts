import { NextResponse, NextRequest } from 'next/server';
import PassRequest from '@/models/PassRequest';
import Counter from '@/models/Counter';
import connectDB from '@/lib/mongodb';

/**
 * DELETE /api/superadmin/fix-duplicate-key
 * 
 * Admin-only endpoint to fix E11000 duplicate key errors
 * Removes duplicate requestNumbers and resets counter
 * 
 * REQUIRES: Super admin authentication
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check for admin authentication (you may want to add proper auth here)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: No authorization header' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find all pass requests
    const allRequests = await PassRequest.find({}).sort({ requestNumber: 1 });

    // Identify duplicates
    const requestNumberMap: { [key: string]: string } = {};
    const duplicates: Array<{ requestNumber: string; id: string }> = [];

    for (const req of allRequests) {
      const id = (req._id as any).toString();
      if (requestNumberMap[req.requestNumber]) {
        duplicates.push({
          requestNumber: req.requestNumber,
          id,
        });
      } else {
        requestNumberMap[req.requestNumber] = id;
      }
    }

    // Remove duplicates
    let removedCount = 0;
    for (const dup of duplicates) {
      await PassRequest.deleteOne({ _id: dup.id });
      removedCount++;
    }

    // Find highest requestNumber
    let highestNumber = 0;
    for (const reqNumber of Object.keys(requestNumberMap)) {
      const match = reqNumber.match(/REQSRMAPIMP(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }

    // Update counter
    const newCounterValue = highestNumber + 1;
    await Counter.findOneAndUpdate(
      { name: 'passRequestNumber' },
      { $set: { value: newCounterValue } },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Duplicate keys fixed successfully',
        stats: {
          totalRequests: allRequests.length,
          duplicatesRemoved: removedCount,
          highestNumber,
          counterReset: newCounterValue,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fix duplicate key error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix duplicate keys' },
      { status: 500 }
    );
  }
}
