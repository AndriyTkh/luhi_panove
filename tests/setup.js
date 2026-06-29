"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongoServer;
// Mock Gemini AI before all tests
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: jest.fn().mockReturnValue(JSON.stringify({
                                title: 'Improved Idea Title',
                                description: 'This is an improved description with more details and better structure.',
                                plan: [
                                    'Step 1: Research and planning',
                                    'Step 2: Design and prototyping',
                                    'Step 3: Development and testing',
                                    'Step 4: Launch and marketing'
                                ],
                                ranking: {
                                    originality: 75,
                                    difficulty: 60,
                                    marketPotential: 80,
                                    scalability: 70
                                }
                            }))
                        }
                    })
                })
            };
        })
    };
});
// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
    try {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create({
            instance: {
                storageEngine: 'wiredTiger',
            },
        });
        const mongoUri = mongoServer.getUri();
        await mongoose_1.default.connect(mongoUri);
    }
    catch (error) {
        console.error('Failed to start MongoDB Memory Server:', error);
        throw error;
    }
}, 60000); // Increase timeout to 60 seconds
// Clear all test data after each test
afterEach(async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});
// Disconnect and stop MongoDB Memory Server after all tests
afterAll(async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        await mongoose_1.default.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});
//# sourceMappingURL=setup.js.map