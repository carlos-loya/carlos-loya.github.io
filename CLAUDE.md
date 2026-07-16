# CLAUDE.md

Guidance for Claude instances working in this repo.

## What this is

Carlos Loya's personal portfolio — `carlos-loya.github.io`. Deployed to GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`. Stack: React 19 +
Vite + Tailwind v4 (`@theme` tokens, no config file) + framer-motion +
react-three-fiber.

## The concept: "Descent Into The Machine"

The site is **one immersive vertical WebGL journey**, not a stack of resume
sections. Scrolling drives a camera *down* through six depth layers, mapped onto
Carlos's real work. The visitor falls from the interface to the core.

Design direction (locked with Carlos — keep to it):
- **"Show, don't tell."** Demonstrate capability; don't recite a resume.
- **Evangelion as undertone, not costume** — near-black void, ONE crimson accent
  (`--color-accent` `#e8102a`), amber only for system readouts, cold infra grays,
  technical/mono type, ominous quiet. Restraint over maximalism.
- **Dark-only.** There is no light mode; don't add one.
- **Audience is employers, clients, AND peers** — spectacle must not cost
  legibility. The facts stay extractable.

The six layers (source of truth: `src/descent.ts`):

| Code | id | Content |
|---|---|---|
| L0 SURFACE | `top` | Hero (`profile.ts`) |
| L1 CONTROL | `control` | Skills (`skills.ts`) |
| L2 DATA_PLANE | `data-plane` | Independent systems — `experience[0]` |
| L3 INFRASTRUCTURE | `infrastructure` | Employed roles — `experience.slice(1)` |
| L4 PROVING_GROUND | `proving-ground` | Live sites (`projects.ts`) |
| L5 CORE | `core` | Contact |

## Architecture (important)

**Two presentations of the same data, chosen at runtime in `App.tsx` via
`useEnable3D()`:**

1. **Cinematic descent (capable desktops)** — a full-viewport WebGL flight. Files
   in `src/three/`:
   - `DescentCanvas.tsx` → exports `CinematicDescent`: the `<Canvas>` with drei
     `<ScrollControls pages={6} damping>` (its damping is the momentum — no
     Lenis/GSAP). Contains the 3D `Scene` and the content in `<Scroll html>`.
   - `path.ts` — the shared `CatmullRomCurve3` flight path + `BEAT` offsets. The
     camera samples this by scroll offset with a look-ahead, so it banks/turns
     (a flight, not an elevator). Content is **six equal 100vh blocks**, so block
     *i* centers at offset **i/5** — `BEAT` values must match, or structures and
     text drift apart.
   - `structures.tsx` — the six procedural environments (gantry, control lattice,
     data corridor, server hall, deployment bay, core cage), placed along the path
     at `BEAT` offsets.
   - `CinematicContent.tsx` — the lean docked text panels (one `<Beat>` per layer),
     over a left→right scrim for legibility. More compact than the static site by
     design; full detail lives in the static site + résumé.
2. **Static site (mobile / reduced-motion / fallback)** — the original stacked
   `<Layer>` sections (`Hero`, `Skills`, `DataPlane`, `Infrastructure`, `Projects`,
   `Contact`) + the `DescentHud` gauge. Fully accessible and SEO-visible, stands on
   its own. This is also the `<Suspense>` fallback while the 3D chunk loads.

**The 3D is gated and lazy.** `useEnable3D()` returns true only on capable desktops
(`min-width:768px`, no `prefers-reduced-motion`, WebGL present). `CinematicDescent`
is a `React.lazy` chunk, so the static branch never downloads three.js. **Preserve
this gate and the static fallback** — it's how accessibility, mobile, and
legibility are satisfied. Content for both comes from `src/content/*.ts`; never
fork the data.

## Conventions

- **Content lives in `src/content/*.ts`** (`profile`, `skills`, `experience`,
  `projects`). Edit data there; components read from it. Don't hardcode copy in
  components, and don't fabricate content — mapping to layers must stay truthful.
- **Design tokens** are in `src/index.css` under `@theme`. Token *names* are kept
  from the old theme (`bg`, `panel`, `brd`, `fg`, `fg-strong`, `accent`…) so
  Tailwind utilities like `bg-bg` / `text-fg-strong` resolve. Add `font-display`
  = Archivo (headlines), `font-sans` = Inter (body), `font-mono` = JetBrains Mono
  (labels/readouts).
- **Reveals**: wrap scroll-in animations in `<Reveal>` (`components/Reveal.tsx`);
  it and `useInView` already no-op under reduced-motion. Reuse them.
- Keep new 3D scene code in `src/three/`. Scenes are **procedural** (geometry +
  particles + fog + additive glow) — no imported 3D models. Bloom is faked with
  additive halos; `@react-three/postprocessing` was removed (React 19 hook
  mismatch) — don't re-add it without checking that.

## Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `tsc -b && vite build` (must pass; the deploy runs it)
- `npm run lint` — oxlint (LogoLoop has 3 pre-existing warnings; ignore those)

## Verifying changes

Drive it, don't just typecheck. `npm run dev`, then in a browser: scroll the full
descent BOOT→CORE and confirm each layer + the camera motion; check a narrow
viewport and reduced-motion both fall back to the static DOM with content intact.

## Status / next

The cinematic descent is built and verified end to end. It's an evolving design —
the structures in `structures.tsx` and their `BEAT` placement are the main knobs
for art direction; expect to fine-tune per-beat framing, camera speed variation,
and structure detail. A known dev-only `createRoot` warning comes from drei
`<Scroll html>` under `StrictMode`; production is clean (verified via
`npm run preview`).
