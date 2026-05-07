import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeftRight,
  ArrowRight,
  Binary,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  Code2,
  Home,
  Lightbulb,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import './styles.css';

const LIST_SIZE = 10;

const games = [
  {
    id: 'bubble',
    title: 'Bubble Sort Lab',
    description: 'Manual adjacent swaps',
    status: 'Ready',
    icon: Binary,
  },
  {
    id: 'binary',
    title: 'Binary Builder',
    description: 'Place values and conversion',
    status: 'Ready',
    icon: Code2,
  },
  {
    id: 'logic',
    title: 'Logic Gates',
    description: 'Truth tables and circuits',
    status: 'Soon',
    icon: Braces,
  },
  {
    id: 'search',
    title: 'Search Sprint',
    description: 'Linear and binary search',
    status: 'Soon',
    icon: Terminal,
  },
];

const gameCategories = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Sorting and searching',
    games: games.filter((game) => ['bubble', 'search'].includes(game.id)),
  },
  {
    id: 'data-representation',
    title: 'Data Representation',
    description: 'Binary and number systems',
    games: games.filter((game) => ['binary'].includes(game.id)),
  },
  {
    id: 'logic',
    title: 'Logic',
    description: 'Boolean reasoning',
    games: games.filter((game) => ['logic'].includes(game.id)),
  },
];

function makeList() {
  const values = new Set();

  while (values.size < LIST_SIZE) {
    values.add(Math.floor(Math.random() * 90) + 10);
  }

  return Array.from(values);
}

