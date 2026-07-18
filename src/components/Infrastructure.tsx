import { Act } from "./Act";
import { Reveal } from "./Reveal";
import { experience } from "../content/experience";
import { world } from "../scroll/worlds";

// The employed roles that built the foundation (independent work lives in Systems).
const roles = experience.slice(1);

export function Infrastructure() {
  return (
    <Act
      world={world("experience")}
      eyebrow="Experience"
      title="Where I've worked"
      subtitle="Storage durability, observability, CI, and a 60-rack hardware lab — the roles behind the toolkit."
    >
      <div className="relative pl-6 sm:pl-8">
        <span className="absolute left-1.5 top-2 bottom-2 w-px bg-accent/50" />
        <div className="space-y-11">
          {roles.map((role) => (
            <Reveal key={role.when}>
              <div className="relative">
                <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 -translate-x-px rounded-sm border-2 border-accent bg-panel sm:-left-[1.8rem]" />
                <p className="font-mono text-[11px] tracking-[0.14em] text-fg-dim">
                  {role.when}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-fg-strong">
                  {role.title}
                </h3>
                <p className="text-sm text-accent">{role.company}</p>
                <p className="mt-3 max-w-[62ch] text-sm text-fg-dim">
                  {role.summary}
                </p>
                <ul className="mt-4 space-y-2">
                  {role.points.map((point, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg">
                      <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Act>
  );
}
