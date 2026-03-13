# Requirements Document

## Introduction

Цей документ описує вимоги до backend API для хакатону, який надає функціональність управління ідеями користувачів з можливістю покращення через Gemini AI, автоматичну аутентифікацію гостьових користувачів за IP-адресою, та систему глобальних ідей дня.

## Glossary

- **API**: Backend система, що надає REST endpoints для клієнтських додатків
- **User**: Гостьовий користувач системи, автоматично створений за IP-адресою
- **Guest_User**: Користувач без реєстрації, ідентифікований за IP-адресою та опціональним guestId
- **Idea**: Ідея користувача з можливістю збереження множинних ітерацій
- **Iteration**: Версія ідеї з описом, планом та рейтингом
- **Global_Idea**: Ідея дня, доступна всім користувачам для натхнення
- **Gemini_Service**: Сервіс інтеграції з Gemini AI API для покращення ідей
- **Auth_Middleware**: Middleware для автоматичного створення або пошуку користувача за IP
- **Ranking_System**: Система оцінювання ідей за критеріями originality, difficulty, marketPotential, scalability
- **Database**: MongoDB база даних з Mongoose ODM

## Requirements

### Requirement 1: Guest User Auto-Creation

**User Story:** Як користувач, я хочу автоматично отримати доступ до системи без реєстрації, щоб швидко почати працювати з ідеями

#### Acceptance Criteria

1. WHEN a request is received, THE API SHALL extract IP address from req.ip or x-forwarded-for header
2. WHEN IP address is extracted, THE API SHALL search for existing User with matching ip field
3. IF no User exists with the IP address, THEN THE API SHALL create new User record with ip and createdAt fields
4. WHERE guestId cookie is present, THE API SHALL search for User by guestId instead of IP address
5. WHERE guestId cookie is not present, THE API SHALL generate UUID as guestId and set it in cookie
6. WHEN User is found or created, THE API SHALL attach user information to request for subsequent processing

### Requirement 2: User Data Persistence

**User Story:** Як система, я хочу зберігати дані гостьових користувачів, щоб ідентифікувати їх при наступних запитах

#### Acceptance Criteria

1. THE Database SHALL store User records with fields: ip (string), guestId (optional string), createdAt (Date)
2. THE Database SHALL create index on ip field for fast lookup
3. THE Database SHALL create index on guestId field for fast lookup when cookie is present
4. WHEN a User with existing guestId is found, THE API SHALL use that User record
5. WHEN a User with existing IP but no guestId is found, THE API SHALL update the record with generated guestId

### Requirement 3: Idea Creation

**User Story:** Як користувач, я хочу створити нову ідею, щоб почати працювати над нею

#### Acceptance Criteria

1. WHEN an authenticated user submits title and description, THE API SHALL create new Idea with initial iteration version 1
2. THE API SHALL associate the Idea with the authenticated User's userId
3. THE API SHALL initialize the first Iteration with provided title, description, empty plan array, and default ranking values
4. WHEN Idea is created, THE API SHALL return the complete Idea object with status code 201

### Requirement 4: Idea Retrieval

**User Story:** Як користувач, я хочу переглядати свої ідеї, щоб відстежувати їх розвиток

#### Acceptance Criteria

1. WHEN an authenticated user requests their ideas list, THE API SHALL return all Ideas associated with their userId
2. WHEN an authenticated user requests specific Idea by id, THE API SHALL return the Idea if it belongs to the user
3. IF requested Idea does not belong to the user, THEN THE API SHALL return error with status code 403
4. IF requested Idea does not exist, THEN THE API SHALL return error with status code 404

### Requirement 5: Idea Deletion

**User Story:** Як користувач, я хочу видалити свою ідею, щоб прибрати непотрібні записи

#### Acceptance Criteria

1. WHEN an authenticated user requests to delete their Idea, THE API SHALL remove the Idea from Database
2. IF the Idea does not belong to the user, THEN THE API SHALL return error with status code 403
3. WHEN deletion succeeds, THE API SHALL return status code 204

### Requirement 6: AI-Powered Idea Improvement

**User Story:** Як користувач, я хочу покращити свою ідею через AI, щоб отримати більш деталізовану версію

#### Acceptance Criteria

1. WHEN an authenticated user requests improvement for their Idea, THE Gemini_Service SHALL send the latest iteration to Gemini AI API
2. WHEN Gemini AI returns improved version, THE API SHALL create new Iteration with incremented version number
3. THE API SHALL store improved title, description, and plan in the new Iteration
4. THE Gemini_Service SHALL generate ranking values for originality, difficulty, marketPotential, and scalability
5. IF Gemini AI request fails, THEN THE API SHALL return error with status code 500 and descriptive message
6. WHEN improvement succeeds, THE API SHALL return the updated Idea with all iterations

