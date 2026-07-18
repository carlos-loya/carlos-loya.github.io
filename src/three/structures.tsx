import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { sites } from "../content/projects";
import { HOUSE, DOOR_OPEN, HALL_FROM, HALL_TO, HALL_WALL_X, PLANET, PAD_A, GARDEN_DX, SHED_DX } from "./path";
import { Island, Rug, Slab, CloudCluster, mat, PAL } from "./props";
import { ModelTree, ModelDesk, ModelChair, ModelComputer, ModelPlant, ModelPot, ModelCup } from "./models";
import { HallDisplay } from "./HallDisplay";
import { Character } from "./Character";
import { Garden } from "./Garden";
import { Workshop } from "./Workshop";
import { PlanetRoad } from "./Road";
import { Driveway } from "./Driveway";

// The world is a small STATIC planet (Katamari main-menu style); the camera
// orbits it (camOrbit/orbitAngle in path.ts). Content lives at fixed tilt
// angles (PAD_A) on the faceted sphere — the toolkit GARDEN and WORKSHOP shed
// beside the road (Roadside), the HOUSE at the apex (Pad, tilt 0) so the camera
// can dive through the door into the foyer + gallery + office wing, all
// authored at their original world coordinates (see path.ts / Pad).

const F = HOUSE.floorY; // interior floor height (lifted above the yard → no z-fight)

function openSite(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

// ── outdoors (world-space, outside the planet group) ────────────────

// A single drifting cloud: a chunky CloudCluster with a subtle idle bob + slow
// x-drift (the fast parallax "rush" comes free from the camera descending past
// the close foreground ones).
function DriftCloud({ p, scale, seed, phase }: { p: [number, number, number]; scale: number; seed: number; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = p[1] + Math.sin(t * 0.3 + phase) * 0.4;
      ref.current.position.x = p[0] + Math.sin(t * 0.08 + phase) * 0.7;
    }
  });
  return (
    <group ref={ref} position={p}>
      <CloudCluster scale={scale} seed={seed} />
    </group>
  );
}

// The hero "vignette funnel": large chunky clusters hug the left / right / bottom
// edges of the view (close to the camera, so they rush past first on scroll),
// the center is kept clear except a few tiny wisps (you see down into the fog),
// and a distant band dissolves into the fog for an endless horizon.
const CLOUDS: { p: [number, number, number]; scale: number }[] = [
  // foreground frame — edges, close, large
  { p: [-15, 33, 8], scale: 5.2 },
  { p: [-11, 26, 14], scale: 4.6 },
  { p: [-7, 22, 17], scale: 3.8 },
  { p: [16, 34, 6], scale: 5.6 },
  { p: [13, 27, 12], scale: 4.4 },
  { p: [8, 22.5, 15], scale: 4.0 },
  { p: [1, 20.5, 18], scale: 3.4 }, // bottom-center, below the sightline
  // central gap — tiny wisps only
  { p: [-2.5, 37, -8], scale: 1.2 },
  { p: [3.5, 39, -14], scale: 1.0 },
  // distant band — small, fogged, endless horizon
  { p: [-20, 24, -26], scale: 3.2 },
  { p: [-8, 21, -34], scale: 2.6 },
  { p: [6, 22, -30], scale: 2.8 },
  { p: [19, 25, -24], scale: 3.0 },
  { p: [0, 19, -40], scale: 2.4 },
];

function SkyClouds() {
  return (
    <>
      {CLOUDS.map((c, i) => (
        <DriftCloud key={i} p={c.p} scale={c.scale} seed={i + 1} phase={i * 1.7} />
      ))}
    </>
  );
}

// A little floating island — decorative sky parallax candy, fixed in world space.
function FloatingIsland() {
  return (
    <group position={[16, 6, 10]}>
      <Island position={[0, 0, 0]} r={3.4} />
      <ModelTree position={[-1.2, 0.3, 0.4]} height={3.6} />
      <ModelTree position={[1.4, 0.3, -0.7]} height={3} yaw={1.2} />
      <ModelTree position={[0.4, 0.3, 1.4]} height={2.6} yaw={2.4} />
    </group>
  );
}

// ── the tiny planet ─────────────────────────────────────────────────

// A flat clearing that reads as PART of the planet, not a coin laid on top: the
// top disc sits flush at the pad-local surface (y≈0, where props stand) and a
// Local ground drop below the house-pad plane (y=0 at the sphere apex): the
// sphere surface falls away by ≈ d²/2R at horizontal distance d from the apex
// (0, 0, −6). Used to sink loose yard props onto the real grass.
const drop = (x: number, z: number) => (x * x + (z + 6) * (z + 6)) / (2 * PLANET.R);

