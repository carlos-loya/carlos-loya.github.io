import * as THREE from "three";

// The descent flight path. High in the clouds → through the Katamari world →
// down through the front DOORWAY (at a low height, not over the wall) → glide
// back (−z) through the entry, the hall-of-fame corridor, and into the office
// behind the seated figure. Scroll 0→1 samples this curve.
export const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 40, 24), // L0 sky
  new THREE.Vector3(6, 30, 20), // L1 cloudline
  new THREE.Vector3(-4, 15, 18), // L2 the yard — house in view
  new THREE.Vector3(0, 3.6, 9), // drop low, line up with the door
  new THREE.Vector3(0, 2.8, 3), // L3 through the doorway into the entry
  new THREE.Vector3(0, 3.2, -4), // L4 hall of fame
  new THREE.Vector3(0, 2.9, -10), // L5 the office — behind the character
]);

// The closed house. Front wall at +z with the doorway; rooms run back in −z:
// entry (front→entryToComputer), hall of fame (→computerToOffice), office (→back).
export const HOUSE = {
  front: 6,
  back: -17,
  halfW: 6,
  wallH: 3.8,
  doorW: 3.0,
  doorH: 3.6,
  entryToComputer: -1,
  computerToOffice: -9,
} as const;

// Hall-of-fame monitors mount on this wall (−x), facing +x into the hall.
export const HALL_WALL_X = -HOUSE.halfW + 0.5;
export const HALL_FROM = -3; // first monitor z
export const HALL_TO = -8; // last monitor z

// The camera turns to gaze at the hall wall across this scroll window, then turns
// back to settle on the character.
export const HALL_GAZE = { from: 0.63, to: 0.92 } as const;

// The camera settles onto this (the seated figure) as it arrives.
export const FOCUS = new THREE.Vector3(0, 1.5, -14);
export const GROUND_Y = 0;

export const BEAT = {
  surface: 0,
  control: 1 / 5,
  data: 2 / 5,
  infra: 3 / 5,
  proving: 4 / 5,
  core: 1,
} as const;

// The door swings open across this scroll window (as the camera dives in).
export const DOOR_OPEN = { from: 0.42, to: 0.56 } as const;

// Camera easing: dwell at each beat, quicken between. Zero at every k/5, so the
// camera still hits each beat point exactly when scroll === k/5.
const N = 5;
const A = 0.55;
export function easeBeat(o: number) {
  const e = o - (A * Math.sin(2 * Math.PI * N * o)) / (2 * Math.PI * N);
  return THREE.MathUtils.clamp(e, 0, 1);
}

export function pointAt(o: number, target = new THREE.Vector3()) {
  return PATH.getPoint(THREE.MathUtils.clamp(o, 0, 1), target);
}
