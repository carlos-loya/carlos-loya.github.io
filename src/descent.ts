// The descent model — one source of truth for the seven depth layers.
// Both the HUD rail and the section chrome read from this so codes, names,
// and anchors never drift. depth is flavor (meters below the surface).
export interface Layer {
  id: string; // anchor id on the <section>
  code: string; // L0…L6
  name: string; // machine name, shown mono/uppercase
  nav: string; // human label for the top nav
  depth: number; // meters below surface, for the HUD readout
  transit?: boolean; // cinematic-only travel beat — no static DOM section, hidden from nav/HUD
}

export const layers: Layer[] = [
  { id: "top", code: "L0", name: "SKY", nav: "Top", depth: 0 },
  { id: "control", code: "L1", name: "THE GARDEN", nav: "Stack", depth: 140 },
  { id: "data-plane", code: "L2", name: "THE WORKSHOP", nav: "Systems", depth: 360 },
  { id: "road", code: "L3", name: "THE ROAD", nav: "Road", depth: 560, transit: true },
  { id: "infrastructure", code: "L4", name: "THE DRIVEWAY", nav: "Experience", depth: 780 },
  { id: "proving-ground", code: "L5", name: "THE GALLERY", nav: "Work", depth: 1000 },
  { id: "core", code: "L6", name: "THE DESK", nav: "Contact", depth: 1200 },
];

// Layers that have a real DOM section / nav target (the road is a cinematic-only
// travel beat, so it's excluded from the static site chrome).
export const navLayers = layers.filter((l) => !l.transit);

export const MAX_DEPTH = layers[layers.length - 1].depth;
