import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import * as THREE from "three";

// CC0/CC-BY glТF props (see public/attribution.md). They ship at wildly different
// scales, so every model is auto-normalized: measured by bounding box, scaled to
// a target height, and grounded (base at y=0). Repeats render via drei <Clone>.
// The animated Man is handled separately in Character.tsx (it needs its clip).

const MODELS = [
  "tree", "desk", "office-chair",
  "houseplant", "flower-pot", "coffee-cup",
  "picture-frame",
] as const;
MODELS.forEach((n) => useGLTF.preload(`/models/${n}.glb`));
// Capitalized Poly Pizza filenames (Greenhouse ships with baked translucent glass).
useGLTF.preload("/models/Greenhouse.glb");
useGLTF.preload("/models/Computer.glb");

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

// Poly Pizza "Picture frame" ships portrait, uncentered, at huge native scale —
// and its face is NOT axis-aligned: the thin axis sits ~35° in XZ (normal ≈
// (−0.57, 0, 0.82)). Naive 90° rolls leave it at a ~45° hang. We bake
// center+scale into the geometry, then quaternion-align so the face is flush
// to a wall looking −x, long side landscape along ±z.
export type PictureFrameLayout = {
  width: number; // along wall (z)
  height: number; // vertical (y)
  depth: number; // off wall (x)
  // screenshot plane size (slightly inside the opening) + local x offset toward room
  artW: number;
  artH: number;
  artX: number;
};

// Dominant front-face normal of picture-frame.glb (min-thickness axis in XZ).
const FRAME_FACE_N = new THREE.Vector3(-0.5735764363510458, 0, 0.819152044288992).normalize();

function preparePictureFrame(scene: THREE.Object3D, width: number) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // 1) Yaw so the face normal points at −x (into the hall from the +x wall).
  const currentAngle = Math.atan2(FRAME_FACE_N.x, FRAME_FACE_N.z);
  const yaw = -Math.PI / 2 - currentAngle;
  const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  // 2) Roll so the portrait long side (native +y) becomes landscape along +z.
  const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const q = qRoll.multiply(qYaw);

  // Scale so the long side becomes the wall-width. Bake center+scale into the
  // geometry (native coords are O(1e6); group TRS on float32 verts is flaky).
  const s = width / (size.y || 1);
  const root = scene.clone(true);
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry = m.geometry.clone();
    const pos = m.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(s).applyQuaternion(q);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    m.geometry.computeVertexNormals();
    m.geometry.computeBoundingBox();
    m.geometry.computeBoundingSphere();
    m.castShadow = true;
    m.receiveShadow = true;
  });
  root.updateMatrixWorld(true);

  const out = new THREE.Box3().setFromObject(root);
  const outSize = new THREE.Vector3();
  out.getSize(outSize);
  // After bake: x = depth (thin), y = height, z = width
  const depth = outSize.x;
  const height = outSize.y;
  const layout: PictureFrameLayout = {
    width: outSize.z,
    height,
    depth,
    artW: outSize.z * 0.88,
    artH: height * 0.86,
    // Sit the art just inside the room-facing face (front is −x).
    artX: -depth * 0.15,
  };
  return { root, layout };
}

export function usePictureFrame(width = 1.9) {
  const { scene } = useGLTF("/models/picture-frame.glb");
  return useMemo(() => preparePictureFrame(scene, width), [scene, width]);
}

export function usePictureFrameLayout(width = 1.9): PictureFrameLayout {
  return usePictureFrame(width).layout;
}

export function ModelPictureFrame({
  width = 1.9,
  position,
}: {
  width?: number;
  position?: Vec3;
}) {
  // Fresh clone per mount so two hall frames don't share one Object3D.
  const { root } = usePictureFrame(width);
  const obj = useMemo(() => root.clone(true), [root]);
  return (
    <group position={position}>
      <primitive object={obj} />
    </group>
  );
}

// Tuned default heights per prop (fine-tuned by eye against the scene).
export const ModelTree = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/tree.glb" height={p.height ?? 4.5} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelDesk = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/desk.glb" height={p.height ?? 1.15} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelChair = (p: { position?: Vec3; yaw?: number }) => (
  <GModel url="/models/office-chair.glb" height={1.45} position={p.position} yaw={p.yaw ?? 0} />
);
export const ModelComputer = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/Computer.glb" height={p.height ?? 0.6} position={p.position} yaw={p.yaw ?? 0} />
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
export const ModelGreenhouse = (p: { position?: Vec3; yaw?: number; height?: number }) => (
  <GModel url="/models/Greenhouse.glb" height={p.height ?? 4} position={p.position} yaw={p.yaw ?? 0} />
);
