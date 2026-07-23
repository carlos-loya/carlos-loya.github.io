import { lazy, Suspense } from "react";
import { useEnable3D } from "./desk/useEnable3D";
import { MinimalFallback } from "./components/MinimalFallback";

// The site is a single interactive 3D desk scene (src/desk/*). Capable desktops
// get the WebGL desk; mobile / no-WebGL / reduced-motion get the static
// MinimalFallback (also the accessible content path). DeskCanvas is lazy so the
// fallback path never downloads three.js.
const DeskCanvas = lazy(() =>
  import("./desk/DeskCanvas").then((m) => ({ default: m.DeskCanvas })),
);

function App() {
  const enable3D = useEnable3D();
  if (!enable3D) return <MinimalFallback />;
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0e0f13]" />}>
      <DeskCanvas />
    </Suspense>
  );
}

export default App;
