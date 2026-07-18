import { profile } from "../content/profile";
import { KineticHeading } from "./KineticHeading";
import LogoLoop, { type LogoItem } from "./LogoLoop";
import { techLogos } from "../content/skills";

const logos: LogoItem[] = techLogos.map(({ name, Icon }) => ({
  node: (
    <span className="text-fg-dim transition-colors group-hover/item:text-fg-strong">
      <Icon />
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

// Splits the headline so the accentWord renders crimson.
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

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-screen scroll-mt-20 flex-col justify-center px-6 pt-24 pb-16 sm:px-8"
    >
      <div className="mx-auto w-full max-w-4xl">
        {/* sky readout */}
        <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.16em]">
          <span className="text-accent">L0</span>
          <span className="text-fg-dim">SKY</span>
          <span className="flex items-center gap-1.5 text-fg-dim/70">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            CLEAR SKIES
          </span>
          <span className="ml-auto tabular-nums text-fg-dim/60">↓ 0000m</span>
        </div>
        <div className="mt-3 h-px w-full bg-gradient-to-r from-accent/50 via-brd to-transparent" />

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-fg-dim">
          {profile.eyebrow}
        </p>
        <KineticHeading
          as="h1"
          className="mt-5 max-w-[20ch] font-display text-[2.6rem] leading-[0.98] tracking-[-0.04em] text-fg-strong sm:text-6xl md:text-7xl"
        >
          <Headline />
        </KineticHeading>
        <p className="mt-7 max-w-[58ch] text-base leading-relaxed text-fg sm:text-lg">
          {profile.lede}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#control"
            className="group inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hi"
          >
            Begin descent
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
          <a
            href={profile.resume}
            className="rounded-md border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-accent/10"
          >
            Résumé (PDF)
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-accent/10"
          >
            GitHub
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-brd-soft pt-6 font-mono text-[13px] text-fg-dim">
          {profile.heroMeta.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>Based in {profile.location} · open to remote</span>
        </div>

        <div className="mt-10">
          <LogoLoop
            logos={logos}
            speed={38}
            gap={44}
            logoHeight={24}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="var(--color-bg)"
            ariaLabel="Technologies I work with"
          />
        </div>
      </div>

      <a
        href="#control"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-fg-dim/60 transition-colors hover:text-accent"
      >
        ↓ DESCEND
      </a>
    </header>
  );
}
