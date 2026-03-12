import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided', valid: false },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', valid: false },
        { status: 401 }
      );
    }

    // Verify email exists in payload
    if (!payload.email) {
      return NextResponse.json(
        { error: 'Invalid token payload', valid: false },
        { status: 401 }
      );
    }

    // Check if user is admin in database
    let isAdmin = false;
    try {
      await connectDB();
      const admin = await Admin.findOne({ email: payload.email });
      isAdmin = !!admin;
    } catch (dbError) {
      console.error('Database error during admin check:', dbError);
      // If database fails, deny access (fail-safe approach)
      return NextResponse.json(
        { error: 'Failed to verify admin status', valid: false },
        { status: 500 }
      );
    }

    // If not an admin, reject access
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'User is not an authorized admin', valid: false, isAdmin: false },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        valid: true, 
        email: payload.email,
        userId: payload.id,
        isAdmin: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}
