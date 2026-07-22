# Katamari Planet — design

**Date:** 2026-07-22
**Status:** approved (design), not yet planned or implemented
**Supersedes:** the vertical Color Worlds site as the *primary* presentation
(Color Worlds survives, demoted to the fallback — see §6)

## 1. Concept

The portfolio becomes a single low-poly planet you roll a ball around. No
scrollbar, no vertical story. The Katamari aesthetic returns as the *whole
world*; the Katamari **mechanic** — a ball that accretes everything it touches —
returns as real, user-driven play.

Résumé content is **not** gated behind the mechanic. Absorbing props is garnish:
pure delight, no meaning. The content lives at fixed **landmarks** on the planet;
rolling near one opens a readable DOM panel. A visitor who never absorbs a single
flower can still read the entire résumé.

### Session flow

1. **Attract.** Site loads to the planet with a slow ambient camera orbit. This
   reuses the old on-rails flight (`path.ts` / `camOrbit`) nearly verbatim — the
   deleted v1 camera becomes the idle loop.
2. **Opt in.** A prompt offers the ball. The site is fully readable before this;
   nothing is hidden behind accepting.
3. **Drop in.** On accept the ball falls from the sky, lands, and the camera
   settles behind it. Control transfers.
4. **Play.** Free roll around the globe. Props stick. Landmarks open panels.

## 2. Terrain and physics

The world is a sphere: `PLANET = { R: 75, center: (0, -75, -6) }`, recovered
unchanged. **Gravity points at the planet core**, so the ball rolls over the
horizon and landmarks reveal themselves as you crest. This is the signature
moment of the whole design; the flat-ground and fake-dome alternatives were
considered and rejected for losing it.

**No physics engine.** Rapier/cannon would add ~1MB of WASM to serve a ball that
never needs stacking, joints, friction models, or real collision response.
Absorption is a distance test plus a reparent. Ball-vs-ground is "stay at
`R + ballRadius` from the core." That is a few hundred lines of pure math with no
dependency.

This is a deliberate ceiling. If the roll ever needs real contact response
(bouncing off buildings, props colliding with each other), swapping in Rapier is
contained entirely behind `ball.ts` and `absorb.ts`. Marked in code with a
`ponytail:` comment naming the upgrade path.

**Controls:** pointer drag to steer, WASD/arrows as an equal alternative. Camera
trails the ball, aligned to the ball's local up.

Touch drag is supported by the same pointer-event path, but note that phones are
routed to the fallback (§6) — touch here serves large touch-capable laptops and
tablets that pass the viewport check, not phones. The planet is never the phone
experience.

## 3. Modules

Each has one job, a defined interface, and can be understood without reading the
others.

| Module | Responsibility | Depends on |
|---|---|---|
| `src/katamari/sphere.ts` | Pure math. Point on sphere, local up/tangent basis, advance a position by a tangent velocity, great-circle distance. No React, no three. | nothing |
| `src/katamari/ball.ts` | Input vector → tangent velocity → integrate via `sphere.ts`. Owns roll rotation, speed damping, and radius growth. | `sphere.ts` |
| `src/katamari/absorb.ts` | Registry of absorbable props (position + radius). Distance test each frame; on hit, reparent the prop onto the ball at its contact point and grow the ball. | `sphere.ts` |
| `src/katamari/landmarks.ts` | Landmark table (id → tilt angle, side offset, content key). Proximity test → which landmark is active. | `sphere.ts` |
| `src/katamari/KatamariCanvas.tsx` | Host. Canvas, camera rig, attract↔play state machine, mounts the world and the ball. | all of the above |
| `src/katamari/ContentPanel.tsx` | The DOM panel for the active landmark. Reads `src/content/*`. Real HTML over the canvas — never text baked into a texture. | `src/content/*` |

**Recovered unchanged from `4befe07^`** (the aesthetic layer, the part that made
this worth reviving): `props.tsx`, `structures.tsx`, `models.tsx`, `Sky.tsx`,
`Birds.tsx`, `Garden.tsx`.

**Recovered and repurposed:** `path.ts` — only `PLANET`, `camOrbit`, and the pad
placement helpers. The chapter/scrub machinery (`chapters.ts`,
`DescentCanvas.tsx`, `CinematicContent.tsx`) is *not* revived; it exists to fly a
camera on rails through a story, which is precisely what this design replaces.

**Not revived: the house interior.** `Foyer`, `Gallery`, and `Office` were built
for a camera threading a fixed path through rooms. A growing ball cannot roll
through doorways and furniture without either constant wedging or a lot of
bespoke collision work, and the payoff is a room the player mostly cannot see
into. Those beats move to exterior landmarks instead (§4). The house *shell*
stays as a landmark you roll up to.

