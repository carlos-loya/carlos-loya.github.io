import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { skillGroups } from "../content/skills";

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Toolbox"
      title="The stack I reach for"
      subtitle="Grouped by layer — language, platform, and the data underneath."
    >
      <Reveal className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-xl border border-brd bg-panel p-5 transition-colors hover:border-accent/40"
          >
            <h3 className="mb-3.5 flex items-center gap-2.5 font-mono text-[13px] font-semibold text-fg-strong">
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-accent" />
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
    </Section>
  );
}
