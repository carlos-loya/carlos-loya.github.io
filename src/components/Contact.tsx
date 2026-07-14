import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { Reveal } from "./Reveal";
import { profile } from "../content/profile";

const socials = [
  { label: profile.email, href: `mailto:${profile.email}`, Icon: FaEnvelope },
  { label: "GitHub", href: profile.github, Icon: FaGithub },
  { label: "LinkedIn", href: profile.linkedin, Icon: FaLinkedin },
  { label: "Résumé (PDF)", href: profile.resume, Icon: FaFilePdf },
];

export function Contact() {
  return (
    <footer id="contact" className="border-t border-brd-soft py-16 pb-20 sm:py-20">
      <div className="mx-auto max-w-3xl px-7">
        <Reveal>
          <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.16em] text-accent">
            Contact
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-fg-strong sm:text-3xl">
            Let's talk.
          </h2>
          <p className="mt-3 max-w-[48ch] text-fg">
            Open to full-stack and backend roles. The quickest way to reach me is
            email — I read everything.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="inline-flex items-center gap-2 rounded-lg border border-brd px-4 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:bg-accent/10 hover:text-fg-strong"
              >
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
          <p className="mt-12 font-mono text-xs text-fg-dim">
            © {new Date().getFullYear()} {profile.name} · built with React &amp; Tailwind
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
