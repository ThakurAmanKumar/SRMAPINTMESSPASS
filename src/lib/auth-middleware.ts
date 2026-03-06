import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * Middleware to verify JWT token on protected API routes
 * Usage: const payload = await verifyAuth(request);
 */
export async function verifyAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  return {
    valid: true,
    payload,
  };
}
