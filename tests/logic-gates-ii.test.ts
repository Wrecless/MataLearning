import assert from "node:assert/strict";
import test from "node:test";
import {
  II_CHALLENGES,
  INITIAL_II_STATE,
  iiReducer,
} from "../src/utils/logicGatesII";

test("II answer checking requires a choice, permits retries, and locks a correct result", () => {
  let state = iiReducer(INITIAL_II_STATE, { type: "check", index: 0 });
  assert.equal(state.notice, "empty");
  state = iiReducer(state, { type: "choose", index: 0, answer: "OR" });
  state = iiReducer(state, { type: "check", index: 0 });
  assert.equal(state.phase, "incorrect");
  state = iiReducer(state, { type: "choose", index: 0, answer: "AND" });
  state = iiReducer(state, { type: "check", index: 0 });
  assert.equal(state.phase, "correct");
  assert.strictEqual(iiReducer(state, { type: "check", index: 0 }), state);
  assert.strictEqual(
    iiReducer(state, { type: "choose", index: 0, answer: "OR" }),
    state,
  );
});

test("II rejects wrong answer types, premature next, and stale duplicate advancement", () => {
  assert.strictEqual(
    iiReducer(INITIAL_II_STATE, { type: "next", index: 0 }),
    INITIAL_II_STATE,
  );
  assert.strictEqual(
    iiReducer(INITIAL_II_STATE, { type: "choose", index: 0, answer: 0 }),
    INITIAL_II_STATE,
  );
  let state = iiReducer(INITIAL_II_STATE, {
    type: "choose",
    index: 0,
    answer: "AND",
  });
  state = iiReducer(state, { type: "check", index: 0 });
  state = iiReducer(state, { type: "next", index: 0 });
  assert.equal(state.index, 1);
  assert.strictEqual(iiReducer(state, { type: "next", index: 0 }), state);
  assert.equal(state.selected, null);
});

test("II completes only after seven symbol answers and three circuit answers", () => {
  const answers = [
    "AND",
    "OR",
    "NOT",
    "XOR",
    "NAND",
    "NOR",
    "XNOR",
    1,
    0,
    0,
  ] as const;
  let state = INITIAL_II_STATE;
  for (const [index, answer] of answers.entries()) {
    assert.notEqual(state.phase, "complete");
    state = iiReducer(state, { type: "choose", index, answer });
    state = iiReducer(state, { type: "check", index });
    assert.equal(
      state.phase,
      index === answers.length - 1 ? "complete" : "correct",
    );
    if (index < answers.length - 1)
      state = iiReducer(state, { type: "next", index });
  }
  assert.strictEqual(iiReducer(state, { type: "next", index: 9 }), state);
  assert.deepEqual(iiReducer(state, { type: "reset" }), INITIAL_II_STATE);
});
import { evaluateCircuit } from "../src/utils/logicGates";

test("Logic Gates II ends with three distinct mixed-gate circuits", () => {
  const circuits = II_CHALLENGES.filter(
    (question) => question.kind === "circuit",
  );
  assert.equal(circuits.length, 3);
  assert.deepEqual(
    circuits.map((question) => evaluateCircuit(question.circuit)),
    [1, 0, 0],
  );
  assert.equal(
    new Set(II_CHALLENGES.map((question) => question.id)).size,
    II_CHALLENGES.length,
  );
});

test("Logic Gates II starts with one symbol question for every gate", () => {
  assert.deepEqual(
    II_CHALLENGES.filter((question) => question.kind === "symbol").map(
      (question) => question.gate,
    ),
    ["AND", "OR", "NOT", "XOR", "NAND", "NOR", "XNOR"],
  );
});
