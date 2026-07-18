import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORLDS } from "./worlds";

gsap.registerPlugin(ScrollTrigger);

// The animated background. A single fixed layer whose color is the smooth blend
// between the two acts straddling the viewport center — that's the "scrub
// between color-worlds" effect. Sections themselves are transparent in motion
// mode (see .act rules); under reduced-motion this component does nothing and
// each .act paints its own solid world color, giving a static multi-color page.
export function ColorWorlds() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.setAttribute("data-worlds", "motion");

    const bgs = WORLDS.map((w) => w.bg);
    const setBg = (c: string) => {
      if (layer.current) layer.current.style.backgroundColor = c;
    };

    const blend = () => {
      const acts = Array.from(document.querySelectorAll<HTMLElement>(".act"));
      if (!acts.length) return;
      const mid = window.innerHeight / 2;
      const centers = acts.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      // Before the first / after the last center: hold the end world.
      if (mid <= centers[0]) return setBg(bgs[0]);
      const last = centers.length - 1;
      if (mid >= centers[last]) return setBg(bgs[last]);
      // Find the pair we sit between and interpolate by distance.
      for (let i = 0; i < last; i++) {
        if (mid >= centers[i] && mid <= centers[i + 1]) {
          const t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
          return setBg(gsap.utils.interpolate(bgs[i], bgs[i + 1], t) as string);
        }
      }
    };

    // Scrub-tie the blend to scroll; refresh recomputes on resize/layout.
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: blend, onRefresh: blend });
    blend();

    return () => {
      st.kill();
      document.documentElement.removeAttribute("data-worlds");
    };
  }, []);

  return <div ref={layer} className="worlds-bg" aria-hidden />;
}
