"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import GlossaryPanel from "./GlossaryPanel";
import {
  INITIAL_IPV4_STATE,
  IPV4_CHALLENGES,
  ipv4Reducer,
} from "../utils/ipv4";
import { markGameComplete } from "../utils/progress";

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
const CHOICES = {
  valid: [
    ["valid", "Valid IPv4"],
    ["invalid", "Not valid"],
  ],
  private: [
    ["private", "Private"],
    ["public", "Public"],
  ],
  subnet: [
    ["same", "Same network"],
    ["different", "Different networks"],
  ],
} as const;
const TITLES = {
  valid: "Check this address",
  binary: "Build the octet",
  private: "Private or public?",
  subnet: "Do these devices share a network?",
};
const PROMPTS = {
  valid: "Does this address have four decimal octets, each from 0 to 255?",
  binary:
    "Switch on the place values that add up to the target. Each octet has eight bits.",
  private:
    "Does this address belong to one of the three RFC 1918 private ranges?",
  subnet:
    "Both devices use /24 (255.255.255.0). Compare their first three octets, not just the final number.",
};
const GLOSSARY = [
  {
    term: "IPv4",
    definition:
      "A 32-bit address, normally written as four decimal octets separated by dots.",
  },
  {
    term: "Octet",
    definition:
      "A group of eight bits. In dotted-decimal notation its value is from 0 to 255.",
  },
  {
    term: "Private address",
    definition:
      "An address reserved for use inside private networks. It is not directly routed across the public internet.",
  },
  {
    term: "Subnet mask",
    definition:
      "A value that separates the network portion of an address from the host portion.",
  },
  {
    term: "/24",
    definition:
      "The first 24 bits (three octets) identify the subnet; the last eight bits identify the host. The mask is 255.255.255.0.",
  },
];

