import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GateSymbol from "../src/components/GateSymbol";
import CircuitDiagram from "../src/components/CircuitDiagram";
import type { Gate } from "../src/utils/logicGates";
import { LOGIC_CHALLENGES } from "../src/utils/logicGates";

test("AND renders a flat-input D-shaped body with two separate pins, not a labelled box", () => {
  const markup = renderToStaticMarkup(<GateSymbol gate="AND" />);
  assert.match(markup, /role="img"/);
  assert.match(markup, /aria-label="AND gate symbol"/);
  assert.match(markup, /data-part="body" d="M40 20 H82 A30 30 0 0 1 82 80 H40 Z"/);
  assert.equal((markup.match(/data-part="input-pin"/g) || []).length, 2);
  assert.match(markup, /x1="12" y1="36" x2="40" y2="36"/);
  assert.match(markup, /x1="12" y1="64" x2="40" y2="64"/);
  assert.doesNotMatch(markup, /<rect|<text|<image|data-part="inversion"|data-part="exclusive-curve"/);
});

const captionExpectations = [
  ["AND takes A = 1 and B = 0. Find output Y."],
  ["OR takes A = 0 and B = 1. Find output Y."],
  ["NOT takes A = 0. Find output Y."],
  ["XOR takes A = 1 and B = 0. Find output Y."],
  ["NAND takes A = 0 and B = 1. Find output Y."],
  ["NOR takes A = 1 and B = 0. Find output Y."],
  ["XNOR takes A = 1 and B = 1. Find output Y."],
  ["XOR takes A = 1 and B = 1. Find output Y."],
  ["Stage 1: AND takes A = 1 and B = 1. Its output feeds the next gate.", "Stage 2: NOT takes the first gate’s output. Find output Y."],
  ["Stage 1: OR takes A = 0 and B = 1. Its output feeds the next gate.", "Stage 2: AND takes the first gate’s output and C = 1. Find output Y."],
];

test("shared circuit diagrams preserve all ten original captions with real symbols and unknown outputs", () => {
  assert.equal(LOGIC_CHALLENGES.length, captionExpectations.length);
  for (const [index, challenge] of LOGIC_CHALLENGES.entries()) {
    const markup = renderToStaticMarkup(<CircuitDiagram circuit={challenge.circuit} />);
    assert.match(markup, /aria-label="Gate circuit diagram"/);
    const caption = markup.match(/<figcaption\b[^>]*>(.*?)<\/figcaption>/)?.[1];
    assert.ok(caption);
    const paragraphs = Array.from(caption.matchAll(/<p>(.*?)<\/p>/g), (match) => match[1]);
    assert.deepEqual(paragraphs, captionExpectations[index]);
    assert.equal((markup.match(/data-part="body"/g) || []).length, index < 8 ? 1 : 2);
    assert.equal((markup.match(/data-part="input-pin"/g) || []).length, index === 2 ? 1 : index === 8 ? 3 : index === 9 ? 4 : 2);
    assert.equal((markup.match(/Y = \?/g) || []).length, 1);
    assert.doesNotMatch(markup, /Y = [01]|<rect|<text|<image/);
  }
});

const cases: readonly { gate: Gate; body: string; inputs: number; bubble: boolean; exclusive: boolean; description: string }[] = [
  { gate: "AND", body: "M40 20 H82 A30 30 0 0 1 82 80 H40 Z", inputs: 2, bubble: false, exclusive: false, description: "Flat input edge, rounded output edge" },
  { gate: "OR", body: "M36 20 Q84 18 112 50 Q84 82 36 80 Q58 50 36 20 Z", inputs: 2, bubble: false, exclusive: false, description: "Curved input edge, pointed output" },
  { gate: "NOT", body: "M40 20 L112 50 L40 80 Z", inputs: 1, bubble: true, exclusive: false, description: "Triangle with a tip bubble" },
  { gate: "XOR", body: "M36 20 Q84 18 112 50 Q84 82 36 80 Q58 50 36 20 Z", inputs: 2, bubble: false, exclusive: true, description: "Two input curves, pointed output" },
  { gate: "NAND", body: "M40 20 H82 A30 30 0 0 1 82 80 H40 Z", inputs: 2, bubble: true, exclusive: false, description: "Flat input edge, rounded output edge with a tip bubble" },
  { gate: "NOR", body: "M36 20 Q84 18 112 50 Q84 82 36 80 Q58 50 36 20 Z", inputs: 2, bubble: true, exclusive: false, description: "Curved input edge, pointed output with a tip bubble" },
  { gate: "XNOR", body: "M36 20 Q84 18 112 50 Q84 82 36 80 Q58 50 36 20 Z", inputs: 2, bubble: true, exclusive: true, description: "Two input curves, pointed output with a tip bubble" },
];

for (const { gate, body, inputs, bubble, exclusive, description } of cases) {
  test(`${gate} has its traditional outline, input count, inversion and exclusive features`, () => {
    const markup = renderToStaticMarkup(<GateSymbol gate={gate} />);
    assert.ok(markup.includes(`data-part="body" d="${body}"`));
    assert.equal((markup.match(/data-part="input-pin"/g) || []).length, inputs);
    assert.equal((markup.match(/data-part="inversion"/g) || []).length, bubble ? 1 : 0);
    assert.equal((markup.match(/data-part="exclusive-curve"/g) || []).length, exclusive ? 1 : 0);
    if (exclusive) assert.match(markup, /data-part="exclusive-curve" d="M28 20 Q50 50 28 80"/);
    if (bubble) assert.match(markup, /data-part="inversion" cx="118" cy="50" r="6"/);
    assert.match(markup, new RegExp(`data-part="output-pin" x1="${bubble ? 124 : 112}" y1="50" x2="148" y2="50"`));
    if (gate === "NOT") assert.match(markup, /x1="12" y1="50" x2="40" y2="50"/);
    if (gate === "OR" || gate === "NOR" || exclusive) {
      // The pin ends on the concave boundary, not outside it or inside the body.
      assert.match(markup, /x1="12" y1="36" x2="44.6" y2="36"/);
      assert.match(markup, /x1="12" y1="64" x2="44.6" y2="64"/);
    }
    assert.match(markup, new RegExp(`aria-label="${gate} gate symbol"`));
    assert.match(markup, /role="img"/);
    assert.match(markup, /viewBox="0 0 160 100"/);
    assert.match(markup, /stroke="currentColor"/);
    assert.doesNotMatch(markup, /<rect|<text|<image|<linearGradient|<radialGradient/);
    assert.ok(markup.includes(`>${gate}</p>`), "the name is a caption, not a substitute for geometry");
  });

  test(`${gate} recognition mode describes geometry without revealing the gate name`, () => {
    const markup = renderToStaticMarkup(<GateSymbol gate={gate} hideName />);
    assert.ok(markup.includes(`aria-label="${description}"`));
    assert.doesNotMatch(markup, /\b(?:AND|OR|NOT|XOR|NAND|NOR|XNOR)\b/);
    assert.doesNotMatch(markup, /<p\b|<text\b/);
    assert.ok(markup.includes(`data-part="body" d="${body}"`));
  });
}
