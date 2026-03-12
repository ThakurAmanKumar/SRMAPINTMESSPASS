import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set. Please define it in your .env.local file.');
  }
  return secret;
})();

interface JWTPayload {
  email: string;
  id: string;
  userType?: string;
}

export function generateToken(payload: JWTPayload, expiresIn: string | number = '24h'): string {
  const options = { expiresIn } as SignOptions;
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
