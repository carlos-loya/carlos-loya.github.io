import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { Act } from "./Act";
import { profile } from "../content/profile";
import { world } from "../scroll/worlds";

const socials = [
  { label: profile.email, href: `mailto:${profile.email}`, Icon: FaEnvelope },
  { label: "GitHub", href: profile.github, Icon: FaGithub },
  { label: "LinkedIn", href: profile.linkedin, Icon: FaLinkedin },
  { label: "Résumé (PDF)", href: profile.resume, Icon: FaFilePdf },
];

export function Contact() {
  return (
    <Act
      world={world("contact")}
      as="footer"
      eyebrow="Contact"
      title="Let's build something"
      subtitle="Open to full-stack and backend roles, and to interesting builds. Email is the fastest path in — I read everything."
    >
      <div className="flex flex-wrap gap-3">
        {socials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
            className="inline-flex items-center gap-2 rounded-md border border-brd bg-panel px-4 py-2.5 text-sm text-fg backdrop-blur-sm transition-colors hover:border-accent hover:text-fg-strong"
          >
            <Icon size={15} /> {label}
          </a>
        ))}
      </div>

      <div className="mt-14 flex items-center gap-4 border-t border-brd-soft pt-6 font-mono text-[11px] tracking-[0.12em] text-fg-dim">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <a
          href="/attribution.md"
          target="_blank"
          rel="noreferrer noopener"
          className="transition-colors hover:text-accent"
        >
          Credits
        </a>
        <a href="#top" className="ml-auto transition-colors hover:text-accent">
          ↑ Back to top
        </a>
      </div>
    </Act>
  );
}
