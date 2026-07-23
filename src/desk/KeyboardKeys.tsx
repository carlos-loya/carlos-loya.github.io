import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Taste knobs — local-space key travel. Keycaps are ~0.02 tall; a few mm of
// press reads clearly without clipping into the plate.
const PRESS_DEPTH = 0.005;
const LERP_SPEED = 28; // higher = snappier
const ROW_Z_EPS = 0.005;

// Standard 60% QWERTY by physical `KeyboardEvent.code`. Row lengths match the
// desk.glb keycap layout (14 / 14 / 13 / 12 / 8). Bottom row is the soft spot
// if a modifier looks wrong — tweak only that array.
const ROWS: string[][] = [
  [
    "Backquote",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "Digit0",
    "Minus",
    "Equal",
    "Backspace",
  ],
  [
    "Tab",
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
    "Backslash",
  ],
  [
    "CapsLock",
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyJ",
    "KeyK",
    "KeyL",
    "Semicolon",
    "Quote",
    "Enter",
  ],
  [
    "ShiftLeft",
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV",
    "KeyB",
    "KeyN",
    "KeyM",
    "Comma",
    "Period",
    "Slash",
    "ShiftRight",
  ],
  [
    "ControlLeft",
    "MetaLeft",
    "AltLeft",
    "Space",
    "AltRight",
    "MetaRight",
    "ContextMenu",
    "ControlRight",
  ],
];

type KeyBinding = { object: THREE.Object3D; restY: number };

function isKeycap(o: THREE.Object3D): boolean {
  if (!/^Cube/i.test(o.name)) return false;
  if (/plate/i.test(o.name)) return false;
  // Upper keycaps sit above the inverted stem layer (y ≲ -0.004, quat.w ≈ 0).
  return o.position.y > -0.004 && o.quaternion.w > 0.5;
}

/** Cluster keycaps into front-to-back rows (by local Z), left-to-right within row. */
function clusterRows(caps: THREE.Object3D[]): THREE.Object3D[][] {
  const sorted = [...caps].sort((a, b) => a.position.z - b.position.z);
  const rows: THREE.Object3D[][] = [];
  for (const cap of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(cap.position.z - last[0].position.z) <= ROW_Z_EPS) {
      last.push(cap);
    } else {
      rows.push([cap]);
    }
  }
  for (const row of rows) row.sort((a, b) => a.position.x - b.position.x);
  // Model Z increases toward the user → first cluster is the number row (back).
  return rows;
}

function buildMap(keyboard: THREE.Object3D): Map<string, KeyBinding> {
  const caps: THREE.Object3D[] = [];
  keyboard.traverse((o) => {
    if (isKeycap(o)) caps.push(o);
  });

  const spatial = clusterRows(caps);
  const map = new Map<string, KeyBinding>();

  if (import.meta.env.DEV) {
    const lengths = spatial.map((r) => r.length);
    const expected = ROWS.map((r) => r.length);
    if (lengths.join(",") !== expected.join(",")) {
      console.warn(
        `[KeyboardKeys] row lengths ${lengths.join("/")} ≠ expected ${expected.join("/")}`,
      );
    }
  }

  const n = Math.min(spatial.length, ROWS.length);
  for (let r = 0; r < n; r++) {
    const codes = ROWS[r];
    const keys = spatial[r];
    const m = Math.min(codes.length, keys.length);
    for (let c = 0; c < m; c++) {
      const object = keys[c];
      map.set(codes[c], { object, restY: object.position.y });
    }
  }

  if (import.meta.env.DEV) {
    const dump: Record<string, string> = {};
    for (const [code, { object }] of map) dump[code] = object.name;
    (window as Window & { __deskKeys?: Record<string, string> }).__deskKeys = dump;
  }

  return map;
}

/**
 * Mirrors physical keypresses onto the 3D keyboard keycaps.
 * Renders nothing — mutates keycap positions under `scene`.
 */
export function KeyboardKeys({ scene }: { scene: THREE.Object3D }) {
  const bindings = useMemo(() => {
    const kb = scene.getObjectByName("keyboard");
    return kb ? buildMap(kb) : new Map<string, KeyBinding>();
  }, [scene]);

  const pressed = useRef(new Set<string>());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!bindings.has(e.code)) return;
      pressed.current.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => {
      pressed.current.delete(e.code);
    };
    const onBlur = () => pressed.current.clear();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      // Snap back so a remount doesn't leave keys mid-travel.
      for (const { object, restY } of bindings.values()) {
        object.position.y = restY;
      }
    };
  }, [bindings]);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-LERP_SPEED * dt);
    for (const [code, { object, restY }] of bindings) {
      const target = pressed.current.has(code) ? restY - PRESS_DEPTH : restY;
      object.position.y += (target - object.position.y) * k;
    }
  });

  return null;
}
