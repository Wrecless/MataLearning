import type { DividendChallenge } from "./dividend";

export interface ModuloChallenge extends DividendChallenge {
  largestMultiple: number;
}

export const MODULO_CHALLENGES_PER_LEVEL = 8;

export function makeModuloChallenge(level: number): ModuloChallenge {
  const divisor = Math.floor(Math.random() * Math.min(10, 4 + level)) + 2;
  const quotient = Math.floor(Math.random() * (6 + level * 3)) + 1;
  const remainder = Math.floor(Math.random() * divisor);
  const dividend = quotient * divisor + remainder;

  return {
    dividend,
    divisor,
    quotient,
    remainder,
    largestMultiple: quotient * divisor,
  };
}
