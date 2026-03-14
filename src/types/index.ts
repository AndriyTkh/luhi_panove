import { Request } from 'express';
import { ObjectId } from 'mongoose';

// ============================================================================
// Core Data Models
// ============================================================================

/**
 * User interface representing guest users identified by IP
 */
export interface User {
  _id: ObjectId;
  guestId?: string;  // UUID for cookie-based identification
  ip: string;        // User's IP address
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ranking interface for idea evaluation metrics (0-100 scale)
 */
export interface Ranking {
  originality: number;      // 0-100: originality of the idea
  difficulty: number;       // 0-100: implementation difficulty
  marketPotential: number;  // 0-100: market potential
  scalability: number;      // 0-100: scalability potential
}

/**
 * Iteration interface representing a version of an idea
 */
export interface Iteration {
  version: number;          // Sequential version number (1, 2, 3...)
  title: string;            // Idea title
  description: string;      // Idea description
  plan: string[];           // Array of plan steps
  ranking: Ranking;         // Evaluation metrics
  createdAt: Date;          // Creation timestamp
}

/**
 * Idea interface representing user ideas with multiple iterations
 */
export interface Idea {
  _id: ObjectId;
  userId: ObjectId;         // Reference to User
  iterations: Iteration[];  // Array of iterations (minimum 1)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GlobalIdea interface representing daily inspiration ideas
 */
export interface GlobalIdea {
  _id: ObjectId;
  date: Date;               // Unique date for the idea
  title: string;            // Global idea title
  description: string;      // Global idea description
  examples: string[];       // Array of example applications
  createdAt: Date;
}

// ============================================================================
// Request Payloads
// ============================================================================

/**
 * Request payload for creating a new idea
 */
export interface CreateIdeaRequest {
  title: string;
  description: string;
}

/**
 * Request payload for editing an existing iteration
 */
export interface EditIterationRequest {
  title?: string;
  description?: string;
  plan?: string[];
}

/**
 * Request payload for creating a global idea
 */
export interface CreateGlobalIdeaRequest {
  title: string;
  description: string;
  examples: string[];
}

// ============================================================================
// Response Payloads
// ============================================================================

/**
 * Response payload for iteration data
 */
export interface IterationResponse {
  version: number;
  title: string;
  description: string;
  plan: string[];
  ranking: Ranking;
  createdAt: string;        // ISO date string
}

/**
 * Response payload for idea data
 */
export interface IdeaResponse {
  id: string;
  userId: string;
  iterations: IterationResponse[];
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

/**
 * Response payload for global idea data
 */
export interface GlobalIdeaResponse {
  title: string;
  description: string;
  examples: string[];
}

/**
 * Response payload for error messages
 */
export interface ErrorResponse {
  message: string;
  statusCode?: number;
}

/**
 * Response payload for user data
 */
export interface UserResponse {
  id: string;
  guestId?: string;
  ip: string;
  createdAt: string;
}

// ============================================================================
// Extended Request Types
// ============================================================================

/**
 * Extended Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}

// ============================================================================
// Service Layer Types
// ============================================================================

/**
 * Improved idea structure returned by AI service
 */
export interface ImprovedIdea {
  title: string;
  description: string;
  plan: string[];
  ranking: Ranking;
}
