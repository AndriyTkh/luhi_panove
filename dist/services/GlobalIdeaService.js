"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalIdeaService = void 0;
const GlobalIdea_1 = require("../models/GlobalIdea");
/**
 * GlobalIdeaService handles business logic for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
class GlobalIdeaService {
    /**
     * Get global idea for a specific date
     * Requirements: 8.1, 8.2
     */
    async getIdeaForDate(date) {
        // Normalize date to start of day (00:00:00) for consistent matching
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        // Find global idea for the specified date
        const globalIdea = await GlobalIdea_1.GlobalIdea.findOne({
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });
        return globalIdea;
    }
    /**
     * Create a new global idea
     * Requirements: 8.1, 8.2
     */
    async createGlobalIdea(title, description, examples) {
        // Use current date normalized to start of day
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        const globalIdea = await GlobalIdea_1.GlobalIdea.create({
            date,
            title,
            description,
            examples,
        });
        return globalIdea;
    }
}
exports.GlobalIdeaService = GlobalIdeaService;
//# sourceMappingURL=GlobalIdeaService.js.map