// The color worlds — one source of truth for the site's beats. Replaces the old
// descent `layers` model. Array order == vertical/scroll order; ColorWorlds
// blends between the `bg` colors on scroll, each act scopes its own fg/accent.
import type { CSSProperties } from "react";

export interface World {
  id: string; // anchor id on the <section>, and nav target
  nav: string; // human label for the top nav
  bg: string; // the saturated world background
  fg: string; // legible ink for this world (dark on brights, cream on violet)
  accent: string; // the one pop color that contrasts this world
}

// Sequence: cyan sky → lime → gold → coral → pink → violet finale. Bright until
// the violet close (which flips to cream ink). fg is a deep tint of the hue so
// text sits in the same family; accent is a deliberate contrast.
export const WORLDS: World[] = [
  { id: "top",        nav: "Top",        bg: "#20c4e6", fg: "#08252e", accent: "#ff5a1f" },
  { id: "toolkit",    nav: "Toolkit",    bg: "#b4e219", fg: "#1b2a02", accent: "#e6007a" },
  { id: "systems",    nav: "Systems",    bg: "#ffc61a", fg: "#3a2600", accent: "#d6006e" },
  { id: "experience", nav: "Experience", bg: "#ff6b3d", fg: "#3a1200", accent: "#1a1046" },
  { id: "work",       nav: "Work",       bg: "#ff4fa3", fg: "#3d0022", accent: "#6a00ff" },
  { id: "contact",    nav: "Contact",    bg: "#7b5cff", fg: "#fdf0ff", accent: "#ffd23f" },
];

export const world = (id: string): World => WORLDS.find((w) => w.id === id)!;

// Inline vars an act applies to its <section>; the .act rule in index.css maps
// these onto the Tailwind color tokens so utilities (text-fg, bg-panel…) resolve
// per-world. Also the static/reduced-motion background (JS-free multi-color page).
export const worldStyle = (w: World): CSSProperties =>
  ({
    "--world-bg": w.bg,
    "--world-fg": w.fg,
    "--world-accent": w.accent,
  }) as CSSProperties;

// Nav targets — every world has a real section; skip the surface (you're there).
export const navWorlds = WORLDS.filter((w) => w.id !== "top");
