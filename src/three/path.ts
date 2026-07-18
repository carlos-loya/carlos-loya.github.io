import * as THREE from "three";

// The journey is a camera ORBIT around a small static planet (Katamari
// main-menu style). Content sits on pads at fixed tilt angles on the planet's
// x=0 great circle; the camera flies along an arc around the surface — garden →
// workshop → road → up and over to the house on top — always LOOKING AT the pad
// it's passing (the look target is derived from the pad's real position, so it's
// always framed). At the house it hands off to the fixed interior flight (door →
// gallery → desk), which is authored in plain world space and unchanged.

const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);

// ── the planet ───────────────────────────────────────────────────────
// A gentle low-poly world. center.y = -R keeps the sphere top at y≈0 (the ground
// under the house), so a pad at tilt φ placed via Rot_x(φ)·(0,R,6) (see Pad in
// structures.tsx) still lands the house pad (φ=0) at the interior's original world
// coords REGARDLESS of R — enlarging R leaves the house/driveway/interior untouched.
// Bigger R = flatter ground under each beat + more surface arc to space beats out.
export const PLANET = { R: 75, center: new THREE.Vector3(0, -75, -6) } as const;

// Tilt angles along the x=0 great circle (the ROAD). house at 0; the camera rides
// the road DOWN from the garden (higher tilt) to the house. garden/workshop are the
// camera's tilt when it glances at each beat — the beats themselves sit OFF to the
// side of the road (GARDEN_DX / SHED_DX), staggered (garden higher, shed lower).
// padPos/camOrbit/orbitAngle read these.
export const PAD_A = {
  house: 0,
  workshop: 1.5, // shed beat — camera tilt when it looks right at the shed
  garden: 2.9, // garden beat — at the trailhead, ~166° around the planet from the house
} as const;

// Sideways offsets from the road centreline: garden to the LEFT, shed to the RIGHT.
// (roadsidePoint's Rot_z maps +dx → −x, so a positive value lands on screen-left.)
export const GARDEN_DX = 9;
export const SHED_DX = -9;

// A point on the sphere `dx` to the side of the road at tilt `a` (radial, flush on
// the surface). Single source of truth for BOTH the Roadside placement in
// structures.tsx and the camera's look pivots, so the gaze always hits the content.
export function roadsidePoint(a: number, dx: number, t = new THREE.Vector3()) {
  return t
    .set(0, PLANET.R, 0)
    .applyAxisAngle(Z, dx / PLANET.R) // arc sideways off the road
    .applyAxisAngle(X, a) // down the road
    .add(PLANET.center);
}

// A point `h` above the surface at (a, dx) — radial offset off roadsidePoint.
// Used for the composed beat shots: camera + look-at both derive from it, so
// they stay valid whatever R / the pad angles become.
export function shotPoint(a: number, dx: number, h: number, t = new THREE.Vector3()) {
  return roadsidePoint(a, dx, t).sub(PLANET.center).multiplyScalar((PLANET.R + h) / PLANET.R).add(PLANET.center);
}

// Composed hero shots at L1/L2: during each beat's gaze window the camera eases
// off the trail to camDx (opposite side of the road from the scene) at camH
// above the surface, looking at the scene's center lookH off the ground — a
// head-on diorama view (both scenes are yawed to present toward the road).
export const GARDEN_SHOT = { camDx: -6, camH: 6, lookH: 1.2 } as const;
export const SHED_SHOT = { camDx: 7, camH: 4.5, lookH: 1.2 } as const;

// Camera framing tunables (chase view: above the road + trailing up-road).
const H_UP = 13; // height above the road surface (radial)
const BACK = 12; // how far the camera trails back up the road, so it looks forward-down
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();

// The road centreline point on the surface at tilt a (x=0, radial — flush, no +6).
// Single source for the camera's forward gaze; the beats sit off to the sides
// (roadsidePoint), so the base look rides the road and the pivots swing to each beat.
export function roadPoint(a: number, target = new THREE.Vector3()) {
  return target.set(0, PLANET.R, 0).applyAxisAngle(X, a).add(PLANET.center);
}

