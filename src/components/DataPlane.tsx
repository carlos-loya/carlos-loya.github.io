import { Act } from "./Act";
import { Reveal } from "./Reveal";
import { experience } from "../content/experience";
import { world } from "../scroll/worlds";

// The independent-work role is the "systems shipped" showcase — show, don't tell.
const role = experience[0];

export function DataPlane() {
  return (
    <Act
      world={world("systems")}
      eyebrow="Systems"
      title="Systems I've shipped"
      subtitle={role.summary}
    >
      <div className="space-y-3.5">
        {role.points.map((point, i) => (
          <Reveal key={i}>
            <article className="group relative rounded-2xl border border-brd bg-panel p-5 pl-6 backdrop-blur-sm transition-colors hover:border-accent sm:p-6 sm:pl-7">
              <span className="absolute inset-y-4 left-0 w-0.5 rounded-full bg-accent/50 transition-colors group-hover:bg-accent" />
              <div className="mb-2.5 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em]">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-fg-dim">● IN PRODUCTION</span>
              </div>
              <p className="text-[15px] leading-relaxed text-fg sm:text-base">
                {point}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 font-mono text-[12px] text-fg-dim">
        {role.title} · {role.when}
      </p>
    </Act>
  );
}
