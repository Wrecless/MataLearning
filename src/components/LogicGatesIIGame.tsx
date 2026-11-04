"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import PageHeading from "./PageHeading";
import GlossaryPanel from "./GlossaryPanel";
import GateSymbol from "./GateSymbol";
import CircuitDiagram from "./CircuitDiagram";
import { explainCircuit, type Gate } from "../utils/logicGates";
import {
  INITIAL_II_STATE,
  II_CHALLENGES,
  II_GATES,
  iiReducer,
  type IIAnswer,
} from "../utils/logicGatesII";
import { markGameComplete } from "../utils/progress";

const GUIDE: Record<Gate, { feature: string; rule: string }> = {
  AND: {
    feature: "A flat input edge and a rounded output edge form a D shape.",
    rule: "The output is 1 only when both inputs are 1.",
  },
  OR: {
    feature:
      "A curved input edge and two sweeping curves meet at the output tip.",
    rule: "The output is 1 when either input, or both inputs, are 1.",
  },
  NOT: {
    feature: "A triangle has one input and a small circle at its output.",
    rule: "The output is the opposite of the single input.",
  },
  XOR: {
    feature: "An OR outline has an extra curved line on its input side.",
    rule: "The output is 1 when the two inputs are different.",
  },
  NAND: {
    feature: "An AND outline has a small circle at its output.",
    rule: "Work out AND, then invert the result.",
  },
  NOR: {
    feature: "An OR outline has a small circle at its output.",
    rule: "Work out OR, then invert the result.",
  },
  XNOR: {
    feature:
      "An XOR outline has both the extra input curve and an output circle.",
    rule: "The output is 1 when the two inputs are the same.",
  },
};
const GLOSSARY = [
  {
    term: "Gate symbol",
    definition:
      "A circuit drawing whose shape tells you which logical operation it performs.",
  },
  {
    term: "Inversion bubble",
    definition:
      "The small circle at an output flips 0 to 1 and 1 to 0. NOT, NAND, NOR and XNOR have one.",
  },
  {
    term: "Exclusive OR",
    definition:
      "XOR is true when exactly one of its two inputs is true. Its extra input curve distinguishes it from OR.",
  },
  {
    term: "Intermediate wire",
    definition:
      "A connection carrying the result of one gate into the next. Evaluate gates in order before finding the final output.",
  },
  {
    term: "Binary output",
    definition: "A gate produces one bit: 0 (false/off) or 1 (true/on).",
  },
];

