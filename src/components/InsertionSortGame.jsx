import { Check, Lightbulb, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { getInsertionIndex, INSERTION_CHALLENGES } from '../utils/algorithms.js';
import PageHeading from './PageHeading.jsx';

export default function InsertionSortGame() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [source, setSource] = useState(INSERTION_CHALLENGES[0]);
  const [sorted, setSorted] = useState([INSERTION_CHALLENGES[0][0]]);
  const [cursor, setCursor] = useState(1);
  const [message, setMessage] = useState('Insert the current card into the correct place in the sorted hand.');
  const [tone, setTone] = useState('neutral');
  const complete = cursor >= source.length;
  const currentValue = complete ? null : source[cursor];
  const expectedIndex = complete ? -1 : getInsertionIndex(sorted, currentValue);

  function reset(nextChallengeIndex = challengeIndex) {
    const nextSource = INSERTION_CHALLENGES[nextChallengeIndex];
    setChallengeIndex(nextChallengeIndex);
    setSource(nextSource);
    setSorted([nextSource[0]]);
    setCursor(1);
    setTone('neutral');
    setMessage('Insert the current card into the correct place in the sorted hand.');
  }

  function newHand() {
    reset((challengeIndex + 1) % INSERTION_CHALLENGES.length);
  }

  function handleSlot(slotIndex) {
    if (complete) {
      return;
    }

    if (slotIndex !== expectedIndex) {
      setTone('error');
      setMessage(`${currentValue} does not belong in that position. Compare it with the sorted hand.`);
      return;
    }

    const nextSorted = [...sorted.slice(0, slotIndex), currentValue, ...sorted.slice(slotIndex)];
    const nextCursor = cursor + 1;
    setSorted(nextSorted);
    setCursor(nextCursor);

    if (nextCursor >= source.length) {
      setTone('success');
      setMessage('Sorted. Insertion sort built the final order one card at a time.');
      return;
    }

    setTone('success');
    setMessage(`${currentValue} inserted correctly. Move to the next card.`);
  }

  function showHint() {
    setTone('hint');
    setMessage(
      complete
        ? 'The hand is sorted. Start a new hand for another challenge.'
        : `Hint: ${currentValue} belongs in slot ${expectedIndex + 1}.`,
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Insertion sort game">
      <PageHeading
        label="game://algorithms/insertion-sort"
        title="Insertion Sort Cards"
        description="Build a sorted hand by inserting each new value into the correct position."
        actions={
          <>
            <button type="button" className="icon-button" onClick={newHand}>
              <RefreshCw size={18} />
              <span>New Hand</span>
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

          <div className="rounded-lg border border-[#f5c15b]/35 bg-[#f5c15b]/10 p-5">
            <span className="ui-label">Current card</span>
            <strong className="font-mono text-6xl font-black text-[#ffe5a8]">{complete ? 'Done' : currentValue}</strong>
          </div>

          <div>
            <span className="ui-label">Sorted hand</span>
            <div className="mt-3 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(82px,1fr))]">
              {Array.from({ length: sorted.length + (complete ? 0 : 1) }).map((_, slotIndex) => (
                <button
                  className="min-h-18 rounded-lg border border-dashed border-[#f5c15b]/45 bg-[#f5c15b]/10 px-3 text-sm font-black uppercase text-[#ffe5a8] transition hover:-translate-y-1"
                  key={`slot-${slotIndex}`}
                  onClick={() => handleSlot(slotIndex)}
                  type="button"
                >
                  Insert slot {slotIndex + 1}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(82px,1fr))]">
              {sorted.map((value, index) => (
                <div
                  className="grid min-h-28 place-items-center rounded-lg border-2 border-[#32f584]/55 bg-[#32f584]/15 font-mono text-5xl font-black text-[#a8ffd0]"
                  key={`${value}-${index}`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="ui-label">Unsorted deck</span>
            <div className="mt-3 flex flex-wrap gap-3">
              {source.slice(cursor + 1).map((value) => (
                <span
                  className="grid size-16 place-items-center rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 font-mono text-2xl font-black text-[#a6c6b3]"
                  key={value}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="panel p-6">
          <h2 className="text-xl font-black text-[#a8ffd0]">Insertion Trace</h2>
          <div className="mt-5 grid gap-3">
            <Metric label="Cards inserted" value={sorted.length} />
            <Metric label="Cards left" value={Math.max(0, source.length - cursor)} />
          </div>
          <ol className="pseudo-code">
            <li className="done">start with one sorted item</li>
            <li className={!complete ? 'active' : 'done'}>take the next unsorted item</li>
            <li>shift larger values to the right</li>
            <li className={complete ? 'done active' : ''}>insert into the open position</li>
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
