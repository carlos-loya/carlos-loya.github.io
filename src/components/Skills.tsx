import { Layer } from "./Layer";
import { Reveal } from "./Reveal";
import { skillGroups } from "../content/skills";
import { layers } from "../descent";

// Skills live at L1 THE GARDEN (the cinematic "toolkit garden"); the static
// site mirrors that mapping so the shared nav labels stay consistent.
const meta = layers.find((l) => l.id === "control")!;

export function Skills() {
  return (
    <Layer
      meta={meta}
      title="What I reach for"
      subtitle="The stack I reach for, grouped by depth — language at the surface, platform below, data underneath."
    >
      <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="group relative overflow-hidden rounded-lg border border-brd bg-panel p-5 transition-colors hover:border-accent/50"
          >
            {/* corner node that lights on hover */}
            <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-sm bg-brd transition-colors group-hover:bg-accent" />
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
              {group.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded border border-brd bg-panel-2 px-2.5 py-1 text-[13px] text-fg"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </Layer>
  );
}
