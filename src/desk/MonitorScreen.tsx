import { useMemo, useRef, useState } from "react";
import { Html, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sites } from "../content/projects";
import { MONITOR_HOVER_SCALE, type SceneFraming } from "./DeskModel";

// ── Screen placement knobs — tune live against the model ────────────────────
// The monitor's bounding box includes the stand, so the screen occupies the
// upper-front slice of it. These carve the screen rect out of that box.
// (ponytail: these are THE calibration dials for this component.)
const SCREEN_W = 0.9; // screen width  as fraction of monitor box width  (z)
const SCREEN_H = 0.6; // screen height as fraction of monitor box height (y)
const SCREEN_Y = 0.15; // raise screen center above box center (× box height)
const SCREEN_PUSH = .19; // just in front of the (−x) screen face (× half box depth)
const SCREEN_YAW = 0; // extra yaw if the monitor sits angled (radians)
const SCREEN_MIRROR = false; // flip the screenshot horizontally if reversed
const IFRAME_PX = 1100; // live-iframe render width in CSS px (aspect from rect)
const IFRAME_SCALE = .0385; // world units per CSS px for the live iframe
const LABEL_SIDE = 1; // which side the floating label sits (+1 = +z, −1 = −z)
const LABEL_GAP = 0.12; // gap beyond the screen edge (world units)

export function MonitorScreen({
  framing,
  active,
  hovered,
  onClose,
}: {
  framing: SceneFraming | null;
  active: boolean;
  hovered: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const images = useMemo(() => sites.map((s) => s.image), []);
  const textures = useTexture(images);
  const texList = useMemo(() => {
    const arr = Array.isArray(textures) ? textures : [textures];
    arr.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
    return arr;
  }, [textures]);

  // Bob the screen in lockstep with the monitor's hover pop (same scale + damping
  // as DeskModel) so the website image doesn't stay put inside a growing bezel.
  const groupRef = useRef<THREE.Group>(null);
  const tmpScale = useRef(new THREE.Vector3()).current;
  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const target = hovered ? MONITOR_HOVER_SCALE : 1;
    g.scale.lerp(tmpScale.set(target, target, target), 1 - Math.pow(0.002, dt));
  });

  const mon = framing?.targets.monitor;
  if (!mon || sites.length === 0) return null;

  const { center, size } = mon;
  const site = sites[idx];
  const screenW = size.z * SCREEN_W;
  const screenH = size.y * SCREEN_H;
  const showIframe = active && !!site.embed;
  const next = (d: number) => setIdx((i) => (i + d + sites.length) % sites.length);

  return (
    <group
      ref={groupRef}
      position={[center.x - (size.x / 2) * SCREEN_PUSH, center.y + size.y * SCREEN_Y, center.z]}
      rotation={[0, -Math.PI / 2 + SCREEN_YAW, 0]}
    >
      {/* Base layer: the screenshot on the screen (also the iframe fallback). */}
      <mesh scale={[SCREEN_MIRROR ? -1 : 1, 1, 1]}>
        <planeGeometry args={[screenW, screenH]} />
        <meshBasicMaterial map={texList[idx]} toneMapped={false} />
      </mesh>

      {/* Live site, overlaid on the screen when focused + embeddable. */}
      {showIframe && (
        <Html transform position={[0, 0, 0.01]} scale={IFRAME_SCALE} zIndexRange={[20, 0]}>
          <iframe
            src={site.url}
            title={site.name}
            loading="lazy"
            style={{
              width: IFRAME_PX,
              height: Math.round(IFRAME_PX * (screenH / screenW)),
              border: 0,
              background: "#000",
            }}
          />
        </Html>
      )}

      {/* Floating description + controls beside the monitor (billboarded DOM). */}
      {active && (
        <Html position={[LABEL_SIDE * (screenW / 2 + LABEL_GAP), 0, 0]} center zIndexRange={[30, 10]}>
          <div className="pointer-events-auto w-72 rounded-xl bg-[#111318]/92 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                Live in the wild · {idx + 1}/{sites.length}
              </span>
              <button
                onClick={onClose}
                aria-label="Close (Esc)"
                className="font-mono text-xs text-white/50 transition hover:text-white"
              >
                Esc ✕
              </button>
            </div>
            <h3 className="mt-2 font-display text-base">{site.name}</h3>
            <p className="mt-1 font-mono text-xs leading-relaxed text-white/60">{site.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => next(-1)}
                  aria-label="Previous project"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  ‹
                </button>
                <button
                  onClick={() => next(1)}
                  aria-label="Next project"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  ›
                </button>
              </div>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-3 py-1.5 font-mono text-xs font-bold text-black transition hover:bg-white/85"
              >
                Visit site ↗
              </a>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
