import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// The final beat: Carlos at his desk, seen from behind. This is the Quaternius
// "Man" model (public/attribution.md) playing its Sitting clip. Only ever viewed
// from the back. Swappable: point it at a different rig later without touching the
// office layout. (The model has no drink clip — the cup sits on the desk.)

const SIT = "HumanArmature|Man_Sitting";

export function Character({
  position,
  rotation,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/man.glb");
  const { actions } = useAnimations(animations, ref);

  const { s, offY } = useMemo(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 1.9 / (size.y || 1); // ~1.9 tall (bind pose); reads right when seated
    return { s: scale, offY: -box.min.y * scale };
  }, [scene]);

  useEffect(() => {
    const a = actions[SIT] ?? Object.values(actions)[0];
    a?.reset().fadeIn(0.3).play();
    return () => void a?.fadeOut(0.2);
  }, [actions]);

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <primitive object={scene} scale={s} position={[0, offY, 0]} />
    </group>
  );
}
