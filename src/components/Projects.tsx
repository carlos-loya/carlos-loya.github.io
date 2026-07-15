import { FiArrowUpRight } from "react-icons/fi";
import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { sites, type Site } from "../content/projects";

function SiteCard({ site }: { site: Site }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-brd bg-panel transition-all hover:-translate-y-0.5 hover:border-accent/40">
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer noopener"
        className="block aspect-video overflow-hidden border-b border-brd"
      >
        <img
          src={site.image}
          alt={`Screenshot of ${site.name}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-[1.03]"
        />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-[22px]">
        <h3 className="text-[16.5px] font-semibold tracking-tight text-fg-strong">
          {site.name}
        </h3>
        <p className="text-sm leading-relaxed text-fg">{site.blurb}</p>
        {site.tags && (
          <div className="flex flex-wrap gap-3 font-mono text-xs text-fg-dim">
            {site.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className="mt-auto flex gap-4 pt-1 text-[13.5px]">
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-hi"
          >
            Visit <FiArrowUpRight size={14} />
          </a>
          {site.github && (
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-hi"
            >
              Source <FiArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Sites I've shipped"
      subtitle="Websites I've designed, built, and deployed."
    >
      <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {sites.map((site) => (
          <SiteCard key={site.name} site={site} />
        ))}
      </Reveal>
    </Section>
  );
}
