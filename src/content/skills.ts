import type { IconType } from "react-icons";
import {
  SiGo,
  SiPython,
  SiTypescript,
  SiReact,
  SiKubernetes,
  SiDocker,
  SiPostgresql,
  SiHelm,
  SiTerraform,
  SiApacheparquet,
  SiGooglecloud,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";

// Skill groups shown as cards. Edit freely.
export const skillGroups = [
  { title: "Languages", items: ["Go", "Python", "TypeScript", "Java", "SQL"] },
  {
    title: "Infra & Platform",
    items: ["Kubernetes", "Docker", "Helm", "controller-runtime", "AWS", "GCP"],
  },
  {
    title: "Data",
    items: ["Postgres", "MySQL", "TimescaleDB", "Parquet", "ETL"],
  },
] as const;

// Logos for the scrolling LogoLoop. Rendered monochrome (currentColor).
export const techLogos: { name: string; Icon: IconType }[] = [
  { name: "Go", Icon: SiGo },
  { name: "Python", Icon: SiPython },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "React", Icon: SiReact },
  { name: "Kubernetes", Icon: SiKubernetes },
  { name: "Docker", Icon: SiDocker },
  { name: "Postgres", Icon: SiPostgresql },
  { name: "Helm", Icon: SiHelm },
  { name: "AWS", Icon: FaAws },
  { name: "Google Cloud", Icon: SiGooglecloud },
  { name: "Terraform", Icon: SiTerraform },
  { name: "Parquet", Icon: SiApacheparquet },
];
