"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    guestId: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
        index: true,
    },
    ip: {
        type: String,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=User.js.map