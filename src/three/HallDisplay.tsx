import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useCursor, Text } from "@react-three/drei";
import * as THREE from "three";
import { ModelMonitor } from "./models";
import { mat, PAL } from "./props";
import type { Site } from "../content/projects";

// A hall-of-fame display: a monitor on a wall shelf, its screen showing a live
// site screenshot, with a nameplate. Clickable → opens the site; a small lift on
// hover. Mounted on the −x wall, facing +x into the hall (toward the camera). The
// DOM proving-ground panel carries the same links for keyboard/AT users.

export function HallDisplay({
  site,
  position,
  onActivate,
}: {
  site: Site;
  position: [number, number, number];
  onActivate: (s: Site) => void;
}) {
  const tex = useTexture(site.image);
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hovered ? 0.08 : 0;
    group.current.position.y += (target - group.current.position.y) * Math.min(dt * 8, 1);
  });

  return (
    <group position={position}>
      {/* wall shelf the monitor sits on */}
      <mesh position={[-0.15, -0.08, 0]} material={mat(PAL.deskWood)} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.16, 1.8]} />
      </mesh>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onActivate(site);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <ModelMonitor position={[0, 0, 0]} yaw={Math.PI / 2} height={1.35} />
        {/* screenshot on the screen face (+x) */}
        <mesh position={[0.32, 0.78, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.25, 0.8]} />
          <meshBasicMaterial map={tex} color={hovered ? "#ffffff" : "#dcdcdc"} toneMapped={false} />
        </mesh>
      </group>
      {/* nameplate on the wall above */}
      <Text
        position={[0.34, 1.75, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.2}
        color={hovered ? PAL.balloon : "#33383f"}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
        textAlign="center"
      >
        {site.name}
      </Text>
    </group>
  );
}
