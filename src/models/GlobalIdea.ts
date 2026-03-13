import { Schema, model, Document } from 'mongoose';

export interface IGlobalIdea extends Document {
  date: string;
  title: string;
  description: string;
  examples: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GlobalIdeaSchema = new Schema<IGlobalIdea>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    examples: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const GlobalIdea = model<IGlobalIdea>('GlobalIdea', GlobalIdeaSchema);
