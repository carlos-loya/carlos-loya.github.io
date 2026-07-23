import { profile } from "../content/profile";
import { repos } from "../content/github";
import type { FocusId } from "./DeskModel";
import { TRACKS, type Music } from "./useMusic";

const LABEL: Record<FocusId, string> = {
  monitor: "the monitor",
  ipod: "the iPod",
  phone: "the phone",
  clipboard: "the clipboard",
  floppy: "the floppy disk",
};

export function Overlays({
  focus,
  hover,
  music,
  onFocus,
  onHover,
  onClose,
}: {
  focus: FocusId | null;
  hover: FocusId | null;
  music: Music;
  onFocus: (id: FocusId) => void;
  onHover: (id: FocusId | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Persistent audio: outlives the iPod panel, so music keeps playing once
          the close-up is dismissed. */}
      {TRACKS.length > 0 && (
        <audio ref={music.ref} src={music.track?.src} onEnded={music.next} />
      )}

      {/* All persistent chrome stacks in the (otherwise empty) top-right corner.
          Identity + legend show only in the hero view; the mute toggle is always
          available. */}
      <div className="absolute right-6 top-6 flex flex-col items-end gap-3">
        {!focus && (
          <>
            <div className="select-none text-right">
              <p className="font-display text-lg tracking-tight text-black">{profile.name}</p>
              <p className="font-mono text-xs text-black/70">{profile.eyebrow}</p>
            </div>

            <nav className="flex flex-col items-end gap-1.5">
              <span className="mb-0.5 font-mono text-[10px] uppercase tracking-widest text-black/50">
                Explore
              </span>
              {(Object.keys(LABEL) as FocusId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => onFocus(id)}
                  onPointerEnter={() => onHover(id)}
                  onPointerLeave={() => onHover(null)}
                  className={`pointer-events-auto rounded-full px-3 py-1 font-mono text-xs backdrop-blur-sm transition ${
                    hover === id
                      ? "bg-black/15 text-black"
                      : "bg-white/45 text-black/70 hover:bg-white/65 hover:text-black"
                  }`}
                >
                  {LABEL[id]} →
                </button>
              ))}
            </nav>
          </>
        )}

        {TRACKS.length > 0 && (
          <button
            onClick={music.toggleMute}
            aria-label={music.muted ? "Unmute music" : "Mute music"}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 font-mono text-sm text-white/85 backdrop-blur-sm transition hover:bg-black/70"
          >
            <span aria-hidden>{music.muted ? "🔇" : "🔊"}</span>
            <span>{music.muted ? "Muted" : "Music"}</span>
          </button>
        )}
      </div>

      {/* hover affordance in the hero view */}
      {!focus && hover && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 font-mono text-sm text-white/90 backdrop-blur-sm">
          Click {LABEL[hover]} →
        </div>
      )}

      {/* The monitor's content lives on the screen itself (MonitorScreen), not
          in a side panel. */}
      {focus === "ipod" && (
        <Panel title="Now playing" onClose={onClose}>
          <IpodBody music={music} />
        </Panel>
      )}
      {focus === "phone" && (
        <Panel title="Contact" onClose={onClose}>
          <PhoneBody />
        </Panel>
      )}
      {focus === "floppy" && (
        <Panel title="GitHub projects" onClose={onClose}>
          <FloppyBody />
        </Panel>
      )}
      {focus === "clipboard" && (
        <Panel title="Résumé" onClose={onClose}>
          <ClipboardBody />
        </Panel>
      )}
    </div>
  );
}

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="panel-in pointer-events-auto absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#111318]/92 text-white shadow-2xl backdrop-blur-md sm:max-w-lg">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="font-display text-lg tracking-tight text-white">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close (Esc)"
          className="rounded-md px-2 py-1 font-mono text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Esc ✕
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  );
}

function IpodBody({ music }: { music: Music }) {
  // Recently played = the history minus the current track, most-recent first, last 5.
  const recent = music.history.slice(0, -1).slice(-5).reverse();
  return (
    <div className="space-y-6">
      <NowPlaying music={music} />

      <section className="space-y-3">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Recently played
        </h3>
        {recent.length === 0 ? (
          <p className="font-mono text-xs text-white/40">Nothing yet — hit next ⏭</p>
        ) : (
          <ol className="space-y-2 font-mono text-sm">
            {recent.map((i, n) => (
              <li key={`${i}-${n}`} className="flex gap-3 text-white/70">
                <span className="text-white/30">{n + 1}</span>
                <span className="truncate">{TRACKS[i].title}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function PhoneBody() {
  return (
    <div className="space-y-4">
      <p className="font-mono text-sm leading-relaxed text-white/70">{profile.lede}</p>
      <ul className="space-y-2 font-mono text-sm">
        <li>
          <a className="text-white/80 underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li>
          <a className="text-white/80 underline-offset-4 hover:underline" href={profile.github} target="_blank" rel="noreferrer">
            github.com/{profile.githubHandle}
          </a>
        </li>
        <li>
          <a className="text-white/80 underline-offset-4 hover:underline" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
        <li className="text-white/50">{profile.location}</li>
      </ul>
    </div>
  );
}

function FloppyBody() {
  return (
    <div className="space-y-4">
      {repos.map((r) => (
        <div key={r.name} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base">{r.name}</h3>
            {r.repo && (
              <a
                href={r.repo}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-mono text-xs text-white/50 hover:text-white/80"
              >
                Source ↗
              </a>
            )}
          </div>
          <p className="mt-1 font-mono text-xs leading-relaxed text-white/60">{r.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/60">
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClipboardBody() {
  return (
    <div className="flex h-full flex-col gap-4">
      <p className="font-mono text-sm leading-relaxed text-white/70">{profile.lede}</p>
      <iframe
        src={profile.resume}
        title="Résumé"
        className="min-h-64 w-full flex-1 rounded-lg border border-white/10 bg-white/5"
      />
      <a
        href={profile.resume}
        target="_blank"
        rel="noreferrer"
        className="self-start rounded-full bg-white px-4 py-1.5 font-mono text-xs font-bold text-black transition hover:bg-white/85"
      >
        Open / download PDF ↗
      </a>
    </div>
  );
}

function NowPlaying({ music }: { music: Music }) {
  if (TRACKS.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-white/15 p-3 font-mono text-xs text-white/40">
        ♪ tracks coming soon
      </p>
    );
  }
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      {/* Large cover — click to play/pause. */}
      <button
        onClick={music.toggle}
        aria-label={music.playing ? "Pause" : "Play"}
        className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-white/10"
      >
        {music.track?.art && (
          <img src={music.track.art} alt="" className="h-full w-full object-cover" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/25 text-3xl text-white opacity-0 transition group-hover:opacity-100">
          {music.playing ? "❚❚" : "►"}
        </span>
      </button>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-base">{music.track?.title ?? "…"}</p>
          <p className="truncate font-mono text-xs text-white/50">{profile.name}</p>
          {music.track && (
            <a
              href={music.track.suno}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] text-white/45 underline-offset-2 hover:text-white/75 hover:underline"
            >
              listen / remix on Suno ↗
            </a>
          )}
        </div>
        <button
          onClick={music.next}
          aria-label="Next track"
          className="shrink-0 font-mono text-xs text-white/50 hover:text-white/80"
        >
          next ⏭
        </button>
      </div>
    </div>
  );
}
