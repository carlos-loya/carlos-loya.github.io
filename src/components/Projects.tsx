import { useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Act } from "./Act";
import { ToyField } from "./ToyField";
import { sites, type Site } from "../content/projects";
import { world, worldStyle } from "../scroll/worlds";
import { motionOff } from "../scroll/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const w = world("work");

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
  const pinWrap = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const [off] = useState(motionOff);

  // Pin the section; a scrubbed timeline first sweeps the headline right→left,
  // then decks the cards one at a time — each front card lifts, rotates, and
  // tucks to the back while the next promotes forward. Fully reversible.
  useGSAP(
    () => {
      if (off || !deck.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(".deck-card", deck.current);
      const n = cards.length;
      if (!n) return;

      // Resting pose for a card at stack-depth d (0 = front, higher = further back).
      const poseFor = (d: number) => ({
        xPercent: 0,
        yPercent: d === 0 ? 0 : -7 * d, // peek up behind the front card
        scale: 1 - 0.06 * d,
        rotate: d === 0 ? 0 : d % 2 ? 4 : -4,
        opacity: d === 0 ? 1 : Math.max(0.4, 1 - 0.28 * d),
        zIndex: 30 - d,
      });
      cards.forEach((card, i) => gsap.set(card, poseFor(i)));

      // Query the heading by class at effect time (a captured ref can point at a
      // stale node under StrictMode; the class query always hits the live DOM).
      const headingEl = root.current!.querySelector<HTMLElement>(".work-title");

      const vh = () => window.innerHeight;

      // Header slides in right→left as the section rises into view — triggered on
      // the OUTER section (never pinned), so it settles before the pin engages.
      // Use a timeline (not a bare tween): under StrictMode a standalone tween's
      // ScrollTrigger can orphan from its animation, leaving the scrub inert.
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: 1 },
        })
        .fromTo(
          headingEl,
          { xPercent: 105, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: "none" },
        );

      // Pin the inner wrapper and deck the cards below the header.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrap.current,
          start: "top top",
          end: () => "+=" + vh() * n,
          pin: pinWrap.current,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Each advance sends the front card to the back and shifts the rest forward.
      for (let k = 0; k < n - 1; k++) {
        const label = "adv" + k;
        tl.addLabel(label);
        cards.forEach((card, c) => {
          const dNew = (c - (k + 1) + n) % n;
          if (c === k) {
            // Outgoing front card: lift over the top, then drop to the back.
            tl.to(
              card,
              {
                keyframes: [
                  { yPercent: -40, scale: 1.05, rotate: 9, opacity: 1, zIndex: 40, duration: 0.5, ease: "power2.in" },
                  { ...poseFor(dNew), duration: 0.5, ease: "power2.out" },
                ],
              },
              label,
            );
          } else {
            tl.to(card, { ...poseFor(dNew), duration: 1, ease: "power2.inOut" }, label);
          }
        });
      }
    },
    { scope: root, dependencies: [off] },
  );

  // Fallback: a plain vertical grid, fully legible, no pin/hijack.
  if (off) {
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
      className="act relative isolate mt-[35vh] overflow-hidden"
    >
      <ToyField />

      {/* Inner wrapper is what gets pinned (keeps the entrance trigger, which
          lives on the section, clear of the pin). */}
      <div ref={pinWrap} className="relative flex h-screen flex-col overflow-hidden">
        {/* Header band: the title slides in from the right, then holds above the
            deck for the whole pinned run. */}
        <div className="relative z-20 shrink-0 overflow-hidden px-6 pt-24 sm:pt-28">
          <div
            aria-hidden
            className="work-title whitespace-nowrap font-display text-[7.5vw] uppercase leading-none tracking-[-0.04em] text-fg-strong"
          >
            Live in the wild
          </div>
        </div>
        {/* Screen-reader heading for the pinned, animated section. */}
        <h2 className="sr-only">Work — live in the wild</h2>

        {/* The card deck fills the space below the header; all cards share one
            grid cell so they stack centered. */}
        <div ref={deck} className="relative z-10 grid flex-1 place-items-center px-6 pb-12">
          {sites.map((site) => (
            <div
              key={site.name}
              className="deck-card w-[min(88vw,880px)] will-change-transform [grid-area:1/1] [&>article]:w-full [&>article]:max-w-none"
            >
              <Card site={site} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
