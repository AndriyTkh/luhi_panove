import { Request } from 'express';
import { ObjectId } from 'mongoose';
/**
 * User interface representing guest users identified by IP
 */
export interface User {
    _id: ObjectId;
    guestId?: string;
    ip: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Ranking interface for idea evaluation metrics (0-100 scale)
 */
export interface Ranking {
    originality: number;
    difficulty: number;
    marketPotential: number;
    scalability: number;
}
/**
 * Iteration interface representing a version of an idea
 */
export interface Iteration {
    version: number;
    title: string;
    description: string;
    plan: string[];
    ranking: Ranking;
    createdAt: Date;
}
/**
 * Idea interface representing user ideas with multiple iterations
 */
export interface Idea {
    _id: ObjectId;
    userId: ObjectId;
    iterations: Iteration[];
    createdAt: Date;
    updatedAt: Date;
}
/**
 * GlobalIdea interface representing daily inspiration ideas
 */
export interface GlobalIdea {
    _id: ObjectId;
    date: Date;
    title: string;
    description: string;
    examples: string[];
    createdAt: Date;
}
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
/**
 * Response payload for iteration data
 */
export interface IterationResponse {
    version: number;
    title: string;
    description: string;
    plan: string[];
    ranking: Ranking;
    createdAt: string;
}
/**
 * Response payload for idea data
 */
export interface IdeaResponse {
    id: string;
    userId: string;
    iterations: IterationResponse[];
    createdAt: string;
    updatedAt: string;
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
/**
 * Extended Express Request with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
    user: User;
}
/**
 * Improved idea structure returned by AI service
 */
export interface ImprovedIdea {
    title: string;
    description: string;
    plan: string[];
    ranking: Ranking;
}
//# sourceMappingURL=index.d.ts.map