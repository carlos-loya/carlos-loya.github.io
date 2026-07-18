import { useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { mat, PAL, Tree } from "./props";
import { ModelTree, ModelGreenhouse } from "./models";
import { techPets, type TechPet } from "../content/garden";

// L2 THE YARD — the Tech Toolkit Garden. A bright low-poly lawn with a glass
// greenhouse, dirt beds, and a pond where Carlos's core stack lives as animated
// "tech pets". Hovering a pet squashes it and pops a 3D speech bubble. Flat-shaded
// primitives only; global lighting (warm sun + lavender/blue hemisphere) is shared
// with the sky scene. Sits on the yard ground (y≈0), forward of the door corridor
// so the descent flies over it into the house.

const GROUND_Y = 0;
const pet = (k: TechPet["key"]) => techPets.find((p) => p.key === k)!;
// toy-like flat material per the spec (rough 0.8 / metal 0.1), shared via mat()'s cache
const pmat = (c: string) => mat(c, { rough: 0.8, metal: 0.1 });

// ── environment ─────────────────────────────────────────────────────

// A round dirt bed / mound (flowerbeds where the pets live).
function Bed({ position, r = 1.2, mound = false }: { position: [number, number, number]; r?: number; mound?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} material={mat(PAL.dirt)} receiveShadow>
        <cylinderGeometry args={[r, r + 0.15, 0.12, 9]} />
      </mesh>
      {mound && (
        <mesh position={[0, 0.22, 0]} material={mat(PAL.dirtDark)} castShadow>
          <sphereGeometry args={[r * 0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      )}
    </group>
  );
}

// A small faceted low-poly hill, for framing the lawn edges.
function Hill({ position, r = 3, h = 1.4 }: { position: [number, number, number]; r?: number; h?: number }) {
  return (
    <mesh position={position} material={mat(PAL.grass)} receiveShadow castShadow>
      <coneGeometry args={[r, h, 7]} />
    </mesh>
  );
}

// ── the hover speech bubble + pet wrapper ───────────────────────────

function SpeechBubble({ y, tech, blurb }: { y: number; tech: string; blurb: string }) {
  return (
    <Billboard position={[0, y, 0]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.7, 1.15]} />
        <meshBasicMaterial color="#fdf8ee" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0.01]}>
        <planeGeometry args={[2.7, 0.32]} />
        <meshBasicMaterial color={PAL.balloon} toneMapped={false} />
      </mesh>
      {/* little downward tail */}
      <mesh position={[0, -0.62, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshBasicMaterial color="#fdf8ee" toneMapped={false} />
      </mesh>
      <Text position={[0, 0.42, 0.02]} fontSize={0.2} color="#fff" anchorX="center" anchorY="middle" maxWidth={2.5}>
        {tech}
      </Text>
      <Text position={[0, -0.12, 0.02]} fontSize={0.19} color="#33383f" anchorX="center" anchorY="middle" maxWidth={2.4} textAlign="center">
        {blurb}
      </Text>
    </Billboard>
  );
}

// Wraps a pet: pointer hover → playful squash/stretch + speech bubble. Hover only
// (no click) sidesteps the ScrollControls click-through gotcha. The inner pet
// animates its own transform; this only scales an intermediate group.
export function Pet({ position, bubbleY, tech, blurb, hitR = 1.3, hitY = 0.6, children }: {
  position: [number, number, number];
  bubbleY: number;
  tech: string;
  blurb: string;
  hitR?: number; // generous invisible hover radius (pets are small/thin/moving)
  hitY?: number; // vertical centre of the hit sphere
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const k = Math.min(dt * 10, 1);
    const s = g.current.scale;
    // squash-and-stretch: wider + a touch shorter on hover
    s.x += ((hovered ? 1.22 : 1) - s.x) * k;
    s.z += ((hovered ? 1.22 : 1) - s.z) * k;
    s.y += ((hovered ? 1.12 : 1) - s.y) * k;
  });
  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={g}>{children}</group>
      {/* invisible, generous pick target so thin/moving pets are easy to hover */}
      <mesh position={[0, hitY, 0]}>
        <sphereGeometry args={[hitR, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && <SpeechBubble y={bubbleY} tech={tech} blurb={blurb} />}
    </group>
  );
}

// ── the four tech pets ──────────────────────────────────────────────

