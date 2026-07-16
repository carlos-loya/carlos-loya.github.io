import { lazy, Suspense } from "react";
import { Nav } from "./components/Nav";
import { DescentHud } from "./components/DescentHud";
import { Hero } from "./components/Hero";
import { Skills } from "./components/Skills";
import { DataPlane } from "./components/DataPlane";
import { Infrastructure } from "./components/Infrastructure";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { useEnable3D } from "./three/useEnable3D";

// The static stacked site — the accessible baseline. Rendered on mobile /
// reduced-motion, and as the Suspense fallback while the cinematic layer loads.
function StaticSite() {
  return (
    <>
      <DescentHud />
      <main>
        <Hero />
        <Skills />
        <DataPlane />
        <Infrastructure />
        <Projects />
        <Contact />
      </main>
    </>
  );
}

// Lazy so three.js only ships to devices that actually render the descent.
const CinematicDescent = lazy(() =>
  import("./three/DescentCanvas").then((m) => ({ default: m.CinematicDescent })),
);

function App() {
  const enable3D = useEnable3D();
  return (
    <>
      <Nav />
      {enable3D ? (
        <Suspense fallback={<StaticSite />}>
          <CinematicDescent />
        </Suspense>
      ) : (
        <StaticSite />
      )}
    </>
  );
}

export default App;
