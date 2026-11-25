-- Bone Buddies schema. Safe to run repeatedly (every statement is idempotent).

CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  username             TEXT NOT NULL,
  email                TEXT NOT NULL,
  password_hash        TEXT NOT NULL,
  profile              JSONB,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  xp                   INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak_count         INTEGER NOT NULL DEFAULT 0,
  streak_last_active   DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usernames and emails are unique regardless of letter case.
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- One row per lesson quiz whose XP has been claimed. The primary key makes each claim one-time.
CREATE TABLE IF NOT EXISTS lesson_completions (
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL,
  xp_awarded   INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- The answer a user picked for the daily question on a given day.
CREATE TABLE IF NOT EXISTS daily_answers (
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  day          DATE NOT NULL,
  answer_index INTEGER NOT NULL,
  PRIMARY KEY (user_id, day)
);
