import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DeskModel, type FocusId, type SceneFraming } from "./DeskModel";
import { MonitorScreen } from "./MonitorScreen";
import { Overlays } from "./Overlays";
import { Curtain } from "./Curtain";
import { useMusic } from "./useMusic";

// Camera framing knobs — tuned by eye against the real model. *_DIR is the
// viewpoint direction (from the subject toward the camera); focusing an object
// zooms in along a similar direction so it reads as "moving closer", not
// teleporting. ponytail: these are THE calibration knobs — adjust live.
const FOV = 40;
const HERO_DIR = new THREE.Vector3(-1, 0.32, 0.4).normalize();
const FOCUS_DIR = new THREE.Vector3(-1, 0.28, 0.45).normalize();
const HERO_FILL = 1.25; // >1 = more padding around the framed subject
const FOCUS_FILL = 1.35;

// The monitor gets its own tighter, head-on framing so the website on the screen
// is clearly readable (the side panel that used to fill half the frame is gone).
const MONITOR_DIR = new THREE.Vector3(-1, 0.14, 0.02).normalize(); // straight-on
const MONITOR_FILL = 1.05; // tight — the screen dominates the frame
const MONITOR_LOOK_UP = 0.18; // raise the look target toward the screen (× box height)

function distanceFor(radius: number, fill: number) {
  return (radius * fill) / Math.sin((FOV * Math.PI) / 360);
}

function CameraRig({
  focus,
  framingRef,
}: {
  focus: FocusId | null;
  framingRef: React.RefObject<SceneFraming | null>;
}) {
  const look = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const center = useRef(new THREE.Vector3());
  const inited = useRef(false);

  useFrame((state, dt) => {
    const f = framingRef.current;
    if (!f) return;
    const t = focus ? f.targets[focus] : undefined;
    const isMon = focus === "monitor";
    center.current.copy(t?.center ?? f.center);
    // Aim a bit higher on the monitor so the screen (not the stand) is centered.
    if (isMon && t) center.current.y += t.size.y * MONITOR_LOOK_UP;
    const radius = t?.radius ?? f.radius;
    const dir = isMon ? MONITOR_DIR : focus ? FOCUS_DIR : HERO_DIR;
    const fill = isMon ? MONITOR_FILL : focus ? FOCUS_FILL : HERO_FILL;
    desired.current.copy(dir).multiplyScalar(distanceFor(radius, fill)).add(center.current);

    // subtle pointer parallax only in the hero view (no focused object)
    if (!focus) {
      desired.current.x += state.pointer.x * radius * 0.06;
      desired.current.y += state.pointer.y * radius * 0.04;
    }

    // framerate-independent damping; snap on the very first frame
    const k = inited.current ? 1 - Math.pow(0.0015, dt) : 1;
    state.camera.position.lerp(desired.current, k);
    if (!inited.current) {
      look.current.copy(center.current);
      inited.current = true;
    }
    look.current.lerp(center.current, k);
    state.camera.lookAt(look.current);

    // DEV-only: project each interactive object to screen px for Playwright
    // tuning/verification. Harmless in prod (stripped by the env guard).
    if (import.meta.env.DEV) {
      const size = state.size;
      const project = (v: THREE.Vector3) => {
        const p = v.clone().project(state.camera);
        return { x: ((p.x + 1) / 2) * size.width, y: ((1 - p.y) / 2) * size.height };
      };
      (window as DeskWin).__desk = {
        monitor: f.targets.monitor && project(f.targets.monitor.center),
        ipod: f.targets.ipod && project(f.targets.ipod.center),
      };
    }
  });
  return null;
}

type DeskWin = Window & { __desk?: Record<string, { x: number; y: number } | undefined> };

export function DeskCanvas() {
  const [focus, setFocus] = useState<FocusId | null>(null);
  // Hover has two independent sources — the 3D pointer and the DOM legend — so they
  // can't stomp each other (leaving the scene fires onHover(null) right as the
  // legend fires onHover(id)). Merge them; the menu wins when both are set.
  const [sceneHover, setSceneHover] = useState<FocusId | null>(null);
  const [menuHover, setMenuHover] = useState<FocusId | null>(null);
  const hover = menuHover ?? sceneHover;
  const [entered, setEntered] = useState(false);
  const music = useMusic(focus);
  const framingRef = useRef<SceneFraming | null>(null);
  // Ref feeds the per-frame rig; state re-renders the in-canvas MonitorScreen once
  // the monitor box is measured.
  const [framing, setFraming] = useState<SceneFraming | null>(null);
  const onReady = useCallback((f: SceneFraming) => {
    framingRef.current = f;
    setFraming(f);
  }, []);

  // ESC returns to the hero view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0e0f13]">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [4, 3, 6], fov: FOV }}
        gl={{ antialias: true }}
        onPointerMissed={() => setFocus(null)}
      >
        <color attach="background" args={["#0e0f13"]} />
        <hemisphereLight args={["#ffffff", "#3a3a46", 1.1]} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={2.1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, 5, -4]} intensity={0.5} />
        <Suspense fallback={null}>
          <DeskModel hover={hover} onReady={onReady} onFocus={setFocus} onHover={setSceneHover} />
          <MonitorScreen
            framing={framing}
            active={focus === "monitor"}
            hovered={hover === "monitor"}
            onClose={() => setFocus(null)}
          />
        </Suspense>
        <CameraRig focus={focus} framingRef={framingRef} />
      </Canvas>
      <Overlays
        focus={focus}
        hover={hover}
        music={music}
        onFocus={setFocus}
        onHover={setMenuHover}
        onClose={() => setFocus(null)}
      />
      {!entered && <Curtain music={music} onEnter={() => setEntered(true)} />}
    </div>
  );
}
