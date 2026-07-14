// TODO: replace these placeholders with your real roles.
// Lead each description with impact (what you owned, scale, results).
export interface Role {
  when: string;
  title: string;
  company: string;
  description: string;
  todo?: boolean; // marks placeholder copy in the UI
}

export const experience: Role[] = [
  {
    when: "2024 — Present",
    title: "Software Engineer",
    company: "Company Name",
    description:
      "One or two lines on what you owned and shipped. Lead with impact.",
    todo: true,
  },
  {
    when: "2022 — 2024",
    title: "Backend Engineer",
    company: "Company Name",
    description: "Systems you built, scale you handled, the results.",
    todo: true,
  },
];
