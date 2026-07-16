import { useMemo } from "react";
import * as THREE from "three";
import { PATH, BEAT, CORE_Y } from "./path";

// Shared palette — cold steel for structure, crimson for the one accent.
const STEEL = "#2f3947";
const STEEL_DIM = "#212a35";
const CRIMSON = "#e8102a";

// A point on the path + the sideways vector (for flanking things left/right).
function frameAt(o: number) {
  const p = PATH.getPoint(o);
  const t = PATH.getTangent(o).normalize();
  const side = new THREE.Vector3().crossVectors(t, new THREE.Vector3(0, 1, 0)).normalize();
  return { p, t, side };
}

// Wireframe box as clean edge lines.
function WireBox({
  size,
  color = STEEL,
  position,
  rotation,
}: {
  size: [number, number, number];
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)),
    [size],
  );
  return (
    <lineSegments geometry={geo} position={position} rotation={rotation}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

// L0 — a ring gantry at the surface; the camera descends through it.
export function SurfaceGantry() {
  const { p } = frameAt(BEAT.surface);
  return (
    <group position={[p.x, p.y - 3, p.z - 6]} rotation={[-Math.PI / 2, 0, 0]}>
      {[5, 6.4, 7.8].map((r) => (
        <mesh key={r}>
          <torusGeometry args={[r, 0.02, 6, 80]} />
          <meshBasicMaterial color={STEEL} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 6.4, Math.sin(a) * 6.4, 0]}>
            <boxGeometry args={[0.05, 2.9, 0.05]} />
            <meshBasicMaterial color={STEEL_DIM} />
          </mesh>
        );
      })}
      <mesh>
        <torusGeometry args={[0.4, 0.04, 8, 24]} />
        <meshBasicMaterial color={CRIMSON} />
      </mesh>
    </group>
  );
}

// L1 — a control lattice off to one side: a grid of panels + status nodes.
export function ControlLattice() {
  const { p, side } = frameAt(BEAT.control);
  const base = p.clone().addScaledVector(side, -9);
  const nodes = useMemo(() => {
    const out: { x: number; y: number; on: boolean }[] = [];
    for (let c = 0; c < 5; c++)
      for (let r = 0; r < 6; r++)
        out.push({ x: (c - 2) * 1.3, y: (r - 2.5) * 1.3, on: Math.random() < 0.18 });
    return out;
  }, []);
  return (
    <group position={[base.x, base.y, base.z]} rotation={[0, Math.PI / 5, 0]}>
      <WireBox size={[7.5, 9, 0.4]} color={STEEL_DIM} />
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, 0.3]}>
          <boxGeometry args={[0.85, 0.85, 0.1]} />
          <meshBasicMaterial color={n.on ? CRIMSON : STEEL} />
        </mesh>
      ))}
    </group>
  );
}

// L2 — a data corridor: a tight tunnel of square frames strung along the
// path; the camera threads through them. Steel with the odd crimson rib —
// the frames pass at the screen edges as you fly, framing (not blocking) text.
export function DataCorridor() {
  const frames = useMemo(() => {
    const out: { pos: THREE.Vector3; quat: THREE.Quaternion; on: boolean }[] = [];
    const from = 0.34;
    const to = 0.52;
    const N = 9;
    for (let i = 0; i < N; i++) {
      const o = from + ((to - from) * i) / (N - 1);
      const pos = PATH.getPoint(o);
      const t = PATH.getTangent(o).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), t);
      out.push({ pos, quat, on: i % 4 === 2 });
    }
    return out;
  }, []);
  return (
    <group>
      {frames.map((f, i) => (
        <group key={i} position={f.pos} quaternion={f.quat}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[2, 0.02, 4, 4]} />
            <meshBasicMaterial color={f.on ? "#b0202f" : STEEL_DIM} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// L3 — server halls: tall wireframe monoliths flanking the path.
export function ServerHall() {
  const { p, side } = frameAt(BEAT.infra);
  const rows = useMemo(() => {
    const out: { pos: THREE.Vector3; leds: number[] }[] = [];
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const pos = p
          .clone()
          .addScaledVector(side, s * 7)
          .add(new THREE.Vector3(0, (k - 1) * 6.5, (k - 1) * 1.5));
        out.push({ pos, leds: [Math.random(), Math.random(), Math.random()] });
      }
    }
    return out;
  }, [p, side]);
  return (
    <group>
      {rows.map((m, i) => (
        <group key={i} position={m.pos}>
          <WireBox size={[2.4, 5.5, 1.4]} color={STEEL} />
          {/* rack unit lines */}
          {Array.from({ length: 7 }).map((_, r) => (
            <mesh key={r} position={[0, (r - 3) * 0.7, 0.71]}>
              <boxGeometry args={[2.2, 0.02, 0.02]} />
              <meshBasicMaterial color={STEEL_DIM} />
            </mesh>
          ))}
          {m.leds.map((v, r) => (
            <mesh key={r} position={[0.9, (Math.floor(v * 7) - 3) * 0.7, 0.72]}>
              <boxGeometry args={[0.12, 0.12, 0.05]} />
              <meshBasicMaterial color={CRIMSON} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// L4 — deployment bay: glowing portal frames the camera orbits.
export function DeploymentBay() {
  const { p, side } = frameAt(BEAT.proving);
  const portals = useMemo(() => {
    const spots: [number, number, number][] = [
      [-6, 1.5, -2],
      [6, -1, -1],
      [0, 3, -5],
    ];
    return spots.map(([dx, dy, dz]) => ({
      pos: p.clone().addScaledVector(side, dx).add(new THREE.Vector3(0, dy, dz)),
      rot: Math.random() * 0.4 - 0.2,
    }));
  }, [p, side]);
  return (
    <group>
      {portals.map((pt, i) => (
        <group key={i} position={pt.pos} rotation={[0, pt.rot, 0]}>
          <WireBox size={[3.4, 2.2, 0.05]} color={CRIMSON} />
          <mesh>
            <planeGeometry args={[3.2, 2]} />
            <meshBasicMaterial color={CRIMSON} transparent opacity={0.06} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// L5 — containment cage around the reactor core.
export function CoreCage() {
  return (
    <group position={[0, CORE_Y, 0]}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} rotation={[Math.PI / 2, 0, (k * Math.PI) / 3]}>
          <torusGeometry args={[3.4, 0.02, 6, 80]} />
          <meshBasicMaterial color={STEEL} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4]}>
            <boxGeometry args={[0.04, 5, 0.04]} />
            <meshBasicMaterial color={STEEL_DIM} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Structures() {
  return (
    <>
      <SurfaceGantry />
      <ControlLattice />
      <DataCorridor />
      <ServerHall />
      <DeploymentBay />
      <CoreCage />
    </>
  );
}
