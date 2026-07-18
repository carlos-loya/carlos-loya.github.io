import { FiArrowUpRight } from "react-icons/fi";
import { Layer } from "./Layer";
import { Reveal } from "./Reveal";
import { sites, type Site } from "../content/projects";
import { layers } from "../descent";

const meta = layers.find((l) => l.id === "proving-ground")!;

function Portal({ site }: { site: Site }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-brd bg-panel transition-all hover:-translate-y-0.5 hover:border-accent/50">
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer noopener"
        className="relative block aspect-video overflow-hidden border-b border-brd"
      >
        <img
          src={site.image}
          alt={`Screenshot of ${site.name}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-3 top-3 rounded border border-accent/50 bg-bg/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-accent backdrop-blur-sm">
          ● LIVE
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="text-[17px] font-semibold tracking-tight text-fg-strong">
          {site.name}
        </h3>
        <p className="text-sm leading-relaxed text-fg">{site.blurb}</p>
        {site.tags && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-fg-dim">
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
            Enter <FiArrowUpRight size={14} />
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
    <Layer
      meta={meta}
      title="The gallery"
      subtitle="Sites I've designed, built, and shipped — running in the wild. Enter any of them."
    >
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sites.map((site) => (
          <Portal key={site.name} site={site} />
        ))}
      </Reveal>
    </Layer>
  );
}
