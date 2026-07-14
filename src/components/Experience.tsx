import { Section } from "./Section";
import { Timeline, type TimelineEntry } from "./Timeline";
import { experience } from "../content/experience";

const entries: TimelineEntry[] = experience.map((role) => ({
  title: role.when,
  content: (
    <div className="pb-2">
      <p className="text-base font-semibold text-fg-strong">{role.title}</p>
      <p className="mb-2 text-sm text-accent">{role.company}</p>
      <p className={`text-sm text-fg ${role.todo ? "italic text-fg-dim" : ""}`}>
        {role.description}
      </p>
    </div>
  ),
}));

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Path"
      title="Experience"
      subtitle={
        <>
          Where I've worked.{" "}
          <span className="italic text-fg-dim">
            (placeholder — real roles go in <code>src/content/experience.ts</code>)
          </span>
        </>
      }
    >
      <Timeline data={entries} />
    </Section>
  );
}
