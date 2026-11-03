"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { markGameComplete } from "../utils/progress";
import PageHeading from "./PageHeading";
import GlossaryPanel from "./GlossaryPanel";
import {
  INITIAL_LOGIC_STATE,
  LOGIC_CHALLENGES,
  explainCircuit,
  getTruthTable,
  logicGameReducer,
  type Circuit,
  type Gate,
} from "../utils/logicGates";

const RULES: Record<Gate, string> = {
  AND: "AND outputs 1 only when both inputs are 1.",
  OR: "OR outputs 1 when at least one input is 1, including when both are 1.",
  NOT: "NOT flips its single input: 0 becomes 1 and 1 becomes 0.",
  XOR: "XOR outputs 1 when the inputs are different; matching inputs give 0.",
  NAND: "NAND is NOT AND: work out AND, then flip its output.",
  NOR: "NOR is NOT OR: it outputs 1 only when both inputs are 0.",
  XNOR: "XNOR is NOT XOR: it outputs 1 when the inputs match.",
};

const GLOSSARY = [
  {
    term: "Bit / binary",
    definition:
      "A bit has two possible values: 0 (false or off) and 1 (true or on). Binary uses these two values.",
  },
  {
    term: "Input / output",
    definition:
      "An input enters a gate. The output is the value the gate produces, labelled Y here.",
  },
  {
    term: "Logic gate",
    definition:
      "A rule that turns one or more binary inputs into one binary output.",
  },
  {
    term: "Truth table",
    definition:
      "Every possible input combination and the output it produces. The marked row matches your given inputs.",
  },
  { term: "AND", definition: RULES.AND },
  { term: "OR", definition: RULES.OR },
  { term: "NOT / inversion", definition: RULES.NOT },
  { term: "XOR (exclusive OR)", definition: RULES.XOR },
  { term: "NAND", definition: RULES.NAND },
  { term: "NOR", definition: RULES.NOR },
  { term: "XNOR", definition: RULES.XNOR },
  {
    term: "Circuit / intermediate wire",
    definition:
      "Connected gates form a circuit. An intermediate wire carries one gate's output into the next gate's input. Evaluate the first gate before the next.",
  },
];