// Go gopher: chubby brown capsule with ears + buck teeth. Burrows in/out of its
// mound (abs(sin) hop: up, small turn, sink back down).
function Gopher() {
  const g = useRef<THREE.Group>(null);
  const c = pet("go").color;
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime * 0.8;
    const up = Math.abs(Math.sin(t)); // 0 (buried) → 1 (popped up)
    g.current.position.y = -0.5 + up * 0.85;
    g.current.rotation.y = Math.sin(t * 0.5) * 0.5;
  });
  return (
    <group ref={g}>
      <mesh material={pmat(c)} castShadow>
        <capsuleGeometry args={[0.34, 0.4, 4, 10]} />
      </mesh>
      <mesh position={[0, 0.02, 0.3]} material={pmat("#c98f63")}>
        <capsuleGeometry args={[0.24, 0.32, 4, 10]} />
      </mesh>
      {/* ears */}
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} material={pmat(c)} castShadow>
          <sphereGeometry args={[0.11, 8, 8]} />
        </mesh>
      ))}
      {/* eyes */}
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.16, 0.34]} material={mat("#2a2320")}>
          <sphereGeometry args={[0.045, 6, 6]} />
        </mesh>
      ))}
      {/* buck teeth */}
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, -0.02, 0.36]} material={mat("#fdfdfd")}>
          <boxGeometry args={[0.07, 0.11, 0.04]} />
        </mesh>
      ))}
    </group>
  );
}

// Kubernetes: a flat blue heptagon helm — hub + ring + 7 spokes. Hovers (Y-bob)
// while the whole wheel spins on Z.
function K8sHelm() {
  const g = useRef<THREE.Group>(null);
  const c = pet("k8s").color;
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.position.y = Math.sin(t * 1.2) * 0.16;
    g.current.rotation.z = t * 1.4;
  });
  const spokes = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), []);
  return (
    <group ref={g} rotation={[Math.PI / 2, 0, 0]}>
      {/* heptagon plate */}
      <mesh material={pmat(c)} castShadow>
        <cylinderGeometry args={[0.62, 0.62, 0.1, 7]} />
      </mesh>
      {/* hub */}
      <mesh position={[0, 0.06, 0]} material={pmat("#eaf1ff")}>
        <cylinderGeometry args={[0.16, 0.16, 0.14, 7]} />
      </mesh>
      {/* spokes poking out past the rim */}
      {spokes.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.7, 0.02, Math.sin(a) * 0.7]} rotation={[0, -a, 0]} material={pmat("#eaf1ff")}>
          <boxGeometry args={[0.22, 0.08, 0.07]} />
        </mesh>
      ))}
    </group>
  );
}

// React: a central sphere with three interlocking angled orbital rings, spinning
// fast like a sprinkler and flinging fading sparkle particles upward.
const SPARK_GEO = new THREE.OctahedronGeometry(0.07, 0);
const SPARK_MAT = new THREE.MeshBasicMaterial({ color: "#fff3b0", toneMapped: false, transparent: true });
const SPARK_N = 9;

function ReactSprinkler() {
  const spin = useRef<THREE.Group>(null);
  const c = pet("react").color;
  const sparks = useMemo(
    () =>
      Array.from({ length: SPARK_N }, (_, i) => ({
        ref: { current: null as THREE.Mesh | null },
        age: (i / SPARK_N) * 1.4,
        life: 1.1 + Math.random() * 0.5,
        a: Math.random() * Math.PI * 2,
        speed: 1.6 + Math.random() * 0.8,
      })),
    [],
  );
  useFrame((state, dt) => {
    if (spin.current) spin.current.rotation.y = state.clock.elapsedTime * 3;
    for (const s of sparks) {
      s.age += dt;
      if (s.age > s.life) { s.age = 0; s.a = Math.random() * Math.PI * 2; }
      const p = s.age / s.life;
      const m = s.ref.current;
      if (!m) continue;
      const rad = 0.25 + p * 0.5;
      m.position.set(Math.cos(s.a) * rad, 0.9 + p * s.speed, Math.sin(s.a) * rad);
      const sc = Math.max(0, 1 - p); // shrink → fade (one shared material)
      m.scale.setScalar(sc);
    }
  });
  const rings: [number, number, number][] = [
    [0, 0, 0],
    [0, 0, (Math.PI / 3) * 2],
    [0, 0, (Math.PI / 3) * 4],
  ];
  return (
    <group>
      <group ref={spin} position={[0, 0.9, 0]}>
        <mesh material={pmat("#2b5f7a")}>
          <sphereGeometry args={[0.16, 12, 12]} />
        </mesh>
        {rings.map((rot, i) => (
          <mesh key={i} rotation={rot} material={pmat(c)}>
            <torusGeometry args={[0.42, 0.045, 6, 20]} />
          </mesh>
        ))}
      </group>
      {sparks.map((s, i) => (
        <mesh key={i} ref={(el) => (s.ref.current = el)} geometry={SPARK_GEO} material={SPARK_MAT} />
      ))}
    </group>
  );
}

