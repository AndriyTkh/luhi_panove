# Design Document: Hackathon Backend API

## Overview

Hackathon Backend API - це RESTful сервіс, побудований на Node.js + TypeScript + Express, який надає функціональність для управління ідеями користувачів з інтеграцією штучного інтелекту. Система дозволяє користувачам створювати ідеї, покращувати їх через Gemini AI, зберігати множинні ітерації кожної ідеї, та отримувати натхнення через глобальні ідеї дня.

Ключові можливості:
- Автоматична аутентифікація гостьових користувачів за IP-адресою
- CRUD операції для ідей користувачів
- AI-покращення ідей через Gemini API з автоматичним рейтингуванням
- Система версіонування ідей (iterations)
- Публічні глобальні ідеї дня для натхнення
- Повна типізація через TypeScript

Технологічний стек:
- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript (strict mode)
- Database: MongoDB з Mongoose ODM
- Authentication: IP-based guest user auto-creation з guestId cookies
- AI Integration: Google Generative AI (@google/generative-ai)

## Architecture

Система побудована за класичною трирівневою архітектурою:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│              (Web/Mobile Applications)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST (IP + guestId cookie)
┌────────────────────▼────────────────────────────────────┐
│                  API Layer (Express)                     │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │    Ideas     │  │   Global     │                     │
│  │    Routes    │  │   Routes     │                     │
│  └──────┬───────┘  └──────┬───────┘                     │
│         │                  │                             │
│  ┌──────▼──────────────────▼───────────────────────┐    │
│  │  Auto-Identify Middleware (IP + guestId)        │    │
│  │  - Extract IP from req.ip / x-forwarded-for     │    │
│  │  - Check guestId cookie                         │    │
│  │  - Find or create Guest User                    │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │    Idea      │  │   Gemini     │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────┐
│                  Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Guest User   │  │     Idea     │  │  GlobalIdea  │  │
│  │    Model     │  │    Model     │  │    Model     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────▼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    └─────────────────┘
```

### Архітектурні принципи:

1. **Separation of Concerns**: Чітке розділення на routes (HTTP handling), services (business logic), та models (data access)

2. **Middleware Pipeline**: Використання Express middleware для cross-cutting concerns (authentication, error handling, logging)

3. **Dependency Injection**: Services отримують залежності через конструктор для тестованості

4. **Type Safety**: Повна типізація через TypeScript interfaces та strict compiler options

5. **External Service Isolation**: Gemini AI інтеграція ізольована в окремий service для легкої заміни або mock'ування

## Components and Interfaces

### 1. Authentication Components

#### AuthService
```typescript
interface AuthService {
  // Знаходить або створює гостьового користувача за IP та опціональним guestId
  findOrCreateGuestUser(ip: string, guestId?: string): Promise<User>;
  
  // Генерує унікальний guestId (UUID)
  generateGuestId(): string;
  
  // Екстрагує IP адресу з request
  extractIpAddress(req: Request): string;
}
```

#### AuthMiddleware
```typescript
interface AuthMiddleware {
  // Автоматично ідентифікує або створює користувача за IP/guestId
  autoIdentifyUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```

### 2. Idea Management Components

#### IdeaController
```typescript
interface IdeaController {
  // Створює нову ідею
  createIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
  
  // Отримує всі ідеї користувача
  getUserIdeas(req: AuthenticatedRequest, res: Response): Promise<void>;
  
  // Отримує конкретну ідею за ID
  getIdeaById(req: AuthenticatedRequest, res: Response): Promise<void>;
  
  // Видаляє ідею
  deleteIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
  
  // Покращує ідею через AI
  improveIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
  
  // Редагує конкретну ітерацію
  editIteration(req: AuthenticatedRequest, res: Response): Promise<void>;
}
```

#### IdeaService
```typescript
interface IdeaService {
  // Створює ідею з початковою ітерацією
  createIdea(userId: string, title: string, description: string): Promise<Idea>;
  
  // Отримує всі ідеї користувача
  getUserIdeas(userId: string): Promise<Idea[]>;
  
  // Отримує ідею за ID з перевіркою власника
  getIdeaById(ideaId: string, userId: string): Promise<Idea>;
  
  // Видаляє ідею з перевіркою власника
  deleteIdea(ideaId: string, userId: string): Promise<void>;
  
