import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";

// CC0/CC-BY glТF props (see public/attribution.md). They ship at wildly different
// scales, so every model is auto-normalized: measured by bounding box, scaled to
// a target height, and grounded (base at y=0). Repeats render via drei <Clone>.
// The animated Man is handled separately in Character.tsx (it needs its clip).

const MODELS = [
  "cloud", "cloud-2", "tree", "desk", "office-chair",
  "monitor", "houseplant", "flower-pot", "coffee-cup",
] as const;
MODELS.forEach((n) => useGLTF.preload(`/models/${n}.glb`));

type Vec3 = [number, number, number];

// Normalize a loaded scene to `height` (world units, by Y) and ground it.
function useNormalized(url: string, height: number, extraScale: number) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = (height / (size.y || 1)) * extraScale;
    return { scene, s, offY: -box.min.y * s };
  }, [scene, height, extraScale]);
}

function GModel({
  url,
  height,
  position,
  rotation,
  yaw = 0,
  extraScale = 1,
}: {
  url: string;
  height: number;
  position?: Vec3;
  rotation?: Vec3;
  yaw?: number;
  extraScale?: number;
}) {
  const { scene, s, offY } = useNormalized(url, height, extraScale);
  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={s} position={[0, offY, 0]} rotation={[0, yaw, 0]} />
    </group>
  );
}

// Tuned default heights per prop (fine-tuned by eye against the scene).
export const ModelCloud = (p: { position?: Vec3; yaw?: number; big?: boolean }) => (
  <GModel url={p.big ? "/models/cloud-2.glb" : "/models/cloud.glb"} height={p.big ? 5 : 3.4} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelTree = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/tree.glb" height={p.height ?? 4.5} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelDesk = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/desk.glb" height={p.height ?? 1.15} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelChair = (p: { position?: Vec3; yaw?: number }) => (
  <GModel url="/models/office-chair.glb" height={1.45} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelMonitor = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/monitor.glb" height={p.height ?? 1.4} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelPlant = (p: { position?: Vec3; yaw?: number }) => (
  <GModel url="/models/houseplant.glb" height={1.3} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelPot = (p: { position?: Vec3; yaw?: number }) => (
  <GModel url="/models/flower-pot.glb" height={1.5} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelCup = (p: { position?: Vec3; yaw?: number }) => (
  <GModel url="/models/coffee-cup.glb" height={0.28} position={p.position} yaw={p.yaw ?? 0} />
);
