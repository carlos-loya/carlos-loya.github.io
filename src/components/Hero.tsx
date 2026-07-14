import { profile } from "../content/profile";
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

// Splits the headline so the accentWord renders in the accent color.
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
    <header id="top" className="px-7 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {profile.eyebrow}
        </p>
        <h1 className="max-w-[15ch] text-4xl font-bold leading-[1.06] tracking-tight text-fg-strong text-balance sm:text-5xl md:text-6xl">
          <Headline />
        </h1>
        <p className="mt-6 max-w-[56ch] text-base text-fg sm:text-lg">
          {profile.lede}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="rounded-lg border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-accent-hi hover:bg-accent-hi dark:text-[#0b1017]"
          >
            View projects
          </a>
          <a
            href={profile.resume}
            className="rounded-lg border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-accent/10"
          >
            Résumé (PDF)
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-accent/10"
          >
            GitHub
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-brd-soft pt-6 font-mono text-[13px] text-fg-dim">
          {profile.heroMeta.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>
            Based in {profile.location} · open to remote
          </span>
        </div>

        <div className="mt-10">
          <LogoLoop
            logos={logos}
            speed={38}
            gap={44}
            logoHeight={26}
            pauseOnHover
            scaleOnHover
            fadeOut
            fadeOutColor="var(--color-bg)"
            ariaLabel="Technologies I work with"
          />
        </div>
      </div>
    </header>
  );
}
