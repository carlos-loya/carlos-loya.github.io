# CLAUDE.md

Guidance for Claude instances working in this repo.

## What this is

Carlos Loya's personal portfolio — `carlos-loya.github.io`. Deployed to GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`. Stack: React 19 +
Vite + Tailwind v4 (`@theme` tokens, no config file) + framer-motion +
react-three-fiber.

## The concept: "Descent from the clouds"

The site is **one immersive vertical WebGL journey**, not a stack of resume
sections. Scrolling flies a camera down out of the clouds onto a small **static
planet** (R=75) — a charming *Katamari Damacy* main-menu miniature — and the
**camera orbits it**, riding a dirt road that wraps **~half the sphere** (~166°),
with the horizon rolling as it travels: the **toolkit garden** at the trailhead
(the stack, as tech-pet mascots), the **workshop shed** (systems, as mechanical
rigs) on the opposite side of the road, then the long **road** leg (flowers pop
in as you travel) to the **house** at the sphere's apex — its **driveway** a
concrete strip with a retro truck + cardboard work-experience boxes, then
**through the front door** into the **gallery** (framed live sites), ending at
the **desk** where Carlos sits (back to camera) with a coffee cup. The house pad
(tilt 0) lands at the interior's original world coordinates, so the
door/gallery/desk framing is authored in plain world space.

Design direction (locked with Carlos — keep to it):
- **"Show, don't tell."** Demonstrate capability; don't recite a resume.
- **Vibrant, toy-like low-poly.** A saturated **cyan-blue → pastel-peach** sky
  gradient (canvas `Skydome` in `src/three/Sky.tsx`), warm upper-left sun +
  **cool lavender/blue hemisphere** so flat-shaded facets pop (cool in shadow,
  warm in light), ONE warm-coral accent (`--color-accent` `#ee6c4d`). Charming and
  friendly. *(This global re-theme superseded the original "bright clear-daytime"
  pass — one lighting/fog setup across all beats. `fogExp2` hides the far
  planet from the hero, then parts as the camera descends.)*
- **Real CC0/CC-BY glTF models** now carry the props (see `public/attribution.md`
  + the "3D credits" footer link — CC-BY needs the visible credit). Loaded via
  `useGLTF` in `src/three/models.tsx`, auto-normalized by bounding box.
- **Performance-first.** No postprocessing, no shaders, no raymarching — models +
  real (cheap) lighting. It must stay smooth.
- **Audience is employers, clients, AND peers** — spectacle must not cost
  legibility. The facts stay extractable.

The seven beats (source of truth: `src/descent.ts`). The `road` beat is a
cinematic-only travel beat (`transit: true`) with no static DOM section:

| Code | id | Scene | Content |
|---|---|---|---|
| L0 SKY | `top` | High in the clouds | Hero (`profile.ts`) |
| L1 THE GARDEN | `control` | Toolkit garden at the trailhead | Skills (`skills.ts`), tech pets |
| L2 THE WORKSHOP | `data-plane` | Rustic shed of mechanical rigs | Independent systems — `experience[0]` |
| L3 THE ROAD | `road` | Camera rides the road toward the house; flowers pop in | *(travel only — no panel)* |
| L4 THE DRIVEWAY | `infrastructure` | Retro truck + cardboard job-era boxes | Employed roles — `experience.slice(1)` |
| L5 THE GALLERY | `proving-ground` | Framed live-site screenshots on the wall | Live sites (`projects.ts`) |
| L6 THE DESK | `core` | Carlos seated (Man model), back to camera, coffee | Contact |

## Architecture (important)

**Two presentations of the same data, chosen at runtime in `App.tsx` via
`useEnable3D()`:**

