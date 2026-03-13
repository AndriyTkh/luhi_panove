import { Schema, model, Document, Types } from 'mongoose';

// Ranking interface and schema
export interface IRanking {
  originality: number;
  difficulty: number;
  marketPotential: number;
  scalability: number;
}

const RankingSchema = new Schema<IRanking>(
  {
    originality: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    marketPotential: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scalability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

// Iteration interface and schema
export interface IIteration {
  version: number;
  title: string;
  description: string;
  plan: string[];
  ranking: IRanking;
  createdAt: Date;
}

const IterationSchema = new Schema<IIteration>(
  {
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    plan: [
      {
        type: String,
      },
    ],
    ranking: {
      type: RankingSchema,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Idea interface and schema
export interface IIdea extends Document {
  userId: Types.ObjectId;
  iterations: IIteration[];
  createdAt: Date;
  updatedAt: Date;
}

const IdeaSchema = new Schema<IIdea>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    iterations: {
      type: [IterationSchema],
      required: true,
      validate: {
        validator: (v: IIteration[]) => v.length >= 1,
        message: 'Idea must have at least one iteration',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret._id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Idea = model<IIdea>('Idea', IdeaSchema);
