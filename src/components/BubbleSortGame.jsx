import { ArrowLeftRight, Check, Lightbulb, RefreshCw, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LIST_SIZE, makeList } from '../utils/bubbleSort.js';
import GlossaryPanel from './GlossaryPanel.jsx';
import PageHeading from './PageHeading.jsx';
import { markGameComplete } from '../utils/progress.js';

const GLOSSARY_TERMS = [
  { term: 'Pass', definition: 'One full sweep left to right, comparing every neighbouring pair once.' },
  { term: 'Swap', definition: 'Trading the positions of two adjacent values.' },
  { term: 'Comparison', definition: 'Checking two values side by side to see which one is bigger.' },
];

export default function BubbleSortGame() {
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
  const totalComparisons = useMemo(() => (LIST_SIZE * (LIST_SIZE - 1)) / 2, []);
  const progress = complete ? 100 : Math.min(100, Math.round((steps / totalComparisons) * 100));

  useEffect(() => {
    if (complete) {
      markGameComplete('bubble');
    }
  }, [complete]);

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
    <section className="flex flex-col gap-5" aria-label="Bubble sort game">
      <PageHeading
        label="game://sorting/bubble"
        title="Bubble Sort Lab"
        description="Compare adjacent values and manually follow the bubble sort algorithm."
        actions={
          <>
            <button type="button" className="icon-button" onClick={newList} title="New list">
              <RefreshCw size={18} />
              <span>New List</span>
            </button>
            <button type="button" className="icon-button" onClick={handleHint} title="Hint">
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
            <button type="button" className="icon-button" onClick={resetList} title="Reset">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel flex min-h-[560px] flex-col justify-between gap-7 p-5 lg:p-8">
          <div className="grid items-center gap-4 md:grid-cols-[auto_minmax(260px,1fr)]">
            <div>
              <span className="ui-label">{complete ? 'Result' : 'Current comparison'}</span>
              <strong className="text-xl font-black text-[#f1fff6]">
                {complete ? 'sorted list' : `positions ${compareIndex + 1} and ${compareIndex + 2}`}
              </strong>
            </div>
            <StatusMessage tone={tone}>{message}</StatusMessage>
          </div>

          <div className="grid grid-cols-2 items-end gap-2.5 md:grid-cols-5 xl:grid-cols-10">
            {numbers.map((value, index) => {
              const comparing = !complete && (index === compareIndex || index === compareIndex + 1);
              const locked = complete || index >= numbers.length - pass;

              return (
                <NumberTile
                  comparing={comparing}
                  index={index}
                  key={`${value}-${index}`}
                  locked={locked}
                  value={value}
                />
              );
            })}
          </div>

          <div className="grid justify-center gap-3.5 sm:flex">
            <button
              type="button"
              className="decision-button bg-[#f05f52] shadow-[0_14px_30px_rgba(240,95,82,0.24)]"
              onClick={() => handleDecision('swap')}
              disabled={complete || isAdvancing}
            >
              <ArrowLeftRight size={22} />
              <span>Swap</span>
            </button>
            <button
              type="button"
              className="decision-button bg-[#0a9f8e] shadow-[0_14px_30px_rgba(41,214,197,0.18)]"
              onClick={() => handleDecision('keep')}
              disabled={complete || isAdvancing}
            >
              <Check size={22} />
              <span>No swap</span>
            </button>
          </div>

          <div className="grid items-center gap-3.5 border-t border-[#93ffc2]/20 pt-5 md:grid-cols-[92px_92px_minmax(180px,1fr)]">
            <Metric label="Pass" value={Math.min(pass + 1, LIST_SIZE - 1)} />
            <Metric label="Steps" value={steps} />
            <div className="h-3.5 overflow-hidden rounded-full bg-[#effff6]/10" aria-label={`Progress ${progress}%`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#32f584] to-[#f5c15b] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <aside className="panel p-6" aria-label="Algorithm guide">
          <div className="flex items-center justify-between gap-3 text-[#a8ffd0]">
            <h2 className="text-xl font-black">Algorithm Trace</h2>
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

          <div className="mt-5">
            <GlossaryPanel terms={GLOSSARY_TERMS} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function NumberTile({ comparing, index, locked, value }) {
  return (
    <div
      className={`relative grid h-22 min-w-0 place-items-center rounded-lg border-2 transition md:h-24 xl:h-31 ${
        comparing
          ? '-translate-y-2.5 border-[#f5c15b] bg-[#f5c15b]/15 text-[#ffe7a9] shadow-[0_12px_0_rgba(245,193,91,0.15),0_0_28px_rgba(245,193,91,0.16)]'
          : locked
            ? 'border-[#32f584]/40 bg-[#32f584]/10 text-[#32f584]'
            : 'border-[#a8ffd0]/20 bg-[#effff6]/5 text-[#a8ffd0]'
      }`}
      aria-label={`Position ${index + 1}, value ${value}`}
    >
      <span className="text-3xl font-black leading-none md:text-4xl">{value}</span>
      <small className="absolute bottom-3 text-xs font-black uppercase text-[#a6c6b3]">
        {locked ? 'fixed' : `#${index + 1}`}
      </small>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="border-l-4 border-[#f5c15b] pl-3">
      <span className="ui-label">{label}</span>
      <strong className="mt-1 block text-3xl font-black text-[#f1fff6]">{value}</strong>
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
    <div className={`rounded-lg border px-4 py-3.5 font-extrabold leading-relaxed ${tones[tone]}`} role="status" aria-live="polite">
      {children}
    </div>
  );
}
