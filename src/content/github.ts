// Independent builds shown in the GitHub act as project cards — "show, don't tell."
// Copy distilled from experience[0] (which stays intact as the résumé record).
// `repo` is optional: a Source link renders only when a real URL is present.
// TODO: drop in the public repo URLs as they go up (like resume.pdf).
export interface Repo {
  name: string;
  blurb: string;
  tags: string[];
  repo?: string;
}

export const repos: Repo[] = [
  {
    name: "DB-Row Archival Operator",
    blurb:
      "Kubernetes operator for database-row archival — packaged as a Helm chart with a standalone CLI for non-Kubernetes environments.",
    tags: ["Go", "Operator", "Helm"],
  },
  {
    name: "Water-Quality Compliance Platform",
    blurb:
      "Go compliance platform built from a real city RFI — React/TypeScript UI over a multi-tenant, NATS JetStream audit log.",
    tags: ["Go", "React", "NATS JetStream"],
  },
  {
    name: "Multi-Sport ETL Pipeline",
    blurb:
      "NBA/NFL/soccer ETL on a Bronze → Silver → Gold medallion architecture, scheduled with Airflow into DuckDB — in production use.",
    tags: ["Python", "Airflow", "DuckDB"],
  },
];
