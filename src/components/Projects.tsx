import { useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Act } from "./Act";
import { KineticHeading } from "./KineticHeading";
import { ToyField } from "./ToyField";
import { sites, type Site } from "../content/projects";
import { world, worldStyle } from "../scroll/worlds";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const w = world("work");
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Card({ site }: { site: Site }) {
  return (
    <article className="group flex w-[82vw] shrink-0 flex-col overflow-hidden rounded-2xl border border-brd bg-panel backdrop-blur-sm transition-colors hover:border-accent md:w-[44vw]">
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
        <span className="absolute right-3 top-3 rounded-md border border-accent bg-panel px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-accent backdrop-blur-sm">
          ● LIVE
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="text-[19px] font-semibold tracking-tight text-fg-strong">
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
            className="inline-flex items-center gap-1 text-accent transition-colors hover:brightness-110"
          >
            Visit <FiArrowUpRight size={14} />
          </a>
          {site.github && (
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-accent transition-colors hover:brightness-110"
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
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);

  // Pin the section and translate the track sideways as you scroll — vertical
  // scroll becomes lateral travel across the gallery, then releases. Distance
  // scrolled == distance the track must move. Skipped under reduced motion.
  useGSAP(
    () => {
      if (reduced || !track.current) return;
      const distance = () => track.current!.scrollWidth - window.innerWidth;
      if (distance() <= 0) return; // strip fits the viewport — nothing to pin
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  // Fallback: a plain vertical grid, fully legible, no pin/hijack.
  if (reduced) {
    return (
      <Act
        world={w}
        eyebrow="Work"
        title="Live in the wild"
        subtitle="Sites I've designed, built, and shipped — each one running in production."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {sites.map((site) => (
            <div key={site.name} className="[&>article]:w-full [&>article]:max-w-none">
              <Card site={site} />
            </div>
          ))}
        </div>
      </Act>
    );
  }

  return (
    <section
      ref={root}
      id="work"
      style={worldStyle(w)}
      className="act relative isolate h-screen overflow-hidden"
    >
      <ToyField />
      <div ref={track} className="relative z-10 flex h-full items-center gap-8 px-6 will-change-transform sm:px-8">
        {/* Intro panel — the kinetic header rides along at the head of the strip. */}
        <div className="flex w-[82vw] shrink-0 flex-col justify-center md:w-[44vw]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">Work</p>
          <KineticHeading className="mt-4 font-display text-[2.4rem] uppercase leading-[0.9] tracking-[-0.04em] text-fg-strong sm:text-6xl md:text-7xl">
            Live in the wild
          </KineticHeading>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-fg-dim">
            Sites I've designed, built, and shipped — each one running in production.
          </p>
          <p className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] text-accent">
            SCROLL <span aria-hidden>→</span>
          </p>
        </div>
        {sites.map((site) => (
          <Card key={site.name} site={site} />
        ))}
      </div>
    </section>
  );
}
