import { useRef, type ReactNode, type Ref } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiArrowUpRight } from "react-icons/fi";
import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "../content/profile";
import { skillGroups } from "../content/skills";
import { experience } from "../content/experience";
import { sites } from "../content/projects";
import { layers } from "../descent";
import type { Layer as LayerMeta } from "../descent";
import { KineticHeading } from "../components/KineticHeading";
import { useChapterStore } from "./chapters";
import type { Chapter } from "./path";

// Cinematic presentation: one PINNED panel per chapter, portaled into
// ScrollControls' sticky fixed layer (DescentCanvas). Panels don't scroll —
// they slide in when their chapter window is active (chapter store) and out on
// the travel legs, docked left over a scrim for legibility. Deliberately more
// compact than the static site (full detail lives there and in the résumé).

const byId = (id: string) => layers.find((l) => l.id === id)!;

function Header({ layer }: { layer: LayerMeta }) {
  return (
    <>
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.16em]">
        <span className="text-accent">{layer.code}</span>
        <span className="text-fg-dim">{layer.name}</span>
        <span className="ml-auto tabular-nums text-fg-dim/60">
          ↓ {String(layer.depth).padStart(4, "0")}m
        </span>
      </div>
      <div className="mt-3 h-px w-full bg-gradient-to-r from-accent/50 via-brd to-transparent" />
    </>
  );
}

function Headline() {
  const { headline, accentWord } = profile;
  const idx = headline.indexOf(accentWord);
  if (idx === -1) return <>{headline}</>;
  return (
    <>
      {headline.slice(0, idx)}
      <em className="not-italic text-accent">{accentWord}</em>
      {headline.slice(idx + accentWord.length)}
    </>
  );
}