## 4. Landmarks

Five landmarks, one per non-`top` beat in `src/scroll/worlds.ts`, placed around
the globe at distinct tilt angles so they reveal one at a time over the horizon.
Content keys map to the existing `src/content/*` files — **the content model does
not change and must not be forked.**

| Landmark | Beat | Content | Source |
|---|---|---|---|
| Garden (existing `GardenPad`) | `toolkit` | `skills.ts` | already themed as tech — `Garden.tsx` has the K8s helm, React sprinkler, Docker whale, gopher |
| Workshop (existing `WorkshopPad`) | `github` | `github.ts` | the shed reads as "things I built myself" |
| House exterior (existing `HousePad`) | `experience` | `experience.slice(1)` | employed roles |
| **New pad** | `work` | `projects.ts` | needs authoring — a small cluster of screens/signage |
| **New pad** | `contact` | `profile.ts` | needs authoring — the closing beat |

Rolling within a landmark's proximity radius opens its panel; leaving closes it.
One panel at a time. The panel is focusable and keyboard-dismissible.

## 5. Content and accessibility rules

- Résumé text is **always real DOM**, never geometry or texture. Non-negotiable
  for screen readers, SEO, and text selection.
- Content is read from `src/content/*` unchanged. No forking, no hardcoded copy
  in components, no fabricated content.
- Every landmark's panel must be reachable without absorbing anything.

## 6. Fallback

**The current committed Color Worlds site becomes the fallback presentation.** It
is served instead of the planet when any of these hold:

- `prefers-reduced-motion: reduce`
- no WebGL context available
- coarse pointer / small viewport (mobile)
- no JS (the DOM ships static)

This is the load-bearing decision that makes the planet safe to ship: the
accessible, crawlable, fast version of the site already exists, is already built,
and is already green. Crawlers and assistive tech get it for free rather than
getting a bolted-on afterthought.

Both presentations read the same `src/content/*`, so they cannot drift.

## 7. Performance budget

v1 of this site was scrapped for being clunky and perf-heavy. Reintroducing
`three` + `@react-three/fiber` + `@react-three/drei` brings roughly 500KB gzip
back to a bundle currently at 132KB gzip. The budget is therefore explicit and
binding:

- **Planet build stays under 16ms/frame on a mid laptop, or props get cut.**
- Three and the whole `src/katamari/` tree are **lazy-loaded**. The fallback path
  must never download them.
- Instance repeated props (trees, flowers) rather than emitting individual meshes.
- Absorbed props are reparented, not re-created; the absorbable set is bounded and
  known at build time.

If the budget cannot be met, the design fails and we fall back — not ship a slow
planet.

## 8. Testing

- `sphere.ts` — node self-check (`sphere.test.ts`) asserting: a point advanced by
  a tangent velocity stays on the sphere surface; the local basis stays
  orthonormal; great-circle distance is symmetric and zero for identical points.
  This is the module everything else trusts, and it is pure, so it is cheap to
  pin down.
- `absorb.ts` — self-check that a prop inside the radius is absorbed exactly once
  and one outside is not.
- Everything else (camera feel, roll feel, whether it is *fun*) is a hands-on
  judgment call Carlos owns in the browser. Playwright is for debugging broken
  interactions, not for taste.

## 9. Implementation slices

This is too large for one plan. It decomposes into slices that each end at
something drivable in a browser, so the concept can be killed early and cheaply
if the roll does not feel good — the failure mode of the last three pivots was
building a lot before feeling anything.

1. **Roll on a sphere.** Recover the world dressing; ball + `sphere.ts` + camera.
   No absorption, no landmarks, no panels. Behind a `?katamari` flag.
   **This slice answers the only question that matters: is it fun to roll?**
2. **Absorption.** Props stick and the ball grows.
3. **Landmarks + panels.** Content wired from `src/content/*`.
4. **Attract mode + drop-in.** The opt-in flow and the reused camera orbit.
5. **Fallback routing + go-live.** Capability checks, lazy-load boundary, budget
   verification, flip off the flag.

Slice 1 is the go/no-go. Do not author the two new pads (§4) or build any panel
work until it has been driven and approved.

## 10. Open items (deliberately deferred, not unknowns)

- Art for the two new pads (`work`, `contact`).
- Ball growth curve — how fast it grows, and whether growth changes what it can
  absorb. Ships as "grows slightly, absorbs everything" until it feels wrong.
- `public/attribution.md` still lists the v1 3D model credits. Since the GLB
  models return, those credits become correct again — verify rather than prune.
