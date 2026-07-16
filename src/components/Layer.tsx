import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import type { Layer as LayerMeta } from "../descent";

// One depth layer of the descent. Renders the machine-readout header
// (code · name · depth) over a hairline, then the display title and content.
// Every content section is wrapped in one of these so the whole page reads
// as a single instrument panel.
export function Layer({
  meta,
  title,
  subtitle,
  children,
  as = "section",
}: {
  meta: LayerMeta;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  as?: "section" | "footer" | "header";
}) {
  const Tag = as;
  return (
    <Tag id={meta.id} className="scroll-mt-20 border-t border-brd-soft py-24 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.16em]">
            <span className="text-accent">{meta.code}</span>
            <span className="text-fg-dim">{meta.name}</span>
            <span className="ml-auto tabular-nums text-fg-dim/60">
              DEPTH −{String(meta.depth).padStart(4, "0")}m
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-gradient-to-r from-accent/50 via-brd to-transparent" />
          {title && (
            <h2 className="mt-6 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-fg-strong sm:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-fg-dim">
              {subtitle}
            </p>
          )}
        </Reveal>
        <div className={title || subtitle ? "mt-12" : ""}>{children}</div>
      </div>
    </Tag>
  );
}