// One pinned, full-viewport panel per chapter. GSAP slides it in when its
// chapter window is active and out when it isn't; travel legs show no panel.
// pointer-events: the whole layer is transparent so clicks reach the 3D
// canvas; only the docked panel opts back in so its links stay clickable.
function ChapterPanel({ id, layer, wide, children }: {
  id: Chapter["id"];
  layer?: LayerMeta;
  wide?: boolean;
  children: ReactNode;
}) {
  const active = useChapterStore((s) => s.chapter === id);
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.to(
        ref.current,
        active
          ? { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
          : { autoAlpha: 0, y: 24, duration: 0.35, ease: "power2.in" },
      );
    },
    { dependencies: [active] },
  );
  return (
    <section ref={ref} className="invisible absolute inset-0 flex items-center px-6 opacity-0 sm:px-14">
      {layer && <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent" />}
      <div className={`pointer-events-auto relative w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        {layer && (
          <>
            <Header layer={layer} />
            {/* chapter progress rail — scrubs 1:1 with scroll via --ch */}
            <div className="absolute -left-5 top-0 bottom-0 hidden w-px bg-brd sm:block">
              <div className="h-full w-full origin-top bg-accent" style={{ transform: "scaleY(var(--ch, 0))" }} />
            </div>
          </>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export function CinematicContent({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="pointer-events-none relative h-full w-full">
      {/* L0 · SKY */}
      <ChapterPanel id="hero" layer={byId("top")} wide>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-dim">
          {profile.eyebrow}
        </p>
        <KineticHeading as="h1" className="mt-4 font-display text-[2.4rem] uppercase leading-[0.95] tracking-[-0.04em] text-fg-strong sm:text-6xl">
          <Headline />
        </KineticHeading>
        <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-fg sm:text-base">
          {profile.lede}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={profile.resume} className="rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hi">
            Résumé (PDF)
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer noopener" className="rounded-md border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-accent/10">
            GitHub
          </a>
        </div>
        <p className="mt-10 font-mono text-[11px] tracking-[0.3em] text-fg-dim/60">↓ SCROLL TO DESCEND</p>
      </ChapterPanel>

      {/* L1 · THE GARDEN — the tech-toolkit garden: the stack, alive */}
      <ChapterPanel id="garden" layer={byId("control")}>
        <KineticHeading className="font-display text-3xl uppercase tracking-[-0.04em] text-fg-strong sm:text-4xl">
          The toolkit garden
        </KineticHeading>
        <p className="mt-3 text-sm text-fg-dim">
          The stack I build with — <span className="text-accent">hover a critter</span> to meet it.
        </p>
        <dl className="mt-6 space-y-4">
          {skillGroups.map((g) => (
            <div key={g.title}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{g.title}</dt>
              <dd className="mt-1.5 text-[15px] text-fg">{g.items.join("  ·  ")}</dd>
            </div>
          ))}
        </dl>
      </ChapterPanel>

      {/* L2 · THE WORKSHOP — systems shipped, as mechanical rigs in the shed */}
      <ChapterPanel id="workshop" layer={byId("data-plane")}>
        <KineticHeading className="font-display text-3xl uppercase tracking-[-0.04em] text-fg-strong sm:text-4xl">
          Systems I've shipped
        </KineticHeading>
        <p className="mt-3 max-w-[44ch] text-sm text-fg-dim">{experience[0].summary}</p>
        <ol className="mt-6 space-y-4">
          {experience[0].points.map((pt, i) => (
            <li key={i} className="border-l-2 border-accent/40 pl-4">
              <span className="font-mono text-[11px] tracking-[0.14em] text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-[14.5px] leading-relaxed text-fg">{pt}</p>
            </li>
          ))}
        </ol>
      </ChapterPanel>

      {/* L3 · THE ROAD — travel caption only, no scrim/dock */}
      <ChapterPanel id="road">
        <p className="absolute bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-[0.3em] text-fg-dim/70">
          EN ROUTE — AROUND THE WORLD ↓
        </p>
      </ChapterPanel>

      {/* L4 · THE DRIVEWAY */}
      <ChapterPanel id="driveway" layer={byId("infrastructure")}>
        <KineticHeading className="font-display text-3xl uppercase tracking-[-0.04em] text-fg-strong sm:text-4xl">
          Where I've worked
        </KineticHeading>
        <ul className="mt-6 space-y-5">
          {experience.slice(1).map((r) => (
            <li key={r.when}>
              <p className="font-mono text-[11px] tracking-[0.14em] text-fg-dim">{r.when}</p>
              <p className="mt-1 text-[15px] font-semibold text-fg-strong">
                {r.title} <span className="text-accent">· {r.company}</span>
              </p>
              <p className="mt-1 max-w-[52ch] text-[13.5px] leading-relaxed text-fg-dim">{r.summary}</p>
            </li>
          ))}
        </ul>
      </ChapterPanel>

      {/* L5 · THE GALLERY */}
      <ChapterPanel id="gallery" layer={byId("proving-ground")}>
        <KineticHeading className="font-display text-3xl uppercase tracking-[-0.04em] text-fg-strong sm:text-4xl">
          The gallery
        </KineticHeading>
        <p className="mt-3 text-sm text-fg-dim">
          Shipped and running in the wild — <span className="text-accent">click a frame</span> to open it.
        </p>
        <ul className="mt-6 space-y-5">
          {sites.map((s) => (
            <li key={s.name} className="border-l-2 border-accent/40 pl-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.14em] text-accent">● LIVE</span>
                <h3 className="text-[15px] font-semibold text-fg-strong">{s.name}</h3>
              </div>
              <p className="mt-1 max-w-[52ch] text-[13.5px] leading-relaxed text-fg">{s.blurb}</p>
              <div className="mt-2 flex gap-4 text-[13px]">
                <a href={s.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-accent hover:text-accent-hi">
                  Enter <FiArrowUpRight size={13} />
                </a>
                {s.github && (
                  <a href={s.github} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-accent hover:text-accent-hi">
                    Source <FiArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </ChapterPanel>

      {/* L6 · THE DESK */}
      <ChapterPanel id="desk" layer={byId("core")}>
        <KineticHeading className="font-display text-3xl uppercase tracking-[-0.04em] text-fg-strong sm:text-5xl">
          You've reached the desk
        </KineticHeading>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-fg-dim">
          Open to full-stack and backend roles, and to interesting builds. Email is the fastest way in.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {[
            { label: profile.email, href: `mailto:${profile.email}`, Icon: FaEnvelope },
            { label: "GitHub", href: profile.github, Icon: FaGithub },
            { label: "LinkedIn", href: profile.linkedin, Icon: FaLinkedin },
            { label: "Résumé", href: profile.resume, Icon: FaFilePdf },
          ].map(({ label, href, Icon }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer noopener" : undefined} className="inline-flex items-center gap-2 rounded-md border border-brd px-4 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:bg-accent/10 hover:text-fg-strong">
              <Icon size={14} /> {label}
            </a>
          ))}
        </div>
        <p className="mt-10 font-mono text-[11px] tracking-[0.12em] text-fg-dim">
          <span className="text-accent">↓ 0m</span> · © {new Date().getFullYear()} {profile.name} ·{" "}
          <a href="/attribution.md" target="_blank" rel="noreferrer noopener" className="underline decoration-dotted underline-offset-2 transition-colors hover:text-accent">
            3D credits
          </a>
        </p>
      </ChapterPanel>

      {/* live depth readout — CSS counter renders var(--depth), zero React */}
      <div className="depth-live absolute bottom-5 left-6 font-mono text-[11px] tracking-[0.16em] text-fg-dim" />
    </div>
  );
}
