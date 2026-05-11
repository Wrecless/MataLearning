import { ChevronDown, Code2, Home, Lock, Terminal } from 'lucide-react';
import { useState } from 'react';
import { gameCategories } from '../data/games.js';

export default function GameSidebar({ activeView, setActiveView }) {
  const [openCategories, setOpenCategories] = useState({});

  function toggleCategory(categoryId) {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  return (
    <aside className="panel relative z-10 flex min-h-0 flex-col p-4 lg:min-h-[calc(100vh-40px)]">
      <div className="flex items-center gap-3 border-b border-[#93ffc2]/20 pb-4">
        <div className="grid size-12 place-items-center rounded-lg border border-[#32f584]/60 bg-[#32f584]/10 text-[#32f584] shadow-[0_0_30px_rgba(50,245,132,0.16)]">
          <Terminal size={23} />
        </div>
        <div>
          <strong className="block text-lg font-black text-[#f1fff6]">Mr. Mata</strong>
          <span className="block text-sm font-bold text-[#a6c6b3]">Learning Hub</span>
        </div>
      </div>

      <nav className="mt-4 grid gap-2.5">
        <button
          type="button"
          className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <div className="console-label mt-2">Teaching Games</div>

        {gameCategories.map((category) => {
          const isOpen = Boolean(openCategories[category.id]);

          return (
            <div className="grid gap-2" key={category.id}>
              <button
                type="button"
                className="category-toggle"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
              >
                <span className="grid gap-1">
                  <strong>{category.title}</strong>
                  <small>{category.description}</small>
                </span>
                <ChevronDown
                  className={`text-[#32f584] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  size={18}
                />
              </button>

              {isOpen && (
                <div className="grid gap-2 border-l border-[#32f584]/25 pl-3.5">
                  {category.games.map((game) => (
                    <GameNavItem
                      active={activeView === game.id}
                      game={game}
                      key={game.id}
                      onSelect={setActiveView}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex gap-2.5 rounded-lg border border-[#f5c15b]/30 bg-[#f5c15b]/10 p-3 text-[#f5c15b]">
        <Code2 size={18} />
        <p className="m-0 text-sm font-bold leading-relaxed text-[#e4c98d]">
          More computer science games can be added here as the hub grows.
        </p>
      </div>
    </aside>
  );
}

function GameNavItem({ active, game, onSelect }) {
  const Icon = game.icon;
  const ready = game.status === 'Ready';

  return (
    <button
      type="button"
      className={`game-nav-item ${active ? 'active' : ''}`}
      onClick={() => ready && onSelect(game.id)}
      disabled={!ready}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 text-[#32f584]">
        <Icon size={18} />
      </span>
      <span className="grid min-w-0 gap-1">
        <strong className="truncate text-sm font-black">{game.title}</strong>
        <small className="truncate text-xs font-bold text-[#6c8b78]">{game.description}</small>
      </span>
      <span className={`status-chip ${ready ? 'ready' : 'soon'}`}>
        {ready ? 'Ready' : <Lock size={13} />}
      </span>
    </button>
  );
}
