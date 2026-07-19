import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { world } from "../scroll/worlds";
import { motionOff } from "../scroll/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// A Katamari "orb": one oversized ring that belongs to the Hero but stays pinned
// to the scroll and travels into Work, recoloring cyan-world → lime-world, then
// parks behind the card deck (slow idle spin) before fading out ahead of the next
// section. A fixed z-0 overlay: above .worlds-bg (-1), below all section content
// (which shows through the transparent acts), never intercepting clicks.
//
// Two nested elements so the scroll transform (.orb) and the idle spin (.orb-spin)
// never fight over `transform`. Skipped entirely under reduced motion / <768px —
// its journey ends at the Work pin, which doesn't exist in that fallback.
export function OrbTraveler() {
  const root = useRef<HTMLDivElement>(null);
  const [off] = useState(motionOff);

  useGSAP(
    () => {
      if (off || !root.current) return;
      const orb = root.current.querySelector<HTMLElement>(".orb");
      const spin = root.current.querySelector<HTMLElement>(".orb-spin");
      // Resolve trigger sections as elements, NOT selector strings: useGSAP's
      // `scope` scopes any selector string to the overlay subtree, where these
      // sections don't live (→ a null trigger and a degenerate scroll range).
      const topEl = document.querySelector("#top");
      const workEl = document.querySelector("#work");
      const expEl = document.querySelector("#experience");
      if (!orb || !spin || !topEl || !workEl || !expEl) return;

      // Idle spin — independent of scroll, keeps the parked orb alive.
      gsap.to(spin, { rotate: 360, repeat: -1, ease: "none", duration: 24 });

      // Travel: hero → parked-behind-the-deck, ending exactly as Work pins.
      gsap.fromTo(
        orb,
        { xPercent: 55, yPercent: -110, scale: 0.7, color: world("top").accent },
        {
          xPercent: 0,
          yPercent: 25,
          scale: 1.5,
          color: world("work").accent,
          ease: "none",
          scrollTrigger: {
            trigger: topEl,
            start: "top top",
            endTrigger: workEl,
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      // Exit: hold parked through the Work pin, then fade as Experience rises in
      // (anchored to the next section so it's independent of the pin geometry).
      gsap.to(orb, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: expEl,
          start: "top bottom",
          end: "top center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root, dependencies: [off] },
  );

  if (off) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1] grid place-items-center overflow-hidden"
    >
      <div className="orb will-change-transform" style={{ color: world("top").accent }}>
        <svg
          className="orb-spin block h-[40vmin] w-[40vmin] will-change-transform"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="13" />
        </svg>
      </div>
    </div>
  );
}
