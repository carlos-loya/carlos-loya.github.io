import { FiArrowUpRight } from "react-icons/fi";
import { Act } from "./Act";
import { Reveal } from "./Reveal";
import { repos } from "../content/github";
import { profile } from "../content/profile";
import { world } from "../scroll/worlds";

// The independent builds, framed as GitHub project cards — show, don't tell.
export function GitHub() {
  return (
    <Act
      world={world("github")}
      eyebrow="GitHub"
      title="What I've shipped"
      subtitle="Independent builds, in production — packaged, documented, and running."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {repos.map((r, i) => (
          <Reveal key={r.name}>
            <article className="group flex h-full flex-col gap-3 rounded-2xl border border-brd bg-panel p-5 backdrop-blur-sm transition-colors hover:border-accent sm:p-6">
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.14em]">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-fg-dim">● IN PRODUCTION</span>
              </div>
              <h3 className="font-mono text-[15px] font-semibold tracking-tight text-fg-strong sm:text-base">
                {r.name}
              </h3>
              <p className="text-sm leading-relaxed text-fg">{r.blurb}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-fg-dim">
                {r.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {r.repo && (
                <a
                  href={r.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex items-center gap-1 pt-1 text-[13.5px] text-accent transition-colors hover:brightness-110"
                >
                  Source <FiArrowUpRight size={14} />
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
      <a
        href={profile.github}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-8 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.14em] text-accent transition-colors hover:brightness-110"
      >
        View GitHub <FiArrowUpRight size={14} />
      </a>
    </Act>
  );
}
