import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { sites } from "../content/projects";
import { PATH, BEAT, HOUSE, DOOR_OPEN, HALL_WALL_X, HALL_FROM, HALL_TO } from "./path";
import { House, Island, Rug, Slab, mat, PAL } from "./props";
import { ModelCloud, ModelTree, ModelDesk, ModelChair, ModelMonitor, ModelPlant, ModelPot, ModelCup } from "./models";
import { HallDisplay } from "./HallDisplay";
import { Character } from "./Character";

// The world: clouds, a floating island, the little CLOSED house it flies into,
// and inside — an entry, a hall-of-fame corridor of clickable site monitors, and
// the office where Carlos sits at his desk. Outdoor scenery is anchored to the
// flight BEATS; the house + interior are fixed to the HOUSE layout.

const UP = new THREE.Vector3(0, 1, 0);

function anchor(o: number, forward: number, drop: number, lateral: number) {
  const p = PATH.getPoint(o);
  const ahead = PATH.getPoint(Math.min(o + 0.04, 1));
  const dir = ahead.clone().sub(p).normalize();
  const side = new THREE.Vector3().crossVectors(dir, UP).normalize();
  return p.addScaledVector(dir, forward).addScaledVector(side, lateral).add(new THREE.Vector3(0, -drop, 0));
}

