import type { ReactNode } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "../content/profile";
import { skillGroups } from "../content/skills";
import { experience } from "../content/experience";
import { sites } from "../content/projects";
import { layers } from "../descent";
import type { Layer as LayerMeta } from "../descent";

// Cinematic presentation: one lean, docked panel per beat, timed to the
// camera arriving at that structure. Deliberately more compact than the
// static site (full detail lives there and in the résumé) — text rides
// inside the 3D moment, docked left over a scrim for legibility.

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

// One beat: full-height so it maps to a scroll page; content docked left,
// vertically centered, over a left→right scrim.
function Beat({ layer, wide, children }: { layer: LayerMeta; wide?: boolean; children: ReactNode }) {
  return (
    // pointer-events-none so clicks pass through to the 3D canvas (e.g. the
    // CRTs); re-enabled only on the docked panel so its links stay clickable.
    <section className="pointer-events-none relative flex min-h-screen items-center px-6 sm:px-14">
      <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent" />
      <div className={`pointer-events-auto relative w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <Header layer={layer} />
        <div className="mt-6">{children}</div>
      </div>
    </section>
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

export function CinematicContent() {
  return (
    // The whole HTML layer is pointer-transparent so clicks reach the 3D CRTs;
    // only the docked panels (below) opt back in via pointer-events-auto.
    <div className="pointer-events-none w-screen">
      {/* L0 · SKY */}
      <Beat layer={byId("top")} wide>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-dim">
          {profile.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-[2.4rem] font-black uppercase leading-[0.95] tracking-tight text-fg-strong sm:text-6xl">
          <Headline />
        </h1>
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
      </Beat>

      {/* L1 · CONTROL */}
      <Beat layer={byId("control")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-fg-strong sm:text-4xl">
          What I reach for
        </h2>
        <p className="mt-3 text-sm text-fg-dim">The stack I build with.</p>
        <dl className="mt-6 space-y-4">
          {skillGroups.map((g) => (
            <div key={g.title}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{g.title}</dt>
              <dd className="mt-1.5 text-[15px] text-fg">{g.items.join("  ·  ")}</dd>
            </div>
          ))}
        </dl>
      </Beat>

      {/* L2 · DATA_PLANE */}
      <Beat layer={byId("data-plane")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-fg-strong sm:text-4xl">
          Systems I've shipped
        </h2>
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
      </Beat>

      {/* L3 · INFRASTRUCTURE */}
      <Beat layer={byId("infrastructure")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-fg-strong sm:text-4xl">
          Where I've worked
        </h2>
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
      </Beat>

      {/* L4 · PROVING_GROUND */}
      <Beat layer={byId("proving-ground")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-fg-strong sm:text-4xl">
          Hall of fame
        </h2>
        <p className="mt-3 text-sm text-fg-dim">
          Shipped and running in the wild — <span className="text-accent">click a screen</span> to open it.
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
      </Beat>

      {/* L5 · CORE */}
      <Beat layer={byId("core")}>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight text-fg-strong sm:text-5xl">
          You've reached the desk
        </h2>
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
      </Beat>
    </div>
  );
}
