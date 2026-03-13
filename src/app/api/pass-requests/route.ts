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

    const savedRequest = await passRequest.save();

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
