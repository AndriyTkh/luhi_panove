import { Document } from 'mongoose';
export interface IGlobalIdea extends Document {
    date: Date;
    title: string;
    description: string;
    examples: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const GlobalIdea: import("mongoose").Model<IGlobalIdea, {}, {}, {}, Document<unknown, {}, IGlobalIdea, {}, {}> & IGlobalIdea & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GlobalIdea.d.ts.map