import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { profile } from "../content/profile";
import { navWorlds } from "../scroll/worlds";

// Fixed over the changing color worlds, so it carries its own frosted chip and
// fixed ink rather than following the per-world tokens.
export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-30 w-full">
      <div className="mx-auto mt-3 flex h-12 max-w-6xl items-center gap-6 rounded-full border border-black/10 bg-white/70 px-5 backdrop-blur-md sm:px-6">
        <a
          href="#top"
          className="font-mono text-[13px] font-semibold tracking-tight text-neutral-900"
        >
          {profile.name}
          <span className="text-[#ff5a1f]">_</span>
        </a>

        <div className="ml-auto hidden items-center gap-6 sm:flex">
          {navWorlds.map((wld) => (
            <a
              key={wld.id}
              href={`#${wld.id}`}
              className="font-mono text-[12px] text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {wld.nav}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="ml-auto rounded-md p-2 text-neutral-700 transition-colors hover:text-neutral-900 sm:hidden"
        >
          {open ? <FiX size={16} /> : <FiMenu size={16} />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-black/10 bg-white/80 backdrop-blur-md sm:hidden">
          <div className="flex flex-col px-5 py-2">
            {navWorlds.map((wld) => (
              <a
                key={wld.id}
                href={`#${wld.id}`}
                onClick={() => setOpen(false)}
                className="py-2.5 font-mono text-[13px] text-neutral-700 transition-colors hover:text-neutral-900"
              >
                {wld.nav}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
