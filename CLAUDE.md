# CLAUDE.md

Guidance for Claude instances working in this repo.

## What this is

Carlos Loya's personal portfolio — `carlos-loya.github.io`. Deployed to GitHub
Pages via `.github/workflows/deploy.yml` on push to `main`. Stack: React 19 +
Vite + Tailwind v4 (`@theme` tokens, no config file). The site is a **single
interactive 3D desk scene** built with **React Three Fiber** (`three` +
`@react-three/fiber` + `@react-three/drei`). GSAP is still installed (leftover
from the retired scroll story) but the desk scene doesn't use it.

## The concept: the desk

The homepage is **one 3D scene of Carlos's desk** (his own Blender model,
`art/desk.glb`). You look at the desk; **objects on it are interactive** — click
the **monitor** to focus it and reveal selected work, click the **iPod** to focus
it, play music, and see about/contact. Reference feel: diyabasu.com, growon.kr.
The desk is meant to **grow over time** (more clickable objects, more polish).

Design direction (locked with Carlos):
- **"Show, don't tell."** Demonstrate capability; don't recite a résumé.
- **The desk is the hero.** Frame the desk, not the whole room. Camera looks at
  the monitor screen. Clicking an object glides the camera in and fades a content
  panel in from the right; Esc / clicking empty space returns to the hero view.
- **Performance & accessibility.** The WebGL scene mounts **only** on capable
  desktops (`useEnable3D`: WebGL + `min-width:768px` + no reduced-motion). Mobile
  / no-WebGL / reduced-motion get `MinimalFallback` (static résumé + links), which
  is also the accessible content path. `DeskCanvas` is `React.lazy`, so the
  fallback path never downloads three.js.

## Architecture

`App.tsx` gates on `useEnable3D()` → `<DeskCanvas>` or `<MinimalFallback>`.
Everything for the scene lives in **`src/desk/`**:

- **`src/desk/DeskCanvas.tsx`** — the full-bleed `<Canvas>`, lighting, `focus`
  state (`null | "monitor" | "ipod"`), and the `CameraRig` (`useFrame` that lerps
  the camera toward a per-focus framing; hero view has subtle pointer parallax).
  **Camera framing knobs live here** (`HERO_DIR`, `FOCUS_DIR`, `*_FILL`, `FOV`) —
  these are the taste dials; tune them live, they are not derived. A DEV-only
  `window.__desk` publishes each object's projected screen position for tuning.
  Renders `<Overlays>` (DOM) outside the canvas.
- **`src/desk/DeskModel.tsx`** — loads `/models/desk.glb` (`useGLTF(url, true)`,
  Draco), normalizes it (scale to a target height, ground at y=0, shadows on),
  and measures framing: each interactive object's bounding box + the **hero box**
  (union of the desktop cluster `monitor/ipod/keyboard/mouse` — so the hero frames
  the desk, not the room). One pointer handler on the group walks each hit up to
  its nearest ancestor named in `INTERACTIVE` and reports focus/hover.
- **`src/desk/Overlays.tsx`** — the DOM panels over the canvas (glassy dark, site
  fonts). MonitorPanel = `projects.ts` (`sites`) + `github.ts` (`repos`); IpodPanel
  = about/contact from `profile.ts` + a `MusicPlayer`. Esc / close button clears
  focus; a hover pill hints "Click the monitor →".
- **`src/desk/useEnable3D.ts`** — the mount gate (recovered from the old 3D era).
- **`src/components/MinimalFallback.tsx`** — the static fallback / a11y page.

**Interactive objects** are matched by node **name** in the glb (`monitor`,
`ipod`, `keyboard`, `mouse`, `office`/`Window*` backdrop). To add one, add its
name to `INTERACTIVE` (and `DESK_ITEMS` if it should shape the hero framing) and
give it a panel in `Overlays.tsx`.

## The desk asset

`art/desk.glb` is the **37MB source** (with `art/desk.blend`) — a working file,
**not served** (only `public/` is deployed). The **served, compressed** copy is
`public/models/desk.glb` (~2.1MB). After re-exporting `art/desk.glb` from Blender,
recompress the served copy with:

```
npm run compress-model
```

That runs `@gltf-transform/cli optimize` with `--join false --flatten false`, which
is **mandatory** — `optimize`'s default join/flatten passes merge meshes and
**destroy the node names** the click handlers rely on.

**Music:** drop tracks in `public/audio/` and list them in the `TRACKS` array in
`Overlays.tsx` (`{ title, src: "/audio/..." }`). Empty ⇒ no player, panel still works.

## Conventions

- **Content lives in `src/content/*.ts`** (`profile`, `skills`, `experience`,
  `projects`, `github`). Edit data there; components read from it. Don't hardcode
  copy in components, and don't fabricate content.
- **Scene code goes in `src/desk/`.** Recolor/reframe via the constants in
  `DeskCanvas.tsx`, not by editing the model.
- **Accessibility is not optional.** `MinimalFallback` must stay a complete,
  legible content path (name, blurb, links, résumé) with no WebGL.

## Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — `tsc -b && vite build` (must pass; the deploy runs it)
- `npm run lint` — oxlint (LogoLoop has 3 pre-existing warnings; ignore those)

## Verifying changes

Drive it. `npm run dev`, then in a browser: the desk renders framed on the
monitor; hovering the monitor/iPod shows a pointer + hint; clicking each glides
the camera in and slides its panel in; Esc / empty-space click returns to hero.
Toggle OS reduced-motion (or a narrow viewport) → `MinimalFallback` renders with
résumé + links intact. `npm run build` + `npm run lint` clean. (Carlos owns the
visual/taste pass — the camera-framing constants are his dials; don't burn tokens
looping on screenshots for aesthetics, a quick functional check is fine.)

## History / status

This site has been through three concepts. **v1:** a WebGL "Katamari descent"
(camera orbiting a low-poly planet) — scrapped July 2026 as clunky/perf-heavy.
**v2:** a 2D GSAP "Color Worlds" vertical scroll story. **v3 (current):** the 3D
desk scene above (July 2026), reusing the recovered `useEnable3D` + glb-normalize
patterns from v1.

The Color Worlds files are **still in the tree but no longer mounted** — dead code
safe to delete once the desk is signed off: `scroll/ColorWorlds.tsx`,
`scroll/worlds.ts`, `components/{Nav,Act,ToyField,OrbTraveler,Hero,Projects,
Infrastructure,GitHub,Skills,Contact,LogoLoop,KineticHeading,Reveal}.tsx`, and the
`.act`/`.worlds-bg` CSS in `index.css`. `App.tsx` has a `ponytail:` note listing them.

Open follow-ups: real music tracks (`public/audio/`), more clickable desk objects,
content TODOs in `profile.ts` (real LinkedIn URL, location), pruning the dead
Color Worlds files, and `public/attribution.md` still lists old 3D-model credits.
