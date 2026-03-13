import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  guestId?: string;  // UUID for cookie-based identification
  ip: string;        // User's IP address
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    guestId: {
      type: String,
      unique: true,
      sparse: true,  // Allow multiple null values
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
