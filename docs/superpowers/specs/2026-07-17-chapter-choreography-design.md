# Chapters — micro-beat scroll choreography (design)

Approved by Carlos on 2026-07-17.

## Goal

Make the cinematic descent Awwwards-caliber storytelling: at each content beat
(garden / workshop / driveway / gallery) the camera **locks** while the docked
panel steps through **micro-beats** — one content item at a time, copy
transitioning in and out — and the 3D world acknowledges the active item.
Also: replace all four procedural garden pets with the new glTF models.

Locked decisions:
- **Hybrid scroll feel** — micro-beat transitions are one-shot GSAP animations
  fired at scroll thresholds (reversed when scrolling back up); continuous
  elements (chapter progress rail, live depth counter) scrub 1:1 with scroll.
- **~12 pages** total (up from 7) — each content beat gets a ~1.5–2-page hold
  plateau; travel legs keep their current pacing.
- **Light 3D sync** — reuse existing prop animations (pet squash + speech
  bubble, gallery frame lift, driveway box pop), triggered by the active
  micro-beat. No new camera moves inside a beat.
- Static/mobile/reduced-motion branch is **untouched**.

## Architecture

### 1. Scroll map — `src/three/path.ts` stays the single source of truth

- `<ScrollControls pages={12}>` (DescentCanvas).
- New exported `CHAPTERS` table: per content beat `{ start, end, items }` in
  normalized offset [0..1] — garden 3 (skill groups), workshop 3
  (`experience[0].points`), driveway 4 (`experience.slice(1)` roles),
  gallery 3 (`sites`). Hero, road, and desk are single-state windows in the
  same table (`items: 1`) so every panel goes through one lifecycle.
- `BEAT` keyframes for `orbitAngle()` are replotted on the 12-page axis:
  **flat (constant tilt) across each chapter window** — that is the camera
  lock — ramping only during travel legs. `ARRIVE`/`DOOR_OPEN`/interior
  timings scale to the new axis with the same ordering invariants.
- Item `i` of a chapter is active while chapter-local progress
  `(offset - start) / (end - start)` is in `[i/items, (i+1)/items)`.
- `path.test.ts` gains assertions: chapter windows ordered, non-overlapping,
  within [0,1], aligned with their `BEAT` plateaus, and `orbitAngle` constant
  across every chapter window. Existing invariants keep passing.

### 2. State — one store, two speeds

- A tiny **zustand** store (already installed transitively by r3f — reuse, no
  new dep): `{ chapter: string | null, item: number }`.
- `ChapterDriver` (component inside the Canvas) reads drei's damped
  `useScroll().offset` in `useFrame` and:
  - **Discrete** (React state, ~13 changes per descent): updates the store on
    chapter/item boundary crossings → subscribers fire GSAP one-shots,
    direction-aware (reverse on scroll-up).
  - **Continuous** (no React): writes chapter-local progress and live depth to
    CSS variables on the panel root each frame → drives the scrubbed progress
    rail (`transform: scaleY(var(--chapter-progress))`) and depth readout.
- Both the DOM panels and 3D components read this store; it derives from the
  same damped offset as the camera, so text/world/camera cannot drift.

### 3. Pinned panels — `CinematicContent.tsx`

- Chapter panels stop scrolling past. They render into drei ScrollControls'
  **`fixed` layer** (`useScroll().fixed` — a non-scrolling div inside the
  scroll container), so panels hold position while wheel input still reaches
  the scroller (no dead scroll zones over links). *Verify the `fixed` element's
  behavior in drei 10.7.7 during implementation; fallback: keep `<Scroll html>`
  and counter-translate the active panel per frame — same visual result.*
- Panel lifecycle (GSAP timelines, all transform/opacity):
  - **Enter** — scrim fades up, mono eyebrow ticks in, `KineticHeading` plays.
  - **Item swap** — outgoing copy lines drop back into their SplitText masks,
    incoming lines rise; mono counter ticks `01 / 03`.
  - **Exit** — reverse of enter.
- Pointer-events regime preserved: panels `pointer-events-auto`, everything
  else transparent to the canvas.

### 4. Chapter copy

Same `src/content/*.ts` data, shown one item at a time and bigger:
- Garden — one skill group per micro-beat (`skillGroups[i]`).
- Workshop — one shipped-system point (`experience[0].points[i]`).
- Driveway — one role: when / title / company / summary.
- Gallery — one site: name / blurb / Enter + Source links (clickable).
No content forking; the static site keeps its stacked full-detail layout.

### 5. The world performs

- `Pet` (Garden) gains an `active` prop that triggers the same
  squash-and-stretch + `SpeechBubble` as hover; the active skill group's pet
  performs. `HallDisplay` frames gain the same for their lift-off-the-wall
  hover; the active site's frame lifts. The active role's driveway box pops
  (small scale spring in `useFrame`).
- Guard: 3D reactions only run while their chapter window is active.

### 6. Pet model swap (bundled into this work)

Replace all four procedural pet bodies in `Garden.tsx` with the new glTF
models via `models.tsx` wrappers (clone + bounding-box auto-normalize +
preload, like the others):

| Pet | Model file | Keeps its motion wrapper |
|---|---|---|
| Go gopher | `public/models/gopher.glb` | burrow in/out of the mound |
| Docker whale | `public/models/moby-dock.glb` | swim circle in the pond |
| Kubernetes | `public/models/kubernetes.glb` | hover-bob + spin |
| React | `public/models/react.glb` | fast spin + sparkle particles |

- `public/attribution.md` needs source/license lines for the four models —
  **Carlos to supply** (CC-BY requires the visible credit).

## Non-goals

Camera micro-dollies within a beat, sound, idle scroll nudges, custom cursor,
any change to the static branch, postprocessing/shaders (banned per CLAUDE.md).

## Verification

- `node src/three/path.test.ts` — new chapter invariants + existing rig
  contract.
- `npm run build`, `npm run lint`.
- In-browser drive (per CLAUDE.md): full descent — camera locks at each
  chapter; micro-beats step through all items exactly once per crossing;
  scrolling up reverses them; rail/depth scrub smoothly; gallery links
  clickable while pinned; wheel works everywhere (no dead zones); pets are the
  new models with their old motions; hover interactions still work.
- Narrow viewport + reduced-motion still get the untouched static site.
- Carlos owns the visual tuning pass (window constants, transition timings).
