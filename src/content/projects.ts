// Featured projects — seeded from real GitHub repos. Edit / reorder freely.
export interface Project {
  name: string;
  blurb: string;
  tags: string[];
  github: string;
  docs?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: "archive-purge-restore",
    blurb:
      "A Kubernetes operator and CLI that archives old database rows to Parquet on object storage and restores them on demand — Postgres, MySQL & TimescaleDB into S3, GCS, R2, or the filesystem. Built with kubebuilder and controller-runtime.",
    tags: ["Go", "Kubernetes", "Parquet", "Helm", "TimescaleDB"],
    github: "https://github.com/carlos-loya/archive-purge-restore",
    featured: true,
  },
  {
    name: "sports-data-pipeline",
    blurb:
      "Multi-sport ETL pipeline extracting, transforming, and loading NFL, NBA, and soccer data into an analytics-ready format.",
    tags: ["Python", "ETL", "Analytics"],
    github: "https://github.com/carlos-loya/sports-data-pipeline",
  },
  {
    name: "water-quality-data-management",
    blurb:
      "Open-source water-quality data management and utility-compliance platform.",
    tags: ["Go", "Platform", "Compliance"],
    github: "https://github.com/carlos-loya/water-quality-data-management",
  },
  {
    name: "amanoform",
    blurb:
      "Infrastructure as Code, by hand — provisions AWS resources through browser automation instead of APIs.",
    tags: ["Java", "AWS", "Automation"],
    github: "https://github.com/carlos-loya/amanoform",
  },
  {
    name: "huntdex",
    blurb:
      "A web app for hunters to track their captured pets — a full-stack side project.",
    tags: ["TypeScript", "React", "Full-stack"],
    github: "https://github.com/carlos-loya/huntdex",
  },
];