### Requirement 7: Iteration Editing

**User Story:** Як користувач, я хочу редагувати конкретну ітерацію ідеї, щоб виправити або покращити деталі вручну

#### Acceptance Criteria

1. WHEN an authenticated user updates specific iteration by version number, THE API SHALL modify title, description, or plan fields
2. THE API SHALL preserve the original version number and createdAt timestamp
3. IF the iteration version does not exist, THEN THE API SHALL return error with status code 404
4. IF the Idea does not belong to the user, THEN THE API SHALL return error with status code 403

### Requirement 8: Global Idea of the Day

**User Story:** Як користувач, я хочу бачити ідею дня, щоб отримати натхнення для своїх проектів

#### Acceptance Criteria

1. WHEN any user requests global idea, THE API SHALL return Global_Idea for current date
2. THE API SHALL include title, description, and examples array in the response
3. IF no Global_Idea exists for current date, THEN THE API SHALL return error with status code 404
4. THE API SHALL allow unauthenticated access to global idea endpoint

### Requirement 9: Request Authentication

**User Story:** Як система, я хочу автоматично ідентифікувати користувачів, щоб асоціювати їх дії з їхніми даними

#### Acceptance Criteria

1. WHEN a request is made to any endpoint, THE Auth_Middleware SHALL extract IP address from request
2. WHERE guestId cookie exists, THE Auth_Middleware SHALL search for User by guestId
3. WHERE guestId cookie does not exist, THE Auth_Middleware SHALL search for User by IP address
4. IF no User is found, THEN THE Auth_Middleware SHALL create new Guest_User automatically
5. WHEN User is identified or created, THE Auth_Middleware SHALL attach user information to request and continue processing
6. THE API SHALL allow access to all endpoints including /global-idea without explicit authentication

### Requirement 10: Data Model Integrity

**User Story:** Як система, я хочу забезпечити цілісність даних, щоб уникнути некоректних станів

#### Acceptance Criteria

1. THE Database SHALL enforce that each Idea has at least one Iteration
2. THE Database SHALL store Iteration with fields: version, title, description, plan (array), ranking (object with originality, difficulty, marketPotential, scalability), createdAt
3. THE Database SHALL automatically set createdAt timestamp when Iteration is created
4. THE Database SHALL ensure version numbers are sequential integers starting from 1

### Requirement 11: Error Handling

**User Story:** Як розробник клієнта, я хочу отримувати зрозумілі повідомлення про помилки, щоб правильно обробляти їх у UI

#### Acceptance Criteria

1. WHEN validation error occurs, THE API SHALL return status code 400 with descriptive error message
2. WHEN authentication error occurs, THE API SHALL return status code 401 with error message
3. WHEN authorization error occurs, THE API SHALL return status code 403 with error message
4. WHEN resource not found, THE API SHALL return status code 404 with error message
5. WHEN server error occurs, THE API SHALL return status code 500 with error message
6. THE API SHALL return all errors in consistent JSON format with message field

### Requirement 12: Gemini AI Integration

**User Story:** Як система, я хочу інтегруватися з Gemini AI, щоб генерувати покращені версії ідей

#### Acceptance Criteria

1. THE Gemini_Service SHALL use @google/generative-ai library for API communication
2. THE Gemini_Service SHALL format prompts with current iteration data
3. THE Gemini_Service SHALL parse AI responses into structured format with title, description, plan, and ranking
4. WHEN API rate limit is exceeded, THEN THE Gemini_Service SHALL return error with status code 429
5. THE Gemini_Service SHALL include timeout of 30 seconds for AI requests

### Requirement 13: Configuration Management

**User Story:** Як DevOps інженер, я хочу централізовано управляти конфігурацією, щоб легко змінювати налаштування для різних середовищ

#### Acceptance Criteria

1. THE API SHALL load MongoDB connection string from environment variables
2. THE API SHALL load Gemini AI API key from environment variables
3. THE API SHALL load cookie secret from environment variables for guestId cookie signing
4. THE API SHALL load session secret from environment variables
5. IF required environment variable is missing, THEN THE API SHALL fail to start with descriptive error message

### Requirement 14: TypeScript Type Safety

**User Story:** Як розробник, я хочу мати типізацію для всіх структур даних, щоб уникнути помилок під час розробки

#### Acceptance Criteria

1. THE API SHALL define TypeScript interfaces for Guest_User (with ip, guestId, createdAt), Idea, Iteration, GlobalIdea, and Ranking
2. THE API SHALL define TypeScript types for all request and response payloads
3. THE API SHALL use strict TypeScript compiler options
4. THE API SHALL export types for potential reuse in client applications