// Docker whale: a blocky blue whale carrying containers, swimming a slow circle in
// the pond and tilting as it goes.
function DockerWhale({ radius = 1.5 }: { radius?: number }) {
  const g = useRef<THREE.Group>(null);
  const c = pet("docker").color;
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const a = t * 0.5;
    g.current.position.set(Math.cos(a) * radius, 0.16 + Math.sin(t * 2) * 0.04, Math.sin(a) * radius);
    g.current.rotation.y = -a - Math.PI / 2;
    g.current.rotation.x = Math.sin(t * 2) * 0.08;
  });
  return (
    <group ref={g}>
      {/* body — a horizontal capsule (length along +x, the travel axis) */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={pmat(c)} castShadow>
        <capsuleGeometry args={[0.3, 0.7, 4, 10]} />
      </mesh>
      {/* tail */}
      <mesh position={[-0.55, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} material={pmat(c)}>
        <coneGeometry args={[0.22, 0.3, 4]} />
      </mesh>
      {/* little containers on its back */}
      {[-0.15, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.34, i ? 0.1 : -0.1]} material={pmat(i ? "#eac452" : "#e07a5f")}>
          <boxGeometry args={[0.2, 0.16, 0.18]} />
        </mesh>
      ))}
      {/* eye */}
      <mesh position={[0.42, 0.12, 0.22]} material={mat("#20303a")}>
        <sphereGeometry args={[0.05, 6, 6]} />
      </mesh>
    </group>
  );
}

// ── the assembled garden ────────────────────────────────────────────

export function Garden() {
  return (
    <group>
      <ModelGreenhouse position={[0, GROUND_Y, 14]} height={4} />

      {/* framing hills + a couple of extra trees at the yard edges */}
      <Hill position={[-13, GROUND_Y - 0.3, 16]} r={4} h={2} />
      <Hill position={[14, GROUND_Y - 0.3, 17]} r={3.4} h={1.7} />
      <ModelTree position={[-8, GROUND_Y, 18]} height={4.2} yaw={0.6} />
      <ModelTree position={[9, GROUND_Y, 19]} height={3.6} yaw={2} />
      <Tree position={[6.5, GROUND_Y, 11]} scale={1.1} />

      {/* Go gopher on its mound (front-left) */}
      <Bed position={[-4.2, GROUND_Y, 11]} r={1} mound />
      <Pet position={[-4.2, GROUND_Y + 0.55, 11]} bubbleY={1.7} tech={pet("go").tech} blurb={pet("go").blurb}>
        <Gopher />
      </Pet>

      {/* Kubernetes helm hovering (right) */}
      <Bed position={[4.6, GROUND_Y, 11.5]} r={0.9} />
      <Pet position={[4.6, GROUND_Y + 1.5, 11.5]} bubbleY={1.5} tech={pet("k8s").tech} blurb={pet("k8s").blurb}>
        <K8sHelm />
      </Pet>

      {/* React sprinkler on a bed inside the greenhouse (back-right) */}
      <Bed position={[1.8, GROUND_Y, 14.5]} r={1} />
      <Pet position={[1.8, GROUND_Y, 14.5]} bubbleY={2.1} hitY={0.9} tech={pet("react").tech} blurb={pet("react").blurb}>
        <ReactSprinkler />
      </Pet>

      {/* Docker whale in a pond (back-left) */}
      <mesh position={[-5.4, GROUND_Y + 0.06, 15.5]} material={mat(PAL.water, { rough: 0.35 })} receiveShadow>
        <cylinderGeometry args={[2.3, 2.1, 0.14, 14]} />
      </mesh>
      <Pet position={[-5.4, GROUND_Y + 0.1, 15.5]} bubbleY={1.6} hitR={2.3} hitY={0.3} tech={pet("docker").tech} blurb={pet("docker").blurb}>
        <DockerWhale radius={1.4} />
      </Pet>
    </group>
  );
}
