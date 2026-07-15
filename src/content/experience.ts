// Lead each bullet with impact (what you owned, scale, results).
export interface Role {
  when: string;
  title: string;
  company: string;
  summary: string;
  points: string[];
}

export const experience: Role[] = [
  {
    when: "Nov 2022 — Present",
    title: "Independent Software Developer",
    company: "Self-employed (Remote)",
    summary:
      "Deliver production-grade systems for clients, from small weekend builds to platforms in daily use.",
    points: [
      "Built a Kubernetes operator for database-row archival, packaged as a Helm chart with a standalone CLI for non-Kubernetes environments.",
      "Shipped a Go water-quality compliance platform with a React/TypeScript frontend and a multi-tenant, NATS JetStream audit log, built from a real city RFI.",
      "Built a multi-sport ETL pipeline (NBA, NFL, soccer) on a Bronze → Silver → Gold medallion architecture, scheduled with Airflow into DuckDB, now in production use.",
    ],
  },
  {
    when: "Sept 2021 — Nov 2022",
    title: "Software Developer",
    company: "InfluxData (Remote)",
    summary:
      "Owned durability and observability for the storage layer of a distributed time-series platform.",
    points: [
      "Wrote a Go microservice that backs up Kafka messages to cloud object stores (S3 and others) for disaster recovery, event replay, and compliance.",
      "Set up Kafka rack awareness at the cluster level, cutting inter-region traffic 13%.",
      "Built observability dashboards (InfluxCloud, later Grafana) tracking time-to-be-readable and paging on-call via PagerDuty when SLOs were breached.",
      "Traced an over-provisioned volume from RED/USE dashboards and fixed it via the Kubernetes CRD, saving $2K+ in projected cloud costs.",
    ],
  },
  {
    when: "Nov 2019 — Sept 2021",
    title: "Software Developer",
    company: "Comcast",
    summary:
      "Built tooling, tests, and infrastructure for Xfinity's IoT test platform.",
    points: [
      "Contributed Go modules, bug fixes, and support tooling to Plax, an open-source test framework, and wrote the Bash script that inspired the plaxrun CLI.",
      "Wrote automated tests for the safety-critical Alarm Service, running a chaos environment for failure injection and catching WebSocket edge cases never tested before.",
      "Built a Vue.js dashboard that streamed real-time logs and test output while suites ran.",
      "Managed Concourse CI and Terraform infrastructure across teams, deploying to AWS ECS and Cloud Foundry.",
    ],
  },
  {
    when: "Nov 2018 — Nov 2019",
    title: "Automation Engineer",
    company: "Comcast (via Technical Youth LLC)",
    summary:
      "Kept a large home-security hardware test lab and its automation stable.",
    points: [
      "Extended a Go test infrastructure (runner, persister, observer) driven by S3 events, storing results in RDS and streaming logs to stakeholders in real time.",
      "Kept a 60+ hardware-rack lab working, investigating flaky tests and swapping failing components to keep the regression suite stable.",
      "Set up Concourse CI to run regression tests hourly across dev and staging, feeding JUnit results into AWS RDS and trends into QuickSight.",
      "Wrote behavior-driven integration tests with Cucumber and GoDog so manual QA could author scenarios without knowing Go.",
    ],
  },
];
