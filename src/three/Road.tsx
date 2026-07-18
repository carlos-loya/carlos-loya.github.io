import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { PAL, Flower } from "./props";
import { PLANET, orbitAngle } from "./path";

// THE ROAD — a continuous DIRT road down the planet's x=0 great circle, from a
// trailhead CIRCLE at the garden end (top) all the way to the house yard (bottom).
// The garden and shed sit off to the sides of it (structures.tsx Roadside); the
// camera rides the road down, glancing left then right. Flowers pop along the verges
// as the camera descends. Lives inside the planet group (structures.tsx Planet).

const R = PLANET.R;
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);
const HALF_W = 2.4; // road half-width
const EPS = 0.06; // lift off the grass to avoid z-fighting

// Road spans from just past the house yard up past the garden anchor
// (PAD_A.garden) to the trailhead circle just beyond it — ~half the planet.
const A0 = 0.2;
const A1 = 3.05;

// One dirt material for the road + circle (double-sided so ribbon winding never
// matters; flat-shaded to match the low-poly world).
const DIRT = new THREE.MeshStandardMaterial({ color: PAL.dirt, roughness: 0.96, metalness: 0, flatShading: true, side: THREE.DoubleSide });
const DIRT_DARK = new THREE.MeshStandardMaterial({ color: PAL.dirtDark, roughness: 0.96, metalness: 0, flatShading: true, side: THREE.DoubleSide });

// One flat plank sitting tangent on the surface at circle-angle `a`, offset `x`
// sideways (radial, z=0 → flush on the grass like the pads). children default to the
// road plank; used for flowers too.
function onSurface(a: number, x: number, y = 0): [THREE.Euler, [number, number, number]] {
  return [new THREE.Euler(a, 0, 0), [x, R + y, 0]];
}

// A continuous dirt ribbon hugging the surface from A0→A1: two edge vertices per
// step (left/right, arced sideways so they stay flush) stitched into a triangle
// strip. One mesh, one material → a smooth dirt road, no brick seams.
function DirtRoad() {
  const geo = useMemo(() => {
    const steps = 160;
    const pos: number[] = [];
    const e = new THREE.Vector3();
    for (let i = 0; i <= steps; i++) {
      const a = A0 + (A1 - A0) * (i / steps);
      e.set(0, R + EPS, 0).applyAxisAngle(Z, -HALF_W / R).applyAxisAngle(X, a);
      pos.push(e.x, e.y, e.z);
      e.set(0, R + EPS, 0).applyAxisAngle(Z, HALF_W / R).applyAxisAngle(X, a);
      pos.push(e.x, e.y, e.z);
    }
    const idx: number[] = [];
    for (let i = 0; i < steps; i++) {
      const l0 = i * 2, r0 = i * 2 + 1, l1 = (i + 1) * 2, r1 = (i + 1) * 2 + 1;
      idx.push(l0, r0, l1, r0, r1, l1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={DIRT} receiveShadow />;
}

// The trailhead: a flat dirt disc + a darker rim ring, marking the top of the road
// at the garden end.
function StartCircle() {
  return (
    <group rotation={[A1, 0, 0]}>
      <group position={[0, R + EPS, 0]}>
        <mesh material={DIRT} receiveShadow>
          <cylinderGeometry args={[3.6, 3.6, 0.12, 28]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={DIRT_DARK}>
          <torusGeometry args={[3.6, 0.2, 8, 28]} />
        </mesh>
      </group>
    </group>
  );
}

const FLOWER_COLORS = ["#ef6f53", "#f4c542", "#e58fb0", "#8f7ce5", "#ffffff"];

// Each flower springs its scale 0→1 (with a little overshoot) once the orbiting
// camera has descended past the flower's tilt-angle. Shared clock: the camera's
// tilt === orbitAngle(scroll.offset), sweeping the garden angle → 0.
function RoadFlowers() {
  const scroll = useScroll();
  const flowers = useMemo(() => {
    const rng = mulberry();
    return Array.from({ length: 48 }, () => {
      const a = A0 + rng() * (A1 - A0);
      const side = rng() < 0.5 ? -1 : 1;
      const x = side * (1.5 + rng() * 1.3); // on the verges, off the plank centre
      return { a, x, color: FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)], size: 0.8 + rng() * 0.6 };
    });
  }, []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const state = useRef(flowers.map(() => ({ s: 0, v: 0 })));
  useFrame((_, dt) => {
    const tilt = orbitAngle(scroll.offset); // camera tilt, sweeps garden → 0
    const clampDt = Math.min(dt, 1 / 30);
    for (let i = 0; i < flowers.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const target = tilt <= flowers[i].a ? 1 : 0; // popped once the camera passes over it
      const st = state.current[i];
      // light spring with overshoot
      st.v += ((target - st.s) * 220 - st.v * 16) * clampDt;
      st.s = Math.max(0, st.s + st.v * clampDt);
      g.scale.setScalar(st.s * flowers[i].size);
    }
  });
  return (
    <group>
      {flowers.map((f, i) => {
        const [rot, pos] = onSurface(f.a, f.x, 0);
        return (
          <group key={i} rotation={rot}>
            <group position={pos}>
              <group ref={(el) => (refs.current[i] = el)} scale={0}>
                <Flower color={f.color} />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}

// tiny deterministic PRNG so flower placement is stable across reloads
function mulberry() {
  let a = 0x9e3779b9;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PlanetRoad() {
  return (
    <group>
      <DirtRoad />
      <StartCircle />
      <RoadFlowers />
    </group>
  );
}
