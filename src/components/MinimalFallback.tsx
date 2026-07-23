import { profile } from "../content/profile";

// Static, motion-free content path shown on mobile / no-WebGL / reduced-motion
// (and the accessible fallback for the 3D desk). Plain semantic HTML.
export function MinimalFallback() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 bg-[#0e0f13] px-6 py-16 text-white">
      <p className="font-mono text-sm uppercase tracking-widest text-white/50">{profile.eyebrow}</p>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">{profile.name}</h1>
      <p className="font-mono text-base leading-relaxed text-white/70">{profile.lede}</p>

      <ul className="flex flex-col gap-3 pt-2 font-mono text-base">
        <li>
          <a className="text-white/85 underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        <li>
          <a className="text-white/85 underline-offset-4 hover:underline" href={profile.github} target="_blank" rel="noreferrer">
            github.com/{profile.githubHandle}
          </a>
        </li>
        <li>
          <a className="text-white/85 underline-offset-4 hover:underline" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>

      <a
        href={profile.resume}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block w-fit rounded-full bg-white px-6 py-2.5 font-mono text-sm font-bold text-black transition hover:bg-white/85"
      >
        Résumé (PDF)
      </a>
    </main>
  );
}
