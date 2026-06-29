"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GlobalIdeaController_1 = require("../controllers/GlobalIdeaController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const globalIdeaController = new GlobalIdeaController_1.GlobalIdeaController();
/**
 * GET /global-idea
 * Get global idea for current date (public endpoint - no authentication required)
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
router.get('/', (req, res, next) => {
    globalIdeaController.getGlobalIdea(req, res).catch(next);
});
/**
 * POST /global-idea
 * Create a new global idea (optional - for admin use)
 * Requirements: 8.1, 8.2
 */
router.post('/', validation_1.validateCreateGlobalIdea, (req, res, next) => {
    globalIdeaController.createGlobalIdea(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=globalIdea.js.map