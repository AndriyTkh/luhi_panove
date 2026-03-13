# Hackathon Backend API

Backend API для хакатону з підтримкою Google OAuth, MongoDB, та Gemini AI інтеграції.

## Технологічний стек

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB з Mongoose ODM
- **Authentication**: Passport.js з Google OAuth Strategy
- **AI Integration**: Google Generative AI (@google/generative-ai)

## Структура проекту

```
src/
├── config/         # Конфігурація та environment variables
├── controllers/    # HTTP request handlers
├── middleware/     # Express middleware (auth, error handling)
├── models/         # Mongoose моделі
├── routes/         # API routes
├── services/       # Business logic
└── types/          # TypeScript типи та інтерфейси
```

## Налаштування

1. Встановити залежності:
```bash
npm install
```

2. Створити `.env` файл на основі `.env.example`:
```bash
cp .env.example .env
```

3. Заповнити необхідні змінні оточення в `.env`:
   - `MONGODB_URI` - MongoDB connection string
   - `GOOGLE_CLIENT_ID` - Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
   - `GOOGLE_CALLBACK_URL` - OAuth callback URL
   - `SESSION_SECRET` - Session secret key
   - `GEMINI_API_KEY` - Gemini AI API key

## Запуск

### Development mode
```bash
npm run dev
```

### Production build
```bash
npm run build
npm start
```

### Tests
```bash
npm test
```

## API Endpoints

### Ideas
- `POST /ideas` - Створити нову ідею
- `GET /ideas` - Отримати всі ідеї користувача
- `GET /ideas/:id` - Отримати конкретну ідею
- `DELETE /ideas/:id` - Видалити ідею
- `POST /ideas/:id/improve` - Покращити ідею через AI
- `PATCH /ideas/:id/iterations/:version` - Редагувати ітерацію

### Global Ideas
- `GET /global-idea` - Отримати ідею дня (публічний endpoint)

## Ліцензія

MIT
