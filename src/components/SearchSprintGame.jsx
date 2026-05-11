import { Check, Lightbulb, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { getSearchStep, SEARCH_CHALLENGES } from '../utils/algorithms.js';
import PageHeading from './PageHeading.jsx';

export default function SearchSprintGame() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [mode, setMode] = useState('linear');
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(SEARCH_CHALLENGES[0].list.length - 1);
  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState('Use the selected search method and click the next value to inspect.');
  const [tone, setTone] = useState('neutral');
  const [complete, setComplete] = useState(false);
  const challenge = SEARCH_CHALLENGES[challengeIndex];
  const expectedIndex = complete ? -1 : getSearchStep({ high, list: challenge.list, low, mode });

  function reset(newMode = mode, nextChallengeIndex = challengeIndex) {
    const nextChallenge = SEARCH_CHALLENGES[nextChallengeIndex];
    setMode(newMode);
    setChallengeIndex(nextChallengeIndex);
    setLow(0);
    setHigh(nextChallenge.list.length - 1);
    setChecked([]);
    setComplete(false);
    setTone('neutral');
    setMessage(`Ready for ${newMode === 'linear' ? 'linear' : 'binary'} search. Click the next value to inspect.`);
  }

  function nextChallenge() {
    reset(mode, (challengeIndex + 1) % SEARCH_CHALLENGES.length);
  }

  function handlePick(index) {
    if (complete) {
      return;
    }

    if (index !== expectedIndex) {
      setTone('error');
      setMessage(
        mode === 'linear'
          ? `Linear search checks from left to right. The next index is ${expectedIndex + 1}.`
          : `Binary search checks the middle of the current range. The next index is ${expectedIndex + 1}.`,
      );
      return;
    }

    const value = challenge.list[index];
    const nextChecked = [...checked, index];
    setChecked(nextChecked);

    if (value === challenge.target) {
      setComplete(true);
      setTone('success');
      setMessage(`Found ${challenge.target} at position ${index + 1} in ${nextChecked.length} checks.`);
      return;
    }

    if (mode === 'linear') {
      setLow(index + 1);
      setTone('success');
      setMessage(`${value} is not the target. Linear search moves one position right.`);
      return;
    }

    if (value < challenge.target) {
      setLow(index + 1);
      setTone('success');
      setMessage(`${value} is too low, so binary search discards the left half.`);
      return;
    }

    setHigh(index - 1);
    setTone('success');
    setMessage(`${value} is too high, so binary search discards the right half.`);
  }

  function showHint() {
    setTone('hint');
    setMessage(
      complete
        ? 'Challenge complete. Start a new target when ready.'
        : `Hint: inspect position ${expectedIndex + 1}, value ${challenge.list[expectedIndex]}.`,
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Search sprint game">
      <PageHeading
        label="game://algorithms/search"
        title="Search Sprint"
        description="Practise linear search and binary search by choosing the next value to inspect."
        actions={
          <>
            <button type="button" className="icon-button" onClick={nextChallenge}>
              <RefreshCw size={18} />
              <span>New Target</span>
            </button>
            <button type="button" className="icon-button" onClick={showHint}>
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="panel grid gap-6 p-5 lg:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            {['linear', 'binary'].map((searchMode) => (
              <button
                className={`icon-button min-h-13 ${mode === searchMode ? 'border-[#32f584]/60 bg-[#32f584]/15 text-[#f1fff6]' : ''}`}
                key={searchMode}
                onClick={() => reset(searchMode)}
                type="button"
              >
                <Search size={18} />
                <span>{searchMode === 'linear' ? 'Linear Search' : 'Binary Search'}</span>
              </button>
            ))}
          </div>

          <StatusMessage tone={tone}>{message}</StatusMessage>

          <div>
            <span className="ui-label">Target</span>
            <strong className="font-mono text-6xl font-black text-[#32f584]">{challenge.target}</strong>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {challenge.list.map((value, index) => {
              const isChecked = checked.includes(index);
              const isRange = index >= low && index <= high;
              const isExpected = index === expectedIndex;

              return (
                <button
                  className={`relative grid min-h-28 place-items-center rounded-lg border-2 font-mono text-4xl font-black transition hover:-translate-y-1 ${
                    isChecked
                      ? 'border-[#32f584]/60 bg-[#32f584]/15 text-[#a8ffd0]'
                      : isRange
                        ? 'border-[#93ffc2]/25 bg-[#effff6]/5 text-[#f1fff6]'
                        : 'border-[#93ffc2]/10 bg-black/30 text-[#42584c] opacity-70'
                  } ${isExpected ? 'shadow-[0_0_30px_rgba(245,193,91,0.16)]' : ''}`}
                  key={value}
                  onClick={() => handlePick(index)}
                  type="button"
                >
                  {value}
                  <small className="absolute bottom-3 text-xs font-black uppercase text-[#a6c6b3]">
                    #{index + 1}
                  </small>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="panel p-6">
          <h2 className="text-xl font-black text-[#a8ffd0]">Search Console</h2>
          <div className="mt-5 grid gap-3">
            <Metric label="Mode" value={mode === 'linear' ? 'Linear' : 'Binary'} />
            <Metric label="Checks" value={checked.length} />
            <Metric label="Active range" value={`${low + 1}-${high + 1}`} />
          </div>
          <ol className="pseudo-code">
            <li className={mode === 'linear' ? 'active' : ''}>linear: check each item from left to right</li>
            <li className={mode === 'binary' ? 'active' : ''}>binary: check the middle item</li>
            <li>discard values that cannot contain the target</li>
            <li className={complete ? 'done active' : ''}>stop when the target is found</li>
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
      <strong className="block text-2xl font-black text-[#32f584]">{value}</strong>
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
