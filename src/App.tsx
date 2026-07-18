import { Nav } from "./components/Nav";
import { ColorWorlds } from "./scroll/ColorWorlds";
import { Hero } from "./components/Hero";
import { Skills } from "./components/Skills";
import { DataPlane } from "./components/DataPlane";
import { Infrastructure } from "./components/Infrastructure";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";

// One presentation: the vertical "Color Worlds" scroll story. ColorWorlds paints
// the animated background (and no-ops under reduced motion, where each .act shows
// its own solid world color — a static, fully-legible multi-color page).
function App() {
  return (
    <>
      <ColorWorlds />
      <Nav />
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
