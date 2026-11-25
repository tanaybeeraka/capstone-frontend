import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, DragEvent, FormEvent, InputHTMLAttributes, ReactNode, useContext, useEffect, useRef, useState } from "react";

type Screen = "signin" | "quiz" | "home" | "profile" | "leaderboard";

type Profile = {
  name: string;
  grade: string;
  sports: string[];
  injury: string;
  activities: string[];
  playsInstrument: string;
  instrument: string;
  reasonsForJoining: string[];
};

const initialProfile: Profile = {
  name: "",
  grade: "",
  sports: [],
  injury: "",
  activities: [],
  playsInstrument: "",
  instrument: "",
  reasonsForJoining: [],
};

function normalizeProfile(profile: Profile): Profile {
  const cleanAnswers = (answers: string[]) => answers.filter((answer) => answer !== "Opt out");
  return {
    ...profile,
    grade: profile.grade === "Opt out" ? "" : profile.grade,
    sports: cleanAnswers(profile.sports),
    injury: profile.injury === "Opt out" ? "" : profile.injury,
    activities: cleanAnswers(profile.activities),
    playsInstrument: profile.playsInstrument === "Opt out" ? "" : profile.playsInstrument,
    instrument: profile.playsInstrument === "Opt out" ? "" : profile.instrument,
    reasonsForJoining: cleanAnswers(profile.reasonsForJoining),
  };
}

const sports = ["Soccer", "Basketball", "Gymnastics", "Baseball", "Skating", "Swimming", "Other"];
const activities = ["Biking", "Climbing", "Dancing", "Running", "Scootering", "Playground", "Other"];

function Icon({
  children,
  size = 20,
  viewBox = "0 0 24 24",
}: {
  children: ReactNode;
  size?: number;
  viewBox?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function BoneSymbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M13.6 11.1a6.1 6.1 0 1 0-7.4 8.8l20.9 17.6a6 6 0 1 0 6.1-7.2L12.4 12.7" />
      <path d="M34.4 36.9a6.1 6.1 0 1 0 7.4-8.8L20.9 10.5a6 6 0 1 0-6.1 7.2l20.8 17.6" />
    </svg>
  );
}

function BoneLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="logo-mark" aria-hidden="true">
        <BoneSymbol />
      </span>
      {!compact && <span className="brand-name">Bone Buddies</span>}
    </div>
  );
}

type BennyExpression = "neutral" | "happy" | "sad";

type BennySkinId = "classic" | "cosmic" | "inferno" | "ocean" | "mint" | "royal" | "dino" | "bee" | "snow" | "rainbow";

const bennySkins: {
  id: BennySkinId;
  name: string;
  description: string;
  price: number;
  emoji: string;
  theme: string;
}[] = [
  { id: "classic", name: "Classic Benny", description: "Benny's original bone-bright look.", price: 0, emoji: "⭐", theme: "classic" },
  { id: "cosmic", name: "Cosmic Comet", description: "Ready to zoom through the galaxy.", price: 250, emoji: "🌙", theme: "cosmic" },
  { id: "inferno", name: "Firecracker", description: "Bringing the sizzle to every lesson.", price: 400, emoji: "🔥", theme: "inferno" },
  { id: "ocean", name: "Deep Sea Diver", description: "Cool colors for an undersea explorer.", price: 600, emoji: "🌊", theme: "ocean" },
  { id: "mint", name: "Mint Chip", description: "Fresh, sweet, and extra chill.", price: 800, emoji: "🍃", theme: "mint" },
  { id: "royal", name: "Royal Bones", description: "The fanciest bone in the kingdom.", price: 1200, emoji: "👑", theme: "royal" },
  { id: "dino", name: "Dino Dash", description: "A prehistoric pal with a trail of tiny spikes.", price: 1400, emoji: "🦖", theme: "dino" },
  { id: "bee", name: "Busy Bee", description: "Benny's buzzing by with wings and stripes.", price: 1600, emoji: "🐝", theme: "bee" },
  { id: "snow", name: "Snow Day", description: "All bundled up for a frosty adventure.", price: 1800, emoji: "❄️", theme: "snow" },
  { id: "rainbow", name: "Rainbow Pop", description: "A bright, colorful look for sunny days.", price: 2000, emoji: "🌈", theme: "rainbow" },
];

const BennySkinContext = createContext<BennySkinId>("classic");

function createBennyGameArtwork(skin: BennySkinId) {
  const palettes: Record<BennySkinId, { body: string; cap: string; brim: string }> = {
    classic: { body: "#fffdf5", cap: "#32b697", brim: "#237d69" },
    cosmic: { body: "#e8ddff", cap: "#7653c8", brim: "#4a328b" },
    inferno: { body: "#ffe0c4", cap: "#f06a4f", brim: "#bd3b3d" },
    ocean: { body: "#c9f1ff", cap: "#3296c5", brim: "#17668f" },
    mint: { body: "#e2f5c9", cap: "#69c894", brim: "#37845e" },
    royal: { body: "#fff0b5", cap: "#a26acb", brim: "#684493" },
    dino: { body: "#d6f29a", cap: "#71b94d", brim: "#477d3e" },
    bee: { body: "#fff1a8", cap: "#f0c744", brim: "#be8e2f" },
    snow: { body: "#e4f5ff", cap: "#8ec9ef", brim: "#4c92c0" },
    rainbow: { body: "#ffe4ef", cap: "#f184a5", brim: "#c75283" },
  };
  const colors = palettes[skin];
  const accessories: Partial<Record<BennySkinId, string>> = {
    cosmic: '<circle cx="27" cy="68" r="3" fill="#bca7ff"/><circle cx="175" cy="91" r="3" fill="#8bd8ee"/><path d="M22 131c-11 13-9 29 1 36 11-2 17-11 18-25" fill="#faf7ff" stroke="#24394d" stroke-width="4"/><path d="m23 155-11 5 8 9m15-22 11-2-5 14" fill="#ff9a72" stroke="#24394d" stroke-width="3"/>',
    inferno: '<path d="M155 114 177 138" stroke="#d88948" stroke-width="6" stroke-linecap="round"/><path d="M164 113c-6-10 2-15 4-24 2 6 6 8 6 13 5-7 5-14 3-20 12 10 16 21 9 31-6 8-17 8-22 0Z" fill="#ff9a4f" stroke="#24394d" stroke-width="3"/><path d="M173 113c-3-5 2-8 4-11 0 4 3 6 1 10-1 2-3 3-5 1Z" fill="#ffe17b"/>',
    ocean: '<path d="M176 106c-15 25-18 54-12 77 2 9 8 13 14 12 7-2 10-8 10-17 1-25-1-51-12-72Z" fill="#ffdc70" stroke="#24394d" stroke-width="4"/><path d="M167 141q10 6 20 0m-21 17q11 6 22 0" fill="none" stroke="#2b9bc4" stroke-width="5"/>',
    mint: '<path d="M58 84c-3-37 14-63 47-63s50 26 47 63" fill="none" stroke="#24394d" stroke-width="9"/><path d="M59 82c-2-35 15-57 46-57s48 22 46 57" fill="none" stroke="#76c995" stroke-width="5"/><rect x="51" y="77" width="18" height="32" rx="9" fill="#76c995" stroke="#24394d" stroke-width="4"/><rect x="141" y="77" width="18" height="32" rx="9" fill="#76c995" stroke="#24394d" stroke-width="4"/>',
    royal: '<path d="m65 34-4-27 19 17 25-20 25 20 19-17-4 27Z" fill="#ffd65d" stroke="#24394d" stroke-width="4" stroke-linejoin="round"/><path d="M65 34h80v9H65Z" fill="#f3b93f" stroke="#24394d" stroke-width="4"/><circle cx="79" cy="28" r="4" fill="#f1845f"/><circle cx="105" cy="25" r="4" fill="#8ad6ee"/><circle cx="131" cy="28" r="4" fill="#c996e7"/>',
    dino: '<path d="m64 61 9-16 9 13 10-17 10 15 11-17 10 17 10-12 8 18" fill="#a5d957" stroke="#315c3a" stroke-width="4" stroke-linejoin="round"/><path d="M151 158c13-2 23 3 30 12-10 2-17 7-22 15-7-8-10-17-8-27Z" fill="#7fc84c" stroke="#315c3a" stroke-width="4"/>',
    bee: '<path d="M66 111c-20-20-31-13-29-1 2 10 14 15 28 13m79-12c20-20 31-13 29-1-2 10-14 15-28 13" fill="#f7fcff" stroke="#34485a" stroke-width="4"/><path d="M72 138q32 12 64 0m-63 14q31 12 61 0m-58 14q28 10 55 0" fill="none" stroke="#edbd42" stroke-width="7" stroke-linecap="round"/>',
    snow: '<path d="M58 84c-3-37 14-63 47-63s50 26 47 63" fill="none" stroke="#34485a" stroke-width="9"/><path d="M59 82c-2-35 15-57 46-57s48 22 46 57" fill="none" stroke="#a9d8f4" stroke-width="5"/><circle cx="59" cy="91" r="11" fill="#8ec9ef" stroke="#34485a" stroke-width="4"/><circle cx="151" cy="91" r="11" fill="#8ec9ef" stroke="#34485a" stroke-width="4"/><path d="M66 133q38 12 76 0v14H66Z" fill="#f1845f" stroke="#34485a" stroke-width="3"/>',
    rainbow: '<path d="M58 55c8-32 26-46 48-46s40 14 48 46" fill="none" stroke="#ef6c71" stroke-width="8"/><path d="M65 56c7-25 21-36 41-36s34 11 41 36" fill="none" stroke="#f6b94a" stroke-width="7"/><path d="M73 56c6-18 17-26 33-26s27 8 33 26" fill="none" stroke="#65bd81" stroke-width="6"/><path d="M81 56c5-12 13-17 25-17s20 5 25 17" fill="none" stroke="#62a9db" stroke-width="5"/>',
  };
  const accessory = accessories[skin] ?? "";

  const artwork = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 220"><ellipse cx="107" cy="204" rx="61" ry="11" fill="#24394d" opacity=".18"/><path d="M71 52c-20-15-36 9-26 25 4 7 10 9 17 9l-5 73c-7 1-13 6-15 13-3 11 5 23 17 23 6 0 11-3 14-7 8 8 20 6 26-2 7 9 19 10 27 2 3 4 8 7 14 7 12 0 20-12 17-23-2-7-8-12-15-13l-5-73c7 0 13-2 17-9 10-16-6-40-26-25-13-11-43-11-57 0Z" fill="${colors.body}" stroke="#24394d" stroke-width="5" stroke-linejoin="round"/><path d="M63 52c9-31 51-37 74-13l-9 13c-16-9-43-10-65 0Z" fill="${colors.cap}" stroke="#24394d" stroke-width="5" stroke-linejoin="round"/><path d="M126 49c17-5 31-2 41 4-9 6-25 7-41 3" fill="${colors.brim}" stroke="#24394d" stroke-width="5" stroke-linejoin="round"/>${accessory}<circle cx="83" cy="92" r="5" fill="#24394d"/><circle cx="125" cy="92" r="5" fill="#24394d"/><path d="M76 82c6-5 12-5 17-1m23 0c6-4 12-3 16 2M88 110c7 10 24 10 32 0M70 107l8 1m54 0 8-1" fill="none" stroke="#24394d" stroke-width="4" stroke-linecap="round"/><path d="M60 110c-17 0-25 7-33 17-6 7-9 13-12 18m135-35c17 0 25 7 33 16 4 5 7 8 11 10M25 140c-1-10 2-14 8-17m-8 17c-8-4-10-9-8-14m174 10c0-10-4-14-9-17m9 17c8-5 9-10 6-15M78 186c-4 10-10 13-19 14m71-14c3 10 10 13 19 14" fill="none" stroke="#24394d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork)}`;
}

