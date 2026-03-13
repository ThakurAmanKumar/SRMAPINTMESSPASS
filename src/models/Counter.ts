import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  value: number;
}

const CounterSchema = new Schema<ICounter>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  value: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