1. **Cinematic descent (capable desktops)** — a full-viewport WebGL flight. Files
   in `src/three/`:
   - `DescentCanvas.tsx` → exports `CinematicDescent`: the `<Canvas>` with drei
     `<ScrollControls pages={7} damping>` (its damping is the momentum — no
     Lenis/GSAP). Contains the 3D `Scene` and the content in `<Scroll html>`.
   - `path.ts` — the **orbit rig**: `PLANET` sphere (R=75, center `(0,-75,-6)` so
     the apex is at world `(0,0,-6)`), `PAD_A` tilt angles per beat (house 0,
     workshop 1.5, garden 2.9), `orbitAngle(o)` (piecewise-linear scroll→tilt,
     monotonic garden→0, keyframed to `BEAT`), `camOrbit` (chase camera: `H_UP`
     above the road + `BACK` up-road + mid-leg lift), `roadPoint`/`roadsidePoint`/
     `shotPoint` (single source for BOTH content placement and camera gaze), the
     composed beat shots (`GARDEN_SHOT`/`SHED_SHOT` + gaze windows), and the
     world-space `INTERIOR` CatmullRom for the house flight. Content is **seven
     equal 100vh blocks**, so block *i* centers at offset **i/6** — `BEAT` values
     must match, or structures and text drift apart. `orbitAngle` reaches rest
     (0) at `ARRIVE` (4/6), before `DOOR_OPEN`, so the interior lands at its
     authored world coords. `path.test.ts` (run `node src/three/path.test.ts`)
     asserts these invariants — keep it passing.
   - `DescentCanvas.tsx` also holds `CameraRig` (orbit + sky-in slerp + gaze/shot
     envelopes + **camera roll**: `camera.up` follows the orbit tilt so the far
     side of the planet renders right-side-up) and `SkyRig` (sun + hemisphere +
     skydome rotate about the planet center with the camera's tilt, so every
     beat is lit/shadowed like the house at rest and the sky gradient stays
     upright; identity at the hero and from arrival on).
   - `structures.tsx` — exports `World`: world-space sky scenery (clouds, island)
     plus the static `Planet`. `Planet` holds the house `Pad` (tilt 0) and two
     `Roadside` placements (garden/workshop, `±GARDEN_DX/SHED_DX` off the road).
     The `Pad`'s inner `[0, R, 6]` offset cancels `PLANET.center`, so **house-pad
     children (the whole interior: `HouseShell`, `Door`, `Foyer`, `Gallery`,
     `Office`, and the interior point lights) use plain world coords** for any R.
     Don't hardcode a pad's world position — place content pad-local and let
     `Pad`/`Roadside` orient it (they mirror `roadsidePoint`).
   - `models.tsx` — `useGLTF` wrappers (`ModelTree/Desk/Chair/Computer/`
     `Plant/Pot/Cup/Greenhouse`) that clone + **auto-normalize each glTF by
     bounding box** (glTF exports arrive at wildly different scales) +
     `useGLTF.preload`.
   - `props.tsx` — remaining procedural bits (`House`, `Island`, `Slab`, `Rug`,
     `Window` helpers) + the flat-shaded `mat()` cache and `PAL` palette.
   - `Character.tsx` — the seated **Man** glТF playing its `Man_Sitting` clip
     (`useAnimations`), auto-normalized. Swappable rig.
   - `HallDisplay.tsx` — a gallery picture frame: `ModelPictureFrame` + a
     screenshot plane (`useTexture`) + a drei `<Text>` nameplate; `onClick`
     opens the site, hover lifts it off the wall.
   - `Garden.tsx` — the L1 toolkit garden: greenhouse + tech-pet mascots with a
     hover squash-and-stretch + `SpeechBubble` (the `Pet` wrapper is the reusable
     hover interaction).
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
  together. Fonts: `font-display` = Rubik Mono One (headlines, all-caps,
  `tracking-[-0.04em]`), `font-sans` + `font-mono` = Space Mono (body +
  labels/readouts).
- **Kinetic headings**: primary headers render through
  `components/KineticHeading.tsx` — GSAP SplitText chars rise out of per-char
  masks on first view (`back.out(1.7)`, tight stagger), then the split reverts
  to clean markup. It self-triggers via `useInView` (works inside drei
  `<Scroll html>` too) and renders a plain, always-visible tag under
  reduced motion.
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
descent SKY→THE DESK and confirm each beat is framed + the orbit/roll reads
right + the gallery frames show screenshots and click through; check a narrow
viewport and reduced-motion both fall back to the static DOM with content intact.
Run `node src/three/path.test.ts` after touching the rig constants.
(Carlos owns the visual pass — don't run Playwright for it.)

## Status / next

**In progress: the half-planet overhaul** (after GitHub issues #1–#4). The orbit
rig, camera roll, `SkyRig`, half-planet road + flower pop-ins, composed L1/L2
shots, grounded house (no terrace coin), concrete driveway, and the seated-office
arrangement are all built. What remains is **visual tuning of the knobs** —
`PAD_A`, `GARDEN_SHOT`/`SHED_SHOT`, `H_UP`/`BACK`/lift, `GARDEN_DX`/`SHED_DX`,
the `GardenPad`/`WorkshopPad` recenters, `SEAT_Y`/`FOCUS` in the office, and the
driveway seam at the road — Carlos drives that in-browser (don't burn tokens on
Playwright). The docked DOM panel side for L1/L2 (`CinematicContent.tsx`) may
want swapping now that the shots are head-on.

It's an evolving design — the pads in `structures.tsx` and the orbit rig in
`path.ts` are the main knobs. **Remaining procedural props (truck, shed, rigs,
pets) are candidates to swap for cohesive CC0 low-poly glTF packs**
(Kenney/Quaternius/Poly Pizza) via `useGLTF`. A known dev-only
`createRoot` warning comes from drei `<Scroll html>` under `StrictMode`;
production is clean (verified via `npm run preview`).
