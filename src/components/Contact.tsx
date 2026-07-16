import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { Layer } from "./Layer";
import { profile } from "../content/profile";
import { layers } from "../descent";

const meta = layers.find((l) => l.id === "core")!;

const socials = [
  { label: profile.email, href: `mailto:${profile.email}`, Icon: FaEnvelope },
  { label: "GitHub", href: profile.github, Icon: FaGithub },
  { label: "LinkedIn", href: profile.linkedin, Icon: FaLinkedin },
  { label: "Résumé (PDF)", href: profile.resume, Icon: FaFilePdf },
];

export function Contact() {
  return (
    <Layer
      meta={meta}
      as="footer"
      title="You've reached the core"
      subtitle="Open to full-stack and backend roles, and to interesting builds. Email is the fastest path in — I read everything."
    >
      <div className="flex flex-wrap gap-3">
        {socials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
            className="inline-flex items-center gap-2 rounded-md border border-brd px-4 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:bg-accent/10 hover:text-fg-strong"
          >
            <Icon size={15} /> {label}
          </a>
        ))}
      </div>

      <div className="mt-14 flex items-center gap-3 border-t border-brd-soft pt-6 font-mono text-[11px] tracking-[0.12em] text-fg-dim">
        <span className="text-accent">EOF</span>
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <a href="#top" className="ml-auto text-fg-dim/60 transition-colors hover:text-accent">
          ↑ RETURN TO SURFACE
        </a>
      </div>
    </Layer>
  );
}
