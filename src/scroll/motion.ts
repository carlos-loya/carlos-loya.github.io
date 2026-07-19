// Shared motion gate: skip heavy scroll effects (pins, scrubs, the orb) under
// reduced motion OR on narrow/touch viewports, where they'd be too heavy or their
// anchors (the pinned Work section) don't exist. Callers render a static fallback.
const mq = (q: string) =>
  typeof window !== "undefined" && window.matchMedia(q).matches;

export const motionOff = () =>
  mq("(prefers-reduced-motion: reduce)") || !mq("(min-width: 768px)");
