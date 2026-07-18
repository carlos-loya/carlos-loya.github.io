import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat } from "./props";

// A few simple procedural seagulls soaring in wide circles through the midground.
// Each gull is just 3 flat-shaded planes (a body + two dihedral wings) — a low-poly
// silhouette. They orbit a centre point, face along the circle tangent, bank (roll)
// into the turn, and give a faint wing flap for life. No shadows (sky candy).

const GULL = "#4a5560";

// Built facing +X: fuselage runs along X, wings spread along ±Z with a slight
// upward dihedral. wingR/wingL are rolled by the flap each frame.
function GullMesh({ span, wingR, wingL }: { span: number; wingR: React.RefObject<THREE.Group | null>; wingL: React.RefObject<THREE.Group | null> }) {
  const m = mat(GULL);
  return (
    <group scale={span}>
      {/* body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={m}>
        <planeGeometry args={[0.9, 0.2]} />
      </mesh>
      {/* right wing (+z) */}
      <group ref={wingR} rotation={[-0.25, 0, 0]}>
        <mesh position={[0, 0, 0.55]} rotation={[-Math.PI / 2, 0, 0]} material={m}>
          <planeGeometry args={[0.5, 1.0]} />
        </mesh>
      </group>
      {/* left wing (−z) */}
      <group ref={wingL} rotation={[0.25, 0, 0]}>
        <mesh position={[0, 0, -0.55]} rotation={[-Math.PI / 2, 0, 0]} material={m}>
          <planeGeometry args={[0.5, 1.0]} />
        </mesh>
      </group>
    </group>
  );
}

function Gull({ center, radius, height, speed, phase, span, bank }: {
  center: [number, number, number];
  radius: number;
  height: number;
  speed: number;
  phase: number;
  span: number;
  bank: number;
}) {
  const g = useRef<THREE.Group>(null);
  const roll = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = phase + speed * t;
    if (g.current) {
      g.current.position.set(
        center[0] + Math.cos(a) * radius,
        height + Math.sin(t * 0.5 + phase) * 0.5,
        center[2] + Math.sin(a) * radius,
      );
      // heading: face along the circle tangent (model forward is +X)
      g.current.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)) * Math.sign(speed);
    }
    if (roll.current) roll.current.rotation.x = bank * Math.sign(speed); // lean into the turn
    // faint flap
    const flap = Math.sin(t * 3 + phase) * 0.12;
    if (wingR.current) wingR.current.rotation.x = -0.25 + flap;
    if (wingL.current) wingL.current.rotation.x = 0.25 - flap;
  });
  return (
    <group ref={g} position={[center[0] + radius, height, center[2]]}>
      <group ref={roll}>
        <GullMesh span={span} wingR={wingR} wingL={wingL} />
      </group>
    </group>
  );
}

const GULLS: { center: [number, number, number]; radius: number; height: number; speed: number; phase: number; span: number; bank: number }[] = [
  { center: [-6, 31, 4], radius: 5.5, height: 31, speed: 0.22, phase: 0.0, span: 1.0, bank: 0.4 },
  { center: [8, 29, 8], radius: 6.5, height: 29, speed: -0.18, phase: 2.1, span: 1.2, bank: 0.45 },
  { center: [1, 34, -2], radius: 7.5, height: 34, speed: 0.15, phase: 4.0, span: 0.85, bank: 0.35 },
  { center: [11, 27, 3], radius: 4.5, height: 27, speed: -0.26, phase: 1.2, span: 1.1, bank: 0.5 },
];

export function Birds() {
  return (
    <>
      {GULLS.map((g, i) => (
        <Gull key={i} {...g} />
      ))}
    </>
  );
}
