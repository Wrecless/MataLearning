import { Binary, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { bitValues, bitsToDecimal, CHALLENGES_PER_LEVEL, makeBinaryTarget } from '../utils/binary.js';
import GlossaryPanel from './GlossaryPanel.jsx';
import PageHeading from './PageHeading.jsx';
import { markGameComplete } from '../utils/progress.js';

const GLOSSARY_TERMS = [
  { term: 'Bit', definition: 'A single 0 or 1 - one place-value column that is either switched on or off.' },
  { term: 'Place value', definition: 'The decimal amount a bit is worth when it is switched on, such as 8, 4, 2, or 1.' },
  { term: 'Binary', definition: 'Counting using only 0s and 1s instead of the usual 10 digits.' },
];

export default function BinaryBuilderGame() {
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

  function checkAnswer() {
    if (!correct) {
      setTone('error');
      setMessage(`Not quite. Your bits make ${total}, but the target is ${target}.`);
      return;
    }

    const nextLinesLeft = linesLeft - 1;
    const levelComplete = nextLinesLeft <= 0;
    const nextLevel = levelComplete ? level + 1 : level;

    if (levelComplete) {
      markGameComplete('binary');
    }

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
    <section className="flex flex-col gap-5" aria-label="Binary builder game">
      <PageHeading
        label="game://number-systems/binary"
        title="Binary Builder"
        description="Switch 8-bit place values on and off to match the target decimal number."
        actions={
          <>
            <button type="button" className="icon-button" onClick={useHint} title="Show hint">
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
            <button type="button" className="icon-button" onClick={resetBinaryGame} title="Reset">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel flex min-h-[560px] flex-col justify-between gap-7 p-5 lg:p-8" aria-labelledby="binary-target">
          <div className="grid items-center gap-4 md:grid-cols-[190px_minmax(260px,1fr)]">
            <div>
              <span className="ui-label">Target decimal</span>
              <strong
                className="font-mono text-7xl font-black leading-none text-[#32f584] drop-shadow-[0_0_30px_rgba(50,245,132,0.22)]"
                id="binary-target"
              >
                {target}
              </strong>
            </div>
            <StatusMessage tone={tone}>{message}</StatusMessage>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-8" aria-label="Binary place values">
            {bitValues.map((value, index) => (
              <button
                type="button"
                className={`bit-column ${bits[index] ? 'on' : ''}`}
                onClick={() => toggleBit(index)}
                key={value}
                aria-pressed={Boolean(bits[index])}
              >
                <span className="font-mono text-sm font-black text-[#f5c15b]">{value}</span>
                <strong>{bits[index]}</strong>
                <small>{bits[index] ? `+${value}` : 'off'}</small>
              </button>
            ))}
          </div>

          <div className="grid items-center gap-3.5 border-t border-[#93ffc2]/20 pt-5 md:grid-cols-[minmax(210px,1fr)_minmax(160px,0.75fr)_auto]">
            <BinaryMetric label="Your binary" value={binaryString} />
            <BinaryMetric label="Current total" value={total} />
            <button type="button" className="decision-button bg-[#0a9f8e] shadow-[0_14px_30px_rgba(41,214,197,0.18)]" onClick={checkAnswer}>
              <Check size={22} />
              <span>Check</span>
            </button>
          </div>
        </section>

        <aside className="panel p-6" aria-label="Binary game score">
          <div className="flex items-center justify-between gap-3 text-[#a8ffd0]">
            <h2 className="text-xl font-black">Binary Console</h2>
            <Binary size={20} />
          </div>

          <div className="my-5 grid gap-2.5">
            <ScoreRow label="Score" value={score} />
            <ScoreRow label="Level" value={level} />
            <ScoreRow label="Lines left" value={linesLeft} />
          </div>

          <div className="rounded-lg border border-[#f5c15b]/30 bg-[#f5c15b]/10 p-4">
            <strong className="mb-2 block text-base text-[#ffe7a9]">Place value rule</strong>
            <p className="text-sm font-bold leading-relaxed text-[#e4c98d]">
              Each 1 turns on its column. Add the active columns to make the target decimal.
            </p>
          </div>

          <ol className="pseudo-code mb-0">
            <li className="active">read the target decimal</li>
            <li>choose the biggest useful bit</li>
            <li>switch columns to 1 or 0</li>
            <li className={correct ? 'done active' : ''}>check if total equals target</li>
          </ol>

          <div className="mt-5">
            <GlossaryPanel terms={GLOSSARY_TERMS} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function BinaryMetric({ label, value }) {
  return (
    <div className="border-l-4 border-[#f5c15b] pl-3">
      <span className="ui-label">{label}</span>
      <strong className="mt-1.5 block font-mono text-3xl font-black text-[#f1fff6]">{value}</strong>
    </div>
  );
}

function ScoreRow({ label, value }) {
  return (
    <div className="flex min-h-16 items-center justify-between rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 px-3.5">
      <span className="text-xs font-black uppercase text-[#a6c6b3]">{label}</span>
      <strong className="font-mono text-3xl font-black text-[#32f584]">{value}</strong>
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
