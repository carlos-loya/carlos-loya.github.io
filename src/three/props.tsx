import { useMemo } from "react";
import * as THREE from "three";

// ── Procedural low-poly prop vocabulary ─────────────────────────────
// Flat-shaded primitives assembled into charming, recognizable everyday
// objects — a Katamari-flavored miniature world. Deliberately built from
// code (no asset pipeline): tiny, fast, cohesive. Each prop is a swappable
// component, so a CC0 glTF can drop in later without touching the layout.

// Clear-daytime palette.
export const PAL = {
  grass: "#8ecf6f",
  grassDark: "#6fb356",
  dirt: "#b98a58",
  dirtDark: "#9c7043",
  trunk: "#8a5a3c",
  leaf: "#5aa85a",
  leafAlt: "#79c06a",
  cloud: "#ffffff",
  road: "#9aa3ad",
  water: "#79c2e6",
  // building / house materials
  wallA: "#f4d7a6",
  wallB: "#eabf7a",
  wallC: "#eef1f4",
  roofA: "#d1685f",
  roofB: "#6d9dc5",
  roofC: "#e29b4b",
  window: "#bfe6ff",
  door: "#8a5a3c",
  // props
  crtBody: "#dcd3c0",
  crtDark: "#b7ad98",
  metal: "#c2c8ce",
  balloon: "#ef6f53",
  // interior
  floor: "#caa06a",
  floorDark: "#b0854f",
  wall: "#eae6dd",
  wallWarm: "#e5ddc9",
  rug: "#d98b6a",
  deskWood: "#a9744a",
  chair: "#3d4a5a",
  pot: "#cf7b52",
  screenGlow: "#cfe8ff",
  // character
  skin: "#e0a487",
  hair: "#4a3527",
  shirt: "#4f7d6b",
} as const;

