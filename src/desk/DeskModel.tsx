import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { KeyboardKeys } from "./KeyboardKeys";

export type FocusId = "monitor" | "ipod" | "phone" | "clipboard" | "floppy" | "coffee";

// Top-level node names in art/desk.glb we make clickable. Add more here as the
// desk grows (keyboard, mouse, room props are already named in the model).
const INTERACTIVE: FocusId[] = ["monitor", "ipod", "phone", "clipboard", "floppy", "coffee"];

// The company-logo decals on the mug. These are their own top-level nodes in the
// glb (siblings of `coffee`), so they're picked separately from the focus objects
// and only while the mug is focused. Map glb node name → sticker id.
export type StickerId = "comcast" | "influxdata";
const STICKERS: Record<string, StickerId> = {
  "comcast-logo": "comcast",
  "influxdata-logo": "influxdata",
};

// How far a hovered sticker bobs (glb-local units — the decals live inside the
// unnormalized model) and how fast. ponytail: taste dials, tune live.
const STICKER_BOB_AMP = 0.006;
const STICKER_BOB_SPEED = 6;

// Hover feedback: the hovered object eases up in scale (scale-invariant, so it
// reads at any model unit). ponytail: these are taste dials. The monitor gets a
// gentler pop because MonitorScreen's screenshot plane is placed from a static
// box measurement and a big scale would visibly desync it.
const HOVER_SCALE = 1.08;
export const MONITOR_HOVER_SCALE = 1.03;

// Per-object pop overrides. The same 8% reads stronger on a big, off-center-pivot
// object like the mug (an 8% scale about an off-center origin lurches the whole
// mesh), so it gets a gentler value. ponytail: taste dials, tune per object here.
const HOVER_SCALE_BY_ID: Partial<Record<FocusId, number>> = {
  monitor: MONITOR_HOVER_SCALE,
  coffee: 1.03,
};

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

// Same parent-walk, but for the mug's sticker decals.
function stickerAncestor(o: THREE.Object3D | null): StickerId | null {
  for (let n = o; n; n = n.parent) {
    if (n.name in STICKERS) return STICKERS[n.name];
  }
  return null;
}

function pickSticker(e: ThreeEvent<PointerEvent>): StickerId | null {
  for (const hit of e.intersections) {
    const id = stickerAncestor(hit.object);
    if (id) return id;
  }
  return null;
}

const TARGET_HEIGHT = 4; // world units the whole scene is normalized to
const tmpScale = new THREE.Vector3(); // scratch for the hover bob lerp

useGLTF.preload("/models/desk.glb", true);

export function DeskModel({
  hover,
  focus,
  stickerActive,
  onReady,
  onFocus,
  onHover,
  onSticker,
}: {
  hover: FocusId | null;
  focus: FocusId | null;
  stickerActive: boolean;
  onReady: (f: SceneFraming) => void;
  onFocus: (id: FocusId) => void;
  onHover: (id: FocusId | null) => void;
  onSticker: (id: StickerId) => void;
}) {
  // `true` = decode Draco geometry (drei's default CDN decoder).
  const { scene } = useGLTF("/models/desk.glb", true);
  const groupRef = useRef<THREE.Group>(null);
  // Per-object rest transform + live handle, captured after framing is measured.
  const bobRef = useRef<{ obj: THREE.Object3D; id: FocusId; baseScale: THREE.Vector3 }[]>([]);
  // Sticker decals: rest position + live handle for the hover bob. Hover is kept
  // local (a ref, not parent state) so bobbing a sticker doesn't re-render the app.
  const stickerRef = useRef<{ obj: THREE.Object3D; id: StickerId; baseY: number }[]>([]);
  const stickerHover = useRef<StickerId | null>(null);

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

    // Sticker decals: capture rest handles for the bob and fold their boxes into
    // the coffee target so focusing the mug frames the stickers, not just the cup.
    const stickers: typeof stickerRef.current = [];
    const coffeeBox = new THREE.Box3();
    if (targets.coffee) coffeeBox.setFromCenterAndSize(targets.coffee.center, targets.coffee.size);
    for (const [name, id] of Object.entries(STICKERS)) {
      const obj = g.getObjectByName(name);
      if (obj) {
        stickers.push({ obj, id, baseY: obj.position.y });
        coffeeBox.expandByObject(obj);
      }
    }
    stickerRef.current = stickers;
    if (targets.coffee && !coffeeBox.isEmpty()) {
      const size = coffeeBox.getSize(new THREE.Vector3());
      targets.coffee = { center: coffeeBox.getCenter(new THREE.Vector3()), radius: size.length() / 2, size };
    }
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
  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    for (const b of bobRef.current) {
      // Skip the pop once an object is focused — the affordance's job is done.
      const on = hover === b.id && focus !== b.id;
      const target = on ? (HOVER_SCALE_BY_ID[b.id] ?? HOVER_SCALE) : 1;
      b.obj.scale.lerp(tmpScale.copy(b.baseScale).multiplyScalar(target), k);
    }
    // Sticker hover bob: the hovered decal rides a small sine while the mug is
    // focused; the rest ease back to their resting height.
    const bob = STICKER_BOB_AMP * Math.sin(state.clock.elapsedTime * STICKER_BOB_SPEED);
    for (const s of stickerRef.current) {
      const target = stickerActive && stickerHover.current === s.id ? s.baseY + bob : s.baseY;
      s.obj.position.y = THREE.MathUtils.lerp(s.obj.position.y, target, k);
    }
  });

  return (
    <group
      ref={groupRef}
      scale={s}
      position={[0, offY, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        // While the mug is focused, a sticker click wins over re-focusing the mug.
        if (stickerActive) {
          const sid = pickSticker(e);
          if (sid) {
            e.stopPropagation();
            onSticker(sid);
            return;
          }
        }
        const id = pickInteractive(e);
        if (!id) return;
        e.stopPropagation();
        onFocus(id);
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        const sid = stickerActive ? pickSticker(e) : null;
        stickerHover.current = sid;
        const id = pickInteractive(e);
        onHover(id);
        document.body.style.cursor = sid || id ? "pointer" : "";
      }}
      onPointerOut={() => {
        stickerHover.current = null;
        onHover(null);
        document.body.style.cursor = "";
      }}
    >
      <primitive object={scene} />
      <KeyboardKeys scene={scene} />
    </group>
  );
}
