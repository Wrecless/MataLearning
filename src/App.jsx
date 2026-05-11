import { useState } from 'react';
import BinaryBuilderGame from './components/BinaryBuilderGame.jsx';
import BubbleSortGame from './components/BubbleSortGame.jsx';
import DividendBuilderGame from './components/DividendBuilderGame.jsx';
import GameSidebar from './components/GameSidebar.jsx';
import HomePage from './components/HomePage.jsx';
import InsertionSortGame from './components/InsertionSortGame.jsx';
import ModuloMasteryGame from './components/ModuloMasteryGame.jsx';
import PathfindingGridGame from './components/PathfindingGridGame.jsx';
import SearchSprintGame from './components/SearchSprintGame.jsx';
import SelectionSortGame from './components/SelectionSortGame.jsx';
import { games } from './data/games.js';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const readyGameCount = games.filter((game) => game.status === 'Ready').length;

  return (
    <main className="relative grid min-h-screen gap-5 overflow-hidden p-3.5 lg:grid-cols-[292px_minmax(0,1fr)] lg:p-5">
      <div className="matrix-rain" aria-hidden="true" />
      <GameSidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="relative z-10 flex min-w-0 flex-col">
        {activeView === 'home' && (
          <HomePage onLaunch={setActiveView} readyGameCount={readyGameCount} />
        )}
        {activeView === 'bubble' && <BubbleSortGame />}
        {activeView === 'search' && <SearchSprintGame />}
        {activeView === 'selection' && <SelectionSortGame />}
        {activeView === 'insertion' && <InsertionSortGame />}
        {activeView === 'pathfinding' && <PathfindingGridGame />}
        {activeView === 'binary' && <BinaryBuilderGame />}
        {activeView === 'modulo' && <ModuloMasteryGame />}
        {activeView === 'dividend' && <DividendBuilderGame />}
      </div>
    </main>
  );
}
