import { Nav } from "./components/Nav";
import { DescentHud } from "./components/DescentHud";
import { Hero } from "./components/Hero";
import { Skills } from "./components/Skills";
import { DataPlane } from "./components/DataPlane";
import { Infrastructure } from "./components/Infrastructure";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { lazy, Suspense } from "react";
import { useEnable3D } from "./three/useEnable3D";

// Lazy so three.js only ships to devices that actually render the descent.
const DescentCanvas = lazy(() =>
  import("./three/DescentCanvas").then((m) => ({ default: m.DescentCanvas })),
);

function App() {
  const enable3D = useEnable3D();
  return (
    <>
      {enable3D && (
        <Suspense fallback={null}>
          <DescentCanvas />
        </Suspense>
      )}
      <Nav />
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

export default App;
