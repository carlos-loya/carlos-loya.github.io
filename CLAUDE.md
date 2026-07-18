# CLAUDE.md

Guidance for Claude instances working in this repo.

## What this is

Carlos Loya's personal portfolio — `carlos-loya.github.io`. Deployed to GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`. Stack: React 19 +
Vite + Tailwind v4 (`@theme` tokens, no config file) + **GSAP** (ScrollTrigger,
SplitText). No WebGL, no three.js — see history below.

## The concept: "Color Worlds"

The site is **one vertical scroll story through six saturated "color worlds,"**
each world a chapter of the résumé, carried by **kinetic typography**. As you
scroll, the full-viewport background **blends between world hues**; one section
(Work) **pins and turns horizontal** before releasing back to vertical. It's an
Awwwards Site-of-the-Day bid: creative, unique, and **highly performant**.

Design direction (locked with Carlos — keep to it):
- **"Show, don't tell."** Demonstrate capability; don't recite a resume.
- **Katamari Damacy = aesthetic, not mechanic.** Keep the hyper-saturated,
  whimsical, toy-like *vibe* and color. There is **no rolling/physics gimmick**.
- **Kinetic typography is the signature.** The type is the art — oversized Rubik
  Mono One that splits/rises out of masks on entry (`KineticHeading`). Color and
  motion do the heavy lifting; imagery is minimal.
- **Per-world color.** Each act owns a bold hue; the background scrubs between
  them on scroll (cyan → lime → gold → coral → pink → violet). Type ink flips per
  world to stay legible.
- **Performance-first, zero WebGL.** Pure DOM + SVG/CSS + GSAP — GPU-cheap
  transforms only. No postprocessing, no shaders, no canvas 3D. It must stay 60fps
  and the résumé facts must stay legible/extractable.
- **A light toy garnish** (`ToyField`) scatters code-drawn saturated shapes
  behind each act — accent, not illustration. It must never upstage the type.

The six acts (source of truth: `src/scroll/worlds.ts`; array order == scroll
order). Content comes from `src/content/*` — never fork the data:

| id | World hue | Scene | Content |
|---|---|---|---|
| `top` | cyan | Hero | `profile.ts` |
| `toolkit` | lime | What I reach for | `skills.ts` (`skillGroups`, `techLogos` LogoLoop) |
| `systems` | gold | Systems I've shipped | `experience[0]` (independent work) |
| `experience` | coral | Where I've worked | `experience.slice(1)` (employed roles) |
| `work` | pink | Live in the wild | `projects.ts` — **horizontal pinned gallery** |
| `contact` | violet | Let's build something | `profile` contact fields (footer) |

## Architecture (important)

