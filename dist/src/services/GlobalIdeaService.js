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
     * Convert Date → YYYY-MM-DD
     */
    formatDate(date) {
        return date.toISOString().slice(0, 10);
    }
    /**
     * Get global idea for a specific date
     * Requirements: 8.1, 8.2
     */
    async getIdeaForDate(date) {
        const formattedDate = this.formatDate(date);
        const globalIdea = await GlobalIdea_1.GlobalIdea.findOne({
            date: formattedDate,
        });
        return globalIdea;
    }
    /**
     * Create a new global idea
     * Requirements: 8.1, 8.2
     */
    async createGlobalIdea(title, description, examples) {
        const date = this.formatDate(new Date());
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