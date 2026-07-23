import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { KeyboardKeys } from "./KeyboardKeys";

export type FocusId = "monitor" | "ipod" | "phone" | "clipboard" | "floppy";

// Top-level node names in art/desk.glb we make clickable. Add more here as the
// desk grows (keyboard, mouse, room props are already named in the model).
const INTERACTIVE: FocusId[] = ["monitor", "ipod", "phone", "clipboard", "floppy"];

// Hover feedback: the hovered object eases up in scale (scale-invariant, so it
// reads at any model unit). ponytail: these are taste dials. The monitor gets a
// gentler pop because MonitorScreen's screenshot plane is placed from a static
// box measurement and a big scale would visibly desync it.
const HOVER_SCALE = 1.08;
export const MONITOR_HOVER_SCALE = 1.03;

// The desktop cluster the hero view frames on — we want the desk in focus, not
// the whole room. Any of these that exist in the model define the hero box.
const DESK_ITEMS = ["monitor", "ipod", "keyboard", "mouse"];

export type Framing = { center: THREE.Vector3; radius: number; size: THREE.Vector3 };
export type SceneFraming = Framing & { targets: Partial<Record<FocusId, Framing>> };

// Nearest ancestor (incl. self) whose name is one of our interactive objects —
// clicks land on leaf meshes, we care which named object they belong to.
function interactiveAncestor(o: THREE.Object3D | null): FocusId | null {
  for (let n = o; n; n = n.parent) {
    if ((INTERACTIVE as string[]).includes(n.name)) return n.name as FocusId;
  }
  return null;
}

// The first interactive object along the ray. The model now includes the office
// room + window backdrop, so the frontmost hit (e.object) is often a
// non-interactive mesh; walk the full sorted intersection list instead of trusting
// only the nearest one.
function pickInteractive(e: ThreeEvent<PointerEvent>): FocusId | null {
  for (const hit of e.intersections) {
    const id = interactiveAncestor(hit.object);
    if (id) return id;
  }
  return null;
}

const TARGET_HEIGHT = 4; // world units the whole scene is normalized to
const tmpScale = new THREE.Vector3(); // scratch for the hover bob lerp

useGLTF.preload("/models/desk.glb", true);

export function DeskModel({
  hover,
  onReady,
  onFocus,
  onHover,
}: {
  hover: FocusId | null;
  onReady: (f: SceneFraming) => void;
  onFocus: (id: FocusId) => void;
  onHover: (id: FocusId | null) => void;
}) {
  // `true` = decode Draco geometry (drei's default CDN decoder).
  const { scene } = useGLTF("/models/desk.glb", true);
  const groupRef = useRef<THREE.Group>(null);
  // Per-object rest transform + live handle, captured after framing is measured.
  const bobRef = useRef<{ obj: THREE.Object3D; id: FocusId; baseScale: THREE.Vector3 }[]>([]);

  // Normalize once: scale the whole scene to TARGET_HEIGHT, ground it at y=0,
  // and enable shadows on every mesh.
  const { s, offY } = useMemo(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = TARGET_HEIGHT / (size.y || 1);
    return { s: scale, offY: -box.min.y * scale };
  }, [scene]);

  // Measure framing (whole scene + each interactive object) after the group's
  // scale/offset are baked into world matrices, so the camera rig can frame them.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.updateWorldMatrix(true, true);
    const measure = (o: THREE.Object3D): Framing => {
      const b = new THREE.Box3().setFromObject(o);
      const size = b.getSize(new THREE.Vector3());
      return { center: b.getCenter(new THREE.Vector3()), radius: size.length() / 2, size };
    };
    const targets: SceneFraming["targets"] = {};
    const bobs: typeof bobRef.current = [];
    for (const id of INTERACTIVE) {
      const obj = g.getObjectByName(id);
      if (obj) {
        targets[id] = measure(obj);
        bobs.push({ obj, id, baseScale: obj.scale.clone() });
      }
    }
    bobRef.current = bobs;
    // Hero framing = the desktop cluster (falls back to the whole scene).
    const heroBox = new THREE.Box3();
    for (const id of DESK_ITEMS) {
      const obj = g.getObjectByName(id);
      if (obj) heroBox.expandByObject(obj);
    }
    let hero: Framing;
    if (heroBox.isEmpty()) {
      hero = measure(g);
    } else {
      const size = heroBox.getSize(new THREE.Vector3());
      hero = { center: heroBox.getCenter(new THREE.Vector3()), radius: size.length() / 2, size };
    }
    onReady({ ...hero, targets });
  }, [scene, onReady]);

  // Pop the hovered object up in scale; everything else eases back to rest.
  // Driven by the shared `hover` prop, so hovering the DOM legend pops the object
  // too (not just a direct 3D-pointer hover). Framerate-independent damping.
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    for (const b of bobRef.current) {
      const on = hover === b.id;
      const target = on ? (b.id === "monitor" ? MONITOR_HOVER_SCALE : HOVER_SCALE) : 1;
      b.obj.scale.lerp(tmpScale.copy(b.baseScale).multiplyScalar(target), k);
    }
  });

  return (
    <group
      ref={groupRef}
      scale={s}
      position={[0, offY, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        const id = pickInteractive(e);
        if (!id) return;
        e.stopPropagation();
        onFocus(id);
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        const id = pickInteractive(e);
        onHover(id);
        document.body.style.cursor = id ? "pointer" : "";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
    >
      <primitive object={scene} />
      <KeyboardKeys scene={scene} />
    </group>
  );
}
