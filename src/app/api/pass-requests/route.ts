import { NextRequest, NextResponse } from 'next/server';
import PassRequest from '@/models/PassRequest';
import Counter from '@/models/Counter';
import connectDB from '@/lib/mongodb';
import { sendAdminNotification } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { fullName, registrationNumber, email, photoUrl, reason } = body;

    // Validate required fields
    if (!fullName || !registrationNumber || !email || !photoUrl || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create new pass request with retry logic for duplicate key errors
    let savedRequest;
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        // Generate unique request number using atomic counter
        const counter = await Counter.findOneAndUpdate(
          { name: 'passRequestNumber' },
          { $inc: { value: 1 } },
          { new: true, upsert: true }
        );
        const requestNumber = `REQSRMAPIMP${counter.value}`;

        // Create new pass request
        const passRequest = new PassRequest({
          requestNumber,
          fullName: fullName.trim(),
          registrationNumber: registrationNumber.trim(),
          email: email.trim(),
          photoUrl,
          reason: reason.trim(),
          status: 'pending',
          submittedAt: new Date(),
        });

        savedRequest = await passRequest.save();
        break; // Success, exit retry loop
      } catch (error: any) {
        // Check if it's a duplicate key error
        if (error.code === 11000) {
          retries++;
          if (retries >= maxRetries) {
            throw new Error(
              `Failed to generate unique request number after ${maxRetries} attempts. Please try again.`
            );
          }
          // Continue to next iteration to try again
          continue;
        }
        // If it's not a duplicate key error, throw immediately
        throw error;
      }
    }

    // Send admin notification email (non-blocking)
    try {
      await sendAdminNotification(fullName.trim(), registrationNumber.trim());
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json(
      {
        success: true,
        requestNumber: savedRequest.requestNumber,
        message: 'Pass request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Pass request submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit pass request' },
      { status: 500 }
    );
  }
}
