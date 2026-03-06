import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pass from '@/models/Pass';
import PassRequest from '@/models/PassRequest';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

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

    // Total passes
    const totalPasses = await Pass.countDocuments();

    // Today's passes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPasses = await Pass.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Total students (same as total passes since each pass is unique per student)
    const totalStudents = totalPasses;

    // Get last 7 days data for graphs
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayStart = date;
      const dayEnd = nextDate;

      const passesCount = await Pass.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      const requestsCount = await PassRequest.countDocuments({
        submittedAt: { $gte: dayStart, $lt: dayEnd }
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        passes: passesCount,
        requests: requestsCount
      });
    }

    // Get request status breakdown for candlestick-like chart
    const pendingCount = await PassRequest.countDocuments({ status: 'pending' });
    const approvedCount = await PassRequest.countDocuments({ status: 'approved' });
    const rejectedCount = await PassRequest.countDocuments({ status: 'rejected' });

    // Get hourly distribution for today
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);

      const hourlyPasses = await Pass.countDocuments({
        createdAt: { $gte: hourStart, $lt: hourEnd }
      });

      hourlyData.push({
        hour: `${hour}:00`,
        passes: hourlyPasses
      });
    }

    return NextResponse.json(
      {
        totalPasses,
        todaysPasses,
        totalStudents,
        last7Days,
        pendingCount,
        approvedCount,
        rejectedCount,
        hourlyData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
