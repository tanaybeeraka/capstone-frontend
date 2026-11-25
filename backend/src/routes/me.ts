import { Router } from "express";
import { z } from "zod";
import { currentUserId, requireAuth } from "../auth.js";
import { pool, withTransaction } from "../db.js";
import { HttpError } from "../errors.js";
import { getPublicUser, profileSchema } from "../users.js";

export const meRouter = Router();
meRouter.use(requireAuth);

/**
 * The most XP each lesson quiz can award (10 XP per correct answer), so a tampered request can't
 * claim more. Keep these in sync with the frontend:
 *   lesson1: fractureFinalQuestions (9 questions)
 *   lesson2: bones review (14 bones)
 */
const lessonQuizMaxXp: Record<string, number> = {
  lesson1: 90,
  lesson2: 140,
};

/** XP the server awards for repeatable actions. The client says what happened; the server decides the amount. */
const xpRewards = {
  star: 1, // collecting a star in Bone Bonanza
  "recovery-quiz": 5, // a correct recovery-quiz answer
} as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

// GET /me — everything the frontend needs after sign-in or on page load.
meRouter.get("/", async (req, res) => {
  res.json({ user: await getPublicUser(pool, currentUserId(req)) });
});

// PUT /me/profile — save onboarding answers and mark onboarding finished.
meRouter.put("/profile", async (req, res) => {
  const userId = currentUserId(req);
  const { profile } = z.object({ profile: profileSchema }).parse(req.body);
  await pool.query(
    "UPDATE users SET profile = $2, onboarding_completed = TRUE, updated_at = now() WHERE id = $1",
    [userId, profile],
  );
  res.json({ user: await getPublicUser(pool, userId) });
});

// POST /me/lessons/:lessonId/quiz — claim a lesson quiz's XP. Only the first claim awards XP.
meRouter.post("/lessons/:lessonId/quiz", async (req, res) => {
  const userId = currentUserId(req);
  const lessonId = String(req.params.lessonId);
  const maxXp = lessonQuizMaxXp[lessonId];
  if (maxXp === undefined) throw new HttpError(404, "Unknown lesson.");
  const { earnedXp } = z.object({ earnedXp: z.number().int().min(0).max(maxXp) }).parse(req.body);

  const user = await withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO lesson_completions (user_id, lesson_id, xp_awarded) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id) DO NOTHING`,
      [userId, lessonId, earnedXp],
    );
    if (inserted.rowCount === 1 && earnedXp > 0) {
      await client.query("UPDATE users SET xp = xp + $2, updated_at = now() WHERE id = $1", [userId, earnedXp]);
    }
    return getPublicUser(client, userId);
  });
  res.json({ user });
});

// POST /me/streak — record that the user finished a lesson today (mirrors the frontend's completeLesson()).
meRouter.post("/streak", async (req, res) => {
  const userId = currentUserId(req);
  await pool.query(
    `WITH today AS (SELECT (now() AT TIME ZONE 'utc')::date AS d)
     UPDATE users
        SET streak_count = CASE
              WHEN streak_last_active = today.d THEN streak_count
              WHEN streak_last_active = today.d - 1 THEN streak_count + 1
              ELSE 1
            END,
            streak_last_active = today.d,
            updated_at = now()
       FROM today
      WHERE id = $1`,
    [userId],
  );
  res.json({ user: await getPublicUser(pool, userId) });
});

// POST /me/xp/earn — award XP for a repeatable action.
meRouter.post("/xp/earn", async (req, res) => {
  const userId = currentUserId(req);
  const { source, count } = z
    .object({
      source: z.enum(Object.keys(xpRewards) as [keyof typeof xpRewards]),
      // Lets the game send several stars in one request instead of one request per star.
      count: z.number().int().min(1).max(50).default(1),
    })
    .parse(req.body);
  const amount = xpRewards[source] * count;
  const { rows } = await pool.query("UPDATE users SET xp = xp + $2, updated_at = now() WHERE id = $1 RETURNING xp", [
    userId,
    amount,
  ]);
  res.json({ xp: rows[0].xp });
});

// POST /me/xp/spend — spend XP (e.g. 10 XP per life in Bone Bonanza). 409 if the user can't afford it.
meRouter.post("/xp/spend", async (req, res) => {
  const userId = currentUserId(req);
  const { amount } = z.object({ amount: z.number().int().min(1).max(1000) }).parse(req.body);
  // The WHERE clause makes check-and-subtract a single atomic step, so double clicks can't overspend.
  const { rows } = await pool.query(
    "UPDATE users SET xp = xp - $2, updated_at = now() WHERE id = $1 AND xp >= $2 RETURNING xp",
    [userId, amount],
  );
  if (!rows[0]) throw new HttpError(409, "Not enough XP.");
  res.json({ xp: rows[0].xp });
});

// GET /me/daily/:day — the answer the user picked for that day's question, or null.
meRouter.get("/daily/:day", async (req, res) => {
  const userId = currentUserId(req);
  const day = isoDate.parse(req.params.day);
  const { rows } = await pool.query("SELECT answer_index FROM daily_answers WHERE user_id = $1 AND day = $2", [
    userId,
    day,
  ]);
  res.json({ answerIndex: rows[0]?.answer_index ?? null });
});

// PUT /me/daily/:day — save the user's answer to that day's question. The first answer sticks.
meRouter.put("/daily/:day", async (req, res) => {
  const userId = currentUserId(req);
  const day = isoDate.parse(req.params.day);
  const { answerIndex } = z.object({ answerIndex: z.number().int().min(0).max(10) }).parse(req.body);
  await pool.query(
    `INSERT INTO daily_answers (user_id, day, answer_index) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, day) DO NOTHING`,
    [userId, day, answerIndex],
  );
  const { rows } = await pool.query("SELECT answer_index FROM daily_answers WHERE user_id = $1 AND day = $2", [
    userId,
    day,
  ]);
  res.json({ answerIndex: rows[0].answer_index });
});
