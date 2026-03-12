import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';

/**
 * Middleware to verify Super Admin JWT token on protected API routes
 * Usage: const result = await verifySuperAdminAuth(request);
 */
export async function verifySuperAdminAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      ),
      payload: null,
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
      payload: null,
    };
  }

  // Check if user is SuperAdmin (not Admin)
  if (payload.userType === 'Admin') {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Unauthorized: Only Super Admins can access this resource' },
        { status: 403 }
      ),
      payload: null,
    };
  }

  return {
    valid: true,
    error: null,
    payload,
  };
}

/**
 * Check if a payload is from a Super Admin
 * This is a placeholder - in production, you might want to verify the user's role in DB
 */
export async function isSuperAdmin(email: string): Promise<boolean> {
  // TODO: In production, check if email is in superAdmins collection
  // For now, we rely on JWT being issued correctly
  return true;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : request.headers.get('x-real-ip') || 'unknown';
  return ip.trim();
}
