export const DIVIDEND_CHALLENGES_PER_LEVEL = 8;

export function makeDividendChallenge(level) {
  const divisor = Math.floor(Math.random() * Math.min(10, 4 + level)) + 2;
  const quotient = Math.floor(Math.random() * (5 + level * 3)) + 1;
  const remainder = Math.floor(Math.random() * divisor);
  const dividend = divisor * quotient + remainder;

  return {
    divisor,
    quotient,
    remainder,
    dividend,
  };
}

export function makeDividendOptions(challenge) {
  const correct = challenge.dividend;
  const offsets = [
    -challenge.divisor,
    -Math.max(1, challenge.remainder + 1),
    Math.max(1, challenge.divisor - challenge.remainder),
    challenge.divisor,
    challenge.divisor + 1,
  ];

  const options = new Set([correct]);

  offsets.forEach((offset) => {
    const candidate = correct + offset;
    if (candidate > 0) {
      options.add(candidate);
    }
  });

  while (options.size < 6) {
    options.add(Math.max(1, correct + Math.floor(Math.random() * 15) - 7));
  }

  return Array.from(options).sort((a, b) => a - b);
}
