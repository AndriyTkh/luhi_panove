import { Document, Types } from 'mongoose';
export interface IRanking {
    originality: number;
    difficulty: number;
    marketPotential: number;
    scalability: number;
}
export interface IIteration {
    version: number;
    title: string;
    description: string;
    plan: string[];
    ranking: IRanking;
    createdAt: Date;
}
export interface IIdea extends Document {
    userId: Types.ObjectId;
    iterations: IIteration[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Idea: import("mongoose").Model<IIdea, {}, {}, {}, Document<unknown, {}, IIdea, {}, {}> & IIdea & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Idea.d.ts.map