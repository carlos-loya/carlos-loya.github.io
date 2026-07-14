import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

// A page section: consistent vertical rhythm, top divider, centered container,
// and an optional eyebrow/title/subtitle header (revealed on scroll).
export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow?: string;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-t border-brd-soft py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-7">
        {title && (
          <Reveal>
            {eyebrow && (
              <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.16em] text-accent">
                {eyebrow}
              </p>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-fg-strong sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2.5 max-w-[54ch] text-fg-dim">{subtitle}</p>
            )}
          </Reveal>
        )}
        <div className={title ? "mt-9" : ""}>{children}</div>
      </div>
    </section>
  );
}
