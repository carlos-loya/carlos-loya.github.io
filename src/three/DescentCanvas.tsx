import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { camOrbit, orbitAngle, interiorT, roadPoint, shotPoint, ARRIVE, SKY_IN_END, INTERIOR, SKY_POS, FOCUS, PAD_A, GARDEN_DX, SHED_DX, GARDEN_SHOT, SHED_SHOT, GARDEN_GAZE, SHED_GAZE, DRIVE_GAZE, DRIVE_LOOK, HALL_GAZE, HALL_WALL_X, HERO_GAZE, PLANET } from "./path";
import { World } from "./structures";
import { Birds } from "./Birds";
import { Skydome } from "./Sky";
import { CinematicContent } from "./CinematicContent";

// Flies the camera down PATH from the scroll offset. The chapter plateaus in
// orbitAngle/interiorT (path.ts CHAPTERS) hold it locked at each beat.
// In the hall of fame the look turns to the −x wall so the site
// monitors pass head-on; at the end it settles onto the seated figure. A damped
// pointer offset gives parallax. ScrollControls damping is the momentum.
// ?still disables the mouse parallax (stable screenshots / no-jitter preview).
const STILL = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("still");

const X_AXIS = new THREE.Vector3(1, 0, 0);

function CameraRig() {
  const scroll = useScroll();
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);
  const heroT = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  // scratch for the sky-in arc (offset dirs from the planet center + slerp quats)
  const v0 = useMemo(() => new THREE.Vector3(), []);
  const v1 = useMemo(() => new THREE.Vector3(), []);
  const qA = useMemo(() => new THREE.Quaternion(), []);
  const qB = useMemo(() => new THREE.Quaternion(), []);
  const parallax = useRef(new THREE.Vector2());
  useFrame((state, dt) => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1);

    if (o < ARRIVE) {
      // ORBIT the planet: look target is the pad's real position (always framed).
      camOrbit(o, tmp);
      // sky-in: swoop from the high hero vantage into the garden orbit over
      // [0, SKY_IN_END]. A straight lerp would cut THROUGH the (large) globe, so
      // instead arc AROUND it: slerp the offset direction from the planet center
      // and ease the radius down — the camera stays a constant orbit-radius
      // clear of the surface the whole way.
      const k = THREE.MathUtils.smoothstep(o, 0, SKY_IN_END);
      if (k >= 1) {
        pos.copy(tmp);
      } else {
        v0.copy(SKY_POS).sub(PLANET.center);
        v1.copy(tmp).sub(PLANET.center);
        const len = THREE.MathUtils.lerp(v0.length(), v1.length(), k);
        v0.normalize();
        v1.normalize();
        qB.setFromUnitVectors(v0, v1);
        qA.identity().slerp(qB, k);
        pos.copy(v0).applyQuaternion(qA).multiplyScalar(len).add(PLANET.center);
      }
      roadPoint(orbitAngle(o), look);
      // ease into the interior entry just before arrival, so the hand-off is seamless
      const seam = THREE.MathUtils.smoothstep(o, ARRIVE - 0.1, ARRIVE);
      if (seam > 0) {
        INTERIOR.getPoint(0, tmp2);
        pos.lerp(tmp2, seam);
        INTERIOR.getPoint(0.05, tmp2);
        look.lerp(tmp2, seam);
      }
    } else {
      // INTERIOR flight (door → gallery → desk): world-space curve sampled by
      // interiorT — plateaus hold the camera through the driveway/gallery chapters.
      const t = interiorT(o);
      INTERIOR.getPoint(THREE.MathUtils.clamp(t, 0, 1), pos);
      INTERIOR.getPoint(Math.min(t + 0.05, 1), look);
    }

    // hero: at the very top, gaze out level over the clouds
    const hero = 1 - THREE.MathUtils.smoothstep(o, 0.02, HERO_GAZE);
    if (hero > 0) {
      heroT.set(pos.x * 0.4, pos.y - 1.5, pos.z - 28);
      look.lerp(heroT, hero);
    }
    // garden (L1) then shed (L2): the camera eases OFF the trail into a composed
    // head-on shot of each scene — position swings across the road (camDx) while
    // the gaze lands on the scene center — then rejoins the road as the envelope
    // fades. The chapter plateau holds the shot for the whole hold window.
    const gg =
      THREE.MathUtils.smoothstep(o, GARDEN_GAZE.from, GARDEN_GAZE.from + 0.05) *
      (1 - THREE.MathUtils.smoothstep(o, GARDEN_GAZE.to - 0.05, GARDEN_GAZE.to));
    if (gg > 0) {
      pos.lerp(shotPoint(PAD_A.garden, GARDEN_SHOT.camDx, GARDEN_SHOT.camH, tmp2), gg);
      look.lerp(shotPoint(PAD_A.garden, GARDEN_DX, GARDEN_SHOT.lookH, tmp2), gg);
    }
    const sg =
      THREE.MathUtils.smoothstep(o, SHED_GAZE.from, SHED_GAZE.from + 0.05) *
      (1 - THREE.MathUtils.smoothstep(o, SHED_GAZE.to - 0.05, SHED_GAZE.to));
    if (sg > 0) {
      pos.lerp(shotPoint(PAD_A.workshop, SHED_SHOT.camDx, SHED_SHOT.camH, tmp2), sg);
      look.lerp(shotPoint(PAD_A.workshop, SHED_DX, SHED_SHOT.lookH, tmp2), sg);
    }
    // driveway: turn the gaze onto the truck + boxes as we arrive at the house
    const dg =
      THREE.MathUtils.smoothstep(o, DRIVE_GAZE.from, DRIVE_GAZE.from + 0.05) *
      (1 - THREE.MathUtils.smoothstep(o, DRIVE_GAZE.to - 0.05, DRIVE_GAZE.to));
    look.lerp(DRIVE_LOOK, dg);
    // gallery: ease the gaze onto the +x frame wall (wide, soft ramp)
    const g =
      THREE.MathUtils.smoothstep(o, HALL_GAZE.from, HALL_GAZE.from + 0.06) *
      (1 - THREE.MathUtils.smoothstep(o, HALL_GAZE.to - 0.06, HALL_GAZE.to));
    side.set(HALL_WALL_X, 1.9, pos.z);
    look.lerp(side, g);
    // settle onto the seated figure as we turn into the office wing
    look.lerp(FOCUS, THREE.MathUtils.smoothstep(o, 0.92, 1));

    // ROLL the camera's up with the orbit tilt (blended in with the sky-in), so
    // the far side of the planet renders right-side-up and the horizon rolls as
    // we travel around the world. Exactly +Y at the hero (blend 0) and from
    // arrival on (orbitAngle 0) — hero + interior framing untouched.
    const aCam = THREE.MathUtils.smoothstep(o, 0, SKY_IN_END) * orbitAngle(o);
    up.set(0, 1, 0).applyAxisAngle(X_AXIS, aCam);

    if (!STILL) {
      const k = Math.min(dt * 3, 1);
      parallax.current.x += (state.pointer.x - parallax.current.x) * k;
      parallax.current.y += (state.pointer.y - parallax.current.y) * k;
      // roll is about X, so screen-right stays world ±X; vertical follows the roll
      pos.x += parallax.current.x * 1.4;
      pos.addScaledVector(up, parallax.current.y * 0.9);
    }
    state.camera.up.copy(up);
    state.camera.position.copy(pos);
    state.camera.lookAt(look);

    // DEV-ONLY camera introspection for Playwright tuning (remove when done).
    if (import.meta.env.DEV) {
      (window as THREE_WIN).__rig = {
        o,
        pos: pos.toArray(),
        look: look.toArray(),
        scene: state.scene,
        THREE,
      };
    }
  });
  return null;
}

