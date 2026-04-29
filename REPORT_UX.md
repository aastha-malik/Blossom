# Tendr — Web App User Experience Report

---

## What Is Tendr?

Tendr is a journal-shaped productivity web application. Its tagline is *"Tend to your to-do list like a friend."* The identity is editorial and analog — it looks and feels like a quiet weekly almanac, not a software dashboard.

The aesthetic is warm parchment paper tones (cream, terracotta red, sage green, amber) with serif typography from Fraunces, monospaced metadata labels from JetBrains Mono, and clean body text in Inter. There is a full light/dark mode. Light mode is warm cream paper; dark mode is a deep, low-contrast dark brown.

The central conceit is that every task completed becomes a treat for a virtual pet that lives inside the app. Doing your work keeps the pet fed and happy. Ignoring it has consequences.

---

## The Aesthetic Language

**Light mode:** warm parchment (#f4ece0), dark ink headings (#2a2118), terracotta red accent (#c94e3a), sage green (#5b7a4c), slate blue (#3d5a7c), amber (#c08a2a)

**Dark mode:** deep warm black (#1a1410), cream ink (#f0e8d8), softened accents

**Typography:**
- Fraunces (serif) — all headings, display text, quote text, italic flourishes
- JetBrains Mono — metadata labels, counters, date eyebrows, uppercase micro-tags
- Inter — body copy, form inputs, buttons

**Visual conventions:** 1px rule lines, dashed separators, subtle drop shadows, slightly rotated sample cards, no rounded corners on interactive elements — everything feels hand-laid.

---

## The Landing Page (/)

The landing is structured like a newspaper front page.

**Masthead:**
- Logo + "Tendr" in Fraunces serif
- Issue number ("no. 04 · spring '26") generated dynamically from week of year and season
- "Begin →" link to login, light/dark toggle

**Eyebrow strip:**
- `VOL. I · A QUIET ALMANAC FOR GETTING THINGS DONE · ₹0`

**Hero section (two-column grid):**

Left — the pitch:
> "Tend to your to-do list like a friend."

A blockquote-style italic description:
> "Tendr is a journal-shaped productivity app. Every task you finish earns a treat for a small animal that lives inside it. Show up daily and it gets happier; ignore it and, well, it remembers."

Two CTAs: **"Adopt your pet →"** (signup) and *"or read a sample day"* (login)

Right — a sample journal card, slightly rotated (1.4°), showing:
- A date + day counter header
- An SVG illustration of Mochi (the pet) in "content" mood
- "Mochi is content." / "3 of 5 tasks · 22 min of focus"
- A checklist with completed/uncompleted tasks (checkmark glyph ☒ / ☐ in JetBrains Mono)

**Feature trio (three columns):**
- I. "A task is a treat." — completing tasks feeds the pet
- II. "Focus is affection." — Pomodoro sessions count as time together
- III. "A 28-day garden of squares." — activity heatmap

**Footer strip:**
- `EST. 2026 · DELHI` | a user quote | `PG. 01`

If the user is already authenticated when they land here, they are immediately redirected to the Today dashboard.

---

## Authentication Flow

### Signing Up (/signup)

Standard form: username, email, password, confirm password. A "Sign up with Google" button is also present.

After submitting, the backend sends a 6-digit verification code by email. The user is taken to the email verification page (/verify-email) to enter the code before their account is activated.

### Logging In (/login)

Username or email + password. Also a "Continue with Google" option.

On success the JWT is stored in localStorage. The user is redirected to the Today dashboard.

### Forgot Password (/forgot-password)

Two-step form:
1. Enter email → receive OTP
2. Enter OTP + username + new password + confirm password → reset complete

### Google OAuth

A button on login, signup, and settings pages triggers `window.location.href = API_URL/auth/google/login`. After Google redirects back, `/auth/callback` reads the token from the URL and sets the auth state.

---

## The Today Dashboard (/today — primary logged-in view)

This is the main daily workspace. It is a two-column editorial layout styled like a journal spread.

> Note: This page is fully built (`Today.tsx`) and is the target of the post-login redirect. It is the most developed and opinionated page in the app.

---

### Left Column

**Eyebrow:** `TUE · 29 APR · DAY 014 WITH MOCHI` — dynamic, updates live

**Heading:** "Today's page." in 44px Fraunces

**Mood subtitle:** Changes based on how productive the day has been:
- 0 tasks done, low streak → "A light drizzle. Mochi is sleeping in."
- 1+ tasks done → "A gentle drizzle. Mochi is watching the window."
- 3+ tasks done → "Sun's out. Mochi is doing zoomies."
- Streak of 3+ but no tasks today → "Overcast, but familiar. Mochi is waiting for you."

**Task section:**

A column header shows: `TO DO | 4 items · 38 xp possible` (real-time calculation from pending tasks + their XP values)

Below that: the task list followed immediately by the add-task form. Both integrated inline on the page, not inside a separate card — it reads like a handwritten list.

**The Ledger Card:**

A bordered card titled "THE LEDGER · LAST 28 DAYS" with the subtitle *"How the season has been treating you."*

Three stat columns:
- **TASKS FINISHED** — lifetime count
- **TIME TOGETHER** — derived from XP (XP ÷ 10 = hours)
- **STREAK** — consecutive days in amber

Below the stats: the **28-day heatmap** — 28 thin vertical bars whose opacity scales with that day's completed task count. A label reads "each square, a day". Bars go from "28 D AGO" to "TODAY".

**Focus Timer:**

Below the ledger, the Pomodoro timer appears as a card labeled `SIT WITH MOCHI · 45 MIN`.

- An 88px Fraunces serif countdown (e.g. `43:12`)
- Clicking the number starts or pauses the timer
- An SVG dashed line tracks progress — the filled portion grows as time passes
- Session lengths: 25 / 45 / 60 min (underline-highlighted when selected)
- Buttons: Start / Pause (solid black) and Reset (ghost mono text)
- Keyboard hint: `PAUSE · SPACE` shown in the corner
- While running, italic text appears: *"stay with it."*

---

### Right Column

**The Pet Card:**

A card centered on the pet's SVG illustration. The illustration changes mood (content / hungry / sleepy / excited / sad) based on the pet's current state.

Below the illustration:
- A mood quote in 26px italic: *"perfectly content"* / *"a little hungry"* / *"a bit lonely"*
- A status line: "getting hungry — feed when you can." or "doing well for now."

**Progress bars:**

Two thin horizontal bars:
- **Mood** (derived from hunger: mood = 100 − hunger)
- **Belly** (derived from how full the pet is: belly = 100 − hunger)

Each bar has a Fraunces italic label, a fill bar in the accent color, and a numeric value in JetBrains Mono.

**Feed button:**

`Offer a treat · 35 xp` — a solid accent-colored button. If the user has fewer than 35 XP, the button is greyed out and not clickable. This creates a direct economic link: you must earn XP from tasks to feed the pet.

**Field Notes:**

A journaling widget that generates warm, handwritten-feeling notes based on the user's data (streak count, total completed tasks, pet name).

**Week's Weather:**

A small widget showing the current week (Mon–Sun) with the day's task count visualized as a bar or indicator per day. The current day is highlighted.

---

## Task Interaction (detail)

Each task row is a 4-column grid:

```
[circle checkbox]  [task title]  [PRIORITY]  [+xp  ×]
```

- **Circle checkbox** — empty circle by default, fills with terracotta red when completed. A white checkmark SVG path appears inside.
- **Task title** — Fraunces serif 17px; turns muted and gets a terracotta line-through on completion.
- **Priority label** — JetBrains Mono, 10px, uppercase, muted: `LOW` / `MEDIUM` / `HIGH`
- **XP badge** — amber monospace: `+12`, `+6`, `+2`
- **Delete** — a quiet `×` in muted mono

Empty state text: *"a light page. no tasks yet."*

Loading state: *"Loading…"* in italic Fraunces

Error state: *"Could not load tasks. Please try again."*

**Task visibility rule:** Only incomplete tasks AND tasks completed *today* (matched by created_at date) are shown. Old completed tasks are hidden. This keeps the list clean and daily-focused.

---

## Task & Focus Page (/tasks)

A simpler, standalone version of the task + focus experience. Two-column grid:

- **Left:** FocusTimer card
- **Right:** A card containing TaskForm (add task) + TaskList (scrollable task list)

Header: `● TASK & FOCUS` with a pink dot. Toast notifications appear in the corner for task add/delete success and errors.

This page is for users who want a direct, no-frills task and focus interface without the full journal layout of Today.

---

## Pets Page (/pets)

Shows a PetForm to create a new pet and a PetList of all owned pets. Each pet card (PetCard component) shows the pet's name, type, hunger status, alive/dead state, and a feed button.

---

## Analytics Page (/analytics)

Two stat cards (Lucide icons + value + label):

- **Tasks Completed** (blue, CheckCircle2 icon)
- **Current Streak** (pink, Flame icon)

Below: a `MotivationalMessage` component that generates encouraging text based on the numbers.

When not logged in, local task count is used for the completed tasks card; streak shows 0 (no local streak tracking).

When logged in, stats come from `GET /analysis/{userId}`.

---

## Settings Page (/settings)

Styled as an archive page: eyebrow `ARCHIVE · SETTINGS`, then a large "Account." heading in Fraunces.

Four card sections (1px bordered):

**ACCOUNT**
- Logged in: shows username + email row, a "Log out" ghost button
- Logged out: "Log in →" (solid), "Begin tending →" (ghost), Google button with full SVG icon

**RESET PASSWORD** (logged-in only)
- Collapses behind a "Change password →" button
- Form: current password, new password, confirm new password
- Inline italic feedback: success in green-accent, error in red-accent

**FORGOT PASSWORD** (logged-out only)
- Two-step inline form: step 1 email → step 2 OTP + username + new password

**DELETE ACCOUNT** (logged-in only, red border)
- Description: "Permanent. All your tasks, pets, and history will be gone."
- Expand to show password confirmation form
- Confirm button is solid accent (red)

**ABOUT**
- *"Tendr v1.0 — a journal-shaped productivity app."*
- Wavy-underlined feedback email link → `aasthamalik.work@gmail.com`

---

## Theme

The toggle (☀ / ☾) appears in the landing nav. Switching applies a `.dark` class to `:root`.

- Logged-in users: preference saved to backend (`PATCH /user/theme`) and loaded on auth
- Guests: preference saved to `localStorage` under `tendr-theme`

Transitions: 0.3s ease on background and color — gives a smooth paper-flip feel.

---

## Guest Mode vs Authenticated Mode

| Feature | Guest | Logged In |
|---------|-------|-----------|
| Landing page | Full access | Redirected to Today |
| Tasks (local) | Add, complete, delete (localStorage) | Full backend sync |
| Pets (local) | Add, view (localStorage) | Full backend sync |
| Focus timer | Works | Works |
| XP system | No | Yes — gates pet feeding |
| Analytics streak | 0 | Live from backend |
| Theme | localStorage | Synced to backend |
| Today dashboard | Not shown (redirect only works for authed) | Full journal experience |

---

## The Gamification Loop

1. Open Tendr. The pet's mood and a weather metaphor greet you.
2. See the task list and how much XP is possible today.
3. Check off tasks → XP accumulates, the task gets a terracotta line-through.
4. Run a Pomodoro session for deep work.
5. The 28-day heatmap fills in another square for today.
6. Once you have 35 XP, the "Offer a treat" button unlocks — feed the pet.
7. The pet's Belly and Mood bars go up, its SVG illustration changes to "content."
8. Come back tomorrow to maintain the streak and prevent hunger from dropping.

The loop is quiet and low-pressure — no popups, no badges, no level-up fanfare. Just the pet, the list, and the heatmap keeping honest record.

---

*Report covers the web frontend as built in `blossom_web/src/` — April 2026*
