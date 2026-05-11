export const SEARCH_CHALLENGES = [
  { list: [4, 9, 13, 18, 22, 27, 31, 36], target: 27 },
  { list: [3, 8, 12, 17, 25, 29, 34, 40], target: 17 },
  { list: [5, 11, 16, 21, 28, 33, 37, 42], target: 42 },
  { list: [2, 6, 14, 19, 24, 30, 35, 41], target: 14 },
];

export const SORTING_CHALLENGES = [
  [42, 17, 63, 8, 29, 51],
  [31, 12, 45, 26, 9, 38],
  [56, 14, 33, 7, 49, 22],
  [25, 60, 18, 41, 11, 34],
];

export const INSERTION_CHALLENGES = [
  [18, 7, 34, 12, 28, 5, 21],
  [24, 9, 31, 16, 3, 27, 12],
  [15, 42, 8, 23, 37, 4, 19],
  [30, 11, 26, 6, 44, 17, 2],
];

export const PATHFINDING_GRID = {
  columns: 5,
  rows: 5,
  start: 0,
  goal: 24,
  walls: new Set([3, 6, 8, 13, 16, 18, 21]),
};

export function getSearchStep({ high, list, low, mode }) {
  if (mode === 'linear') {
    return low;
  }

  return Math.floor((low + high) / 2);
}

export function getSelectionMinimumIndex(numbers, startIndex) {
  let minimumIndex = startIndex;

  for (let index = startIndex + 1; index < numbers.length; index += 1) {
    if (numbers[index] < numbers[minimumIndex]) {
      minimumIndex = index;
    }
  }

  return minimumIndex;
}

export function getInsertionIndex(sortedValues, value) {
  const index = sortedValues.findIndex((item) => value < item);
  return index === -1 ? sortedValues.length : index;
}

export function getNeighbours(index, columns, rows) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const candidates = [
    row > 0 ? index - columns : null,
    column < columns - 1 ? index + 1 : null,
    row < rows - 1 ? index + columns : null,
    column > 0 ? index - 1 : null,
  ];

  return candidates.filter((candidate) => candidate !== null);
}
