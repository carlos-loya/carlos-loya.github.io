import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { profile } from "../content/profile";
import { layers } from "../descent";

// Skip the surface layer in the nav — you're already there on load.
const navLayers = layers.filter((l) => l.id !== "top");

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-30 w-full border-b border-brd-soft bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6 sm:px-8">
        <a
          href="#top"
          className="font-mono text-[13px] font-semibold tracking-tight text-fg-strong"
        >
          {profile.name}
          <span className="text-accent">_</span>
        </a>

        <div className="ml-auto hidden items-center gap-7 sm:flex">
          {navLayers.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="group flex items-center gap-1.5 font-mono text-[12px] text-fg-dim transition-colors hover:text-fg-strong"
            >
              <span className="text-accent/60 transition-colors group-hover:text-accent">
                {l.code}
              </span>
              {l.nav}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="ml-auto rounded-md border border-brd p-2 text-fg-dim transition-colors hover:text-fg-strong sm:hidden"
        >
          {open ? <FiX size={16} /> : <FiMenu size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brd-soft sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {navLayers.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2.5 font-mono text-[13px] text-fg-dim transition-colors hover:text-fg-strong"
              >
                <span className="text-accent/60">{l.code}</span>
                {l.nav}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