function openSite(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

// ── outdoors ────────────────────────────────────────────────────────

function SkyClouds() {
  const clouds = useMemo(() => {
    const rng = mulberry32(7);
    const out: { p: [number, number, number]; big: boolean; yaw: number }[] = [];
    for (let i = 0; i < 11; i++) {
      const y = 12 + rng() * 30;
      const spread = 16 + (44 - y) * 0.25;
      out.push({
        p: [(rng() - 0.5) * 2 * spread, y, (rng() - 0.5) * 2 * spread + 8],
        big: rng() < 0.3,
        yaw: rng() * Math.PI * 2,
      });
    }
    return out;
  }, []);
  return (
    <>
      {clouds.map((c, i) => (
        <ModelCloud key={i} position={c.p} big={c.big} yaw={c.yaw} />
      ))}
    </>
  );
}

function IslandL1() {
  const p = useMemo(() => anchor(BEAT.control, 7, 5, 5), []);
  return (
    <group position={p.toArray()}>
      <Island position={[0, 0, 0]} r={3.4} />
      <ModelTree position={[-1.2, 0.3, 0.4]} height={3.6} />
      <ModelTree position={[1.4, 0.3, -0.7]} height={3} yaw={1.2} />
      <ModelTree position={[0.4, 0.3, 1.4]} height={2.6} yaw={2.4} />
    </group>
  );
}

// The ground the house sits on, a path to the door, and yard trees.
function Yard() {
  return (
    <>
      <mesh position={[0, -0.5, -5]} material={mat(PAL.grass)} receiveShadow>
        <cylinderGeometry args={[32, 30, 1, 30]} />
      </mesh>
      <mesh position={[0, -4.5, -5]} material={mat(PAL.dirt)}>
        <coneGeometry args={[30, 9, 30]} />
      </mesh>
      <mesh position={[0, 0.02, HOUSE.front + 4]} material={mat(PAL.dirtDark)} receiveShadow>
        <boxGeometry args={[2.4, 0.06, 9]} />
      </mesh>
      <ModelTree position={[-11, 0.3, 9]} height={5} />
      <ModelTree position={[12, 0.3, 6]} height={5.4} yaw={1} />
      <ModelTree position={[10, 0.3, 13]} height={4} yaw={2} />
      <ModelTree position={[-12, 0.3, -3]} height={4.6} yaw={0.5} />
      <House position={[-14, 0.4, 3]} rotation={[0, 0.7, 0]} wall={PAL.wallA} roof={PAL.roofB} scale={1.1} />
    </>
  );
}

// ── the closed house ────────────────────────────────────────────────

function Roof() {
  const { halfW, wallH, front, back } = HOUSE;
  const midZ = (front + back) / 2;
  const depth = front - back;
  const ang = 0.5;
  const panelW = halfW + 0.8;
  const H = panelW * Math.tan(ang);
  const panelLen = panelW / Math.cos(ang);
  return (
    <group>
      {/* flat ceiling (encloses the interior) */}
      <Slab size={[halfW * 2, 0.2, depth]} position={[0, wallH, midZ]} color={PAL.wallWarm} />
      {/* gable roof */}
      <mesh position={[-panelW / 2, wallH + H / 2, midZ]} rotation={[0, 0, ang]} material={mat(PAL.roofA)} castShadow>
        <boxGeometry args={[panelLen, 0.22, depth + 1.6]} />
      </mesh>
      <mesh position={[panelW / 2, wallH + H / 2, midZ]} rotation={[0, 0, -ang]} material={mat(PAL.roofA)} castShadow>
        <boxGeometry args={[panelLen, 0.22, depth + 1.6]} />
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

function HouseShell() {
  const { front, back, halfW, wallH, doorW, doorH } = HOUSE;
  const midZ = (front + back) / 2;
  const depth = front - back;
  const t = 0.3;
  const seg = (halfW - doorW / 2) / 2;
  return (
    <group>
      <mesh position={[0, -0.1, midZ]} material={mat(PAL.floor)} receiveShadow>
        <boxGeometry args={[halfW * 2, 0.2, depth]} />
      </mesh>
      {/* back + side walls */}
      <Slab size={[halfW * 2 + t, wallH, t]} position={[0, wallH / 2, back]} />
      <Slab size={[t, wallH, depth]} position={[-halfW, wallH / 2, midZ]} />
      <Slab size={[t, wallH, depth]} position={[halfW, wallH / 2, midZ]} />
      {/* front wall with a door opening */}
      <Slab size={[halfW - doorW / 2, wallH, t]} position={[-doorW / 2 - seg, wallH / 2, front]} />
      <Slab size={[halfW - doorW / 2, wallH, t]} position={[doorW / 2 + seg, wallH / 2, front]} />
      <Slab size={[doorW, wallH - doorH, t]} position={[0, (doorH + wallH) / 2, front]} />
      {/* windows on the +x wall (opposite the monitors) */}
      <Window position={[halfW - 0.06, 1.9, -1]} />
      <Window position={[halfW - 0.06, 1.9, -12]} />
      <Roof />
    </group>
  );
}

// The front door — hinged on the left of the opening, swings inward with scroll.
function Door() {
  const scroll = useScroll();
  const ref = useRef<THREE.Group>(null);
  const { doorW, doorH, front } = HOUSE;
  useFrame(() => {
    const open = THREE.MathUtils.smoothstep(scroll.offset, DOOR_OPEN.from, DOOR_OPEN.to);
    if (ref.current) ref.current.rotation.y = open * Math.PI * 0.62;
  });
  return (
    <group position={[-doorW / 2, 0, front]}>
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

function EntryRoom() {
  return (
    <group>
      <Rug position={[0, 0.02, 2]} size={[4, 3.5]} color={PAL.rug} />
      <ModelPlant position={[4.6, 0, 3.5]} />
      <ModelPot position={[-4.6, 0, 0]} />
    </group>
  );
}

// The hall of fame: clickable site monitors along the −x wall.
function HallOfFame() {
  const two = sites.slice(0, 2);
  return (
    <group>
      <Rug position={[0, 0.02, (HALL_FROM + HALL_TO) / 2]} size={[3.4, HALL_FROM - HALL_TO + 2]} color={PAL.wallB} />
      {two.map((site, i) => {
        const z = two.length === 1 ? (HALL_FROM + HALL_TO) / 2 : HALL_FROM + ((HALL_TO - HALL_FROM) * i) / (two.length - 1);
        return <HallDisplay key={site.name} site={site} position={[HALL_WALL_X, 1.1, z]} onActivate={(s) => openSite(s.url)} />;
      })}
    </group>
  );
}

// The office: Carlos at his desk (Man model, sitting), back to camera, a monitor
// and coffee cup on the desk.
function Office() {
  return (
    <group>
      <Rug position={[0, 0.02, -14]} size={[5, 4.5]} color={PAL.rug} />
      <ModelDesk position={[0, 0, -15]} height={1.15} />
      <ModelMonitor position={[0, 1.15, -15.5]} yaw={0} height={1.3} />
      <ModelCup position={[0.7, 1.15, -14.7]} />
      <ModelChair position={[0, 0, -13.9]} yaw={0} />
      <Character position={[0, 0, -14]} rotation={[0, Math.PI, 0]} />
      <ModelPlant position={[4.6, 0, -15.6]} />
    </group>
  );
}

export function World() {
  return (
    <>
      <SkyClouds />
      <IslandL1 />
      <Yard />
      <HouseShell />
      <Door />
      <EntryRoom />
      <HallOfFame />
      <Office />
    </>
  );
}

// Small deterministic PRNG so cloud placement is stable across reloads.
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
