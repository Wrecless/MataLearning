import { Check, Lightbulb, RefreshCw, Route } from 'lucide-react';
import { useState } from 'react';
import { getNeighbours, PATHFINDING_GRID } from '../utils/algorithms.js';
import PageHeading from './PageHeading.jsx';

const { columns, goal, rows, start, walls } = PATHFINDING_GRID;

export default function PathfindingGridGame() {
  const [queue, setQueue] = useState([start]);
  const [visited, setVisited] = useState(new Set());
  const [frontier, setFrontier] = useState(new Set([start]));
  const [message, setMessage] = useState('Expand the first cell in the queue to follow breadth-first search.');
  const [tone, setTone] = useState('neutral');
  const [complete, setComplete] = useState(false);
  const expectedCell = complete ? -1 : queue[0];

  function reset() {
    setQueue([start]);
    setVisited(new Set());
    setFrontier(new Set([start]));
    setComplete(false);
    setTone('neutral');
    setMessage('Expand the first cell in the queue to follow breadth-first search.');
  }

  function handleCell(index) {
    if (complete || walls.has(index) || visited.has(index)) {
      return;
    }

    if (index !== expectedCell) {
      setTone('error');
      setMessage(`Breadth-first search uses a queue. Expand cell ${expectedCell + 1} next.`);
      return;
    }

    const nextVisited = new Set(visited);
    nextVisited.add(index);

    if (index === goal) {
      setVisited(nextVisited);
      setFrontier(new Set());
      setQueue([]);
      setComplete(true);
      setTone('success');
      setMessage('Goal reached. BFS found the target by expanding cells in queue order.');
      return;
    }

    const remainingQueue = queue.slice(1);
    const neighbours = getNeighbours(index, columns, rows).filter(
      (cell) => !walls.has(cell) && !nextVisited.has(cell) && !remainingQueue.includes(cell),
    );
    const nextQueue = [...remainingQueue, ...neighbours];
    setQueue(nextQueue);
    setVisited(nextVisited);
    setFrontier(new Set(nextQueue));
    setTone('success');
    setMessage(`Cell ${index + 1} expanded. Add valid neighbours to the back of the queue.`);
  }

  function showHint() {
    setTone('hint');
    setMessage(complete ? 'The goal has been reached.' : `Hint: click cell ${expectedCell + 1}, the first cell in the queue.`);
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Pathfinding grid game">
      <PageHeading
        label="game://algorithms/pathfinding"
        title="Pathfinding Grid"
        description="Follow breadth-first search by expanding cells in queue order."
        actions={
          <>
            <button type="button" className="icon-button" onClick={reset}>
              <RefreshCw size={18} />
              <span>Reset</span>
            </button>
            <button type="button" className="icon-button" onClick={showHint}>
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="panel grid gap-7 p-5 lg:p-8">
          <StatusMessage tone={tone}>{message}</StatusMessage>

          <div className="mx-auto grid w-full max-w-[620px] grid-cols-5 gap-3">
            {Array.from({ length: columns * rows }).map((_, index) => {
              const isStart = index === start;
              const isGoal = index === goal;
              const isWall = walls.has(index);
              const isVisited = visited.has(index);
              const isFrontier = frontier.has(index);

              return (
                <button
                  className={`relative grid aspect-square place-items-center rounded-lg border-2 font-mono text-2xl font-black transition hover:-translate-y-1 ${
                    isWall
                      ? 'border-[#42584c]/40 bg-black/60 text-[#42584c]'
                      : isGoal
                        ? 'border-[#f5c15b]/70 bg-[#f5c15b]/15 text-[#ffe5a8]'
                        : isVisited
                          ? 'border-[#32f584]/60 bg-[#32f584]/15 text-[#a8ffd0]'
                          : isFrontier
                            ? 'border-[#29d6c5]/60 bg-[#29d6c5]/10 text-[#b9fffa]'
                            : 'border-[#93ffc2]/20 bg-[#effff6]/5 text-[#a6c6b3]'
                  }`}
                  disabled={isWall}
                  key={index}
                  onClick={() => handleCell(index)}
                  type="button"
                >
                  {isStart ? 'S' : isGoal ? 'G' : isWall ? '#' : index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="panel p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#a8ffd0]">
            <Route size={20} />
            BFS Console
          </h2>
          <div className="mt-5 grid gap-3">
            <Metric label="Visited" value={visited.size} />
            <Metric label="Queue" value={queue.map((cell) => cell + 1).join(', ') || 'empty'} />
          </div>
          <ol className="pseudo-code">
            <li className="active">take the first cell from the queue</li>
            <li>mark it as visited</li>
            <li>add valid neighbours to the back</li>
            <li className={complete ? 'done active' : ''}>stop when the goal is reached</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-4">
      <span className="ui-label">{label}</span>
      <strong className="block break-words text-xl font-black text-[#32f584]">{value}</strong>
    </div>
  );
}

function StatusMessage({ children, tone }) {
  const tones = {
    neutral: 'border-[#93ffc2]/20 bg-[#effff6]/5 text-[#d9f7e5]',
    success: 'border-[#32f584]/40 bg-[#32f584]/10 text-[#a8ffd0]',
    error: 'border-[#ff8278]/40 bg-[#f05f52]/10 text-[#ffd3cf]',
    hint: 'border-[#f5c15b]/45 bg-[#f5c15b]/10 text-[#ffe5a8]',
  };

  return (
    <div className={`rounded-lg border px-4 py-3.5 font-extrabold leading-relaxed ${tones[tone]}`} role="status">
      <Check className="mr-2 inline" size={18} />
      {children}
    </div>
  );
}