function GameSidebar({ activeView, setActiveView }) {
  const [openCategories, setOpenCategories] = useState(() => ({
    algorithms: true,
    'data-representation': true,
    logic: false,
  }));

  function toggleCategory(categoryId) {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  return (
    <aside className="game-sidebar" aria-label="Teaching games">
      <div className="sidebar-brand">
        <div className="hub-mark" aria-hidden="true">
          <Terminal size={23} />
        </div>
        <div>
          <strong>Mr. Mata</strong>
          <span>Learning Hub</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <div className="nav-section-title">Teaching Games</div>

        {gameCategories.map((category) => {
          const isOpen = openCategories[category.id];

          return (
            <div className="game-category" key={category.id}>
              <button
                type="button"
                className={`category-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isOpen}
              >
                <span>
                  <strong>{category.title}</strong>
                  <small>{category.description}</small>
                </span>
                <ChevronDown size={18} />
              </button>

              {isOpen && (
                <div className="category-games">
                  {category.games.map((game) => {
                    const Icon = game.icon;
                    const ready = game.status === 'Ready';

                    return (
                      <button
                        type="button"
                        className={`game-nav-item ${activeView === game.id ? 'active' : ''}`}
                        onClick={() => ready && setActiveView(game.id)}
                        disabled={!ready}
                        key={game.id}
                      >
                        <span className="game-nav-icon">
                          <Icon size={18} />
                        </span>
                        <span className="game-nav-copy">
                          <strong>{game.title}</strong>
                          <small>{game.description}</small>
                        </span>
                        <span className={`status-dot ${ready ? 'ready' : 'soon'}`}>
                          {ready ? 'Ready' : <Lock size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <Code2 size={18} />
        <p>More computer science games can be added here as the hub grows.</p>
      </div>
    </aside>
  );
}

function HomePage({ onLaunch }) {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <div className="home-hero">
        <div className="terminal-window">
          <div className="terminal-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="terminal-path">~/classroom/games</span>
        </div>

        <h1 id="home-title">Welcome to Mr. Mata Learning Hub</h1>
        <p className="home-copy">
          A friendly corner of the web for practising computer science through
          small, focused games. Pick a challenge, think like a programmer, and
          learn by doing.
        </p>

        <div className="hero-actions">
          <button type="button" className="launch-button" onClick={() => onLaunch('bubble')}>
            <Play size={20} />
            Launch Bubble Sort Lab
            <ArrowRight size={18} />
          </button>
          <button type="button" className="launch-button secondary-launch" onClick={() => onLaunch('binary')}>
            <Binary size={20} />
            Launch Binary Builder
            <ArrowRight size={18} />
          </button>
          <div className="soft-signal">
            <Sparkles size={18} />
            <span>Classroom friendly and free to access</span>
          </div>
        </div>
      </div>

      <div className="home-grid" aria-label="Hub highlights">
        <article className="hub-card ready-card">
          <Trophy size={25} />
          <span>2 games ready</span>
          <strong>Sorting and binary</strong>
        </article>
        <article className="hub-card">
          <BookOpen size={25} />
          <span>Topic focus</span>
          <strong>Sorting algorithms</strong>
        </article>
        <article className="hub-card">
          <Users size={25} />
          <span>Built for</span>
          <strong>Secondary CS</strong>
        </article>
      </div>

      <div className="code-preview" aria-hidden="true">
        <pre>{`for each pass:
  compare neighbours
  if left > right:
    swap()
  keep going...`}</pre>
      </div>
    </section>
  );
}

const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
const CHALLENGES_PER_LEVEL = 8;

function makeBinaryTarget(level) {
  const max = Math.min(255, 31 + level * 32);
  return Math.floor(Math.random() * (max + 1));
}

function bitsToDecimal(bits) {
  return bits.reduce((total, bit, index) => total + bit * bitValues[index], 0);
}

function BinaryBuilderGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [linesLeft, setLinesLeft] = useState(CHALLENGES_PER_LEVEL);
  const [target, setTarget] = useState(() => makeBinaryTarget(1));
  const [bits, setBits] = useState(() => Array(bitValues.length).fill(0));
  const [message, setMessage] = useState('Build the target number by switching place values on or off.');
  const [tone, setTone] = useState('neutral');

  const total = bitsToDecimal(bits);
  const binaryString = bits.join('');
  const targetBits = target.toString(2).padStart(8, '0').split('').map(Number);
  const correct = total === target;

  function toggleBit(index) {
    setBits((current) => current.map((bit, bitIndex) => (bitIndex === index ? 1 - bit : bit)));
    setTone('neutral');
    setMessage('Keep building. Your live decimal total updates as each bit changes.');
  }

  function nextChallenge(wasCorrect) {
    const nextLinesLeft = wasCorrect ? linesLeft - 1 : linesLeft;
    const levelComplete = nextLinesLeft <= 0;
    const nextLevel = levelComplete ? level + 1 : level;

    if (wasCorrect) {
      setScore((current) => current + level * 10);
      setLevel(nextLevel);
      setLinesLeft(levelComplete ? CHALLENGES_PER_LEVEL : nextLinesLeft);
      setTarget(makeBinaryTarget(nextLevel));
      setBits(Array(bitValues.length).fill(0));
      setTone(levelComplete ? 'success' : 'neutral');
      setMessage(
        levelComplete
          ? `Level ${level} complete. Level ${nextLevel} unlocks larger targets.`
          : 'Correct. A new target is ready.',
      );
      return;
    }

    setTone('error');
    setMessage(`Not quite. Your bits make ${total}, but the target is ${target}.`);
  }

  function checkAnswer() {
    nextChallenge(correct);
  }

  function useHint() {
    setBits(targetBits);
    setTone('hint');
    setMessage(`Hint loaded: ${target} in 8-bit binary is ${targetBits.join('')}.`);
  }

  function resetBinaryGame() {
    setLevel(1);
    setScore(0);
    setLinesLeft(CHALLENGES_PER_LEVEL);
    setTarget(makeBinaryTarget(1));
    setBits(Array(bitValues.length).fill(0));
    setTone('neutral');
    setMessage('Fresh binary challenge. Switch on the columns that add up to the target.');
  }

  return (
    <section className="binary-page" aria-label="Binary builder game">
      <div className="page-heading">
        <div>
          <span className="console-label">game://number-systems/binary</span>
          <h1>Binary Builder</h1>
          <p>Switch 8-bit place values on and off to match the target decimal number.</p>
        </div>

        <nav className="actions" aria-label="Binary game controls">
          <button type="button" className="icon-button" onClick={useHint} title="Show hint">
            <Lightbulb size={18} />
            <span>Hint</span>
          </button>
          <button type="button" className="icon-button quiet" onClick={resetBinaryGame} title="Reset">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
        </nav>
      </div>

      <div className="binary-workspace">
        <section className="binary-board" aria-labelledby="binary-target">
          <div className="binary-target-row">
            <div>
              <span className="label">Target decimal</span>
              <strong id="binary-target">{target}</strong>
            </div>
            <div className={`message ${tone}`} role="status" aria-live="polite">
              {message}
            </div>
          </div>

          <div className="bit-grid" aria-label="Binary place values">
            {bitValues.map((value, index) => (
              <button
                type="button"
                className={`bit-column ${bits[index] ? 'on' : ''}`}
                onClick={() => toggleBit(index)}
                key={value}
                aria-pressed={Boolean(bits[index])}
              >
                <span className="bit-value">{value}</span>
                <strong>{bits[index]}</strong>
                <small>{bits[index] ? `+${value}` : 'off'}</small>
              </button>
            ))}
          </div>

          <div className="binary-equation">
            <div>
              <span className="label">Your binary</span>
              <strong>{binaryString}</strong>
            </div>
            <div>
              <span className="label">Current total</span>
              <strong>{total}</strong>
            </div>
            <button type="button" className="decision keep" onClick={checkAnswer}>
              <Check size={22} />
              <span>Check</span>
            </button>
          </div>
        </section>

        <aside className="binary-score-panel" aria-label="Binary game score">
          <div className="panel-heading">
            <h2>Binary Console</h2>
            <Binary size={20} />
          </div>

          <div className="score-stack">
            <div className="score-row">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="score-row">
              <span>Level</span>
              <strong>{level}</strong>
            </div>
            <div className="score-row">
              <span>Lines left</span>
              <strong>{linesLeft}</strong>
            </div>
          </div>

          <div className="binary-tip">
            <strong>Place value rule</strong>
            <p>Each 1 turns on its column. Add the active columns to make the target decimal.</p>
          </div>

          <ol className="pseudo-code binary-code">
            <li className="active">read the target decimal</li>
            <li>choose the biggest useful bit</li>
            <li>switch columns to 1 or 0</li>
            <li className={correct ? 'done active' : ''}>check if total equals target</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

function BubbleSortGame() {
  const [seed, setSeed] = useState(() => makeList());
  const [numbers, setNumbers] = useState(seed);
  const [compareIndex, setCompareIndex] = useState(0);
  const [pass, setPass] = useState(0);
  const [steps, setSteps] = useState(0);
  const [message, setMessage] = useState('Compare the first pair. Swap only when the left value is larger.');
  const [tone, setTone] = useState('neutral');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [complete, setComplete] = useState(false);

  const pair = [numbers[compareIndex], numbers[compareIndex + 1]];
  const shouldSwap = pair[0] > pair[1];
  const totalComparisons = useMemo(
    () => (LIST_SIZE * (LIST_SIZE - 1)) / 2,
    [],
  );
  const progress = complete ? 100 : Math.min(100, Math.round((steps / totalComparisons) * 100));

  function finishAdvance(nextNumbers) {
    setIsAdvancing(false);

    const atEndOfPass = compareIndex >= nextNumbers.length - pass - 2;
    if (atEndOfPass) {
      setNumbers(nextNumbers);

      if (pass >= LIST_SIZE - 2) {
        setCompareIndex(0);
        setPass(LIST_SIZE - 1);
        setComplete(true);
        setTone('success');
        setMessage('Sorted! Every pass bubbled the largest remaining number into place.');
        return;
      }

      setCompareIndex(0);
      setPass((current) => current + 1);
      setTone('neutral');
      setMessage('End of pass. The largest unsorted value is now locked on the right.');
      return;
    }

    setNumbers(nextNumbers);
    setCompareIndex((current) => current + 1);
    setTone('neutral');
    setMessage('Move one place right and compare the next adjacent pair.');
  }

  function handleDecision(action) {
    if (complete || isAdvancing) {
      return;
    }

    const pickedSwap = action === 'swap';

    if (pickedSwap !== shouldSwap) {
      setTone('error');
      setMessage(
        shouldSwap
          ? `${pair[0]} is larger than ${pair[1]}, so this pair must be swapped.`
          : `${pair[0]} is already less than ${pair[1]}, so leave this pair in place.`,
      );
      return;
    }

    setSteps((current) => current + 1);

    const nextNumbers = [...numbers];
    if (pickedSwap) {
      [nextNumbers[compareIndex], nextNumbers[compareIndex + 1]] = [
        nextNumbers[compareIndex + 1],
        nextNumbers[compareIndex],
      ];
      setTone('success');
      setMessage('Correct swap. The larger value moves one step to the right.');
    } else {
      setTone('success');
      setMessage('Correct: no swap needed for this pair.');
    }

    setIsAdvancing(true);
    window.setTimeout(() => finishAdvance(nextNumbers), 280);
  }

  function handleHint() {
    if (complete) {
      setTone('success');
      setMessage('The list is complete. Start a new list for another challenge.');
      return;
    }

    setTone('hint');
    setMessage(
      shouldSwap
        ? `Hint: ${pair[0]} > ${pair[1]}, so choose Swap.`
        : `Hint: ${pair[0]} <= ${pair[1]}, so choose No swap.`,
    );
  }

  function resetList() {
    setNumbers(seed);
    setCompareIndex(0);
    setPass(0);
    setSteps(0);
    setTone('neutral');
    setIsAdvancing(false);
    setComplete(false);
    setMessage('Back to the start. Compare the first adjacent pair.');
  }

  function newList() {
    const next = makeList();
    setSeed(next);
    setNumbers(next);
    setCompareIndex(0);
    setPass(0);
    setSteps(0);
    setTone('neutral');
    setIsAdvancing(false);
    setComplete(false);
    setMessage('New list ready. Start at the left and bubble the largest values right.');
  }

  return (
    <section className="bubble-page" aria-label="Bubble sort game">
      <div className="page-heading">
        <div>
          <span className="console-label">game://sorting/bubble</span>
          <h1>Bubble Sort Lab</h1>
          <p>Compare adjacent values and manually follow the bubble sort algorithm.</p>
        </div>

        <nav className="actions" aria-label="Game controls">
          <button type="button" className="icon-button" onClick={newList} title="New list">
            <RefreshCw size={18} />
            <span>New List</span>
          </button>
          <button type="button" className="icon-button" onClick={handleHint} title="Hint">
            <Lightbulb size={18} />
            <span>Hint</span>
          </button>
          <button type="button" className="icon-button quiet" onClick={resetList} title="Reset">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
        </nav>
      </div>

      <div className="workspace">
        <div className="game-zone">
          <div className="status-row">
            <div>
              <span className="label">{complete ? 'Result' : 'Current comparison'}</span>
              <strong>
                {complete ? 'sorted list' : `positions ${compareIndex + 1} and ${compareIndex + 2}`}
              </strong>
            </div>
            <div className={`message ${tone}`} role="status" aria-live="polite">
              {message}
            </div>
          </div>

          <div className="number-track" aria-label="Numbers to sort">
            {numbers.map((value, index) => {
              const comparing = !complete && (index === compareIndex || index === compareIndex + 1);
              const locked = complete || index >= numbers.length - pass;

              return (
                <div
                  className={`number-tile ${comparing ? 'comparing' : ''} ${locked ? 'locked' : ''}`}
                  key={`${value}-${index}`}
                  aria-label={`Position ${index + 1}, value ${value}`}
                >
                  <span>{value}</span>
                  <small>{locked ? 'fixed' : `#${index + 1}`}</small>
                </div>
              );
            })}
          </div>

          <div className="decision-panel">
            <button
              type="button"
              className="decision swap"
              onClick={() => handleDecision('swap')}
              disabled={complete || isAdvancing}
            >
              <ArrowLeftRight size={22} />
              <span>Swap</span>
            </button>
            <button
              type="button"
              className="decision keep"
              onClick={() => handleDecision('keep')}
              disabled={complete || isAdvancing}
            >
              <Check size={22} />
              <span>No swap</span>
            </button>
          </div>

          <div className="timeline">
            <div className="metric">
              <span>Pass</span>
              <strong>{Math.min(pass + 1, LIST_SIZE - 1)}</strong>
            </div>
            <div className="metric">
              <span>Steps</span>
              <strong>{steps}</strong>
            </div>
            <div className="progress-shell" aria-label={`Progress ${progress}%`}>
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <aside className="algorithm-panel" aria-label="Algorithm guide">
          <div className="panel-heading">
            <h2>Algorithm Trace</h2>
            {complete ? <Sparkles size={20} /> : shouldSwap ? <ArrowLeftRight size={20} /> : <X size={20} />}
          </div>
          <ol className="pseudo-code">
            <li className="active">repeat passes through the list</li>
            <li className={complete ? 'done' : 'active'}>compare adjacent values</li>
            <li className={shouldSwap && !complete ? 'active' : ''}>if left &gt; right, swap them</li>
            <li className={!shouldSwap && !complete ? 'active' : ''}>otherwise, keep their order</li>
            <li className={pass > 0 || complete ? 'done' : ''}>largest unsorted value bubbles right</li>
            <li className={complete ? 'done active' : ''}>stop when the list is sorted</li>
          </ol>

          <div className={`outcome ${complete ? 'complete' : ''}`}>
            <strong>{complete ? 'Challenge complete' : shouldSwap ? 'Swap needed' : 'No swap needed'}</strong>
            <p>
              {complete
                ? `Sorted in ${steps} decisions. Try a fresh list when the class is ready.`
                : shouldSwap
                  ? `${pair[0]} is greater than ${pair[1]}, so the larger value should move right.`
                  : `${pair[0]} is already before ${pair[1]}, so bubble sort moves on.`}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function App() {
  const [activeView, setActiveView] = useState('home');

  return (
    <main className="app-shell">
      <div className="matrix-rain" aria-hidden="true" />
      <GameSidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="content-shell">
        <header className="hub-topbar">
          <div>
            <span className="console-label">status://online</span>
            <strong>Learning games workspace</strong>
          </div>
          <span className="live-indicator">Ready for class</span>
        </header>

        {activeView === 'home' && <HomePage onLaunch={setActiveView} />}
        {activeView === 'bubble' && <BubbleSortGame />}
        {activeView === 'binary' && <BinaryBuilderGame />}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