// ── chapters: the story beats' HOLD windows in scroll-offset space ───
// During a chapter the camera is LOCKED (orbitAngle / interiorT plateau) while
// the pinned DOM panel steps through `items` micro-beats and the 3D props
// react. Travel legs live in the gaps. 12 pages total (DescentCanvas).
// items counts mirror src/content: skillGroups 3, experience[0].points 3,
// experience.slice(1) 3, sites 2 — the panels map the real arrays; these
// numbers only drive the scroll thresholds.
export type Chapter = {
  id: "hero" | "garden" | "workshop" | "road" | "driveway" | "gallery" | "desk";
  start: number;
  end: number;
  items: number;
};
export const CHAPTERS: Chapter[] = [
  { id: "hero", start: 0.0, end: 0.06, items: 1 },
  { id: "garden", start: 0.14, end: 0.26, items: 3 },
  { id: "workshop", start: 0.34, end: 0.46, items: 3 },
  { id: "road", start: 0.48, end: 0.56, items: 1 },
  { id: "driveway", start: 0.58, end: 0.7, items: 3 },
  { id: "gallery", start: 0.78, end: 0.88, items: 2 },
  { id: "desk", start: 0.93, end: 1.0, items: 1 },
];

// The chapter containing offset o (null on a travel leg) + 0..1 local progress.
export function chapterAt(o: number): { c: Chapter | null; local: number } {
  for (const c of CHAPTERS) {
    if (o >= c.start && o <= c.end) return { c, local: (o - c.start) / (c.end - c.start) };
  }
  return { c: null, local: 0 };
}

// End of the sky-in dive == start of the garden chapter (CameraRig/SkyRig blend).
export const SKY_IN_END = CHAPTERS[1].start;

const GARDEN_END = CHAPTERS[1].end;
const WORKSHOP_START = CHAPTERS[2].start;
const WORKSHOP_END = CHAPTERS[2].end;
export const ARRIVE = CHAPTERS[4].start; // orbit reaches the house; interior takes over

// o (0..1) → orbit tilt angle. Plateaus across the chapter windows (the camera
// lock — the dwell easeBeat used to fake), linear ramps on the travel legs.
// Monotonic garden→0 (one way around).
export function orbitAngle(o: number) {
  if (o <= GARDEN_END) return PAD_A.garden;
  if (o <= WORKSHOP_START) return THREE.MathUtils.lerp(PAD_A.garden, PAD_A.workshop, (o - GARDEN_END) / (WORKSHOP_START - GARDEN_END));
  if (o <= WORKSHOP_END) return PAD_A.workshop;
  if (o <= ARRIVE) return THREE.MathUtils.lerp(PAD_A.workshop, 0, (o - WORKSHOP_END) / (ARRIVE - WORKSHOP_END));
  return 0;
}

// Camera position riding the road at tilt orbitAngle(): sit H_UP above the road
// point (radially) and BACK up-road, so it looks forward-down the road with the
// side beats framed as the gaze pivots to them. A gentle mid-road lift peaks between
// the beats. (Chase framing — decoupled from the steep surface normal so the beats
// read level however far down the front of the sphere they sit.)
export function camOrbit(o: number, target = new THREE.Vector3()) {
  const a = orbitAngle(o);
  const lift = Math.sin(THREE.MathUtils.clamp(a / PAD_A.garden, 0, 1) * Math.PI) * 6;
  roadPoint(a, target);
  _n.set(0, 1, 0).applyAxisAngle(X, a); // radial up at this tilt
  _b.set(0, 0, 1).applyAxisAngle(X, a); // up-road (behind the travel direction)
  return target.addScaledVector(_n, H_UP + lift).addScaledVector(_b, BACK);
}

// The high hero vantage — up in the clouds, gazing out over the cloudscape
// (see HERO_GAZE). The camera dives down out of here into the orbit over [0, 1/6].
export const SKY_POS = new THREE.Vector3(0, 40, 24);

