export interface Ranking {
    originality: number;
    difficulty: number;
    marketPotential: number;
    scalability: number;
    totalScore: number;
}

export interface IdeaIteration {
    version: number;
    title: string;
    description: string;
    plan: string[];
    ranking: Ranking;
    createdAt: string;
}

export interface UserIdea {
    _id: string;
    userId: string;
    title: string;
    description: string;
    iterations: IdeaIteration[];
    createdAt: string;
    updatedAt: string;
}

export interface GlobalIdea {
    _id: string;
    date: string;
    title: string;
    description: string;
    examples: string[];
}