export default function LogicGatesIIGame() {
  const [state, dispatch] = useReducer(iiReducer, INITIAL_II_STATE);
  const [hintOpen, setHintOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = II_CHALLENGES[state.index];
  const locked = state.phase === "correct" || state.phase === "complete";
  const total = II_CHALLENGES.length;
  const explanation =
    question.kind === "symbol"
      ? `That is the ${question.gate} symbol. ${GUIDE[question.gate].feature} ${GUIDE[question.gate].rule}`
      : explainCircuit(question.circuit).join(". ") + ".";
  const message =
    state.notice === "empty"
      ? "Choose an answer first."
      : state.phase === "incorrect"
        ? "Not quite. Check the symbol guide or show the hint, then try another answer."
        : state.phase === "complete"
          ? `Correct. ${explanation} All ${total} challenges complete. You identified every gate and traced three mixed circuits. Replay any time.`
          : locked
            ? `Correct. ${explanation} Continue when you are ready.`
            : question.kind === "symbol"
              ? "Look at the outline, extra input curve and any output circle. Which gate is shown?"
              : "Follow the given inputs through each gate. What is the final output Y?";

  useEffect(() => {
    if (state.phase === "complete") markGameComplete("logic-ii");
  }, [state.phase]);

  function reset() {
    dispatch({ type: "reset" });
    setHintOpen(false);
    heading.current?.focus();
  }
  function next() {
    if (state.phase !== "correct") return;
    dispatch({ type: "next", index: state.index });
    setHintOpen(false);
    heading.current?.focus();
  }
  const choices: readonly IIAnswer[] =
    question.kind === "symbol" ? II_GATES : [0, 1];

  return (
    <section
      aria-label="Logic gates II game"
      className="flex min-w-0 flex-col gap-5"
    >
      <PageHeading
        label="game://logic/gates-ii"
        title="Logic Gates II"
        description="Recognise all seven standard gate symbols, then trace XOR, NAND and XNOR through mixed circuits."
        actions={
          <button type="button" onClick={reset} className="icon-button">
            Reset
          </button>
        }
      />
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section
          className="panel min-w-0 p-4 sm:p-6"
          aria-label="Current challenge"
        >
          <div className="flex flex-wrap justify-between gap-2 text-sm text-muted">
            <p>
              Challenge {state.index + 1} / {total}
            </p>
            <p>
              Solved {state.index + (locked ? 1 : 0)} / {total}
            </p>
          </div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            {question.kind === "symbol" ? "Name this gate" : question.title}
          </h2>
          {question.kind === "symbol" ? (
            <figure
              className="my-5 border-y border-accent/20 py-5"
              aria-label="Unlabelled gate symbol"
            >
              <div className="mx-auto max-w-72 text-accent">
                <GateSymbol gate={question.gate} hideName />
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-muted">
                Inputs enter on the left. The output leaves on the right. A
                small output circle means inversion.
              </figcaption>
            </figure>
          ) : (
            <CircuitDiagram circuit={question.circuit} />
          )}
          <fieldset disabled={locked} className="mt-5">
            <legend className="font-semibold text-foreground">
              {question.kind === "symbol"
                ? "Choose the gate"
                : "Choose the output"}
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {choices.map((answer) => (
                <button
                  type="button"
                  key={answer}
                  aria-label={
                    typeof answer === "number" ? `Output ${answer}` : answer
                  }
                  aria-pressed={state.selected === answer}
                  onClick={() =>
                    dispatch({ type: "choose", index: state.index, answer })
                  }
                  className={`min-h-14 rounded-lg border px-2 py-3 font-mono text-lg font-bold transition-colors disabled:cursor-not-allowed ${state.selected === answer ? "border-accent bg-accent/15 text-accent" : "border-accent/25 bg-canvas text-foreground hover:border-accent/60"}`}
                >
                  {answer}
                </button>
              ))}
            </div>
          </fieldset>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`mt-5 rounded-lg border p-4 text-sm leading-relaxed ${locked ? "border-accent/40 bg-accent/10 text-foreground" : state.phase === "incorrect" || state.notice === "empty" ? "border-warning/50 bg-warning/10 text-warning" : "border-accent/20 text-muted"}`}
          >
            {message}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={locked}
              onClick={() => dispatch({ type: "check", index: state.index })}
              className="icon-button min-h-12 border-accent/50 bg-accent/15 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Check answer
            </button>
            {state.phase === "complete" ? (
              <button type="button" onClick={reset} className="icon-button">
                Play again
              </button>
            ) : (
              <button
                type="button"
                disabled={state.phase !== "correct"}
                onClick={next}
                className="icon-button disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next challenge
              </button>
            )}
          </div>
          <div className="mt-6 border-t border-accent/20 pt-4">
            <button
              type="button"
              aria-controls="logic-ii-hint"
              aria-expanded={hintOpen}
              onClick={() => setHintOpen((open) => !open)}
              className="icon-button"
            >
              {hintOpen ? "Hide hint" : "Show hint"}
            </button>
            {hintOpen && (
              <div
                id="logic-ii-hint"
                className="mt-3 text-sm leading-relaxed text-warning"
              >
                {question.kind === "symbol"
                  ? GUIDE[question.gate].feature
                  : explainCircuit(question.circuit).join(". ") + "."}
              </div>
            )}
          </div>
        </section>
        <aside
          aria-label="Logic Gates II reference"
          className="panel min-w-0 p-4 sm:p-6"
        >
          <h2 className="font-display text-xl font-bold">Read the shape</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            D-shaped means AND. A pointed, curved outline means OR. A triangle
            means NOT. Extra input curves distinguish XOR; output circles invert
            a result.
          </p>
          <details className="mt-5 border-y border-accent/20 py-3">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold text-accent">
              Gate symbol guide
            </summary>
            <div className="divide-y divide-accent/15">
              {II_GATES.map((gate) => (
                <section key={gate} className="py-4">
                  <h3 className="font-mono font-bold text-foreground">
                    {gate}
                  </h3>
                  <div className="max-w-56 text-accent">
                    <GateSymbol gate={gate} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {GUIDE[gate].rule}
                  </p>
                </section>
              ))}
            </div>
          </details>
          <div className="mt-5 [&_summary]:min-h-11 [&_summary]:normal-case [&_summary]:tracking-normal">
            <GlossaryPanel terms={GLOSSARY} />
          </div>
          <Link href="/games/logic-gates" className="icon-button mt-5">
            Practise Logic Gates
          </Link>
        </aside>
      </div>
    </section>
  );
}
