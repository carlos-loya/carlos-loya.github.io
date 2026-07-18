// The Workshop (L2 THE WORKSHOP). The "systems I've shipped" (experience[0])
// manifested as mechanical rigs in a rustic shed; hovering one pops its speech
// bubble. Copy is playful but truthful to the resume points. Geometry/animation
// live in src/three/Workshop.tsx; only the words live here. Mirrors garden.ts.

export interface Rig {
  key: "operator" | "waterquality" | "etl";
  tech: string; // display name on the bubble
  blurb: string; // first-person, playful, one line
}

export const rigs: Rig[] = [
  {
    key: "operator",
    tech: "K8s Archival Operator",
    blurb: "I archive database rows on a schedule — Helm chart + a standalone CLI for non-K8s hosts!",
  },
  {
    key: "waterquality",
    tech: "Water-Quality Platform",
    blurb: "Go + React, multi-tenant, with a NATS JetStream audit log — built from a real city RFI!",
  },
  {
    key: "etl",
    tech: "Medallion ETL Pipeline",
    blurb: "Bronze → Silver → Gold across NBA, NFL & soccer — Airflow into DuckDB, in production!",
  },
];
