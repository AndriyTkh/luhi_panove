const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new idea
 */
export const validateCreateIdea = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
];

/**
 * Validation rules for idea ID parameter
 */
export const validateIdeaId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid idea ID format'),
];

/**
 * Validation rules for editing an iteration
 */
export const validateEditIteration = [
  param('id')
    .isMongoId()
    .withMessage('Invalid idea ID format'),
  param('version')
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('plan')
    .optional()
    .isArray()
    .withMessage('Plan must be an array'),
  body('plan.*')
    .optional()
    .isString()
    .withMessage('Each plan item must be a string'),
];

/**
 * Validation rules for creating a global idea
 */
export const validateCreateGlobalIdea = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('examples')
    .optional()
    .isArray()
    .withMessage('Examples must be an array'),
  body('examples.*')
    .optional()
    .isString()
    .withMessage('Each example must be a string'),
];
