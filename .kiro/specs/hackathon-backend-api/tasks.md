# Implementation Plan: Hackathon Backend API

## Overview

Цей план описує покрокову реалізацію backend API для хакатону з використанням Node.js, TypeScript, Express, MongoDB, IP-based guest authentication та Gemini AI. Реалізація побудована за трирівневою архітектурою (routes → services → models) з повною типізацією та property-based тестуванням.

## Tasks

- [x] 1. Налаштування проекту та базової інфраструктури
  - Ініціалізувати Node.js проект з TypeScript
  - Налаштувати tsconfig.json з strict mode
  - Встановити залежності: express, mongoose, cookie-parser, @google/generative-ai, dotenv
  - Встановити dev залежності: typescript, @types/node, @types/express, @types/cookie-parser, ts-node, nodemon
  - Створити структуру директорій: src/{models,services,controllers,middleware,routes,config,types}
  - Налаштувати .env.example з усіма необхідними змінними
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.3_

- [x] 2. Створення TypeScript типів та інтерфейсів
  - Створити src/types/index.ts з інтерфейсами User, Idea, Iteration, Ranking, GlobalIdea
  - Створити типи для request/response payloads: CreateIdeaRequest, EditIterationRequest, IdeaResponse, ErrorResponse
  - Створити типи для AuthenticatedRequest з user property
  - Експортувати всі типи для потенційного використання клієнтами
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 3. Налаштування конфігурації та валідації environment variables
  - Створити src/config/index.ts для завантаження змінних оточення
  - Реалізувати функцію validateConfig() для перевірки наявності всіх обов'язкових змінних
  - Експортувати конфігураційний об'єкт з MongoDB URI, Gemini API key, cookie secret для підпису guestId cookies
  - Додати логіку fail-fast при відсутності обов'язкових змінних з описовими помилками
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 3.1 Написати property test для конфігурації
  - **Property 32: Required Environment Variables Loading**
  - **Property 33: Missing Configuration Prevents Startup**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ] 4. Створення Mongoose моделей
  - [x] 4.1 Створити User model (src/models/User.ts)
    - Визначити UserSchema з полями: ip (string, indexed), guestId (string, unique, indexed)
    - Додати timestamps: true для автоматичних createdAt/updatedAt
    - Експортувати Mongoose model
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

  - [ ]* 4.2 Написати property test для User model
    - **Property 4: IP Uniqueness Per GuestId**
    - **Validates: Requirements 1.1, 1.2, 2.2**

  - [x] 4.3 Створити Idea model (src/models/Idea.ts)
    - Визначити RankingSchema з полями originality, difficulty, marketPotential, scalability (0-100)
    - Визначити IterationSchema з полями version, title, description, plan (array), ranking, createdAt
    - Визначити IdeaSchema з полями userId (ref User, indexed), iterations (array з валідацією мінімум 1)
    - Додати timestamps для Idea
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 4.4 Написати property tests для Idea model
    - **Property 28: Idea Has At Least One Iteration**
    - **Property 29: Iteration Structure Completeness**
    - **Property 30: Iteration CreatedAt Auto-Generation**
    - **Property 31: Sequential Version Numbers**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

  - [x] 4.5 Створити GlobalIdea model (src/models/GlobalIdea.ts)
    - Визначити GlobalIdeaSchema з полями date (unique, indexed), title, description, examples (array)
    - Додати timestamps
    - Експортувати Mongoose model
    - _Requirements: 8.1, 8.2_

- [x] 5. Реалізація error handling системи
  - Створити src/middleware/errorHandler.ts з класами помилок
  - Визначити ApiError базовий клас з statusCode та message
  - Створити спеціалізовані класи: ValidationError (400), AuthenticationError (401), AuthorizationError (403), NotFoundError (404), RateLimitError (429), ServerError (500)
  - Реалізувати централізований error handler middleware з консистентним JSON форматом
  - Додати логування помилок
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ]* 5.1 Написати property test для error handling
  - **Property 34: Consistent Error Response Format**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

- [x] 6. Checkpoint - Перевірка базової інфраструктури
  - Переконатися, що TypeScript компілюється без помилок
  - Перевірити, що всі моделі та типи правильно експортуються
  - Запитати користувача, чи є питання

- [x] 7. Реалізація AuthService
  - Створити src/services/AuthService.ts
  - Реалізувати findOrCreateGuestUser(ip, guestId?): створення або оновлення User на основі IP та опціонального guestId
  - Реалізувати generateGuestId(): генерація унікального guestId (UUID v4)
  - Реалізувати extractIpAddress(req): витягування IP з req.ip або x-forwarded-for header
  - Додати обробку помилок з AuthenticationError
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.5_

