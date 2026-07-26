import { Html } from "@react-three/drei";
import { companies } from "../content/experience";
import type { SceneFraming, StickerId } from "./DeskModel";

// Where the card floats relative to the mug (world units, model scale). Same
// billboarded-DOM approach as MonitorScreen's website card. ponytail: taste dials.
const CARD_SIDE = 1; // which side of the mug (+x/−x) the card sits on
const CARD_GAP = 0.5; // gap beyond the mug's edge

export function CoffeeCard({
  framing,
  sticker,
  onClose,
  onClearHover,
}: {
  framing: SceneFraming | null;
  sticker: StickerId | null;
  onClose: () => void;
  onClearHover: () => void;
}) {
  const coffee = framing?.targets.coffee;
  if (!coffee || !sticker) return null;
  const c = companies[sticker];
  const { center, size } = coffee;

  return (
    <Html
      position={[center.x + CARD_SIDE * (size.x / 2 + CARD_GAP), center.y, center.z]}
      center
      zIndexRange={[30, 10]}
    >
      <div
        // Swallow pointer events so they don't fall through to the scene behind
        // the card — a click would focus the mesh back there (e.g. the monitor),
        // a move would hover-bob it. Clear any stale hover while over the card.
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => {
          e.stopPropagation();
          onClearHover();
        }}
        className="pointer-events-auto w-72 rounded-xl bg-[#111318]/92 p-4 text-white shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Work experience
          </span>
          <button
            onClick={onClose}
            aria-label="Close (Esc)"
            className="font-mono text-xs text-white/50 transition hover:text-white"
          >
            Esc ✕
          </button>
        </div>
        <h3 className="mt-2 font-display text-base">{c.name}</h3>
        <p className="mt-0.5 font-mono text-xs text-white/50">
          {c.role} · {c.dates} · {c.location}
        </p>
        <ul className="mt-3 space-y-2">
          {c.bullets.map((b) => (
            <li key={b} className="flex gap-2 font-mono text-xs leading-relaxed text-white/60">
              <span className="text-white/30">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </Html>
  );
}
