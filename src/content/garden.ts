// The Tech Toolkit Garden (L2 THE YARD). Each of Carlos's core stack techs lives
// as a playful "tech pet"; hovering one pops its speech bubble. Copy is witty but
// truthful to how he actually uses the tech. Geometry/animation live in
// src/three/Garden.tsx; only the words + accent colour live here.

export interface TechPet {
  key: "go" | "k8s" | "react" | "docker";
  tech: string; // display name on the bubble
  blurb: string; // first-person, playful, one line
  color: string; // flat-shaded body colour
}

export const techPets: TechPet[] = [
  {
    key: "go",
    tech: "Go",
    blurb: "I dig high-performance backend pipelines!",
    color: "#8a6240", // gopher brown (Go is teal, but the gopher is brown)
  },
  {
    key: "k8s",
    tech: "Kubernetes",
    blurb: "I orchestrate Carlos's microservices — even wrote an operator!",
    color: "#326ce5", // k8s blue
  },
  {
    key: "react",
    tech: "React",
    blurb: "I spray on the interfaces that make it all usable!",
    color: "#61dafb", // react cyan
  },
  {
    key: "docker",
    tech: "Docker",
    blurb: "I ship everything in tidy little containers!",
    color: "#2496ed", // docker blue
  },
];