- [ ]* 7.1 Написати property tests для AuthService
  - **Property 1: Guest User Auto-Creation from IP**
  - **Property 2: GuestId Generation Uniqueness**
  - **Property 3: IP Extraction from Request**
  - **Property 4: Existing User Retrieval by GuestId**
  - **Property 5: User Association with IP**
  - **Property 6: Multiple IPs Same GuestId**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.5**

- [x] 8. Реалізація authentication middleware
  - Створити src/middleware/auth.ts
  - Реалізувати autoIdentifyUser middleware: витягування IP з request, читання guestId з cookie, виклик AuthService.findOrCreateGuestUser, attach user до request
  - Додати логіку встановлення guestId cookie якщо його немає (httpOnly, signed, maxAge 1 рік)
  - Додати типізацію для AuthenticatedRequest
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 8.1 Написати property tests для auth middleware
  - **Property 7: Auto-Identification Attaches User**
  - **Property 8: GuestId Cookie Creation**
  - **Property 9: IP Extraction from Headers**
  - **Property 10: User Auto-Creation on First Request**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [x] 9. Checkpoint - Тестування IP-based auto-identification
  - Переконатися, що IP extraction працює коректно
  - Перевірити генерацію guestId та створення User
  - Перевірити встановлення та читання guestId cookie
  - Перевірити, що користувач автоматично ідентифікується на кожному запиті
  - Запитати користувача, чи є питання

- [x] 10. Реалізація GeminiService
  - Створити src/services/GeminiService.ts
  - Ініціалізувати Google Generative AI client з API key
  - Реалізувати formatPrompt(iteration): форматування prompt з title, description, plan
  - Реалізувати parseAIResponse(response): парсинг відповіді в структуру ImprovedIdea
  - Реалізувати generateRanking(): генерація ranking values (0-100)
  - Реалізувати improveIdea(iteration): виклик Gemini API з timeout 30 секунд
  - Додати обробку помилок: ServerError для failures, RateLimitError для rate limits
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 10.1 Написати property tests для GeminiService
  - **Property 11: AI Service Failure Returns 500**
  - **Property 12: AI Rate Limit Returns 429**
  - **Property 13: AI Prompt Contains Iteration Data**
  - **Property 14: AI Response Parsing Structure**
  - **Validates: Requirements 6.5, 12.2, 12.3, 12.4**

- [x] 11. Реалізація IdeaService
  - [x] 11.1 Створити src/services/IdeaService.ts з базовими CRUD операціями
    - Реалізувати createIdea(userId, title, description): створення Idea з початковою iteration version 1
    - Реалізувати getUserIdeas(userId): отримання всіх ідей користувача
    - Реалізувати getIdeaById(ideaId, userId): отримання ідеї з перевіркою власника
    - Додати AuthorizationError при спробі доступу до чужої ідеї
    - Додати NotFoundError при відсутності ідеї
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

  - [ ]* 11.2 Написати property tests для базових операцій IdeaService
    - **Property 15: Idea Creation with Initial Iteration**
    - **Property 16: User Ideas Retrieval**
    - **Property 17: Authorized Idea Access**
    - **Property 18: Idea Ownership Protection**
    - **Property 19: Non-Existent Resource Returns 404**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4**

  - [x] 11.3 Додати операції видалення та ітерацій
    - Реалізувати deleteIdea(ideaId, userId): видалення з перевіркою власника
    - Реалізувати addIteration(ideaId, iteration): додавання нової ітерації з інкрементом version
    - Реалізувати updateIteration(ideaId, version, updates): оновлення існуючої ітерації зі збереженням version та createdAt
    - _Requirements: 5.1, 5.2, 6.2, 6.3, 7.1, 7.2, 7.3_

  - [ ]* 11.4 Написати property tests для видалення та ітерацій
    - **Property 20: Idea Deletion Removes from Database**
    - **Property 21: Iteration Update Modifies Fields**
    - **Property 22: Iteration Update Preserves Immutable Fields**
    - **Validates: Requirements 5.1, 5.3, 7.1, 7.2, 7.3**

- [x] 12. Реалізація IdeaController
  - Створити src/controllers/IdeaController.ts
  - Реалізувати createIdea: валідація input, виклик IdeaService.createIdea, повернення 201
  - Реалізувати getUserIdeas: виклик IdeaService.getUserIdeas
  - Реалізувати getIdeaById: валідація ideaId, виклик IdeaService.getIdeaById
  - Реалізувати deleteIdea: валідація ideaId, виклик IdeaService.deleteIdea, повернення 204
  - Реалізувати improveIdea: виклик GeminiService.improveIdea, виклик IdeaService.addIteration
  - Реалізувати editIteration: валідація version, виклик IdeaService.updateIteration
  - Додати валідацію request body з express-validator
  - _Requirements: 3.1, 3.4, 4.1, 4.2, 5.1, 5.3, 6.1, 6.6, 7.1_

