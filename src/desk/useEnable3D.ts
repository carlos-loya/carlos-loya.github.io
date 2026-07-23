import { useEffect, useState } from "react";

// Decide whether to mount the WebGL desk scene. It's the primary experience, but
// only where it's welcome: a real pointer-capable wide screen, no reduced-motion
// request, and working WebGL. Everywhere else the static MinimalFallback stands
// on its own (and is the accessible content path).
function webglOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useEnable3D(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");

    const compute = () => setEnabled(wide.matches && !reduce.matches && webglOK());
    compute();

    reduce.addEventListener("change", compute);
    wide.addEventListener("change", compute);
    return () => {
      reduce.removeEventListener("change", compute);
      wide.removeEventListener("change", compute);
    };
  }, []);

  return enabled;
}
