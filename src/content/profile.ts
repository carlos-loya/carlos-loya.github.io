// Site-wide profile/contact data. Edit here — components read from this.
export const profile = {
  name: "Carlos Loya",
  eyebrow: "Full-stack engineer · backend-strong",
  // Hero headline; wrap the accented word in <em> handled by the Hero component.
  headline: "I build the systems and platforms that data runs on.",
  accentWord: "systems",
  lede:
    "I'm Carlos Loya — a full-stack engineer who's happiest close to the backend: Kubernetes operators, data pipelines, and the infrastructure that keeps them honest. I bring that same rigor up to the interface.",

  email: "exafterdev@gmail.com",
  github: "https://github.com/carlos-loya",
  githubHandle: "carlos-loya",
  // TODO: replace with your real LinkedIn URL
  linkedin: "https://www.linkedin.com/in/your-handle",
  // TODO: drop your résumé at public/resume.pdf (a placeholder is committed)
  resume: "/resume.pdf",
  // TODO: set your real location
  location: "the US",

  // Short stack line shown under the hero.
  heroMeta: [
    "Go · Python · TypeScript",
    "Kubernetes · Postgres · AWS",
  ],
} as const;