type THREE_WIN = Window & { __rig?: unknown };

// Sun + hemisphere + skydome ride the camera's orbit: the whole sky rig rotates
// about the planet center by the camera's tilt, so every beat around the sphere
// is lit (and shadowed) like the house is at rest, and the sky gradient stays
// upright however far around the world the camera is. Identity at the hero
// (blend 0) and from arrival on (orbitAngle 0) — those beats light exactly as
// authored. The light's target rides the rig at the local apex, so the ±34
// shadow frustum always brackets the beat the camera is looking at.
function SkyRig() {
  const scroll = useScroll();
  const g = useRef<THREE.Group>(null);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const o = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    if (g.current) g.current.rotation.x = THREE.MathUtils.smoothstep(o, 0, SKY_IN_END) * orbitAngle(o);
  });
  return (
    <group position={[PLANET.center.x, PLANET.center.y, PLANET.center.z]}>
      <group ref={g}>
        <group position={[-PLANET.center.x, -PLANET.center.y, -PLANET.center.z]}>
          {/* cool lavender/blue sky+ground ambient so shadowed cloud facets pop cool,
              against the warm upper-left sun that lights the facing facets */}
          <hemisphereLight args={["#a2d2ff", "#b19ffb", 1.15]} />
          <directionalLight
            position={[-26, 44, 18]}
            target={lightTarget}
            intensity={2.8}
            color="#ffdfa9"
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
          <primitive object={lightTarget} position={[0, 0, -6]} />
          <Skydome />
        </group>
      </group>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#8fc2e6"]} />
      {/* dense exp fog: hides the far house from the high hero camera, then parts
          as the descent flies down toward it (colour reads with the horizon) */}
      <fogExp2 attach="fog" args={["#dfe4ea", 0.032]} />
      {/* interior fill lights ride the house pad (structures.tsx HousePad) */}
      <SkyRig />
      <Birds />
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
//
// Do NOT set Canvas eventSource on a parent wrapper: r3f then applies
// pointer-events:none to the canvas root, and ScrollControls' overflow div lives
// inside that root — wheel never hits it and the flight freezes on the hero.
// ScrollControls already reconnects r3f events to its scroll element for 3D
// hover/click; keep HTML layers pointer-events:none (see Scroll html + content).
export function CinematicDescent() {
  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 40, 22], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor("#8fc2e6")}
      >
        <ScrollControls pages={12} damping={0.28}>
          <Scene />
          <Scroll html style={{ width: "100%", pointerEvents: "none" }}>
            <CinematicContent />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
