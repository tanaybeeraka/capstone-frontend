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
 * claim more. Keep these in sync with the frontend question counts:
 *   lesson1: bones review (14 questions)
 *   lesson2: fracture final quiz (9 questions)
 */
const lessonQuizMaxXp: Record<string, number> = {
  lesson1: 140,
  lesson2: 90,
  lesson3: 30,
  lesson4: 40,
};

/** XP the server awards for repeatable actions. The client says what happened; the server decides the amount. */
const xpRewards = {
  star: 1, // collecting a star in Bone Bonanza
  "hard-star": 5,
  "recovery-quiz": 5, // a correct recovery-quiz answer
} as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
const skinPrices: Record<string, number> = {
  classic: 0,
  cosmic: 250,
  inferno: 400,
  ocean: 600,
  mint: 800,
  royal: 1200,
  dino: 1400,
  bee: 1600,
  snow: 1800,
  rainbow: 2000,
};

// GET /me — everything the frontend needs after sign-in or on page load.
meRouter.get("/", async (req, res) => {
  res.json({ user: await getPublicUser(pool, currentUserId(req)) });
});

// PUT /me/profile — save onboarding answers and mark onboarding finished.
meRouter.put("/profile", async (req, res) => {
  const userId = currentUserId(req);
  const { profile, firstName, lastName, username, email } = z.object({
    profile: profileSchema,
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
    username: z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/).optional(),
    email: z.string().trim().max(254).pipe(z.email()).optional(),
  }).parse(req.body);
  try {
    await pool.query(
      `UPDATE users SET profile = $2, onboarding_completed = TRUE,
         first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name),
         username = COALESCE($5, username), email = COALESCE($6, email), updated_at = now()
       WHERE id = $1`,
      [userId, profile, firstName, lastName, username, email],
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      const constraint = "constraint" in error ? String(error.constraint) : "";
      if (constraint.includes("email")) throw new HttpError(409, "An account with that email already exists.");
      throw new HttpError(409, "That username is already taken.");
    }
    throw error;
  }
  res.json({ user: await getPublicUser(pool, userId) });
});

meRouter.put("/lesson-progress", async (req, res) => {
  const userId = currentUserId(req);
  const { progress } = z.object({
    progress: z.object({
      lessonIndex: z.number().int().min(0).max(3),
      slideIndex: z.number().int().min(0).max(30),
    }),
  }).parse(req.body);
  await pool.query("UPDATE users SET lesson_progress = $2, updated_at = now() WHERE id = $1", [userId, progress]);
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

meRouter.post("/skins/purchase", async (req, res) => {
  const userId = currentUserId(req);
  const { skinId } = z.object({ skinId: z.string().min(1).max(30) }).parse(req.body);
  const price = skinPrices[skinId];
  if (price === undefined) throw new HttpError(404, "Unknown Benny skin.");
  const user = await withTransaction(async (client) => {
    const { rows } = await client.query("SELECT xp, owned_skins FROM users WHERE id = $1 FOR UPDATE", [userId]);
    const row = rows[0];
    if (row.owned_skins.includes(skinId)) throw new HttpError(409, "You already own this Benny skin.");
    if (row.xp < price) throw new HttpError(409, "You need more XP for this skin.");
    await client.query(
      "UPDATE users SET xp = xp - $2, owned_skins = array_append(owned_skins, $3), equipped_skin = $3, updated_at = now() WHERE id = $1",
      [userId, price, skinId],
    );
    return getPublicUser(client, userId);
  });
  res.json({ user });
});

meRouter.put("/skins/equip", async (req, res) => {
  const userId = currentUserId(req);
  const { skinId } = z.object({ skinId: z.string().min(1).max(30) }).parse(req.body);
  if (skinPrices[skinId] === undefined) throw new HttpError(404, "Unknown Benny skin.");
  const { rowCount } = await pool.query(
    "UPDATE users SET equipped_skin = $2, updated_at = now() WHERE id = $1 AND $2 = ANY(owned_skins)",
    [userId, skinId],
  );
  if (!rowCount) throw new HttpError(409, "Unlock this skin before wearing it.");
  res.json({ user: await getPublicUser(pool, userId) });
});

meRouter.post("/game-runs", async (req, res) => {
  const userId = currentUserId(req);
  const { difficulty, stars } = z.object({
    difficulty: z.enum(["easy", "hard"]),
    stars: z.number().int().min(0).max(10000),
  }).parse(req.body);
  await pool.query("INSERT INTO game_runs (user_id, difficulty, stars) VALUES ($1, $2, $3)", [userId, difficulty, stars]);
  const { rows } = await pool.query(
    `SELECT username, difficulty, stars, (extract(epoch from achieved_at) * 1000)::float8 AS "achievedAt"
       FROM (
         SELECT DISTINCT ON (u.id, gr.difficulty) u.username, gr.difficulty, gr.stars, gr.achieved_at
           FROM game_runs gr JOIN users u ON u.id = gr.user_id
          WHERE gr.difficulty = $1
          ORDER BY u.id, gr.difficulty, gr.stars DESC, gr.achieved_at ASC
       ) best
      ORDER BY stars DESC, achieved_at ASC
      LIMIT 20`,
    [difficulty],
  );
  res.json({ entries: rows });
});

meRouter.get("/leaderboard", async (req, res) => {
  const difficulty = z.enum(["easy", "hard"]).parse(req.query.difficulty ?? "easy");
  const { rows } = await pool.query(
    `SELECT username, difficulty, stars, (extract(epoch from achieved_at) * 1000)::float8 AS "achievedAt"
       FROM (
         SELECT DISTINCT ON (u.id, gr.difficulty) u.username, gr.difficulty, gr.stars, gr.achieved_at
           FROM game_runs gr JOIN users u ON u.id = gr.user_id
          WHERE gr.difficulty = $1
          ORDER BY u.id, gr.difficulty, gr.stars DESC, gr.achieved_at ASC
       ) best
      ORDER BY stars DESC, achieved_at ASC
      LIMIT 20`,
    [difficulty],
  );
  res.json({ entries: rows });
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
