import { ArrowRight, Binary, BookOpen, Play, Sparkles, Trophy, Users } from 'lucide-react';

export default function HomePage({ onLaunch, readyGameCount }) {
  const readyGameLabel = `${readyGameCount} ${readyGameCount === 1 ? 'game' : 'games'} ready`;

  return (
    <section className="home-shell" aria-labelledby="home-title">
      <div className="relative z-10 max-w-[850px] self-center">
        <div className="inline-flex items-center gap-3 rounded-lg border border-[#a8ffd0]/20 bg-black/25 px-3 py-2.5 font-mono text-sm font-extrabold text-[#32f584]">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#32f584]" />
            <span className="size-2 rounded-full bg-[#f5c15b]" />
            <span className="size-2 rounded-full bg-[#29d6c5]" />
          </span>
          <span>~/classroom/games</span>
        </div>

        <h1
          id="home-title"
          className="mt-7 max-w-[890px] text-5xl font-black leading-none text-[#f1fff6] drop-shadow-[0_0_34px_rgba(50,245,132,0.18)] md:text-7xl xl:text-8xl"
        >
          Welcome to Mr. Mata Learning Hub
        </h1>
        <p className="mt-5 max-w-[700px] text-lg font-semibold leading-relaxed text-[#c9e9d5]">
          A friendly corner of the web for practising computer science through small,
          focused games. Pick a challenge, think like a programmer, and learn by doing.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          <button type="button" className="launch-button" onClick={() => onLaunch('bubble')}>
            <Play size={20} />
            Launch Bubble Sort Lab
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="launch-button border-[#f5c15b]/50 bg-[#f5c15b]/15 text-[#ffe7a9] shadow-none hover:bg-[#f5c15b]/20"
            onClick={() => onLaunch('binary')}
          >
            <Binary size={20} />
            Launch Binary Builder
            <ArrowRight size={18} />
          </button>
          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-[#e7c985]">
            <Sparkles size={18} />
            <span>Classroom friendly and free to access</span>
          </div>
        </div>
      </div>

      <div className="home-side-rail">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <HubCard icon={Trophy} label={readyGameLabel} title="Across the hub" variant="warm" />
          <HubCard icon={BookOpen} label="Topic focus" title="Sorting algorithms" />
          <HubCard icon={Users} label="Built for" title="Secondary CS" />
        </div>

        <div className="code-preview">
          <pre>{`for each pass:
  compare neighbours
  if left > right:
    swap()
  keep going...`}</pre>
        </div>
      </div>
    </section>
  );
}

function HubCard({ icon: Icon, label, title, variant }) {
  return (
    <article
      className={`min-h-32 rounded-lg border p-4 ${
        variant === 'warm'
          ? 'border-[#f5c15b]/40 bg-[#f5c15b]/10'
          : 'border-[#93ffc2]/20 bg-[#effff6]/5'
      }`}
    >
      <Icon className="text-[#32f584]" size={25} />
      <span className="mt-4 block text-xs font-black uppercase text-[#a6c6b3]">{label}</span>
      <strong className="mt-3 block text-lg font-black leading-tight text-[#f1fff6] break-words">
        {title}
      </strong>
    </article>
  );
}
