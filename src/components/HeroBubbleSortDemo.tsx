"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const DEMO_LIST = [5, 2, 8, 1, 4];
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

interface TraceStep {
  array: number[];
  i: number;
  type: "compare" | "swap" | "done";
}

function buildTrace(list: readonly number[]): TraceStep[] {
  const arr = [...list];
  const trace: TraceStep[] = [];

  for (let pass = 0; pass < arr.length - 1; pass += 1) {
    for (let i = 0; i < arr.length - 1 - pass; i += 1) {
      const willSwap = arr[i] > arr[i + 1];
      trace.push({ array: [...arr], i, type: "compare" });

      if (willSwap) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        trace.push({ array: [...arr], i, type: "swap" });
      }
    }
  }

  trace.push({ array: [...arr], i: -1, type: "done" });
  return trace;
}

export default function HeroBubbleSortDemo() {
  const trace = useMemo(() => buildTrace(DEMO_LIST), []);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot,
  );
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // The hydration snapshot is false; check the live preference before scheduling.
    if (prefersReducedMotion || getReducedMotionSnapshot()) {
      return undefined;
    }

    const step = trace[stepIndex];
    const delay =
      step.type === "done" ? 2000 : step.type === "swap" ? 550 : 850;
    const timer = window.setTimeout(() => {
      setStepIndex((current) => (current + 1) % trace.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, stepIndex, trace]);

  const step = trace[prefersReducedMotion ? trace.length - 1 : stepIndex];
  const { array, i, type } = step;

  return (
    <div className="code-preview" aria-hidden="true">
      <div className="flex items-end justify-center gap-2.5 pb-5">
        {array.map((value, index) => {
          const comparing = type !== "done" && (index === i || index === i + 1);
          const settled = type === "done";

          return (
            <div
              className={`grid h-16 w-12 place-items-center rounded-md border-2 font-mono text-lg font-black transition-all duration-300 ${
                comparing
                  ? "-translate-y-2 border-[#f5c15b] bg-[#f5c15b]/15 text-[#ffe7a9]"
                  : settled
                    ? "border-[#32f584]/60 bg-[#32f584]/15 text-[#a8ffd0]"
                    : "border-[#93ffc2]/20 bg-[#effff6]/5 text-[#a8ffd0]"
              }`}
              key={index}
            >
              {value}
            </div>
          );
        })}
      </div>
      <ol className="pseudo-code mb-0">
        <li className={type === "compare" ? "active" : ""}>
          compare neighbours
        </li>
        <li className={type === "swap" ? "active" : ""}>
          if left &gt; right, swap
        </li>
        <li className={type === "done" ? "active done" : ""}>
          keep going until sorted
        </li>
      </ol>
    </div>
  );
}
