# Bone Buddies API

Express + TypeScript API for Bone Buddies. Data lives in Postgres on [Neon](https://neon.com); the API runs on [Render](https://render.com).

## Run locally

```bash
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate:dev       # creates the tables
npm run dev               # http://localhost:3000
```

`DATABASE_URL` can point at a Neon branch (Neon lets you make a separate `dev` branch) or at a local Postgres.

## Deploy

### 1. Neon
1. Create a project, then open **Connect** and copy the connection string. It should end in `?sslmode=require`.
2. You don't need to create any tables by hand. The API applies [db/schema.sql](db/schema.sql) every time it starts, and the schema is safe to run repeatedly.

### 2. Render
Either use the Blueprint (**New → Blueprint**, pick this repo, and [render.yaml](render.yaml) configures everything) or create a **Web Service** by hand:

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |
| Env: `DATABASE_URL` | Neon connection string |
| Env: `JWT_SECRET` | a long random string |
| Env: `CORS_ORIGIN` | your frontend's URL, e.g. `https://your-app.example.com` (comma-separate several) |

On Render's free plan the service sleeps after about 15 minutes idle, so the first request after that takes 30–60 seconds. Neon's free tier also pauses when idle, which adds a second or so.

## Auth

`POST /api/auth/signup` and `POST /api/auth/login` return `{ token, user }`. Send the token on every other request:

```
Authorization: Bearer <token>
```

Tokens last 7 days. A request with a missing or expired token gets a `401`; send the user back to sign-in when that happens.
The frontend defaults to `https://capstone-backend-zb1m.onrender.com`; set `VITE_API_BASE_URL` at build time to use another API instance.

## Endpoints

Every error response looks like `{ "message": "..." }`, with text that can be shown to the user directly.

| Method & path | Body | Returns | Replaces in the frontend |
|---|---|---|---|
| `GET /health` | – | `{ ok: true }` | – |
| `POST /api/auth/signup` | `{ firstName, lastName, username, email, password }` | `201 { token, user }`, or `409` if username/email is taken | account creation |
| `POST /api/auth/login` | `{ username, password }` | `{ token, user }`, or `401` | sign-in; initializes the streak on first sign-in |
| `GET /api/me` | – | `{ user }` | session restoration |
| `PUT /api/me/profile` | `{ profile, firstName?, lastName?, username?, email? }` | `{ user }` with `onboardingCompleted: true` | onboarding and profile editing |
| `PUT /api/me/lesson-progress` | `{ progress: { lessonIndex, slideIndex } }` | `{ user }` | current lesson and slide resume point |
| `POST /api/me/lessons/:lessonId/quiz` | `{ earnedXp }` | `{ user }` | one-time quiz completion for `lesson1`–`lesson4` |
| `POST /api/me/streak` | – | `{ user }` | lesson completion streak |
| `POST /api/me/xp/earn` | `{ source: "star" \| "hard-star" \| "recovery-quiz", count? }` | `{ xp }` | game stars and recovery quiz rewards |
| `POST /api/me/xp/spend` | `{ amount }` | `{ xp }`, or `409` if there isn't enough XP | purchases and game lives |
| `POST /api/me/skins/purchase` | `{ skinId }` | `{ user }`, or `409` if already owned / not enough XP | Benny skin purchase |
| `PUT /api/me/skins/equip` | `{ skinId }` | `{ user }` | Benny skin selection |
| `POST /api/me/game-runs` | `{ difficulty: "easy" \| "hard", stars }` | `{ entries }` | Bone Bonanza score submission |
| `GET /api/me/leaderboard?difficulty=easy\|hard` | – | `{ entries }` | Bone Bonanza leaderboard |
| `GET /api/me/daily/:YYYY-MM-DD` | – | `{ answerIndex }` (or `null`) | daily answer |
| `PUT /api/me/daily/:YYYY-MM-DD` | `{ answerIndex }` | `{ answerIndex }` (first answer sticks) | daily answer |

The `user` object uses the same field names as the frontend's `Account` type, plus `id`, `onboardingCompleted` and `streak: { count, lastActiveDate }`:

```json
{
  "id": "a3d1…",
  "firstName": "Ava", "lastName": "Lee", "username": "ava_1", "email": "ava@example.com",
  "profile": { "name": "Ava", "grade": "5th", "sports": ["Soccer"], "...": "..." },
  "onboardingCompleted": true,
  "xp": 73,
  "lesson1QuizCompleted": true,
  "lesson2QuizCompleted": false,
  "lesson2FinalQuizCompleted": false,
  "lesson3QuizCompleted": false,
  "lesson4QuizCompleted": false,
  "lessonProgress": { "lessonIndex": 1, "slideIndex": 2 },
  "ownedSkins": ["classic", "cosmic"],
  "equippedSkin": "cosmic",
  "streak": { "count": 1, "lastActiveDate": "2026-11-14" }
}
```

## Server-side rules

The frontend reports what happened, and the server decides what it's worth:

- Each lesson quiz awards XP **once**. Current caps are Lesson 1 (14 questions: 140 XP), Lesson 2 (9 questions: 90 XP), Lesson 3 (3 questions: 30 XP), and Lesson 4 (4 questions: 40 XP). Update `lessonQuizMaxXp` in [src/routes/me.ts](src/routes/me.ts) when question counts or reward rules change.
- Star and recovery-quiz rewards are fixed on the server (`xpRewards`): easy stars award 1 XP, hard stars 5 XP, and correct recovery-quiz answers 5 XP each.
- Spending XP checks the balance and subtracts it in a single SQL statement, so double clicks can't push XP below zero.
- Skin prices and ownership are validated server-side; game runs are stored and leaderboards show each user's best score for the selected difficulty.
- Streak dates use UTC, the same as the frontend's `toISOString().slice(0, 10)`.
- Passwords are hashed with bcrypt. Sign-up and login are limited to 20 attempts per IP every 15 minutes.

## Project layout

```
db/schema.sql        tables and indexes
src/server.ts        app setup, CORS, routes
src/config.ts        environment variables
src/db.ts            Postgres pool + transaction helper
src/migrate.ts       applies db/schema.sql
src/auth.ts          JWT signing and the requireAuth middleware
src/errors.ts        HttpError and the JSON error handler
src/users.ts         profile validation and the user → JSON mapping
src/routes/auth.ts   signup / login
src/routes/me.ts     everything for the signed-in user
```
