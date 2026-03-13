"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalIdea = void 0;
const mongoose_1 = require("mongoose");
const GlobalIdeaSchema = new mongoose_1.Schema({
    date: {
        type: Date,
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
}, {
    timestamps: true,
});
exports.GlobalIdea = (0, mongoose_1.model)('GlobalIdea', GlobalIdeaSchema);
//# sourceMappingURL=GlobalIdea.js.map