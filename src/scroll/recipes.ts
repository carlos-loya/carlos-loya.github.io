// A tween-vars subset: fixed numbers/strings (e.g. `ease`) plus gsap
// function-based per-char values. Structurally assignable to gsap's TweenVars.
type MotionVars = Record<
  string,
  number | string | ((i: number, t: Element, arr: Element[]) => number)
>;

// Per-character motion vocabularies for ScrubHeading. Each recipe is two states:
// `from` (the enter start — chars animate FROM this to their resting place) and
// optional `to` (the exit end — chars animate from resting TO this as the section
// leaves). Values may be gsap function-based `(i, target, targets) => v` for
// per-char variation (fan-out, alternating tilt). Omit `to` for a section that
// should assemble and simply stay (the closing beat).
export interface Recipe {
  mask?: boolean; // wrap each char in an overflow mask (clean for in-bounds moves)
  ease?: string;
  stagger?: number;
  from: MotionVars;
  to?: MotionVars;
}

const fan = (spread: number) => (i: number, _t: Element, arr: Element[]) =>
  (i - (arr.length - 1) / 2) * spread;
const tilt = (deg: number) => (i: number) => (i % 2 ? deg : -deg);

export const RECIPES: Record<string, Recipe> = {
  // Hero: rise into place, then fall away downward (stays in view on scroll) +
  // fan + spin + fade.
  assemble: {
    ease: "power3.out",
    stagger: 0.03,
    from: { yPercent: 80, opacity: 0, rotate: tilt(6) },
    to: { yPercent: 130, x: fan(10), rotate: tilt(28), opacity: 0, ease: "power2.in" },
  },
  // Toolkit: reels clicking up into the rack.
  rollup: {
    mask: true,
    ease: "power3.out",
    stagger: 0.03,
    from: { yPercent: 115 },
    to: { yPercent: -115, ease: "power2.in" },
  },
  // Systems: type-on left→right, then shove out to the right ("shipped").
  typeon: {
    ease: "none",
    stagger: 0.045,
    from: { opacity: 0 },
    to: { opacity: 0, x: 48, ease: "power1.in" },
  },
  // Work (horizontal beat): slide + skew in from the right, trail out left.
  lateral: {
    ease: "power3.out",
    stagger: 0.03,
    from: { x: 90, skewX: 9, opacity: 0 },
    to: { x: -50, skewX: -5, opacity: 0, ease: "power2.in" },
  },
  // Contact (closing beat): chars converge inward from the edges and resolve.
  converge: {
    ease: "power3.out",
    stagger: 0.02,
    from: { x: fan(36), yPercent: tilt(30), opacity: 0, rotate: tilt(12) },
    // no `to` — this is the final section; it lands and holds.
  },
};
