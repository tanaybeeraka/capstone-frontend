const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://capstone-backend-zb1m.onrender.com").replace(/\/+$/, "");
const tokenKey = "bone-buddies-api-token";

export type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile: {
    name: string;
    grade: string;
    sports: string[];
    injury: string;
    activities: string[];
    playsInstrument: string;
    instrument: string;
    reasonsForJoining: string[];
  } | null;
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

function getToken() {
  return window.localStorage.getItem(tokenKey);
}

export function clearApiToken() {
  window.localStorage.removeItem(tokenKey);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && auth) clearApiToken();
    const message = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
      ? data.message
      : `The server returned ${response.status}. Please try again.`;
    throw new Error(message);
  }
  return data as T;
}

export async function authenticate(
  mode: "login" | "signup",
  body: Record<string, string>,
) {
  const result = await apiRequest<{ token: string; user: ApiUser }>(`/api/auth/${mode}`, {
    method: "POST",
    body: JSON.stringify(body),
  }, false);
  window.localStorage.setItem(tokenKey, result.token);
  return result.user;
}

export async function restoreSession() {
  if (!getToken()) return null;
  const result = await apiRequest<{ user: ApiUser }>("/api/me");
  return result.user;
}

export async function saveProfile(
  profile: ApiUser["profile"],
  account?: Pick<ApiUser, "firstName" | "lastName" | "username" | "email">,
) {
  return apiRequest<{ user: ApiUser }>("/api/me/profile", {
    method: "PUT",
    body: JSON.stringify({ profile, ...account }),
  });
}

export async function saveLessonProgress(progress: { lessonIndex: number; slideIndex: number }) {
  return apiRequest<{ user: ApiUser }>("/api/me/lesson-progress", {
    method: "PUT",
    body: JSON.stringify({ progress }),
  });
}

export async function claimLessonQuiz(lessonId: string, earnedXp: number) {
  return apiRequest<{ user: ApiUser }>(`/api/me/lessons/${lessonId}/quiz`, {
    method: "POST",
    body: JSON.stringify({ earnedXp }),
  });
}

export async function recordStreak() {
  return apiRequest<{ user: ApiUser }>("/api/me/streak", { method: "POST" });
}

export async function earnXp(source: "star" | "hard-star" | "recovery-quiz", count = 1) {
  return apiRequest<{ xp: number }>("/api/me/xp/earn", {
    method: "POST",
    body: JSON.stringify({ source, count }),
  });
}

export async function spendXp(amount: number) {
  return apiRequest<{ xp: number }>("/api/me/xp/spend", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function saveDailyAnswer(day: string, answerIndex: number) {
  return apiRequest<{ answerIndex: number }>(`/api/me/daily/${day}`, {
    method: "PUT",
    body: JSON.stringify({ answerIndex }),
  });
}

export async function loadDailyAnswer(day: string) {
  return apiRequest<{ answerIndex: number | null }>(`/api/me/daily/${day}`);
}

export async function buySkin(skinId: string) {
  return apiRequest<{ user: ApiUser }>("/api/me/skins/purchase", {
    method: "POST",
    body: JSON.stringify({ skinId }),
  });
}

export async function equipSkin(skinId: string) {
  return apiRequest<{ user: ApiUser }>("/api/me/skins/equip", {
    method: "PUT",
    body: JSON.stringify({ skinId }),
  });
}

export async function recordGameRun(difficulty: "easy" | "hard", stars: number) {
  return apiRequest<{ entries: { username: string; difficulty: "easy" | "hard"; stars: number; achievedAt: number }[] }>(
    "/api/me/game-runs",
    { method: "POST", body: JSON.stringify({ difficulty, stars }) },
  );
}

export async function loadLeaderboard(difficulty: "easy" | "hard") {
  return apiRequest<{ entries: { username: string; difficulty: "easy" | "hard"; stars: number; achievedAt: number }[] }>(
    `/api/me/leaderboard?difficulty=${difficulty}`,
  );
}