// Places content beside the ROAD: `dx` to the side (left/right of the x=0 great
// circle) at tilt `a`, flush on the sphere (radius R, up = surface normal — no float,
// no tilt correction), then `yaw`ed to face the road. Mirrors roadsidePoint() in
// path.ts so the camera's gaze lands on the content centre.
function Roadside({ a, dx, yaw = 0, children }: { a: number; dx: number; yaw?: number; children: ReactNode }) {
  return (
    <group rotation={[a, 0, 0]}>
      <group rotation={[0, 0, dx / PLANET.R]}>
        <group position={[0, PLANET.R, 0]}>
          <group rotation={[0, yaw, 0]}>{children}</group>
        </group>
      </group>
    </group>
  );
}

// Yaw each beat so its open/viewing side faces the road (tune to taste).
const GARDEN_YAW = -Math.PI / 2; // garden on the left, presented toward the road
const SHED_YAW = -Math.PI / 2; // shed on the right, open front toward the road

// A pad sits at fixed tilt `angle`; its inner group offset [0, R, 6] cancels
// PLANET.center, so the house pad (angle 0) lands its children at the exact
// world coordinates the house/interior were authored at — for any R. See path.ts.
function Pad({ angle, children }: { angle: number; children: ReactNode }) {
  return (
    <group rotation={[angle, 0, 0]}>
      <group position={[0, PLANET.R, 6]}>{children}</group>
    </group>
  );
}

// The planet is STATIC; the camera orbits it (CameraRig in DescentCanvas). Pads
// sit at fixed tilt angles (PAD_A) on the x=0 great circle.
function Planet() {
  return (
    <group position={[PLANET.center.x, PLANET.center.y, PLANET.center.z]}>
      {/* faceted low-poly globe (detail 4 so the larger sphere still reads smooth) */}
      <mesh material={mat(PAL.grass)} receiveShadow castShadow>
        <icosahedronGeometry args={[PLANET.R, 4]} />
      </mesh>

      {/* house on top (authored at world coords); garden & shed set off to the
          sides of the road, staggered (garden higher-left, shed lower-right) */}
      <Pad angle={PAD_A.house}>
        <HousePad />
      </Pad>
      <Roadside a={PAD_A.workshop} dx={SHED_DX} yaw={SHED_YAW}>
        <WorkshopPad />
      </Roadside>
      <Roadside a={PAD_A.garden} dx={GARDEN_DX} yaw={GARDEN_YAW}>
        <GardenPad />
      </Roadside>

      {/* the continuous dirt road (+ start circle + popping flowers) garden→house */}
      <PlanetRoad />
    </group>
  );
}

// ── the garden pad (L1) ─────────────────────────────────────────────

function GardenPad() {
  return (
    // shift the garden's internal layout (centred ~+z12) back over the pad point
    <group position={[0, 0, -12]}>
      <Garden />
    </group>
  );
}

// ── the workshop pad (L2) — placeholder terrace; Workshop.tsx mounts here ──

function WorkshopPad() {
  return (
    <group>
      {/* shed set back a little so the open front faces the road */}
      <group position={[0, 0, -1.5]}>
        <Workshop />
      </group>
      <ModelTree position={[-5.5, 0, 4]} height={3.4} />
      <ModelTree position={[5.5, 0, 3.5]} height={3} yaw={1.4} />
    </group>
  );
}

// ── the house pad (L4–L6) — authored at world coords, identity at rest ──

function HousePad() {
  return (
    <group>
      {/* grass foundation under the house footprint: top flush with the floor
          plane, buried at the apex end, emerging where the sphere falls away —
          reads as ground, not a raised coin */}
      <mesh position={[-4.25, -1.15, -4]} material={mat(PAL.grass)} receiveShadow castShadow>
        <boxGeometry args={[19.5, 2.3, 21]} />
      </mesh>
      <mesh position={[0, 0.02 - drop(0, HOUSE.front + 2), HOUSE.front + 2]} material={mat(PAL.dirtDark)} receiveShadow>
        <boxGeometry args={[2.4, 0.06, 4]} />
      </mesh>
      <ModelTree position={[-8, -drop(-8, 8), 8]} height={4.2} />
      <ModelTree position={[8, -drop(8, 7), 7]} height={4} yaw={1} />
      <ModelTree position={[-7.5, -drop(-7.5, -8), -8]} height={3.6} yaw={0.5} />

      {/* driveway (truck + job-era boxes) right of the front path, sunk and
          tilted onto the sphere surface, in view as the camera approaches at L4 */}
      <Driveway position={[4.5, -1.05, 7]} rotation={[0.17, -0.3, 0]} />

      <HouseShell />
      <Door />
      <Foyer />
      <Gallery />
      <Office />

      {/* interior fill lights ride the house pad so they light the rooms from
          within no matter how the planet is rotated (the roof shadows the sun) */}
      <pointLight position={[0, 3.4, 2]} intensity={16} distance={13} color="#ffe6c2" />
      <pointLight position={[0, 3.4, -5]} intensity={18} distance={15} color="#fff0d8" />
      <pointLight position={[-9, 3.4, -10.5]} intensity={18} distance={15} color="#ffe6c2" />
    </group>
  );
}

