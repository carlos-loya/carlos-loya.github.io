// The descent model — one source of truth for the six depth layers.
// Both the HUD rail and the section chrome read from this so codes, names,
// and anchors never drift. depth is flavor (meters below the surface).
export interface Layer {
  id: string; // anchor id on the <section>
  code: string; // L0…L5
  name: string; // machine name, shown mono/uppercase
  nav: string; // human label for the top nav
  depth: number; // meters below surface, for the HUD readout
}

export const layers: Layer[] = [
  { id: "top", code: "L0", name: "SKY", nav: "Top", depth: 0 },
  { id: "control", code: "L1", name: "CLOUDLINE", nav: "Stack", depth: 140 },
  { id: "data-plane", code: "L2", name: "THE YARD", nav: "Systems", depth: 360 },
  { id: "infrastructure", code: "L3", name: "THE THRESHOLD", nav: "Experience", depth: 680 },
  { id: "proving-ground", code: "L4", name: "HALL OF FAME", nav: "Work", depth: 940 },
  { id: "core", code: "L5", name: "THE DESK", nav: "Contact", depth: 1200 },
];

export const MAX_DEPTH = layers[layers.length - 1].depth;
