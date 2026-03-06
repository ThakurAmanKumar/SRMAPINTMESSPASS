import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: 'login' | 'password-reset';
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['login', 'password-reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for email and type
OTPSchema.index({ email: 1, type: 1 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
