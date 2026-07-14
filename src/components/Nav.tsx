import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { ThemeToggle } from "./ThemeToggle";
import { profile } from "../content/profile";

const links = [
  ["Skills", "#skills"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Contact", "#contact"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-brd-soft bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-5 px-7">
        <a href="#top" className="text-[15px] font-semibold tracking-tight text-fg-strong">
          {profile.name}
          <span className="text-accent">.</span>
        </a>

        <div className="ml-auto hidden items-center gap-7 sm:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-fg-dim transition-colors hover:text-fg-strong"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-lg border border-brd p-2 text-fg-dim transition-colors hover:text-fg-strong sm:hidden"
          >
            {open ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brd-soft sm:hidden">
          <div className="mx-auto flex max-w-3xl flex-col px-7 py-2">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-fg-dim transition-colors hover:text-fg-strong"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