  // Додає нову ітерацію до ідеї
  addIteration(ideaId: string, iteration: Iteration): Promise<Idea>;
  
  // Оновлює існуючу ітерацію
  updateIteration(ideaId: string, version: number, updates: Partial<Iteration>): Promise<Idea>;
}
```

### 3. AI Integration Components

#### GeminiService
```typescript
interface GeminiService {
  // Покращує ідею через Gemini AI
  improveIdea(currentIteration: Iteration): Promise<ImprovedIdea>;
  
  // Генерує рейтинг для ідеї
  generateRanking(title: string, description: string, plan: string[]): Promise<Ranking>;
  
  // Форматує prompt для AI
  formatPrompt(iteration: Iteration): string;
  
  // Парсить відповідь від AI
  parseAIResponse(response: string): ImprovedIdea;
}

interface ImprovedIdea {
  title: string;
  description: string;
  plan: string[];
  ranking: Ranking;
}
```

### 4. Global Idea Components

#### GlobalIdeaController
```typescript
interface GlobalIdeaController {
  // Отримує ідею дня (публічний endpoint)
  getGlobalIdea(req: Request, res: Response): Promise<void>;
  
  // Створює нову глобальну ідею (admin only)
  createGlobalIdea(req: Request, res: Response): Promise<void>;
}
```

#### GlobalIdeaService
```typescript
interface GlobalIdeaService {
  // Отримує ідею для поточної дати
  getIdeaForDate(date: Date): Promise<GlobalIdea | null>;
  
