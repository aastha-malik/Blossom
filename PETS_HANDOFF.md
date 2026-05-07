# Tendr — Pet System Handoff

Drop this folder into your project and point Claude (in your IDE) at this README. Two files matter:

- `pets.jsx` — the source of truth. A single `<Pet species stage mood size />` component with all 32 sprites baked in as inline SVG.
- `Tendr Pet Sprites.html` — the visual reference (open in any browser to see all sprites laid out).

---

## What's in here

**2 species × 4 life stages × 4 moods = 32 sprites**, all inline SVG, all using the Tendr palette (terracotta, moss, amber, blush) on paper.

| Species | Stages | Moods |
|---|---|---|
| `dog` (golden retriever) | `baby` `kid` `teen` `adult` | `happy` `content` `sad` `sleepy` |
| `cat` (maine coon) | `baby` `kid` `teen` `adult` | `happy` `content` `sad` `sleepy` |

### Stage thresholds (recommend)
- **baby** — days 0–7 with the pet
- **kid** — days 8–21
- **teen** — days 22–60
- **adult** — day 60+

### Mood drivers (recommend)
- **happy** — fed in the last 4h AND a focus session today
- **content** — fed today, no overdue tasks
- **sad** — not fed in 24h+ OR streak just broken
- **sleepy** — between 10pm–7am local, OR no activity in 6h+

---

## Usage in your codebase

```tsx
import { Pet } from './components/Pet'; // port from pets.jsx

<Pet species="dog" stage="teen" mood="happy" size={180} />
```

The component is self-contained. No external SVG assets, no image imports. It scales cleanly from 80px to 400px.

---

## Porting to TypeScript / Vite

`pets.jsx` is plain JSX with no TS types. To convert:

1. Copy the file into `src/components/Pet.tsx`.
2. Add types at top:
   ```ts
   type Species = 'dog' | 'cat';
   type Stage = 'baby' | 'kid' | 'teen' | 'adult';
   type Mood = 'happy' | 'content' | 'sad' | 'sleepy';
   interface PetProps { species: Species; stage: Stage; mood: Mood; size?: number; }
   ```
3. Remove the bottom `window.Pet = Pet;` line.
4. Add `export { Pet };` at the bottom.
5. Color constants (`INK`, `ACCENT`, `BLUSH`, etc.) at the top of the file should ideally be replaced with `var(--ink)`, `var(--accent)` etc. so the sprites adapt to light/dark mode automatically. The CSS variables are defined in `TENDR_REBUILD_SPEC.md` section 2.

---

## What to tell Claude in your IDE

Paste this prompt:

> I'm rebuilding my Blossom productivity app's frontend as **Tendr** (see `TENDR_REBUILD_SPEC.md` for the full design system).
>
> Add a pet system using `pets.jsx` from this folder. Port it to `src/components/Pet.tsx` with proper TypeScript types: `species: 'dog' | 'cat'`, `stage: 'baby' | 'kid' | 'teen' | 'adult'`, `mood: 'happy' | 'content' | 'sad' | 'sleepy'`, `size?: number`.
>
> Then:
> 1. Replace the existing pet rendering in `PetCard.tsx` with `<Pet />`.
> 2. Add `species` and `stage` columns to the Pet model on the backend (`blossom_backend/`). Default species = `'dog'` (user picks at adoption). Stage is derived from `daysAlive`:
>    - 0–7 → baby, 8–21 → kid, 22–60 → teen, 60+ → adult
> 3. Mood is derived from existing pet state (mood/belly/bond + last-fed-at + recent-activity) using the rules in this README.
> 4. Add a stage-up celebration toast: when a pet crosses a threshold, show "Mochi grew up." in italic Fraunces with the new sprite.
> 5. Adoption flow: new user picks dog or cat with a name (max 12 chars).
> 6. Pet swatches in the adoption screen should use `<Pet species={s} stage="baby" mood="happy" size={120} />`.
>
> Reference `Tendr Pet Sprites.html` in this folder to see all 32 sprites — open it in a browser.

---

## How to send this to Claude in your IDE

You have a few options:

**Option 1 — Drop the files in your repo**
1. Download `pets.jsx`, `Tendr Pet Sprites.html`, and `TENDR_REBUILD_SPEC.md` from this project (use the file tree → right-click → download, or I can package them into a zip).
2. Drop them into `blossom_web/design-handoff/` in your repo.
3. Open Claude in your IDE and prompt: *"Read `design-handoff/README.md` and execute the pet integration."*

**Option 2 — Paste directly**
1. Open `pets.jsx` here, copy the entire file.
2. In your IDE, ask Claude to create `src/components/Pet.tsx` and paste the source.
3. Then paste the "What to tell Claude" prompt above.

**Option 3 — Screenshot the sprite sheet**
If Claude in your IDE can read images, screenshot `Tendr Pet Sprites.html` (full page) and attach it alongside `pets.jsx`. The visual reference helps it understand the aesthetic without rendering it itself.

---

## Visual aesthetic notes (for whoever builds)

- Lines: pen-stroke, 1.4–1.6px, `#2a2118` (`--ink`).
- Fills: warm earth tones (golden retriever = `#e0b878`; maine coon = `#c9924d`).
- Cheeks: `#f4b6b0` blush, opacity 0.5–0.7.
- Mood floats: ♥ happy · ✦ content · 💧 sad · 𝓏 sleepy — already baked into the SVG.
- No drop shadows. No gradients. Single-pass ink + flat watercolor.
- All sprites are 100×100 viewBox (teen/adult cats use `0 -8 100 108` to fit ear tufts).

— end of handoff —
