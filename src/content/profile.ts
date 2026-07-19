// Site-wide profile/contact data. Edit here — components read from this.
export const profile = {
  name: "Carlos Loya",
  eyebrow: "Full-stack · backend-strong",
  // Hero headline; wrap the accented phrase in <em> handled by the Hero component.
  headline: "I build the whole stack.",
  accentWord: "whole stack",
  lede:
    "Frontend, backend, data, infra, QA — a generalist who lives closest to the backend.",

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
