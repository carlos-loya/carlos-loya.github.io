import { Nav } from "./components/Nav";
import { ColorWorlds } from "./scroll/ColorWorlds";
import { OrbTraveler } from "./components/OrbTraveler";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Infrastructure } from "./components/Infrastructure";
import { GitHub } from "./components/GitHub";
import { Skills } from "./components/Skills";
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
        <Projects />
        <Infrastructure />
        <GitHub />
        <Skills />
        <Contact />
      </main>
      {/* After <main> so its scroll triggers are created/refreshed last — they
          measure #work/#experience against the final layout (incl. the Work pin).
          z-index:-1 keeps it behind all section content, above the bg layer. */}
      <OrbTraveler />
    </>
  );
}

export default App;
