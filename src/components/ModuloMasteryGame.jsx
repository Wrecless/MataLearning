import { Check, Lightbulb, Percent, RefreshCw, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { makeModuloChallenge, MODULO_CHALLENGES_PER_LEVEL } from '../utils/modulo.js';
import PageHeading from './PageHeading.jsx';

export default function ModuloMasteryGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [challengesLeft, setChallengesLeft] = useState(MODULO_CHALLENGES_PER_LEVEL);
  const [challenge, setChallenge] = useState(() => makeModuloChallenge(1));
  const [selectedRemainder, setSelectedRemainder] = useState(null);
  const [message, setMessage] = useState('Choose the remainder left after making equal groups.');
  const [tone, setTone] = useState('neutral');

  const remainderOptions = Array.from({ length: challenge.divisor }, (_, index) => index);
  const correct = selectedRemainder === challenge.remainder;

  function nextChallenge() {
    const nextChallengesLeft = challengesLeft - 1;
    const levelComplete = nextChallengesLeft <= 0;
    const nextLevel = levelComplete ? level + 1 : level;

    setLevel(nextLevel);
    setChallengesLeft(levelComplete ? MODULO_CHALLENGES_PER_LEVEL : nextChallengesLeft);
    setChallenge(makeModuloChallenge(nextLevel));
    setSelectedRemainder(null);
    setTone(levelComplete ? 'success' : 'neutral');
    setMessage(
      levelComplete
        ? `Level ${level} complete. Level ${nextLevel} uses wider modulo challenges.`
        : 'New modulo challenge ready.',
    );
  }

  function checkAnswer() {
    if (selectedRemainder === null) {
      setTone('hint');
      setMessage('Select a possible remainder first.');
      return;
    }

    if (!correct) {
      setTone('error');
      setMessage(
        `${challenge.dividend} = ${challenge.quotient} x ${challenge.divisor} + ${challenge.remainder}, so the remainder is ${challenge.remainder}.`,
      );
      return;
    }

    setScore((current) => current + level * 10);
    setTone('success');
    setMessage(
      `Correct: ${challenge.dividend} = ${challenge.quotient} x ${challenge.divisor} + ${challenge.remainder}.`,
    );
    window.setTimeout(nextChallenge, 520);
  }

  function showHint() {
    setTone('hint');
    setMessage(
      `Largest multiple of ${challenge.divisor} that fits into ${challenge.dividend} is ${challenge.largestMultiple}. Subtract it to find the remainder.`,
    );
  }

  function resetGame() {
    setLevel(1);
    setScore(0);
    setChallengesLeft(MODULO_CHALLENGES_PER_LEVEL);
    setChallenge(makeModuloChallenge(1));
    setSelectedRemainder(null);
    setTone('neutral');
    setMessage('Fresh modulo challenge. Choose the remainder left after grouping.');
  }

  function newChallenge() {
    setChallenge(makeModuloChallenge(level));
    setSelectedRemainder(null);
    setTone('neutral');
    setMessage('New challenge. Work out the remainder.');
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Modulo mastery game">
      <PageHeading
        label="game://computational-maths/modulo"
        title="Modulo Mastery"
        description="Find the remainder after division and connect modulo to repeating cycles."
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
        <section className="panel flex min-h-[560px] flex-col justify-between gap-7 p-5 lg:p-8" aria-labelledby="modulo-expression">
          <div className="grid items-center gap-4 md:grid-cols-[minmax(220px,0.7fr)_minmax(260px,1fr)]">
            <div>
              <span className="ui-label">Solve</span>
              <strong
                className="block font-mono text-5xl font-black leading-none text-[#32f584] drop-shadow-[0_0_30px_rgba(50,245,132,0.22)] md:text-6xl"
                id="modulo-expression"
              >
                {challenge.dividend} mod {challenge.divisor}
              </strong>
            </div>
            <StatusMessage tone={tone}>{message}</StatusMessage>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-5">
              <span className="ui-label">Division model</span>
              <div className="mt-4 grid gap-3 font-mono text-xl font-black text-[#f1fff6]">
                <div>{challenge.dividend} = ? x {challenge.divisor} + remainder</div>
                <div className="text-[#a8ffd0]">
                  {challenge.largestMultiple} + remainder = {challenge.dividend}
                </div>
              </div>
              <p className="mt-5 text-sm font-bold leading-relaxed text-[#a6c6b3]">
                Modulo asks what is left after subtracting the largest exact multiple of the divisor.
              </p>
            </div>

            <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-5">
              <span className="ui-label">Cycle view</span>
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {Array.from({ length: Math.min(challenge.dividend + 1, 24) }, (_, value) => (
                  <div
                    className={`grid min-h-12 place-items-center rounded-lg border font-mono text-sm font-black ${
                      value % challenge.divisor === challenge.remainder && value <= challenge.dividend
                        ? 'border-[#f5c15b]/60 bg-[#f5c15b]/10 text-[#ffe5a8]'
                        : 'border-[#93ffc2]/15 bg-black/20 text-[#6c8b78]'
                    }`}
                    key={value}
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="ui-label">Choose the remainder</span>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
              {remainderOptions.map((option) => (
                <button
                  type="button"
                  className={`min-h-20 rounded-lg border font-mono text-4xl font-black transition hover:-translate-y-0.5 ${
                    selectedRemainder === option
                      ? 'border-[#32f584]/80 bg-[#32f584]/15 text-[#a8ffd0] shadow-[0_0_28px_rgba(50,245,132,0.16)]'
                      : 'border-[#93ffc2]/20 bg-[#effff6]/5 text-[#a6c6b3]'
                  }`}
                  key={option}
                  onClick={() => setSelectedRemainder(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-3.5 border-t border-[#93ffc2]/20 pt-5 md:grid-cols-[minmax(210px,1fr)_minmax(160px,0.75fr)_auto]">
            <ModuloMetric label="Selected remainder" value={selectedRemainder ?? '-'} />
            <ModuloMetric label="Expression" value={`${challenge.dividend} % ${challenge.divisor}`} />
            <button type="button" className="decision-button bg-[#0a9f8e] shadow-[0_14px_30px_rgba(41,214,197,0.18)]" onClick={checkAnswer}>
              <Check size={22} />
              <span>Check</span>
            </button>
          </div>
        </section>

        <aside className="panel p-6" aria-label="Modulo game score">
          <div className="flex items-center justify-between gap-3 text-[#a8ffd0]">
            <h2 className="text-xl font-black">Modulo Console</h2>
            <Percent size={20} />
          </div>

          <div className="my-5 grid gap-2.5">
            <ScoreRow label="Score" value={score} />
            <ScoreRow label="Level" value={level} />
            <ScoreRow label="Challenges left" value={challengesLeft} />
          </div>

          <div className="rounded-lg border border-[#f5c15b]/30 bg-[#f5c15b]/10 p-4">
            <strong className="mb-2 block text-base text-[#ffe7a9]">Modulo rule</strong>
            <p className="text-sm font-bold leading-relaxed text-[#e4c98d]">
              a mod b is the remainder after a is divided into groups of b.
            </p>
          </div>

          <ol className="pseudo-code mb-0">
            <li className="active">find the divisor</li>
            <li>find the largest fitting multiple</li>
            <li>subtract the multiple from the dividend</li>
            <li className={correct ? 'done active' : ''}>the result is the remainder</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

function ModuloMetric({ label, value }) {
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