  // Створює нову глобальну ідею
  createGlobalIdea(title: string, description: string, examples: string[]): Promise<GlobalIdea>;
}
```

### 5. Error Handling

#### ErrorHandler
```typescript
interface ErrorHandler {
  // Централізований обробник помилок
  handleError(err: Error, req: Request, res: Response, next: NextFunction): void;
}

interface ApiError extends Error {
  statusCode: number;
  message: string;
}

// Типи помилок
class ValidationError extends ApiError { statusCode = 400; }
class AuthorizationError extends ApiError { statusCode = 403; }
class NotFoundError extends ApiError { statusCode = 404; }
class RateLimitError extends ApiError { statusCode = 429; }
class ServerError extends ApiError { statusCode = 500; }
```

## Data Models

### User Model

```typescript
interface User {
  _id: ObjectId;
  ip: string;              // IP адреса користувача
  guestId?: string;        // Опціональний UUID з cookie
  createdAt: Date;         // Дата створення
  updatedAt: Date;         // Дата останнього оновлення
}

// Mongoose Schema
const UserSchema = new Schema({
  ip: { type: String, required: true, index: true },
  guestId: { type: String, index: true },
}, { timestamps: true });
```

### Idea Model

```typescript
interface Idea {
  _id: ObjectId;
  userId: ObjectId;        // Посилання на User
  iterations: Iteration[]; // Масив версій ідеї (мінімум 1)
  createdAt: Date;
  updatedAt: Date;
}

interface Iteration {
  version: number;         // Послідовний номер версії (1, 2, 3...)
  title: string;           // Назва ідеї
  description: string;     // Опис ідеї
  plan: string[];          // Масив кроків плану
  ranking: Ranking;        // Оцінка ідеї
  createdAt: Date;         // Дата створення ітерації
}

interface Ranking {
  originality: number;     // 0-100: оригінальність ідеї
  difficulty: number;      // 0-100: складність реалізації
  marketPotential: number; // 0-100: ринковий потенціал
  scalability: number;     // 0-100: масштабованість
}

// Mongoose Schema
const RankingSchema = new Schema({
  originality: { type: Number, required: true, min: 0, max: 100 },
  difficulty: { type: Number, required: true, min: 0, max: 100 },
  marketPotential: { type: Number, required: true, min: 0, max: 100 },
  scalability: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const IterationSchema = new Schema({
  version: { type: Number, required: true, min: 1 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  plan: [{ type: String }],
  ranking: { type: RankingSchema, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const IdeaSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  iterations: {
    type: [IterationSchema],
    required: true,
    validate: {
      validator: (v: Iteration[]) => v.length >= 1,
      message: 'Idea must have at least one iteration'
    }
  },
}, { timestamps: true });
```

### GlobalIdea Model

```typescript
interface GlobalIdea {
  _id: ObjectId;
  date: Date;              // Дата ідеї (унікальна)
  title: string;           // Назва ідеї дня
  description: string;     // Опис ідеї
  examples: string[];      // Приклади застосування
  createdAt: Date;
}

// Mongoose Schema
const GlobalIdeaSchema = new Schema({
  date: { type: Date, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  examples: [{ type: String }],
}, { timestamps: true });
```

### Request/Response Types

```typescript
// Request payloads
interface CreateIdeaRequest {
  title: string;
  description: string;
}

interface EditIterationRequest {
  title?: string;
  description?: string;
  plan?: string[];
}

// Response payloads
interface IdeaResponse {
  id: string;
  userId: string;
  iterations: IterationResponse[];
  createdAt: string;
  updatedAt: string;
}

interface IterationResponse {
  version: number;
  title: string;
  description: string;
  plan: string[];
  ranking: Ranking;
  createdAt: string;
}

interface ErrorResponse {
  message: string;
  statusCode?: number;
}

interface GlobalIdeaResponse {
  title: string;
  description: string;
  examples: string[];
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

#### Property 1: Guest User Auto-Creation from IP

*For any* request with an IP address and no existing User record with that IP, the system should automatically create a new User with the extracted IP address and current timestamp as createdAt.

**Validates: Requirements 1.1, 1.2, 1.3**

#### Property 2: Guest User Lookup by GuestId Cookie

*For any* request containing a guestId cookie, the system should search for a User by guestId first before falling back to IP-based lookup.

**Validates: Requirements 1.4**

#### Property 3: GuestId Generation and Cookie Setting

*For any* request without a guestId cookie, the system should generate a UUID as guestId, set it in a signed cookie, and associate it with the User record.

**Validates: Requirements 1.5**

#### Property 4: User Attachment to Request

*For any* request after authentication middleware processing, the request object should contain the identified or newly created User information for subsequent processing.

**Validates: Requirements 1.6**

#### Property 5: IP Address Extraction

*For any* incoming request, the system should successfully extract the IP address from either req.ip or the x-forwarded-for header.

**Validates: Requirements 1.1**

#### Property 6: GuestId Update for Existing IP Users

*For any* existing User record found by IP that has no guestId, when a new guestId is generated, the system should update that User record with the generated guestId.

**Validates: Requirements 2.5**

### Idea Management Properties

#### Property 7: Idea Creation with Initial Iteration

*For any* authenticated user providing a valid title and description, creating an idea should produce a new Idea record associated with that user's userId, containing exactly one Iteration with version 1, the provided title and description, an empty plan array, default ranking values (all fields 0-100), and status code 201 in the response.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

#### Property 8: User Ideas Retrieval

*For any* authenticated user, requesting their ideas list should return exactly the set of Ideas where userId matches the authenticated user's ID, and no Ideas belonging to other users.

**Validates: Requirements 4.1**

#### Property 9: Authorized Idea Access

*For any* Idea that belongs to the authenticated user, requesting it by ID should successfully return the complete Idea object with all iterations.

**Validates: Requirements 4.2**

#### Property 10: Idea Ownership Protection

*For any* Idea that does not belong to the authenticated user, attempting to retrieve, update, or delete it should fail with status code 403.

**Validates: Requirements 4.3, 5.2, 7.4**

#### Property 11: Non-Existent Resource Returns 404

*For any* non-existent Idea ID or iteration version number, attempting to access or modify it should return status code 404 with an error message.

**Validates: Requirements 4.4, 7.3**

#### Property 12: Idea Deletion Removes from Database

*For any* Idea owned by the authenticated user, successfully deleting it should remove the Idea from the database and return status code 204.

**Validates: Requirements 5.1, 5.3**

### AI Improvement Properties

#### Property 13: AI Improvement Creates New Iteration

*For any* Idea with n iterations, requesting AI improvement should send the latest iteration (version n) to Gemini AI and, upon successful response, create a new iteration with version n+1 containing the improved title, description, plan, and AI-generated ranking values.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

#### Property 14: AI Improvement Returns Complete Idea

*For any* successful AI improvement request, the response should include the complete updated Idea object containing all iterations (both old and new).

**Validates: Requirements 6.6**

#### Property 15: AI Service Failure Returns 500

*For any* Gemini AI request that fails (network error, API error, timeout), the API should return status code 500 with a descriptive error message.

**Validates: Requirements 6.5**

#### Property 16: AI Rate Limit Returns 429

*For any* Gemini AI request that fails due to rate limiting, the API should return status code 429.

**Validates: Requirements 12.4**

#### Property 17: AI Prompt Contains Iteration Data

*For any* iteration being improved, the prompt sent to Gemini AI should include the iteration's title, description, and plan.

**Validates: Requirements 12.2**

#### Property 18: AI Response Parsing Structure

*For any* successful Gemini AI response, parsing should produce a structured object containing title (string), description (string), plan (array of strings), and ranking (object with originality, difficulty, marketPotential, scalability as numbers 0-100).

**Validates: Requirements 12.3**

### Iteration Editing Properties

#### Property 19: Iteration Update Modifies Fields

*For any* existing iteration in an Idea owned by the authenticated user, updating it with new title, description, or plan values should modify only those specified fields while preserving all other data.

**Validates: Requirements 7.1**

#### Property 20: Iteration Update Preserves Immutable Fields

*For any* iteration update, the version number and createdAt timestamp should remain unchanged after the update.

**Validates: Requirements 7.2**

### Global Idea Properties

#### Property 21: Global Idea Retrieval for Date

*For any* date that has a Global_Idea record, requesting the global idea should return an object containing title, description, and examples array.

**Validates: Requirements 8.1, 8.2**

#### Property 22: Missing Global Idea Returns 404

*For any* date that does not have a Global_Idea record, requesting the global idea should return status code 404.

**Validates: Requirements 8.3**

#### Property 23: Global Idea Public Access

*For any* request to the /global-idea endpoint, the system should allow access without requiring authentication (both authenticated and unauthenticated requests should succeed if a global idea exists).

**Validates: Requirements 8.4**

#### Property 24: Auto-Identification Always Succeeds

*For any* request to any endpoint, the auto-identification middleware should always successfully identify or create a user and never reject the request with authentication errors.

**Validates: Requirements 9.1, 9.5, 9.6**

### Data Integrity Properties

#### Property 25: Idea Has At Least One Iteration

*For any* Idea record in the database, it should contain at least one Iteration in its iterations array.

**Validates: Requirements 10.1**

#### Property 26: Iteration Structure Completeness

*For any* Iteration in the database, it should contain all required fields: version (positive integer), title (string), description (string), plan (array), ranking (object with originality, difficulty, marketPotential, scalability as numbers 0-100), and createdAt (Date).

**Validates: Requirements 10.2**

#### Property 27: Iteration CreatedAt Auto-Generation

*For any* newly created Iteration, the createdAt field should be automatically set to the current timestamp without requiring explicit input.

**Validates: Requirements 10.3**

#### Property 28: Sequential Version Numbers

*For any* Idea with multiple iterations, the version numbers should form a sequential series starting from 1 (i.e., 1, 2, 3, ..., n) with no gaps or duplicates.

**Validates: Requirements 10.4**

### Error Handling Properties

#### Property 29: Consistent Error Response Format

*For any* error condition (validation, authorization, not found, server error), the API should return a JSON response with a message field and the appropriate HTTP status code: 400 for validation errors, 403 for authorization errors, 404 for not found errors, and 500 for server errors.

**Validates: Requirements 11.1, 11.3, 11.4, 11.5, 11.6**

### Configuration Properties

#### Property 30: Required Environment Variables Loading

*For any* API startup, all required configuration values (MongoDB connection string, Gemini AI API key, cookie secret for guestId signing, and session secret) should be loaded from environment variables.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

#### Property 31: Missing Configuration Prevents Startup

*For any* missing required environment variable, the API should fail to start and display a descriptive error message indicating which variable is missing.

**Validates: Requirements 13.5**

## Error Handling

### Error Classification

Система використовує стандартну класифікацію HTTP помилок:

1. **400 Bad Request**: Validation errors
   - Missing required fields
   - Invalid data types
   - Invalid data formats
   - Business rule violations

2. **403 Forbidden**: Authorization errors
   - Attempting to access another user's ideas
   - Attempting to modify another user's ideas
   - Attempting to delete another user's ideas

3. **404 Not Found**: Resource not found errors
   - Non-existent Idea ID
   - Non-existent iteration version
   - No Global Idea for requested date

4. **429 Too Many Requests**: Rate limiting errors
   - Gemini AI rate limit exceeded

5. **500 Internal Server Error**: Server errors
   - Database connection failures
   - Gemini AI service failures
   - Unexpected runtime errors

### Error Response Format

Всі помилки повертаються в консистентному JSON форматі:

```typescript
{
  "message": "Descriptive error message",
  "statusCode": 400 // Optional, matches HTTP status
}
```

### Error Handling Strategy

1. **Validation Layer**: Express-validator middleware перевіряє вхідні дані перед обробкою
2. **Service Layer**: Business logic викидає типізовані помилки (ValidationError, AuthorizationError, etc.)
3. **Error Middleware**: Централізований error handler перехоплює всі помилки та форматує відповіді
4. **Logging**: Всі помилки логуються з контекстом для debugging

### Timeout Handling

- Gemini AI requests: 30 second timeout
- Database operations: Default Mongoose timeout (30 seconds)
- HTTP requests: Express default timeout (2 minutes)

При timeout'ах система повертає 500 з повідомленням про перевищення часу очікування.

## Testing Strategy

### Dual Testing Approach

Система тестування використовує два комплементарні підходи:

1. **Unit Tests**: Перевіряють конкретні приклади, edge cases та error conditions
2. **Property-Based Tests**: Перевіряють універсальні властивості на множині згенерованих входів

Обидва типи тестів необхідні для повного покриття: unit tests виявляють конкретні баги, property tests верифікують загальну коректність.

### Property-Based Testing Configuration

**Library**: fast-check (для TypeScript/Node.js)

**Configuration**:
- Minimum 100 iterations per property test (через randomization)
- Each property test references its design document property
- Tag format: `Feature: hackathon-backend-api, Property {number}: {property_text}`

**Example**:
```typescript
import fc from 'fast-check';

// Feature: hackathon-backend-api, Property 1: Guest User Auto-Creation from IP
test('guest user auto-creation from IP', () => {
  fc.assert(
    fc.property(
      fc.ipV4(),
      async (ip) => {
        // Test that a request with an IP creates a user if none exists
        const user = await authService.findOrCreateGuestUser(ip);
        expect(user.ip).toBe(ip);
        expect(user.createdAt).toBeDefined();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Focus Areas

Unit tests повинні зосередитися на:

1. **Specific Examples**: Демонстрація правильної поведінки на конкретних прикладах
   - Creating an idea with specific title/description
   - Auto-identifying user from specific IP address
   - Editing specific iteration

2. **Edge Cases**:
   - Empty arrays and strings
   - Boundary values (ranking 0 and 100)
   - Maximum length strings
   - Special characters in text fields
   - IPv4 vs IPv6 addresses
   - Missing or malformed x-forwarded-for headers
   - Gemini AI timeout (30 seconds)

3. **Integration Points**:
   - MongoDB connection and queries
   - IP address extraction from various sources
   - Cookie handling (guestId)
   - Gemini AI API calls
   - Express middleware chain

4. **Error Conditions**:
   - Invalid input validation
   - Authorization failures
   - Database errors
   - External service failures

### Test Organization

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── idea.controller.test.ts
│   │   └── globalIdea.controller.test.ts
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── idea.service.test.ts
│   │   └── gemini.service.test.ts
│   ├── middleware/
│   │   └── auth.middleware.test.ts
│   └── models/
│       ├── user.model.test.ts
│       ├── idea.model.test.ts
│       └── globalIdea.model.test.ts
└── properties/
    ├── authentication.properties.test.ts
    ├── ideaManagement.properties.test.ts
    ├── aiImprovement.properties.test.ts
    ├── dataIntegrity.properties.test.ts
    ├── errorHandling.properties.test.ts
    └── configuration.properties.test.ts
```

### Mocking Strategy

1. **MongoDB**: Use mongodb-memory-server for in-memory database during tests
2. **IP Address Extraction**: Mock Express request objects with various IP configurations
3. **Gemini AI**: Mock @google/generative-ai responses with predefined data
4. **Environment Variables**: Use dotenv for test-specific configuration
5. **Cookies**: Mock cookie-parser and signed cookie handling

### Coverage Goals

- Line coverage: >80%
- Branch coverage: >75%
- Function coverage: >85%
- Property tests: 100% of correctness properties implemented

### Continuous Integration

Tests повинні виконуватися:
- On every commit (pre-commit hook)
- On every pull request
- Before deployment to staging/production
- Nightly full test suite with extended property test iterations (1000+ runs)

