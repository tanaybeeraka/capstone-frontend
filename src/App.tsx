import { FormEvent, InputHTMLAttributes, ReactNode, useState } from "react";

type Screen = "signin" | "quiz" | "home";

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

const sports = ["Soccer", "Basketball", "Gymnastics", "Baseball", "Skating", "Swimming", "Other"];
const activities = ["Biking", "Climbing", "Dancing", "Running", "Scootering", "Playground"];

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

function BoneLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M13.6 11.1a6.1 6.1 0 1 0-7.4 8.8l20.9 17.6a6 6 0 1 0 6.1-7.2L12.4 12.7" />
          <path d="M34.4 36.9a6.1 6.1 0 1 0 7.4-8.8L20.9 10.5a6 6 0 1 0-6.1 7.2l20.8 17.6" />
        </svg>
      </span>
      {!compact && <span className="brand-name">Bone Buddies</span>}
    </div>
  );
}

function Mascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "mascot mascot-small" : "mascot"}
      viewBox="0 0 210 220"
      role="img"
      aria-label="Benny, a smiling bone mascot wearing a green cap"
    >
      <ellipse className="mascot-shadow" cx="107" cy="204" rx="61" ry="11" />
      <path className="mascot-arm" d="M56 112c-20 4-26 16-31 28" />
      <path className="mascot-hand" d="M25 140c-1-10 2-14 8-17M25 140c-8-4-10-9-8-14" />
      <path className="mascot-arm" d="M157 112c22 1 29 13 34 24" />
      <path className="mascot-hand" d="M191 136c0-10-4-14-9-17M191 136c8-5 9-10 6-15" />
      <path className="mascot-body" d="M71 52c-20-15-36 9-26 25 4 7 10 9 17 9l-5 73c-7 1-13 6-15 13-3 11 5 23 17 23 6 0 11-3 14-7 8 8 20 6 26-2 7 9 19 10 27 2 3 4 8 7 14 7 12 0 20-12 17-23-2-7-8-12-15-13l-5-73c7 0 13-2 17-9 10-16-6-40-26-25-13-11-43-11-57 0Z" />
      <path className="mascot-cap" d="M63 52c9-31 51-37 74-13l-9 13c-16-9-43-10-65 0Z" />
      <path className="mascot-cap-brim" d="M126 49c17-5 31-2 41 4-9 6-25 7-41 3" />
      <circle className="mascot-eye" cx="83" cy="92" r="5" />
      <circle className="mascot-eye" cx="125" cy="92" r="5" />
      <path className="mascot-brow" d="M76 82c6-5 12-5 17-1M116 81c6-4 12-3 16 2" />
      <path className="mascot-mouth" d="M88 110c7 10 24 10 32 0" />
      <path className="mascot-cheek" d="M70 107l8 1M132 108l8-1" />
      <path className="mascot-leg" d="M78 186c-4 10-10 13-19 14M130 186c3 10 10 13 19 14" />
    </svg>
  );
}

type Account = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  profile?: Profile;
};

const accountsKey = "bone-buddies-accounts";

function loadAccounts(): Record<string, Account> {
  const saved = window.localStorage.getItem(accountsKey);
  return saved ? JSON.parse(saved) : {};
}

function saveAccount(account: Account) {
  const accounts = loadAccounts();
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

    const accounts = loadAccounts();
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
    saveAccount(account);
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
        <div className="mascot-stage">
          <div className="speech-bubble">No bones about it—<br />learning is fun!</div>
          <Mascot />
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
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={`choice ${active ? "choice-active" : ""}`} type="button" onClick={onClick}>
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
      valid: Boolean(profile.grade),
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
              onClick={() =>
                setProfile({
                  ...profile,
                  reasonsForJoining: profile.reasonsForJoining.includes(reason)
                    ? profile.reasonsForJoining.filter((item) => item !== reason)
                    : [...profile.reasonsForJoining, reason],
                })
              }
            >
              {reason}
            </ChoiceButton>
          ))}
        </div>
      ),
      valid: profile.reasonsForJoining.length > 0,
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
              onClick={() =>
                setProfile({
                  ...profile,
                  sports: profile.sports.includes(sport)
                    ? profile.sports.filter((item) => item !== sport)
                    : [...profile.sports, sport],
                })
              }
            >
              {sport}
            </ChoiceButton>
          ))}
        </div>
      ),
      valid: true,
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
      valid:
        profile.playsInstrument === "Not right now" ||
        (profile.playsInstrument === "Yes, I do!" && Boolean(profile.instrument.trim())),
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
      valid: Boolean(profile.injury),
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
              onClick={() =>
                setProfile({
                  ...profile,
                  activities: profile.activities.includes(activity)
                    ? profile.activities.filter((item) => item !== activity)
                    : [...profile.activities, activity],
                })
              }
            >
              {activity}
            </ChoiceButton>
          ))}
        </div>
      ),
      valid: true,
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
        <div className="question-content">{current.content}</div>
        <div className="quiz-actions">
          <button className="back-button" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <Icon><path d="M19 12H5M11 18l-6-6 6-6" /></Icon> Back
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={!current.valid}
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

