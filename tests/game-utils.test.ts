import assert from "node:assert/strict";
import test from "node:test";
import {
  getInsertionIndex,
  getNeighbours,
  getSearchStep,
  getSelectionMinimumIndex,
  INSERTION_CHALLENGES,
  PATHFINDING_GRID,
  SEARCH_CHALLENGES,
  SORTING_CHALLENGES,
} from "../src/utils/algorithms";
import {
  bitValues,
  bitsToDecimal,
  CHALLENGES_PER_LEVEL,
  makeBinaryTarget,
} from "../src/utils/binary";
import { LIST_SIZE, makeList } from "../src/utils/bubbleSort";
import {
  DIVIDEND_CHALLENGES_PER_LEVEL,
  makeDividendChallenge,
  makeDividendOptions,
} from "../src/utils/dividend";
import {
  MODULO_CHALLENGES_PER_LEVEL,
  makeModuloChallenge,
} from "../src/utils/modulo";
import {
  findLink,
  getAvailableNextHops,
  getLinkCost,
  getReassembledPacketCount,
  NETWORK_ROUNDS,
} from "../src/utils/networking";
import { getRainContent } from "../src/data/rainContent";

// Deterministic inputs exercise the real random generators without flaky runs.
function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test("search steps retain linear position and binary lower midpoint", () => {
  assert.equal(getSearchStep({ high: 7, list: [], low: 0, mode: "linear" }), 0);
  assert.equal(getSearchStep({ high: 7, list: [], low: 0, mode: "binary" }), 3);
  assert.equal(getSearchStep({ high: 6, list: [], low: 3, mode: "binary" }), 4);
  assert.equal(getSearchStep({ high: 2, list: [], low: 2, mode: "binary" }), 2);
});

test("selection only scans the unsorted suffix and keeps first tied minimum", () => {
  assert.equal(getSelectionMinimumIndex([1, 9, 3, 3, 7], 1), 2);
  assert.equal(getSelectionMinimumIndex([1, 9, 3, 3, 7], 3), 3);
  assert.equal(getSelectionMinimumIndex([4], 0), 0);
});

test("insertion puts equal values after existing equals including edge slots", () => {
  assert.equal(getInsertionIndex([], 5), 0);
  assert.equal(getInsertionIndex([2, 4, 4, 8], 1), 0);
  assert.equal(getInsertionIndex([2, 4, 4, 8], 4), 3);
  assert.equal(getInsertionIndex([2, 4, 4, 8], 9), 4);
});

test("neighbours retain up/right/down/left order without wrapping at edges", () => {
  assert.deepEqual(getNeighbours(4, 3, 3), [1, 5, 7, 3]);
  assert.deepEqual(getNeighbours(0, 3, 3), [1, 3]);
  assert.deepEqual(getNeighbours(8, 3, 3), [5, 7]);
  assert.deepEqual(getNeighbours(0, 1, 1), []);
  assert.deepEqual(getNeighbours(1, 1, 3), [0, 2]);
});

test("every search challenge can be completed using both original search modes", () => {
  for (const challenge of SEARCH_CHALLENGES) {
    for (const mode of ["linear", "binary"] as const) {
      let low = 0;
      let high = challenge.list.length - 1;
      let found = false;
      for (
        let step = 0;
        step < challenge.list.length && low <= high;
        step += 1
      ) {
        const index = getSearchStep({ ...challenge, low, high, mode });
        const value = challenge.list[index];
        if (value === challenge.target) {
          found = true;
          break;
        }
        if (mode === "linear" || value < challenge.target) low = index + 1;
        else high = index - 1;
      }
      assert.equal(found, true);
    }
  }
});

