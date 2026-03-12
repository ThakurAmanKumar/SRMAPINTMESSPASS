/**
 * Generate a random 6-digit OTP (One Time Password)
 * @returns A 6-digit OTP as a string
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
