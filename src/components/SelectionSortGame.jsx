import { ArrowLeftRight, Check, Lightbulb, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSelectionMinimumIndex, SORTING_CHALLENGES } from '../utils/algorithms.js';
import GlossaryPanel from './GlossaryPanel.jsx';
import PageHeading from './PageHeading.jsx';
import { markGameComplete } from '../utils/progress.js';

const GLOSSARY_TERMS = [
  { term: 'Unsorted section', definition: 'The part of the list that has not been placed in final order yet.' },
  { term: 'Sorted section', definition: 'The part of the list already locked into its final position.' },
  { term: 'Selection', definition: 'Picking the smallest remaining value to move into the sorted section next.' },
];

export default function SelectionSortGame() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [numbers, setNumbers] = useState(SORTING_CHALLENGES[0]);
  const [sortedBoundary, setSortedBoundary] = useState(0);
  const [message, setMessage] = useState('Find the smallest value in the unsorted section.');
  const [tone, setTone] = useState('neutral');
  const complete = sortedBoundary >= numbers.length - 1;
  const expectedIndex = complete ? -1 : getSelectionMinimumIndex(numbers, sortedBoundary);

  useEffect(() => {
    if (complete) {
      markGameComplete('selection');
    }
  }, [complete]);

  function reset(nextChallengeIndex = challengeIndex) {
    setChallengeIndex(nextChallengeIndex);
    setNumbers(SORTING_CHALLENGES[nextChallengeIndex]);
    setSortedBoundary(0);
    setTone('neutral');
    setMessage('Find the smallest value in the unsorted section.');
  }

  function newList() {
    reset((challengeIndex + 1) % SORTING_CHALLENGES.length);
  }

  function handlePick(index) {
    if (complete || index < sortedBoundary) {
      return;
    }

    if (index !== expectedIndex) {
      setTone('error');
      setMessage(`${numbers[index]} is not the smallest value in the unsorted section.`);
      return;
    }

    const nextNumbers = [...numbers];
    [nextNumbers[sortedBoundary], nextNumbers[index]] = [nextNumbers[index], nextNumbers[sortedBoundary]];
    const nextBoundary = sortedBoundary + 1;
    setNumbers(nextNumbers);
    setSortedBoundary(nextBoundary);

    if (nextBoundary >= numbers.length - 1) {
      setTone('success');
      setMessage('Sorted. Selection sort repeatedly selected the smallest unsorted value.');
      return;
    }

    setTone('success');
    setMessage(`${nextNumbers[nextBoundary - 1]} moved into the sorted section. Select the next smallest value.`);
  }

  function showHint() {
    setTone('hint');
    setMessage(
      complete
        ? 'The list is complete. Start a new list for another challenge.'
        : `Hint: the smallest unsorted value is ${numbers[expectedIndex]}.`,
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Selection sort game">
      <PageHeading
        label="game://algorithms/selection-sort"
        title="Selection Sort Showdown"
        description="Select the smallest unsorted value and move it into the sorted section."
        actions={
          <>
            <button type="button" className="icon-button" onClick={newList}>
              <RefreshCw size={18} />
              <span>New List</span>
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {numbers.map((value, index) => {
              const sorted = index < sortedBoundary || complete;
              const candidate = !complete && index >= sortedBoundary;

              return (
                <button
                  className={`relative grid min-h-32 place-items-center rounded-lg border-2 font-mono text-5xl font-black transition hover:-translate-y-1 ${
                    sorted
                      ? 'border-[#32f584]/60 bg-[#32f584]/15 text-[#a8ffd0]'
                      : 'border-[#93ffc2]/25 bg-[#effff6]/5 text-[#f1fff6]'
                  } ${candidate ? 'shadow-[inset_0_-6px_0_rgba(245,193,91,0.18)]' : ''}`}
                  key={`${value}-${index}`}
                  onClick={() => handlePick(index)}
                  type="button"
                >
                  {value}
                  <small className="absolute bottom-3 text-xs font-black uppercase text-[#a6c6b3]">
                    {sorted ? 'sorted' : 'unsorted'}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-5">
            <span className="ui-label">Current job</span>
            <p className="m-0 text-lg font-black leading-relaxed text-[#f1fff6]">
              Scan positions {Math.min(sortedBoundary + 1, numbers.length)} to {numbers.length}, pick the smallest,
              then swap it into position {Math.min(sortedBoundary + 1, numbers.length)}.
            </p>
          </div>
        </div>

        <aside className="panel p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#a8ffd0]">
            <ArrowLeftRight size={20} />
            Selection Trace
          </h2>
          <div className="mt-5 grid gap-3">
            <Metric label="Sorted values" value={complete ? numbers.length : sortedBoundary} />
            <Metric label="Unsorted values" value={complete ? 0 : numbers.length - sortedBoundary} />
          </div>
          <ol className="pseudo-code">
            <li className="active">split the list into sorted and unsorted</li>
            <li className={!complete ? 'active' : 'done'}>find the smallest unsorted value</li>
            <li>swap it into the next sorted position</li>
            <li className={complete ? 'done active' : ''}>repeat until sorted</li>
          </ol>

          <div className="mt-5">
            <GlossaryPanel terms={GLOSSARY_TERMS} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-4">
      <span className="ui-label">{label}</span>
      <strong className="block text-3xl font-black text-[#32f584]">{value}</strong>
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
