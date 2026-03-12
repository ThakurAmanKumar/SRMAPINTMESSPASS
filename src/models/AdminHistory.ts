import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminHistory extends Document {
  adminEmail: string;
  actionType: 'DELETE_PASS' | 'DELETE_REQUEST' | 'REVOKE_PASS' | 'APPROVE_REQUEST' | 'REJECT_REQUEST' | 'CREATE_ADMIN' | 'DELETE_ADMIN' | 'UPDATE_ADMIN' | 'OTHER';
  actionDetails: string;
  targetId?: string;
  targetType?: 'PASS' | 'REQUEST' | 'ADMIN' | 'OTHER';
  status: 'SUCCESS' | 'FAILED';
  ipAddress?: string;
  createdAt: Date;
}

const AdminHistorySchema = new Schema<IAdminHistory>(
  {
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['DELETE_PASS', 'DELETE_REQUEST', 'REVOKE_PASS', 'APPROVE_REQUEST', 'REJECT_REQUEST', 'CREATE_ADMIN', 'DELETE_ADMIN', 'UPDATE_ADMIN', 'OTHER'],
      required: true,
      index: true,
    },
    actionDetails: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    targetType: {
      type: String,
      enum: ['PASS', 'REQUEST', 'ADMIN', 'OTHER'],
      default: 'OTHER',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for date-based queries
AdminHistorySchema.index({ createdAt: -1 });
AdminHistorySchema.index({ adminEmail: 1, createdAt: -1 });
AdminHistorySchema.index({ actionType: 1, createdAt: -1 });

// TTL Index: Auto-delete documents after 28 days (28 * 24 * 60 * 60 = 2419200 seconds)
AdminHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2419200 });

export default mongoose.models.AdminHistory || mongoose.model<IAdminHistory>('AdminHistory', AdminHistorySchema);
