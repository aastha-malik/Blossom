# Tendr — Web App System Architecture Report

---

## High-Level Overview

Tendr is a React SPA (Single Page Application) communicating with a shared FastAPI backend over HTTPS. The frontend is built with Vite and deployed as a static site. The backend is hosted on Render.com.

```
Browser (React SPA)
        |
        |  HTTPS REST API
        |  JWT Bearer Auth
        v
FastAPI Backend (Render.com)
blossombackend-ib15.onrender.com
        |
   SQLAlchemy ORM
        |
   SQLite Database
```

---

## Frontend Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9 |
| Framework | React 19 |
| Build tool | Vite 5 |
| Routing | React Router v7 (BrowserRouter) |
| Server state | TanStack Query v5 (React Query) |
| Forms | React Hook Form v7 + Zod v4 |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Icons | Lucide React |
| Date utilities | date-fns |
| HTTP | Native `fetch` API (no axios) |

---

## Application Entry Point

[blossom_web/src/main.tsx](blossom_web/src/main.tsx) mounts the React tree with five nested providers in this order:

```tsx
<QueryClientProvider>          // TanStack Query cache
  <AuthProvider>               // JWT auth state
    <ThemeProvider>            // light/dark, synced to backend
      <LocalTasksProvider>     // guest task state (no account)
        <LocalPetsProvider>    // guest pet state (no account)
          <App />
        </LocalPetsProvider>
      </LocalTasksProvider>
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

**QueryClient config:** `refetchOnWindowFocus: false`, `retry: 1` globally.

---

## Routing

Defined in [blossom_web/src/App.tsx](blossom_web/src/App.tsx). The Header component is hidden on auth pages — the `hideHeader` list is checked against `location.pathname`.

```
Public routes:
  /                   Landing
  /login              Login
  /signup             Signup
  /verify-email       Email OTP verification
  /forgot-password    Forgot password flow
  /auth/callback      Google OAuth redirect handler

Protected routes (wrapped in <ProtectedRoute>):
  /tasks              Task manager + Focus timer
  /pets               Pet management
  /analytics          Stats dashboard
  /settings           Account settings
