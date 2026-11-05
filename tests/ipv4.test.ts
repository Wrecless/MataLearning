import test from "node:test";
import assert from "node:assert/strict";
import * as ipv4 from "../src/utils/ipv4";
import { parseIPv4 } from "../src/utils/ipv4";

test("parseIPv4 reads four canonical decimal octets including boundaries", () => {
  assert.deepEqual(parseIPv4("192.168.1.24"), [192, 168, 1, 24]);
  assert.deepEqual(parseIPv4("0.10.255.1"), [0, 10, 255, 1]);
});

test("parseIPv4 rejects non-canonical or out-of-range dotted decimals", () => {
  for (const address of [
    "",
    "10.0.5",
    "1.2.3.4.5",
    "1..3.4",
    "192.168.1.300",
    "256.0.0.0",
    "1.256.0.0",
    "1.2.256.0",
    "1.2.3.256",
    "01.2.3.4",
    "1.02.3.4",
    "1.2.03.4",
    "1.2.3.00",
    "+1.2.3.4",
    "1.2.3.-1",
    "1e2.2.3.4",
    "0x10.2.3.4",
    "NaN.2.3.4",
    " 1.2.3.4",
    "1.2.3.4 ",
    "1.2. 3.4",
    "1.2.3.4\n",
    "1.2.3.4\r\n",
    "１.2.3.4",
    "1,2,3,4",
    "1.2.3.Infinity",
  ])
    assert.equal(parseIPv4(address), null, JSON.stringify(address));
});

test("octetToBinary produces exactly eight bits with leading zeroes", () => {
  for (const [decimal, expected] of [
    [0, "00000000"],
    [1, "00000001"],
    [10, "00001010"],
    [128, "10000000"],
    [168, "10101000"],
    [192, "11000000"],
    [255, "11111111"],
  ] as const)
    assert.equal(ipv4.octetToBinary(decimal), expected);
});

test("octetToBinary throws RangeError for values that are not octets", () => {
  for (const value of [-1, 256, 1.5, NaN, Infinity, -Infinity]) {
    assert.throws(() => ipv4.octetToBinary(value), RangeError, String(value));
  }
});

test("isPrivateIPv4 recognises only RFC1918 ranges at their boundaries", () => {
  for (const address of [
    "10.0.0.0",
    "10.255.255.255",
    "172.16.0.0",
    "172.20.5.9",
    "172.31.255.255",
    "192.168.0.0",
    "192.168.255.255",
  ])
    assert.equal(ipv4.isPrivateIPv4(address), true, address);
  // Non-private does not necessarily mean public: reserved addresses stay false.
  for (const address of [
    "9.255.255.255",
    "11.0.0.0",
    "172.15.255.255",
    "172.32.0.0",
    "192.167.255.255",
    "192.169.0.0",
    "8.8.8.8",
    "127.0.0.1",
    "169.254.1.1",
    "0.0.0.0",
    "224.0.0.1",
    "255.255.255.255",
    "10.0.0.256",
    "010.0.0.1",
    "172.16.0",
    "192.168.1.1 ",
    "",
  ])
    assert.equal(ipv4.isPrivateIPv4(address), false, address);
});

test("sameSubnet24 compares the first three octets using mask 255.255.255.0", () => {
  assert.equal(ipv4.sameSubnet24("192.168.10.20", "192.168.10.200"), true);
  assert.equal(ipv4.sameSubnet24("192.168.10.20", "192.168.11.20"), false);
  assert.equal(ipv4.sameSubnet24("192.168.10.20", "192.169.10.20"), false);
  assert.equal(ipv4.sameSubnet24("192.168.10.20", "193.168.10.20"), false);
  assert.equal(ipv4.sameSubnet24("10.0.0.0", "10.0.0.255"), true);
  for (const invalid of [
    "",
    "10.0.0",
    "10.0.0.256",
    "010.0.0.1",
    "10.0.0.1 ",
  ]) {
    assert.equal(ipv4.sameSubnet24(invalid, "10.0.0.1"), false);
    assert.equal(ipv4.sameSubnet24("10.0.0.1", invalid), false);
    assert.equal(ipv4.sameSubnet24(invalid, invalid), false);
  }
});

test("IPV4_CHALLENGES has the deterministic ten-step teaching sequence", () => {
  assert.deepEqual(
    ipv4.IPV4_CHALLENGES.map((question) => {
      switch (question.kind) {
        case "valid":
        case "private":
          return [question.kind, question.address];
        case "binary":
          return [question.kind, question.decimal];
        case "subnet":
          return [question.kind, question.a, question.b];
      }
    }),
    [
      ["valid", "192.168.1.24"],
      ["valid", "192.168.1.300"],
      ["valid", "10.0.5"],
      ["binary", 192],
      ["binary", 168],
      ["binary", 10],
      ["private", "172.20.5.9"],
      ["private", "8.8.8.8"],
      ["subnet", "192.168.10.20", "192.168.10.200"],
      ["subnet", "192.168.10.20", "192.168.11.20"],
    ],
  );
  assert.equal(new Set(ipv4.IPV4_CHALLENGES.map((q) => q.id)).size, 10);
  for (const question of ipv4.IPV4_CHALLENGES) {
    assert.ok(question.id.trim());
    assert.ok(question.hint.trim());
    assert.ok(question.explanation.trim());
  }
});

