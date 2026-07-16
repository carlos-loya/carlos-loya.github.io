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

**Two layers, one codebase:**

1. **DOM content layer** — the real, accessible, SEO-visible site. Every section
   is wrapped in `<Layer>` (`components/Layer.tsx`), which renders the machine
   readout header (code · name · depth) + display title. This layer stands
   entirely on its own.
2. **WebGL layer** (`src/three/DescentCanvas.tsx`) — a `position:fixed` canvas
   *behind* the DOM (`-z-10`, `pointer-events:none`). The camera descends driven
   by the **same window scroll** (framer-motion `useScroll`), NOT drei
   `ScrollControls`. The DOM is never re-parented into the canvas.

**The 3D is gated and lazy.** `useEnable3D()` mounts it only on capable desktops
(`min-width:768px`, no `prefers-reduced-motion`, WebGL present). It's a
`React.lazy` chunk, so mobile / reduced-motion visitors never download three.js —
they get the clean static DOM site. **Preserve this gate**; it's how
accessibility, mobile, and legibility are satisfied.

The signature element is the fixed left-rail depth gauge
(`components/DescentHud.tsx`): filling bar, live depth readout, layer codes
lighting up via IntersectionObserver.

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

The concept is built and verified end to end (see
`~/.claude/plans/i-want-to-redesign-concurrent-codd.md` for the full spec). This
is an evolving design — expect to refine scenes, motion, and polish. Deliberately
NOT done: bespoke per-layer 3D set-pieces (the "just the vibe" choice favors the
current restrained scene). Confirm with Carlos before adding heavier spectacle.