// ── the L-shaped closed house ───────────────────────────────────────

function HouseShell() {
  const { front, back, halfW, wallH, doorW, doorH, wingMinX, wingFrontZ, wingOpenFrom, wingOpenTo } = HOUSE;
  const t = 0.3;
  const h = wallH / 2;
  const mainLen = front - back; // z length of main wing
  const doorSeg = (halfW - doorW / 2) / 2;
  const wingWidth = -halfW - wingMinX; // x extent of office wing
  const wingMidX = (wingMinX - halfW) / 2;
  const wingDepth = wingFrontZ - back;
  const wingMidZ = (wingFrontZ + back) / 2;
  return (
    <group>
      {/* floors (lifted to F, above the yard grass) */}
      <mesh position={[0, F - 0.12, (front + back) / 2]} material={mat(PAL.floor)} receiveShadow>
        <boxGeometry args={[halfW * 2, 0.24, mainLen]} />
      </mesh>
      <mesh position={[wingMidX, F - 0.12, wingMidZ]} material={mat(PAL.floor)} receiveShadow>
        <boxGeometry args={[wingWidth, 0.24, wingDepth]} />
      </mesh>

      {/* front wall (z=front) with the door opening */}
      <Slab size={[halfW - doorW / 2, wallH, t]} position={[-doorW / 2 - doorSeg, h, front]} />
      <Slab size={[halfW - doorW / 2, wallH, t]} position={[doorW / 2 + doorSeg, h, front]} />
      <Slab size={[doorW, wallH - doorH, t]} position={[0, (doorH + wallH) / 2, front]} />
      {/* right wall (gallery — frames mount here) */}
      <Slab size={[t, wallH, mainLen]} position={[halfW, h, (front + back) / 2]} />
      {/* back wall (spans both wings) */}
      <Slab size={[halfW - wingMinX + t, wallH, t]} position={[(halfW + wingMinX) / 2, h, back]} />
      {/* main-wing left wall (solid down to the wing front) */}
      <Slab size={[t, wallH, front - wingFrontZ]} position={[-halfW, h, (front + wingFrontZ) / 2]} />
      {/* divider between main wing and office wing, with an opening */}
      <Slab size={[t, wallH, wingFrontZ - wingOpenFrom]} position={[-halfW, h, (wingFrontZ + wingOpenFrom) / 2]} />
      <Slab size={[t, wallH, wingOpenTo - back]} position={[-halfW, h, (wingOpenTo + back) / 2]} />
      {/* office wing outer walls */}
      <Slab size={[t, wallH, wingDepth]} position={[wingMinX, h, wingMidZ]} />
      <Slab size={[-halfW - wingMinX, wallH, t]} position={[wingMidX, h, wingFrontZ]} />

      {/* ceilings + roofs (closed) */}
      <Slab size={[halfW * 2, 0.2, mainLen]} position={[0, wallH, (front + back) / 2]} color={PAL.wallWarm} />
      <Slab size={[wingWidth, 0.2, wingDepth]} position={[wingMidX, wallH, wingMidZ]} color={PAL.wallWarm} />
      <MainRoof />
      <Slab size={[wingWidth + 0.6, 0.25, wingDepth + 0.6]} position={[wingMidX, wallH + 0.18, wingMidZ]} color={PAL.roofA} />

      {/* a couple of windows for charm */}
      <Window position={[halfW - 0.05, 1.9 + F, 3]} />
      <Window position={[wingMinX + 0.05, 1.9 + F, -10]} />
    </group>
  );
}

function MainRoof() {
  const { halfW, wallH, front, back } = HOUSE;
  const midZ = (front + back) / 2;
  const depth = front - back;
  const ang = 0.5;
  const panelW = halfW + 0.7;
  const H = panelW * Math.tan(ang);
  const panelLen = panelW / Math.cos(ang);
  return (
    <group>
      <mesh position={[-panelW / 2, wallH + H / 2, midZ]} rotation={[0, 0, ang]} material={mat(PAL.roofA)} castShadow>
        <boxGeometry args={[panelLen, 0.22, depth + 1.4]} />
      </mesh>
      <mesh position={[panelW / 2, wallH + H / 2, midZ]} rotation={[0, 0, -ang]} material={mat(PAL.roofA)} castShadow>
        <boxGeometry args={[panelLen, 0.22, depth + 1.4]} />
      </mesh>
    </group>
  );
}

