// Past employers, surfaced as the sticker decals on the coffee mug. Keyed by the
// StickerId a click resolves to (see STICKERS in ../desk/DeskModel.tsx). Content
// distilled from public/resume.pdf — the résumé stays the canonical record.
export type CompanyId = "comcast" | "influxdata";

export interface Company {
  id: CompanyId;
  name: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
}

export const companies: Record<CompanyId, Company> = {
  comcast: {
    id: "comcast",
    name: "Comcast",
    role: "Software Developer",
    dates: "Nov 2019 – Sept 2021",
    location: "Austin, TX",
    bullets: [
      "Contributed Go modules, bug fixes, and support tooling to Plax, the open-source test framework for Xfinity's IoT platform — wrote the original Bash script that became the plaxrun CLI.",
      "Ran Concourse CI pipelines and Terraform infrastructure for several teams, deploying to AWS ECS and Comcast's Cloud Foundry platform.",
    ],
  },
  influxdata: {
    id: "influxdata",
    name: "InfluxData",
    role: "Software Developer",
    dates: "Sept 2021 – Nov 2022",
    location: "Remote, USA",
    bullets: [
      "Built a Go microservice that backs up Kafka messages to cloud object stores (S3 and others) for disaster recovery, event replay, and compliance.",
      "Set up Kafka rack awareness at the cluster level (broker configs + partition assignments), cutting inter-region traffic and taking 13% off the team's cloud bill.",
    ],
  },
};
