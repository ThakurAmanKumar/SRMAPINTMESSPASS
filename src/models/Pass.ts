import mongoose, { Schema, Document } from 'mongoose';

export interface IPass extends Document {
  issueId: string;
  fullName: string;
  regNumber: string;
  photoUrl: string;
  issuedDate: Date;
  authorizationText?: string;
  status: 'approved' | 'revoked';
  createdAt: Date;
}

const PassSchema = new Schema<IPass>(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    regNumber: {
      type: String,
      required: true,
      unique: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    authorizationText: {
      type: String,
      default: 'As per verification by the International Mess Committee, SRM University-AP, the bearer of this pass is authorized to access and use the services of the International Mess.',
    },
    status: {
      type: String,
      enum: ['approved', 'revoked'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pass || mongoose.model<IPass>('Pass', PassSchema);
