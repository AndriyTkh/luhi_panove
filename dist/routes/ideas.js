"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IdeaController_1 = require("../controllers/IdeaController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const ideaController = new IdeaController_1.IdeaController();
/**
 * POST /ideas
 * Create a new idea with initial iteration
 * Requirements: 3.1, 3.4
 * Note: Auth middleware is applied globally in app.ts
 */
router.post('/', validation_1.validateCreateIdea, (req, res, next) => {
    ideaController.createIdea(req, res).catch(next);
});
/**
 * GET /ideas
 * Get all ideas for the authenticated user
 * Requirements: 4.1
 * Note: Auth middleware is applied globally in app.ts
 */
router.get('/', (req, res, next) => {
    ideaController.getUserIdeas(req, res).catch(next);
});
/**
 * GET /ideas/:id
 * Get a specific idea by ID
 * Requirements: 4.2
 * Note: Auth middleware is applied globally in app.ts
 */
router.get('/:id', validation_1.validateIdeaId, (req, res, next) => {
    ideaController.getIdeaById(req, res).catch(next);
});
/**
 * DELETE /ideas/:id
 * Delete an idea
 * Requirements: 5.1, 5.3
 * Note: Auth middleware is applied globally in app.ts
 */
router.delete('/:id', validation_1.validateIdeaId, (req, res, next) => {
    ideaController.deleteIdea(req, res).catch(next);
});
/**
 * POST /ideas/:id/improve
 * Improve an idea using Gemini AI
 * Requirements: 6.1, 6.6
 * Note: Auth middleware is applied globally in app.ts
 */
router.post('/:id/improve', validation_1.validateIdeaId, (req, res, next) => {
    ideaController.improveIdea(req, res).catch(next);
});
/**
 * PATCH /ideas/:id/iterations/:version
 * Edit a specific iteration of an idea
 * Requirements: 7.1
 * Note: Auth middleware is applied globally in app.ts
 */
router.patch('/:id/iterations/:version', validation_1.validateEditIteration, (req, res, next) => {
    ideaController.editIteration(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=ideas.js.map