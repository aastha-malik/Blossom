# Tendr — Frontend Rebuild Spec

A handoff document for rebuilding the Blossom web frontend (`blossom_web/`) as **Tendr**, using a "cozy editorial daybook" aesthetic. Pet-only (no garden). Supports light + dark mode.

This document is the single source of truth for the redesign. The previous color system (`pink-soft`, `purple-gentle`, `blue-muted`, dark galaxy theme) is being **replaced entirely**. Keep the React/TypeScript/Tailwind structure, API client, contexts, and routing — replace only the visual layer + copy.

> See `Blossom Redesign.html` in this project for the live mockups (open it, click any artboard's expand icon to focus). Both light and dark variants are interactive — toggle via the ☾/☀ glyph in the nav.

---

## 1. Brand

- **Name:** Tendr
- **Tagline:** "Tend to your to-do list like a friend."
- **One-liner:** A journal-shaped productivity app. Every task you finish earns a treat for a small animal that lives inside it.
- **Voice:** Editorial, warm, slightly literary. Uses lowercase, italics, em-dashes. Never says "user" or "leverage." Never uses emoji except in pet-mood states.
- **Mascot:** Mochi — a fox-mochi (small fox with sesame freckles, sitting in a teacup). The pet illustration is part of the brand, not decoration.

### Naming voice examples
- Nav items: `Today`, `Pet`, `Ledger`, `Archive` (not "Tasks", "Analytics", "Settings")
- Empty states: "A light drizzle. Mochi is sleeping in." (not "No tasks yet!")
- Buttons: `Adopt your pet →`, `Offer a treat · 35 xp`, `Sit with Mochi · 45 min` (not "Get Started", "Feed", "Start Focus")
- Feedback: italic, sentence case, ends with a period. Never "🎉" or "✨".

---

## 2. Design Tokens

Replace `src/index.css` and `tailwind.config.js` with these tokens.

### CSS variables (`src/index.css`)

```css
:root {
  /* paper */
  --paper:       #f4ece0;  /* page background */
  --paper-deep:  #ead9c1;  /* track / well */
  --card:        #fffaf1;  /* card surface */

  /* ink */
  --ink:         #2a2118;  /* primary text */
  --ink-soft:    #5a4d3c;  /* secondary text */
  --muted:       #8a7a64;  /* tertiary, captions */

  /* accents */
  --accent:      #c94e3a;  /* terracotta — primary CTA, completed states, pet bond */
  --accent-2:    #5b7a4c;  /* moss — positive deltas, focus mode */
  --accent-3:    #3d5a7c;  /* indigo — info, time totals */
  --amber:       #c08a2a;  /* xp, streak, treats */

  /* rules */
  --rule:        rgba(42,33,24,0.18);
  --rule-soft:   rgba(42,33,24,0.08);
  --shadow:      rgba(42,33,24,0.08);
  --hi:          rgba(201,78,58,0.08); /* selection / today highlight */
}

:root.dark {
  --paper:       #1a1410;
  --paper-deep:  #241c16;
  --card:        #221a14;
  --ink:         #f0e8d8;
  --ink-soft:    #c9bfae;
  --muted:       #8a7e6a;
  --accent:      #e07158;
  --accent-2:    #9bb87a;
  --accent-3:    #7ea0c4;
  --amber:       #e0b25a;
  --rule:        rgba(240,232,216,0.15);
  --rule-soft:   rgba(240,232,216,0.06);
  --shadow:      rgba(0,0,0,0.4);
  --hi:          rgba(224,113,88,0.12);
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
}
```

### Tailwind colors (`tailwind.config.js`)

```js
colors: {
  paper:       'var(--paper)',
  'paper-deep':'var(--paper-deep)',
  card:        'var(--card)',
  ink:         'var(--ink)',
  'ink-soft':  'var(--ink-soft)',
  muted:       'var(--muted)',
  accent:      'var(--accent)',
  'accent-2':  'var(--accent-2)',
  'accent-3':  'var(--accent-3)',
  amber:       'var(--amber)',
  rule:        'var(--rule)',
  'rule-soft': 'var(--rule-soft)',
  hi:          'var(--hi)',
},
fontFamily: {
  serif: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
  sans:  ['Inter', 'system-ui', 'sans-serif'],
  mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
},
```

### Fonts

Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
```

### Type scale

| Use | Family | Size | Weight | Style |
|---|---|---|---|---|
| Hero (landing) | Fraunces | 78px / 0.95 | 400 | mixed (italic for accent word) |
| Page H1 | Fraunces | 44px / 1 | 400 | regular |
| Section headline | Fraunces | 22-26px | 400-500 | italic |
| Body (editorial) | Fraunces | 15-17px / 1.55 | 400 | italic for asides |
| UI body | Inter | 13-14px | 400-500 | regular |
| Labels / eyebrow | JetBrains Mono | 10-11px | 500 | UPPERCASE, letter-spacing 2-3px |
| Big numbers (stats, timer) | Fraunces | 32-88px | 500 | regular, tabular-nums |

**Rule:** UI labels are mono uppercase. Headings and editorial copy are Fraunces (italic when commentary). Form text and buttons are Inter. Numbers always tabular.

### Spacing & shape

- Border radius: **2px on cards, 0 on buttons, 9px on checkbox circles**. Never round corners more than 2px.
- Card border: `1px solid var(--rule)` — sometimes `1.5px solid var(--ink)` for the "active" focus card.
- Card padding: 20-22px.
- Page padding: 36px horizontal.
- Grid gap: 28-30px between major regions, 12-18px between cards.
- Use `borderTop: 1px dashed var(--rule)` between list rows (not solid).

### Iconography

- Use **Lucide** sparingly. Most "icons" should be unicode glyphs in JetBrains Mono: `☐` `☒` `☀` `☾` `→` `·` `✿`.
- Pet states use real emoji only in mood text: `Mochi is content.`, `a little hungry`.
- Never wrap icons in colored circles or "feature card" badges.

---

## 3. Pet illustration component

Build a single `<Pet />` SVG component. Variant by mood (`content`, `hungry`, `sleepy`, `excited`, `sad`).

```tsx
interface PetProps {
  size?: number;     // default 200
  mood?: 'content' | 'hungry' | 'sleepy' | 'excited' | 'sad';
}
```

The reference SVG is in `direction-b.jsx` (function `BPet`). Copy its paths exactly. It's a fox sitting in a teacup with a flower next to it. The colors come from theme variables — the fill of the body is `var(--card)`, stroke is `var(--ink)`, cheeks/inner-ear use `var(--accent)`, flower core is `var(--amber)`.

**For mood variants:** change eyes (`^^` for content, `· ·` with droop for sleepy, `>< ` for excited, etc.) and mouth path. Body stays the same.

---

## 4. Components & Pages

### `components/layout/Header.tsx`

Replace entirely.

```
┌──────────────────────────────────────────────────────────────┐
│ [logo] Tendr  │  no. 04 · spring '26       Today  Pet  Ledger  Archive   ☾   xp 240 │
└──────────────────────────────────────────────────────────────┘
```

- Logo: 28×28 SVG circle outline + smile + amber dot (see `BLogo` in `direction-b.jsx`).
- Brand: "Tendr" in Fraunces 22px, then a vertical rule, then `no. 04 · spring '26` in mono 10px (this is a fixed editorial flourish — generate the issue number from current week-of-year ÷ 13).
- Nav: Fraunces 15px italic. Active item: terracotta + 2px underline.
- Theme toggle: ☾ (light mode) / ☀ (dark mode) glyph, mono 11px. Persist to localStorage `tendr-theme`.
- XP/streak: mono 11px, right-aligned. No emoji.
- Border-bottom: `1px solid var(--rule)`.
- On landing (logged-out), show `Begin →` button instead of nav: dark ink fill, paper text, 12px, no border-radius, 8×16 padding.

### `pages/Landing.tsx`

Replace entirely. Layout (1200px wide):

1. **Header** (as above).
2. **Eyebrow strip** — centered mono 10px: `VOL. I  ·  A QUIET ALMANAC FOR GETTING THINGS DONE  ·  ₹0`
3. **Hero (2-col grid, 1.15fr / 1fr)**
   - Left: 78px Fraunces hero — "Tend to your *to-do list* like a friend." (the middle line is italic).
     - Below: 3px terracotta vertical rule + italic Fraunces description.
     - CTAs: `Adopt your pet →` (ink fill, paper text, no radius) + `or read a sample day` (italic Fraunces with wavy terracotta underline).
   - Right: a *sample journal page* card, rotated 1.4°, with paper shadow `4px 6px 0 var(--shadow)`. Contains: date eyebrow, the Pet illustration, "Mochi is content.", task preview list with strikethroughs.
4. **Feature trio** — 3-col grid. Each entry has:
   - Roman numeral (I. II. III.) in Fraunces italic 32px, color rotates terracotta / moss / indigo.
   - Headline Fraunces 22px.
   - Italic Fraunces body 14px.
   - Copy (use exactly):
     - **I. A task is a treat.** Every item you finish becomes food for your pet. High-priority ones are richer meals.
     - **II. Focus is affection.** A Pomodoro session counts as time spent together. Pets bloom faster when you sit with them.
     - **III. A 28-day garden of squares.** Your activity becomes a quiet heatmap. Some weeks bloom, some are bare. Both are honest.
5. **Footer strip** — mono 10px, 3 cells: `EST. 2026 · DELHI` / `"I finish my tasks to see my fox." — PRIYA R.` / `PG. 01`

### `pages/Today.tsx` (replaces Tasks page — route `/today`)

The dashboard. 2-col grid (1.4fr / 1fr).

**Left column:**
1. Eyebrow `TUE · 21 APR · DAY 014 WITH MOCHI`
2. H1 Fraunces 44px: `Today's page.`
3. Italic Fraunces 16px subtitle (weather/mood line generated from streak status, e.g. `A light drizzle. Mochi is sleeping in.` if no completions yet, `Sun's out. Mochi is doing zoomies.` after 3+).
4. **Task list** — header row mono `TO DO    5 items · 28 xp possible` with bottom rule.
   - Each row: `[circle checkbox] [task text]   [tag mono]   [+xp amber mono]`
   - Checkbox: 18px circle, 1.5px ink border. Filled with terracotta when done, white check inside.
   - Completed text: line-through with terracotta 2px decoration.
   - Tag: mono 10px UPPERCASE (`WORK`, `STUDIO`, `HOME`, `FRIENDS`).
   - Row separator: `1px dashed var(--rule)`.
   - Add row: italic Fraunces "+ add another…" — clicking turns it into an inline input.
5. **Ledger card** (analytics) — bordered card with:
   - Eyebrow `THE LEDGER · LAST 28 DAYS` + delta `+18% VS LAST` in moss mono.
   - Italic headline `How spring has been treating you.`
   - 3-stat row: `TASKS FINISHED 23` (terracotta), `TIME TOGETHER 4h 12m` (indigo), `STREAK 7 days` (amber). Numbers Fraunces 32px tabular.
   - **Heatmap** — 28 squares in a row, each 22px tall. Opacity scales with activity (0 = `var(--rule-soft)`, full = full accent). Footer mono labels: `28 D AGO ── each square, a day ── TODAY` (middle is italic Fraunces).
6. **Focus card** — heavy `1.5px solid var(--ink)` border:
   - Eyebrow `SIT WITH MOCHI · 45 MIN` + italic context line `spending time on "review PRs"`.
   - Giant timer: Fraunces 88px tabular, terracotta, `24:51`.
   - Progress: a thin dashed track with a solid terracotta progress segment.
   - Length tabs: 25 / 45 / 60 min in Fraunces 14px, active one underlined in terracotta.
   - Mono hint right-aligned: `PAUSE · SPACE`.

**Right column:**
1. Eyebrow `MOCHI · FOX-MOCHI · DAY 014`
2. **Pet card** — bordered, padded 22px, centered:
   - The Pet SVG (210px).
   - Italic Fraunces 26px mood line `"a little hungry"` (always in quotes).
   - Italic Fraunces 14px sub `will bloom in 3 days, if fed on time`.
   - 3 progress rows (Mood / Belly / Bond) — Fraunces italic label, 6px paper-deep track, value bar in terracotta/moss/amber, mono percentage.
   - Buttons: `Offer a treat · 35 xp` (terracotta fill, paper text, flex-1) + `Pet` (1.5px ink border, ink text).
3. **Field notes block** — `card` background, 3px moss left border:
   - Eyebrow `FIELD NOTES · TODAY`
   - Italic Fraunces 14px observation, e.g. `Mochi learned a new trick. If you finish a hard task before noon, she does a little spin.`
   - Generate observations from real user behavior — these are computed from completion patterns, not random.
4. **Week's weather** — bordered card, 7-col grid (M T W T F S S), each cell shows day letter (mono 9px) and weather glyph (☀ ⛅ ☁ ☂). Today's cell has `var(--hi)` background. Footer italic Fraunces `good week · 5 sunny days`. Map: 0 tasks = ☂, 1-2 = ☁, 3-4 = ⛅, 5+ = ☀.
5. **The Pantry** (treat shop) — bordered card:
   - Eyebrow `THE PANTRY`
   - Rows: `[icon] [name Fraunces]   [price mono amber]`
   - Items: Berry tart 35 xp, Honey biscuit 60 xp, Spring blossom (rare) 120 xp.
   - Each treat increases mood/belly differently (defined in backend).

### `pages/Pet.tsx`

Standalone pet page — same right-column components but full-width. Add a "Past pets" archive section at the bottom (small grid of greyed-out pet cards with name + lifespan + cause `passed peacefully · day 087`).

### `pages/Ledger.tsx` (replaces Analytics)

Full-page version of the Ledger card, plus:
- **Larger heatmap** — 12 rows × 7 cols (90 days, GitHub-style).
- **Rituals breakdown** — bar chart by tag (work / studio / home / friends).
- **Streak history** — list of past streaks with start/end dates and length, italic Fraunces.

### `pages/Login.tsx`, `pages/Signup.tsx`, `pages/ForgotPassword.tsx`

Center a single `card` (`1px solid var(--rule)`, `var(--card)` bg, 32px padding, 480px max-width) on `var(--paper-deep)` background.

- Eyebrow mono `RETURNING` / `NEW HERE` / `FORGOT?`
- H1 Fraunces 32px italic: `Welcome back.` / `Begin tending.` / `Help me in.`
- Italic Fraunces 14px subtitle: `your pet missed you.` / `we will set you up with a fresh pet.` / `we'll send a code to your email.`
- Inputs: `1px solid var(--rule)`, `var(--paper)` bg, 12-14px padding, no border-radius. Focus ring: `1.5px solid var(--accent)`.
- Labels mono 10px UPPERCASE above each input.
- Primary button: `var(--ink)` fill, `var(--paper)` text, 13-14px padding, 14px Inter 500, no border-radius.
- Google button: `var(--paper)` fill, `1px solid var(--rule)`, ink text. The Google glyph stays multi-color.
- Bottom link: italic Fraunces 13px, terracotta wavy underline.

### `components/ui/Toast.tsx`

Replace styling. Toast is a `var(--card)` card with `1px solid var(--rule)` and 4px terracotta left border. Body is italic Fraunces 14px. No icons. Auto-dismiss 4s.

---

## 5. Behavior & rules

- **Theme persistence:** read/write `tendr-theme` in localStorage. Default to system preference. Add `dark` class to `:root`.
- **No emoji in UI chrome.** Emoji only inside pet mood strings (which are content, not UI).
- **All numbers tabular-nums** via `font-feature-settings: "tnum"`.
- **Italic = commentary.** Use italics for asides, captions, mood lines, error explanations. Never italicize buttons or labels.
- **Mono = metadata.** Dates, counts, tags, IDs, keyboard hints. Never use mono for body or buttons.
- **Strikethrough is terracotta, 2px.** Never strikethrough with default browser color.
- **Cards have 4-6px shadow only when "live" (rotated journal sample).** Static cards just use the border.
- **No gradients.** Anywhere. Solid colors only.

---

## 6. Pages to delete or merge

- `pages/Settings.tsx` (28kb) — most of it is unnecessary. Keep only: account info, theme toggle (now in header so remove from here), email change, password reset, delete account. Apply the new card style.
- Remove all gradient classes (`bg-gradient-to-r`, `from-pink-soft-100`, `bg-clip-text` etc.).
- Remove the "Tech-Girly Edition" subtitle from logo.
- Remove all `animate-gradient-x` / blob backgrounds from landing.

---

## 7. Files to keep as-is

- `src/api/*` — all API logic stays.
- `src/contexts/AuthContext.tsx` — auth flow is fine.
- `src/contexts/ThemeContext.tsx` — refactor to support `light` | `dark` only (no system theme variants beyond that).
- `src/hooks/*` — keep.
- All routing in `App.tsx` — only rename routes (`/tasks` → `/today`, `/analytics` → `/ledger`).

---

## 8. Acceptance checklist

- [ ] Open the live mockup in `Blossom Redesign.html` and match the **Direction B** artboards pixel-by-pixel for spacing, type, and color.
- [ ] Light and dark mode both work; toggle persists.
- [ ] All Fraunces / Inter / JetBrains Mono weights load.
- [ ] Pet SVG renders identically across the app.
- [ ] No `pink-soft`, `purple-gentle`, `blue-muted`, `dark-base`, `dark-card`, etc. classes remain anywhere.
- [ ] All copy reflects the editorial voice (no "🎉 Welcome back!", no "Get Started", no "Your productivity journey").
- [ ] No gradients, no rounded corners > 2px, no emoji in nav/buttons.

---

## 9. Reference files in this project

- `Blossom Redesign.html` — the live mockup. Open this and screenshot every artboard for your AI to reference.
- `direction-b.jsx` — all React components for the mockup, including the Pet SVG, BNav, BHeatmap, BLanding, BDashboard. **Lift the SVG paths from here directly.**

— end of spec —
