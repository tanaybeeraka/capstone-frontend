import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { signToken } from "../auth.js";
import { pool } from "../db.js";
import { HttpError } from "../errors.js";
import { getPublicUser } from "../users.js";

export const authRouter = Router();

// Slow down password guessing: 20 attempts per IP every 15 minutes.
authRouter.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }));

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_]{3,20}$/, "Use 3–20 letters, numbers or underscores."),
  email: z.string().trim().max(254).pipe(z.email()),
  // Matches the frontend's minLength={4}. Consider raising both to 8.
  password: z.string().min(4).max(200),
});

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

/** Mirrors the frontend's startFirstDay(): a user's first sign-in starts their streak at 1. */
async function startFirstDay(userId: string) {
  await pool.query(
    `UPDATE users
        SET streak_count = 1, streak_last_active = (now() AT TIME ZONE 'utc')::date, updated_at = now()
      WHERE id = $1 AND streak_count = 0`,
    [userId],
  );
}

authRouter.post("/signup", async (req, res) => {
  const body = signupSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(body.password, 12);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [body.firstName, body.lastName, body.username, body.email, passwordHash],
    );
    const userId: string = rows[0].id;
    await startFirstDay(userId);
    res.status(201).json({ token: signToken(userId), user: await getPublicUser(pool, userId) });
  } catch (error) {
    // 23505 = unique_violation
    if (error instanceof Error && "code" in error && error.code === "23505") {
      const constraint = "constraint" in error ? String(error.constraint) : "";
      if (constraint.includes("email")) throw new HttpError(409, "An account with that email already exists. Try signing in!");
      throw new HttpError(409, "That username is already taken. Try a different one!");
    }
    throw error;
  }
});

authRouter.post("/login", async (req, res) => {
  const body = loginSchema.parse(req.body);
  const { rows } = await pool.query("SELECT id, password_hash FROM users WHERE lower(username) = lower($1)", [
    body.username,
  ]);
  const row = rows[0];
  const passwordMatches = row ? await bcrypt.compare(body.password, row.password_hash) : false;
  if (!row || !passwordMatches) throw new HttpError(401, "That username and password don’t match. Try again!");
  await startFirstDay(row.id);
  res.json({ token: signToken(row.id), user: await getPublicUser(pool, row.id) });
});