test("getIPv4Answer returns literal answers for every challenge kind", () => {
  assert.deepEqual(ipv4.IPV4_CHALLENGES.map(ipv4.getIPv4Answer), [
    "valid",
    "invalid",
    "invalid",
    "11000000",
    "10101000",
    "00001010",
    "private",
    "public",
    "same",
    "different",
  ]);
});

test("ipv4Reducer permits a wrong answer to be corrected without advancing", () => {
  let state = ipv4.ipv4Reducer(ipv4.INITIAL_IPV4_STATE, {
    type: "check",
    index: 0,
  });
  state = ipv4.ipv4Reducer(state, {
    type: "choose",
    index: 0,
    answer: "invalid",
  });
  assert.deepEqual(state, {
    index: 0,
    selected: "invalid",
    phase: "answering",
    notice: "none",
  });
  state = ipv4.ipv4Reducer(state, { type: "check", index: 0 });
  assert.deepEqual(state, {
    index: 0,
    selected: "invalid",
    phase: "incorrect",
    notice: "none",
  });
  state = ipv4.ipv4Reducer(state, {
    type: "choose",
    index: 0,
    answer: "valid",
  });
  assert.deepEqual(state, {
    index: 0,
    selected: "valid",
    phase: "answering",
    notice: "none",
  });
  state = ipv4.ipv4Reducer(state, { type: "check", index: 0 });
  assert.deepEqual(state, {
    index: 0,
    selected: "valid",
    phase: "correct",
    notice: "none",
  });
});

test("ipv4Reducer ignores duplicate checks and choices after a checked result", () => {
  const wrong = ipv4.ipv4Reducer(
    ipv4.ipv4Reducer(ipv4.INITIAL_IPV4_STATE, {
      type: "choose",
      index: 0,
      answer: "invalid",
    }),
    { type: "check", index: 0 },
  );
  assert.equal(ipv4.ipv4Reducer(wrong, { type: "check", index: 0 }), wrong);
  const correct = ipv4.ipv4Reducer(
    ipv4.ipv4Reducer(wrong, { type: "choose", index: 0, answer: "valid" }),
    { type: "check", index: 0 },
  );
  assert.equal(ipv4.ipv4Reducer(correct, { type: "check", index: 0 }), correct);
  assert.equal(
    ipv4.ipv4Reducer(correct, { type: "choose", index: 0, answer: "invalid" }),
    correct,
  );
});

test("ipv4Reducer advances only a correct answer and rejects stale actions", () => {
  const initial = ipv4.INITIAL_IPV4_STATE;
  assert.equal(ipv4.ipv4Reducer(initial, { type: "next", index: 0 }), initial);
  for (const index of [-1, 1, 10, NaN]) {
    assert.equal(
      ipv4.ipv4Reducer(initial, { type: "choose", index, answer: "valid" }),
      initial,
    );
    assert.equal(ipv4.ipv4Reducer(initial, { type: "check", index }), initial);
    assert.equal(ipv4.ipv4Reducer(initial, { type: "next", index }), initial);
  }
  const wrong = ipv4.ipv4Reducer(
    ipv4.ipv4Reducer(initial, { type: "choose", index: 0, answer: "invalid" }),
    { type: "check", index: 0 },
  );
  assert.equal(ipv4.ipv4Reducer(wrong, { type: "next", index: 0 }), wrong);
  const chosen = ipv4.ipv4Reducer(wrong, {
    type: "choose",
    index: 0,
    answer: "valid",
  });
  assert.equal(ipv4.ipv4Reducer(chosen, { type: "next", index: 0 }), chosen);
  const correct = ipv4.ipv4Reducer(chosen, { type: "check", index: 0 });
  const next = ipv4.ipv4Reducer(correct, { type: "next", index: 0 });
  assert.deepEqual(next, {
    index: 1,
    selected: null,
    phase: "answering",
    notice: "none",
  });
  assert.equal(ipv4.ipv4Reducer(next, { type: "next", index: 0 }), next);
  assert.equal(ipv4.ipv4Reducer(next, { type: "check", index: 0 }), next);
  assert.equal(
    ipv4.ipv4Reducer(next, { type: "choose", index: 0, answer: "valid" }),
    next,
  );
});