// One shared, flat-shaded standard material per color — reused across every
// mesh so we're not allocating materials per instance.
const cache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: string, opts?: { rough?: number; metal?: number }) {
  const key = `${color}|${opts?.rough ?? 0.9}|${opts?.metal ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts?.rough ?? 0.9,
      metalness: opts?.metal ?? 0,
      flatShading: true,
    });
    cache.set(key, m);
  }
  return m;
}

type Vec3 = [number, number, number];
interface PlaceProps {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
}

// A small deterministic PRNG so seeded cloud placement is stable across reloads.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A chunky, toy-like low-poly cloud: a seeded clump of intersecting flat-shaded
// primitives (low-detail icospheres for faceted bubbles, plus a few cubes) at
// varying scales — bubble-gum clusters, not smooth realistic clouds. The cool
// hemisphere ambient gives the shadowed facets their lavender/blue tint for free;
// no shadows (sky decoration, kept cheap). Wider than tall, like a real cloud.
export function CloudCluster({ position, scale = 1, seed = 1 }: PlaceProps & { seed?: number }) {
  const blobs = useMemo(() => {
    const rng = mulberry32(seed * 2654435761);
    const out: { p: Vec3; r: number; cube: boolean; rot: number }[] = [];
    const n = 9 + Math.floor(rng() * 6); // 9–14 lumps
    // core lump
    out.push({ p: [0, 0, 0], r: 1, cube: false, rot: 0 });
    for (let i = 0; i < n; i++) {
      const t = rng() * Math.PI * 2;
      const rad = 0.5 + rng() * 1.5;
      out.push({
        p: [Math.cos(t) * rad, (rng() - 0.5) * 0.7, Math.sin(t) * rad * 0.6],
        r: 0.45 + rng() * 0.7,
        cube: rng() < 0.28, // a few cubes for chunk variety
        rot: rng() * Math.PI,
      });
    }
    return out;
  }, [seed]);
  return (
    <group position={position} scale={scale}>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} rotation={[b.rot, b.rot * 1.3, 0]} material={mat(PAL.cloud, { rough: 1 })}>
          {b.cube ? <boxGeometry args={[b.r * 1.4, b.r * 1.4, b.r * 1.4]} /> : <icosahedronGeometry args={[b.r, 0]} />}
        </mesh>
      ))}
    </group>
  );
}

// A round low-poly tree: icosphere canopy on a stubby trunk.
export function Tree({ position, rotation, scale = 1 }: PlaceProps & { leaf?: string }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.35, 0]} material={mat(PAL.trunk)} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.7, 6]} />
      </mesh>
      <mesh position={[0, 1.15, 0]} material={mat(PAL.leaf)} castShadow>
        <icosahedronGeometry args={[0.72, 0]} />
      </mesh>
      <mesh position={[0.4, 0.85, 0.15]} material={mat(PAL.leafAlt)} castShadow>
        <icosahedronGeometry args={[0.4, 0]} />
      </mesh>
    </group>
  );
}

// A pine: stacked cones.
export function Pine({ position, rotation, scale = 1 }: PlaceProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.3, 0]} material={mat(PAL.trunk)} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.6, 6]} />
      </mesh>
      {[0.75, 1.2, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} material={mat(i % 2 ? PAL.leafAlt : PAL.leaf)} castShadow>
          <coneGeometry args={[0.7 - i * 0.16, 0.7, 7]} />
        </mesh>
      ))}
    </group>
  );
}

// A little house: box body + pyramid roof + door.
export function House({
  position,
  rotation,
  scale = 1,
  wall = PAL.wallA,
  roof = PAL.roofA,
}: PlaceProps & { wall?: string; roof?: string }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.6, 0]} material={mat(wall)} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 1.4]} />
      </mesh>
      {/* pyramid roof: 4-sided cone, turned 45° to square up with the box */}
      <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} material={mat(roof)} castShadow>
        <coneGeometry args={[1.35, 0.8, 4]} />
      </mesh>
      <mesh position={[0, 0.4, 0.71]} material={mat(PAL.door)}>
        <boxGeometry args={[0.4, 0.7, 0.05]} />
      </mesh>
      <mesh position={[0.5, 0.75, 0.71]} material={mat(PAL.window)}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
      </mesh>
      <mesh position={[-0.5, 0.75, 0.71]} material={mat(PAL.window)}>
        <boxGeometry args={[0.35, 0.35, 0.05]} />
      </mesh>
    </group>
  );
}

// The hero building — the focal anchor at the bottom of the descent. A small
// stack of masses with a pitched roof and a little tower, so it reads as a
// friendly studio/house you're flying toward.
export function Building({ position, rotation, scale = 1 }: PlaceProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* main mass */}
      <mesh position={[0, 1.6, 0]} material={mat(PAL.wallC)} castShadow receiveShadow>
        <boxGeometry args={[4, 3.2, 3]} />
      </mesh>
      <mesh position={[0, 3.7, 0]} rotation={[0, Math.PI / 4, 0]} material={mat(PAL.roofB)} castShadow>
        <coneGeometry args={[3.3, 1.6, 4]} />
      </mesh>
      {/* side wing */}
      <mesh position={[2.6, 1, 0.6]} material={mat(PAL.wallA)} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>
      <mesh position={[2.6, 2.5, 0.6]} rotation={[0, Math.PI / 4, 0]} material={mat(PAL.roofA)} castShadow>
        <coneGeometry args={[1.7, 1, 4]} />
      </mesh>
      {/* tower */}
      <mesh position={[-1.8, 2.6, -0.4]} material={mat(PAL.wallB)} castShadow>
        <boxGeometry args={[1.2, 4, 1.2]} />
      </mesh>
      <mesh position={[-1.8, 5, -0.4]} rotation={[0, Math.PI / 4, 0]} material={mat(PAL.roofC)} castShadow>
        <coneGeometry args={[1.1, 1.2, 4]} />
      </mesh>
      {/* door + windows */}
      <mesh position={[0, 0.7, 1.51]} material={mat(PAL.door)}>
        <boxGeometry args={[0.7, 1.3, 0.06]} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 2.1, 1.51]} material={mat(PAL.window)}>
          <boxGeometry args={[0.7, 0.7, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

// A retro low-poly delivery step-van, parked on the driveway. Cream cab + a
// rounded coral cargo body, chunky dark wheels, a little chrome bumper. Purely
// procedural + flat-shaded; swap for a CC0 glTF later. Faces +z (toward the road).
export function RetroTruck({ position, rotation, scale = 1 }: PlaceProps) {
  const body = "#e07a5f"; // coral cargo body
  const cab = "#f3ead6"; // cream cab
  const tyre = "#2c2f35";
  const wheels: Vec3[] = [
    [-0.95, 0.42, 1.15],
    [0.95, 0.42, 1.15],
    [-0.95, 0.42, -1.05],
    [0.95, 0.42, -1.05],
  ];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* cargo box (rear) */}
      <mesh position={[0, 1.3, -0.7]} material={mat(body)} castShadow receiveShadow>
        <boxGeometry args={[2.1, 1.9, 2.4]} />
      </mesh>
      {/* slightly rounded roof cap */}
      <mesh position={[0, 2.32, -0.7]} material={mat(body)} castShadow>
        <boxGeometry args={[2.0, 0.24, 2.3]} />
      </mesh>
      {/* cab (front) */}
      <mesh position={[0, 1.0, 1.15]} material={mat(cab)} castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.3, 1.3]} />
      </mesh>
      {/* windshield + side windows */}
      <mesh position={[0, 1.35, 1.81]} material={mat(PAL.window)}>
        <boxGeometry args={[1.7, 0.7, 0.05]} />
      </mesh>
      {[-1.01, 1.01].map((x) => (
        <mesh key={x} position={[x, 1.35, 1.15]} material={mat(PAL.window)}>
          <boxGeometry args={[0.05, 0.6, 0.9]} />
        </mesh>
      ))}
      {/* bumper + headlight */}
      <mesh position={[0, 0.55, 1.85]} material={mat(PAL.metal)}>
        <boxGeometry args={[2.0, 0.22, 0.16]} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.85, 1.83]} material={mat("#fff3b0")}>
          <sphereGeometry args={[0.12, 8, 8]} />
        </mesh>
      ))}
      {/* wheels */}
      {wheels.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]} material={mat(tyre)} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 12]} />
        </mesh>
      ))}
    </group>
  );
}

// A floating chunk of land: grassy top, dirt underside — the little worlds
// the descent passes. Cylinder disc with a tapered dirt base.
export function Island({ position, scale = 1, r = 4 }: PlaceProps & { r?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]} material={mat(PAL.grass)} receiveShadow castShadow>
        <cylinderGeometry args={[r, r * 0.92, 0.7, 12]} />
      </mesh>
      <mesh position={[0, -1.3, 0]} material={mat(PAL.dirt)} castShadow>
        <coneGeometry args={[r * 0.92, 2.4, 12]} />
      </mesh>
    </group>
  );
}

// A little low-poly flower: green stem, icosahedron pistil, a ring of petals.
// Placed in clumps along the planet road; pops into existence as the road crests
// (see RoadFlowers in Road.tsx). Petal colour is the only variant.
const PETAL_ANGLES = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2);
export function Flower({ position, scale = 1, color = PAL.balloon }: PlaceProps & { color?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]} material={mat(PAL.leaf)}>
        <cylinderGeometry args={[0.035, 0.05, 0.5, 5]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={mat("#f6d34a")}>
        <icosahedronGeometry args={[0.09, 0]} />
      </mesh>
      {PETAL_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.15, 0.55, Math.sin(a) * 0.15]} material={mat(color, { rough: 0.7 })}>
          <sphereGeometry args={[0.1, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// A cheerful balloon — sky decoration / parallax candy.
export function Balloon({ position, scale = 1, color = PAL.balloon }: PlaceProps & { color?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]} material={mat(color, { rough: 0.6 })} castShadow>
        <sphereGeometry args={[0.7, 10, 10]} />
      </mesh>
      <mesh position={[0, -0.75, 0]} material={mat(color, { rough: 0.6 })}>
        <coneGeometry args={[0.18, 0.35, 8]} />
      </mesh>
      <mesh position={[0, -1.15, 0]} material={mat(PAL.crtDark)}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
    </group>
  );
}

// ── interior furniture (the house rooms) ────────────────────────────

// A wall / floor slab.
export function Slab({
  size,
  position,
  rotation,
  color = PAL.wall,
}: {
  size: [number, number, number];
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} material={mat(color)} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

// A floor rug.
export function Rug({ position, size = [3, 2], color = PAL.rug }: PlaceProps & { size?: [number, number]; color?: string }) {
  return (
    <mesh position={position} material={mat(color)} receiveShadow>
      <boxGeometry args={[size[0], 0.04, size[1]]} />
    </mesh>
  );
}

// A potted plant.
export function Plant({ position, scale = 1 }: PlaceProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} material={mat(PAL.pot)} castShadow>
        <cylinderGeometry args={[0.3, 0.24, 0.7, 8]} />
      </mesh>
      <mesh position={[0, 1, 0]} material={mat(PAL.leaf)} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
      </mesh>
      <mesh position={[0.3, 0.8, 0.12]} material={mat(PAL.leafAlt)} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
      </mesh>
    </group>
  );
}

// A desk: top + four legs.
export function Desk({
  position,
  rotation,
  w = 3,
  d = 1.4,
  h = 1.1,
  color = PAL.deskWood,
}: PlaceProps & { w?: number; d?: number; h?: number; color?: string }) {
  const legs: Vec3[] = [
    [-w / 2 + 0.2, h / 2, -d / 2 + 0.2],
    [w / 2 - 0.2, h / 2, -d / 2 + 0.2],
    [-w / 2 + 0.2, h / 2, d / 2 - 0.2],
    [w / 2 - 0.2, h / 2, d / 2 - 0.2],
  ];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, h, 0]} material={mat(color)} castShadow receiveShadow>
        <boxGeometry args={[w, 0.12, d]} />
      </mesh>
      {legs.map((p, i) => (
        <mesh key={i} position={p} material={mat(color)} castShadow>
          <boxGeometry args={[0.12, h, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

// An office chair: seat, back, post, star base.
export function OfficeChair({ position, rotation }: PlaceProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.9, 0]} material={mat(PAL.chair)} castShadow>
        <boxGeometry args={[0.9, 0.16, 0.9]} />
      </mesh>
      <mesh position={[0, 1.35, -0.42]} material={mat(PAL.chair)} castShadow>
        <boxGeometry args={[0.88, 0.95, 0.14]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={mat(PAL.metal)}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
      </mesh>
      <mesh position={[0, 0.12, 0]} material={mat(PAL.chair)}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 5]} />
      </mesh>
    </group>
  );
}

// A desktop monitor with a lit screen (self-illuminated, reads in daylight).
export function Monitor({ position, rotation }: PlaceProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.1, 0]} material={mat(PAL.crtDark)}>
        <boxGeometry args={[0.45, 0.18, 0.3]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={mat(PAL.crtDark)}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
      </mesh>
      <mesh position={[0, 1.05, 0]} material={mat(PAL.crtDark)} castShadow>
        <boxGeometry args={[1.7, 1.05, 0.12]} />
      </mesh>
      <mesh position={[0, 1.05, 0.07]}>
        <planeGeometry args={[1.5, 0.88]} />
        <meshBasicMaterial color={PAL.screenGlow} toneMapped={false} />
      </mesh>
    </group>
  );
}

// A coffee mug (its own group so the character can carry it in a sip).
export function Mug({ position, color = PAL.balloon }: PlaceProps & { color?: string }) {
  return (
    <group position={position}>
      <mesh material={mat(color)} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.22, 10]} />
      </mesh>
      <mesh position={[0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(color)}>
        <torusGeometry args={[0.07, 0.02, 6, 10]} />
      </mesh>
    </group>
  );
}

// A bookshelf with a few colourful books.
export function Shelf({ position, rotation }: PlaceProps) {
  const books: [number, number, string][] = [
    [-0.45, 1.35, PAL.roofA],
    [-0.1, 1.35, PAL.roofB],
    [0.3, 1.35, PAL.roofC],
    [-0.3, 0.75, PAL.wallB],
    [0.15, 0.75, PAL.leaf],
  ];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1, 0]} material={mat(PAL.deskWood)} castShadow receiveShadow>
        <boxGeometry args={[1.7, 2, 0.4]} />
      </mesh>
      {[0.4, 1, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.06]} material={mat(PAL.floorDark)}>
          <boxGeometry args={[1.6, 0.05, 0.34]} />
        </mesh>
      ))}
      {books.map(([x, y, c], i) => (
        <mesh key={"b" + i} position={[x, y + 0.2, 0.12]} material={mat(c)}>
          <boxGeometry args={[0.18, 0.42, 0.24]} />
        </mesh>
      ))}
    </group>
  );
}
