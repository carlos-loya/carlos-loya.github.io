# CLAUDE.md

Guidance for Claude instances working in this repo.

## What this is

Carlos Loya's personal portfolio — `carlos-loya.github.io`. Deployed to GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`. Stack: React 19 +
Vite + Tailwind v4 (`@theme` tokens, no config file) + framer-motion +
react-three-fiber.

## The concept: "Descent from the clouds"

The site is **one immersive vertical WebGL journey**, not a stack of resume
sections. Scrolling flies a camera *down* through a small, bright, low-poly
world — a charming *Katamari Damacy*-flavored miniature — from high in the clouds,
down through the yard, **through the front door of a little (closed) house**, and
inside: a **hall of fame** where the camera turns to a wall of clickable monitors
showing Carlos's live sites, ending at his **desk**, where he sits (back to
camera) with a coffee cup.

Design direction (locked with Carlos — keep to it):
- **"Show, don't tell."** Demonstrate capability; don't recite a resume.
- **Bright, clear-daytime low-poly.** Pale sky, warm sun, green ground; ONE
  warm-coral accent (`--color-accent` `#ee6c4d`). Charming and friendly.
- **Real CC0/CC-BY glTF models** now carry the props (see `public/attribution.md`
  + the "3D credits" footer link — CC-BY needs the visible credit). Loaded via
  `useGLTF` in `src/three/models.tsx`, auto-normalized by bounding box.
- **Performance-first.** No postprocessing, no shaders, no raymarching — models +
  real (cheap) lighting. It must stay smooth.
- **Audience is employers, clients, AND peers** — spectacle must not cost
  legibility. The facts stay extractable.

The six beats (source of truth: `src/descent.ts`):

| Code | id | Scene | Content |
|---|---|---|---|
| L0 SKY | `top` | High in the clouds | Hero (`profile.ts`) |
| L1 CLOUDLINE | `control` | World appears below | Skills (`skills.ts`) |
| L2 THE YARD | `data-plane` | The house, on the ground | Independent systems — `experience[0]` |
| L3 THE THRESHOLD | `infrastructure` | Door opens, camera enters | Employed roles — `experience.slice(1)` |
| L4 HALL OF FAME | `proving-ground` | Camera turns to a wall of clickable site monitors | Live sites (`projects.ts`) |
| L5 THE DESK | `core` | Carlos seated (Man model), back to camera, coffee | Contact |

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
   - `structures.tsx` — exports `World`: outdoor scenery (clouds, island, yard
     trees) anchored to `BEAT` offsets via `anchor()`, plus the **fixed** interior
     tied to the `HOUSE` layout in `path.ts`: the closed `HouseShell` (+ `Roof`,
     `Window`), the scroll-driven `Door`, the entry, the `HallOfFame`, and the
     `Office`. Anchor outdoor scenery to where the camera *is* at that offset,
     never hardcoded world coords, or framing drifts.
   - `models.tsx` — `useGLTF` wrappers (`ModelCloud/Tree/Desk/Chair/Monitor/`
     `Plant/Pot/Cup`) that clone + **auto-normalize each glTF by bounding box**
     (glТF exports arrive at wildly different scales) + `useGLTF.preload`.
   - `props.tsx` — remaining procedural bits (`House`, `Island`, `Slab`, `Rug`,
     `Window` helpers) + the flat-shaded `mat()` cache and `PAL` palette.
   - `Character.tsx` — the seated **Man** glТF playing its `Man_Sitting` clip
     (`useAnimations`), auto-normalized. Swappable rig.
   - `HallDisplay.tsx` — a hall-of-fame monitor: `ModelMonitor` + a screenshot
     plane (`useTexture` `/previews/*.jpg`) + a drei `<Text>` nameplate; `onClick`
     opens the site, hover lifts it.
   - `CinematicContent.tsx` — the lean docked text panels (one `<Beat>` per layer),
     over a left→right light scrim for legibility. More compact than the static
     site by design; full detail lives in the static site + résumé.
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
  Tailwind utilities like `bg-bg` / `text-fg-strong` resolve — but the *values*
  are now clear-daytime (light bg, dark ink, warm-coral accent). `color-scheme:
  light`. Flipping token values re-themes the static site and the docked panels
  together. Fonts: `font-display` = Archivo (headlines), `font-sans` = Inter
  (body), `font-mono` = JetBrains Mono (labels/readouts).
- **Reveals**: wrap scroll-in animations in `<Reveal>` (`components/Reveal.tsx`);
  it and `useInView` already no-op under reduced-motion. Reuse them.
- Keep new 3D scene code in `src/three/`. Props are CC0/CC-BY glТF via `useGLTF`
  (`models.tsx`, drop `.glb` in `public/models/`, add the credit to
  `public/attribution.md`) with a few flat-shaded primitives (`props.tsx`). Lit by
  a hemisphere + one shadow-casting sun + a few interior point lights (the closed
  roof shadows out the sun indoors), light-blue fog. **No postprocessing, no
  custom shaders, no raymarching** (an earlier bloom/raymarch pass killed
  performance; don't reintroduce it).

## Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `tsc -b && vite build` (must pass; the deploy runs it)
- `npm run lint` — oxlint (LogoLoop has 3 pre-existing warnings; ignore those)

## Verifying changes

Drive it, don't just typecheck. `npm run dev`, then in a browser: scroll the full
descent SKY→THE DESK and confirm each beat is framed + the camera motion + the
CRTs show screenshots and click through; check a narrow viewport and
reduced-motion both fall back to the static DOM with content intact.

## Status / next

The low-poly descent skeleton is built and verified end to end (v1). It's an
evolving design — the scenery in `structures.tsx`/`props.tsx` and its `anchor()`
placement are the main knobs; expect to fine-tune per-beat framing, prop density,
and the final camera framing at the building. **Assets are procedural for now;
the intended polish is to swap in cohesive CC0 low-poly glTF packs**
(Kenney/Quaternius/Poly Pizza) per prop via `useGLTF`. A known dev-only
`createRoot` warning comes from drei `<Scroll html>` under `StrictMode`;
production is clean (verified via `npm run preview`).
