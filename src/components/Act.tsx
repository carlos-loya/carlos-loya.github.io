import type { ReactNode } from "react";
import { KineticHeading } from "./KineticHeading";
import { Reveal } from "./Reveal";
import { ToyField } from "./ToyField";
import { worldStyle, type World } from "../scroll/worlds";

// One color-world act. Sets its world vars (so every child color utility resolves
// per-world), scatters the toy garnish behind, and renders the kinetic header
// (eyebrow · big display title · subtitle) over the content. Replaces the old
// descent `Layer` — no depth/HUD chrome.
export function Act({
  world,
  eyebrow,
  title,
  subtitle,
  children,
  as = "section",
}: {
  world: World;
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  as?: "section" | "footer";
}) {
  const Tag = as;
  return (
    <Tag
      id={world.id}
      style={worldStyle(world)}
      className="act relative isolate flex min-h-screen scroll-mt-20 flex-col justify-center overflow-hidden px-6 py-28 sm:px-8"
    >
      <ToyField />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-dim">
            {eyebrow}
          </p>
        )}
        {title && (
          <KineticHeading className="mt-4 font-display text-[2.4rem] uppercase leading-[0.9] tracking-[-0.04em] text-fg-strong sm:text-6xl md:text-7xl">
            {title}
          </KineticHeading>
        )}
        {subtitle && (
          <Reveal>
            <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-fg-dim">
              {subtitle}
            </p>
          </Reveal>
        )}
        {children && <div className={title || subtitle ? "mt-14" : ""}>{children}</div>}
      </div>
    </Tag>
  );
}
