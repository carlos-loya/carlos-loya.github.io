import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useCursor, Text } from "@react-three/drei";
import * as THREE from "three";
import { mat, PAL } from "./props";
import type { Site } from "../content/projects";

// A gallery piece on the +x wall: a landscape wood frame + white matte holding a
// live-site screenshot, hung facing −x into the room. Clickable → opens the site;
// lifts off the wall on hover. Procedural (a few flat meshes) so it renders
// reliably at any lighting — the screenshot plane is unlit (meshBasicMaterial) so
// it stays bright indoors. The DOM proving-ground panel carries the same links.

// Frame outer (x = depth into wall, y = height, z = width along wall). Landscape.
const OUT = { d: 0.14, h: 1.65, w: 2.5 };
const MATTE = { w: 2.28, h: 1.34 };
const ART = { w: 2.14, h: 1.2 };

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
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Hover: ease a few cm off the wall toward the room (−x).
  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hovered ? -0.09 : 0;
    group.current.position.x += (target - group.current.position.x) * Math.min(dt * 8, 1);
  });

  return (
    <group position={position}>
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
        {/* wood frame slab, flush to the wall */}
        <mesh material={mat(PAL.deskWood)} castShadow receiveShadow>
          <boxGeometry args={[OUT.d, OUT.h, OUT.w]} />
        </mesh>
        {/* white matte, just proud of the room-facing (−x) face */}
        <mesh position={[-OUT.d / 2 - 0.005, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[MATTE.w, MATTE.h]} />
          <meshBasicMaterial color="#f7f4ec" toneMapped={false} />
        </mesh>
        {/* the screenshot, unlit so it reads bright indoors */}
        <mesh position={[-OUT.d / 2 - 0.01, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[ART.w, ART.h]} />
          <meshBasicMaterial map={tex} color={hovered ? "#ffffff" : "#ececec"} toneMapped={false} />
        </mesh>
      </group>
      {/* Nameplate below the frame */}
      <Text
        position={[-0.12, -OUT.h / 2 - 0.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.16}
        color={hovered ? PAL.balloon : "#33383f"}
        anchorX="center"
        anchorY="middle"
        maxWidth={OUT.w}
        textAlign="center"
      >
        {site.name}
      </Text>
    </group>
  );
}
