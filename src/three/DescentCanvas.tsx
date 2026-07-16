import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { PATH, FOCUS, easeBeat, HALL_GAZE, HALL_WALL_X } from "./path";
import { World } from "./structures";
import { CinematicContent } from "./CinematicContent";

// Flies the camera down PATH from the scroll offset. easeBeat() makes it dwell at
// each beat. In the hall of fame the look turns to the −x wall so the site
// monitors pass head-on; at the end it settles onto the seated figure. A damped
// pointer offset gives parallax. ScrollControls damping is the momentum.
function CameraRig() {
  const scroll = useScroll();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const parallax = useRef(new THREE.Vector2());
  useFrame((state, dt) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    const e = easeBeat(o);
    PATH.getPoint(e, pos);
    PATH.getPoint(Math.min(e + 0.04, 1), look);
    // hall of fame: turn the gaze to the monitor wall (plateaus at 1 mid-hall)
    const g =
      THREE.MathUtils.smoothstep(o, HALL_GAZE.from, HALL_GAZE.from + 0.05) *
      (1 - THREE.MathUtils.smoothstep(o, HALL_GAZE.to - 0.05, HALL_GAZE.to));
    side.set(HALL_WALL_X, 1.9, pos.z);
    look.lerp(side, g);
    // settle onto the seated figure as we arrive
    look.lerp(FOCUS, THREE.MathUtils.smoothstep(o, 0.92, 1));
    // damped mouse parallax
    const k = Math.min(dt * 3, 1);
    parallax.current.x += (state.pointer.x - parallax.current.x) * k;
    parallax.current.y += (state.pointer.y - parallax.current.y) * k;
    pos.x += parallax.current.x * 1.4;
    pos.y += parallax.current.y * 0.9;
    state.camera.position.copy(pos);
    state.camera.lookAt(look);
  });
  return null;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#bfe4f2"]} />
      <fog attach="fog" args={["#cfe9f4", 34, 108]} />
      <hemisphereLight args={["#dff2ff", "#8fae7a", 1.1]} />
      <directionalLight
        position={[24, 46, 20]}
        intensity={2.4}
        color="#fff3d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-bias={-0.0004}
      />
      {/* interior fill — the roof shadows out the sun, so light the rooms warmly */}
      <pointLight position={[0, 3.4, 2]} intensity={16} distance={13} color="#ffe6c2" />
      <pointLight position={[0, 3.4, -5]} intensity={18} distance={15} color="#fff0d8" />
      <pointLight position={[0, 3.4, -13]} intensity={16} distance={15} color="#ffe6c2" />
      <Suspense fallback={null}>
        <World />
      </Suspense>
      <CameraRig />
    </>
  );
}

// The cinematic descent: one flight down through the low-poly world, with the
// content scrolling in sync via <Scroll html>. Desktop-only (gated by
// useEnable3D), lazy-loaded. Mobile / reduced-motion get the static DOM site.
export function CinematicDescent() {
  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 40, 22], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor("#bfe4f2")}
      >
        <ScrollControls pages={6} damping={0.28}>
          <Scene />
          <Scroll html style={{ width: "100%", pointerEvents: "none" }}>
            <CinematicContent />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