```

> Note: `Today.tsx` (the main journal dashboard) is fully built and is the target of the post-login redirect from Landing, but is **not yet registered** in `App.tsx` routes. It is the most feature-complete page — its route (`/today`) is in-progress.

`ProtectedRoute` checks `isAuthenticated` from `AuthContext`. If false, it redirects to `/login`.

---

## Auth Context

[blossom_web/src/contexts/AuthContext.tsx](blossom_web/src/contexts/AuthContext.tsx)

### Token storage strategy

The JWT is stored in two places simultaneously:

| Location | Purpose |
|----------|---------|
| `localStorage` (token, username, email) | Survives page refresh |
| `useRef<string \| null>` (`tokenRef`) | Accessed synchronously by the API client without triggering re-renders |
| `useState` (token) | Drives `isAuthenticated` reactivity |

This dual-storage prevents a subtle React problem: if only `useState` were used, the token would not be available synchronously when API calls fire during the same render cycle.

### Token getter injection

The API client module (`client.ts`) cannot import `AuthContext` directly (circular dependency). Instead, `AuthProvider` registers a getter function:

```ts
// In AuthProvider mount:
setTokenGetter(() => tokenRef.current);
```

The API client then calls `getToken()` when building request headers. This decouples auth from the HTTP layer.

### Token expiry

On mount, `AuthProvider` runs:

```ts
const storedToken = localStorage.getItem('token');
if (storedToken && isTokenExpired(storedToken)) {
  logout();
}
```

`isTokenExpired` in [blossom_web/src/utils/jwt.ts](blossom_web/src/utils/jwt.ts) decodes the JWT payload client-side and compares `exp` against `Date.now()`.

### Auth state

```ts
const isAuthenticated = token !== null && !isTokenExpired(token);
```

This is a derived boolean — not stored separately — so it always reflects the current token state.

---

## Theme Context

[blossom_web/src/contexts/ThemeContext.tsx](blossom_web/src/contexts/ThemeContext.tsx)

Theme (`'light' | 'dark'`) is managed globally. Applying a theme adds/removes a `.dark` class on `document.documentElement`. CSS custom properties are defined under `:root` and `:root.dark` in [blossom_web/src/index.css](blossom_web/src/index.css).

**Sync behavior:**
- Authenticated user → theme fetched from `GET /user/theme` on login, saved via `PATCH /user/theme` on change
- Guest → theme read/written to `localStorage` under `tendr-theme`

The provider returns `null` while loading the initial theme to prevent a flash of wrong color scheme.

---

## Local State Contexts (Guest Mode)

Two contexts provide offline-capable state for unauthenticated users:

- `LocalTasksContext` — tasks array in React state; `addTask`, `updateTask`, `deleteTask` operations
- `LocalPetsContext` — pets array in React state; `addPet`, `updatePet` operations

These are used by `TaskList`, `TaskItem`, and pet components when `isAuthenticated === false`. When the user logs in, components switch to TanStack Query (backend) automatically.

---

## API Client

[blossom_web/src/api/client.ts](blossom_web/src/api/client.ts) exports five namespaced API objects: `authAPI`, `tasksAPI`, `petsAPI`, `statsAPI`, `userAPI`. All use native `fetch`.

### Auth headers

```ts
const getAuthHeaders = (): HeadersInit => {
  const token = getToken(); // from the registered getter
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
```

### Error handling

`handleResponse<T>` is a generic wrapper around every `fetch` call:

- `404` on tasks or pets endpoints → returns `[]` (backend returns 404 for empty lists, not 200 with empty array — this normalizes that behavior)
- `401` → throws `"Unauthorized. Please log in again."`
- Other errors → parses `response.json().detail` or falls back to a generic message

### API surface

**authAPI**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/login` | Login (form-encoded) → returns JWT + username + email |
| POST | `/signup` | Register (JSON) |
| POST | `/verify_email` | Verify email OTP (JSON: email, verification_token) |
| POST | `/send_forgot_password_otp?email=` | Send OTP |
| PATCH | `/forgot_password` | Reset password via OTP (JSON body) |
| PATCH | `/reset_password` | Change password when logged in (query params) |
| DELETE | `/delete_account` | Delete account (JSON: password) |

**tasksAPI**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tasks` | Fetch all user tasks |
| POST | `/tasks` | Create task (JSON: title, priority) |
| PATCH | `/tasks/{id}` | Update completion status (JSON: completed) |
| DELETE | `/tasks/{id}` | Delete task |

**petsAPI**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/pet` | Fetch all pets |
| POST | `/pets` | Create pet (JSON: name, type) |
| PATCH | `/pet/feed/{id}` | Feed a pet (resets hunger) |
| DELETE | `/pet/{id}` | Delete a pet |

**statsAPI**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/analysis/{userId}` | Fetch user stats (num_task_completed, streaks, xps) |

**userAPI**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/user/xp` | Fetch current XP |
| GET | `/user/theme` | Fetch theme preference |
| PATCH | `/user/theme` | Update theme preference |

---

## TanStack Query Usage

TanStack Query manages all server state. Query keys follow a consistent naming scheme:

| Query key | Fetches | Invalidated when |
|-----------|---------|------------------|
| `['tasks']` | All tasks | Task created, completed, deleted |
| `['pets']` | All pets | Pet created, fed, deleted |
| `['stats', userId]` | User stats | (manual, not auto-invalidated) |
| `['userXP']` | Current XP | Task completion toggled |

`userXP` has `refetchInterval: 30000` on the Today page — it polls every 30 seconds to stay current.

All queries have `enabled: isAuthenticated` — they do not fire for guest users.

---

## Data Types

Defined in [blossom_web/src/api/types.ts](blossom_web/src/api/types.ts):

```ts
Task {
  id, title, description?, priority?, completed,
  created_at, user_id, xpReward?, userXP?
}

Pet {
  id, name, type, age, hunger, last_fed, is_alive, user_id
}

UserStats {
  num_task_completed, streaks, xps
}

UserXP { xp }

TokenResponse { access_token, token_type, username, email }
```

The `xpReward` and `userXP` fields on `Task` are returned by the backend on `PATCH /tasks/{id}`, letting the client update the XP counter in a single round-trip without a separate `GET /user/xp` call.

---

## Page Component Map

```
App.tsx
├── Header (shown on protected pages)
│   └── nav links, theme toggle, logout
│
├── Landing            /
├── Login              /login
├── Signup             /signup
├── VerifyEmail        /verify-email
├── ForgotPassword     /forgot-password
├── AuthCallback       /auth/callback
│
├── Today              (built, not yet routed — target of post-login redirect)
│   ├── FocusTimer
│   ├── TaskList + TaskForm
│   ├── Heatmap (28-day activity)
│   ├── WeekWeather (current week bars)
│   ├── FieldNotes (journaling widget)
│   └── PetSvg (mood-reactive SVG pet)
│
├── TaskFocus          /tasks
│   ├── FocusTimer
│   ├── TaskForm
│   └── TaskList
│       └── TaskItem
│
├── Pets               /pets
│   ├── PetForm
│   └── PetList
│       └── PetCard
│
├── Analytics          /analytics
│   ├── StatsCard (×2)
│   └── MotivationalMessage
│
└── Settings           /settings
```

---

## CSS Design System

All visual tokens are CSS custom properties on `:root` / `:root.dark`. Tailwind is used for layout utilities; visual identity (colors, fonts) is handled entirely through CSS variables in [blossom_web/src/index.css](blossom_web/src/index.css).

**Light mode tokens:**

| Variable | Value | Usage |
|----------|-------|-------|
| `--paper` | #f4ece0 | Page background |
| `--paper-deep` | #ead9c1 | Recessed areas, progress bar tracks |
| `--card` | #fffaf1 | Card backgrounds |
| `--ink` | #2a2118 | Primary text, borders |
| `--ink-soft` | #5a4d3c | Secondary text |
| `--muted` | #8a7a64 | Metadata labels, micro-text |
| `--accent` | #c94e3a | Terracotta red — checkboxes, line-throughs, heatmap |
| `--accent-2` | #5b7a4c | Sage green — belly bar, alt accent |
| `--accent-3` | #3d5a7c | Slate blue — alt accent |
| `--amber` | #c08a2a | Streak counter, XP labels |
| `--rule` | rgba(42,33,24,0.18) | Dividers, borders |

**Typography:**

Components use inline `fontFamily` declarations for precise control (Fraunces on headings, JetBrains Mono on metadata, Inter on inputs). Tailwind utility classes handle spacing, layout, and display.

---

## XP and Pet Mechanics

### XP values

Set in `TaskItem.tsx`:

```ts
const XP_BY_PRIORITY: Record<string, number> = { High: 12, Medium: 6, Low: 2 };
```

The server also returns `xpReward` on the task response, which takes precedence if present.

### Pet feeding gate

On the Today page, the "Offer a treat · 35 xp" button is disabled unless `userXP?.xp >= 35`:

```ts
cursor: (isAuthenticated && (userXP?.xp ?? 0) >= 35) ? 'pointer' : 'not-allowed',
opacity: (isAuthenticated && (userXP?.xp ?? 0) < 35) ? 0.5 : 1,
```

This creates a direct trade: tasks → XP → pet food.

### Heatmap data

The Today page computes a 28-element array from all tasks:

```ts
function buildHeatmapData(tasks: Task[]): number[] {
  const counts = Array(28).fill(0);
  tasks.forEach(task => {
    if (!task.completed) return;
    const diff = Math.floor((now - task.created_at) / 86400000);
    if (diff >= 0 && diff < 28) counts[27 - diff]++;
  });
  return counts;
}
```

The `Heatmap` component normalizes these counts and maps them to opacity levels on 28 thin bars.

---

## Backend (shared with desktop app)

The backend is unchanged from what was built for the desktop client.

- **Framework:** FastAPI (Python)
- **Database:** SQLite via SQLAlchemy ORM
- **Auth:** OAuth2PasswordBearer, JWT (python-jose), bcrypt (passlib)
- **Deployment:** Render.com
- **Base URL:** `https://blossombackend-ib15.onrender.com`
- **Health:** `HEAD /health` to prevent Render free-tier cold starts

The web client uses the same backend API as the desktop app. Key difference: the web client uses `POST /login` and `POST /signup` whereas the desktop used `POST /token` and `POST /register` — the backend exposes both endpoint names.

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| `useRef` + `useState` for token | Ref gives synchronous access for API calls; state drives reactive `isAuthenticated` |
| `setTokenGetter()` injection pattern | Breaks the circular dependency between API client and AuthContext |
| TanStack Query for all server state | Automatic caching, deduplication, background refetch, loading/error states |
| Local context providers for guests | Allows full UI to work without an account; seamless upgrade path on login |
| Native `fetch` instead of axios | Zero dependency, sufficient for the API surface |
| `enabled: isAuthenticated` on all queries | Prevents unauthenticated API calls; guests always use local context |
| CSS custom properties for design tokens | Enables instant theme switching without re-rendering component trees |
| 404 → empty array normalization | Backend returns 404 for empty resource lists (non-standard); normalized in one place |
| `refetchInterval: 30000` on XP | Keeps the XP counter current without requiring explicit invalidation after every action |

---

*Report covers the web frontend (`blossom_web/src/`) and its connection to the shared backend — April 2026*
