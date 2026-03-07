import mongoose, { Schema, Document } from 'mongoose';

export interface IPassRequest extends Document {
  requestNumber: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  photoUrl: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  issueId?: string;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

const PassRequestSchema = new Schema<IPassRequest>({
  requestNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.PassRequest || mongoose.model<IPassRequest>('PassRequest', PassRequestSchema);
