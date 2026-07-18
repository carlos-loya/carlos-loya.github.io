// Tier-1 Katamari "stuff": a few code-drawn saturated shapes scattered behind an
// act, drifting on a slow CSS float (keyframes `toyfloat` in index.css). Pure
// SVG → cheap transforms, no assets. Skipped entirely under reduced motion.
// Tier-2 (recolored CC0 object SVGs in public/toys/) can drop in here later.
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Shape = "ring" | "blob" | "star" | "capsule" | "dot" | "cross";

// Scattered around the edges so they never crowd the type. Positions in %.
const TOYS: { s: Shape; top: string; left: string; size: number; rot: number; delay: number; fill: "accent" | "ink" }[] = [
  { s: "ring",    top: "12%", left: "82%", size: 78, rot: -12, delay: 0,   fill: "accent" },
  { s: "blob",    top: "68%", left: "8%",  size: 96, rot: 8,   delay: 1.2, fill: "ink" },
  { s: "star",    top: "78%", left: "78%", size: 52, rot: 14,  delay: 0.6, fill: "accent" },
  { s: "capsule", top: "24%", left: "6%",  size: 60, rot: -20, delay: 1.8, fill: "ink" },
  { s: "dot",     top: "44%", left: "90%", size: 30, rot: 0,   delay: 0.9, fill: "ink" },
  { s: "cross",   top: "8%",  left: "40%", size: 40, rot: 18,  delay: 2.2, fill: "accent" },
];

function Glyph({ s, size }: { s: Shape; size: number }) {
  const c = "currentColor";
  switch (s) {
    case "ring":
      return <svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke={c} strokeWidth="14" /></svg>;
    case "blob":
      return <svg width={size} height={size} viewBox="0 0 100 100"><path fill={c} d="M52 6c20-4 44 8 42 30-2 20 12 26 4 42-9 18-36 20-54 12C22 82 6 66 8 44 10 20 30 10 52 6z" /></svg>;
    case "star":
      return <svg width={size} height={size} viewBox="0 0 100 100"><path fill={c} d="M50 4l12 30 32 2-25 21 9 31-28-18-28 18 9-31L16 36l32-2z" /></svg>;
    case "capsule":
      return <svg width={size} height={size / 2.2} viewBox="0 0 100 44"><rect x="2" y="2" width="96" height="40" rx="20" fill={c} /></svg>;
    case "dot":
      return <svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill={c} /></svg>;
    case "cross":
      return <svg width={size} height={size} viewBox="0 0 100 100"><path fill={c} d="M38 4h24v34h34v24H62v34H38V62H4V38h34z" /></svg>;
  }
}

export function ToyField() {
  if (reduced()) return null;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {TOYS.map((t, i) => (
        <span
          key={i}
          className="toy absolute"
          style={{
            top: t.top,
            left: t.left,
            transform: `rotate(${t.rot}deg)`,
            animationDelay: `${t.delay}s`,
            color: t.fill === "accent" ? "var(--color-accent)" : "var(--color-fg-strong)",
            opacity: t.fill === "accent" ? 0.9 : 0.12,
          }}
        >
          <Glyph s={t.s} size={t.size} />
        </span>
      ))}
    </div>
  );
}