**One presentation** — no runtime 3D-vs-static branch (that's gone). A stack of
`.act` sections + one fixed animated background layer.

- **`src/scroll/worlds.ts`** — the single source of truth (replaced the old
  `descent.ts`). `WORLDS: World[]` (`id`/`nav`/`bg`/`fg`/`accent`), `world(id)`,
  `worldStyle(w)` (the inline `--world-*` vars an act applies), `navWorlds`.
  Both `Nav` and every act read from here so labels/anchors/colors never drift.
- **`src/scroll/ColorWorlds.tsx`** — the animated background. A single fixed
  `.worlds-bg` layer; one `ScrollTrigger` `onUpdate` blends its color between the
  two acts straddling the viewport center (`gsap.utils.interpolate` over the
  world `bg` values). Sets `html[data-worlds="motion"]`. **Under reduced motion
  it does nothing** — then each `.act` paints its own solid world background (the
  `.act` CSS rule), giving a static, fully-legible multi-color page with no JS.
- **`src/index.css`** — the color system. `@theme` color tokens are defined as
  `var(--world-*, <cyan fallback>)`, so every Tailwind color utility (`text-fg`,
  `bg-panel`, `border-brd`, `text-accent`) **resolves per-world automatically** —
  each `.act` just sets `--world-bg/fg/accent` and the whole subtree recolors, no
  per-component color code. Cards are glassy translucent-white panels. Font
  tokens (`--font-display` Rubik Mono One, `--font-sans`/`--font-mono` Space
  Mono) are unchanged. `@keyframes toyfloat` drives the garnish drift.
- **`src/components/Act.tsx`** — the world-aware section wrapper (replaced the
  old depth-HUD `Layer`). Applies `worldStyle`, scatters `ToyField`, and renders
  the kinetic header (eyebrow · big display title · subtitle) over the content.
  Most acts are `<Act world={world("…")} …>`.
- **`src/components/Projects.tsx`** — the horizontal interlude. A pinned GSAP
  timeline (`useGSAP` + ScrollTrigger `pin` + `scrub`) translates a flex track
  sideways; panels are **viewport-relative widths (`44vw`)** so the strip always
  overflows and there's real distance to scroll (fixed px widths once summed to
  *less* than a wide viewport and the section died — don't reintroduce that). A
  `distance <= 0` guard degrades gracefully, and reduced motion renders a plain
  vertical grid.
- **`src/components/ToyField.tsx`** — tier-1 code-drawn Katamari "stuff"
  (ring/blob/star/capsule/dot/cross SVGs) on a slow CSS float; skipped under
  reduced motion. **Tier-2** (recolored CC0 flat-object SVGs in `public/toys/`,
  credited in `public/attribution.md`) is planned asset work — drop them in here.
- **Kept machinery:** `KineticHeading` (GSAP SplitText, self-triggers via
  `useInView`, reverts to clean markup, reduced-motion-safe), `Reveal`,
  `useInView`, `LogoLoop`. Reuse them; don't reinvent.

## Conventions

- **Content lives in `src/content/*.ts`** (`profile`, `skills`, `experience`,
  `projects`). Edit data there; components read from it. Don't hardcode copy in
  components, and don't fabricate content — the mapping to acts must stay truthful.
- **New scroll/world logic goes in `src/scroll/`.** Add or reorder acts by
  editing `WORLDS` (+ a matching `<Act>` in `App.tsx`); the nav and color driver
  follow automatically.
- **Design tokens** are in `src/index.css` under `@theme`, wired to `--world-*`
  vars. To recolor a world, edit `WORLDS`, not the components. `color-scheme:
  light`.
- **Kinetic headings** render through `KineticHeading` (GSAP SplitText char-rise
  on first view; plain always-visible tag under reduced motion). **Reveals** wrap
  scroll-in fades via `<Reveal>`. Both already no-op under reduced motion — reuse
  them rather than writing new scroll animation.
- **Accessibility is not optional.** Every motion path (color scrub, pin, split,
  toy drift) must have a reduced-motion fallback that leaves the content static
  and legible. There is no separate DOM tree — the same markup must read well
  with JS/animation off.

## Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `tsc -b && vite build` (must pass; the deploy runs it)
- `npm run lint` — oxlint (LogoLoop has 3 pre-existing warnings; ignore those)

## Verifying changes

Drive it, don't just typecheck. `npm run dev`, then in a browser: scroll the full
story top→bottom and confirm the background **blends** cyan→lime→gold→coral→
pink→violet, each act's **kinetic heading** fires on entry, and the **Work**
section **pins, scrolls sideways, and releases**; type stays legible in every
world. Toggle OS reduced-motion (and a narrow viewport) and confirm the page
falls back to static, fully-legible multi-color sections with content intact.
(Carlos owns the visual/taste pass — don't burn tokens looping on Playwright
screenshots for aesthetics; a quick functional check when debugging a broken
interaction is fine.)

## History / status

**The 3D era is over.** This site was previously a WebGL "Katamari descent" (a
camera orbiting a low-poly planet, résumé-as-places). Carlos scrapped it in July
2026 — too clunky, perf-heavy — for the 2D Color Worlds concept above. All of
`src/three/`, `descent.ts`, the depth HUD, and the three.js/drei/zustand/
framer-motion deps were deleted. Don't reintroduce WebGL.

The rewrite is built and green (build + lint pass). Open follow-ups: the tier-2
CC0 toy object set (`public/toys/`), a possible second horizontal interlude
(Experience), and the content TODOs in `profile.ts` (real LinkedIn URL, résumé
PDF, location). `public/attribution.md` still lists the old 3D-model credits —
prune/replace when the toy assets land.
