import React from "react";
import type { Circuit } from "../utils/logicGates";
import GateSymbol from "./GateSymbol";

export default function CircuitDiagram({ circuit }: { circuit: Circuit }) {
  const stages =
    typeof circuit.a === "number" ? [circuit] : [circuit.a, circuit];
  return (
    <figure
      className="my-5 min-w-0 border-y border-accent/20 py-5"
      aria-label="Gate circuit diagram"
    >
      <div className="space-y-5" aria-hidden="true">
        {stages.map((stage, index) => (
          <div
            key={index}
            data-circuit-stage={index + 1}
            className="mx-auto grid w-full max-w-80 grid-cols-[48px_minmax(0,1fr)_44px] items-center font-mono text-sm"
          >
            {/* Remove the caption's 20px from the pin-label area so both inputs
                stay aligned with the SVG's 36% and 64% input positions. */}
            <div className="relative mb-5 self-stretch text-accent">
              <span className={`absolute right-0 -translate-y-1/2 whitespace-nowrap ${stage.gate === "NOT" ? "top-1/2" : "top-[36%]"}`}>
                {typeof stage.a === "number" ? `A = ${stage.a}` : "wire"}
              </span>
              {stage.gate !== "NOT" && (
                <span className="absolute right-0 top-[64%] -translate-y-1/2 whitespace-nowrap">
                  {typeof stage.b === "number"
                    ? `${index > 0 ? "C" : "B"} = ${stage.b}`
                    : "wire"}
                </span>
              )}
            </div>
            <GateSymbol gate={stage.gate} />
            <div className="mb-5 whitespace-nowrap text-warning">
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