function Mascot({ small = false, expression = "happy", skin = "classic" }: { small?: boolean; expression?: BennyExpression; skin?: BennySkinId }) {
  return (
    <svg
      className={`mascot ${small ? "mascot-small" : ""} mascot-${expression} mascot-skin-${skin}`}
      viewBox="0 0 210 220"
      role="img"
      aria-label={`Benny, a ${expression === "sad" ? "frowning" : expression === "neutral" ? "waiting" : "smiling"} bone mascot wearing the ${bennySkins.find((item) => item.id === skin)?.name ?? "Classic Benny"} skin${skin === "cosmic" ? " with a rocket ship" : skin === "ocean" ? " with a surfboard" : skin === "royal" ? " wearing a crown" : skin === "inferno" ? " holding a torch" : skin === "mint" ? " wearing headphones" : skin === "dino" ? " with dinosaur spikes and a tail" : skin === "bee" ? " with bee stripes and wings" : skin === "snow" ? " wearing earmuffs and a scarf" : skin === "rainbow" ? " with a rainbow above his cap" : ""}`}
    >
      <ellipse className="mascot-shadow" cx="107" cy="204" rx="61" ry="11" />
      <path className="mascot-body" d="M71 52c-20-15-36 9-26 25 4 7 10 9 17 9l-5 73c-7 1-13 6-15 13-3 11 5 23 17 23 6 0 11-3 14-7 8 8 20 6 26-2 7 9 19 10 27 2 3 4 8 7 14 7 12 0 20-12 17-23-2-7-8-12-15-13l-5-73c7 0 13-2 17-9 10-16-6-40-26-25-13-11-43-11-57 0Z" />
      <path className="mascot-cap" d="M63 52c9-31 51-37 74-13l-9 13c-16-9-43-10-65 0Z" />
      <path className="mascot-cap-brim" d="M126 49c17-5 31-2 41 4-9 6-25 7-41 3" />
      <circle className="mascot-eye" cx="83" cy="92" r="5" />
      <circle className="mascot-eye" cx="125" cy="92" r="5" />
      <path className="mascot-brow" d={expression === "sad" ? "M76 80c6 4 12 4 17 0M116 82c6 4 12 4 16 0" : "M76 82c6-5 12-5 17-1M116 81c6-4 12-3 16 2"} />
      <path className="mascot-mouth" d={expression === "sad" ? "M88 120c7-10 24-10 32 0" : expression === "neutral" ? "M88 112h32" : "M88 110c7 10 24 10 32 0"} />
      <path className="mascot-cheek" d="M70 107l8 1M132 108l8-1" />
      <path className="mascot-leg" d="M78 186c-4 10-10 13-19 14M130 186c3 10 10 13 19 14" />
      {skin === "cosmic" && (
        <g aria-hidden="true" className="benny-accessory rocket-accessory">
          <path d="M12 169c-8 9-7 16-2 22 7-2 12-7 13-15" fill="#ff9a72" stroke="#24394d" strokeWidth="3" strokeLinejoin="round" />
          <path d="M23 127c-12 15-15 35-5 47 12 2 24-8 28-27 2-10 0-19-3-26-8 0-15 2-20 6Z" fill="#faf7ff" stroke="#24394d" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="m19 160-12 5 8 12M38 145l12-1-5 16" fill="#ff9a72" stroke="#24394d" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="31" cy="145" r="5" fill="#8bd8ee" stroke="#24394d" strokeWidth="2.5" />
          <path d="m22 174-3 9m11-8-1 10" stroke="#ffd76e" strokeWidth="3" strokeLinecap="round" />
          <path d="m32 128 2-5m6 8 4-3" stroke="#bca7ff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {skin === "ocean" && (
        <g aria-hidden="true" className="benny-accessory surfboard-accessory">
          <path d="M178 105c-13 22-18 50-13 74 2 8 7 12 12 11 6-1 9-7 9-15 1-24 0-48-8-70Z" fill="#ffdc70" stroke="#24394d" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M169 137c6 3 12 3 18 0M166 151c7 3 14 3 20 0" fill="none" stroke="#2b9bc4" strokeWidth="5" strokeLinecap="round" />
          <path d="M176 179c-3 1-6 2-9 2" fill="none" stroke="#f1845f" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {skin === "inferno" && (
        <g aria-hidden="true" className="benny-accessory torch-accessory">
          <path d="M181 97 187 137" fill="none" stroke="#24394d" strokeWidth="8" strokeLinecap="round" />
          <path d="M181 97 187 137" fill="none" stroke="#d88948" strokeWidth="4" strokeLinecap="round" />
          <path d="M171 92c-4-8 2-12 4-17 1 5 4 6 4 10 4-6 4-11 3-16 9 8 13 17 8 24-5 8-15 6-19-1Z" fill="#ff9a4f" stroke="#24394d" strokeWidth="3" strokeLinejoin="round" />
          <path d="M179 93c-2-4 1-6 3-9 0 3 3 5 1 8-1 2-3 2-4 1Z" fill="#ffe17b" />
        </g>
      )}
      {skin === "mint" && (
        <g aria-hidden="true" className="benny-accessory headphones-accessory">
          <path d="M58 84c-3-37 14-63 47-63s50 26 47 63" fill="none" stroke="#24394d" strokeWidth="8" strokeLinecap="round" />
          <path d="M59 82c-2-35 15-57 46-57s48 22 46 57" fill="none" stroke="#76c995" strokeWidth="4" strokeLinecap="round" />
          <rect x="51" y="77" width="17" height="31" rx="8" fill="#76c995" stroke="#24394d" strokeWidth="3.5" />
          <rect x="142" y="77" width="17" height="31" rx="8" fill="#76c995" stroke="#24394d" strokeWidth="3.5" />
          <path d="M56 87h7m84 0h7" stroke="#f5fff0" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {skin === "royal" && (
        <g aria-hidden="true" className="benny-accessory crown-accessory">
          <path d="m65 31-4-25 18 15 26-18 25 18 18-15-4 25Z" fill="#ffd65d" stroke="#24394d" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M65 31h79v8H65z" fill="#f3b93f" stroke="#24394d" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="78" cy="25" r="3.5" fill="#f1845f" />
          <circle cx="105" cy="22" r="4" fill="#8ad6ee" />
          <circle cx="132" cy="25" r="3.5" fill="#c996e7" />
        </g>
      )}
      {skin === "dino" && (
        <g aria-hidden="true" className="benny-accessory dino-accessory">
          <path d="m64 61 9-16 9 13 10-17 10 15 11-17 10 17 10-12 8 18" fill="#a5d957" stroke="#315c3a" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M151 158c13-2 23 3 30 12-10 2-17 7-22 15-7-8-10-17-8-27Z" fill="#7fc84c" stroke="#315c3a" strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      )}
      {skin === "bee" && (
        <g aria-hidden="true" className="benny-accessory bee-accessory">
          <path d="M66 111c-20-20-31-13-29-1 2 10 14 15 28 13M144 111c20-20 31-13 29-1-2 10-14 15-28 13" fill="#f7fcff" stroke="#34485a" strokeWidth="3.5" />
          <path d="M72 138c20 8 42 8 64 0M73 151c20 8 40 8 61 0M76 164c17 7 36 7 55 0" fill="none" stroke="#edbd42" strokeWidth="6" strokeLinecap="round" />
          <path d="M67 52c10-20 24-29 39-29 18 0 34 12 43 31" fill="none" stroke="#f2c94c" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {skin === "snow" && (
        <g aria-hidden="true" className="benny-accessory snow-accessory">
          <path d="M58 84c-3-37 14-63 47-63s50 26 47 63" fill="none" stroke="#34485a" strokeWidth="8" strokeLinecap="round" />
          <path d="M59 82c-2-35 15-57 46-57s48 22 46 57" fill="none" stroke="#a9d8f4" strokeWidth="4" strokeLinecap="round" />
          <circle cx="59" cy="91" r="10" fill="#8ec9ef" stroke="#34485a" strokeWidth="3" />
          <circle cx="151" cy="91" r="10" fill="#8ec9ef" stroke="#34485a" strokeWidth="3" />
          <path d="M66 132c18 9 57 9 76 0v13H66z" fill="#f1845f" stroke="#34485a" strokeWidth="3" strokeLinejoin="round" />
          <path d="m133 142 12 8-7 19-12-8Z" fill="#f1845f" stroke="#34485a" strokeWidth="3" strokeLinejoin="round" />
          <path d="M77 138h10m10 0h10m10 0h10" stroke="#fff4dd" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {skin === "rainbow" && (
        <g aria-hidden="true" className="benny-accessory rainbow-accessory" fill="none" strokeLinecap="round">
          <path d="M58 55c8-32 26-46 48-46s40 14 48 46" stroke="#ef6c71" strokeWidth="8" />
          <path d="M65 56c7-25 21-36 41-36s34 11 41 36" stroke="#f6b94a" strokeWidth="7" />
          <path d="M73 56c6-18 17-26 33-26s27 8 33 26" stroke="#65bd81" strokeWidth="7" />
          <path d="M81 56c5-12 13-17 25-17s20 5 25 17" stroke="#62a9db" strokeWidth="6" />
          <path d="m45 54 3-6m-7 14 7-1m115-7 3-6m-2 15 7 1" stroke="#f5c955" strokeWidth="3" />
        </g>
      )}
      <path className="mascot-arm" d="M60 110c-17 0-25 7-33 17-6 7-9 13-12 18" />
      <path className="mascot-hand" d="M25 140c-1-10 2-14 8-17M25 140c-8-4-10-9-8-14" />
      <path className="mascot-arm" d="M150 110c17 0 25 7 33 16 4 5 7 8 11 10" />
      <path className="mascot-hand" d="M191 136c0-10-4-14-9-17M191 136c8-5 9-10 6-15" />
    </svg>
  );
}

function BennyReaction({ expression, message }: { expression: BennyExpression; message: string }) {
  const skin = useContext(BennySkinContext);
  return (
    <div className={`benny-reaction benny-reaction-${expression}`} role="status" aria-live="polite" aria-label={message}>
      <p className="benny-speech">{message}</p>
      <Mascot small expression={expression} skin={skin} />
    </div>
  );
}

type LessonProgress = {
  lessonIndex: 0 | 1 | 2 | 3;
  slideIndex: number;
};

type Account = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  profile?: Profile;
  onboardingCompleted?: boolean;
  xp?: number;
  ownedSkins?: BennySkinId[];
  equippedSkin?: BennySkinId;
  lesson1QuizCompleted?: boolean;
  lesson2QuizCompleted?: boolean;
  lesson2FinalQuizCompleted?: boolean;
  lesson2FinalQuizScoringCompleted?: boolean;
  lesson3QuizCompleted?: boolean;
  lesson4QuizCompleted?: boolean;
  lessonProgress?: LessonProgress;
};

type GameDifficulty = "easy" | "hard";

type LeaderboardEntry = {
  username: string;
  difficulty: GameDifficulty;
  stars: number;
  achievedAt: number;
};

const accountsKey = "bone-buddies-accounts";
const leaderboardKey = "bone-buddies-leaderboard-v2";

function loadLeaderboard(): LeaderboardEntry[] {
  const saved = window.localStorage.getItem(leaderboardKey);
  if (!saved) return [];
  const entries: unknown = JSON.parse(saved);
  if (!Array.isArray(entries)) return [];
  return entries.filter((entry): entry is LeaderboardEntry =>
    typeof entry?.username === "string" &&
    (entry.difficulty === "easy" || entry.difficulty === "hard") &&
    Number.isInteger(entry.stars) &&
    entry.stars >= 0 &&
    Number.isFinite(entry.achievedAt)
  );
}

function loadAccounts(): Record<string, Account> {
  const saved = window.localStorage.getItem(accountsKey);
  return saved ? JSON.parse(saved) : {};
}

function hasCompletedOnboarding(account: Account) {
  // Accounts created before this flag existed count as onboarded if they have a profile or any progress.
  return Boolean(
    account.onboardingCompleted ||
      account.profile ||
      account.xp ||
      account.lesson1QuizCompleted ||
      account.lesson2QuizCompleted ||
      account.lesson2FinalQuizCompleted ||
      account.lesson3QuizCompleted ||
      account.lesson4QuizCompleted,
  );
}

function getLessonProgress(account: Account | null): LessonProgress | undefined {
  const progress = account?.lessonProgress;
  if (
    !progress ||
    (progress.lessonIndex !== 0 &&
      progress.lessonIndex !== 1 &&
      progress.lessonIndex !== 2 &&
      progress.lessonIndex !== 3) ||
    !Number.isInteger(progress.slideIndex) ||
    progress.slideIndex < 0
  ) {
    return undefined;
  }
  return progress;
}

function saveAccount(account: Account, accounts: Record<string, Account>) {
  accounts[account.username.toLowerCase()] = account;
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

function Field({
  label,
  icon,
  ...inputProps
}: {
  label: string;
  icon: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      <span>{label}</span>
      <span className="input-wrap">
        <Icon>{icon}</Icon>
        <input required {...inputProps} />
      </span>
    </label>
  );
}

const personIcon = <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>;
const lockIcon = <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>;

function SignIn({ onContinue }: { onContinue: (account: Account, isNew: boolean) => void }) {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function switchMode() {
    setMode(mode === "signin" ? "create" : "signin");
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const invalidField = form.querySelector<HTMLInputElement>(":invalid");
    if (invalidField) {
      const label = invalidField.labels?.[0]?.textContent?.trim() || "This field";
      setError(`${label}: ${invalidField.validationMessage}`);
      invalidField.focus();
      return;
    }

    let accounts: Record<string, Account>;
    try {
      accounts = loadAccounts();
    } catch {
      setError("We couldn’t read saved accounts in this browser. Please refresh the page and try again.");
      return;
    }
    const usernameKey = username.trim().toLowerCase();

    if (mode === "signin") {
      const account = accounts[usernameKey];
      if (!account || account.password !== password) {
        setError("That username and password don’t match. Try again!");
        return;
      }
      onContinue(account, false);
      return;
    }

    if (accounts[usernameKey]) {
      setError("That username is already taken. Try a different one!");
      return;
    }
    const emailKey = email.trim().toLowerCase();
    if (Object.values(accounts).some((account) => account.email.toLowerCase() === emailKey)) {
      setError("An account with that email already exists. Try signing in!");
      return;
    }

    const account: Account = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
    };
    try {
      saveAccount(account, accounts);
    } catch {
      setError("Your account couldn’t be saved in this browser. Check that browser storage is enabled, then try again.");
      return;
    }
    onContinue(account, true);
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <BoneLogo />
        <div className="auth-copy">
          <span className="eyebrow">LEARN • PLAY • HEAL</span>
          <h1>Every bone has<br />a story to tell.</h1>
          <p>
            Join Benny Bone on a curious adventure through cracks, casts, and
            the amazing ways your body gets back in action.
          </p>
        </div>
        <div className="doodle doodle-one">+</div>
        <div className="doodle doodle-two">×</div>
        <div className="doodle-ring" />
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><BoneLogo /></div>
        <div className="auth-card">
          <span className="eyebrow">WELCOME, EXPLORER!</span>
          <h2>{mode === "signin" ? "Ready to jump back in?" : "Start your bone journey"}</h2>
          <p className="muted">
            {mode === "signin"
              ? "Sign in to keep your learning streak going."
              : "Ask a grown-up to help you create your account."}
          </p>

          <form onSubmit={submit} noValidate>
            {mode === "create" && (
              <>
                <div className="field-row">
                  <Field
                    label="First name"
                    icon={personIcon}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                  <Field
                    label="Last name"
                    icon={personIcon}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </div>
                <Field
                  label="Email"
                  icon={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="grownup@example.com"
                  autoComplete="email"
                />
              </>
            )}
            <Field
              label="Username"
              icon={<><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={mode === "signin" ? "Enter your username" : "Pick a fun username"}
              autoComplete="username"
              pattern="[A-Za-z0-9_]{3,20}"
              title="3–20 letters, numbers, or underscores"
            />
            <Field
              label="Secret password"
              icon={lockIcon}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signin" ? "Enter your password" : "Create a password"}
              minLength={4}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit">
              {mode === "signin" ? "Let’s go!" : "Create my account"}
              <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
            </button>
          </form>

          <div className="divider"><span>OR</span></div>
          <button className="text-button" type="button" onClick={switchMode}>
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
          <p className="grownup-note">
            <Icon size={17}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></Icon>
            Grown-up approved. We keep your information safe.
          </p>
        </div>
      </section>
    </main>
  );
}

function ChoiceButton({
  active,
  children,
  onClick,
  status,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  status?: "correct" | "incorrect";
}) {
  return (
    <button className={`choice ${active ? "choice-active" : ""} ${status ? `choice-${status}` : ""}`} type="button" onClick={onClick}>
      <span>{children}</span>
      <span className="choice-check">{active ? "✓" : ""}</span>
    </button>
  );
}

function Questionnaire({
  profile,
  setProfile,
  onDone,
}: {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const questions = [
    {
      kicker: "FIRST, THE BASICS",
      title: `Nice to meet you, ${profile.name}!`,
      helper: "What grade are you in?",
      content: (
        <div className="grade-grid">
          {["1st", "2nd", "3rd", "4th", "5th", "6th", "Other"].map((grade) => (
            <ChoiceButton key={grade} active={profile.grade === grade} onClick={() => setProfile({ ...profile, grade })}>
              {grade === "Other" ? grade : `${grade} grade`}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    {
      kicker: "YOUR BONE BUDDIES STORY",
      title: "What brought you here?",
      helper: "Pick the answer that fits you best.",
      content: (
        <div className="stacked-choices">
          {[
            "I heard about it",
            "It’s part of my school curriculum",
            "I broke a bone and want to learn about it",
            "Other",
          ].map((reason) => (
            <ChoiceButton
              key={reason}
              active={profile.reasonsForJoining.includes(reason)}
              onClick={() => {
                const isSelected = profile.reasonsForJoining.includes(reason);
                setProfile({
                  ...profile,
                  reasonsForJoining: isSelected
                    ? profile.reasonsForJoining.filter((item) => item !== reason)
                    : [...profile.reasonsForJoining, reason],
                });
              }}
            >
              {reason}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    {
      kicker: "YOUR ACTIVE SIDE",
      title: "Which sports do you play?",
      helper: "Pick as many as you like. No sport? You can skip this one.",
      content: (
        <div className="choice-grid">
          {sports.map((sport) => (
            <ChoiceButton
              key={sport}
              active={profile.sports.includes(sport)}
              onClick={() => {
                const isSelected = profile.sports.includes(sport);
                setProfile({
                  ...profile,
                  sports: isSelected
                    ? profile.sports.filter((item) => item !== sport)
                    : [...profile.sports, sport],
                });
              }}
            >
              {sport}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    {
      kicker: "YOUR MUSICAL SIDE",
      title: "Do you play an instrument?",
      helper: "Music helps your hands, arms, and brain work together!",
      content: (
        <div className="instrument-question">
          <div className="choice-grid">
            {["Yes, I do!", "Not right now"].map((answer) => (
              <ChoiceButton
                key={answer}
                active={profile.playsInstrument === answer}
                onClick={() =>
                  setProfile({
                    ...profile,
                    playsInstrument: answer,
                    instrument: answer === "Yes, I do!" ? profile.instrument : "",
                  })
                }
              >
                {answer}
              </ChoiceButton>
            ))}
          </div>
          {profile.playsInstrument === "Yes, I do!" && (
            <label className="instrument-field">
              <span>What instrument do you play?</span>
              <span className="input-wrap">
                <Icon>
                  <path d="M9 18V5l10-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="16" cy="16" r="3" />
                </Icon>
                <input
                  value={profile.instrument}
                  onChange={(event) => setProfile({ ...profile, instrument: event.target.value })}
                  placeholder="For example, piano or drums"
                  autoFocus
                />
              </span>
            </label>
          )}
        </div>
      ),
    },
    {
      kicker: "YOUR BONE HISTORY",
      title: "Have you ever hurt a bone?",
      helper: "It’s totally okay if you’re not sure.",
      content: (
        <div className="stacked-choices">
          {["Yes, I broke a bone", "I had a sprain or bruise", "Nope, not yet", "I’m not sure"].map((answer) => (
            <ChoiceButton key={answer} active={profile.injury === answer} onClick={() => setProfile({ ...profile, injury: answer })}>
              {answer}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    {
      kicker: "ONE LAST THING",
      title: "What else gets you moving?",
      helper: "This helps Benny pick examples you’ll like.",
      content: (
        <div className="choice-grid">
          {activities.map((activity) => (
            <ChoiceButton
              key={activity}
              active={profile.activities.includes(activity)}
              onClick={() => {
                const isSelected = profile.activities.includes(activity);
                setProfile({
                  ...profile,
                  activities: isSelected
                    ? profile.activities.filter((item) => item !== activity)
                    : [...profile.activities, activity],
                });
              }}
            >
              {activity}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
  ];
  const current = questions[step];

  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <BoneLogo />
        <button className="quiet-button" type="button" onClick={onDone}>Finish later</button>
      </header>
      <div className="quiz-progress">
        <div className="progress-copy"><span>ABOUT YOU</span><strong>{step + 1} of {questions.length}</strong></div>
        <div className="progress-track"><div style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      </div>

      <section className="quiz-card">
        <div className="quiz-mascot"><Mascot small /></div>
        <span className="eyebrow">{current.kicker}</span>
        <h1>{current.title}</h1>
        <p className="muted">{current.helper}</p>
        <p className="question-skip-note">Every question is optional. Select Next to skip.</p>
        <div className="question-content">{current.content}</div>
        <div className="quiz-actions">
          <button className="back-button" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <Icon><path d="M19 12H5M11 18l-6-6 6-6" /></Icon> Back
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => (step === questions.length - 1 ? onDone() : setStep(step + 1))}
          >
            {step === questions.length - 1 ? "Show my home" : "Next"}
            <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
          </button>
        </div>
      </section>
    </main>
  );
}

type FractureType = "stable" | "displaced" | "oblique" | "transverse";
type FractureIllustration = "bone" | "fracture" | "overview" | "assessment" | "warning" | "help";

function FractureSlideArt({ kind }: { kind: FractureIllustration }) {
  const labels: Record<FractureIllustration, string> = {
    bone: "Illustration of a strong bone",
    fracture: "Illustration of a bone X-ray with a highlighted crack",
    overview: "Illustration comparing bone alignment and crack direction",
    assessment: "Illustration of a medical X-ray being checked",
    warning: "Accurate skeleton illustration with a warning sign",
    help: "Illustration showing a child asking a grown-up for help",
  };

  if (kind === "bone") {
    return (
      <img
        className="fracture-slide-skeleton"
        src="/human-skeleton-front-no-labels.svg"
        alt={labels.bone}
      />
    );
  }

  if (kind === "overview" || kind === "warning") {
    return (
      <div className={`fracture-real-art fracture-real-art-${kind}`} role="img" aria-label={labels[kind]}>
        <img src="/human-skeleton-front-no-labels.svg" alt="" />
        {kind === "warning" && (
          <svg className="fracture-real-art-overlay" viewBox="0 0 360 360" aria-hidden="true">
            <path d="M288 22 342 115h-108Z" fill="#fff0bd" stroke="#d98f32" strokeWidth="5" strokeLinejoin="round" />
            <path d="M288 48v31m0 16v2" stroke="#97551f" strokeWidth="6" strokeLinecap="round" />
          </svg>
        )}
      </div>
    );
  }

  if (kind === "assessment") {
    return (
      <svg className="fracture-slide-art fracture-slide-art-assessment" viewBox="0 0 360 360" role="img" aria-label="Forearm X-ray with a highlighted crack">
        <circle cx="180" cy="180" r="151" fill="#dff3fa" />
        <rect x="69" y="34" width="222" height="292" rx="24" fill="#16476d" stroke="#286f93" strokeWidth="7" />
        <rect x="84" y="50" width="192" height="260" rx="15" fill="#0f3559" />
        <path d="M101 105q20 13 0 27m158-27q-20 13 0 27M101 218q20 13 0 27m158-27q-20 13 0 27" fill="none" stroke="#5aa8c3" strokeWidth="6" strokeLinecap="round" opacity=".45" />
        <path d="M137 70c-10-4-20 3-20 14 0 9 7 15 17 17l3 22-4 37 5 42 3 48-9 13c-5 8-2 18 6 22 7 4 15 1 21-5l12-5-5-25-4-48 4-42-5-37 2-23c9-4 13-11 11-20-2-10-11-16-21-13-5 2-9 4-16 3Z" fill="#b9f4f3" stroke="#efffff" strokeWidth="4" strokeLinejoin="round" />
        <path d="M211 70c10-4 20 3 20 14 0 9-7 15-17 17l-3 22 4 37-5 42-3 48 9 13c5 8 2 18-6 22-7 4-15 1-21-5l-12-5 5-25 4-48-4-42 5-37-2-23c-9-4-13-11-11-20 2-10 11-16 21-13 5 2 9 4 16 3Z" fill="#b9f4f3" stroke="#efffff" strokeWidth="4" strokeLinejoin="round" />
        <path d="m132 173 11-7 12 8 12-8" fill="none" stroke="#fff4dd" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m132 173 11-7 12 8 12-8" fill="none" stroke="#ff805f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M244 121 171 169" fill="none" stroke="#ff9a72" strokeWidth="4" strokeLinecap="round" />
        <path d="m179 154-10 15 18-2" fill="#ff9a72" />
        <circle cx="244" cy="121" r="7" fill="#fff4dd" stroke="#ff9a72" strokeWidth="4" />
      </svg>
    );
  }

  return (
    <svg className={`fracture-slide-art fracture-slide-art-${kind}`} viewBox="0 0 360 360" role="img" aria-label={labels[kind]}>
      <circle cx="180" cy="180" r="151" fill="#dff3fa" />
      <circle cx="180" cy="180" r="126" fill="#f8fdff" />
      {kind === "fracture" && (
        <>
          <rect x="83" y="52" width="194" height="254" rx="28" fill="#16476d" />
          <path d="M105 132q22 18 0 37m150-37q-22 18 0 37m-150 15q22 18 0 37m150-37q-22 18 0 37" fill="none" stroke="#68b7cb" strokeWidth="8" strokeLinecap="round" opacity=".65" />
          <path d="M165 85c-17-10-28 9-13 22l6 45 4 20 15 7 15-7 4-20 6-45c15-13 4-32-13-22-7 5-10 9-12 9s-5-4-12-9Zm-2 111-5 44c-15 13-4 32 13 22 7-5 10-9 12-9s5 4 12 9c17 10 28-9 13-22l-5-44-15-7Z" fill="#dcf8f6" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
          <path d="m154 173 15-8 12 9 14-8" fill="none" stroke="#ff896a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="257" cy="232" r="36" fill="#fff4dd" stroke="#e5b753" strokeWidth="6" />
          <path d="m232 257-21 25" stroke="#e5b753" strokeWidth="11" strokeLinecap="round" />
          <path d="m243 232 9 8 15-18" fill="none" stroke="#d86b52" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === "help" && (
        <>
          <path d="M75 273c4-49 22-74 53-74s49 25 53 74" fill="#7bc9b1" stroke="#286f93" strokeWidth="7" strokeLinejoin="round" />
          <circle cx="128" cy="143" r="39" fill="#f6d2b5" stroke="#286f93" strokeWidth="7" />
          <path d="M91 141c0-28 17-48 40-48 22 0 38 16 39 42-15-3-29-12-38-25-8 15-23 25-41 31Z" fill="#38536d" stroke="#286f93" strokeWidth="6" strokeLinejoin="round" />
          <path d="M106 154q9 7 18 0m14 0q8 7 16 0" fill="none" stroke="#286f93" strokeWidth="4" strokeLinecap="round" />
          <path d="M183 108c0-25 18-43 43-43h54c20 0 32 16 32 34s-13 34-32 34h-24l-23 18v-18h-7c-25 0-43-13-43-25Z" fill="#fff" stroke="#286f93" strokeWidth="6" strokeLinejoin="round" />
          <path d="M220 98h57m-57 18h39" stroke="#63a98f" strokeWidth="6" strokeLinecap="round" />
          <path d="M207 256c16-16 32-16 48 0m-24-25v51" fill="none" stroke="#e8ad4c" strokeWidth="7" strokeLinecap="round" />
          <circle cx="231" cy="230" r="12" fill="#f4d36d" stroke="#286f93" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}

function FractureXray({ type }: { type: FractureType }) {
  const isDisplaced = type === "displaced";
  const crackPath = type === "oblique"
    ? "M178 239 198 250 189 263 215 276 205 290 237 305"
    : "M178 256 193 248 207 260 222 251 240 258";

  return (
    <svg className="fracture-xray-art" viewBox="0 0 420 520" role="img" aria-label={`${type} fracture shown on a friendly X-ray illustration`}>
      <defs>
        <linearGradient id="xray-bone" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4ffff" />
          <stop offset=".5" stopColor="#b9f4f3" />
          <stop offset="1" stopColor="#72d4e5" />
        </linearGradient>
        <filter id="xray-glow" x="-60%" y="-30%" width="220%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <marker id="fracture-arrow" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto">
          <path d="M0 0 10 5 0 10Z" fill="#ff9a72" />
        </marker>
      </defs>
      <rect x="14" y="14" width="392" height="492" rx="34" fill="#123d68" />
      <circle cx="210" cy="260" r="170" fill="#1b5681" opacity=".36" />
      <path d="M95 155q48 34 0 68m230-68q-48 34 0 68M91 245q52 34 3 68m235-68q-52 34-3 68M100 335q42 27 9 54m211-54q-42 27-9 54" fill="none" stroke="#61b9d1" strokeWidth="9" strokeLinecap="round" opacity=".32" />
      <path d="M180 48C155 38 139 55 145 77c4 16 22 22 35 31l10 130q20 10 40 0l10-130c13-9 31-15 35-31 6-22-10-39-35-29-12 5-21 20-30 20s-18-15-30-20Z" fill="#b9f4f3" opacity=".75" filter="url(#xray-glow)" />
      <path d="M180 48C155 38 139 55 145 77c4 16 22 22 35 31l10 130q20 10 40 0l10-130c13-9 31-15 35-31 6-22-10-39-35-29-12 5-21 20-30 20s-18-15-30-20Z" fill="url(#xray-bone)" stroke="#efffff" strokeWidth="4" strokeLinejoin="round" />
      <path
        d="M190 278 180 408c-13 9-31 15-35 31-6 22 10 39 35 29 12-5 21-20 30-20s18 15 30 20c25 10 41-7 35-29-4-16-22-22-35-31l-10-130q-20-10-40 0Z"
        transform={isDisplaced ? "translate(22 8)" : undefined}
        fill="url(#xray-bone)"
        stroke="#efffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d={crackPath} fill="none" stroke="#fff4dd" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d={crackPath} fill="none" stroke="#ff805f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M332 154Q312 190 ${isDisplaced ? "238 275" : "218 258"}`} fill="none" stroke="#ff9a72" strokeWidth="4" strokeLinecap="round" markerEnd="url(#fracture-arrow)" />
      <rect x="247" y="111" width="124" height="34" rx="17" fill="#fff4dd" />
      <text x="309" y="133" textAnchor="middle" fill="#17476d" fontSize="13" fontWeight="800" letterSpacing=".4">CRACK HERE</text>
      <text x="42" y="474" fill="#b9e8f4" fontSize="13" fontWeight="700" letterSpacing="1.4">BONE X-RAY</text>
      <circle cx="366" cy="467" r="5" fill="#ff9a72" />
    </svg>
  );
}

const fractureSlides: {
  eyebrow: string;
  title: string;
  illustration?: FractureIllustration;
  fractureType?: FractureType;
  term?: string;
  pronunciation?: string;
  paragraphs?: string[];
  terms?: string[];
  points: string[];
  note?: string;
  question: string;
  options: string[];
  answer: number;
}[] = [
  {
    eyebrow: "BONES CAN GET HURT",
    title: "Bones are strong, but not unbreakable",
    illustration: "bone",
    paragraphs: ["A very hard fall, hit, or twist can sometimes crack or break a bone."],
    points: ["A break can be a tiny crack or a bigger split.", "You cannot always see a broken bone from the outside."],
    question: "Can a broken bone always be seen from the outside?",
    options: ["Yes, every break is easy to see.", "No, some breaks cannot be seen from the outside.", "Only small cracks can be seen."],
    answer: 1,
  },
  {
    eyebrow: "TWO WORDS, ONE MEANING",
    title: "A break is a fracture",
    illustration: "fracture",
    term: "Fracture",
    pronunciation: "FRAK-cher",
    paragraphs: ["Fracture is the grown-up, medical word for a broken bone. They mean the same thing."],
    points: ["A small crack is still a fracture.", "A big break is also a fracture."],
    question: "What does “fracture” mean?",
    options: ["A broken bone.", "A bruise on the skin.", "A bone that is fully healed."],
    answer: 0,
  },
  {
    eyebrow: "FRACTURE TYPE · ALIGNMENT",
    title: "A stable fracture stays lined up",
    fractureType: "stable",
    term: "Stable",
    pronunciation: "STAY-bul",
    paragraphs: ["The broken ends of the bone are still lined up."],
    points: ["The pieces have not moved far out of place.", "A doctor checks the bone and decides what care it needs."],
    note: "A doctor checks the bone and decides what care it needs. Never try to move a hurt bone back into place.",
    question: "In a stable fracture, how are the broken ends lined up?",
    options: ["They are still lined up.", "They have moved far apart.", "The crack goes diagonally."],
    answer: 0,
  },
  {
    eyebrow: "FRACTURE TYPE · ALIGNMENT",
    title: "A displaced fracture moves out of line",
    fractureType: "displaced",
    term: "Displaced",
    pronunciation: "dis-PLAYST",
    paragraphs: ["The broken ends of the bone have moved out of their usual line."],
    points: ["A health professional checks the injury and decides what care it needs.", "Never try to move a hurt bone back into place."],
    question: "What happens in a displaced fracture?",
    options: ["The broken ends stay lined up.", "The broken ends move out of line.", "The crack goes straight across."],
    answer: 1,
  },
  {
    eyebrow: "FRACTURE TYPE · CRACK DIRECTION",
    title: "An oblique fracture slants",
    fractureType: "oblique",
    term: "Oblique",
    pronunciation: "oh-BLEEK",
    paragraphs: ["The crack goes diagonally across the bone, like a slanted line."],
    points: ["Oblique describes the direction of the crack.", "The bone can also be stable or displaced."],
    question: "Which way does an oblique fracture go?",
    options: ["Straight across the bone.", "Diagonally, like a slanted line.", "Around the bone in a circle."],
    answer: 1,
  },
  {
    eyebrow: "FRACTURE TYPE · CRACK DIRECTION",
    title: "A transverse fracture goes across",
    fractureType: "transverse",
    term: "Transverse",
    pronunciation: "trans-VURSS",
    paragraphs: ["The crack goes straight across the bone, from one side to the other."],
    points: ["Transverse describes the direction of the crack.", "The bone can also be stable or displaced."],
    question: "Which way does a transverse fracture go?",
    options: ["Straight across the bone.", "Diagonally across the bone.", "The broken ends move out of line."],
    answer: 0,
  },
  {
    eyebrow: "TWO WAYS TO DESCRIBE A FRACTURE",
    title: "A fracture can have two descriptions",
    illustration: "overview",
    paragraphs: ["Stable or displaced tells how the broken ends line up. Oblique or transverse tells which way the crack goes."],
    points: ["A fracture can fit one word from each pair.", "For example, a fracture can be stable and transverse."],
    question: "Which words describe the direction of a crack?",
    options: ["Stable and displaced.", "Oblique and transverse.", "Bruise and swelling."],
    answer: 1,
  },
  {
    eyebrow: "WHAT MIGHT HAPPEN",
    title: "A broken bone can hurt in different ways",
    illustration: "assessment",
    paragraphs: ["The hurt spot might ache or hurt more when you try to move it. Sometimes the bone does not look different."],
    points: ["A doctor or nurse is the one who can tell if a bone is broken.", "They may use a special picture called an X-ray (EKS-ray)."],
    question: "Who can tell if a bone is broken?",
    options: ["A doctor or nurse.", "Only a friend.", "You can always tell by looking."],
    answer: 0,
  },
  {
    eyebrow: "WARNING SIGNS",
    title: "Look out for these clues",
    illustration: "warning",
    terms: ["Swelling (SWELL-ing) means a part gets puffy.", "A bruise (BROOZ) is a colored mark on your skin."],
    points: ["Strong pain, puffiness, or a bruise.", "The arm or leg looks an unusual shape.", "It is hard to move or use that part.", "Tingling or numbness (NUHM-niss), or fingers or toes that look blue or feel cold."],
    note: "These are warning signs for both a break and a fracture. Other hurts can cause them too, so a grown-up and a health professional can help figure it out.",
    question: "Which could be a warning sign of a broken bone?",
    options: ["Strong pain and swelling.", "Feeling hungry.", "A runny nose."],
    answer: 0,
  },
  {
    eyebrow: "GET HELP",
    title: "Tell a grown-up right away",
    illustration: "help",
    paragraphs: ["Stop playing and keep the hurt part still. Ask a grown-up for help—do not push, poke, or try to straighten it."],
    points: ["Get emergency help right away if a bone is showing, there is a lot of bleeding, or fingers or toes turn blue, cold, or numb.", "If you are not with a grown-up, call your local emergency number."],
    question: "What should you do if you think you broke a bone?",
    options: ["Try to straighten it yourself.", "Keep playing and ignore it.", "Keep it still and tell a grown-up."],
    answer: 2,
  },
];

const fractureFinalQuestions = [
  {
    question: "An X-ray shows a tiny crack in a bone. Does it count as a fracture?",
    options: ["Yes, a small crack is still a fracture.", "No, only a bone split in two is a fracture.", "No, a crack is the same as a bruise."],
    answer: 0,
  },
  {
    question: "After a break, the bone pieces are still in their usual line. Which word describes this?",
    options: ["Stable.", "Displaced.", "Oblique."],
    answer: 0,
  },
  {
    question: "A picture shows the broken bone pieces shifted away from their usual line. Which word fits?",
    options: ["Transverse.", "Displaced.", "Stable."],
    answer: 1,
  },
  {
    question: "Kai's X-ray shows a crack that slants across the bone. Which word describes the crack's direction?",
    options: ["Oblique.", "Stable.", "Displaced."],
    answer: 0,
  },
  {
    question: "A crack runs straight from one side of the bone to the other. What is its direction called?",
    options: ["Displaced.", "Oblique.", "Transverse."],
    answer: 2,
  },
  {
    question: "An X-ray shows a straight-across crack, and the bone pieces stay lined up. Which pair describes it?",
    options: ["Stable and transverse.", "Displaced and oblique.", "Stable and oblique."],
    answer: 0,
  },
  {
    question: "A health professional wants to check whether a bone has a crack. What might they use?",
    options: ["An X-ray picture.", "A hearing test.", "A thermometer only."],
    answer: 0,
  },
  {
    question: "A teammate has a badly hurt arm. Someone suggests pulling it straight. What should you do?",
    options: ["Keep it still and get a grown-up; don't try to straighten it.", "Pull it gently until it looks straight.", "Ask them to move it around to test it."],
    answer: 0,
  },
  {
    question: "Which injury needs emergency help right away?",
    options: ["A small bruise with no other symptoms.", "A bone showing through the skin or fingers turning blue and cold.", "A sore spot that feels better after resting."],
    answer: 1,
  },
];

function FractureLesson({
  onBack,
  onComplete,
  onQuizComplete,
  finalQuizXpAlreadyClaimed,
  initialSlide,
  onProgress,
}: {
  onBack: () => void;
  onComplete: () => void;
  onQuizComplete: (earnedXp: number) => void;
  finalQuizXpAlreadyClaimed: boolean;
  initialSlide: number;
  onProgress: (progress: LessonProgress) => void;
}) {
  const [phase, setPhase] = useState<"learn" | "quick-check" | "final-quiz" | "finished">("learn");
  const [slide, setSlide] = useState(() => Math.min(Math.max(initialSlide, 0), fractureSlides.length - 1));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [finalQuizIndex, setFinalQuizIndex] = useState(0);
  const [finalQuizCorrectCount, setFinalQuizCorrectCount] = useState(0);
  const [finalQuizXp, setFinalQuizXp] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [finalQuizFeedback, setFinalQuizFeedback] = useState("");
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpWasAlreadyClaimed] = useState(finalQuizXpAlreadyClaimed);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const currentSlide = fractureSlides[slide];
  const currentFinalQuestion = fractureFinalQuestions[finalQuizIndex];

  useEffect(() => {
    onProgressRef.current({ lessonIndex: 1, slideIndex: slide });
  }, [slide]);

  function goToSlide(nextSlide: number) {
    onProgressRef.current({ lessonIndex: 1, slideIndex: nextSlide });
    setSlide(nextSlide);
  }

  function answerQuickCheck(index: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
  }

  function answerFinalQuestion(index: number) {
    if (answerChecked || answerRevealed) return;
    setSelectedAnswer(index);
  }

  function advanceQuickCheck() {
    if (selectedAnswer !== currentSlide.answer) {
      setSelectedAnswer(null);
      return;
    }
    if (slide === fractureSlides.length - 1) {
      setFinalQuizIndex(0);
      setFinalQuizCorrectCount(0);
      setFinalQuizXp(0);
      setWrongAttempts(0);
      setAnswerChecked(false);
      setAnswerRevealed(false);
      setFinalQuizFeedback("");
      setSelectedAnswer(null);
      setPhase("final-quiz");
      return;
    }
    goToSlide(slide + 1);
    setSelectedAnswer(null);
    setPhase("learn");
  }

  function advanceFinalQuiz() {
    if (answerRevealed) {
      moveToNextFinalQuestion();
      return;
    }
    if (!answerChecked) {
      if (selectedAnswer === null) return;
      setAnswerChecked(true);
      if (selectedAnswer !== currentFinalQuestion.answer) {
        if (wrongAttempts === 0) {
          setWrongAttempts(1);
          setFinalQuizFeedback("Not quite. Try again.");
          return;
        }
        if (wrongAttempts === 1) {
          setWrongAttempts(2);
          setFinalQuizFeedback("Not quite. One more try!");
          return;
        }
        const xpForTry = xpWasAlreadyClaimed ? 0 : 1;
        setFinalQuizXp((xp) => xp + xpForTry);
        setAnswerRevealed(true);
        setFinalQuizFeedback(xpWasAlreadyClaimed
          ? `The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`
          : `You earned 1 XP for trying. The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`);
        return;
      }

      const xpForCorrect = xpWasAlreadyClaimed ? 0 : wrongAttempts === 0 ? 10 : wrongAttempts === 1 ? 5 : 1;
      setFinalQuizXp((xp) => xp + xpForCorrect);
      if (wrongAttempts === 0) {
        setFinalQuizCorrectCount((count) => count + 1);
      }
      setFinalQuizFeedback(
        xpWasAlreadyClaimed
          ? "That’s right! Nice remembering."
          : `That’s right! You earned ${xpForCorrect} XP.`,
      );
      return;
    }

    if (selectedAnswer !== currentFinalQuestion.answer) {
      setSelectedAnswer(null);
      setAnswerChecked(false);
      setFinalQuizFeedback("");
      return;
    }

    moveToNextFinalQuestion();
  }

  function moveToNextFinalQuestion() {
    if (finalQuizIndex === fractureFinalQuestions.length - 1) {
      setEarnedXp(finalQuizXp);
      onQuizComplete(finalQuizXp);
      setPhase("finished");
      return;
    }
    setFinalQuizIndex((index) => index + 1);
    setSelectedAnswer(null);
    setWrongAttempts(0);
    setAnswerChecked(false);
    setAnswerRevealed(false);
    setFinalQuizFeedback("");
  }

  if (phase === "finished") {
    return (
      <main className="bone-lesson-page">
        <header className="lesson-topbar">
          <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
          <BoneLogo />
          <span className="lesson-top-progress">LESSON 2 COMPLETE</span>
        </header>
        <section className="lesson-finish-card">
          <span className="finish-badge" aria-hidden="true">✓</span>
          <span className="eyebrow">BONE-RILLIANT WORK!</span>
          <h1>You know your breaks!</h1>
          <p>You got {finalQuizCorrectCount} out of {fractureFinalQuestions.length} final quiz questions right on your first try. Remember: a break and a fracture are the same thing. Tell a grown-up if you think someone is hurt.</p>
          <div className="lesson-results-stats">
            <div><strong>{finalQuizCorrectCount}/{fractureFinalQuestions.length}</strong><span>correct on first try</span></div>
            <div><strong>+{earnedXp} XP</strong><span>{xpWasAlreadyClaimed ? "already collected" : "added to your account"}</span></div>
          </div>
          <p className="lesson-xp-note">{xpWasAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "A correct first try earns 10 XP, a correct second try earns 5 XP, and the third try earns 1 XP."}</p>
          <div className="lesson-finish-actions">
            <button className="primary-button" type="button" onClick={onComplete}>Back to my lessons</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bone-lesson-page">
      <header className="lesson-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
        <BoneLogo />
        <span className="lesson-top-progress">LESSON 2 OF 4</span>
      </header>
      <div className="fracture-lesson-wrap" aria-live="polite">
        <div className="bone-lesson-heading">
          {phase === "learn" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>BREAKS & FRACTURES</span><strong>{slide + 1} of {fractureSlides.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((slide + 1) / fractureSlides.length) * 100}%` }} /></div>
            </div>
          ) : phase === "quick-check" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>QUICK CHECK</span><strong>{slide + 1} of {fractureSlides.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((slide + 1) / fractureSlides.length) * 100}%` }} /></div>
            </div>
          ) : (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>FINAL QUIZ · {finalQuizCorrectCount} CORRECT · {xpWasAlreadyClaimed ? "XP ALREADY EARNED" : `${finalQuizXp} XP`}</span><strong>{finalQuizIndex + 1} of {fractureFinalQuestions.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((finalQuizIndex + 1) / fractureFinalQuestions.length) * 100}%` }} /></div>
            </div>
          )}
        </div>

        {phase === "learn" ? (
          <section className="fracture-card">
            <div className={`fracture-illustration ${currentSlide.fractureType ? "fracture-illustration-xray" : ""}`}>
              {currentSlide.fractureType
                ? <FractureXray type={currentSlide.fractureType} />
                : <FractureSlideArt kind={currentSlide.illustration ?? "bone"} />}
            </div>
            <div className="fracture-slide-copy">
              <span className="eyebrow">{currentSlide.eyebrow}</span>
              <h1>{currentSlide.title}</h1>
              {currentSlide.term && (
                <div className="fracture-term"><strong>{currentSlide.term}</strong><span>Say it: {currentSlide.pronunciation}</span></div>
              )}
              {currentSlide.terms?.map((term) => <p className="fracture-vocabulary" key={term}>{term}</p>)}
              {currentSlide.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <ul className="fracture-points">
                {currentSlide.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              {currentSlide.note && <p className="fracture-note">{currentSlide.note}</p>}
              <div className="fracture-actions">
                <button className="back-button" type="button" disabled={slide === 0} onClick={() => goToSlide(slide - 1)}>← Back</button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => { setSelectedAnswer(null); setPhase("quick-check"); }}
                >
                  Quick check <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </button>
              </div>
            </div>
          </section>
        ) : phase === "quick-check" ? (
          <section className="fracture-quiz-card">
            <span className="eyebrow">QUICK CHECK · SLIDE {slide + 1}</span>
            <h1>{currentSlide.question}</h1>
            <BennyReaction
              expression={selectedAnswer === null ? "neutral" : selectedAnswer === currentSlide.answer ? "happy" : "sad"}
              message={selectedAnswer === null ? "Pick an answer!" : selectedAnswer === currentSlide.answer ? "That’s right! Nice remembering." : "Not quite. Try again!"}
            />
            <div className="fracture-quiz-options">
              {currentSlide.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${selectedAnswer === index ? (index === currentSlide.answer ? "correct" : "incorrect") : ""}`}
                  key={option}
                  disabled={selectedAnswer !== null}
                  onClick={() => answerQuickCheck(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); setSelectedAnswer(null); }}>← Review slide</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null} onClick={advanceQuickCheck}>
                {selectedAnswer === currentSlide.answer && slide === fractureSlides.length - 1 ? "Start final quiz" : selectedAnswer === currentSlide.answer ? "Next slide" : "Try again"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
            </div>
          </section>
        ) : (
          <section className="fracture-quiz-card">
            <span className="eyebrow">FINAL QUIZ · QUESTION {finalQuizIndex + 1}</span>
            <h1>{currentFinalQuestion.question}</h1>
            <BennyReaction
              expression={!finalQuizFeedback ? "neutral" : selectedAnswer === currentFinalQuestion.answer ? "happy" : "sad"}
              message={finalQuizFeedback || "Choose your best answer!"}
            />
            <p className="review-xp-callout">
              {xpWasAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "First try: 10 XP · Second try: 5 XP · Third try: 1 XP"}
            </p>
            <div className="fracture-quiz-options">
              {currentFinalQuestion.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${selectedAnswer === index && !answerChecked && !answerRevealed ? "selected" : ""} ${answerChecked && selectedAnswer === index ? (index === currentFinalQuestion.answer ? "correct" : "incorrect") : answerRevealed && index === currentFinalQuestion.answer ? "correct" : ""}`}
                  key={option}
                  disabled={answerChecked || answerRevealed}
                  onClick={() => answerFinalQuestion(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); goToSlide(fractureSlides.length - 1); setSelectedAnswer(null); }}>← Review lesson</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null && !answerRevealed} onClick={advanceFinalQuiz}>
                {answerRevealed
                  ? "Continue"
                  : !answerChecked
                    ? "Check my answer"
                    : selectedAnswer === currentFinalQuestion.answer
                      ? finalQuizIndex === fractureFinalQuestions.length - 1 ? "Finish lesson" : "Next question"
                      : wrongAttempts === 1 ? "Try again" : "Check my answer"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const healingSlides = [
  {
    eyebrow: "WHY DOES A FRACTURE HURT?",
    title: "Your body sends a pain message",
    paragraphs: ["A fracture can hurt because the bone and nearby tissues are injured. Nerves send pain messages to your brain to let you know something is wrong."],
    points: ["The area may feel sore or tender.", "Swelling can make the area feel tight and uncomfortable."],
    question: "Why can a fracture hurt?",
    options: ["The bone and nearby tissues are injured.", "The bone has stopped being alive.", "Your muscles have turned into bone."],
    answer: 0,
  },
  {
    eyebrow: "THE FIRST REPAIR STEPS",
    title: "A clot forms, and helpers arrive",
    paragraphs: ["Tiny blood vessels break around the fracture. Blood gathers and clots there, while the body's early response brings swelling."],
    points: ["Immune cells come to clean up damaged tissue and help protect the area.", "This starts the repair process, but the bone still needs time and care to heal."],
    question: "What do immune cells do near a fracture?",
    options: ["Help clean up damaged tissue.", "Make the bone move around.", "Turn the swelling into a bruise."],
    answer: 0,
  },
  {
    eyebrow: "A SOFT BRIDGE",
    title: "The body makes a soft callus",
    paragraphs: ["Next, the body builds a soft bridge made of cartilage and other repair tissue around the break. This is called a soft callus."],
    points: ["The soft callus helps connect the broken ends.", "It is not hard bone yet, so the area needs protection while healing."],
    question: "What is the soft callus made of at first?",
    options: ["Soft cartilage and repair tissue.", "A new layer of skin.", "A metal-like shell."],
    answer: 0,
  },
  {
    eyebrow: "GETTING STRONGER",
    title: "The soft bridge hardens into bone",
    paragraphs: ["Over time, the soft callus is replaced by harder bone. Later, the bone keeps remodeling and gets closer to its usual shape and strength."],
    points: ["Healing takes time, and the timing is different for each person.", "A health professional checks the fracture and guides care, like using a cast when needed."],
    question: "What happens to the soft callus as healing continues?",
    options: ["It gradually hardens into new bone.", "It disappears in one day.", "It changes into a muscle."],
    answer: 0,
  },
];

const healingFinalQuestions = [
  {
    question: "What can cause swelling after a fracture?",
    options: ["The body's early response after blood vessels are injured.", "The bone growing too long.", "The soft callus disappearing."],
    answer: 0,
  },
  {
    question: "What does the soft callus do?",
    options: ["It makes a soft bridge around the break.", "It sends pain messages to the brain.", "It keeps immune cells away."],
    answer: 0,
  },
  {
    question: "What happens as the fracture keeps healing?",
    options: ["The soft callus gradually becomes hard bone.", "The blood clot becomes a muscle.", "The bone stops needing care right away."],
    answer: 0,
  },
];

function HealingStageIllustration({ stage }: { stage: number }) {
  return (
    <svg className="fracture-slide-art healing-stage-art" viewBox="0 0 420 300" aria-hidden="true">
      <circle cx="210" cy="145" r="118" fill="#e2f2fb" />
      <path d="M56 133h134M230 133h134" fill="none" stroke="#f8f0d7" strokeWidth="38" strokeLinecap="round" />
      <path d="M56 133h134M230 133h134" fill="none" stroke="#34566d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="56" cy="133" r="23" fill="#f8f0d7" stroke="#34566d" strokeWidth="3" />
      <circle cx="190" cy="133" r="18" fill="#f8f0d7" stroke="#34566d" strokeWidth="3" />
      <circle cx="230" cy="133" r="18" fill="#f8f0d7" stroke="#34566d" strokeWidth="3" />
      <circle cx="364" cy="133" r="23" fill="#f8f0d7" stroke="#34566d" strokeWidth="3" />
      {stage === 1 && (
        <g fill="none" stroke="#f08272" strokeWidth="5" strokeLinecap="round">
          <path d="M205 78V59m-20 27-12-13m51 13 12-13M205 190v-18m-20 8-12 13m51-13 12 13" />
          <path d="M191 108l8 9-7 9 10 8" stroke="#e96b61" strokeWidth="6" />
        </g>
      )}
      {stage === 2 && (
        <g>
          <ellipse cx="210" cy="133" rx="27" ry="37" fill="#e97d70" opacity=".8" />
          <circle cx="168" cy="86" r="8" fill="#64c8a9" />
          <circle cx="252" cy="91" r="7" fill="#f1c454" />
          <circle cx="162" cy="178" r="7" fill="#f1c454" />
          <circle cx="257" cy="176" r="8" fill="#64c8a9" />
          <path d="M177 98l15 18m35 3 15-17m-53 68 13-21m31 1 14 19" fill="none" stroke="#4aa88c" strokeWidth="3" strokeDasharray="4 5" />
        </g>
      )}
      {stage === 3 && (
        <path d="M191 108q19-16 38 0v50q-19 16-38 0Z" fill="#f2bc8e" stroke="#d99165" strokeWidth="3" />
      )}
      {stage === 4 && (
        <path d="M190 105q20-18 40 0v56q-20 18-40 0Z" fill="#8bcfae" stroke="#38977e" strokeWidth="3" />
      )}
      <text x="210" y="254" textAnchor="middle" fill="#42637a" fontSize="14" fontWeight="800" letterSpacing="1.2">
        {["", "PAIN & SWELLING", "CLOT & IMMUNE CELLS", "SOFT CARTILAGE", "HARD NEW BONE"][stage]}
      </text>
      <text x="210" y="276" textAnchor="middle" fill="#7790a0" fontSize="10" fontWeight="700">
        A simplified picture of the healing process
      </text>
    </svg>
  );
}

function HealingLesson({
  onBack,
  onComplete,
  onQuizComplete,
  xpAlreadyClaimed,
  initialSlide,
  onProgress,
}: {
  onBack: () => void;
  onComplete: () => void;
  onQuizComplete: (earnedXp: number) => void;
  xpAlreadyClaimed: boolean;
  initialSlide: number;
  onProgress: (progress: LessonProgress) => void;
}) {
  const [phase, setPhase] = useState<"learn" | "quick-check" | "final-quiz" | "finished">("learn");
  const [slide, setSlide] = useState(() => Math.min(Math.max(initialSlide, 0), healingSlides.length - 1));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [finalQuizIndex, setFinalQuizIndex] = useState(0);
  const [finalQuizCorrectCount, setFinalQuizCorrectCount] = useState(0);
  const [finalQuizXp, setFinalQuizXp] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [finalQuizFeedback, setFinalQuizFeedback] = useState("");
  const [xpWasAlreadyClaimed] = useState(xpAlreadyClaimed);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const currentSlide = healingSlides[slide];
  const currentFinalQuestion = healingFinalQuestions[finalQuizIndex];

  useEffect(() => {
    onProgressRef.current({ lessonIndex: 2, slideIndex: slide });
  }, [slide]);

  function goToSlide(nextSlide: number) {
    onProgressRef.current({ lessonIndex: 2, slideIndex: nextSlide });
    setSlide(nextSlide);
  }

  function advanceQuickCheck() {
    if (selectedAnswer !== currentSlide.answer) {
      setSelectedAnswer(null);
      return;
    }
    if (slide === healingSlides.length - 1) {
      setFinalQuizIndex(0);
      setFinalQuizCorrectCount(0);
      setFinalQuizXp(0);
      setWrongAttempts(0);
      setAnswerChecked(false);
      setAnswerRevealed(false);
      setFinalQuizFeedback("");
      setSelectedAnswer(null);
      setPhase("final-quiz");
      return;
    }
    goToSlide(slide + 1);
    setSelectedAnswer(null);
    setPhase("learn");
  }

  function advanceFinalQuiz() {
    if (answerRevealed) {
      if (finalQuizIndex === healingFinalQuestions.length - 1) {
        onQuizComplete(finalQuizXp);
        setPhase("finished");
        return;
      }
      setFinalQuizIndex((index) => index + 1);
      setSelectedAnswer(null);
      setWrongAttempts(0);
      setAnswerChecked(false);
      setAnswerRevealed(false);
      setFinalQuizFeedback("");
      return;
    }

    if (answerChecked) {
      if (selectedAnswer !== currentFinalQuestion.answer) {
        setSelectedAnswer(null);
        setAnswerChecked(false);
        setFinalQuizFeedback("");
        return;
      }
      if (finalQuizIndex === healingFinalQuestions.length - 1) {
        onQuizComplete(finalQuizXp);
        setPhase("finished");
        return;
      }
      setFinalQuizIndex((index) => index + 1);
      setSelectedAnswer(null);
      setWrongAttempts(0);
      setAnswerChecked(false);
      setAnswerRevealed(false);
      setFinalQuizFeedback("");
      return;
    }

    if (selectedAnswer === null) return;
    setAnswerChecked(true);
    if (selectedAnswer === currentFinalQuestion.answer) {
      const xpForCorrect = xpWasAlreadyClaimed ? 0 : wrongAttempts === 0 ? 10 : wrongAttempts === 1 ? 5 : 1;
      if (wrongAttempts === 0) setFinalQuizCorrectCount((count) => count + 1);
      setFinalQuizXp((xp) => xp + xpForCorrect);
      setFinalQuizFeedback(
        xpWasAlreadyClaimed
          ? "That’s right! Nice remembering."
          : `That’s right! You earned ${xpForCorrect} XP.`,
      );
      return;
    }
    if (wrongAttempts === 2) {
      if (!xpWasAlreadyClaimed) setFinalQuizXp((xp) => xp + 1);
      setAnswerRevealed(true);
      setFinalQuizFeedback(
        xpWasAlreadyClaimed
          ? `The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`
          : `You earned 1 XP. The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`,
      );
      return;
    }
    setWrongAttempts((attempts) => attempts + 1);
    setFinalQuizFeedback(wrongAttempts === 0 ? "Not quite. Try once more." : "Not quite. One more try!");
  }

  if (phase === "finished") {
    return (
      <main className="bone-lesson-page">
        <header className="lesson-topbar">
          <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
          <BoneLogo />
          <span className="lesson-top-progress">LESSON 3 COMPLETE</span>
        </header>
        <section className="lesson-finish-card">
          <span className="finish-badge" aria-hidden="true">✓</span>
          <span className="eyebrow">BONE-RILLIANT WORK!</span>
          <h1>You know how bones heal!</h1>
          <p>You got {finalQuizCorrectCount} out of {healingFinalQuestions.length} final quiz questions right on your first try. Remember: healing happens in stages, and a health professional can help care for a fracture.</p>
          <div className="lesson-results-stats">
            <div><strong>{finalQuizCorrectCount}/{healingFinalQuestions.length}</strong><span>correct on first try</span></div>
            <div><strong>+{finalQuizXp} XP</strong><span>{xpWasAlreadyClaimed ? "already collected" : "added to your account"}</span></div>
          </div>
          <p className="lesson-xp-note">{xpWasAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "A correct first try earns 10 XP, a correct second try earns 5 XP, and the third try earns 1 XP."}</p>
          <div className="lesson-finish-actions">
            <button className="primary-button" type="button" onClick={onComplete}>Back to my lessons</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bone-lesson-page">
      <header className="lesson-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
        <BoneLogo />
        <span className="lesson-top-progress">LESSON 3 OF 4</span>
      </header>
      <div className="fracture-lesson-wrap" aria-live="polite">
        <div className="bone-lesson-heading">
          {phase === "final-quiz" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>FINAL QUIZ · {finalQuizCorrectCount} CORRECT · {xpWasAlreadyClaimed ? "XP ALREADY EARNED" : `${finalQuizXp} XP`}</span><strong>{finalQuizIndex + 1} of {healingFinalQuestions.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((finalQuizIndex + 1) / healingFinalQuestions.length) * 100}%` }} /></div>
            </div>
          ) : (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>{phase === "learn" ? "HOW BONES HEAL" : "QUICK CHECK"}</span><strong>{slide + 1} of {healingSlides.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((slide + 1) / healingSlides.length) * 100}%` }} /></div>
            </div>
          )}
        </div>

        {phase === "learn" ? (
          <section className="fracture-card">
            <div className="fracture-illustration fracture-illustration-xray">
              <HealingStageIllustration stage={slide + 1} />
            </div>
            <div className="fracture-slide-copy">
              <span className="eyebrow">{currentSlide.eyebrow}</span>
              <h1>{currentSlide.title}</h1>
              {currentSlide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <ul className="fracture-points">
                {currentSlide.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="fracture-actions">
                <button className="back-button" type="button" disabled={slide === 0} onClick={() => goToSlide(slide - 1)}>← Back</button>
                <button className="primary-button" type="button" onClick={() => { setSelectedAnswer(null); setPhase("quick-check"); }}>
                  Quick check <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </button>
              </div>
            </div>
          </section>
        ) : phase === "quick-check" ? (
          <section className="fracture-quiz-card">
            <span className="eyebrow">QUICK CHECK · SLIDE {slide + 1}</span>
            <h1>{currentSlide.question}</h1>
            <BennyReaction
              expression={selectedAnswer === null ? "neutral" : selectedAnswer === currentSlide.answer ? "happy" : "sad"}
              message={selectedAnswer === null ? "Pick an answer!" : selectedAnswer === currentSlide.answer ? "That’s right! Nice remembering." : "Not quite. Try again!"}
            />
            <div className="fracture-quiz-options">
              {currentSlide.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${selectedAnswer === index ? (index === currentSlide.answer ? "correct" : "incorrect") : ""}`}
                  key={option}
                  disabled={selectedAnswer !== null}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); setSelectedAnswer(null); }}>← Review slide</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null} onClick={advanceQuickCheck}>
                {selectedAnswer === currentSlide.answer && slide === healingSlides.length - 1 ? "Start final quiz" : selectedAnswer === currentSlide.answer ? "Next slide" : "Try again"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
            </div>
          </section>
        ) : (
          <section className="fracture-quiz-card">
            <span className="eyebrow">FINAL QUIZ · QUESTION {finalQuizIndex + 1}</span>
            <h1>{currentFinalQuestion.question}</h1>
            <BennyReaction
              expression={!finalQuizFeedback ? "neutral" : selectedAnswer === currentFinalQuestion.answer ? "happy" : "sad"}
              message={finalQuizFeedback || "Choose your best answer!"}
            />
            <div className="fracture-quiz-options">
              {currentFinalQuestion.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${answerChecked && selectedAnswer === index ? (index === currentFinalQuestion.answer ? "correct" : "incorrect") : ""}`}
                  key={option}
                  disabled={answerChecked}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); goToSlide(healingSlides.length - 1); setSelectedAnswer(null); }}>← Review lesson</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null} onClick={advanceFinalQuiz}>
                {answerChecked ? selectedAnswer === currentFinalQuestion.answer ? finalQuizIndex === healingFinalQuestions.length - 1 ? "Finish lesson" : "Next question" : "Try again" : "Check my answer"} <Icon><path d="M5 12h14M13 6l6 6-6-6" /></Icon>
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const castSlides = [
  {
    eyebrow: "WHAT IS A CAST?",
    title: "A cast gives an injured bone a safe hug",
    paragraphs: ["A cast wraps around an injured arm or leg, sometimes near a joint. It helps keep the hurt part still while your body fixes the bone."],
    vocabulary: [
      { word: "Cast", pronunciation: "KAST", meaning: "a firm cover that helps protect an injury" },
      { word: "Joint", pronunciation: "JOYNT", meaning: "a place where two bones meet, like your elbow" },
    ],
    points: ["Your body heals the bone. The cast helps protect it.", "A doctor or nurse decides what kind of support you need."],
    question: "How can a cast help?",
    options: ["It helps keep an injured part still and safe.", "It fixes a bone in one day.", "It takes the place of a bone."],
    answer: 0,
  },
  {
    eyebrow: "HARD CASTS",
    title: "A hard cast makes a strong shell",
    paragraphs: ["A hard cast is made from layers wrapped around soft padding. The layers get firm and make a strong shell."],
    vocabulary: [
      { word: "Fiberglass", pronunciation: "FYE-ber-glass", meaning: "a strong, light material" },
      { word: "Plaster", pronunciation: "PLAS-ter", meaning: "a powder that is mixed with water" },
      { word: "Padding", pronunciation: "PAD-ing", meaning: "a soft layer that cushions your skin" },
    ],
    points: ["A care team may use fiberglass or plaster.", "The padding sits between your skin and the hard shell."],
    question: "What happens when hard-cast layers set?",
    options: ["They become a firm shell around the padding.", "They turn into skin.", "They make the bone wiggle."],
    answer: 0,
  },
  {
    eyebrow: "SOFT CASTS",
    title: "Some casts are more flexible than others",
    paragraphs: ["A soft cast or brace can bend more than a hard cast. Some are removable, but only when your doctor or nurse says it is okay."],
    vocabulary: [
      { word: "Flexible", pronunciation: "FLEK-suh-bul", meaning: "able to bend" },
      { word: "Removable", pronunciation: "ree-MOO-vuh-bul", meaning: "something that can be taken off" },
      { word: "Brace", pronunciation: "BRAYS", meaning: "a support that helps hold an injured part steady" },
    ],
    points: ["Soft supports can be made from bendy material or fabric.", "Never take off a cast or brace without asking your care team."],
    question: "How can a soft cast be different from a hard cast?",
    options: ["It can bend more and may be removable.", "It is always made of metal.", "It never needs a doctor's advice."],
    answer: 0,
  },
  {
    eyebrow: "HOW DOES A CAST HELP?",
    title: "Keeping still helps protect the bone",
    paragraphs: ["A cast holds the hurt part steady. That way, it is less likely to get bumped or moved while your body heals."],
    vocabulary: [
      { word: "Steady", pronunciation: "STED-ee", meaning: "not moving around" },
      { word: "Heal", pronunciation: "HEEL", meaning: "to get better over time" },
      { word: "Snug", pronunciation: "SNUHG", meaning: "fitting closely, but not too tight" },
    ],
    points: ["A cast should feel snug, not painfully tight.", "Tell a grown-up if your cast hurts or feels too tight."],
    question: "Why does a cast help hold an injured part still?",
    options: ["To help protect it while your body heals.", "To stop your body from healing.", "To make the cast grow."],
    answer: 0,
  },
  {
    eyebrow: "PUTTING ON & TAKING OFF A CAST",
    title: "A trained care team puts on and removes casts",
    paragraphs: ["An orthopedic specialist checks the injury. That means a bone-care expert, like a doctor or nurse, adds soft padding, then wraps and shapes the cast."],
    vocabulary: [
      { word: "Orthopedic", pronunciation: "or-thuh-PEE-dik", meaning: "about bones and how we move" },
      { word: "Specialist", pronunciation: "SPESH-uh-list", meaning: "a person with special training in one kind of care" },
      { word: "Vibrating", pronunciation: "VYE-bray-ting", meaning: "shaking very quickly" },
    ],
    points: ["When it is time, a trained professional uses a special vibrating saw to remove a hard cast.", "The saw cuts the hard cast, not your skin. Never try to cut off a cast yourself."],
    question: "Who should put on or take off a cast?",
    options: ["A trained doctor, nurse, or cast specialist.", "A friend at home.", "You, using scissors."],
    answer: 0,
  },
  {
    eyebrow: "CAST CARE",
    title: "Take care of your cast—and speak up",
    paragraphs: ["Keep your cast dry unless your care team says it is waterproof. Follow the instructions your doctor or nurse gives you."],
    vocabulary: [
      { word: "Waterproof", pronunciation: "WAW-ter-proof", meaning: "made so water cannot get through" },
      { word: "Numb", pronunciation: "NUHM", meaning: "when you cannot feel a part of your body normally" },
      { word: "Tingling", pronunciation: "TING-gling", meaning: "a pins-and-needles feeling" },
      { word: "Swelling", pronunciation: "SWELL-ing", meaning: "when a body part gets puffy" },
    ],
    points: ["Do not poke things inside your cast or pull out its padding.", "Do not walk or stand on your cast unless your care team says it is okay.", "Tell a grown-up right away if pain gets worse, or your fingers or toes feel numb, have tingling or swelling, feel cold, or look blue."],
    question: "What should you do if your fingers feel numb or look blue?",
    options: ["Tell a grown-up right away so they can contact your care team.", "Put something inside the cast to scratch.", "Try to loosen the cast by yourself."],
    answer: 0,
  },
];

function CastSlideText({
  text,
  vocabulary,
}: {
  text: string;
  vocabulary: { word: string; pronunciation: string; meaning: string }[];
}) {
  const pronunciationByWord = new Map(vocabulary.map(({ word, pronunciation }) => [word.toLowerCase(), pronunciation]));
  const words = vocabulary.map(({ word }) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`\\b(${words.join("|")})\\b`, "gi"));

  return parts.map((part, index) => {
    const pronunciation = pronunciationByWord.get(part.toLowerCase());
    return pronunciation
      ? <strong key={index}>{part} ({pronunciation})</strong>
      : part;
  });
}

const castFinalQuestions = [
  {
    question: "How can a hard cast help?",
    options: ["It helps keep an injured part safe and still.", "It heals the bone all by itself.", "It makes the bone wiggle."],
    answer: 0,
  },
  {
    question: "What can be used to make a hard cast?",
    options: ["Fiberglass or plaster, with soft padding underneath.", "Only paper and glue.", "Metal wires against your skin."],
    answer: 0,
  },
  {
    question: "Who should take off a hard cast?",
    options: ["A trained doctor, nurse, or cast specialist.", "The person wearing it.", "A friend with scissors."],
    answer: 0,
  },
  {
    question: "What should you do if your fingers feel numb or look blue?",
    options: ["Tell a grown-up right away so they can call your care team.", "Put a ruler inside your cast.", "Try to loosen your cast yourself."],
    answer: 0,
  },
];

function CastIllustration({ stage }: { stage: number }) {
  const castTop = stage > 3 ? 83 : 102;
  const castBottom = stage > 3 ? 244 : 220;
  return (
    <svg className="fracture-slide-art healing-stage-art" viewBox="0 0 420 300" aria-hidden="true">
      <circle cx="210" cy="145" r="118" fill="#e2f2fb" />
      <path d="M197 45q-20 1-19 22l13 35-5 119q24 24 48 0l-5-119 13-35q1-21-19-22Z" fill="#f3d9ac" stroke="#34566d" strokeWidth="4" strokeLinejoin="round" />
      <path d={`M177 ${castTop}q33-14 66 0v${castBottom - castTop}q-33 15-66 0Z`} fill={stage === 2 ? "#b9d1c5" : stage === 3 ? "#91c5b5" : "#f7f5eb"} stroke="#56758a" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, index) => (
        <path
          key={index}
          d={`M179 ${castTop + 17 + index * 27}q31-13 62 0`}
          fill="none"
          stroke={stage === 2 ? "#718f83" : "#c2cfcc"}
          strokeWidth="3"
        />
      ))}
      <path d="M187 64q23-13 46 0" fill="none" stroke="#34566d" strokeWidth="4" strokeLinecap="round" />
      <path d="M187 254q23 13 46 0" fill="none" stroke="#34566d" strokeWidth="4" strokeLinecap="round" />
      <text x="210" y="278" textAnchor="middle" fill="#42637a" fontSize="12" fontWeight="800" letterSpacing="1.1">
        {["", "CAST SUPPORT", "HARD CAST", "SOFT CAST", "PADDING", "CARE TEAM", "SAFE CAST CARE"][stage]}
      </text>
    </svg>
  );
}

function CastLesson({
  onBack,
  onComplete,
  onQuizComplete,
  xpAlreadyClaimed,
  initialSlide,
  onProgress,
}: {
  onBack: () => void;
  onComplete: () => void;
  onQuizComplete: (earnedXp: number) => void;
  xpAlreadyClaimed: boolean;
  initialSlide: number;
  onProgress: (progress: LessonProgress) => void;
}) {
  const [phase, setPhase] = useState<"learn" | "quick-check" | "final-quiz" | "finished">("learn");
  const [slide, setSlide] = useState(() => Math.min(Math.max(initialSlide, 0), castSlides.length - 1));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [finalQuizIndex, setFinalQuizIndex] = useState(0);
  const [finalQuizCorrectCount, setFinalQuizCorrectCount] = useState(0);
  const [finalQuizXp, setFinalQuizXp] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [finalQuizFeedback, setFinalQuizFeedback] = useState("");
  const [xpWasAlreadyClaimed] = useState(xpAlreadyClaimed);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const currentSlide = castSlides[slide];
  const currentFinalQuestion = castFinalQuestions[finalQuizIndex];

  useEffect(() => {
    onProgressRef.current({ lessonIndex: 3, slideIndex: slide });
  }, [slide]);

  function goToSlide(nextSlide: number) {
    onProgressRef.current({ lessonIndex: 3, slideIndex: nextSlide });
    setSlide(nextSlide);
  }

  function advanceQuickCheck() {
    if (selectedAnswer !== currentSlide.answer) {
      setSelectedAnswer(null);
      return;
    }
    if (slide === castSlides.length - 1) {
      setFinalQuizIndex(0);
      setFinalQuizCorrectCount(0);
      setFinalQuizXp(0);
      setWrongAttempts(0);
      setAnswerChecked(false);
      setAnswerRevealed(false);
      setFinalQuizFeedback("");
      setSelectedAnswer(null);
      setPhase("final-quiz");
      return;
    }
    goToSlide(slide + 1);
    setSelectedAnswer(null);
    setPhase("learn");
  }

  function advanceFinalQuiz() {
    if (answerRevealed) {
      moveToNextQuestion();
      return;
    }
    if (answerChecked) {
      if (selectedAnswer !== currentFinalQuestion.answer) {
        setSelectedAnswer(null);
        setAnswerChecked(false);
        setFinalQuizFeedback("");
        return;
      }
      moveToNextQuestion();
      return;
    }
    if (selectedAnswer === null) return;

    setAnswerChecked(true);
    if (selectedAnswer === currentFinalQuestion.answer) {
      const earned = xpWasAlreadyClaimed ? 0 : wrongAttempts === 0 ? 10 : wrongAttempts === 1 ? 5 : 1;
      setFinalQuizXp((total) => total + earned);
      if (wrongAttempts === 0) setFinalQuizCorrectCount((count) => count + 1);
      setFinalQuizFeedback(xpWasAlreadyClaimed ? "That’s right! Nice remembering." : `That’s right! You earned ${earned} XP.`);
      return;
    }
    if (wrongAttempts === 2) {
      if (!xpWasAlreadyClaimed) setFinalQuizXp((total) => total + 1);
      setAnswerRevealed(true);
      setFinalQuizFeedback(
        xpWasAlreadyClaimed
          ? `The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`
          : `You earned 1 XP. The answer is: ${currentFinalQuestion.options[currentFinalQuestion.answer]}`,
      );
      return;
    }
    setWrongAttempts((attempts) => attempts + 1);
    setFinalQuizFeedback(wrongAttempts === 0 ? "Not quite. Try once more." : "Not quite. One more try!");
  }

  function moveToNextQuestion() {
    if (finalQuizIndex === castFinalQuestions.length - 1) {
      onQuizComplete(finalQuizXp);
      setPhase("finished");
      return;
    }
    setFinalQuizIndex((index) => index + 1);
    setSelectedAnswer(null);
    setWrongAttempts(0);
    setAnswerChecked(false);
    setAnswerRevealed(false);
    setFinalQuizFeedback("");
  }

  if (phase === "finished") {
    return (
      <main className="bone-lesson-page">
        <header className="lesson-topbar">
          <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
          <BoneLogo />
          <span className="lesson-top-progress">LESSON 4 COMPLETE</span>
        </header>
        <section className="lesson-finish-card">
          <span className="finish-badge" aria-hidden="true">✓</span>
          <span className="eyebrow">BONE-RILLIANT WORK!</span>
          <h1>You’re a cast-care champion!</h1>
          <p>You got {finalQuizCorrectCount} out of {castFinalQuestions.length} final quiz questions right on your first try. Remember to follow your care team’s instructions and tell a grown-up if something feels wrong.</p>
          <div className="lesson-results-stats">
            <div><strong>{finalQuizCorrectCount}/{castFinalQuestions.length}</strong><span>correct on first try</span></div>
            <div><strong>+{finalQuizXp} XP</strong><span>{xpWasAlreadyClaimed ? "already collected" : "added to your account"}</span></div>
          </div>
          <p className="lesson-xp-note">{xpWasAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "A correct first try earns 10 XP, a correct second try earns 5 XP, and the third try earns 1 XP."}</p>
          <div className="lesson-finish-actions">
            <button className="primary-button" type="button" onClick={onComplete}>Back to my lessons</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bone-lesson-page">
      <header className="lesson-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
        <BoneLogo />
        <span className="lesson-top-progress">LESSON 4 OF 4</span>
      </header>
      <div className="fracture-lesson-wrap" aria-live="polite">
        <div className="bone-lesson-heading">
          {phase === "final-quiz" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>FINAL QUIZ · {finalQuizCorrectCount} CORRECT · {xpWasAlreadyClaimed ? "XP ALREADY EARNED" : `${finalQuizXp} XP`}</span><strong>{finalQuizIndex + 1} of {castFinalQuestions.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((finalQuizIndex + 1) / castFinalQuestions.length) * 100}%` }} /></div>
            </div>
          ) : (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>{phase === "learn" ? "CASTS & CAST CARE" : "QUICK CHECK"}</span><strong>{slide + 1} of {castSlides.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((slide + 1) / castSlides.length) * 100}%` }} /></div>
            </div>
          )}
        </div>
        {phase === "learn" ? (
          <section className="fracture-card">
            <div className="fracture-illustration fracture-illustration-xray">
              <CastIllustration stage={slide + 1} />
            </div>
            <div className="fracture-slide-copy">
              <span className="eyebrow">{currentSlide.eyebrow}</span>
              <h1><CastSlideText text={currentSlide.title} vocabulary={currentSlide.vocabulary} /></h1>
              {currentSlide.paragraphs.map((paragraph) => (
                <p key={paragraph}><CastSlideText text={paragraph} vocabulary={currentSlide.vocabulary} /></p>
              ))}
              <div className="cast-vocabulary" aria-label="New words and pronunciations">
                {currentSlide.vocabulary.map(({ word, pronunciation, meaning }) => (
                  <p className="fracture-vocabulary" key={word}>
                    <strong>{word} ({pronunciation}): </strong>{meaning}
                  </p>
                ))}
              </div>
              <ul className="fracture-points">
                {currentSlide.points.map((point) => (
                  <li key={point}><CastSlideText text={point} vocabulary={currentSlide.vocabulary} /></li>
                ))}
              </ul>
              <div className="fracture-actions">
                <button className="back-button" type="button" disabled={slide === 0} onClick={() => goToSlide(slide - 1)}>← Back</button>
                <button className="primary-button" type="button" onClick={() => { setSelectedAnswer(null); setPhase("quick-check"); }}>
                  Quick check <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </button>
              </div>
            </div>
          </section>
        ) : phase === "quick-check" ? (
          <section className="fracture-quiz-card">
            <span className="eyebrow">QUICK CHECK · SLIDE {slide + 1}</span>
            <h1>{currentSlide.question}</h1>
            <BennyReaction
              expression={selectedAnswer === null ? "neutral" : selectedAnswer === currentSlide.answer ? "happy" : "sad"}
              message={selectedAnswer === null ? "Pick an answer!" : selectedAnswer === currentSlide.answer ? "That’s right! Nice remembering." : "Not quite. Try again!"}
            />
            <div className="fracture-quiz-options">
              {currentSlide.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${selectedAnswer === index ? (index === currentSlide.answer ? "correct" : "incorrect") : ""}`}
                  key={option}
                  disabled={selectedAnswer !== null}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); setSelectedAnswer(null); }}>← Review slide</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null} onClick={advanceQuickCheck}>
                {selectedAnswer === currentSlide.answer && slide === castSlides.length - 1 ? "Start final quiz" : selectedAnswer === currentSlide.answer ? "Next slide" : "Try again"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
            </div>
          </section>
        ) : (
          <section className="fracture-quiz-card">
            <span className="eyebrow">FINAL QUIZ · QUESTION {finalQuizIndex + 1}</span>
            <h1>{currentFinalQuestion.question}</h1>
            <BennyReaction
              expression={!finalQuizFeedback ? "neutral" : selectedAnswer === currentFinalQuestion.answer ? "happy" : "sad"}
              message={finalQuizFeedback || "Choose your best answer!"}
            />
            <p className="review-xp-callout">{xpWasAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "First try: 10 XP · Second try: 5 XP · Third try: 1 XP"}</p>
            <div className="fracture-quiz-options">
              {currentFinalQuestion.options.map((option, index) => (
                <button
                  type="button"
                  className={`fracture-quiz-option ${!answerChecked && selectedAnswer === index ? "selected" : ""} ${answerChecked && selectedAnswer === index ? (index === currentFinalQuestion.answer ? "correct" : "incorrect") : ""} ${answerRevealed && index === currentFinalQuestion.answer ? "correct" : ""}`}
                  key={option}
                  disabled={answerChecked || answerRevealed}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="fracture-actions">
              <button className="back-button" type="button" onClick={() => { setPhase("learn"); goToSlide(castSlides.length - 1); setSelectedAnswer(null); }}>← Review lesson</button>
              <button className="primary-button" type="button" disabled={selectedAnswer === null && !answerRevealed} onClick={advanceFinalQuiz}>
                {answerRevealed ? "Continue" : !answerChecked ? "Check my answer" : selectedAnswer === currentFinalQuestion.answer ? finalQuizIndex === castFinalQuestions.length - 1 ? "Finish lesson" : "Next question" : wrongAttempts === 1 ? "Try again" : "Check my answer"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const lessons = [
  { number: "01", title: "Basic bone structure", note: "Meet 15 important bones", tone: "yellow", progress: 0 },
  { number: "02", title: "When bones break", note: "Breaks, fractures & warning signs", tone: "coral", progress: 0 },
  { number: "03", title: "How bones heal", note: "The body's repair process", tone: "blue", progress: 0 },
  { number: "04", title: "Casts & cast care", note: "Types, how casts work & staying safe", tone: "green", progress: 0 },
];

type Bone = {
  id: string;
  name: string;
  region: string;
  description: string;
  landmark: string;
  x: number;
  y: number;
  imageX: number;
  imageY: number;
};

const boneFunctions: Record<string, { correct: string; distractors: [string, string] }> = {
  backbone: {
    correct: "It helps hold your body upright and lets your back bend and twist.",
    distractors: ["It protects your brain.", "It helps your fingers bend."],
  },
  skull: {
    correct: "It protects your brain.",
    distractors: ["It helps your lungs breathe.", "It bends your knee."],
  },
  "rib-cage": {
    correct: "It helps protect your heart and lungs.",
    distractors: ["It helps your wrist turn.", "It supports your ankle."],
  },
  sternum: {
    correct: "It gives your ribs a place to connect at the front of your chest.",
    distractors: ["It protects your brain.", "It helps your fingers bend."],
  },
  humerus: {
    correct: "It helps your upper arm move between your shoulder and elbow.",
    distractors: ["It protects your heart and lungs.", "It helps your ankle stay steady."],
  },
  radius: {
    correct: "It helps your forearm and wrist turn on the thumb side.",
    distractors: ["It protects your brain.", "It supports your upper body at the hips."],
  },
  ulna: {
    correct: "It helps form your elbow and supports your forearm on the pinky side.",
    distractors: ["It protects your heart.", "It helps your toes bend."],
  },
  carpals: {
    correct: "They help your wrist bend and turn.",
    distractors: ["They protect your brain.", "They carry most of your body's weight."],
  },
  metacarpals: {
    correct: "They support the middle of your hand and connect your wrist to your fingers.",
    distractors: ["They protect your lungs.", "They help your knee bend."],
  },
  phalanges: {
    correct: "They help your fingers and toes bend and move.",
    distractors: ["They protect your heart.", "They support your skull."],
  },
  femur: {
    correct: "It supports your weight and helps your leg move.",
    distractors: ["It protects your brain.", "It helps your wrist turn."],
  },
  patella: {
    correct: "It protects the front of your knee and helps it move.",
    distractors: ["It protects your lungs.", "It connects your fingers to your hand."],
  },
  fibula: {
    correct: "It helps stabilize your lower leg and ankle.",
    distractors: ["It protects your brain.", "It supports your ribs at the front of your chest."],
  },
  tibia: {
    correct: "It carries much of your weight through your lower leg.",
    distractors: ["It helps your wrist bend.", "It protects your heart and lungs."],
  },
  pelvis: {
    correct: "It supports your body and protects organs inside your hips.",
    distractors: ["It protects your brain.", "It helps your fingers bend."],
  },
};

const bones: Bone[] = [
  { id: "backbone", name: "Spine (backbone)", region: "Back", description: "Your spine, or backbone, is a row of bones down the middle of your back. It helps hold you upright and lets you bend and twist.", landmark: "down the middle of your back", x: 160, y: 151, imageX: 204, imageY: 292 },
  { id: "skull", name: "Skull", region: "Head", description: "Your skull is a hard helmet that protects your brain.", landmark: "top of your head", x: 160, y: 42, imageX: 203, imageY: 43 },
  { id: "rib-cage", name: "Rib cage", region: "Chest", description: "Your rib cage is a group of curved bones around your chest. It helps protect your heart and lungs.", landmark: "the curved bones around the chest", x: 180, y: 111, imageX: 244, imageY: 232 },
  { id: "sternum", name: "Sternum", region: "Chest", description: "The sternum is one flat bone in the middle of your chest. Your ribs meet it at the front.", landmark: "the flat bone in the middle of the chest", x: 160, y: 120, imageX: 204, imageY: 208 },
  { id: "humerus", name: "Humerus", region: "Arm", description: "The humerus is the long bone in your upper arm, between your shoulder and elbow.", landmark: "the upper arm", x: 105, y: 126, imageX: 101, imageY: 239 },
  { id: "radius", name: "Radius", region: "Forearm", description: "The radius is one of your two forearm bones. With your palm facing forward, it is on the thumb side.", landmark: "the thumb side of the forearm", x: 92, y: 174, imageX: 75, imageY: 360 },
  { id: "ulna", name: "Ulna", region: "Forearm", description: "The ulna is the other forearm bone. With your palm facing forward, it is on the pinky side.", landmark: "the pinky side of the forearm", x: 106, y: 174, imageX: 89, imageY: 360 },
  { id: "carpals", name: "Carpals", region: "Hand", description: "Carpals are the small bones that make up your wrist. They help your hand bend and turn.", landmark: "the wrist", x: 98, y: 193, imageX: 79, imageY: 423 },
  { id: "metacarpals", name: "Metacarpals", region: "Hand", description: "Metacarpals are the long bones in the middle of your hand, between your wrist and fingers.", landmark: "the middle of the hand", x: 90, y: 208, imageX: 84, imageY: 441 },
  { id: "phalanges", name: "Phalanges", region: "Hand", description: "Phalanges are the bones in your fingers and toes. This map points to the finger bones.", landmark: "the fingers", x: 80, y: 225, imageX: 94, imageY: 468 },
  { id: "femur", name: "Femur", region: "Leg", description: "The femur is your thigh bone. It is the longest and strongest bone in your body.", landmark: "the thigh", x: 146, y: 249, imageX: 243, imageY: 486 },
  { id: "patella", name: "Patella", region: "Knee", description: "The patella is your kneecap. It sits at the front of your knee and helps protect it.", landmark: "the front of the knee", x: 146, y: 279, imageX: 229, imageY: 593 },
  { id: "fibula", name: "Fibula", region: "Lower leg", description: "The fibula is the thinner bone along the outer side of your lower leg. It sits beside the tibia.", landmark: "the thinner bone on the outer side", x: 190, y: 315, imageX: 237, imageY: 685 },
  { id: "tibia", name: "Tibia", region: "Lower leg", description: "The tibia is the bigger, strong bone at the front and inner side of your lower leg. It carries lots of your weight.", landmark: "the big shin bone on the inner side", x: 143, y: 315, imageX: 219, imageY: 680 },
  { id: "pelvis", name: "Pelvis", region: "Hips", description: "Your pelvis is a strong group of bones at your hips. It helps support your body and protects organs inside.", landmark: "the hips", x: 160, y: 204, imageX: 203, imageY: 367 },
];

const bonePronunciations: Record<string, string> = {
  backbone: "SPYNE / BACK-bohn",
  skull: "SKUHL",
  "rib-cage": "RIB-kayj",
  sternum: "STUR-num",
  humerus: "HYOO-muh-rus",
  radius: "RAY-dee-us",
  ulna: "UHL-nuh",
  carpals: "KAR-pulz",
  metacarpals: "met-uh-KAR-pulz",
  phalanges: "fuh-LAN-jeez",
  femur: "FEE-mur",
  patella: "puh-TEL-uh",
  fibula: "FIB-yuh-luh",
  tibia: "TIB-ee-uh",
  pelvis: "PEL-vis",
};

const skeletonIntroduction = {
  title: "Your skeleton (SKEL-uh-tun) helps your whole body",
  points: [
    { title: "It supports you", detail: "Your bones help hold you up and keep your body standing tall. This is called posture (POS-chur)." },
    { title: "It protects you", detail: "Your skull protects your brain. Your ribs help protect your heart and lungs. Organs (OR-gunz) are important parts inside your body." },
    { title: "It helps you move", detail: "Bones work with your muscles (MUS-uhlz) and joints (JOYNTs) so you can walk, jump, bend, and dance." },
  ],
};

function getFunctionChoices(bone: Bone, index: number) {
  const question = boneFunctions[bone.id];
  const choices = [...question.distractors];
  choices.splice(index % 3, 0, question.correct);
  return choices;
}

function SkeletonMap({
  focus,
  placed,
  selectedBone,
  onChooseSpot,
  interactive = true,
}: {
  focus: Bone;
  placed: Set<string>;
  selectedBone: string | null;
  onChooseSpot?: (spotId: string) => void;
  interactive?: boolean;
}) {
  return (
    <svg
      className="skeleton-map"
      viewBox="0 0 320 390"
      role="img"
      aria-label={`Skeleton map near the ${focus.name}`}
    >
      <g className="skeleton-drawing" aria-hidden="true">
        <path className="skeleton-spine" d="M160 75v138" />
        <path className="skeleton-bone" d="M136 22c-13 0-22 10-22 23v8c0 14 10 24 22 24h48c13 0 22-10 22-24v-8c0-13-9-23-22-23z" />
        <circle className="skeleton-joint" cx="148" cy="48" r="3" /><circle className="skeleton-joint" cx="172" cy="48" r="3" />
        <path className="skeleton-face" d={placed.size > 0 ? "M147 62q13 10 26 0" : "M147 63h26"} />
        <path className="skeleton-bone" d="M145 79v10m30-10v10M123 93q37-15 74 0M123 99q37 15 74 0M120 108q40-15 80 0M122 117q38 15 76 0M127 126q33-13 66 0M132 135q28 10 56 0" />
        <path className="skeleton-sternum" d="M160 91v46" />
        <path className="skeleton-bone" d="M125 94 109 102 101 145M195 94l16 8 8 43" />
        <path className="skeleton-arm" d="M109 102 101 145M211 102l8 43" />
        <path className="skeleton-forearm" d="M101 145 94 190M107 146 101 190M219 145l7 45M213 146l6 44" />
        <path className="skeleton-hand" d="m94 190-11 13-7 22m25-35-9 20-8 22m17-42-3 23-5 20m4-42 4 22 1 18" />
        <path className="skeleton-hand" d="m226 190 11 13 7 22m-25-35 9 20 8 22m-17-42 3 23 5 20m-4-42-4 22-1 18" />
        <path className="skeleton-pelvis" d="M132 181q12 4 28 0 16 4 28 0l11 15-15 17-15-6-9 12-9-12-15 6-15-17z" />
        <path className="skeleton-thigh" d="m146 215-3 53m31-53 3 53" />
        <path className="skeleton-knee" d="M143 268q3-6 7 0l1 14q-4 6-8 0zm29 0q3-6 7 0l1 14q-4 6-8 0z" />
        <path className="skeleton-tibia" d="m145 282-2 68m31-68 5 68" />
        <path className="skeleton-fibula" d="m138 283-8 66m50-66 10 66" />
        <path className="skeleton-foot" d="m143 350-2 14-13 7q-4 6 3 7h30l-1-8-12-7m29-13 2 14 13 7q4 6-3 7h-30l1-8 12-7" />
      </g>
      {!interactive && (
        <circle className="focus-halo" cx={focus.x} cy={focus.y} r="15" />
      )}
      {bones.map((bone) => {
        const isPlaced = placed.has(bone.id);
        const isFocus = focus.id === bone.id;
        const isSelected = selectedBone === bone.id;
        return (
          <g
            key={bone.id}
            className={`map-spot ${isFocus ? "spot-focus" : ""} ${isPlaced ? "spot-placed" : ""} ${isSelected ? "spot-selected" : ""}`}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${bone.name} spot, ${isPlaced ? "already placed" : "tap to place selected bone"}` : undefined}
            onClick={interactive ? () => onChooseSpot?.(bone.id) : undefined}
            onKeyDown={interactive ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onChooseSpot?.(bone.id);
              }
            } : undefined}
          >
            <circle className="spot-hit-area" cx={bone.x} cy={bone.y} r="13" />
            <circle className="spot-dot" cx={bone.x} cy={bone.y} r="6" />
            {isPlaced && <text className="spot-check" x={bone.x} y={bone.y + 3.5}>✓</text>}
          </g>
        );
      })}
    </svg>
  );
}

function BoneLesson({
  onBack,
  onComplete,
  onPlayGame,
  onQuizComplete,
  xpAlreadyClaimed,
  initialSlide,
  onProgress,
}: {
  onBack: () => void;
  onComplete: () => void;
  onPlayGame: () => void;
  onQuizComplete: (earnedXp: number) => void;
  xpAlreadyClaimed: boolean;
  initialSlide: number;
  onProgress: (progress: LessonProgress) => void;
}) {
  const [slide, setSlide] = useState(() => Math.min(Math.max(initialSlide, 0), bones.length));
  const [phase, setPhase] = useState<"learn" | "question" | "practice" | "final-quiz" | "finished">("learn");
  const [placed, setPlaced] = useState<Set<string>>(() => new Set());
  const [selectedBone, setSelectedBone] = useState<string | null>(null);
  const [draggedBone, setDraggedBone] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mapExpression, setMapExpression] = useState<"neutral" | "frown" | "smile">("neutral");
  const [functionAnswer, setFunctionAnswer] = useState<number | null>(null);
  const [functionPassed, setFunctionPassed] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAnswer, setReviewAnswer] = useState<number | null>(null);
  const [reviewPassed, setReviewPassed] = useState(false);
  const [reviewCorrectCount, setReviewCorrectCount] = useState(0);
  const [reviewWrongAttempts, setReviewWrongAttempts] = useState(0);
  const [reviewXp, setReviewXp] = useState(0);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const isIntroduction = slide === 0;
  const boneIndex = Math.max(slide - 1, 0);
  const focus = bones[boneIndex];
  const functionQuestion = boneFunctions[focus.id];
  const functionChoices = getFunctionChoices(focus, boneIndex);
  const reviewBone = bones[reviewIndex];
  const reviewQuestion = boneFunctions[reviewBone.id];
  const reviewChoices = getFunctionChoices(reviewBone, reviewIndex);
  const availableBones = bones.slice(0, slide);
  const allAvailableBonesPlaced = availableBones.every((bone) => placed.has(bone.id));
  const focusX = focus.imageX / 435.687;
  const focusY = focus.imageY / 841.89;

  useEffect(() => {
    onProgressRef.current({ lessonIndex: 0, slideIndex: slide });
  }, [slide]);

  function goToSlide(nextSlide: number) {
    onProgressRef.current({ lessonIndex: 0, slideIndex: nextSlide });
    setSlide(nextSlide);
  }

  function placeBone(boneId: string, spotId: string) {
    const bone = bones.find((item) => item.id === boneId);
    const spot = bones.find((item) => item.id === spotId);
    if (
      !bone ||
      !spot ||
      placed.has(boneId) ||
      !availableBones.some((item) => item.id === boneId) ||
      !availableBones.some((item) => item.id === spotId)
    ) return;

    if (boneId !== spotId) {
      setMapExpression("frown");
      setFeedback(`Try again! The ${bone.name} belongs at ${bone.landmark}.`);
      return;
    }

    const nextPlaced = new Set(placed).add(boneId);
    setPlaced(nextPlaced);
    setSelectedBone(null);
    setDraggedBone(null);
    setMapExpression("smile");
    setFeedback(
      boneId === focus.id
        ? `That's right! You found the ${bone.name}!`
        : `That's right! The ${bone.name} belongs at ${bone.landmark}.`,
    );
  }

  function handleMapDrop(event: DragEvent<SVGSVGElement>) {
    event.preventDefault();
    const boneId = draggedBone || selectedBone;
    if (!boneId) return;

    const svg = event.currentTarget;
    const transform = svg.getScreenCTM();
    if (!transform) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const { x, y } = point.matrixTransform(transform.inverse());
    const nearestSpot = availableBones.reduce<{ bone: Bone; distance: number } | null>((nearest, bone) => {
      const distance = Math.hypot(bone.x - x, bone.y - y);
      return !nearest || distance < nearest.distance ? { bone, distance } : nearest;
    }, null);
    const nearestNeighborDistance = nearestSpot
      ? availableBones.reduce((nearest, bone) => {
          if (bone.id === nearestSpot.bone.id) return nearest;
          return Math.min(nearest, Math.hypot(bone.x - nearestSpot.bone.x, bone.y - nearestSpot.bone.y));
        }, Number.POSITIVE_INFINITY)
      : Number.POSITIVE_INFINITY;
    const placementTolerance = Math.min(32, nearestNeighborDistance * 0.45);
    const targetMinimumTolerances: Record<string, number> = {
      backbone: 28,
      skull: 28,
      humerus: 28,
      ulna: 14,
      radius: 14,
      metacarpals: 14,
      carpals: 14,
      phalanges: 14,
      tibia: 28,
      fibula: 28,
    };
    const targetTolerance = nearestSpot
      ? Math.min(32, Math.max(placementTolerance, targetMinimumTolerances[nearestSpot.bone.id] ?? 0))
      : placementTolerance;

    if (nearestSpot && nearestSpot.distance <= targetTolerance) {
      placeBone(boneId, nearestSpot.bone.id);
      return;
    }

    const bone = bones.find((item) => item.id === boneId);
    if (bone) {
      setMapExpression("frown");
      setFeedback(`Try again! Find the ${bone.name} spot on Benny’s skeleton.`);
    }
    setDraggedBone(null);
  }

  function goToNextSlide() {
    if (slide === bones.length) {
      setPhase("final-quiz");
      return;
    }
    goToSlide(slide + 1);
    setPlaced(new Set());
    setSelectedBone(null);
    setDraggedBone(null);
    setMapExpression("neutral");
    setFunctionAnswer(null);
    setFunctionPassed(false);
    setPhase("learn");
    setFeedback("");
  }

  function goToPreviousSlide() {
    goToSlide(slide - 1);
    setPlaced(new Set());
    setSelectedBone(null);
    setDraggedBone(null);
    setMapExpression("neutral");
    setFunctionAnswer(null);
    setFunctionPassed(false);
    setPhase("learn");
    setFeedback("");
  }

  function advanceReview() {
    if (!reviewPassed) return;
    if (reviewIndex === bones.length - 1) {
      onQuizComplete(reviewXp);
      setPhase("finished");
      return;
    }
    setReviewIndex(reviewIndex + 1);
    setReviewAnswer(null);
    setReviewPassed(false);
    setReviewWrongAttempts(0);
  }

  if (phase === "finished") {
    return (
      <main className="bone-lesson-page">
        <header className="lesson-topbar">
          <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
          <BoneLogo />
          <span className="lesson-top-progress">LESSON 1 COMPLETE</span>
        </header>
        <section className="lesson-finish-card">
          <span className="finish-badge">✓</span>
          <span className="eyebrow">BONE-RILLIANT WORK!</span>
          <h1>Final quiz complete!</h1>
          <p>You got {reviewCorrectCount} out of {bones.length} questions right. You explored 15 important bones and helped build Benny’s skeleton.</p>
          <div className="lesson-results-stats">
            <div><strong>{reviewCorrectCount}/{bones.length}</strong><span>correct answers</span></div>
            <div><strong>+{reviewXp} XP</strong><span>{reviewXp ? "added to your account" : "already collected"}</span></div>
          </div>
          <p className="lesson-xp-note">Spend 10 XP per extra life in Bone Bonanza—or save your XP for later.</p>
          <div className="lesson-finish-actions">
            <button className="primary-button" type="button" onClick={() => { onComplete(); onPlayGame(); }}>
              Play Bone Bonanza <Icon><path d="M8 5v14l11-7z" /></Icon>
            </button>
            <button className="back-button" type="button" onClick={onComplete}>Back to my lessons</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bone-lesson-page">
      <header className="lesson-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to lessons</button>
        <BoneLogo />
        <span className="lesson-top-progress">LESSON 1 OF 4</span>
      </header>
      <div className={`bone-lesson-wrap ${phase === "learn" ? "learning-phase" : ""}`}>
        <div className="bone-lesson-heading">
          {phase === "learn" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>{isIntroduction ? "MEET YOUR SKELETON" : "MEET THE BONES"}</span><strong>{slide + 1} of {bones.length + 1}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${((slide + 1) / (bones.length + 1)) * 100}%` }} /></div>
            </div>
          ) : phase === "question" ? (
            <div className="learning-progress">
              <div className="bone-progress-label"><span>BONE FUNCTION CHECK</span><strong>{slide} of {bones.length}</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${(slide / bones.length) * 100}%` }} /></div>
            </div>
          ) : phase === "final-quiz" ? (
            <div className="bone-progress-label">
              <span>FINAL BONE QUIZ</span><strong>Question {reviewIndex + 1} of {bones.length}</strong>
            </div>
          ) : (
            <>
              <span className="eyebrow">BODY MAP CHALLENGE</span>
              <h1>Help Benny build his skeleton!</h1>
              <p>Place each bone you’ve learned so far. The current bone is included.</p>
              <div className="bone-progress-label"><span>{placed.size} of {availableBones.length} bones placed</span><strong>{slide} / {bones.length} bones</strong></div>
              <div className="bone-progress-track"><span style={{ width: `${(placed.size / bones.length) * 100}%` }} /></div>
            </>
          )}
        </div>

        {phase === "learn" ? (
          isIntroduction ? (
            <section className="bone-slide-card">
              <div className="bone-illustration-panel">
                <span className="illustration-label">YOUR BODY’S FRAMEWORK</span>
                <div className="bone-focus-ring">
                  <img
                    className="lesson-skeleton-image"
                    src="/human-skeleton-front-no-labels.svg"
                    alt="A full human skeleton showing bones that support, protect, and help move the body"
                  />
                </div>
                <a
                  className="illustration-credit"
                  href="https://commons.wikimedia.org/wiki/File:Human_skeleton_front_-_no_labels.svg"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mikael Häggström / LadyofHats · Wikimedia Commons · Public domain
                </a>
              </div>
              <div className="bone-slide-copy bone-intro-copy">
                <div className="slide-number">WELCOME TO LESSON 1</div>
                <h2>{skeletonIntroduction.title}</h2>
                {skeletonIntroduction.points.map((point) => (
                  <div className="bone-intro-point" key={point.title}>
                    <strong>{point.title}</strong>
                    <p>{point.detail}</p>
                  </div>
                ))}
                <div className="bone-slide-actions">
                  <button className="back-button" type="button" disabled>← Back</button>
                  <button className="primary-button" type="button" onClick={() => goToSlide(1)}>
                    Meet the bones <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                  </button>
                </div>
              </div>
            </section>
          ) : (
          <section className="bone-slide-card">
            <div className="bone-illustration-panel">
              <span className="illustration-label">Look here: {focus.landmark.charAt(0).toUpperCase() + focus.landmark.slice(1)}</span>
              <div className="bone-focus-ring">
                <img
                  className="lesson-skeleton-image"
                  src="/human-skeleton-front-no-labels.svg"
                  alt="Unlabeled front view of a human skeleton"
                />
                <span
                  className="lesson-focus-marker"
                  style={{ left: `${focusX * 100}%`, top: `${focusY * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="bone-zoom-card">
                <img
                  src="/human-skeleton-front-no-labels.svg"
                  alt=""
                  style={{
                    width: "240%",
                    left: `calc(50% - ${focusX * 240}%)`,
                    top: `calc(50% - ${focusY * 464}%)`,
                  }}
                />
                <span className="zoom-focus-marker" aria-hidden="true" />
                <span>ZOOM</span>
              </div>
              <a
                className="illustration-credit"
                href="https://commons.wikimedia.org/wiki/File:Human_skeleton_front_-_no_labels.svg"
                target="_blank"
                rel="noreferrer"
              >
                Mikael Häggström / LadyofHats · Wikimedia Commons · Public domain
              </a>
            </div>
            <div className="bone-slide-copy">
              <div className="slide-number">BONE {String(slide).padStart(2, "0")}</div>
              <h2>{focus.name} ({bonePronunciations[focus.id]})</h2>
              <p>{focus.description}</p>
              <div className="bone-location">
                <Icon><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
                <strong>{focus.landmark.charAt(0).toUpperCase() + focus.landmark.slice(1)}</strong>
              </div>
              {(focus.id === "sternum" || focus.id === "rib-cage") && (
                <p className="bone-side-note"><strong>Remember:</strong> The rib cage is the curved group around the chest. The sternum is just the flat bone down the middle at the front.</p>
              )}
              {(focus.id === "radius" || focus.id === "ulna") && (
                <p className="bone-side-note"><strong>Remember:</strong> Hold your hand out, palm up. The radius is by your thumb; the ulna is by your pinky.</p>
              )}
              {(focus.id === "tibia" || focus.id === "fibula") && (
                <p className="bone-side-note"><strong>Remember:</strong> The tibia is the bigger shin bone. The fibula is the thinner bone beside it on the outside.</p>
              )}
              <button
                className="primary-button quick-check-button"
                type="button"
                onClick={() => {
                  setFunctionAnswer(null);
                  setFunctionPassed(false);
                  setFeedback("");
                  setPhase("question");
                }}
              >
                Quick check <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
              <div className="bone-slide-actions">
                <button className="back-button" type="button" disabled={slide === 0} onClick={goToPreviousSlide}>← Back</button>
                <span>One bone at a time!</span>
              </div>
            </div>
          </section>
          )
        ) : phase === "question" ? (
          <section className="bone-function-card">
            <span className="eyebrow">QUICK CHECK</span>
            <h1>What does the {focus.name} ({bonePronunciations[focus.id]}) help do?</h1>
            <p className="muted">Choose the function that matches what you just learned.</p>
            <BennyReaction
              expression={functionAnswer === null ? "neutral" : functionPassed ? "happy" : "sad"}
              message={feedback || "Pick the answer you think is right!"}
            />
            <div className="function-options stacked-choices">
              {functionChoices.map((choice, index) => (
                <ChoiceButton
                  key={choice}
                  active={functionAnswer === index}
                  status={functionAnswer === index ? (functionPassed ? "correct" : "incorrect") : undefined}
                  onClick={() => {
                    if (functionPassed) return;
                    const isCorrect = choice === functionQuestion.correct;
                    setFunctionAnswer(index);
                    setFunctionPassed(isCorrect);
                    setFeedback(
                      isCorrect
                        ? `That's right! ${functionQuestion.correct}`
                        : "Not quite. Think about the job of this bone and try again!",
                    );
                  }}
                >
                  {choice}
                </ChoiceButton>
              ))}
            </div>
            <div className="function-actions">
              <button
                className="back-button"
                type="button"
                onClick={() => {
                  setPhase("learn");
                  setFunctionAnswer(null);
                  setFunctionPassed(false);
                  setFeedback("");
                }}
              >
                ← Back to {focus.name}
              </button>
              {functionPassed && (
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    setFeedback("");
                    setMapExpression("neutral");
                    if (slide === bones.length) {
                      setPhase("practice");
                      return;
                    }
                    goToSlide(slide + 1);
                    setPlaced(new Set());
                    setSelectedBone(null);
                    setDraggedBone(null);
                    setFunctionAnswer(null);
                    setFunctionPassed(false);
                    setPhase("learn");
                  }}
                >
                  {slide === bones.length ? "Body map challenge" : "Next bone"}
                  <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </button>
              )}
            </div>
          </section>
        ) : phase === "final-quiz" ? (
          <section className="bone-function-card lesson-review-card">
            <span className="eyebrow">FINAL REVIEW</span>
            <h1>What does the {reviewBone.name} ({bonePronunciations[reviewBone.id]}) help do?</h1>
            <p className="muted">Answer questions about all the bones you learned.</p>
            <div className="review-score-row">
              <span>Question {reviewIndex + 1} of {bones.length}</span>
              <strong>{reviewCorrectCount} correct · {reviewXp} XP earned</strong>
            </div>
            <div className="bone-progress-track review-progress-track">
              <span style={{ width: `${((reviewIndex + 1) / bones.length) * 100}%` }} />
            </div>
            <p className="review-xp-callout">
              {xpAlreadyClaimed ? "You’ve already collected XP for this quiz. Replay to practice!" : "A correct first try earns 10 XP, a correct second try earns 5 XP, and a third incorrect try earns 1 XP."}
            </p>
            <BennyReaction
              expression={reviewAnswer === null ? "neutral" : reviewPassed ? "happy" : "sad"}
              message={reviewAnswer === null ? "Choose your best answer!" : reviewPassed ? `That’s right! ${reviewQuestion.correct}` : "Not quite. Give it another try!"}
            />
            <div className="function-options stacked-choices">
              {reviewChoices.map((choice, index) => (
                <ChoiceButton
                  key={choice}
                  active={reviewAnswer === index}
                  status={reviewAnswer === index ? (reviewPassed ? "correct" : "incorrect") : undefined}
                  onClick={() => {
                    if (reviewPassed) return;
                    const isCorrect = choice === reviewQuestion.correct;
                    setReviewAnswer(index);
                    setReviewPassed(isCorrect);
                    if (isCorrect) {
                      setReviewCorrectCount((count) => count + 1);
                      const xpForCorrect = xpAlreadyClaimed
                        ? 0
                        : reviewWrongAttempts === 0
                          ? 10
                          : reviewWrongAttempts === 1
                            ? 5
                            : reviewWrongAttempts === 2
                              ? 1
                              : 0;
                      setReviewXp((xp) => xp + xpForCorrect);
                    } else {
                      if (reviewWrongAttempts === 2 && !xpAlreadyClaimed) {
                        setReviewXp((xp) => xp + 1);
                      }
                      setReviewWrongAttempts((attempts) => attempts + 1);
                    }
                  }}
                >
                  {choice}
                </ChoiceButton>
              ))}
            </div>
            <div className="function-actions review-actions">
              {reviewPassed && (
                <button className="primary-button" type="button" onClick={advanceReview}>
                  {reviewIndex === bones.length - 1 ? "See results" : "Next question"}
                  <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className="bone-practice-card">
            <div className="bone-tray-panel">
              <div className="practice-title">
                <div><span className="eyebrow">BONE NAMES</span><h2>Pick a bone</h2></div>
                <span className="placed-count">{placed.size}/{availableBones.length}</span>
              </div>
              <p className="practice-hint">Place the bones you’ve learned so far. You can do them in any order.</p>
              <div className="bone-name-tray">
                {availableBones.map((bone) => (
                  <button
                    className={`bone-chip ${selectedBone === bone.id ? "chip-selected" : ""} ${placed.has(bone.id) ? "chip-placed" : ""}`}
                    type="button"
                    key={bone.id}
                    draggable={!placed.has(bone.id)}
                    disabled={placed.has(bone.id)}
                    onClick={() => {
                      setSelectedBone(selectedBone === bone.id ? null : bone.id);
                      setMapExpression("neutral");
                      setFeedback(placed.has(bone.id) ? "" : `Now tap the ${bone.name} spot on Benny’s map.`);
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", bone.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedBone(bone.id);
                      setSelectedBone(bone.id);
                    }}
                  >
                    <span>{placed.has(bone.id) ? "✓ " : ""}{bone.name}</span>
                    <small className="bone-chip-pronunciation">{bonePronunciations[bone.id]}</small>
                  </button>
                ))}
              </div>
              <div className="benny-feedback" aria-live="polite">
                <div><strong>Map tip</strong><p>{feedback || (placed.has(focus.id) ? `You already found the ${focus.name}!` : `Can you find the ${focus.name}? Pick any name to start.`)}</p></div>
              </div>
              <div className="practice-actions">
                <button className="back-button" type="button" onClick={() => { setPhase("learn"); setFeedback(""); }}>← Back to {focus.name}</button>
                {allAvailableBonesPlaced && (
                  <button className="primary-button" type="button" onClick={goToNextSlide}>
                    {slide === bones.length ? "Finish lesson" : "Next bone"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                  </button>
                )}
              </div>
            </div>
            <div className="bone-map-panel">
              <div className="map-prompt">
                <strong>Find {availableBones.length === 1 ? "this bone" : "these bones"}</strong>
                <span>Place each bone you’ve learned on its matching spot.</span>
              </div>
              <svg
                className="skeleton-map"
                viewBox="0 0 320 390"
                role="group"
                aria-label={`Benny's skeleton map with ${availableBones.length} learned bone spots.`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleMapDrop}
              >
                <g className="skeleton-drawing" aria-hidden="true">
                  <path className="skeleton-spine" d="M160 75v138" />
                  <path className="skeleton-bone" d="M136 22c-13 0-22 10-22 23v8c0 14 10 24 22 24h48c13 0 22-10 22-24v-8c0-13-9-23-22-23z" />
                  <circle className="skeleton-joint" cx="148" cy="48" r="3" /><circle className="skeleton-joint" cx="172" cy="48" r="3" />
                  <path
                    className="skeleton-face"
                    d={mapExpression === "frown" ? "M147 68q13-10 26 0" : mapExpression === "smile" ? "M147 62q13 10 26 0" : "M147 63h26"}
                  />
                  <path className="skeleton-bone" d="M145 79v10m30-10v10M123 93q37-15 74 0M123 99q37 15 74 0M120 108q40-15 80 0M122 117q38 15 76 0M127 126q33-13 66 0M132 135q28 10 56 0" />
                  <path className="skeleton-sternum" d="M160 91v46" />
                  <path className="skeleton-bone" d="M125 94 109 102 101 145M195 94l16 8 8 43" />
                  <path className="skeleton-arm" d="M109 102 101 145M211 102l8 43" />
                  <path className="skeleton-forearm" d="M101 145 94 190M107 146 101 190M219 145l7 45M213 146l6 44" />
                  <path className="skeleton-hand" d="m94 190-11 13-7 22m25-35-9 20-8 22m17-42-3 23-5 20m4-42 4 22 1 18" />
                  <path className="skeleton-hand" d="m226 190 11 13 7 22m-25-35 9 20 8 22m-17-42 3 23 5 20m-4-42-4 22-1 18" />
                  <path className="skeleton-pelvis" d="M132 181q12 4 28 0 16 4 28 0l11 15-15 17-15-6-9 12-9-12-15 6-15-17z" />
                  <path className="skeleton-thigh" d="m146 215-3 53m31-53 3 53" />
                  <path className="skeleton-knee" d="M143 268q3-6 7 0l1 14q-4 6-8 0zm29 0q3-6 7 0l1 14q-4 6-8 0z" />
                  <path className="skeleton-tibia" d="m145 282-2 68m31-68 5 68" />
                  <path className="skeleton-fibula" d="m138 283-8 66m50-66 10 66" />
                  <path className="skeleton-foot" d="m143 350-2 14-13 7q-4 6 3 7h30l-1-8-12-7m29-13 2 14 13 7q4 6-3 7h-30l1-8 12-7" />
                </g>
                {availableBones.map((bone) => {
                  const isPlaced = placed.has(bone.id);
                  return (
                    <g
                      key={bone.id}
                      className={`map-spot ${focus.id === bone.id ? "spot-focus" : ""} ${isPlaced ? "spot-placed" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${bone.name} spot${isPlaced ? ", already filled" : ""}`}
                      onClick={() => selectedBone && placeBone(selectedBone, bone.id)}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && selectedBone) {
                          event.preventDefault();
                          placeBone(selectedBone, bone.id);
                        }
                      }}
                      onDragOver={(event) => event.preventDefault()}
                    >
                      <circle className="spot-hit-area" cx={bone.x} cy={bone.y} r="13" />
                      <circle className="spot-dot" cx={bone.x} cy={bone.y} r="6" />
                      {isPlaced && <text className="spot-check" x={bone.x} y={bone.y + 3.5}>✓</text>}
                    </g>
                  );
                })}
              </svg>
              <div className="map-caption"><span>Benny’s body map</span><strong>{placed.size} / {availableBones.length} placed</strong></div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const dailyQuestions = [
  {
    question: "What is the hardest substance in your body?",
    options: ["Your bones", "Your teeth", "Your muscles"],
    answer: 1,
    fact: "Tooth enamel is even harder than bone!",
  },
  {
    question: "About how many bones does a grown-up have?",
    options: ["106", "206", "506"],
    answer: 1,
    fact: "Most adults have 206 bones working together.",
  },
  {
    question: "What protects your brain like a helmet?",
    options: ["Your ribs", "Your spine", "Your skull"],
    answer: 2,
    fact: "Your skull is a tough, built-in helmet for your brain.",
  },
  {
    question: "Which helper holds a broken bone still while it heals?",
    options: ["A cast", "A bandage sticker", "A warm sock"],
    answer: 0,
    fact: "A cast keeps the bone steady so the healing crew can work.",
  },
  {
    question: "Are bones alive?",
    options: ["Yes!", "Nope", "Only baby bones"],
    answer: 0,
    fact: "Bones are living tissue with blood vessels and cells.",
  },
];

function GameModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => frameRef.current?.focus({ preventScroll: true }));
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const pop = reduceMotion
    ? { type: "tween" as const, duration: 0.15 }
    : { type: "spring" as const, bounce: 0.42, visualDuration: 0.45 };

  return (
    <AnimatePresence>
      {open && (
        <div className="game-modal" role="presentation">
          <motion.div
            className="game-modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
          >
            <div className="game-modal-rays" aria-hidden="true" />
          </motion.div>
          <motion.div
            ref={frameRef}
            tabIndex={-1}
            className="game-modal-frame"
            role="dialog"
            aria-modal="true"
            aria-label="Bone Bonanza"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.35, y: 140, rotate: -7 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ ...pop, opacity: { duration: 0.15 } }}
          >
            <motion.div
              className="game-modal-ribbon"
              aria-hidden="true"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.2, y: 20, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: -2 }}
              transition={{ ...pop, delay: reduceMotion ? 0 : 0.18 }}
            >
              <BoneSymbol className="game-modal-ribbon-bone" /> Game time!
            </motion.div>
            <motion.button
              className="game-modal-close"
              type="button"
              aria-label="Close game"
              onClick={onClose}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ ...pop, delay: reduceMotion ? 0 : 0.26 }}
              whileHover={reduceMotion ? undefined : { scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
            </motion.button>
            <div className="game-modal-panel">
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.2, visualDuration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function BoneBeatGame({
  xp,
  lesson1Completed,
  lesson2Completed,
  lesson3Completed,
  lesson4Completed,
  onSpendXp,
  onCollectStar,
  onEarnQuizXp,
  onRecordRun,
  onExit,
}: {
  xp: number;
  lesson1Completed: boolean;
  lesson2Completed: boolean;
  lesson3Completed: boolean;
  lesson4Completed: boolean;
  onSpendXp: (amount: number) => boolean;
  onCollectStar: (count: number, xpPerStar: number) => void;
  onEarnQuizXp: (amount: number) => void;
  onRecordRun: (difficulty: GameDifficulty, stars: number) => boolean;
  onExit: () => void;
}) {
  const equippedSkin = useContext(BennySkinContext);
  const [active, setActive] = useState(false);
  const [dead, setDead] = useState(false);
  const [showRecoveryQuiz, setShowRecoveryQuiz] = useState(false);
  const [recoveryQuizQuestions, setRecoveryQuizQuestions] = useState<RecoveryQuestion[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [distance, setDistance] = useState(0);
  const [recordSaved, setRecordSaved] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heldDirections = useRef(new Set<string>());
  const player = useRef({ x: 0, y: 0, angle: 0 });
  const runStart = useRef(0);
  const seed = useRef(0);
  const hardGapOffsets = useRef(new Map<number, number[]>());
  const collectedStars = useRef(new Set<string>());
  const collectedStarCount = useRef(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const collectStarRef = useRef(onCollectStar);
  collectStarRef.current = onCollectStar;
  const recordRunRef = useRef(onRecordRun);
  recordRunRef.current = onRecordRun;
  const hasCompletedLessons = lesson1Completed || lesson2Completed || lesson3Completed || lesson4Completed;

  function openRecoveryQuiz() {
    if (!hasCompletedLessons) return;
    setRecoveryQuizQuestions(makeRecoveryQuizQuestions(
      lesson1Completed,
      lesson2Completed,
      lesson3Completed,
      lesson4Completed,
    ));
    setShowRecoveryQuiz(true);
  }

  function startRun() {
    seed.current = Math.floor(Math.random() * 1_000_000);
    hardGapOffsets.current.clear();
    player.current = { x: 0, y: 0, angle: 0 };
    heldDirections.current.clear();
    collectedStars.current.clear();
    collectedStarCount.current = 0;
    setRecordSaved(null);
    setStarsCollected(0);
    setDistance(0);
    setDead(false);
    runStart.current = performance.now();
    setActive(true);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const foundContext = canvas.getContext("2d");
    if (!foundContext) return;
    const context: CanvasRenderingContext2D = foundContext;
    const bennyImage = new Image();
    bennyImage.onload = () => drawMap(performance.now());
    bennyImage.src = createBennyGameArtwork(equippedSkin);

    const tileSize = 360;
    const barrierSpacing = 390;
    const barrierLaneSpacing = 76;
    const playerRadius = 13;
    const hardBoneYOffsets = new Map<string, number[]>();
    let frame = 0;
    let lastFrame = performance.now();
    let lastHudUpdate = lastFrame;
    let width = 0;
    let height = 0;

    const resize = () => {
      // clientWidth/Height ignore CSS transforms, so the size stays correct while the modal scales in.
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawMap(performance.now());
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function tileRandom(tx: number, ty: number, item: number) {
      let value = Math.imul(tx + 127 + seed.current * 19, 374761393) + Math.imul(ty + 311, 668265263) + item * 2246822519;
      value = Math.imul(value ^ (value >>> 13), 1274126177);
      return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
    }

    function getGapStart(column: number, verticalChunk: number) {
      if (difficulty !== "hard") {
        return verticalChunk * 12 + 2 + Math.floor(tileRandom(column, verticalChunk, 47) * 7);
      }

      let offsets = hardGapOffsets.current.get(verticalChunk);
      if (!offsets) {
        offsets = [Math.floor(tileRandom(0, verticalChunk, 47) * 7)];
        hardGapOffsets.current.set(verticalChunk, offsets);
      }
      while (offsets.length <= column) {
        const previous = offsets[offsets.length - 1];
        const nextOptions = [previous - 6, previous - 5, previous - 4, previous + 4, previous + 5, previous + 6]
          .filter((offset) => offset >= 0 && offset <= 6);
        const choice = Math.floor(tileRandom(offsets.length, verticalChunk, 49) * nextOptions.length);
        offsets.push(nextOptions[choice]);
      }

      return verticalChunk * 12 + 2 + offsets[column];
    }

    function getBarrierLaneX(barrierX: number, lane: number) {
      if (difficulty === "hard") {
        const column = Math.round(barrierX / barrierSpacing) - 1;
        return barrierX + (tileRandom(column, lane, 53) - 0.5) * 230;
      }
      if (difficulty !== "easy") return barrierX;
      return barrierX + (lane % 2 === 0 ? -56 : 56);
    }

    function getBarrierBoneY(column: number, lane: number) {
      const baseY = lane * barrierLaneSpacing + barrierLaneSpacing / 2;
      if (difficulty !== "hard") return baseY;

      const verticalChunk = Math.floor(lane / 12);
      const key = `${column}:${verticalChunk}`;
      let offsets = hardBoneYOffsets.get(key);
      if (!offsets) {
        offsets = Array.from({ length: 12 }, (_, index) => (index - 5.5) * 12);
        for (let index = offsets.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(tileRandom(column, verticalChunk, 61 + index) * (index + 1));
          [offsets[index], offsets[swapIndex]] = [offsets[swapIndex], offsets[index]];
        }
        hardBoneYOffsets.set(key, offsets);
      }

      return baseY + offsets[((lane % 12) + 12) % 12];
    }

    function getStarPosition(barrierX: number, verticalChunk: number, gapStart: number, starIndex: number) {
      if (difficulty === "hard") {
        const verticalOffsets = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];
        return {
          x: barrierX - 360 + starIndex * 56,
          y: (verticalChunk * 12 + verticalOffsets[starIndex]) * barrierLaneSpacing,
        };
      }
      return {
        x: getBarrierLaneX(barrierX, gapStart + 1) - 240 + starIndex * 48,
        y: (gapStart + 1) * barrierLaneSpacing,
      };
    }

    function drawBone(x: number, y: number, angle: number, size: number, color: string) {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.scale(size, size);
      context.shadowColor = "#52644755";
      context.shadowBlur = 5;
      context.shadowOffsetY = 3;
      context.fillStyle = color;
      context.strokeStyle = "#806e4b";
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(-20, -4);
      context.bezierCurveTo(-27, -13, -38, -7, -33, 1);
      context.bezierCurveTo(-39, 9, -27, 16, -20, 7);
      context.lineTo(20, 7);
      context.bezierCurveTo(27, 16, 39, 9, 33, 1);
      context.bezierCurveTo(39, -7, 27, -13, 20, -4);
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    }

    function drawStar(x: number, y: number, pulse: number) {
      context.save();
      context.translate(x, y);
      context.rotate(pulse);
      context.shadowColor = "#e9a72c";
      context.shadowBlur = 12;
      context.fillStyle = "#ffcf4e";
      context.strokeStyle = "#a86b24";
      context.lineWidth = 2;
      context.beginPath();
      for (let point = 0; point < 10; point += 1) {
        const radius = point % 2 === 0 ? 13 : 6;
        const angle = -Math.PI / 2 + (point * Math.PI) / 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (point === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    }

    function drawPlayer(x: number, y: number, angle: number) {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      if (bennyImage.complete && bennyImage.naturalWidth > 0) {
        context.shadowColor = "#314b2b55";
        context.shadowBlur = 8;
        context.drawImage(bennyImage, -34, -36, 68, 72);
      }
      context.restore();
    }

    function drawMap(now: number) {
      const current = player.current;
      const playerScreenX = width * 0.32;
      const cameraX = current.x - playerScreenX;
      const cameraY = current.y - height / 2;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#b9c98d";
      context.fillRect(0, 0, width, height);

      const firstTileX = Math.floor(cameraX / tileSize) - 1;
      const lastTileX = Math.floor((cameraX + width) / tileSize) + 1;
      const firstTileY = Math.floor(cameraY / tileSize) - 1;
      const lastTileY = Math.floor((cameraY + height) / tileSize) + 1;
      for (let tx = firstTileX; tx <= lastTileX; tx += 1) {
        for (let ty = firstTileY; ty <= lastTileY; ty += 1) {
          const sx = tx * tileSize - cameraX;
          const sy = ty * tileSize - cameraY;
          const patch = tileRandom(tx, ty, 0);
          context.fillStyle = patch > 0.5 ? "#c4d39a70" : "#82986722";
          context.beginPath();
          context.ellipse(
            sx + tileSize * (0.25 + tileRandom(tx, ty, 17) * 0.5),
            sy + tileSize * (0.25 + tileRandom(tx, ty, 18) * 0.5),
            tileSize * (0.28 + tileRandom(tx, ty, 19) * 0.12),
            tileSize * (0.26 + tileRandom(tx, ty, 20) * 0.12),
            tileRandom(tx, ty, 21),
            0,
            Math.PI * 2,
          );
          context.fill();

          for (let item = 0; item < 7; item += 1) {
            const randomX = tileRandom(tx, ty, item * 3 + 1);
            const randomY = tileRandom(tx, ty, item * 3 + 2);
            const px = sx + 28 + randomX * (tileSize - 56);
            const py = sy + 28 + randomY * (tileSize - 56);
            if (item < 4) {
              const speck = 2 + tileRandom(tx, ty, item * 3 + 3) * 3;
              context.fillStyle = "#758a5b45";
              context.beginPath();
              context.arc(px, py, speck, 0, Math.PI * 2);
              context.fill();
            } else if (difficulty === "hard" && item >= 5) {
              const boneX = tx * tileSize + 28 + randomX * (tileSize - 56);
              const boneY = ty * tileSize + 28 + randomY * (tileSize - 56);
              const rotation = tileRandom(tx, ty, item * 11 + 4) * Math.PI;
              const size = 0.62 + tileRandom(tx, ty, item * 11 + 5) * 0.35;
              const boneColor = ["#f1e2bd", "#e7d6ad", "#f6ebd0"][Math.floor(tileRandom(tx, ty, item * 11 + 6) * 3)];
              drawBone(boneX - cameraX, boneY - cameraY, rotation, size, boneColor);
            }
          }

        }
      }

      const firstBarrier = Math.max(0, Math.floor(cameraX / barrierSpacing) - 1);
      const lastBarrier = Math.floor((cameraX + width) / barrierSpacing);
      const firstLane = Math.floor(cameraY / barrierLaneSpacing) - 1;
      const lastLane = Math.ceil((cameraY + height) / barrierLaneSpacing) + 1;
      for (let column = firstBarrier; column <= lastBarrier; column += 1) {
        const barrierX = (column + 1) * barrierSpacing;
        const hasStar = true;
        const firstVerticalChunk = Math.floor(firstLane / 12) - 1;
        const lastVerticalChunk = Math.floor(lastLane / 12) + 1;
        if (hasStar) {
          for (let verticalChunk = firstVerticalChunk; verticalChunk <= lastVerticalChunk; verticalChunk += 1) {
            const gapStart = getGapStart(column, verticalChunk);
            const starCount = difficulty === "hard" ? 7 : 3;
            for (let starIndex = 0; starIndex < starCount; starIndex += 1) {
              const starId = `barrier-${column}-${verticalChunk}-${starIndex}`;
              if (collectedStars.current.has(starId)) continue;
              const star = getStarPosition(barrierX, verticalChunk, gapStart, starIndex);
              drawStar(star.x - cameraX, star.y - cameraY, Math.sin(now / 240 + column + verticalChunk + starIndex) * 0.18);
            }
          }
        }
        for (let lane = firstLane; lane <= lastLane; lane += 1) {
          const verticalChunk = Math.floor(lane / 12);
          const gapStart = getGapStart(column, verticalChunk);
          if (lane >= gapStart && lane <= gapStart + (difficulty === "hard" ? 2 : 1)) continue;
          const boneY = getBarrierBoneY(column, lane);
          const rotation = (tileRandom(column, lane, 51) - 0.5) * 1.2;
          const size = difficulty === "hard" ? 0.82 + tileRandom(column, lane, 57) * 0.4 : 1.02;
          drawBone(getBarrierLaneX(barrierX, lane) - cameraX, boneY - cameraY, rotation, size, "#f2e5c4");
        }
      }

      const direction = current.angle;
      drawPlayer(playerScreenX, height / 2 + Math.sin(now / 170) * 1.5, direction);
    }

    function frameLoop(now: number) {
      const delta = Math.min((now - lastFrame) / 1000, 0.04);
      lastFrame = now;
      const directions = heldDirections.current;
      const horizontal = Number(directions.has("right")) - Number(directions.has("left"));
      const vertical = Number(directions.has("down")) - Number(directions.has("up"));
      const velocityX = (difficulty === "hard" ? 390 : 280) + horizontal * (difficulty === "hard" ? 135 : 110);
      const velocityY = vertical * 250;
      const magnitude = Math.hypot(velocityX, velocityY);
      const speedLimit = difficulty === "hard" ? 500 : 360;
      const scale = magnitude > speedLimit ? speedLimit / magnitude : 1;
      player.current.x += velocityX * scale * delta;
      player.current.y += velocityY * scale * delta;
      player.current.angle = Math.atan2(velocityY * scale, velocityX * scale) + Math.PI / 2;

      let collision = false;
      let foundStars = 0;
      const nearbyBarrier = Math.floor(player.current.x / barrierSpacing);
      for (let column = Math.max(0, nearbyBarrier - 1); column <= nearbyBarrier + 1 && !collision; column += 1) {
        const barrierX = (column + 1) * barrierSpacing;
        const lane = Math.floor(player.current.y / barrierLaneSpacing);
        for (let nearbyLane = lane - 1; nearbyLane <= lane + 1; nearbyLane += 1) {
          const verticalChunk = Math.floor(nearbyLane / 12);
          const gapStart = getGapStart(column, verticalChunk);
          if (nearbyLane >= gapStart && nearbyLane <= gapStart + (difficulty === "hard" ? 2 : 1)) continue;
          const boneY = getBarrierBoneY(column, nearbyLane);
          if (Math.abs(player.current.x - getBarrierLaneX(barrierX, nearbyLane)) < 33 && Math.abs(player.current.y - boneY) < 25) {
            collision = true;
            break;
          }
        }
      }

      if (difficulty === "hard" && !collision) {
        const tileSize = 360;
        const tileX = Math.floor(player.current.x / tileSize);
        const tileY = Math.floor(player.current.y / tileSize);
        for (let tx = tileX - 1; tx <= tileX + 1 && !collision; tx += 1) {
          for (let ty = tileY - 1; ty <= tileY + 1 && !collision; ty += 1) {
            for (let item = 5; item < 7; item += 1) {
              const randomX = tileRandom(tx, ty, item * 3 + 1);
              const randomY = tileRandom(tx, ty, item * 3 + 2);
              const boneX = tx * tileSize + 28 + randomX * (tileSize - 56);
              const boneY = ty * tileSize + 28 + randomY * (tileSize - 56);
              if (Math.hypot(player.current.x - boneX, player.current.y - boneY) < playerRadius + 14) {
                collision = true;
                break;
              }
            }
          }
        }
      }

      const currentVerticalChunk = Math.floor(player.current.y / (12 * barrierLaneSpacing));
      for (let column = Math.max(0, nearbyBarrier - 1); column <= nearbyBarrier + 1; column += 1) {
        for (let verticalChunk = currentVerticalChunk - 1; verticalChunk <= currentVerticalChunk + 1; verticalChunk += 1) {
          const gapStart = getGapStart(column, verticalChunk);
          const starCount = difficulty === "hard" ? 7 : 3;
          for (let starIndex = 0; starIndex < starCount; starIndex += 1) {
            const starId = `barrier-${column}-${verticalChunk}-${starIndex}`;
            if (collectedStars.current.has(starId)) continue;
            const barrierX = (column + 1) * barrierSpacing;
            const star = getStarPosition(barrierX, verticalChunk, gapStart, starIndex);
            if (star.x > player.current.x && Math.hypot(player.current.x - star.x, player.current.y - star.y) < playerRadius + 14) {
              collectedStars.current.add(starId);
              collectedStarCount.current += 1;
              foundStars += 1;
            }
          }
        }
      }
      if (foundStars > 0) {
        setStarsCollected(collectedStarCount.current);
        collectStarRef.current(foundStars, difficulty === "easy" ? 1 : 5);
      }
      drawMap(now);
      if (collision) {
        heldDirections.current.clear();
        setActive(false);
        setDead(true);
        setDistance(Math.floor((now - runStart.current) / 1000));
        setRecordSaved(recordRunRef.current(difficulty, collectedStarCount.current));
        return;
      }
      if (now - lastHudUpdate > 200) {
        setDistance(Math.floor((now - runStart.current) / 1000));
        lastHudUpdate = now;
      }
      frame = window.requestAnimationFrame(frameLoop);
    }

    if (active) frame = window.requestAnimationFrame(frameLoop);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, difficulty, equippedSkin]);

  useEffect(() => {
    const keyboardDirections: Record<string, string> = {
      ArrowUp: "up", KeyW: "up",
      ArrowDown: "down", KeyS: "down",
      ArrowLeft: "left", KeyA: "left",
      ArrowRight: "right", KeyD: "right",
    };
    function onKeyDown(event: KeyboardEvent) {
      const direction = keyboardDirections[event.code];
      if (direction && active) {
        event.preventDefault();
        heldDirections.current.add(direction);
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      const direction = keyboardDirections[event.code];
      if (direction) heldDirections.current.delete(direction);
    }
    function onBlur() {
      heldDirections.current.clear();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [active]);

  function useAnotherLife() {
    if (onSpendXp(10)) startRun();
  }

  function startFirstLife() {
    if (onSpendXp(10)) startRun();
  }

  function setDirection(direction: string, isDown: boolean) {
    if (isDown) heldDirections.current.add(direction);
    else heldDirections.current.delete(direction);
  }

  return (
    <main className="bone-field-page">
      <header className="game-topbar">
        <button className="lesson-back" type="button" onClick={onExit}>← Dashboard</button>
        <BoneLogo />
        <div className="game-xp-pill">{xp} XP</div>
      </header>
      <section className="game-shell">
        <div className="game-heading">
          <span className="eyebrow">THE BONEYARD</span>
          <h1>Bone Bonanza</h1>
          <p>{difficulty === "hard" ? "Hard run: scattered bones, wider gaps, and a faster pace." : "Keep moving east through the field. Dodge the bones for as long as you can."}</p>
        </div>
        <div className={`bone-map-wrap ${active ? "map-running" : ""}`}>
          <canvas ref={canvasRef} className="bone-map-canvas" aria-label="Top-down map with Benny surrounded by scattered bones" />
          <div className="game-hud">
            <span className="game-score">TIME <strong>{distance}s</strong></span>
            <span className="game-stars">STARS <strong>{starsCollected}</strong> · +{difficulty === "easy" ? 1 : 5} XP EACH</span>
            <span className="map-direction-hint">AUTO-RUN → · STEER WITH WASD OR ARROWS</span>
          </div>
          {!active && !dead && (
            <div className="game-overlay">
              <span className="game-overlay-icon" aria-hidden="true"><Icon><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></Icon></span>
              <h2>Choose your boneyard</h2>
              <p>Both runs cost 10 XP to enter. Collect stars for {difficulty === "easy" ? 1 : 5} XP each.</p>
              <div className="difficulty-options">
                <button className={`difficulty-option ${difficulty === "easy" ? "selected" : ""}`} type="button" aria-pressed={difficulty === "easy"} onClick={() => setDifficulty("easy")}>
                  <strong>Easy</strong><small>Bone rows · steady speed</small>
                </button>
                <button className={`difficulty-option ${difficulty === "hard" ? "selected" : ""}`} type="button" aria-pressed={difficulty === "hard"} onClick={() => setDifficulty("hard")}>
                  <strong>Hard</strong><small>Random bones · faster Benny</small>
                </button>
              </div>
              <button className="game-start-button" type="button" disabled={xp < 10} onClick={startFirstLife}>
                {xp >= 10 ? `Start ${difficulty} · 10 XP` : "Need 10 XP to play"} <span>→</span>
              </button>
              <small>Auto-run to the right · use ↑ ↓ ← → or WASD to steer</small>
              <button className="recovery-quiz-button" type="button" disabled={!hasCompletedLessons} onClick={openRecoveryQuiz}>
                {hasCompletedLessons ? "Take a quick lesson quiz for XP" : "Complete a lesson to unlock the XP quiz"}
              </button>
            </div>
          )}
          {dead && (
            <div className="game-overlay death-overlay" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
              <span className="game-overlay-icon"><BoneSymbol className="game-overlay-bone" /></span>
              <h2 id="game-over-title">Bone collision!</h2>
              <p>You survived for {distance} seconds on {difficulty}. Spend 10 XP for another life, or save your XP for later.</p>
              {recordSaved === false && <small role="alert">Your run couldn’t be saved to the leaderboard. Please check browser storage.</small>}
              <div className="game-death-actions">
                {xp >= 10 && <button className="game-start-button" type="button" onClick={useAnotherLife}>Use another life · 10 XP</button>}
                <button className="game-save-button" type="button" onClick={onExit}>Save my XP &amp; head home</button>
              </div>
              {xp < 10 && (
                <>
                  <small>You need 10 XP to play another life. Save up and come back!</small>
                  <button className="recovery-quiz-button" type="button" disabled={!hasCompletedLessons} onClick={openRecoveryQuiz}>
                    {hasCompletedLessons ? "Take a quick lesson quiz for XP" : "Complete a lesson to unlock the XP quiz"}
                  </button>
                </>
              )}
            </div>
          )}
          {showRecoveryQuiz && (
            <RecoveryQuiz
              questions={recoveryQuizQuestions}
              onEarnXp={onEarnQuizXp}
              onClose={() => setShowRecoveryQuiz(false)}
            />
          )}
        </div>
        {active && (
          <div className="field-controls" aria-label="Touch movement controls">
            <button type="button" className="field-control up" aria-label="Move up" onPointerDown={(event) => { event.preventDefault(); setDirection("up", true); }} onPointerUp={() => setDirection("up", false)} onPointerLeave={() => setDirection("up", false)} onPointerCancel={() => setDirection("up", false)}>↑</button>
            <button type="button" className="field-control left" aria-label="Move left" onPointerDown={(event) => { event.preventDefault(); setDirection("left", true); }} onPointerUp={() => setDirection("left", false)} onPointerLeave={() => setDirection("left", false)} onPointerCancel={() => setDirection("left", false)}>←</button>
            <button type="button" className="field-control down" aria-label="Move down" onPointerDown={(event) => { event.preventDefault(); setDirection("down", true); }} onPointerUp={() => setDirection("down", false)} onPointerLeave={() => setDirection("down", false)} onPointerCancel={() => setDirection("down", false)}>↓</button>
            <button type="button" className="field-control right" aria-label="Move right" onPointerDown={(event) => { event.preventDefault(); setDirection("right", true); }} onPointerUp={() => setDirection("right", false)} onPointerLeave={() => setDirection("right", false)} onPointerCancel={() => setDirection("right", false)}>→</button>
          </div>
        )}
        {!active && !dead && <button className="game-save-link" type="button" onClick={onExit}>Save XP and head home</button>}
      </section>
    </main>
  );
}

type RecoveryQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
};

const lesson1RecoveryQuestions: RecoveryQuestion[] = [
  {
    id: "lesson1-skull-protection",
    question: "Which bone protects your brain?",
    options: ["Skull", "Femur", "Tibia"],
    answer: 0,
  },
  {
    id: "lesson1-rib-protection",
    question: "What do your ribs help protect?",
    options: ["Your brain", "Your heart and lungs", "Your knees"],
    answer: 1,
  },
  {
    id: "lesson1-femur",
    question: "Which is the longest, strongest bone in your body?",
    options: ["Patella", "Humerus", "Femur"],
    answer: 2,
  },
  {
    id: "lesson1-spine",
    question: "Which bones help support your back and protect your spinal cord?",
    options: ["Vertebrae in your spine", "Carpals in your wrist", "Ribs in your chest"],
    answer: 0,
  },
  {
    id: "lesson1-humerus",
    question: "Where is the humerus?",
    options: ["Upper arm", "Lower leg", "Chest"],
    answer: 0,
  },
  {
    id: "lesson1-patella",
    question: "What is another name for your kneecap?",
    options: ["Patella", "Pelvis", "Radius"],
    answer: 0,
  },
  {
    id: "lesson1-pelvis",
    question: "Which bone group helps support your body where your legs join your trunk?",
    options: ["Pelvis", "Skull", "Sternum"],
    answer: 0,
  },
  {
    id: "lesson1-carpals",
    question: "The small bones in your wrist are called what?",
    options: ["Carpals", "Tibias", "Ribs"],
    answer: 0,
  },
];

const lesson2RecoveryQuestions: RecoveryQuestion[] = [
  {
    id: "lesson2-fracture-word",
    question: "A doctor says there is a fracture. What does that mean?",
    options: ["A bone is broken.", "A muscle is stronger.", "A bruise has healed."],
    answer: 0,
  },
  {
    id: "lesson2-stable",
    question: "An X-ray shows the broken bone ends still lined up. Is it stable or displaced?",
    options: ["Stable", "Displaced", "Neither; that means it is a bruise"],
    answer: 0,
  },
  {
    id: "lesson2-displaced",
    question: "The broken bone ends have moved out of line. What word describes this?",
    options: ["Transverse", "Displaced", "Stable"],
    answer: 1,
  },
  {
    id: "lesson2-oblique",
    question: "A crack slants diagonally across a bone. What type is it?",
    options: ["Oblique", "Transverse", "Stable"],
    answer: 0,
  },
  {
    id: "lesson2-transverse",
    question: "A crack runs straight across a bone. What type is it?",
    options: ["Displaced", "Oblique", "Transverse"],
    answer: 2,
  },
  {
    id: "lesson2-warning-sign",
    question: "Which could be a warning sign of a broken bone?",
    options: ["Strong pain and swelling", "A runny nose", "Feeling thirsty"],
    answer: 0,
  },
  {
    id: "lesson2-first-aid",
    question: "What should you do if you think someone broke a bone?",
    options: ["Keep it still and tell a grown-up", "Try to straighten it", "Ask them to keep playing"],
    answer: 0,
  },
  {
    id: "lesson2-emergency",
    question: "Which sign means you should get emergency help right away?",
    options: ["A bone is showing or fingers turn blue and cold", "A small bruise", "A scratch that stopped bleeding"],
    answer: 0,
  },
];

const lesson3RecoveryQuestions: RecoveryQuestion[] = [
  {
    id: "lesson3-pain",
    question: "Why can a broken bone hurt?",
    options: ["The injury affects nearby tissues and nerves.", "The bone has turned into muscle.", "The body has stopped sending blood."],
    answer: 0,
  },
  {
    id: "lesson3-early-healing",
    question: "What happens soon after a bone breaks?",
    options: ["Blood collects and forms a clot near the break.", "The soft callus turns hard right away.", "The bone pieces disappear."],
    answer: 0,
  },
  {
    id: "lesson3-callus",
    question: "What happens to the soft callus as the bone heals?",
    options: ["It gradually hardens into new bone.", "It turns into skin.", "It makes the break wider."],
    answer: 0,
  },
];

const lesson4RecoveryQuestions: RecoveryQuestion[] = [
  {
    id: "lesson4-cast-purpose",
    question: "How does a cast help an injured bone?",
    options: ["It helps keep the injured part still and protected.", "It heals the bone all by itself.", "It makes the bone move more."],
    answer: 0,
  },
  {
    id: "lesson4-hard-cast",
    question: "What can a hard cast be made from?",
    options: ["Fiberglass or plaster over soft padding.", "Paper and glue.", "Metal placed against the skin."],
    answer: 0,
  },
  {
    id: "lesson4-cast-removal",
    question: "Who should remove a hard cast?",
    options: ["A trained health professional.", "The person wearing it.", "A friend with scissors."],
    answer: 0,
  },
  {
    id: "lesson4-cast-care",
    question: "What should you do if fingers under a cast feel numb or look blue?",
    options: ["Tell a grown-up right away.", "Put an object inside the cast.", "Wait and see if it goes away."],
    answer: 0,
  },
];

const recoveryQuizHistoryKey = "bone-buddies-recovery-quiz-used";
const recoveryQuizLength = 3;

function shuffleRecoveryQuestions(questions: RecoveryQuestion[]) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function makeRecoveryQuizQuestions(
  lesson1Completed: boolean,
  lesson2Completed: boolean,
  lesson3Completed: boolean,
  lesson4Completed: boolean,
) {
  const pool = lesson4Completed
    ? lesson4RecoveryQuestions
    : lesson3Completed
      ? lesson3RecoveryQuestions
      : lesson2Completed
        ? lesson2RecoveryQuestions
        : lesson1Completed
          ? lesson1RecoveryQuestions
          : [];
  const savedIds = window.localStorage.getItem(recoveryQuizHistoryKey);
  const usedIds: string[] = savedIds ? JSON.parse(savedIds) : [];
  const freshQuestions = pool.filter((question) => !usedIds.includes(question.id));
  const selection = shuffleRecoveryQuestions(freshQuestions).slice(0, recoveryQuizLength);
  if (selection.length < recoveryQuizLength) {
    const selectedIds = new Set(selection.map((question) => question.id));
    const unusedForThisRound = pool.filter((question) => !selectedIds.has(question.id));
    selection.push(...shuffleRecoveryQuestions(unusedForThisRound).slice(0, recoveryQuizLength - selection.length));
  }
  window.localStorage.setItem(
    recoveryQuizHistoryKey,
    JSON.stringify([...new Set([...usedIds, ...selection.map((question) => question.id)])]),
  );
  return shuffleRecoveryQuestions(selection);
}

function RecoveryQuiz({ questions, onEarnXp, onClose }: { questions: RecoveryQuestion[]; onEarnXp: (amount: number) => void; onClose: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const question = questions[questionIndex];
  const finished = questionIndex === questions.length;

  function chooseAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.answer) {
      setCorrectCount((count) => count + 1);
      setEarnedXp((total) => total + 5);
      onEarnXp(5);
    }
  }

  function nextQuestion() {
    setSelected(null);
    setQuestionIndex((index) => index + 1);
  }

  return (
    <div className="game-overlay recovery-quiz-overlay" role="dialog" aria-modal="true" aria-labelledby="recovery-quiz-title">
      {finished ? (
        <>
          <span className="game-overlay-icon" aria-hidden="true"><Icon><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></Icon></span>
          <h2 id="recovery-quiz-title">Bone-rilliant!</h2>
          <p>You got {correctCount} of {questions.length} right and earned {earnedXp} XP.</p>
          <button className="game-start-button" type="button" onClick={onClose}>Back to the boneyard</button>
        </>
      ) : (
        <>
          <span className="eyebrow recovery-quiz-progress">LESSON REVIEW · {questionIndex + 1} OF {questions.length}</span>
          <h2 id="recovery-quiz-title">{question.question}</h2>
          <BennyReaction
            expression={selected === null ? "neutral" : selected === question.answer ? "happy" : "sad"}
            message={selected === null
              ? "Pick an answer!"
              : selected === question.answer
                ? "Correct! +5 XP"
                : `Not quite! The correct answer is: ${question.options[question.answer]}`}
          />
          <div className="recovery-quiz-options">
            {question.options.map((option, index) => (
              <button
                type="button"
                key={option}
                className={`recovery-quiz-option ${selected !== null && index === question.answer ? "correct" : ""} ${selected === index && index !== question.answer ? "incorrect" : ""}`}
                disabled={selected !== null}
                onClick={() => chooseAnswer(index)}
              >
                {option}
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="recovery-quiz-feedback" aria-live="polite">
              <button className="game-start-button" type="button" onClick={nextQuestion}>
                {questionIndex === questions.length - 1 ? "See my score" : "Next question"}
              </button>
            </div>
          )}
          <button className="recovery-quiz-cancel" type="button" onClick={onClose}>Return to the game</button>
        </>
      )}
    </div>
  );
}

function DailyQuestion() {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const question = dailyQuestions[dayNumber % dailyQuestions.length];
  const storageKey = `bone-buddies-daily-${new Date().toISOString().slice(0, 10)}`;
  const [selected, setSelected] = useState<number | null>(() => {
    const savedAnswer = window.localStorage.getItem(storageKey);
    return savedAnswer === null ? null : Number(savedAnswer);
  });

  function chooseAnswer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    window.localStorage.setItem(storageKey, String(index));
  }

  const isCorrect = selected === question.answer;

  return (
    <section className="daily-card">
      <div className="daily-heading">
        <span className="daily-icon">
          <Icon size={21}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </Icon>
        </span>
        <div>
          <span className="eyebrow">DAILY BONE QUIZ</span>
          <strong>Question of the day</strong>
        </div>
      </div>
      <p className="daily-question">{question.question}</p>
      <div className="daily-options">
        {question.options.map((option, index) => {
          const isChosen = selected === index;
          const isAnswer = selected !== null && index === question.answer;
          return (
            <button
              className={`daily-option ${isChosen ? "chosen" : ""} ${isAnswer ? "correct" : ""}`}
              type="button"
              key={option}
              disabled={selected !== null}
              onClick={() => chooseAnswer(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
              {isAnswer && <b>✓</b>}
              {isChosen && !isCorrect && <b>×</b>}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`daily-feedback ${isCorrect ? "success" : "try-again"}`} aria-live="polite">
          <strong>{isCorrect ? "Bone-rilliant!" : "Good guess!"}</strong>
          <span>{question.fact}</span>
        </div>
      )}
    </section>
  );
}

function LeaderboardPage({ entries, error, onBack }: { entries: LeaderboardEntry[]; error: string; onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const rankedEntries = entries
    .filter((entry) => entry.difficulty === difficulty)
    .sort((a, b) => b.stars - a.stars || a.achievedAt - b.achievedAt)
    .slice(0, 20);

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to dashboard</button>
        <BoneLogo />
        <span className="leaderboard-mark">🏆 TOP 20</span>
      </header>
      <div className="leaderboard-shell">
        <section className="leaderboard-hero">
          <span className="leaderboard-cup" aria-hidden="true">🏆</span>
          <span className="eyebrow">THE BONEYARD HALL OF FAME</span>
          <h1>Star chasers</h1>
          <p>Who collected the most stars in a single Bone Bonanza run?</p>
        </section>
        <section className="leaderboard-card">
          <div className="leaderboard-tabs" role="tablist" aria-label="Leaderboard difficulty">
            {(["easy", "hard"] as const).map((level) => (
              <button
                className={`leaderboard-tab ${difficulty === level ? "selected" : ""}`}
                type="button"
                role="tab"
                aria-selected={difficulty === level}
                key={level}
                onClick={() => setDifficulty(level)}
              >
                {level === "easy" ? "🌱 Easy" : "💀 Hard"}
              </button>
            ))}
          </div>
          <div className="leaderboard-column-labels"><span>RANK</span><span>PLAYER</span><span>STARS</span></div>
          {error ? (
            <p className="leaderboard-error" role="alert">{error}</p>
          ) : rankedEntries.length ? (
            <ol className="leaderboard-list">
              {rankedEntries.map((entry, index) => (
                <li className={`leaderboard-row ${index < 3 ? `leaderboard-rank-${index + 1}` : ""}`} key={`${entry.username}-${entry.achievedAt}`}>
                  <span className="leaderboard-rank">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
                  <span className="leaderboard-player"><span className="leaderboard-player-avatar">{entry.username.charAt(0).toUpperCase()}</span><strong>{entry.username}</strong></span>
                  <span className="leaderboard-score"><strong>{entry.stars}</strong><small>★</small></span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="leaderboard-empty">
              <span aria-hidden="true">⭐</span>
              <strong>No {difficulty} scores yet!</strong>
              <p>Play Bone Bonanza and collect stars to claim a spot here.</p>
            </div>
          )}
          <p className="leaderboard-footnote">Each player’s best single-run star total is shown. Scores are saved in this browser.</p>
        </section>
      </div>
    </main>
  );
}

function ProfilePage({
  account,
  profile,
  onBack,
  onSave,
}: {
  account: Account;
  profile: Profile;
  onBack: () => void;
  onSave: (updatedAccount: Account) => { ok: boolean; message?: string };
}) {
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email);
  const [draftProfile, setDraftProfile] = useState<Profile>(() => normalizeProfile(profile));
  const [message, setMessage] = useState("");

  function toggleArray(field: "sports" | "activities" | "reasonsForJoining", value: string) {
    const current = draftProfile[field];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setDraftProfile({ ...draftProfile, [field]: next });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updatedProfile = normalizeProfile({
      ...draftProfile,
      name: firstName.trim() || account.firstName,
    });
    const result = onSave({
      ...account,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
      profile: updatedProfile,
      onboardingCompleted: true,
    });
    setMessage(result.ok ? "Your profile has been saved." : result.message ?? "We couldn’t save your profile.");
  }

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to dashboard</button>
        <BoneLogo />
        <span className="profile-header-name">{account.username}</span>
      </header>

      <div className="profile-shell">
        <section className="profile-heading">
          <div className="profile-avatar">{firstName.charAt(0).toUpperCase() || "?"}</div>
          <div>
            <span className="eyebrow">MY ACCOUNT</span>
            <h1>Your profile</h1>
            <p>Update your account details and questionnaire answers.</p>
          </div>
        </section>

        <form className="profile-form" onSubmit={submit}>
          <section className="profile-card">
            <div className="profile-card-heading">
              <span className="profile-card-icon"><Icon><><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></></Icon></span>
              <div><h2>Account details</h2><p>The basics people and Bone Buddies use to know you.</p></div>
            </div>
            <div className="profile-fields">
              <label>
                <span>Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" />
              </label>
              <label>
                <span>First name</span>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoComplete="given-name" />
              </label>
              <label>
                <span>Last name</span>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} required autoComplete="family-name" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
            </div>
          </section>

          <section className="profile-card questionnaire-card">
            <div className="profile-card-heading">
              <span className="profile-card-icon yellow"><Icon><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Icon></span>
              <div><h2>My questionnaire</h2><p>Tell us what you enjoy and what helps you learn.</p></div>
            </div>

            <div className="questionnaire-fields">
              <label>
                <span>Grade</span>
                <select value={draftProfile.grade} onChange={(event) => setDraftProfile({ ...draftProfile, grade: event.target.value })}>
                  <option value="">Choose a grade</option>
                  {["Kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th", "Middle school", "High school"].map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend>Why did you join?</legend>
                <div className="profile-option-grid">
                  {["To learn about bones", "To get better at first aid", "To earn XP and play games", "For a school assignment"].map((reason) => (
                    <label className="profile-check" key={reason}>
                      <input type="checkbox" checked={draftProfile.reasonsForJoining.includes(reason)} onChange={() => toggleArray("reasonsForJoining", reason)} />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Sports you enjoy</legend>
                <div className="profile-option-grid">
                  {sports.map((sport) => (
                    <label className="profile-check" key={sport}>
                      <input type="checkbox" checked={draftProfile.sports.includes(sport)} onChange={() => toggleArray("sports", sport)} />
                      <span>{sport}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Activities you enjoy</legend>
                <div className="profile-option-grid">
                  {activities.map((activity) => (
                    <label className="profile-check" key={activity}>
                      <input type="checkbox" checked={draftProfile.activities.includes(activity)} onChange={() => toggleArray("activities", activity)} />
                      <span>{activity}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label>
                <span>Do you play an instrument?</span>
                <select value={draftProfile.playsInstrument} onChange={(event) => setDraftProfile({ ...draftProfile, playsInstrument: event.target.value, instrument: event.target.value === "Yes, I do!" ? draftProfile.instrument : "" })}>
                  <option value="">Choose an answer</option>
                  <option>Yes, I do!</option>
                  <option>Not right now</option>
                </select>
              </label>
              {draftProfile.playsInstrument === "Yes, I do!" && (
                <label>
                  <span>Instrument</span>
                  <input value={draftProfile.instrument} onChange={(event) => setDraftProfile({ ...draftProfile, instrument: event.target.value })} placeholder="What do you play?" />
                </label>
              )}

              <label>
                <span>Have you ever been injured?</span>
                <select value={draftProfile.injury} onChange={(event) => setDraftProfile({ ...draftProfile, injury: event.target.value })}>
                  <option value="">Choose an answer</option>
                  {["Yes, once", "Yes, more than once", "Not yet"].map((answer) => (
                    <option key={answer}>{answer}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <div className="profile-actions">
            {message && <p className={message.startsWith("Your") ? "profile-save-success" : "profile-save-error"} role="status">{message}</p>}
            <button className="primary-button" type="submit">Save profile</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function ShopPage({
  xp,
  ownedSkins,
  equippedSkin,
  onBack,
  onBuySkin,
  onEquipSkin,
}: {
  xp: number;
  ownedSkins: BennySkinId[];
  equippedSkin: BennySkinId;
  onBack: () => void;
  onBuySkin: (skinId: BennySkinId) => { ok: boolean; message: string };
  onEquipSkin: (skinId: BennySkinId) => { ok: boolean; message: string };
}) {
  const [notice, setNotice] = useState("");

  function handleSkin(skin: typeof bennySkins[number]) {
    const result = ownedSkins.includes(skin.id) ? onEquipSkin(skin.id) : onBuySkin(skin.id);
    setNotice(result.message);
  }

  return (
    <main className="shop-page">
      <header className="shop-topbar">
        <button className="lesson-back" type="button" onClick={onBack}>← Back to dashboard</button>
        <BoneLogo />
        <div className="shop-xp"><span aria-hidden="true">✦</span> {xp} XP</div>
      </header>

      <div className="shop-shell">
        <section className="shop-hero">
          <div className="shop-hero-copy">
            <span className="eyebrow">BENNY'S STYLE LAB</span>
            <h1>Give Benny a glow-up!</h1>
            <p>Trade your hard-earned XP for a fresh new look. Pick a favorite, then wear it on your next adventure.</p>
            <div className="shop-wallet"><span aria-hidden="true">✦</span><strong>{xp} XP</strong><small>ready to spend</small></div>
          </div>
          <div className="shop-hero-mascot"><span className="shop-sparkle sparkle-one">✦</span><span className="shop-sparkle sparkle-two">✧</span><Mascot skin={equippedSkin} /></div>
        </section>

        <div className="shop-title-row">
          <div><span className="eyebrow">THE BONE BOUTIQUE</span><h2>Choose your Benny</h2></div>
          <span className="shop-owned-count">{ownedSkins.length} / {bennySkins.length} collected</span>
        </div>
        {notice && <p className="shop-notice" role="status">{notice}</p>}

        <section className="skin-grid" aria-label="Benny skins">
          {bennySkins.map((skin) => {
            const owned = ownedSkins.includes(skin.id);
            const equipped = equippedSkin === skin.id;
            const canAfford = xp >= skin.price;
            return (
              <article className={`skin-card skin-card-${skin.theme}`} key={skin.id}>
                <div className="skin-art">
                  <span className="skin-emoji" aria-hidden="true">{skin.emoji}</span>
                  <Mascot small skin={skin.id} />
                  {equipped && <span className="skin-equipped-tag">Wearing</span>}
                </div>
                <div className="skin-info">
                  <div className="skin-name-row"><h3>{skin.name}</h3>{owned && <span className="skin-owned-tag">Owned</span>}</div>
                  <p>{skin.description}</p>
                  <button
                    className={`skin-action ${equipped ? "skin-action-equipped" : ""}`}
                    type="button"
                    disabled={equipped || (!owned && !canAfford)}
                    onClick={() => handleSkin(skin)}
                  >
                    {equipped ? "Equipped ✓" : owned ? "Wear this skin" : <><span aria-hidden="true">✦</span> {skin.price} XP</>}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
        <p className="shop-footnote">Earn XP by completing lessons and playing games. Your skins stay yours when you sign out!</p>
      </div>
    </main>
  );
}

function Home({
  profile,
  streak,
  xp,
  ownedSkins,
  equippedSkin,
  lesson1QuizCompleted,
  lesson2FinalQuizScoringCompleted,
  lesson3QuizCompleted,
  lesson4QuizCompleted,
  lessonProgress,
  onLessonComplete,
  onLessonProgress,
  onLessonQuizComplete,
  onLesson2QuizComplete,
  onLesson3QuizComplete,
  onLesson4QuizComplete,
  onSpendXp,
  onCollectStar,
  onEarnQuizXp,
  onRecordRun,
  onOpenProfile,
  onOpenLeaderboard,
  onBuySkin,
  onEquipSkin,
  onSignOut,
}: {
  profile: Profile;
  streak: number;
  xp: number;
  ownedSkins: BennySkinId[];
  equippedSkin: BennySkinId;
  lesson1QuizCompleted: boolean;
  lesson2FinalQuizScoringCompleted: boolean;
  lesson3QuizCompleted: boolean;
  lesson4QuizCompleted: boolean;
  lessonProgress?: LessonProgress;
  onLessonComplete: () => void;
  onLessonProgress: (progress: LessonProgress) => void;
  onLessonQuizComplete: (earnedXp: number) => void;
  onLesson2QuizComplete: (earnedXp: number) => void;
  onLesson3QuizComplete: (earnedXp: number) => void;
  onLesson4QuizComplete: (earnedXp: number) => void;
  onSpendXp: (amount: number) => boolean;
  onCollectStar: (count: number, xpPerStar: number) => void;
  onEarnQuizXp: (amount: number) => void;
  onRecordRun: (difficulty: GameDifficulty, stars: number) => boolean;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onBuySkin: (skinId: BennySkinId) => { ok: boolean; message: string };
  onEquipSkin: (skinId: BennySkinId) => { ok: boolean; message: string };
  onSignOut: () => void;
}) {
  const [message, setMessage] = useState("Your bones are living tissue. That means they can fix themselves!");
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => [
    ...(lesson1QuizCompleted ? [0] : []),
    ...(lesson2FinalQuizScoringCompleted ? [1] : []),
    ...(lesson3QuizCompleted ? [2] : []),
    ...(lesson4QuizCompleted ? [3] : []),
  ]);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const hasStartedLessons = Boolean(
    lessonProgress ||
    lesson1QuizCompleted ||
    lesson2FinalQuizScoringCompleted ||
    lesson3QuizCompleted ||
    lesson4QuizCompleted
  );

  useEffect(() => {
    if (!profileMenuOpen) return;
    function closeProfileMenu(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setProfileMenuOpen(false);
      }
      if (event instanceof MouseEvent && !profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenu);
    return () => {
      document.removeEventListener("pointerdown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenu);
    };
  }, [profileMenuOpen]);

  if (showShop) {
    return (
      <ShopPage
        xp={xp}
        ownedSkins={ownedSkins}
        equippedSkin={equippedSkin}
        onBack={() => setShowShop(false)}
        onBuySkin={onBuySkin}
        onEquipSkin={onEquipSkin}
      />
    );
  }

  if (activeLesson === 0) {
    return (
      <BoneLesson
        onBack={() => setActiveLesson(null)}
        onPlayGame={() => setShowGame(true)}
        xpAlreadyClaimed={lesson1QuizCompleted}
        initialSlide={resumeProgress && lessonProgress?.lessonIndex === 0 ? lessonProgress.slideIndex : 0}
        onProgress={onLessonProgress}
        onQuizComplete={onLessonQuizComplete}
        onComplete={() => {
          if (!completedLessons.includes(0)) {
            setCompletedLessons([...completedLessons, 0]);
            onLessonComplete();
          }
          setActiveLesson(null);
        }}
      />
    );
  }

  if (activeLesson === 1) {
    return (
      <FractureLesson
        onBack={() => setActiveLesson(null)}
        finalQuizXpAlreadyClaimed={lesson2FinalQuizScoringCompleted}
        initialSlide={resumeProgress && lessonProgress?.lessonIndex === 1 ? lessonProgress.slideIndex : 0}
        onProgress={onLessonProgress}
        onQuizComplete={onLesson2QuizComplete}
        onComplete={() => {
          if (!completedLessons.includes(1)) {
            setCompletedLessons([...completedLessons, 1]);
            onLessonComplete();
          }
          setActiveLesson(null);
        }}
      />
    );
  }

  if (activeLesson === 2) {
    return (
      <HealingLesson
        onBack={() => setActiveLesson(null)}
        xpAlreadyClaimed={lesson3QuizCompleted}
        initialSlide={resumeProgress && lessonProgress?.lessonIndex === 2 ? lessonProgress.slideIndex : 0}
        onProgress={onLessonProgress}
        onQuizComplete={onLesson3QuizComplete}
        onComplete={() => {
          if (!completedLessons.includes(2)) {
            setCompletedLessons([...completedLessons, 2]);
            onLessonComplete();
          }
          setActiveLesson(null);
        }}
      />
    );
  }

  if (activeLesson === 3) {
    return (
      <CastLesson
        onBack={() => setActiveLesson(null)}
        xpAlreadyClaimed={lesson4QuizCompleted}
        initialSlide={resumeProgress && lessonProgress?.lessonIndex === 3 ? lessonProgress.slideIndex : 0}
        onProgress={onLessonProgress}
        onQuizComplete={onLesson4QuizComplete}
        onComplete={() => {
          if (!completedLessons.includes(3)) {
            setCompletedLessons([...completedLessons, 3]);
            onLessonComplete();
          }
          setActiveLesson(null);
        }}
      />
    );
  }

  function openLesson(index: number, title: string) {
    if (
      index <= 1 ||
      (index === 2 && lesson2FinalQuizScoringCompleted) ||
      (index === 3 && lesson3QuizCompleted)
    ) {
      setResumeProgress(false);
      setActiveLesson(index);
      return;
    }

    setMessage(`${title} is locked. Complete the earlier lessons to unlock it.`);
  }

  return (
    <>
    <main className="home-page">
      <header className="home-nav">
        <BoneLogo />
        <div className="nav-actions">
          <div className="xp-pill" title="Experience points saved for future games">
            <Icon><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></Icon>
            <strong>{xp} XP</strong>
          </div>
          <div className="streak-pill" title="Learning streak">
            <Icon size={18} viewBox="0 0 24 24"><path d="M12 22c4.4 0 8-3.6 8-8 0-5-4-9-8-12-1 5-8 7-8 13 0 3.9 3.6 7 8 7Z" /><path d="M9 18c0-3 3-4 3-7 2 2 3 4 3 6a3 3 0 0 1-6 1Z" /></Icon>
            <strong>{streak}</strong><span>day streak</span>
          </div>
          <button className="shop-nav-button" type="button" onClick={() => setShowShop(true)} aria-label="Open Benny's shop">
            <Icon><><path d="M3 8h18l-1.5 13h-15L3 8Z" /><path d="M8 9V6a4 4 0 0 1 8 0v3" /></></Icon>
            <span>Shop</span>
          </button>
          <button className="leaderboard-nav-button" type="button" onClick={onOpenLeaderboard} aria-label="Open leaderboard">
            <span aria-hidden="true">🏆</span><span>Leaderboard</span>
          </button>
          <div className="profile-menu-wrap" ref={profileMenuRef}>
            <button
              className="avatar"
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              title="Open account menu"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
            >
              {profile.name.charAt(0).toUpperCase()}
            </button>
            {profileMenuOpen && (
              <div className="profile-menu" role="menu" aria-label="Account options">
                <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); onOpenProfile(); }}>View profile</button>
                <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); onSignOut(); }}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard">
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">GOOD TO SEE YOU!</span>
            <h1>Hey {profile.name}, ready to get bone-smart?</h1>
            <p>{hasStartedLessons ? "Pick up where you left off, or explore something new." : "Ready to begin? Start your first bone-smart lesson!"}</p>
            <div className="welcome-actions">
              <button className="dark-button" type="button" onClick={() => {
                const progress = lessonProgress ?? { lessonIndex: 0, slideIndex: 0 };
                setResumeProgress(true);
                setActiveLesson(progress.lessonIndex);
              }}>
                {hasStartedLessons ? "Continue where I left off" : "Start lesson 1"} <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              </button>
              <button className="game-shortcut-button" type="button" onClick={() => setShowGame(true)}>
                <BoneSymbol className="game-shortcut-bone" /> Play Bone Bonanza
              </button>
            </div>
          </div>
          <div className="banner-mascot" aria-hidden="true">
            <Mascot small skin={equippedSkin} />
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="lessons-section">
            <div className="section-heading">
              <div><span className="eyebrow">YOUR ADVENTURE</span><h2>Bone lessons</h2></div>
              <span className="lesson-count">{completedLessons.length} of 4 complete</span>
            </div>
            <div className="lesson-list">
              {lessons.map((lesson, index) => {
                const isOpen =
                  index <= 1 ||
                  (index === 2 && lesson2FinalQuizScoringCompleted) ||
                  (index === 3 && lesson3QuizCompleted);
                return (
                  <button
                    className={`lesson-card ${isOpen ? "lesson-open" : "lesson-locked"}`}
                    type="button"
                    key={lesson.number}
                    disabled={!isOpen}
                    onClick={() => openLesson(index, lesson.title)}
                  >
                    <span className={`lesson-number ${lesson.tone}`}>
                      {completedLessons.includes(index) ? "✓" : lesson.number}
                    </span>
                    <span className="lesson-info">
                      <strong>{lesson.title}</strong>
                      <small>{lesson.note}</small>
                      <span className="lesson-progress">
                        <i style={{ width: `${completedLessons.includes(index) ? 100 : index === 0 ? lesson.progress : 0}%` }} />
                      </span>
                    </span>
                    <span className="lesson-status">
                      {isOpen ? (completedLessons.includes(index) ? "Review" : "Open") : "Locked"}
                    </span>
                    {isOpen ? (
                      <Icon><path d="m9 18 6-6-6-6" /></Icon>
                    ) : (
                      <Icon><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside>
            <section className="streak-card">
              <div className="flame">
                <Icon size={30} viewBox="0 0 24 24"><path d="M12 22c4.4 0 8-3.6 8-8 0-5-4-9-8-12-1 5-8 7-8 13 0 3.9 3.6 7 8 7Z" /><path d="M9 18c0-3 3-4 3-7 2 2 3 4 3 6a3 3 0 0 1-6 1Z" /></Icon>
              </div>
              <div>
                <span className="eyebrow">YOUR STREAK</span>
                <h2>{streak} {streak === 1 ? "day" : "days"} strong!</h2>
              </div>
              <div className="week-row">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={`${day}-${index}`} className={index < streak ? "day done" : "day"}>
                    <span>{index < streak ? "✓" : ""}</span><small>{day}</small>
                  </div>
                ))}
              </div>
              <p>Come back tomorrow to keep your streak alive.</p>
            </section>

            <DailyQuestion />

            <section className="fact-card">
              <span className="fact-label">BENNY’S BONE FACT</span>
              <p>{message}</p>
              <div className="fact-footer">
                <span>Wild, right?</span>
                <button type="button" aria-label="Show another fact" onClick={() => setMessage("A grown-up has 206 bones, but babies start with about 270!")}>
                  <Icon><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" /></Icon>
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
      <GameModal open={showGame} onClose={() => setShowGame(false)}>
        <BoneBeatGame
          xp={xp}
          lesson1Completed={lesson1QuizCompleted}
          lesson2Completed={lesson2FinalQuizScoringCompleted}
          lesson3Completed={lesson3QuizCompleted}
          lesson4Completed={lesson4QuizCompleted}
          onSpendXp={onSpendXp}
          onCollectStar={onCollectStar}
          onEarnQuizXp={onEarnQuizXp}
          onRecordRun={onRecordRun}
          onExit={() => setShowGame(false)}
        />
      </GameModal>
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [account, setAccount] = useState<Account | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [streakData, setStreakData] = useState<{ count: number; lastActiveDate: string }>(() => {
    const savedStreak = window.localStorage.getItem("bone-buddies-streak");
    return savedStreak ? JSON.parse(savedStreak) : { count: 0, lastActiveDate: "" };
  });

  function saveStreak(count: number, lastActiveDate: string) {
    const nextStreak = { count, lastActiveDate };
    setStreakData(nextStreak);
    window.localStorage.setItem("bone-buddies-streak", JSON.stringify(nextStreak));
  }

  function startFirstDay() {
    if (streakData.count === 0) {
      saveStreak(1, new Date().toISOString().slice(0, 10));
    }
  }

  function completeLesson() {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    if (streakData.lastActiveDate === todayKey) return;

    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    const nextCount = streakData.lastActiveDate === yesterdayKey ? streakData.count + 1 : 1;
    saveStreak(nextCount, todayKey);
  }

  if (screen === "signin") {
    return (
      <SignIn
        onContinue={(signedIn, isNew) => {
          setAccount(signedIn);
          setProfile(normalizeProfile(signedIn.profile ?? { ...initialProfile, name: signedIn.firstName }));
          startFirstDay();
          setScreen(isNew || !hasCompletedOnboarding(signedIn) ? "quiz" : "home");
        }}
      />
    );
  }

  if (screen === "quiz") {
    return (
      <BennySkinContext.Provider value={account?.equippedSkin ?? "classic"}>
        <Questionnaire
          profile={profile}
          setProfile={setProfile}
          onDone={() => {
            if (account) {
              const normalizedProfile = normalizeProfile(profile);
              const updatedAccount = { ...account, profile: normalizedProfile, onboardingCompleted: true };
              saveAccount(updatedAccount, loadAccounts());
              setAccount(updatedAccount);
              setProfile(normalizedProfile);
            }
            setScreen("home");
          }}
        />
      </BennySkinContext.Provider>
    );
  }

  if (screen === "profile" && account) {
    return (
      <ProfilePage
        account={account}
        profile={profile}
        onBack={() => setScreen("home")}
        onSave={(updatedAccount) => {
          try {
            const accounts = loadAccounts();
            const usernameKey = updatedAccount.username.trim().toLowerCase();
            const emailKey = updatedAccount.email.trim().toLowerCase();
            if (!usernameKey || !updatedAccount.firstName.trim() || !updatedAccount.lastName.trim()) {
              return { ok: false, message: "Please complete your username and name." };
            }
            if (accounts[usernameKey] && accounts[usernameKey].username.toLowerCase() !== account.username.toLowerCase()) {
              return { ok: false, message: "That username is already taken." };
            }
            if (Object.values(accounts).some((savedAccount) =>
              savedAccount.username.toLowerCase() !== account.username.toLowerCase() &&
              savedAccount.email.toLowerCase() === emailKey
            )) {
              return { ok: false, message: "An account with that email already exists." };
            }
            const oldKey = account.username.toLowerCase();
            if (oldKey !== usernameKey) {
              delete accounts[oldKey];
            }
            saveAccount(updatedAccount, accounts);
            setAccount(updatedAccount);
            setProfile(updatedAccount.profile ?? profile);
            return { ok: true };
          } catch {
            return { ok: false, message: "Your profile couldn’t be saved. Please try again." };
          }
        }}
      />
    );
  }

  if (screen === "leaderboard") {
    return <LeaderboardPage entries={leaderboardEntries} error={leaderboardError} onBack={() => setScreen("home")} />;
  }

  return (
    <BennySkinContext.Provider value={account?.equippedSkin ?? "classic"}>
      <Home
        profile={profile}
        streak={streakData.count}
        xp={account?.xp ?? 0}
        ownedSkins={account?.ownedSkins ?? ["classic"]}
        equippedSkin={account?.equippedSkin ?? "classic"}
      lesson1QuizCompleted={account?.lesson1QuizCompleted ?? false}
      lesson2FinalQuizScoringCompleted={account?.lesson2FinalQuizScoringCompleted ?? false}
      lesson3QuizCompleted={account?.lesson3QuizCompleted ?? false}
      lesson4QuizCompleted={account?.lesson4QuizCompleted ?? false}
      lessonProgress={getLessonProgress(account)}
      onLessonComplete={completeLesson}
      onLessonProgress={(progress) => {
        if (!account) return;
        const accounts = loadAccounts();
        const currentAccount = accounts[account.username.toLowerCase()] ?? account;
        const updatedAccount = { ...currentAccount, lessonProgress: progress };
        saveAccount(updatedAccount, accounts);
        setAccount(updatedAccount);
      }}
      onLessonQuizComplete={(earnedXp) => {
        if (!account || account.lesson1QuizCompleted) return;
        const updatedAccount = {
          ...account,
          xp: (account.xp ?? 0) + earnedXp,
          lesson1QuizCompleted: true,
        };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onLesson2QuizComplete={(earnedXp) => {
        if (!account || account.lesson2FinalQuizScoringCompleted) return;
        const updatedAccount = {
          ...account,
          xp: (account.xp ?? 0) + earnedXp,
          lesson2QuizCompleted: true,
          lesson2FinalQuizCompleted: true,
          lesson2FinalQuizScoringCompleted: true,
        };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onLesson3QuizComplete={(earnedXp) => {
        if (!account || account.lesson3QuizCompleted) return;
        const updatedAccount = {
          ...account,
          xp: (account.xp ?? 0) + earnedXp,
          lesson3QuizCompleted: true,
        };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onLesson4QuizComplete={(earnedXp) => {
        if (!account || account.lesson4QuizCompleted) return;
        const updatedAccount = {
          ...account,
          xp: (account.xp ?? 0) + earnedXp,
          lesson4QuizCompleted: true,
        };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onSpendXp={(amount) => {
        if (!account || amount <= 0 || (account.xp ?? 0) < amount) return false;
        const updatedAccount = { ...account, xp: (account.xp ?? 0) - amount };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
        return true;
      }}
      onBuySkin={(skinId) => {
        const skin = bennySkins.find((item) => item.id === skinId);
        if (!account || !skin) return { ok: false, message: "We couldn’t complete that purchase." };
        try {
          const accounts = loadAccounts();
          const currentAccount = accounts[account.username.toLowerCase()] ?? account;
          const ownedSkins = currentAccount.ownedSkins ?? ["classic"];
          if (ownedSkins.includes(skinId)) return { ok: false, message: "You already own this Benny skin." };
          if ((currentAccount.xp ?? 0) < skin.price) return { ok: false, message: "You need more XP for this skin." };
          const updatedAccount: Account = {
            ...currentAccount,
            xp: (currentAccount.xp ?? 0) - skin.price,
            ownedSkins: [...ownedSkins, skinId],
            equippedSkin: skinId,
          };
          saveAccount(updatedAccount, accounts);
          setAccount(updatedAccount);
          return { ok: true, message: `${skin.name} unlocked and equipped! Benny looks bone-rilliant.` };
        } catch {
          return { ok: false, message: "Your purchase couldn’t be saved. Please try again." };
        }
      }}
      onEquipSkin={(skinId) => {
        if (!account) return { ok: false, message: "Please sign in again to change Benny’s look." };
        try {
          const accounts = loadAccounts();
          const currentAccount = accounts[account.username.toLowerCase()] ?? account;
          const ownedSkins = currentAccount.ownedSkins ?? ["classic"];
          if (!ownedSkins.includes(skinId)) return { ok: false, message: "Unlock this skin before wearing it." };
          const updatedAccount: Account = { ...currentAccount, equippedSkin: skinId };
          saveAccount(updatedAccount, accounts);
          setAccount(updatedAccount);
          const skinName = bennySkins.find((skin) => skin.id === skinId)?.name ?? "Benny's new look";
          return { ok: true, message: `${skinName} equipped. Benny is ready for an adventure!` };
        } catch {
          return { ok: false, message: "Benny’s look couldn’t be saved. Please try again." };
        }
      }}
      onCollectStar={(count, xpPerStar) => {
        if (!account) return;
        const updatedAccount = { ...account, xp: (account.xp ?? 0) + count * xpPerStar };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onEarnQuizXp={(earnedXp) => {
        if (!account || earnedXp <= 0) return;
        const updatedAccount = { ...account, xp: (account.xp ?? 0) + earnedXp };
        saveAccount(updatedAccount, loadAccounts());
        setAccount(updatedAccount);
      }}
      onRecordRun={(difficulty, stars) => {
        if (!account) return false;
        try {
          const entries = loadLeaderboard();
          const updatedEntries = [...entries, {
            username: account.username,
            difficulty,
            stars,
            achievedAt: Date.now(),
          }];
          const topEntries = (["easy", "hard"] as const).flatMap((level) =>
            updatedEntries
              .filter((entry) => entry.difficulty === level)
              .sort((a, b) => b.stars - a.stars || a.achievedAt - b.achievedAt)
              .slice(0, 20)
          );
          window.localStorage.setItem(leaderboardKey, JSON.stringify(topEntries));
          setLeaderboardEntries(topEntries);
          setLeaderboardError("");
          return true;
        } catch {
          return false;
        }
      }}
      onOpenProfile={() => setScreen("profile")}
      onOpenLeaderboard={() => {
        try {
          setLeaderboardEntries(loadLeaderboard());
          setLeaderboardError("");
          setScreen("leaderboard");
        } catch {
          setLeaderboardEntries([]);
          setLeaderboardError("Leaderboard scores couldn’t be loaded from this browser. Check browser storage and try again.");
          setScreen("leaderboard");
        }
      }}
        onSignOut={() => {
          setAccount(null);
          setScreen("signin");
        }}
      />
    </BennySkinContext.Provider>
  );
}
