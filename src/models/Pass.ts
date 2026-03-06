import mongoose, { Schema, Document } from 'mongoose';

export interface IPass extends Document {
  issueId: string;
  fullName: string;
  regNumber: string;
  photoUrl: string;
  issuedDate: Date;
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pass || mongoose.model<IPass>('Pass', PassSchema);
