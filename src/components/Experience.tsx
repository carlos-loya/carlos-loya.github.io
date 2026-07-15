import { Section } from "./Section";
import { Timeline, type TimelineEntry } from "./Timeline";
import { experience } from "../content/experience";

const entries: TimelineEntry[] = experience.map((role) => ({
  title: role.when,
  content: (
    <div className="pb-2">
      <p className="text-base font-semibold text-fg-strong">{role.title}</p>
      <p className="mb-3 text-sm text-accent">{role.company}</p>
      <p className="mb-4 text-sm text-fg-dim">{role.summary}</p>
      <ul className="space-y-2">
        {role.points.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-fg">
            <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Path"
      title="Experience"
      subtitle="Where I've worked."
    >
      <Timeline data={entries} />
    </Section>
  );
}
