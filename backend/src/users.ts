import type { Pool, PoolClient } from "pg";
import { z } from "zod";
import { HttpError } from "./errors.js";

export const profileSchema = z.object({
  name: z.string().trim().max(100),
  grade: z.string().max(50),
  sports: z.array(z.string().max(50)).max(20),
  injury: z.string().max(100),
  activities: z.array(z.string().max(50)).max(20),
  playsInstrument: z.string().max(50),
  instrument: z.string().max(100),
  reasonsForJoining: z.array(z.string().max(100)).max(20),
});

export type Profile = z.infer<typeof profileSchema>;

/** The user object sent to the frontend. Field names match the frontend's `Account` type. */
export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile: Profile | null;
  onboardingCompleted: boolean;
  xp: number;
  lesson1QuizCompleted: boolean;
  lesson2QuizCompleted: boolean;
  lesson2FinalQuizCompleted: boolean;
  lesson3QuizCompleted: boolean;
  lesson4QuizCompleted: boolean;
  lessonProgress: { lessonIndex: 0 | 1 | 2 | 3; slideIndex: number } | null;
  ownedSkins: string[];
  equippedSkin: string;
  streak: { count: number; lastActiveDate: string | null };
};

type Db = Pool | PoolClient;

export async function getPublicUser(db: Db, userId: string): Promise<PublicUser> {
  const { rows } = await db.query(
    `SELECT u.*, COALESCE(array_agg(lc.lesson_id) FILTER (WHERE lc.lesson_id IS NOT NULL), '{}') AS lessons
       FROM users u
       LEFT JOIN lesson_completions lc ON lc.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id`,
    [userId],
  );
  const row = rows[0];
  if (!row) throw new HttpError(401, "This account no longer exists.");
  const lessons: string[] = row.lessons;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    email: row.email,
    profile: row.profile,
    onboardingCompleted: row.onboarding_completed,
    xp: row.xp,
    lesson1QuizCompleted: lessons.includes("lesson1"),
    lesson2QuizCompleted: lessons.includes("lesson2"),
    lesson2FinalQuizCompleted: lessons.includes("lesson2"),
    lesson3QuizCompleted: lessons.includes("lesson3"),
    lesson4QuizCompleted: lessons.includes("lesson4"),
    lessonProgress: row.lesson_progress,
    ownedSkins: row.owned_skins,
    equippedSkin: row.equipped_skin,
    streak: { count: row.streak_count, lastActiveDate: row.streak_last_active },
  };
}
