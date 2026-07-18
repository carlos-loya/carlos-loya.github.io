import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mat, PAL, Slab } from "./props";
import { Pet } from "./Garden";
import { rigs, type Rig } from "../content/workshop";

// L2 THE WORKSHOP — a rustic wooden shed housing three mechanical rigs that
// physically represent Carlos's shipped systems (experience[0]). Each rig is a
// cheap useFrame transform animation (no shaders); hovering pops the reused
// Garden `Pet` speech bubble. Sits on the workshop pad (structures.tsx), open
// front toward the descending camera.

const GROUND_Y = 0;
const rig = (k: Rig["key"]) => rigs.find((r) => r.key === k)!;
// warmer/greyer machine tones
const STEEL = "#8b929b";
const BRONZE = "#b87333";
const SILVER = "#cdd3da";
const GOLD = "#f4c542";

// A rustic shed: plank walls (leave the +z front open), gable roof from two
// angled slabs (like the house MainRoof), a back wall with a little window.
function Shed({ w = 9, d = 6, wallH = 3 }: { w?: number; d?: number; wallH?: number }) {
  const hw = w / 2;
  const wood = PAL.deskWood;
  const beam = PAL.trunk;
  const ang = 0.5;
  const panelW = hw + 0.5;
  const H = panelW * Math.tan(ang);
  const panelLen = panelW / Math.cos(ang);
  return (
    <group>
      {/* plank floor */}
      <mesh position={[0, 0.03, 0]} material={mat(wood)} receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
      </mesh>
      {/* back + side walls (front, +z, left open as the doorway) */}
      <Slab size={[w, wallH, 0.2]} position={[0, wallH / 2, -d / 2]} color={wood} />
      <Slab size={[0.2, wallH, d]} position={[-hw, wallH / 2, 0]} color={wood} />
      <Slab size={[0.2, wallH, d]} position={[hw, wallH / 2, 0]} color={wood} />
      {/* corner posts for a timber look */}
      {([[-hw, -d / 2], [hw, -d / 2], [-hw, d / 2], [hw, d / 2]] as const).map(([x, z], i) => (
        <mesh key={i} position={[x, wallH / 2, z]} material={mat(beam)} castShadow>
          <boxGeometry args={[0.24, wallH, 0.24]} />
        </mesh>
      ))}
      {/* gable roof */}
      <mesh position={[-panelW / 2, wallH + H / 2, 0]} rotation={[0, 0, ang]} material={mat(PAL.roofC)} castShadow>
        <boxGeometry args={[panelLen, 0.2, d + 0.8]} />
      </mesh>
      <mesh position={[panelW / 2, wallH + H / 2, 0]} rotation={[0, 0, -ang]} material={mat(PAL.roofC)} castShadow>
        <boxGeometry args={[panelLen, 0.2, d + 0.8]} />
      </mesh>
      {/* little window on the back wall */}
      <mesh position={[0, wallH * 0.62, -d / 2 + 0.12]}>
        <planeGeometry args={[1.2, 1]} />
        <meshBasicMaterial color={PAL.screenGlow} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── the three rigs ──────────────────────────────────────────────────

// K8s archival operator: a gantry piston stamps a block down into a bin on a
// steady cycle (rows getting archived away).
function OperatorRig() {
  const arm = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!arm.current) return;
    const y = Math.abs(Math.sin(s.clock.elapsedTime * 1.3)); // 0 (up) → 1 (stamped)
    arm.current.position.y = 1.5 - y * 0.95;
  });
  return (
    <group>
      {/* gantry frame */}
      <mesh position={[0, 1.95, 0]} material={mat(STEEL)}>
        <boxGeometry args={[1.5, 0.14, 0.34]} />
      </mesh>
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 1, 0]} material={mat(STEEL)}>
          <boxGeometry args={[0.14, 2, 0.14]} />
        </mesh>
      ))}
      {/* piston + carried block */}
      <group ref={arm} position={[0, 1.5, 0]}>
        <mesh material={mat(PAL.metal)}>
          <boxGeometry args={[0.2, 0.75, 0.2]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={mat(PAL.roofB)} castShadow>
          <boxGeometry args={[0.42, 0.36, 0.42]} />
        </mesh>
      </group>
      {/* collection bin */}
      <mesh position={[0, 0.3, 0]} material={mat(PAL.deskWood)} castShadow>
        <boxGeometry args={[0.72, 0.55, 0.72]} />
      </mesh>
    </group>
  );
}