test("all selection and insertion challenge lists finish in ascending order", () => {
  for (const source of SORTING_CHALLENGES) {
    const result = [...source];
    for (let boundary = 0; boundary < result.length - 1; boundary += 1) {
      const minimum = getSelectionMinimumIndex(result, boundary);
      [result[boundary], result[minimum]] = [result[minimum], result[boundary]];
    }
    assert.deepEqual(
      result,
      [...source].sort((a, b) => a - b),
    );
  }
  for (const source of INSERTION_CHALLENGES) {
    const result: number[] = [];
    for (const value of source)
      result.splice(getInsertionIndex(result, value), 0, value);
    assert.deepEqual(
      result,
      [...source].sort((a, b) => a - b),
    );
  }
});

test("the original breadth-first grid reaches its goal without crossing walls", () => {
  const { columns, rows, start, goal, walls } = PATHFINDING_GRID;
  const queue = [start];
  const visited = new Set<number>();
  while (queue.length) {
    const current = queue.shift()!;
    visited.add(current);
    if (current === goal) break;
    queue.push(
      ...getNeighbours(current, columns, rows).filter(
        (cell) =>
          !walls.has(cell) && !visited.has(cell) && !queue.includes(cell),
      ),
    );
  }
  assert.equal(visited.has(goal), true);
  assert.equal(
    [...visited].some((cell) => walls.has(cell)),
    false,
  );
});

test("binary conversion retains 8-bit place values and empty input behavior", () => {
  assert.deepEqual(bitValues, [128, 64, 32, 16, 8, 4, 2, 1]);
  assert.equal(bitsToDecimal([]), 0);
  assert.equal(bitsToDecimal(Array(8).fill(0)), 0);
  assert.equal(bitsToDecimal(Array(8).fill(1)), 255);
  assert.equal(bitsToDecimal([1, 0, 1, 0, 1, 0, 1, 0]), 170);
});

test("binary targets include zero and the level maximum capped at 255", (t) => {
  const random = t.mock.method(Math, "random", () => 0);
  assert.equal(makeBinaryTarget(1), 0);
  random.mock.mockImplementation(() => 0.999999999);
  assert.equal(makeBinaryTarget(1), 63);
  assert.equal(makeBinaryTarget(2), 95);
  assert.equal(makeBinaryTarget(100), 255);
  assert.equal(CHALLENGES_PER_LEVEL, 8);
});

test("bubble lists contain ten unique integers from 10 through 99", (t) => {
  t.mock.method(Math, "random", seededRandom(42));
  for (let run = 0; run < 100; run += 1) {
    const list = makeList();
    assert.equal(list.length, LIST_SIZE);
    assert.equal(LIST_SIZE, 10);
    assert.equal(new Set(list).size, LIST_SIZE);
    assert.equal(
      list.every(
        (value) => Number.isInteger(value) && value >= 10 && value <= 99,
      ),
      true,
    );
  }
});

test("dividend generation retains minimum and maximum arithmetic bounds", (t) => {
  const random = t.mock.method(Math, "random", () => 0);
  assert.deepEqual(makeDividendChallenge(1), {
    divisor: 2,
    quotient: 1,
    remainder: 0,
    dividend: 2,
  });
  random.mock.mockImplementation(() => 0.999999999);
  assert.deepEqual(makeDividendChallenge(1), {
    divisor: 6,
    quotient: 8,
    remainder: 5,
    dividend: 53,
  });
  assert.equal(makeDividendChallenge(100).divisor, 11);
  assert.equal(DIVIDEND_CHALLENGES_PER_LEVEL, 8);
});

test("dividend options are positive, distinct, sorted, and contain the answer", (t) => {
  t.mock.method(Math, "random", seededRandom(7));
  const challenges = [{ divisor: 2, quotient: 1, remainder: 0, dividend: 2 }];
  for (let level = 1; level <= 12; level += 1)
    challenges.push(makeDividendChallenge(level));
  for (const challenge of challenges) {
    const options = makeDividendOptions(challenge);
    assert.equal(options.length, 6);
    assert.equal(new Set(options).size, 6);
    assert.equal(options.includes(challenge.dividend), true);
    assert.equal(
      options.every((value) => Number.isInteger(value) && value > 0),
      true,
    );
    assert.deepEqual(
      options,
      [...options].sort((a, b) => a - b),
    );
    assert.equal(
      challenge.dividend,
      challenge.divisor * challenge.quotient + challenge.remainder,
    );
  }
});

