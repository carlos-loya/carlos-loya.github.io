import { FiArrowUpRight } from "react-icons/fi";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { projects, type Project } from "../content/projects";

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border border-brd bg-panel p-[22px] transition-all hover:-translate-y-0.5 hover:border-accent/40 ${
        project.featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-baseline gap-3">
        <h3 className="text-[16.5px] font-semibold tracking-tight text-fg-strong">
          {project.name}
        </h3>
        {project.featured && (
          <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
            Featured
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-fg">{project.blurb}</p>
      <div className="mt-auto flex flex-wrap gap-3 font-mono text-xs text-fg-dim">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="flex gap-4 text-[13.5px]">
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-hi"
        >
          GitHub <FiArrowUpRight size={14} />
        </a>
        {project.docs && (
          <a
            href={project.docs}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-hi"
          >
            Documentation <FiArrowUpRight size={14} />
          </a>
        )}
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Things I've built"
      subtitle="Pulled from real repositories — the full set lives on GitHub."
    >
      <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </Reveal>
    </Section>
  );
}
