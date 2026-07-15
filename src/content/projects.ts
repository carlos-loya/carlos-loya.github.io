// Live websites I've designed, built, and deployed.
// Add a site: drop a screenshot in public/previews/ and append an entry below.
export interface Site {
  name: string;
  blurb: string;
  url: string; // Visit button
  image: string; // screenshot in public/previews/, e.g. "/previews/foo.png"
  github?: string; // Source button — omit if there's no public repo
  tags?: string[];
}

export const sites: Site[] = [
  {
    name: "Loya Drone Media",
    blurb:
      "Marketing site for a McAllen, TX drone company — real-estate photography, immersive 360° virtual tours, cinematic event coverage, and aerial inspection for the Rio Grande Valley.",
    url: "https://www.loyadronemedia.com/",
    image: "/previews/loya-drone-media.jpg",
    tags: ["Marketing site", "360° tours", "Design"],
  },
  {
    name: "MicroGP Arena",
    blurb:
      "Brand and launch site for a live RC racing and FPV broadcast concept — an eight-car, FPV-piloted arena activation built mall-, festival-, and corporate-ready.",
    url: "https://microgp-arena.vercel.app/",
    image: "/previews/microgp-arena.jpg",
    tags: ["Landing page", "Motorsport", "Branding"],
  },
];
