import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, registrationNumber } = body;

    // Validate required fields
    if (!fullName || !registrationNumber) {
      return NextResponse.json(
        { error: 'fullName and registrationNumber are required' },
        { status: 400 }
      );
    }

    // Send admin notification email
    await sendAdminNotification(fullName, registrationNumber);

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
