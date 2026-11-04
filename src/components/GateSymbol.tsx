import React from "react";
import type { Gate } from "../utils/logicGates";

const DESCRIPTIONS: Record<Gate, string> = {
  AND: "Flat input edge, rounded output edge",
  OR: "Curved input edge, pointed output",
  NOT: "Triangle with a tip bubble",
  XOR: "Two input curves, pointed output",
  NAND: "Flat input edge, rounded output edge with a tip bubble",
  NOR: "Curved input edge, pointed output with a tip bubble",
  XNOR: "Two input curves, pointed output with a tip bubble",
};

export default function GateSymbol({
  gate,
  hideName = false,
}: {
  gate: Gate;
  hideName?: boolean;
}) {
  const unary = gate === "NOT";
  const rounded = gate === "AND" || gate === "NAND";
  const exclusive = gate === "XOR" || gate === "XNOR";
  const inverted = unary || gate === "NAND" || gate === "NOR" || gate === "XNOR";
  const body = unary
    ? "M40 20 L112 50 L40 80 Z"
    : rounded
      ? "M40 20 H82 A30 30 0 0 1 82 80 H40 Z"
      : "M36 20 Q84 18 112 50 Q84 82 36 80 Q58 50 36 20 Z";

  return (
    <div className="mx-auto w-full max-w-56 text-foreground">
      <svg
        viewBox="0 0 160 100"
        role="img"
        aria-label={hideName ? DESCRIPTIONS[gate] : `${gate} gate symbol`}
        className="block h-auto w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        {(unary ? [50] : [36, 64]).map((y) => (
          <line
            key={y}
            data-part="input-pin"
            x1="12"
            y1={y}
            x2={unary || rounded ? 40 : 44.6}
            y2={y}
          />
        ))}
        <path data-part="body" d={body} className="fill-canvas" />
        {exclusive && (
          <path data-part="exclusive-curve" d="M28 20 Q50 50 28 80" />
        )}
        {inverted && (
          <circle
            data-part="inversion"
            cx="118"
            cy="50"
            r="6"
            className="fill-canvas"
          />
        )}
        {/* The body meets the bubble at x=112; the wire starts at its far edge. */}
        <line
          data-part="output-pin"
          x1={inverted ? 124 : 112}
          y1="50"
          x2="148"
          y2="50"
        />
      </svg>
      {!hideName && <p className="text-center text-sm font-bold">{gate}</p>}
    </div>
  );
}