export default function IPv4AddressLabGame() {
  const [state, dispatch] = useReducer(ipv4Reducer, INITIAL_IPV4_STATE);
  const [hintOpen, setHintOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = IPV4_CHALLENGES[state.index];
  const locked = state.phase === "correct" || state.phase === "complete";
  const bits =
    question.kind === "binary" ? (state.selected ?? "00000000") : "00000000";
  const total = IPV4_CHALLENGES.length;
  const message =
    state.notice === "empty"
      ? "Choose an answer first. For a binary question, switch on the bits you need."
      : state.phase === "incorrect"
        ? "Not quite. Use the reference or show the hint, then try again."
        : state.phase === "complete"
          ? `Correct. ${question.explanation} All ${total} challenges complete. You checked addresses, built binary octets and compared networks. Replay any time.`
          : locked
            ? `Correct. ${question.explanation} Continue when you are ready.`
            : PROMPTS[question.kind];

  useEffect(() => {
    if (state.phase === "complete") markGameComplete("ipv4");
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
  function toggleBit(index: number) {
    const answer = [...bits]
      .map((bit, i) => (i === index ? (bit === "0" ? "1" : "0") : bit))
      .join("");
    dispatch({ type: "choose", index: state.index, answer });
  }

  return (
    <section aria-label="IPv4 game" className="flex min-w-0 flex-col gap-5">
      <header className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0 max-w-prose">
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            IPv4 Address Lab
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Read an address, build its binary octets and work out which devices
            belong on the same network.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="icon-button min-h-11 shrink-0"
        >
          Reset
        </button>
      </header>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section
          aria-label="Current challenge"
          className="panel min-w-0 p-4 sm:p-6"
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
            {TITLES[question.kind]}
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            {PROMPTS[question.kind]}
          </p>
          <div className="my-6 border-y border-accent/20 py-5">
            {question.kind === "binary" ? (
              <p className="text-lg text-muted">
                Target octet{" "}
                <strong className="ml-2 font-mono text-3xl text-foreground">
                  {question.decimal}
                </strong>
              </p>
            ) : question.kind === "subnet" ? (
              <div className="space-y-4">
                <p>
                  <span className="block text-sm text-muted">Device A</span>
                  <code className="break-all text-xl text-foreground sm:text-2xl">
                    {question.a}
                  </code>
                </p>
                <p>
                  <span className="block text-sm text-muted">Device B</span>
                  <code className="break-all text-xl text-foreground sm:text-2xl">
                    {question.b}
                  </code>
                </p>
                <p className="font-mono text-sm text-warning">
                  Mask: 255.255.255.0 (/24)
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-sm text-muted">Address to inspect</p>
                <code className="break-all text-2xl text-foreground sm:text-3xl">
                  {question.address}
                </code>
              </div>
            )}
          </div>
          <fieldset disabled={locked}>
            <legend className="font-semibold text-foreground">
              {question.kind === "binary"
                ? "Build an eight-bit octet"
                : "Choose your answer"}
            </legend>
            {question.kind === "binary" ? (
              <div>
                <div className="mt-4 grid grid-cols-4 gap-2 xl:grid-cols-8">
                  {WEIGHTS.map((weight, index) => (
                    <div key={weight} className="min-w-0 text-center">
                      <p
                        aria-hidden="true"
                        className="mb-2 font-mono text-sm text-muted"
                      >
                        {weight}
                      </p>
                      <button
                        type="button"
                        aria-label={`Bit ${weight}`}
                        aria-pressed={bits[index] === "1"}
                        onClick={() => toggleBit(index)}
                        className={`min-h-14 w-full rounded-lg border font-mono text-2xl font-bold transition-colors disabled:cursor-not-allowed ${bits[index] === "1" ? "border-accent bg-accent/15 text-accent" : "border-accent/25 bg-canvas text-foreground hover:border-accent/60"}`}
                      >
                        {bits[index]}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                  <span>
                    Binary{" "}
                    <output
                      className="font-mono text-foreground"
                      aria-label="Your binary octet"
                    >
                      {bits}
                    </output>
                  </span>
                  <span>
                    Decimal{" "}
                    <output
                      className="font-mono text-foreground"
                      aria-label="Your decimal value"
                    >
                      {Number.parseInt(bits, 2)}
                    </output>
                  </span>
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CHOICES[question.kind].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={state.selected === value}
                    onClick={() =>
                      dispatch({
                        type: "choose",
                        index: state.index,
                        answer: value,
                      })
                    }
                    className={`min-h-14 rounded-lg border px-3 py-3 font-semibold transition-colors disabled:cursor-not-allowed ${state.selected === value ? "border-accent bg-accent/15 text-accent" : "border-accent/25 bg-canvas text-foreground hover:border-accent/60"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
          <div
            role="status"
            aria-label="Answer feedback"
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
              <button
                type="button"
                onClick={reset}
                className="icon-button min-h-11"
              >
                Play again
              </button>
            ) : (
              <button
                type="button"
                disabled={state.phase !== "correct"}
                onClick={next}
                className="icon-button min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next challenge
              </button>
            )}
          </div>
          <div className="mt-6 border-t border-accent/20 pt-4">
            <button
              type="button"
              aria-controls="ipv4-hint"
              aria-expanded={hintOpen}
              onClick={() => setHintOpen((open) => !open)}
              className="icon-button min-h-11"
            >
              {hintOpen ? "Hide hint" : "Show hint"}
            </button>
            {hintOpen && (
              <p
                id="ipv4-hint"
                className="mt-3 text-sm leading-relaxed text-warning"
              >
                {question.hint}
              </p>
            )}
          </div>
        </section>
        <aside aria-label="IPv4 reference" className="panel min-w-0 p-4 sm:p-6">
          <h2 className="font-display text-xl font-bold text-foreground">
            An address in four parts
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            IPv4 uses 32 bits: four octets of eight bits each. In decimal, each
            octet ranges from 0 to 255. This lab uses ordinary dotted-decimal
            notation without leading zeros.
          </p>
          <p
            className="my-4 break-all font-mono text-lg text-accent"
            aria-label="Example IPv4 address"
          >
            192.168.1.24
          </p>
          <h3 className="mt-5 font-semibold text-foreground">
            Private address ranges
          </h3>
          <ul className="mt-3 space-y-2 font-mono text-sm text-muted">
            <li>10.0.0.0 – 10.255.255.255</li>
            <li>172.16.0.0 – 172.31.255.255</li>
            <li>192.168.0.0 – 192.168.255.255</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Private addresses are valid for local networks. Not every
            non-private address is public: some ranges have special uses. This
            lab uses an ordinary public address for comparison.
          </p>
          <h3 className="mt-5 font-semibold text-foreground">
            Compare a /24 subnet
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            With mask 255.255.255.0, the first three octets must match. For
            example, 10.0.2.4 and 10.0.2.9 share the 10.0.2.0/24 subnet. Other
            masks can use different boundaries.
          </p>
          <div className="mt-5 [&_summary]:min-h-11 [&_summary]:normal-case [&_summary]:tracking-normal">
            <GlossaryPanel terms={GLOSSARY} />
          </div>
        </aside>
      </div>
    </section>
  );
}
