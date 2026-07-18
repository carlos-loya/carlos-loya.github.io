import { Act } from "./Act";
import { Reveal } from "./Reveal";
import { skillGroups } from "../content/skills";
import { world } from "../scroll/worlds";

export function Skills() {
  return (
    <Act
      world={world("toolkit")}
      eyebrow="Toolkit"
      title="What I reach for"
      subtitle="Languages at the surface, platform and data underneath — the stack behind everything on this page."
    >
      <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="group relative overflow-hidden rounded-2xl border border-brd bg-panel p-5 backdrop-blur-sm transition-colors hover:border-accent"
          >
            <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-sm bg-brd transition-colors group-hover:bg-accent" />
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-brd bg-panel-2 px-2.5 py-1 text-[13px] text-fg"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </Act>
  );
}