- [ ]* 12.1 Написати property tests для AI improvement
  - **Property 23: AI Improvement Creates New Iteration**
  - **Property 24: AI Improvement Returns Complete Idea**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6**

- [x] 13. Створення Idea routes
  - Створити src/routes/ideas.ts
  - Додати POST /ideas (autoIdentifyUser) → createIdea
  - Додати GET /ideas (autoIdentifyUser) → getUserIdeas
  - Додати GET /ideas/:id (autoIdentifyUser) → getIdeaById
  - Додати DELETE /ideas/:id (autoIdentifyUser) → deleteIdea
  - Додати POST /ideas/:id/improve (autoIdentifyUser) → improveIdea
  - Додати PATCH /ideas/:id/iterations/:version (autoIdentifyUser) → editIteration
  - _Requirements: 3.1, 4.1, 4.2, 5.1, 6.1, 7.1_

- [x] 14. Checkpoint - Тестування Idea management
  - Переконатися, що всі CRUD операції працюють
  - Перевірити AI improvement flow
  - Перевірити authorization checks
  - Запитати користувача, чи є питання

- [x] 15. Реалізація GlobalIdeaService та Controller
  - Створити src/services/GlobalIdeaService.ts
  - Реалізувати getIdeaForDate(date): пошук GlobalIdea за датою
  - Реалізувати createGlobalIdea(title, description, examples): створення нової глобальної ідеї
  - Створити src/controllers/GlobalIdeaController.ts
  - Реалізувати getGlobalIdea: отримання ідеї для поточної дати, 404 якщо не знайдено
  - Реалізувати createGlobalIdea (опціонально для admin)
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 15.1 Написати property tests для GlobalIdea
  - **Property 25: Global Idea Retrieval for Date**
  - **Property 26: Missing Global Idea Returns 404**
  - **Property 27: Global Idea Unauthenticated Access**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 16. Створення GlobalIdea routes
  - Створити src/routes/globalIdea.ts
  - Додати GET /global-idea (без requireAuth) → getGlobalIdea
  - Додати POST /global-idea (опціонально, для admin) → createGlobalIdea
  - _Requirements: 8.4_

- [ ] 17. Налаштування Express application та MongoDB connection
  - Створити src/app.ts
  - Налаштувати Express middleware: body-parser, cors, cookie-parser (з cookie secret)
  - Підключити autoIdentifyUser middleware глобально
  - Підключити всі routes: /ideas, /global-idea
  - Підключити error handler middleware
  - Створити src/db.ts для MongoDB connection з Mongoose
  - Додати graceful shutdown handling
  - _Requirements: 13.1_

- [x] 18. Створення entry point та запуск сервера
  - Створити src/index.ts
  - Завантажити конфігурацію з валідацією
  - Підключитися до MongoDB
  - Запустити Express server на порту з environment variable
  - Додати логування startup events
  - _Requirements: 13.5_

- [x] 19. Налаштування testing framework
  - Встановити Jest, ts-jest, @types/jest
  - Встановити fast-check для property-based testing
  - Встановити mongodb-memory-server для in-memory database
  - Налаштувати jest.config.js з TypeScript support
  - Створити test setup файл з mock'ами для Gemini AI
  - Створити структуру tests/{unit,properties}

- [x] 20. Написати unit tests для критичних компонентів
  - Написати unit tests для AuthService з конкретними прикладами
  - Написати unit tests для IdeaService з edge cases (empty arrays, boundary values)
  - Написати unit tests для GeminiService з mock responses
  - Написати unit tests для error handler з різними типами помилок
  - Написати integration tests для основних API flows

- [ ] 21. Final checkpoint - Повне тестування системи
  - Запустити всі unit tests та property tests
  - Перевірити code coverage (>80% line coverage)
  - Переконатися, що всі 34 correctness properties покриті тестами
  - Перевірити, що API запускається з валідною конфігурацією
  - Перевірити, що API не запускається з відсутніми environment variables
  - Протестувати IP-based authentication flow з різними IP адресами
  - Протестувати guestId cookie persistence між запитами
  - Запитати користувача, чи є питання або потрібні зміни

## Notes

- Tasks позначені `*` є опціональними і можуть бути пропущені для швидшого MVP
- Кожен task посилається на конкретні requirements для трасування
- Checkpoints забезпечують інкрементальну валідацію
- Property tests верифікують універсальні властивості коректності (мінімум 100 ітерацій кожен)
- Unit tests перевіряють конкретні приклади та edge cases
- Всі property tests мають бути анотовані з номером property та requirements