// Water-quality platform: a tank with a pipe/valve and a gauge whose needle
// sweeps back and forth (readings coming in).
function WaterRig() {
  const needle = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (needle.current) needle.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.4) * 1.1;
  });
  return (
    <group>
      {/* tank */}
      <mesh position={[0, 0.85, 0]} material={mat(PAL.water, { rough: 0.4 })} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.5, 14]} />
      </mesh>
      <mesh position={[0, 1.6, 0]} material={mat(STEEL)}>
        <cylinderGeometry args={[0.58, 0.58, 0.14, 14]} />
      </mesh>
      {/* outlet pipe + valve wheel */}
      <mesh position={[0.65, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} material={mat(PAL.metal)}>
        <cylinderGeometry args={[0.09, 0.09, 0.6, 8]} />
      </mesh>
      <mesh position={[0.95, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(PAL.roofA)}>
        <torusGeometry args={[0.16, 0.04, 6, 12]} />
      </mesh>
      {/* gauge dial facing the camera (+z) with a sweeping needle */}
      <group position={[0, 1.15, 0.57]}>
        <mesh material={mat("#fdf8ee")}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        </mesh>
        <group ref={needle}>
          <mesh position={[0, 0.12, 0.03]} material={mat(PAL.balloon)}>
            <boxGeometry args={[0.03, 0.24, 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Medallion ETL: a conveyor belt carrying bronze → silver → gold cubes that
// travel along +x and wrap back, upgrading in colour as they go.
const MEDALS = [BRONZE, SILVER, GOLD];
function EtlRig() {
  const cubes = useRef<(THREE.Mesh | null)[]>([]);
  const span = 2.6;
  useFrame((_, dt) => {
    for (const m of cubes.current) {
      if (!m) continue;
      m.position.x += dt * 0.8;
      if (m.position.x > span / 2) m.position.x = -span / 2;
    }
  });
  return (
    <group>
      {/* belt + rollers */}
      <mesh position={[0, 0.55, 0]} material={mat("#3a3f46")} castShadow>
        <boxGeometry args={[span, 0.12, 0.7]} />
      </mesh>
      {[-span / 2, span / 2].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat(STEEL)}>
          <cylinderGeometry args={[0.18, 0.18, 0.72, 10]} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => (cubes.current[i] = el)}
          position={[-span / 2 + (i * span) / 3, 0.78, 0]}
          material={mat(MEDALS[i])}
          castShadow
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
        </mesh>
      ))}
      {/* legs */}
      {[-span / 2 + 0.2, span / 2 - 0.2].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} material={mat(PAL.deskWood)}>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

export function Workshop() {
  return (
    <group>
      <Shed />
      {/* three rigs in a row on the shed floor, each hover-wrapped */}
      <Pet position={[-2.7, GROUND_Y, 0.2]} bubbleY={2.9} hitR={1.5} hitY={1} tech={rig("operator").tech} blurb={rig("operator").blurb}>
        <OperatorRig />
      </Pet>
      <Pet position={[0, GROUND_Y, 0.2]} bubbleY={2.6} hitR={1.4} hitY={1} tech={rig("waterquality").tech} blurb={rig("waterquality").blurb}>
        <WaterRig />
      </Pet>
      <Pet position={[2.7, GROUND_Y, 0.2]} bubbleY={1.9} hitR={1.6} hitY={0.7} tech={rig("etl").tech} blurb={rig("etl").blurb}>
        <EtlRig />
      </Pet>
    </group>
  );
}
