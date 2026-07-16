import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { PATH, CORE_Y, SHAFT_TOP, SHAFT_BOTTOM } from "./path";
import { Structures } from "./structures";
import { CinematicContent } from "./CinematicContent";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Static dust filling the shaft — parallax depth cue.
function Dust() {
  const positions = useMemo(() => {
    const N = 800;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 11;
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
      <pointsMaterial size={0.04} color="#6a7480" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Data running down the shaft.
function DataStream() {
  const N = 600;
  const { positions, speed } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 1.5 + Math.random() * 7;
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
      <pointsMaterial size={0.07} color="#e8102a" transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// The reactor core at the bottom — the only saturated light.
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
      <pointLight color="#e8102a" intensity={45} distance={26} decay={1.6} />
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

// Flies the camera along PATH from the scroll offset, looking ahead so the
// next structure is visible before arrival. ScrollControls damping supplies
// the momentum/weight.
function CameraRig() {
  const scroll = useScroll();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    PATH.getPoint(o, pos);
    PATH.getPoint(Math.min(o + 0.045, 1), look);
    state.camera.position.copy(pos);
    state.camera.lookAt(look);
  });
  return null;
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#08090c", 8, 30]} />
      <ambientLight intensity={0.4} />
      <Dust />
      <DataStream />
      <Structures />
      <Core />
      <CameraRig />
    </>
  );
}

// The cinematic descent: one flight through 3D space, with the content
// scrolling in sync via <Scroll html>. Desktop-only (gated by useEnable3D),
// lazy-loaded. Mobile / reduced-motion get the static DOM site instead.
export function CinematicDescent() {
  return (
    <div className="fixed inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 13], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor("#08090c")}
      >
        <ScrollControls pages={6} damping={0.28}>
          <Scene />
          <Scroll html style={{ width: "100%" }}>
            <CinematicContent />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
