export type Bit = 0 | 1;
export type Gate = "AND" | "OR" | "NOT" | "XOR" | "NAND" | "NOR" | "XNOR";
export type Circuit =
  | { readonly gate: "NOT"; readonly a: number | Circuit }
  | {
      readonly gate: Exclude<Gate, "NOT">;
      readonly a: number | Circuit;
      readonly b: number | Circuit;
    };

export interface LogicChallenge {
  readonly id: string;
  readonly title: string;
  readonly circuit: Circuit;
}

export const LOGIC_CHALLENGES: readonly LogicChallenge[] = [
  { id: "and", title: "AND gate", circuit: { gate: "AND", a: 1, b: 0 } },
  { id: "or", title: "OR gate", circuit: { gate: "OR", a: 0, b: 1 } },
  { id: "not", title: "NOT gate", circuit: { gate: "NOT", a: 0 } },
  { id: "xor", title: "XOR gate", circuit: { gate: "XOR", a: 1, b: 0 } },
  { id: "nand", title: "NAND gate", circuit: { gate: "NAND", a: 0, b: 1 } },
  { id: "nor", title: "NOR gate", circuit: { gate: "NOR", a: 1, b: 0 } },
  { id: "xnor", title: "XNOR gate", circuit: { gate: "XNOR", a: 1, b: 1 } },
  {
    id: "xor-equal",
    title: "XOR with matching inputs",
    circuit: { gate: "XOR", a: 1, b: 1 },
  },
  {
    id: "and-not",
    title: "AND then NOT",
    circuit: { gate: "NOT", a: { gate: "AND", a: 1, b: 1 } },
  },
  {
    id: "or-and",
    title: "OR then AND",
    circuit: { gate: "AND", a: { gate: "OR", a: 0, b: 1 }, b: 1 },
  },
];

export interface LogicGameState {
  readonly index: number;
  readonly selected: Bit | null;
  readonly phase: "answering" | "incorrect" | "correct" | "complete";
  readonly notice: "none" | "empty";
}

export const INITIAL_LOGIC_STATE: LogicGameState = {
  index: 0,
  selected: null,
  phase: "answering",
  notice: "none",
};

export type LogicGameAction =
  | { type: "choose"; index: number; bit: Bit }
  | { type: "check"; index: number }
  | { type: "next"; index: number }
  | { type: "reset" };

export function logicGameReducer(
  state: LogicGameState,
  action: LogicGameAction,
): LogicGameState {
  if (action.type === "reset") return INITIAL_LOGIC_STATE;
  if (action.index !== state.index) return state;
  if (action.type === "next") {
    return state.phase === "correct"
      ? { ...INITIAL_LOGIC_STATE, index: state.index + 1 }
      : state;
  }
  if (state.phase === "correct" || state.phase === "complete") return state;
  if (action.type === "choose")
    return {
      ...state,
      selected: action.bit,
      phase: "answering",
      notice: "none",
    };
  if (state.selected === null) return { ...state, notice: "empty" };
  const correct =
    state.selected === evaluateCircuit(LOGIC_CHALLENGES[state.index].circuit);
  return {
    ...state,
    phase: correct
      ? state.index === LOGIC_CHALLENGES.length - 1
        ? "complete"
        : "correct"
      : "incorrect",
    notice: "none",
  };
}

export function evaluateCircuit(circuit: Circuit): Bit {
  const a =
    typeof circuit.a === "number" ? circuit.a : evaluateCircuit(circuit.a);
  if (circuit.gate === "NOT") return evaluateGate("NOT", a);
  const b =
    typeof circuit.b === "number" ? circuit.b : evaluateCircuit(circuit.b);
  return evaluateGate(circuit.gate, a, b);
}

export interface TruthTableRow {
  readonly a: Bit;
  readonly b?: Bit;
  readonly output: Bit;
}

export function getTruthTable(gate: Gate): readonly TruthTableRow[] {
  const bits = [0, 1] as const;
  if (gate === "NOT")
    return bits.map((a) => ({ a, output: evaluateGate(gate, a) }));
  return bits.flatMap((a) =>
    bits.map((b) => ({ a, b, output: evaluateGate(gate, a, b) })),
  );
}

export function explainCircuit(circuit: Circuit): string[] {
  const steps = typeof circuit.a === "number" ? [] : explainCircuit(circuit.a);
  const a =
    typeof circuit.a === "number" ? circuit.a : evaluateCircuit(circuit.a);
  if (circuit.gate === "NOT")
    return [...steps, `NOT(${a}) = ${evaluateCircuit(circuit)}`];
  if (typeof circuit.b !== "number") steps.push(...explainCircuit(circuit.b));
  const b =
    typeof circuit.b === "number" ? circuit.b : evaluateCircuit(circuit.b);
  return [
    ...steps,
    `${circuit.gate}(${a}, ${b}) = ${evaluateCircuit(circuit)}`,
  ];
}

export function evaluateGate(gate: Gate, a: number, b?: number): Bit {
  if ((a !== 0 && a !== 1) || (gate !== "NOT" && b !== 0 && b !== 1)) {
    throw new Error("Gate inputs must be binary: 0 or 1.");
  }
  if (gate === "AND") return a === 1 && b === 1 ? 1 : 0;
  if (gate === "OR") return a === 1 || b === 1 ? 1 : 0;
  if (gate === "NOT") return a === 0 ? 1 : 0;
  if (gate === "XOR") return a !== b ? 1 : 0;
  if (gate === "NAND") return a === 1 && b === 1 ? 0 : 1;
  if (gate === "NOR") return a === 0 && b === 0 ? 1 : 0;
  if (gate === "XNOR") return a === b ? 1 : 0;
  throw new Error(`Unsupported gate: ${gate}`);
}