test("modulo challenges preserve exact multiples and nonzero remainder boundaries", (t) => {
  const random = t.mock.method(Math, "random", () => 0);
  assert.deepEqual(makeModuloChallenge(1), {
    dividend: 2,
    divisor: 2,
    quotient: 1,
    remainder: 0,
    largestMultiple: 2,
  });
  random.mock.mockImplementation(() => 0.999999999);
  assert.deepEqual(makeModuloChallenge(1), {
    dividend: 59,
    divisor: 6,
    quotient: 9,
    remainder: 5,
    largestMultiple: 54,
  });
  assert.equal(makeModuloChallenge(100).divisor, 11);
  assert.equal(MODULO_CHALLENGES_PER_LEVEL, 8);
});

test("link lookup is bidirectional and missing links remain undefined", () => {
  const links = NETWORK_ROUNDS[0].links;
  const link = links[0];
  assert.equal(findLink(links, link.from, link.to), link);
  assert.equal(findLink(links, link.to, link.from), link);
  assert.equal(findLink(links, "source", "server"), undefined);
  assert.equal(findLink([], "source", "r1"), undefined);
});

test("only congested links cost three and all other statuses retain cost one", () => {
  for (const round of NETWORK_ROUNDS) {
    for (const link of round.links)
      assert.equal(getLinkCost(link), link.status === "congested" ? 3 : 1);
  }
});

test("next hops exclude broken links in either direction and unknown nodes", () => {
  const round = NETWORK_ROUNDS[1];
  assert.deepEqual(
    getAvailableNextHops(round, "r1").map(({ nodeId }) => nodeId),
    ["source", "r2"],
  );
  assert.deepEqual(getAvailableNextHops(round, "unknown"), []);
  assert.equal(
    getAvailableNextHops(round, "r4").some(({ nodeId }) => nodeId === "r1"),
    false,
  );
});

test("packet reassembly only counts a contiguous prefix starting from one", () => {
  assert.equal(getReassembledPacketCount([]), 0);
  assert.equal(getReassembledPacketCount([2, 3]), 0);
  assert.equal(getReassembledPacketCount([1, 3]), 1);
  assert.equal(getReassembledPacketCount([3, 1, 1, 2, 5]), 3);
  assert.equal(getReassembledPacketCount([2, 1, 4, 3, 5]), 5);
});

test("each original networking stage has a valid route within its budget", () => {
  assert.deepEqual(
    NETWORK_ROUNDS.map(({ id }) => id),
    ["starter-lan", "broken-core", "reassembly-run"],
  );
  assert.deepEqual(NETWORK_ROUNDS[2].packets, [2, 1, 4, 3, 5]);
  for (const round of NETWORK_ROUNDS) {
    const costs = new Map([["source", 0]]);
    for (let step = 0; step < round.nodes.length; step += 1) {
      for (const node of round.nodes) {
        const cost = costs.get(node.id);
        if (cost === undefined) continue;
        for (const hop of getAvailableNextHops(round, node.id)) {
          const next = cost + getLinkCost(hop.link);
          if (next < (costs.get(hop.nodeId) ?? Infinity))
            costs.set(hop.nodeId, next);
        }
      }
    }
    assert.equal(
      (costs.get("server") ?? Infinity) <= round.latencyBudget,
      true,
    );
  }
});

test("rain content repeats each topic eight times and defaults for unknown views", () => {
  assert.equal(
    getRainContent("bubble"),
    Array(8).fill("COMPARE SWAP KEEP PASS").join(" "),
  );
  assert.equal(
    getRainContent("packet-routing"),
    Array(8).fill("ROUTE HOP PACKET DELIVER").join(" "),
  );
  assert.equal(getRainContent("unknown"), getRainContent("home"));
  assert.equal(getRainContent(""), getRainContent("home"));
});