const lessons = [
  { number: "01", title: "Lesson 1", note: "Lesson placeholder", tone: "yellow", progress: 100 },
  { number: "02", title: "Lesson 2", note: "Lesson placeholder", tone: "coral", progress: 45 },
  { number: "03", title: "Lesson 3", note: "Lesson placeholder", tone: "blue", progress: 0 },
  { number: "04", title: "Lesson 4", note: "Lesson placeholder", tone: "green", progress: 0 },
];

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

function Home({
  profile,
  streak,
  onLessonComplete,
  onSignOut,
}: {
  profile: Profile;
  streak: number;
  onLessonComplete: () => void;
  onSignOut: () => void;
}) {
  const [message, setMessage] = useState("Your bones are living tissue. That means they can fix themselves!");
  const [completedLessons, setCompletedLessons] = useState([0]);

  function openLesson(index: number, title: string) {
    if (index === 1 && !completedLessons.includes(index)) {
      setCompletedLessons([...completedLessons, index]);
      onLessonComplete();
      setMessage(`${title} complete! Your learning streak is safe for today.`);
      return;
    }

    setMessage(
      index < 2
        ? `${title} is ready for you! Lessons are coming in the next version.`
        : "Keep learning to unlock this lesson.",
    );
  }

  return (
    <main className="home-page">
      <header className="home-nav">
        <BoneLogo />
        <nav aria-label="Main navigation">
          <button className="nav-link active" type="button">Home</button>
          <button className="nav-link" type="button" onClick={() => setMessage("Your collection will unlock as you complete lessons!")}>My stuff</button>
        </nav>
        <div className="nav-actions">
          <div className="streak-pill" title="Learning streak">
            <Icon size={18} viewBox="0 0 24 24"><path d="M12 22c4.4 0 8-3.6 8-8 0-5-4-9-8-12-1 5-8 7-8 13 0 3.9 3.6 7 8 7Z" /><path d="M9 18c0-3 3-4 3-7 2 2 3 4 3 6a3 3 0 0 1-6 1Z" /></Icon>
            <strong>{streak}</strong><span>day streak</span>
          </div>
          <button className="avatar" type="button" onClick={onSignOut} title="Sign out">{profile.name.charAt(0).toUpperCase()}</button>
        </div>
      </header>

      <div className="dashboard">
        <section className="welcome-banner">
          <div>
            <span className="eyebrow">GOOD TO SEE YOU!</span>
            <h1>Hey {profile.name}, ready to get bone-smart?</h1>
            <p>Pick up where you left off, or explore something new.</p>
            <button className="dark-button" type="button" onClick={() => setMessage("Lesson 2 is ready! Click its card below to keep exploring.")}>
              Keep learning <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
            </button>
          </div>
          <div className="banner-mascot">
            <div className="mini-speech">You’ve got this!</div>
            <Mascot small />
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="lessons-section">
            <div className="section-heading">
              <div><span className="eyebrow">YOUR ADVENTURE</span><h2>Bone lessons</h2></div>
              <span className="lesson-count">1 of 4 complete</span>
            </div>
            <div className="lesson-list">
              {lessons.map((lesson, index) => (
                <button
                  className="lesson-card"
                  type="button"
                  key={lesson.number}
                  onClick={() => openLesson(index, lesson.title)}
                >
                  <span className={`lesson-number ${lesson.tone}`}>
                    {completedLessons.includes(index) ? "✓" : lesson.number}
                  </span>
                  <span className="lesson-info">
                    <strong>{lesson.title}</strong>
                    <small>{lesson.note}</small>
                    <span className="lesson-progress">
                      <i style={{ width: `${completedLessons.includes(index) ? 100 : lesson.progress}%` }} />
                    </span>
                  </span>
                  <span className="lesson-status">
                    {completedLessons.includes(index) ? "Review" : lesson.progress > 0 ? "Continue" : "Locked"}
                  </span>
                  <Icon><path d="m9 18 6-6-6-6" /></Icon>
                </button>
              ))}
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
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [account, setAccount] = useState<Account | null>(null);
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
          setProfile(signedIn.profile ?? { ...initialProfile, name: signedIn.firstName });
          startFirstDay();
          setScreen(isNew || !signedIn.profile ? "quiz" : "home");
        }}
      />
    );
  }

  if (screen === "quiz") {
    return (
      <Questionnaire
        profile={profile}
        setProfile={setProfile}
        onDone={() => {
          if (account) saveAccount({ ...account, profile });
          setScreen("home");
        }}
      />
    );
  }

  return (
    <Home
      profile={profile}
      streak={streakData.count}
      onLessonComplete={completeLesson}
      onSignOut={() => {
        setAccount(null);
        setScreen("signin");
      }}
    />
  );
}
