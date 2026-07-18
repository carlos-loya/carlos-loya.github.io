import { useMemo } from "react";
import * as THREE from "three";

// Hero-sky backdrop: a big inverted sphere with a vibrant vertical gradient —
// retro cyan-blue at the zenith warming to a pastel-peach horizon that meets the
// fog colour, so the world dissolves into sky. No postprocessing / custom shaders
// (repo constraint): just a canvas CanvasTexture on a MeshBasicMaterial.
function useGradientTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, "#1f4f9e"); // zenith — deep retro blue
    g.addColorStop(0.4, "#4d90d8"); // upper — cyan-blue
    g.addColorStop(0.68, "#a9d3ec"); // mid-sky
    g.addColorStop(0.86, "#f4dcc0"); // near horizon — warming
    g.addColorStop(1.0, "#ffd9b0"); // horizon — pastel peach
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export function Skydome() {
  const tex = useGradientTexture();
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[400, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
