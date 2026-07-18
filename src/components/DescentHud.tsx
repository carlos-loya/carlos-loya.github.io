import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import { layers, navLayers, MAX_DEPTH } from "../descent";

// Fixed left-rail depth gauge — the signature element that ties the DOM
// journey to the WebGL descent. Shows a filling vertical bar, a live depth
// readout, and the six layer codes with the current one lit crimson.
// Desktop only (lg+); it's pure chrome, so it's hidden where space is tight.
export function DescentHud() {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const [depth, setDepth] = useState(0);
  const [active, setActive] = useState(layers[0].id);

  // Round to 5m so state churns rarely, not every frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setDepth(Math.round((v * MAX_DEPTH) / 5) * 5);
  });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const l of navLayers) {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 select-none lg:block"
    >
      <div className="flex items-stretch gap-3 font-mono text-[10px] tracking-[0.14em]">
        {/* the gauge */}
        <div className="relative w-px overflow-hidden bg-brd">
          <motion.div
            style={{ scaleY: fill, transformOrigin: "top" }}
            className="absolute inset-0 bg-gradient-to-b from-accent to-accent-hi"
          />
        </div>

        {/* readout */}
        <div className="flex flex-col justify-between py-1">
          <div className="mb-4 leading-tight">
            <div className="text-fg-dim/70">DESCENT</div>
            <div className="tabular-nums text-accent">
              −{String(depth).padStart(4, "0")}m
            </div>
          </div>
          <ul className="space-y-2">
            {navLayers.map((l) => {
              const on = l.id === active;
              return (
                <li
                  key={l.id}
                  className={on ? "text-fg-strong" : "text-fg-dim/50"}
                >
                  <span className={on ? "text-accent" : "text-fg-dim/50"}>
                    {l.code}
                  </span>{" "}
                  <span className={on ? "" : "opacity-0"}>{l.name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