function Window({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh material={mat(PAL.deskWood)}>
        <boxGeometry args={[1.6, 1.4, 0.12]} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.35, 1.15]} />
        <meshBasicMaterial color={PAL.screenGlow} toneMapped={false} />
      </mesh>
    </group>
  );
}

// The front door — hinged left of the opening, swings inward with scroll.
function Door() {
  const scroll = useScroll();
  const ref = useRef<THREE.Group>(null);
  const { doorW, doorH, front } = HOUSE;
  useFrame(() => {
    const open = THREE.MathUtils.smoothstep(scroll.offset, DOOR_OPEN.from, DOOR_OPEN.to);
    if (ref.current) ref.current.rotation.y = open * Math.PI * 0.62;
  });
  return (
    <group position={[-doorW / 2, F, front]}>
      <group ref={ref}>
        <mesh position={[doorW / 2, doorH / 2, 0]} material={mat(PAL.deskWood)} castShadow>
          <boxGeometry args={[doorW, doorH, 0.12]} />
        </mesh>
        <mesh position={[doorW - 0.3, doorH / 2, 0.12]} material={mat(PAL.metal)}>
          <sphereGeometry args={[0.09, 8, 8]} />
        </mesh>
      </group>
    </group>
  );
}

// ── interior rooms ──────────────────────────────────────────────────

// Foyer (near the door): dressed; you face the gallery, not the man.
function Foyer() {
  return (
    <group>
      <Rug position={[0, F + 0.02, 3]} size={[4, 3.5]} color={PAL.rug} />
      <ModelPot position={[-3.5, F, 3.8]} />
      <ModelPlant position={[3.4, F, 3.6]} />
    </group>
  );
}

// The gallery: landscape picture frames on the +x wall (face −x), each holding a
// live-site screenshot like a gallery hanging.
function Gallery() {
  const two = sites.slice(0, 2);
  // Hang the frames PROUD of the +x wall, into the room. HALL_WALL_X (halfW-0.35)
  // is the intended mount: the wall slab spans halfW±0.15, so anything at halfW-0.06
  // is buried inside it (the screenshot z-fights the wall → only the nameplate shows).
  const frameX = HALL_WALL_X;
  const frameY = 1.7 + F; // eye-level centre
  return (
    <group>
      <Rug position={[1, F + 0.02, (HALL_FROM + HALL_TO) / 2]} size={[3, HALL_FROM - HALL_TO + 2]} color={PAL.wallB} />
      {two.map((site, i) => {
        const z = two.length === 1 ? (HALL_FROM + HALL_TO) / 2 : HALL_FROM + ((HALL_TO - HALL_FROM) * i) / (two.length - 1);
        return (
          <group key={site.name}>
            <HallDisplay site={site} position={[frameX, frameY, z]} onActivate={(s) => openSite(s.url)} />
            {/* museum picture light: a warm emissive bar over each frame (no
                spotlight — the gallery pointLight already provides the wash) */}
            <mesh position={[frameX - 0.15, 2.75 + F, z]}>
              <boxGeometry args={[0.25, 0.08, 1.2]} />
              <meshBasicMaterial color="#ffe6c2" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      <ModelPlant position={[3.6, F, -6.5]} />
    </group>
  );
}

// Office wing: Carlos at his desk (Man model, sitting), back to the camera which
// rounds the corner from +x. He faces −x into the desk; the chair is pushed in
// under him and the computer sits on the desktop facing him.
const DESK_TOP = 1.15; // ModelDesk normalized height — desktop surface
const SEAT_Y = 0.5; // chair seat height the Man sits on
function Office() {
  return (
    <group>
      <Rug position={[-9, F + 0.02, -10.5]} size={[5.5, 4.5]} color={PAL.rug} />
      <ModelDesk position={[-10.6, F, -10.5]} height={DESK_TOP} yaw={Math.PI / 2} />
      <ModelComputer position={[-11.0, F + DESK_TOP, -10.5]} yaw={Math.PI / 2} />
      <ModelCup position={[-10.2, F + DESK_TOP, -9.9]} />
      <ModelChair position={[-9.7, F, -10.5]} yaw={-Math.PI / 2} />
      <Character position={[-9.7, F + SEAT_Y, -10.5]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}

export function World() {
  return (
    <>
      <SkyClouds />
      <FloatingIsland />
      <Planet />
    </>
  );
}
