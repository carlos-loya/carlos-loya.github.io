import { profile } from "../content/profile";
import { ScrubHeading } from "../scroll/ScrubHeading";
import { ToyField } from "./ToyField";
import LogoLoop, { type LogoItem } from "./LogoLoop";
import { techLogos } from "../content/skills";
import { world, worldStyle } from "../scroll/worlds";

const w = world("top");

const logos: LogoItem[] = techLogos.map(({ name, Icon }) => ({
  node: (
    <span className="text-fg-dim transition-colors group-hover/item:text-fg-strong">
      <Icon />
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

// Splits the headline so the accent phrase renders in the world accent color.
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
      style={worldStyle(w)}
      className="act relative isolate min-h-screen overflow-hidden"
    >
      <ToyField />

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 pt-24 pb-8 sm:px-10">
        {/* top band — eyebrow left, one-line lede right */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-dim">
            {profile.eyebrow}
          </p>
          <p className="max-w-[42ch] text-base leading-relaxed text-fg sm:text-lg md:text-right">
            {profile.lede}
          </p>
        </div>

        {/* hero band — the giant headline, anchored left, bleeds off the edge */}
        <div className="-ml-[0.5vw] md:-ml-[1.5vw]">
          <ScrubHeading
            as="h1"
            recipe="assemble"
            enterOnLoad
            label={profile.headline}
            className="font-display uppercase leading-[0.86] tracking-[-0.045em] text-fg-strong"
          >
            <span className="block" style={{ fontSize: "clamp(2.4rem, 11vw, 8rem)" }}>
              <Headline />
            </span>
          </ScrubHeading>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-md border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              See the work
              <span className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
            <a
              href={profile.resume}
              className="rounded-md border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-panel"
            >
              Résumé (PDF)
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-brd px-5 py-2.5 text-sm font-medium text-fg-strong transition-colors hover:border-accent hover:bg-panel"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* base band — meta line + logo marquee, full width */}
        <div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-brd-soft pt-6 font-mono text-[13px] text-fg-dim">
            {profile.heroMeta.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span>Based in {profile.location} · open to remote</span>
            <a href="#toolkit" className="ml-auto tracking-[0.2em] text-fg-dim transition-colors hover:text-accent">
              ↓ SCROLL
            </a>
          </div>
          <div className="mt-6">
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
      </div>
    </header>
  );
}
