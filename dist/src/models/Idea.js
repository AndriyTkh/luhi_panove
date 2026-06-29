"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idea = void 0;
const mongoose_1 = require("mongoose");
const RankingSchema = new mongoose_1.Schema({
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
}, { _id: false });
const IterationSchema = new mongoose_1.Schema({
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
}, { _id: false });
const IdeaSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    iterations: {
        type: [IterationSchema],
        required: true,
        validate: {
            validator: (v) => v.length >= 1,
            message: 'Idea must have at least one iteration',
        },
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
            ret._id = ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
exports.Idea = (0, mongoose_1.model)('Idea', IdeaSchema);
//# sourceMappingURL=Idea.js.map