export const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
export const CHALLENGES_PER_LEVEL = 8;

export function makeBinaryTarget(level) {
  const max = Math.min(255, 31 + level * 32);
  return Math.floor(Math.random() * (max + 1));
}

export function bitsToDecimal(bits) {
  return bits.reduce((total, bit, index) => total + bit * bitValues[index], 0);
}
