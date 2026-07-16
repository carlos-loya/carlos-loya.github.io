import * as THREE from "three";

// The descent flight path. The camera samples this as scroll goes 0→1; the
// structures place themselves along it. Control points snake in x/z so the
// flight banks and turns. Shared by the camera rig and the environments.
export const PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 5, 13), // L0 surface — high, looking in
  new THREE.Vector3(3.5, -6, 9), // L1 control — bank right
  new THREE.Vector3(-4, -17, 10), // L2 data plane — bank left
  new THREE.Vector3(2.5, -29, 8), // L3 infrastructure
  new THREE.Vector3(-2, -41, 10), // L4 proving ground
  new THREE.Vector3(0, -52, 7), // approach
  new THREE.Vector3(0, -60, 5.5), // L5 core
]);

export const CORE_Y = -62;
export const SHAFT_TOP = 8;
export const SHAFT_BOTTOM = CORE_Y - 2;

// Scroll offset where each beat's structure sits. The content is six equal
// viewport-height blocks; with N blocks, block i is centered in the viewport
// at offset i/(N-1) = i/5. The structures sit at those offsets so text and
// environment arrive together.
export const BEAT = {
  surface: 0,
  control: 1 / 5,
  data: 2 / 5,
  infra: 3 / 5,
  proving: 4 / 5,
  core: 1,
} as const;

// Position on the path at a given scroll offset.
export function pointAt(o: number, target = new THREE.Vector3()) {
  return PATH.getPoint(THREE.MathUtils.clamp(o, 0, 1), target);
}
