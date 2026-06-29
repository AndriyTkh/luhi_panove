"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ideaRoutes = exports.authRoutes = void 0;
// Routes will be exported from here
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_1).default; } });
var ideas_1 = require("./ideas");
Object.defineProperty(exports, "ideaRoutes", { enumerable: true, get: function () { return __importDefault(ideas_1).default; } });
//# sourceMappingURL=index.js.map