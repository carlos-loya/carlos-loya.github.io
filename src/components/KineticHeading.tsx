import { useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { useInView } from "../hooks/useInView";

gsap.registerPlugin(useGSAP, SplitText);

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A heading whose characters rise out of per-char overflow masks when it
// scrolls into view (GSAP SplitText). Under reduced motion it renders as a
// plain, always-visible tag. Children may contain nested elements (the
// hero's <em> accent word) — SplitText preserves them.
export function KineticHeading({
  as: Tag = "h2",
  className = "",
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>();
  // Hidden until the split has staged the chars inside their masks; React
  // state (not gsap.set) so re-renders can't re-apply the hidden style.
  const [hidden, setHidden] = useState(() => !reducedMotion());

  useGSAP(
    (_, contextSafe) => {
      if (!inView || reducedMotion() || !ref.current) return;
      // Split only after webfonts load, or char positions are measured wrong.
      document.fonts.ready.then(
        contextSafe!(() => {
          if (!ref.current) return;
          const split = SplitText.create(ref.current, {
            type: "words,chars",
            mask: "chars",
          });
          // from() stages chars at +110% (hidden inside their masks) before
          // the unhide below, so there's no flash of the resting text.
          gsap.from(split.chars, {
            yPercent: 110,
            duration: 0.8,
            ease: "back.out(1.7)",
            stagger: 0.025,
            onComplete: () => split.revert(), // restore markup → natural reflow
          });
          setHidden(false);
        }),
      );
    },
    { dependencies: [inView] },
  );

  return (
    <Tag
      ref={ref}
      className={className}
      style={hidden ? { visibility: "hidden" } : undefined}
    >
      {children}
    </Tag>
  );
}
