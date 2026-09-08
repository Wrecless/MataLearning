import { Check, Divide, Lightbulb, RefreshCw, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DIVIDEND_CHALLENGES_PER_LEVEL, makeDividendChallenge, makeDividendOptions } from '../utils/dividend.js';
import GlossaryPanel from './GlossaryPanel.jsx';
import PageHeading from './PageHeading.jsx';
import { markGameComplete } from '../utils/progress.js';

const GLOSSARY_TERMS = [
  { term: 'Dividend', definition: 'The number being divided - the total you start with.' },
  { term: 'Divisor', definition: 'The group size you are dividing by.' },
  { term: 'Quotient', definition: 'How many full groups of the divisor fit into the dividend.' },
];

export default function DividendBuilderGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [challengesLeft, setChallengesLeft] = useState(DIVIDEND_CHALLENGES_PER_LEVEL);
  const [challenge, setChallenge] = useState(() => makeDividendChallenge(1));
  const [selectedDividend, setSelectedDividend] = useState(null);
  const [message, setMessage] = useState('Build the dividend from the divisor, quotient, and remainder.');
  const [tone, setTone] = useState('neutral');

  const options = useMemo(() => makeDividendOptions(challenge), [challenge]);
  const correct = selectedDividend === challenge.dividend;

  function advanceChallenge() {
    const nextChallengesLeft = challengesLeft - 1;
    const levelComplete = nextChallengesLeft <= 0;
    const nextLevel = levelComplete ? level + 1 : level;

    if (levelComplete) {
      markGameComplete('dividend');
    }

    setLevel(nextLevel);
    setChallengesLeft(levelComplete ? DIVIDEND_CHALLENGES_PER_LEVEL : nextChallengesLeft);
    setChallenge(makeDividendChallenge(nextLevel));
    setSelectedDividend(null);
    setTone(levelComplete ? 'success' : 'neutral');
    setMessage(
      levelComplete
        ? `Level ${level} complete. Level ${nextLevel} uses larger division facts.`
        : 'New dividend challenge ready.',
    );
  }

  function checkAnswer() {
    if (selectedDividend === null) {
      setTone('hint');
      setMessage('Select the missing dividend first.');
      return;
    }

    if (!correct) {
      setTone('error');
      setMessage(
        `Use divisor x quotient + remainder: ${challenge.divisor} x ${challenge.quotient} + ${challenge.remainder} = ${challenge.dividend}.`,
      );
      return;
    }

    setScore((current) => current + level * 10);
    setTone('success');
    setMessage(
      `Correct: ${challenge.dividend} = ${challenge.divisor} x ${challenge.quotient} + ${challenge.remainder}.`,
    );
    window.setTimeout(advanceChallenge, 520);
  }

  function showHint() {
    setTone('hint');
    setMessage(
      `First multiply ${challenge.divisor} x ${challenge.quotient} = ${challenge.divisor * challenge.quotient}, then add ${challenge.remainder}.`,
    );
  }

  function resetGame() {
    setLevel(1);
    setScore(0);
    setChallengesLeft(DIVIDEND_CHALLENGES_PER_LEVEL);
    setChallenge(makeDividendChallenge(1));
    setSelectedDividend(null);
    setTone('neutral');
    setMessage('Fresh dividend challenge. Build the missing dividend.');
  }

  function newChallenge() {
    setChallenge(makeDividendChallenge(level));
    setSelectedDividend(null);
    setTone('neutral');
    setMessage('New challenge. Calculate the missing dividend.');
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Dividend builder game">
      <PageHeading
        label="game://computational-maths/dividend"
        title="Dividend Builder"
        description="Use divisor, quotient, and remainder to construct the missing dividend."
        actions={
          <>
            <button type="button" className="icon-button" onClick={newChallenge} title="New challenge">
              <RefreshCw size={18} />
              <span>New</span>
            </button>
            <button type="button" className="icon-button" onClick={showHint} title="Hint">
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
            <button type="button" className="icon-button" onClick={resetGame} title="Reset">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel flex min-h-[560px] flex-col justify-between gap-7 p-5 lg:p-8" aria-labelledby="dividend-expression">
          <div className="grid items-center gap-4 md:grid-cols-[minmax(260px,0.8fr)_minmax(260px,1fr)]">
            <div>
              <span className="ui-label">Find the dividend</span>
              <strong
                className="block font-mono text-4xl font-black leading-tight text-[#32f584] drop-shadow-[0_0_30px_rgba(50,245,132,0.22)] md:text-5xl"
                id="dividend-expression"
              >
                ? = {challenge.divisor} x {challenge.quotient} + {challenge.remainder}
              </strong>
            </div>
            <StatusMessage tone={tone}>{message}</StatusMessage>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <FactCard label="Divisor" value={challenge.divisor} description="The group size." />
            <FactCard label="Quotient" value={challenge.quotient} description="How many full groups." />
            <FactCard label="Remainder" value={challenge.remainder} description="What is left over." />
          </div>

          <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-5">
            <span className="ui-label">Build the dividend</span>
            <div className="mt-4 grid gap-3 font-mono text-xl font-black text-[#f1fff6]">
              <div>{challenge.divisor} x {challenge.quotient} = {challenge.divisor * challenge.quotient}</div>
              <div className="text-[#a8ffd0]">
                {challenge.divisor * challenge.quotient} + {challenge.remainder} = dividend
              </div>
            </div>
            <p className="mt-5 text-sm font-bold leading-relaxed text-[#a6c6b3]">
              A dividend is the number being divided. With remainders, rebuild it by multiplying the divisor and quotient, then adding the remainder.
            </p>
          </div>

          <div>
            <span className="ui-label">Choose the dividend</span>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {options.map((option) => (
                <button
                  type="button"
                  className={`min-h-20 rounded-lg border font-mono text-4xl font-black transition hover:-translate-y-0.5 ${
                    selectedDividend === option
                      ? 'border-[#32f584]/80 bg-[#32f584]/15 text-[#a8ffd0] shadow-[0_0_28px_rgba(50,245,132,0.16)]'
                      : 'border-[#93ffc2]/20 bg-[#effff6]/5 text-[#a6c6b3]'
                  }`}
                  key={option}
                  onClick={() => setSelectedDividend(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-3.5 border-t border-[#93ffc2]/20 pt-5 md:grid-cols-[minmax(210px,1fr)_minmax(160px,0.75fr)_auto]">
            <DividendMetric label="Selected dividend" value={selectedDividend ?? '-'} />
            <DividendMetric label="Equation" value={`${challenge.divisor} x ${challenge.quotient} + ${challenge.remainder}`} />
            <button type="button" className="decision-button bg-[#0a9f8e] shadow-[0_14px_30px_rgba(41,214,197,0.18)]" onClick={checkAnswer}>
              <Check size={22} />
              <span>Check</span>
            </button>
          </div>
        </section>

        <aside className="panel p-6" aria-label="Dividend game score">
          <div className="flex items-center justify-between gap-3 text-[#a8ffd0]">
            <h2 className="text-xl font-black">Dividend Console</h2>
            <Divide size={20} />
          </div>

          <div className="my-5 grid gap-2.5">
            <ScoreRow label="Score" value={score} />
            <ScoreRow label="Level" value={level} />
            <ScoreRow label="Challenges left" value={challengesLeft} />
          </div>

          <div className="rounded-lg border border-[#f5c15b]/30 bg-[#f5c15b]/10 p-4">
            <strong className="mb-2 block text-base text-[#ffe7a9]">Dividend rule</strong>
            <p className="text-sm font-bold leading-relaxed text-[#e4c98d]">
              dividend = divisor x quotient + remainder.
            </p>
          </div>

          <ol className="pseudo-code mb-0">
            <li className="active">multiply divisor and quotient</li>
            <li>add the remainder</li>
            <li>the total is the dividend</li>
            <li className={correct ? 'done active' : ''}>check the missing value</li>
          </ol>

          <div className="mt-5">
            <GlossaryPanel terms={GLOSSARY_TERMS} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function FactCard({ label, value, description }) {
  return (
    <article className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-5">
      <span className="ui-label">{label}</span>
      <strong className="mt-3 block font-mono text-6xl font-black text-[#32f584]">{value}</strong>
      <p className="mt-3 text-sm font-bold text-[#a6c6b3]">{description}</p>
    </article>
  );
}

function DividendMetric({ label, value }) {
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
