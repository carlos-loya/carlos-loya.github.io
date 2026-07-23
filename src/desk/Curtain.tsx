import { useState } from "react";
import { useProgress } from "@react-three/drei";
import { profile } from "../content/profile";
import { TRACKS, type Music } from "./useMusic";

// Loading curtain over the canvas: shows real glb load progress (drei useProgress)
// and gates entry behind an Enter click. That click is the user gesture that
// unlocks browser audio, so if music is toggled on we start it right here.
export function Curtain({ music, onEnter }: { music: Music; onEnter: () => void }) {
  const { progress, active } = useProgress();
  const [wantMusic, setWantMusic] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const ready = !active && progress >= 100;

  const enter = () => {
    if (!ready || leaving) return;
    if (wantMusic && TRACKS.length > 0) music.start();
    setLeaving(true);
    setTimeout(onEnter, 500); // let the fade finish before unmounting
  };

  return (
    <div
      className={`fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#0e0f13] transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-sm px-8 text-center">
        <p className="font-display text-3xl tracking-tight text-white">{profile.name}</p>
        <p className="mt-1 font-mono text-sm text-white/45">{profile.eyebrow}</p>

        {/* Progress bar off the real loader. */}
        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/70 transition-[width] duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {TRACKS.length > 0 && (
          <button
            onClick={() => setWantMusic((m) => !m)}
            aria-pressed={wantMusic}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 font-mono text-xs text-white/70 transition hover:bg-white/10"
          >
            <span aria-hidden>{wantMusic ? "🔊" : "🔇"}</span>
            Music {wantMusic ? "on" : "off"}
          </button>
        )}

        <div className="mt-6">
          <button
            onClick={enter}
            disabled={!ready}
            className="rounded-full bg-white px-8 py-2 font-mono text-sm font-bold text-black transition hover:bg-white/85 disabled:cursor-default disabled:bg-white/15 disabled:text-white/40"
          >
            {ready ? "Enter →" : "loading the desk…"}
          </button>
        </div>
      </div>
    </div>
  );
}
