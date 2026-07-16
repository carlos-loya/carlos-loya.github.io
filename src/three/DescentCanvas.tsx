import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useScroll, type MotionValue } from "framer-motion";
import * as THREE from "three";

// ── descent geometry ────────────────────────────────────────────────
// Camera falls from CAM_TOP to CAM_BOTTOM as scroll goes 0→1. The six
// layer "floors" and the core are placed along that shaft so you pass
// through them on the way down.
const CAM_TOP = 3;
const CAM_BOTTOM = -58;
const SHAFT_TOP = CAM_TOP + 4;
const FLOORS = [0, -11, -22, -33, -44, -55]; // one per L0…L5
const CORE_Y = -60;
const SHAFT_BOTTOM = CORE_Y - 2;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Static dust filling the shaft — slow parallax depth cue.
function Dust() {
  const positions = useMemo(() => {
    const N = 700;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 9;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = lerp(SHAFT_TOP, SHAFT_BOTTOM, Math.random());
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6a7480"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Data running down the shaft — motes that fall and wrap. The literal
// "systems the data runs on," in motion.
function DataStream() {
  const N = 500;
  const { positions, speed } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 1.5 + Math.random() * 6.5;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = lerp(SHAFT_TOP, SHAFT_BOTTOM, Math.random());
      positions[i * 3 + 2] = Math.sin(a) * r;
      speed[i] = 3 + Math.random() * 7;
    }
    return { positions, speed };
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const p = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] -= speed[i] * dt;
      if (p[i * 3 + 1] < SHAFT_BOTTOM) p[i * 3 + 1] = SHAFT_TOP;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#e8102a"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// A horizontal wireframe floor at each layer. The floor nearest the
// camera lights crimson, tying the scene to the layer you're reading.
function Floor({ y, i }: { y: number; i: number }) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (group.current) group.current.rotation.z += dt * 0.03 * (i % 2 ? 1 : -1);
    const near = 1 - Math.min(Math.abs(state.camera.position.y - y) / 7, 1);
    if (marker.current) marker.current.scale.setScalar(1 + near * 4);
    const om = outer.current?.material as THREE.MeshBasicMaterial | undefined;
    if (om) om.color.setRGB(lerp(0.11, 0.9, near), lerp(0.14, 0.06, near), lerp(0.18, 0.16, near));
  });
  return (
    <group ref={group} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={outer}>
        <ringGeometry args={[3.4, 3.5, 64]} />
        <meshBasicMaterial color="#2a323f" side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[5.4, 5.42, 6]} />
        <meshBasicMaterial color="#1d242e" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={marker}>
        <ringGeometry args={[0.15, 0.18, 20]} />
        <meshBasicMaterial color="#e8102a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// The core at the bottom — the only saturated light in the scene.
function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.15;
      ref.current.rotation.y += dt * 0.2;
    }
  });
  return (
    <group position={[0, CORE_Y, 0]}>
      <pointLight color="#e8102a" intensity={40} distance={24} decay={1.6} />
      {/* additive halos fake a bloom glow without a postprocessing pass */}
      <mesh scale={5.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#e8102a" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={3}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#e8102a" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="#ff3347" wireframe />
      </mesh>
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color="#ff5566" />
      </mesh>
    </group>
  );
}

// Drives the camera down the shaft, and warms the fog toward crimson
// as the core approaches.
function Rig({ progress }: { progress: MotionValue<number> }) {
  const scene = useThree((s) => s.scene);
  useFrame((state) => {
    const p = progress.get();
    const cam = state.camera;
    cam.position.y = lerp(CAM_TOP, CAM_BOTTOM, p);
    cam.position.x = Math.sin(p * Math.PI * 2) * 1.2; // gentle sway
    cam.lookAt(0, cam.position.y - 4, 0); // look down the shaft
    const warm = Math.max(0, p - 0.6) / 0.4; // last 40% of the descent
    if (scene.fog) {
      (scene.fog as THREE.Fog).color.setRGB(
        lerp(0.031, 0.14, warm),
        lerp(0.035, 0.02, warm),
        lerp(0.047, 0.04, warm),
      );
    }
  });
  return null;
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <fog attach="fog" args={["#08090c", 6, 26]} />
      <ambientLight intensity={0.4} />
      <Dust />
      <DataStream />
      {FLOORS.map((y, i) => (
        <Floor key={y} y={y} i={i} />
      ))}
      <Core />
      <Rig progress={progress} />
    </>
  );
}

export function DescentCanvas() {
  const { scrollYProgress } = useScroll();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, CAM_TOP, 11], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor("#08090c")}
      >
        <Scene progress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
