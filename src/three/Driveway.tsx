import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { mat, PAL, RetroTruck, Slab } from "./props";
import { experience, type Role } from "../content/experience";

// L4 THE DRIVEWAY — Carlos's employed roles (experience.slice(1)) as a stack of
// cardboard job-era boxes beside a parked retro delivery truck. Click a box: its
// flaps spring open and a retro packing slip rises out (drei <Html>). One box
// open at a time. Sits on the house pad (structures.tsx), right of the front path
// (screen-right, clear of the door corridor + the docked-left text scrim).

const roles = experience.slice(1); // the three employed roles
const S = 1.2; // box edge
const HS = S / 2;
const CARD = PAL.dirt; // tan cardboard
const TAPE = "#d8c9a8";

// four top flaps: hinge group at a top edge, child extends inward when flat.
const FLAPS = [
  { pos: [0, HS, HS] as const, child: [0, 0, -HS / 2] as const, size: [S, 0.05, HS] as const, axis: "x" as const, open: -2.1 },
  { pos: [0, HS, -HS] as const, child: [0, 0, HS / 2] as const, size: [S, 0.05, HS] as const, axis: "x" as const, open: 2.1 },
  { pos: [HS, HS, 0] as const, child: [-HS / 2, 0, 0] as const, size: [HS, 0.05, S] as const, axis: "z" as const, open: 2.1 },
  { pos: [-HS, HS, 0] as const, child: [HS / 2, 0, 0] as const, size: [HS, 0.05, S] as const, axis: "z" as const, open: -2.1 },
];

function PackingSlip({ role }: { role: Role }) {
  return (
    <div
      className="w-64 select-none rounded-sm border border-dashed border-fg-strong/60 bg-bg px-4 py-3 font-mono text-fg shadow-xl"
      style={{ pointerEvents: "none" }}
    >
      <div className="flex items-center justify-between border-b border-dashed border-fg-strong/40 pb-2">
        <span className="text-[10px] tracking-[0.2em] text-fg-dim">PACKING SLIP</span>
        <span className="rotate-[-6deg] rounded border border-accent px-1.5 py-0.5 text-[9px] font-bold tracking-[0.15em] text-accent">
          DELIVERED
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold leading-tight text-fg-strong">{role.title}</p>
      <p className="text-[11px] text-accent">{role.company}</p>
      <p className="mt-0.5 text-[10px] tracking-[0.08em] text-fg-dim">{role.when}</p>
      <p className="mt-2 border-t border-dashed border-fg-strong/30 pt-2 text-[9px] uppercase tracking-[0.16em] text-fg-dim">
        Manifest
      </p>
      <ul className="mt-1 space-y-1">
        {role.points.map((pt, i) => (
          <li key={i} className="flex gap-1.5 text-[10.5px] leading-snug">
            <span className="text-accent">›</span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CargoBox({ role, open, onToggle, position }: {
  role: Role;
  open: boolean;
  onToggle: () => void;
  position: [number, number, number];
}) {
  const jiggle = useRef<THREE.Group>(null);
  const flaps = useRef<(THREE.Group | null)[]>([]);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  // Portal the slip into document.body (a stable, viewport-anchored node). drei's
  // <Html> otherwise portals into the ScrollControls scroll element, which at this
  // beat is scrolled ~4/6 down — the card would render near the top of the scroll
  // content, far above the current viewport, i.e. nowhere on screen.
  const portal = useRef<HTMLElement>(document.body);

  useFrame((_, dt) => {
    const k = Math.min(dt * 9, 1);
    // hover pop (suppressed while open)
    if (jiggle.current) {
      const target = hovered && !open ? 1.07 : 1;
      const s = jiggle.current.scale;
      s.x += (target - s.x) * k;
      s.y += (target - s.y) * k;
      s.z += (target - s.z) * k;
    }
    // flaps spring toward open/closed
    flaps.current.forEach((f, i) => {
      if (!f) return;
      const targetAng = open ? FLAPS[i].open : 0;
      const cur = FLAPS[i].axis === "x" ? f.rotation.x : f.rotation.z;
      const next = cur + (targetAng - cur) * Math.min(dt * 7, 1);
      if (FLAPS[i].axis === "x") f.rotation.x = next;
      else f.rotation.z = next;
    });
  });

  return (
    <group position={position}>
      <group
        ref={jiggle}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        {/* body */}
        <mesh material={mat(CARD)} castShadow receiveShadow>
          <boxGeometry args={[S, S, S]} />
        </mesh>
        {/* tape stripe down the front */}
        <mesh position={[0, 0, HS + 0.01]} material={mat(TAPE)}>
          <boxGeometry args={[0.24, S, 0.02]} />
        </mesh>
        {/* flaps */}
        {FLAPS.map((fl, i) => (
          <group key={i} ref={(el) => (flaps.current[i] = el)} position={[fl.pos[0], fl.pos[1], fl.pos[2]]}>
            <mesh position={[fl.child[0], fl.child[1], fl.child[2]]} material={mat(CARD)} castShadow>
              <boxGeometry args={[fl.size[0], fl.size[1], fl.size[2]]} />
            </mesh>
          </group>
        ))}
      </group>
      {open && (
        // Screen-space (not `transform`): the slip renders at a fixed, readable DOM
        // size anchored above the box, so it stays legible however far the camera
        // is — the world-embedded distanceFactor version opened tiny/far away.
        // portal→body (see above) + default max z so the card sits on top.
        <Html portal={portal} position={[0, S + 1.1, 0]} center style={{ pointerEvents: "none" }}>
          <PackingSlip role={role} />
        </Html>
      )}
    </group>
  );
}

// boxes staged at the truck's tailgate (house end of the strip): two on the
// ground, one on top — mid-unload
const STACK: [number, number, number][] = [
  [-0.4, HS, -1.2],
  [0.9, HS, -1.5],
  [0.25, S + HS, -1.35],
];

const CONCRETE = "#a8a29a";

export function Driveway({ position = [0, 0, 0], rotation = [0, 0, 0] }: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <group position={position} rotation={rotation}>
      {/* concrete driveway strip running local +z out to the road, with a small
          parking apron at the house end */}
      <Slab size={[3.8, 0.16, 13]} position={[0, 0.02, 1.5]} color={CONCRETE} />
      <Slab size={[6, 0.16, 5]} position={[1, 0.02, -2]} color={CONCRETE} />
      {/* truck parked ON the strip, cab toward the road, tailgate at the boxes */}
      <RetroTruck position={[0.6, 0, 2.5]} />
      {roles.map((role, i) => (
        <CargoBox
          key={role.when}
          role={role}
          position={STACK[i] ?? [0, HS, 0]}
          open={openIdx === i}
          onToggle={() => setOpenIdx((cur) => (cur === i ? null : i))}
        />
      ))}
    </group>
  );
}
