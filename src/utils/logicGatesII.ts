import {
  evaluateCircuit,
  type Bit,
  type Circuit,
  type Gate,
} from "./logicGates";

export type IIAnswer = Gate | Bit;
export interface IIState {
  readonly index: number;
  readonly selected: IIAnswer | null;
  readonly phase: "answering" | "incorrect" | "correct" | "complete";
  readonly notice: "none" | "empty";
}
export type IIAction =
  | { type: "choose"; index: number; answer: IIAnswer }
  | { type: "check"; index: number }
  | { type: "next"; index: number }
  | { type: "reset" };
export const INITIAL_II_STATE: IIState = {
  index: 0,
  selected: null,
  phase: "answering",
  notice: "none",
};
export function iiReducer(state: IIState, action: IIAction): IIState {
  if (action.type === "reset") return INITIAL_II_STATE;
  if (action.index !== state.index) return state;
  if (action.type === "next")
    return state.phase === "correct"
      ? { ...INITIAL_II_STATE, index: state.index + 1 }
      : state;
  if (state.phase === "correct" || state.phase === "complete") return state;
  const question = II_CHALLENGES[state.index];
  if (action.type === "choose") {
    if (
      question.kind === "symbol"
        ? typeof action.answer !== "string"
        : typeof action.answer !== "number"
    )
      return state;
    return {
      ...state,
      selected: action.answer,
      phase: "answering",
      notice: "none",
    };
  }
  if (state.selected === null) return { ...state, notice: "empty" };
  const correct =
    state.selected ===
    (question.kind === "symbol"
      ? question.gate
      : evaluateCircuit(question.circuit));
  return {
    ...state,
    notice: "none",
    phase: correct
      ? state.index === II_CHALLENGES.length - 1
        ? "complete"
        : "correct"
      : "incorrect",
  };
}

export type IIQuestion =
  | { readonly kind: "symbol"; readonly id: string; readonly gate: Gate }
  | {
      readonly kind: "circuit";
      readonly id: string;
      readonly title: string;
      readonly circuit: Circuit;
    };

export const II_GATES = [
  "AND",
  "OR",
  "NOT",
  "XOR",
  "NAND",
  "NOR",
  "XNOR",
] as const satisfies readonly Gate[];

export const II_CHALLENGES: readonly IIQuestion[] = [
  ...II_GATES.map(
    (gate): IIQuestion => ({
      kind: "symbol",
      id: `symbol-${gate.toLowerCase()}`,
      gate,
    }),
  ),
  {
    kind: "circuit",
    id: "xor-not",
    title: "XOR then NOT",
    circuit: { gate: "NOT", a: { gate: "XOR", a: 1, b: 1 } },
  },
  {
    kind: "circuit",
    id: "nand-or",
    title: "NAND then OR",
    circuit: { gate: "OR", a: { gate: "NAND", a: 1, b: 1 }, b: 0 },
  },
  {
    kind: "circuit",
    id: "xnor-and",
    title: "XNOR then AND",
    circuit: { gate: "AND", a: { gate: "XNOR", a: 1, b: 0 }, b: 1 },
  },
];
