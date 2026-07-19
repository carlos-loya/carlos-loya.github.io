import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RECIPES } from "./recipes";
import { motionOff } from "./motion";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

// A heading whose characters play a per-char recipe forward on scroll-down and
// rewind on scroll-up: GSAP SplitText + a scrubbed ScrollTrigger tied to the
// nearest `.act` section. The split is kept alive (not reverted) so the motion
// can reverse. `enterOnLoad` (the hero) plays the enter once on mount and scrubs
// only the exit. Under reduced motion / mobile it renders a plain, static,
// always-visible heading (SplitText's built-in aria keeps SR output intact).
export function ScrubHeading({
  as: Tag = "h2",
  className = "",
  recipe = "assemble",
  enterOnLoad = false,
  label,
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  recipe?: keyof typeof RECIPES;
  enterOnLoad?: boolean;
  label?: string; // aria-label with the clean sentence
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Hidden until the split has staged the chars, so there's no flash of resting
  // text; visible immediately when motion is off.
  const [hidden, setHidden] = useState(() => !motionOff());

  useGSAP(
    (_, contextSafe) => {
      if (motionOff() || !ref.current) return;
      const el = ref.current;
      const section = el.closest<HTMLElement>(".act") ?? el;
      const r = RECIPES[recipe];

      // Split only after webfonts load, or char positions are measured wrong.
      document.fonts.ready.then(
        contextSafe!(() => {
          if (!ref.current) return;
          const split = SplitText.create(el, {
            type: "words,chars",
            mask: r.mask ? "chars" : undefined,
          });
          const chars = split.chars;
          const base = { ease: r.ease, stagger: r.stagger };

          if (enterOnLoad) {
            // Assemble once on load; build the scrubbed exit only AFTER the enter
            // settles, so it records the true resting state (else the first chars
            // capture a mid-assemble start and never fully reform on scroll-up).
            gsap.from(chars, {
              ...r.from,
              ...base,
              duration: 0.8,
              onComplete: r.to
                ? contextSafe!(() => {
                    gsap.to(chars, {
                      ...r.to,
                      ...base,
                      duration: 1,
                      immediateRender: false,
                      overwrite: "auto",
                      scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
                    });
                  })
                : undefined,
            });
          } else {
            // Enter as the section rises in, hold, exit as it leaves — all scrubbed.
            const tl = gsap.timeline({
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
            });
            tl.from(chars, { ...r.from, ...base, duration: 0.4 }, 0);
            if (r.to) tl.to(chars, { ...r.to, ...base, duration: 0.4 }, 0.6);
          }
          setHidden(false);
        }),
      );
    },
    { scope: ref, dependencies: [] },
  );

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={label}
      style={hidden ? { visibility: "hidden" } : undefined}
    >
      {children}
    </Tag>
  );
}
