import assert from "node:assert/strict";
import test from "node:test";
test("XNOR matches every truth-table row", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("XNOR", a, b)),
    [1, 0, 0, 1],
  );
});

test("NOR matches every truth-table row", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("NOR", a, b)),
    [1, 0, 0, 0],
  );
});

test("NAND matches every truth-table row", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("NAND", a, b)),
    [1, 1, 1, 0],
  );
});

test("XOR matches every truth-table row", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("XOR", a, b)),
    [0, 1, 1, 0],
  );
});

test("NOT matches every truth-table row", () => {
  assert.deepEqual(
    [0, 1].map((a) => evaluateGate("NOT", a)),
    [1, 0],
  );
});

test("OR matches every truth-table row", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("OR", a, b)),
    [0, 1, 1, 1],
  );
});

import {
  evaluateGate,
  evaluateCircuit,
  LOGIC_CHALLENGES,
  logicGameReducer,
  INITIAL_LOGIC_STATE,
  getTruthTable,
  explainCircuit,
} from "../src/utils/logicGates";

test("reference tables include every input and the correct unary NOT rows", () => {
  assert.deepEqual(getTruthTable("NOT"), [
    { a: 0, output: 1 },
    { a: 1, output: 0 },
  ]);
  assert.deepEqual(getTruthTable("AND"), [
    { a: 0, b: 0, output: 0 },
    { a: 0, b: 1, output: 0 },
    { a: 1, b: 0, output: 0 },
    { a: 1, b: 1, output: 1 },
  ]);
});

test("combined explanations trace the inner gate before the final output", () => {
  assert.deepEqual(explainCircuit(LOGIC_CHALLENGES[8].circuit), [
    "AND(1, 1) = 1",
    "NOT(1) = 0",
  ]);
  assert.deepEqual(explainCircuit(LOGIC_CHALLENGES[9].circuit), [
    "OR(0, 1) = 1",
    "AND(1, 1) = 1",
  ]);
});

test("invalid bits and missing binary inputs are rejected instead of silently coerced", () => {
  assert.throws(() => evaluateGate("AND", 2, 1), /binary/i);
  assert.throws(() => evaluateGate("OR", 0), /binary/i);
  assert.throws(() => evaluateGate("NOT", -1), /binary/i);
});

test("answer checking requires a choice, allows retry, and locks a correct answer", () => {
  let state = logicGameReducer(INITIAL_LOGIC_STATE, {
    type: "check",
    index: 0,
  });
  assert.equal(state.notice, "empty");
  state = logicGameReducer(state, { type: "choose", index: 0, bit: 1 });
  state = logicGameReducer(state, { type: "check", index: 0 });
  assert.equal(state.phase, "incorrect");
  assert.equal(state.index, 0);
  state = logicGameReducer(state, { type: "choose", index: 0, bit: 0 });
  state = logicGameReducer(state, { type: "check", index: 0 });
  assert.equal(state.phase, "correct");
  assert.equal(logicGameReducer(state, { type: "check", index: 0 }), state);
  assert.equal(
    logicGameReducer(state, { type: "choose", index: 0, bit: 1 }),
    state,
  );
});

test("only a correct challenge can advance; duplicate and stale actions never skip", () => {
  assert.equal(
    logicGameReducer(INITIAL_LOGIC_STATE, { type: "next", index: 0 }),
    INITIAL_LOGIC_STATE,
  );
  const chosen = logicGameReducer(INITIAL_LOGIC_STATE, {
    type: "choose",
    index: 0,
    bit: 0,
  });
  const correct = logicGameReducer(chosen, { type: "check", index: 0 });
  const next = logicGameReducer(correct, { type: "next", index: 0 });
  assert.deepEqual(next, { ...INITIAL_LOGIC_STATE, index: 1 });
  assert.equal(logicGameReducer(next, { type: "next", index: 0 }), next);
  assert.equal(logicGameReducer(next, { type: "check", index: 0 }), next);
  assert.equal(
    logicGameReducer(next, { type: "choose", index: 0, bit: 1 }),
    next,
  );
});

test("completion occurs only on the final correct check; replay resets session state", () => {
  let state = INITIAL_LOGIC_STATE;
  const answers = [0, 1, 1, 1, 1, 0, 1, 0, 0, 1] as const;
  for (const [index, bit] of answers.entries()) {
    assert.notEqual(state.phase, "complete");
    state = logicGameReducer(state, { type: "choose", index, bit });
    state = logicGameReducer(state, { type: "check", index });
    assert.equal(state.phase, index === 9 ? "complete" : "correct");
    if (index < 9) state = logicGameReducer(state, { type: "next", index });
  }
  assert.equal(logicGameReducer(state, { type: "next", index: 9 }), state);
  assert.equal(logicGameReducer(state, { type: "check", index: 9 }), state);
  assert.deepEqual(
    logicGameReducer(state, { type: "reset" }),
    INITIAL_LOGIC_STATE,
  );
});

test("the fixed teaching sequence covers seven gates and two combined circuits", () => {
  assert.equal(LOGIC_CHALLENGES.length, 10);
  assert.equal(new Set(LOGIC_CHALLENGES.map(({ id }) => id)).size, 10);
  assert.deepEqual(
    LOGIC_CHALLENGES.map(({ circuit }) => evaluateCircuit(circuit)),
    [0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
  );
  assert.deepEqual(
    LOGIC_CHALLENGES.slice(0, 7).map(({ circuit }) => circuit.gate),
    ["AND", "OR", "NOT", "XOR", "NAND", "NOR", "XNOR"],
  );
  assert.deepEqual(LOGIC_CHALLENGES[8].circuit, {
    gate: "NOT",
    a: { gate: "AND", a: 1, b: 1 },
  });
  assert.deepEqual(LOGIC_CHALLENGES[9].circuit, {
    gate: "AND",
    a: { gate: "OR", a: 0, b: 1 },
    b: 1,
  });
});

test("OR feeding AND preserves the final third input", () => {
  const results = [0, 1].flatMap((a) =>
    [0, 1].flatMap((b) =>
      [0, 1].map((c) =>
        evaluateCircuit({ gate: "AND", a: { gate: "OR", a, b }, b: c }),
      ),
    ),
  );
  assert.deepEqual(results, [0, 0, 0, 1, 0, 1, 0, 1]);
});

test("AND then NOT evaluates the intermediate wire for all inputs", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) =>
      evaluateCircuit({ gate: "NOT", a: { gate: "AND", a, b } }),
    ),
    [1, 1, 1, 0],
  );
});

test("AND outputs 1 only when both inputs are 1", () => {
  assert.deepEqual(
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ].map(([a, b]) => evaluateGate("AND", a, b)),
    [0, 0, 0, 1],
  );
});