// ── the fixed interior flight (unchanged from the working version) ──
// Sampled by interior progress t = (o − ARRIVE)/(1 − ARRIVE). The first point is
// the door-approach the orbit hands off to.
// The extra second point makes the early scroll LINGER outside the door (t≈0..0.25
// with 5 points), so the door-open animation reads and the camera visibly moves
// THROUGH the open doorway instead of blinking past it. door plane is z=HOUSE.front
// (6); the camera crosses it ~t≈0.3, by which point DOOR_OPEN has completed.
export const INTERIOR = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3.4, 9.5), // arrival — well outside the door (driveway in view)
  new THREE.Vector3(0, 3.3, 7.0), // paused at the threshold, watching the door swing open
  new THREE.Vector3(0, 2.9, 1.5), // through the doorway into the foyer
  new THREE.Vector3(0, 3.1, -8), // up the gallery (gaze +x at the frames)
  new THREE.Vector3(-6, 3.0, -10.5), // turned into the office wing, behind him
]);

// The L-shaped house. Main wing (foyer + gallery) runs back in −z from the door;
// an office wing extends −x off the back, hidden from the door by the divider
// wall at x = −halfW. Interior floor is lifted above the ground to stop z-fight.
export const HOUSE = {
  front: 6,
  back: -14,
  halfW: 4.5,
  wallH: 3.8,
  doorW: 3.0,
  doorH: 3.6,
  floorY: 0.12,
  wingMinX: -13,
  wingFrontZ: -6,
  wingOpenFrom: -8.5,
  wingOpenTo: -13,
} as const;

// Gallery picture frames hang on the +x gallery wall, facing −x into the room.
export const HALL_WALL_X = HOUSE.halfW - 0.35;
export const HALL_FROM = -1;
export const HALL_TO = -5.5;

// As the camera descends the road it pivots its gaze: LEFT onto the garden (L1),
// then RIGHT onto the shed (L2). Windows straddle the L1 (1/6) and L2 (2/6) beats.
export const GARDEN_GAZE = { from: 0.09, to: 0.31 } as const;
export const SHED_GAZE = { from: 0.29, to: 0.51 } as const;

// At the driveway beat the camera (arrived outside the door) turns its gaze onto
// the truck + job boxes (front-right) before diving through the door.
// Ends before the door sequence so the gaze returns to the door as it opens.
export const DRIVE_GAZE = { from: 0.53, to: 0.71 } as const;
export const DRIVE_LOOK = new THREE.Vector3(4.6, 0.4, 6.5);

// The camera eases its gaze onto the gallery wall across this window. Shifted a
// touch later to match the added door-dwell (frames are reached later in scroll).
export const HALL_GAZE = { from: 0.73, to: 0.93 } as const;

// The hero: at the very top the camera gazes out level over the clouds, blending
// into the orbit look-at as the descent begins.
export const HERO_GAZE = 0.1;

// The camera settles onto the seated figure as it turns into the office wing.
export const FOCUS = new THREE.Vector3(-9.9, 1.3, -10.5);
export const GROUND_Y = 0;

// The door swings open while the camera is still paused OUTSIDE the threshold
// (interiorT holds u=0 through the driveway chapter), completing right as the
// camera crosses the door plane (u≈0.3 at o≈DOOR_OPEN.to).
export const DOOR_OPEN = { from: 0.7, to: 0.735 } as const;

// Interior curve progress u(o) with plateaus: hold at the door through the
// driveway chapter, hold mid-hall through the gallery chapter, then the desk.
// (offset, u) keyframes — piecewise linear, monotonic.
const INTERIOR_KEYS: readonly [number, number][] = [
  [ARRIVE, 0],
  [0.7, 0], // driveway hold — parked outside the door
  [0.735, 0.3], // through the (now fully open) door plane
  [0.78, 0.62], // arrive mid-hall, facing the frame wall
  [0.88, 0.62], // gallery hold
  [1, 1], // settle at the desk
];
export function interiorT(o: number) {
  const x = THREE.MathUtils.clamp(o, ARRIVE, 1);
  for (let i = 1; i < INTERIOR_KEYS.length; i++) {
    const [o1, t1] = INTERIOR_KEYS[i];
    if (x <= o1) {
      const [o0, t0] = INTERIOR_KEYS[i - 1];
      return THREE.MathUtils.lerp(t0, t1, (x - o0) / (o1 - o0));
    }
  }
  return 1;
}