test("ipv4Reducer accepts only answer tokens belonging to the current kind", () => {
  const cases = [
    {
      index: 0,
      allowed: ["valid", "invalid"],
      rejected: [
        "private",
        "public",
        "same",
        "different",
        "00000000",
        "VALID",
        " valid",
      ],
    },
    {
      index: 3,
      allowed: ["11000000", "00000000", "11111111"],
      rejected: [
        "192",
        "1100000",
        "110000000",
        "11000002",
        "11000000\n",
        " 11000000",
        "valid",
      ],
    },
    {
      index: 6,
      allowed: ["private", "public"],
      rejected: ["valid", "invalid", "same", "different", "PRIVATE"],
    },
    {
      index: 8,
      allowed: ["same", "different"],
      rejected: ["valid", "private", "public", "SAME"],
    },
  ];
  for (const { index, allowed, rejected } of cases) {
    const state: ipv4.IPv4State = {
      ...ipv4.INITIAL_IPV4_STATE,
      index,
      notice: "empty",
    };
    for (const answer of [...rejected, "", " ", null, 1, undefined]) {
      assert.equal(
        ipv4.ipv4Reducer(state, {
          type: "choose",
          index,
          answer: answer as string,
        }),
        state,
        `${index}: ${JSON.stringify(answer)}`,
      );
    }
    for (const answer of allowed) {
      assert.deepEqual(
        ipv4.ipv4Reducer(state, { type: "choose", index, answer }),
        {
          index,
          selected: answer,
          phase: "answering",
          notice: "none",
        },
      );
    }
  }
});

test("ipv4Reducer completes only on the tenth correct check in the full sequence", () => {
  const answers = [
    "valid",
    "invalid",
    "invalid",
    "11000000",
    "10101000",
    "00001010",
    "private",
    "public",
    "same",
    "different",
  ];
  const wrongAnswers = [
    "invalid",
    "valid",
    "valid",
    "00000000",
    "00000000",
    "11111111",
    "public",
    "private",
    "different",
    "same",
  ];
  let state = ipv4.INITIAL_IPV4_STATE;
  for (let index = 0; index < answers.length; index += 1) {
    assert.deepEqual(state, {
      index,
      selected: null,
      phase: "answering",
      notice: "none",
    });
    state = ipv4.ipv4Reducer(state, { type: "check", index });
    assert.equal(state.notice, "empty");
    state = ipv4.ipv4Reducer(state, {
      type: "choose",
      index,
      answer: wrongAnswers[index],
    });
    state = ipv4.ipv4Reducer(state, { type: "check", index });
    assert.deepEqual(state, {
      index,
      selected: wrongAnswers[index],
      phase: "incorrect",
      notice: "none",
    });
    assert.equal(ipv4.ipv4Reducer(state, { type: "next", index }), state);
    assert.equal(ipv4.ipv4Reducer(state, { type: "check", index }), state);
    state = ipv4.ipv4Reducer(state, {
      type: "choose",
      index,
      answer: answers[index],
    });
    assert.equal(state.phase, "answering");
    state = ipv4.ipv4Reducer(state, { type: "check", index });
    assert.deepEqual(state, {
      index,
      selected: answers[index],
      phase: index === 9 ? "complete" : "correct",
      notice: "none",
    });
    assert.equal(ipv4.ipv4Reducer(state, { type: "check", index }), state);
    assert.equal(
      ipv4.ipv4Reducer(state, {
        type: "choose",
        index,
        answer: wrongAnswers[index],
      }),
      state,
    );
    if (index < 9) {
      state = ipv4.ipv4Reducer(state, { type: "next", index });
      assert.equal(ipv4.ipv4Reducer(state, { type: "next", index }), state);
    }
  }
  assert.equal(ipv4.ipv4Reducer(state, { type: "next", index: 9 }), state);
});

test("ipv4Reducer replay clears all session state from every phase", () => {
  for (const phase of [
    "answering",
    "incorrect",
    "correct",
    "complete",
  ] as const) {
    const before: ipv4.IPv4State = {
      index: 9,
      selected: "different",
      phase,
      notice: "empty",
    };
    const replay = ipv4.ipv4Reducer(before, { type: "reset" });
    assert.deepEqual(replay, {
      index: 0,
      selected: null,
      phase: "answering",
      notice: "none",
    });
    assert.equal(ipv4.ipv4Reducer(replay, { type: "check", index: 9 }), replay);
    assert.equal(ipv4.ipv4Reducer(replay, { type: "next", index: 9 }), replay);
    assert.equal(
      ipv4.ipv4Reducer(replay, {
        type: "choose",
        index: 9,
        answer: "different",
      }),
      replay,
    );
    assert.deepEqual(
      ipv4.ipv4Reducer(replay, { type: "choose", index: 0, answer: "valid" }),
      {
        index: 0,
        selected: "valid",
        phase: "answering",
        notice: "none",
      },
    );
    assert.deepEqual(before, {
      index: 9,
      selected: "different",
      phase,
      notice: "empty",
    });
  }
});

test("ipv4Reducer starts unanswered and reports an empty check without advancing", () => {
  assert.deepEqual(ipv4.INITIAL_IPV4_STATE, {
    index: 0,
    selected: null,
    phase: "answering",
    notice: "none",
  });
  const state = ipv4.ipv4Reducer(ipv4.INITIAL_IPV4_STATE, {
    type: "check",
    index: 0,
  });
  assert.deepEqual(state, {
    index: 0,
    selected: null,
    phase: "answering",
    notice: "empty",
  });
  assert.deepEqual(ipv4.INITIAL_IPV4_STATE, {
    index: 0,
    selected: null,
    phase: "answering",
    notice: "none",
  });
});