export default function LogicGatesGame() {
  const [state, dispatch] = useReducer(logicGameReducer, INITIAL_LOGIC_STATE);
  const [hint, setHint] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const challenge = LOGIC_CHALLENGES[state.index];
  const circuit = challenge.circuit;
  const combined =
    typeof circuit.a !== "number" ||
    (circuit.gate !== "NOT" && typeof circuit.b !== "number");
  const locked = state.phase === "correct" || state.phase === "complete";
  const solved = state.index + (locked ? 1 : 0);
  const explanation = explainCircuit(circuit).join(". ") + ".";
  const rule = combined
    ? "Evaluate the first gate, then feed its output into the next gate."
    : RULES[circuit.gate];
  const message =
    state.notice === "empty"
      ? "Choose output 0 or 1 first."
      : state.phase === "incorrect"
        ? `Not quite. ${rule} ${explanation} Choose again, then check your answer.`
        : state.phase === "complete"
          ? `Correct. ${explanation} All 10 challenges complete. You traced seven gate types and two combined circuits. Replay any time.`
          : locked
            ? `Correct. ${rule} ${explanation} Continue when you are ready.`
            : "Read the given inputs. Choose output 0 or 1, then check your answer.";

  useEffect(() => {
    if (state.phase === "complete") markGameComplete("logic");
  }, [state.phase]);

  function resetGame() {
    dispatch({ type: "reset" });
    setHint(false);
    heading.current?.focus();
  }

  function nextChallenge() {
    if (state.phase !== "correct") return;
    dispatch({ type: "next", index: state.index });
    setHint(false);
    heading.current?.focus();
  }

  return (
    <section
      aria-label="Logic gates game"
      className="flex min-w-0 flex-col gap-5 selection:bg-accent selection:text-canvas"
    >
      <PageHeading
        label="game://logic/gates"
        title="Logic Gates"
        description="Trace binary inputs through gates. Predict the output, then check your reasoning."
        actions={
          <button type="button" onClick={resetGame} className="icon-button">
            Reset
          </button>
        }
      />
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section
          className="panel min-w-0 p-4 sm:p-6"
          aria-label="Current challenge"
        >
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm text-muted">
            <p>
              Challenge {state.index + 1} / {LOGIC_CHALLENGES.length}
            </p>
            <p>
              Solved {solved} / {LOGIC_CHALLENGES.length}
            </p>
          </div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            {challenge.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            0 means off or false. 1 means on or true. Follow the wires from
            inputs to output Y.
          </p>
          <CircuitDiagram circuit={circuit} />
          <fieldset className="mt-6" disabled={locked}>
            <legend className="font-bold text-foreground">
              Choose the output
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {([0, 1] as const).map((bit) => (
                <button
                  key={bit}
                  type="button"
                  aria-label={`Output ${bit}`}
                  aria-pressed={state.selected === bit}
                  onClick={() =>
                    dispatch({ type: "choose", index: state.index, bit })
                  }
                  className={`min-h-20 rounded-lg border font-mono text-4xl font-bold transition-colors disabled:cursor-not-allowed ${state.selected === bit ? "border-accent bg-accent/15 text-accent" : "border-accent/25 bg-canvas text-muted hover:border-accent/60"}`}
                >
                  {bit}
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
              className="decision-button bg-accent/20 text-foreground"
            >
              Check answer
            </button>
            {state.phase === "complete" ? (
              <button type="button" onClick={resetGame} className="icon-button">
                Play again
              </button>
            ) : (
              <button
                type="button"
                disabled={state.phase !== "correct"}
                onClick={nextChallenge}
                className="icon-button min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next challenge
              </button>
            )}
          </div>
          <div className="mt-6 border-t border-accent/20 pt-4">
            <button
              type="button"
              aria-expanded={hint}
              aria-controls="logic-hint"
              onClick={() => setHint((value) => !value)}
              className="icon-button"
            >
              {hint ? "Hide hint" : "Show hint"}
            </button>
            {hint && (
              <section
                id="logic-hint"
                aria-label="Hint"
                className="mt-3 text-sm leading-relaxed text-warning"
              >
                <p>{rule}</p>
                <p className="mt-2">
                  {combined
                    ? "Use the circuit breakdown in the reference. The first result becomes an input to the final gate."
                    : "Find the row in the reference table whose inputs match the diagram. Read across to Y."}
                </p>
              </section>
            )}
          </div>
        </section>
        <aside
          className="panel min-w-0 p-4 sm:p-6"
          aria-label="Logic reference"
        >
          <h2 className="font-display text-xl font-bold">
            {combined ? "Circuit breakdown" : `${circuit.gate} reference`}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{rule}</p>
          {combined ? (
            <ol
              className="mt-4 list-decimal space-y-3 pl-5 font-mono text-sm text-accent"
              aria-label="Circuit evaluation steps"
            >
              {explainCircuit(circuit).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <TruthTable circuit={circuit} />
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {combined
              ? "The intermediate wire carries the first result. Only the final result is output Y."
              : "Given inputs marks the matching row. The reference stays available while you practise."}
          </p>
          <div className="mt-6 [&_summary]:min-h-11 [&_summary]:normal-case [&_summary]:tracking-normal">
            <GlossaryPanel terms={GLOSSARY} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function TruthTable({ circuit }: { circuit: Circuit }) {
  return (
    <table
      className="mt-4 w-full table-fixed border-collapse text-left font-mono text-sm"
      aria-label={`${circuit.gate} truth table`}
    >
      <thead>
        <tr className="border-b border-accent/25 text-muted">
          <th scope="col" className="py-2">
            A
          </th>
          {circuit.gate !== "NOT" && <th scope="col">B</th>}
          <th scope="col">Y</th>
          <th scope="col" className="w-20 font-sans text-xs">
            Match
          </th>
        </tr>
      </thead>
      <tbody>
        {getTruthTable(circuit.gate).map((row) => {
          const current =
            row.a === circuit.a &&
            (circuit.gate === "NOT" || row.b === circuit.b);
          return (
            <tr
              key={`${row.a}-${row.b ?? ""}`}
              aria-current={current ? "true" : undefined}
              className={`border-b border-accent/15 ${current ? "bg-accent/10 font-bold text-accent" : "text-foreground"}`}
            >
              <td className="py-3">{row.a}</td>
              {circuit.gate !== "NOT" && <td>{row.b}</td>}
              <td>{row.output}</td>
              <td className="font-sans text-xs">
                {current ? "Given inputs" : ""}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CircuitDiagram({ circuit }: { circuit: Circuit }) {
  const stages =
    typeof circuit.a === "number" ? [circuit] : [circuit.a, circuit];
  return (
    <figure
      className="my-5 border-y border-accent/20 py-5"
      aria-label="Gate circuit diagram"
    >
      <div className="space-y-4" aria-hidden="true">
        {stages.map((stage, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)_16px_minmax(0,1fr)] items-center font-mono text-sm"
          >
            <div className="space-y-2 text-accent">
              <div>
                {typeof stage.a === "number" ? `A = ${stage.a}` : "wire"}
              </div>
              {stage.gate !== "NOT" && (
                <div>
                  {typeof stage.b === "number"
                    ? `${index > 0 ? "C" : "B"} = ${stage.b}`
                    : "wire"}
                </div>
              )}
            </div>
            <div className="border-t border-accent/60" />
            <div className="flex min-h-20 items-center justify-center rounded-lg border-2 border-accent/60 bg-canvas px-1 font-bold text-foreground">
              {stage.gate}
            </div>
            <div className="border-t border-accent/60" />
            <div className="pl-1 text-warning">
              {index === stages.length - 1 ? "Y = ?" : "wire"}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-4 space-y-1 text-sm leading-relaxed text-muted">
        {stages.map((stage, index) => (
          <p key={index}>
            {stages.length > 1 ? `Stage ${index + 1}: ` : ""}
            {stage.gate} takes{" "}
            {typeof stage.a === "number"
              ? `A = ${stage.a}`
              : "the first gate’s output"}
            {stage.gate !== "NOT"
              ? ` and ${index > 0 ? "C" : "B"} = ${typeof stage.b === "number" ? stage.b : "the other gate’s output"}`
              : ""}
            .{" "}
            {index === stages.length - 1
              ? "Find output Y."
              : "Its output feeds the next gate."}
          </p>
        ))}
      </figcaption>
    </figure>
  );
}
