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

// A soft blobby cloud — a clump of flat-shaded spheres.
export function Cloud({ position, scale = 1 }: PlaceProps) {
  const blobs = useMemo<{ p: Vec3; r: number }[]>(
    () => [
      { p: [0, 0, 0], r: 1 },
      { p: [1.1, -0.15, 0.2], r: 0.75 },
      { p: [-1.05, -0.1, -0.15], r: 0.8 },
      { p: [0.4, 0.35, -0.3], r: 0.65 },
      { p: [-0.5, 0.3, 0.35], r: 0.6 },
    ],
    [],
  );
  return (
    <group position={position} scale={scale}>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} material={mat(PAL.cloud, { rough: 1 })}>
          <icosahedronGeometry args={[b.r, 1]} />
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
