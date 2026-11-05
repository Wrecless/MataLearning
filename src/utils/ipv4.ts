export function parseIPv4(value: string): readonly number[] | null {
  const parts = value.split(".");
  if (
    parts.length !== 4 ||
    parts.some(
      (part) => !/^(0|[1-9][0-9]{0,2})$/.test(part) || Number(part) > 255,
    )
  )
    return null;
  return parts.map(Number);
}

export function octetToBinary(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError("An octet must be an integer from 0 to 255.");
  }
  return value.toString(2).padStart(8, "0");
}

/** RFC1918 membership only; false does not imply a public address. */
export function isPrivateIPv4(value: string): boolean {
  const octets = parseIPv4(value);
  if (!octets) return false;
  return (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

/** /24 fixes the first 24 bits (three octets) as the network prefix. */
export function sameSubnet24(a: string, b: string): boolean {
  const left = parseIPv4(a);
  const right = parseIPv4(b);
  return (
    left !== null &&
    right !== null &&
    left[0] === right[0] &&
    left[1] === right[1] &&
    left[2] === right[2]
  );
}

export type IPv4Question =
  | {
      readonly kind: "valid" | "private";
      readonly id: string;
      readonly address: string;
      readonly hint: string;
      readonly explanation: string;
    }
  | {
      readonly kind: "binary";
      readonly id: string;
      readonly decimal: number;
      readonly hint: string;
      readonly explanation: string;
    }
  | {
      readonly kind: "subnet";
      readonly id: string;
      readonly a: string;
      readonly b: string;
      readonly hint: string;
      readonly explanation: string;
    };

export type IPv4Answer = string;

/** Private/public questions use ordinary unicast examples, not reserved ranges. */
export function getIPv4Answer(question: IPv4Question): IPv4Answer {
  switch (question.kind) {
    case "valid":
      return parseIPv4(question.address) ? "valid" : "invalid";
    case "binary":
      return octetToBinary(question.decimal);
    case "private":
      return isPrivateIPv4(question.address) ? "private" : "public";
    case "subnet":
      return sameSubnet24(question.a, question.b) ? "same" : "different";
  }
}

export interface IPv4State {
  readonly index: number;
  readonly selected: IPv4Answer | null;
  readonly phase: "answering" | "incorrect" | "correct" | "complete";
  readonly notice: "none" | "empty";
}

export type IPv4Action =
  | { type: "choose"; index: number; answer: IPv4Answer }
  | { type: "check"; index: number }
  | { type: "next"; index: number }
  | { type: "reset" };

export const INITIAL_IPV4_STATE: IPv4State = {
  index: 0,
  selected: null,
  phase: "answering",
  notice: "none",
};

export function ipv4Reducer(state: IPv4State, action: IPv4Action): IPv4State {
  if (action.type === "reset") return INITIAL_IPV4_STATE;
  if (action.index !== state.index) return state;
  if (action.type === "next") {
    return state.phase === "correct"
      ? { ...INITIAL_IPV4_STATE, index: state.index + 1 }
      : state;
  }
  if (state.phase === "correct" || state.phase === "complete") return state;
  if (action.type === "check" && state.phase !== "answering") return state;
  if (action.type === "choose") {
    const question = IPV4_CHALLENGES[state.index];
    const answer = action.answer;
    const allowed =
      typeof answer === "string" &&
      (question.kind === "binary"
        ? /^[01]{8}$/.test(answer)
        : question.kind === "valid"
          ? answer === "valid" || answer === "invalid"
          : question.kind === "private"
            ? answer === "private" || answer === "public"
            : answer === "same" || answer === "different");
    if (!allowed) return state;
    return { ...state, selected: answer, phase: "answering", notice: "none" };
  }
  if (action.type === "check") {
    if (state.selected === null) return { ...state, notice: "empty" };
    return {
      ...state,
      notice: "none",
      phase:
        state.selected === getIPv4Answer(IPV4_CHALLENGES[state.index])
          ? state.index === IPV4_CHALLENGES.length - 1
            ? "complete"
            : "correct"
          : "incorrect",
    };
  }
  return state;
}

export const IPV4_CHALLENGES: readonly IPv4Question[] = [
  {
    kind: "valid",
    id: "valid-four-octets",
    address: "192.168.1.24",
    hint: "Count the octets and check each is between 0 and 255.",
    explanation:
      "192.168.1.24 has four decimal octets, all within 0–255, so its format is valid.",
  },
  {
    kind: "valid",
    id: "invalid-large-octet",
    address: "192.168.1.300",
    hint: "An octet has eight bits. What is its largest value?",
    explanation:
      "300 exceeds 255, so 192.168.1.300 is not a valid IPv4 address.",
  },
  {
    kind: "valid",
    id: "invalid-missing-octet",
    address: "10.0.5",
    hint: "A dotted-decimal IPv4 address needs four octets.",
    explanation: "10.0.5 contains only three octets, so it is missing one.",
  },
  {
    kind: "binary",
    id: "binary-192",
    decimal: 192,
    hint: "Use the places 128, 64, 32, 16, 8, 4, 2, 1.",
    explanation: "192 = 128 + 64, so its eight-bit binary form is 11000000.",
  },
  {
    kind: "binary",
    id: "binary-168",
    decimal: 168,
    hint: "Start with 128, then find the remaining place values.",
    explanation: "168 = 128 + 32 + 8, giving 10101000.",
  },
  {
    kind: "binary",
    id: "binary-10",
    decimal: 10,
    hint: "Keep all eight bits, including leading zeroes.",
    explanation:
      "10 = 8 + 2. Pad the other places with zeroes to get 00001010.",
  },
  {
    kind: "private",
    id: "private-172",
    address: "172.20.5.9",
    hint: "The private 172 range runs from 172.16.0.0 to 172.31.255.255.",
    explanation:
      "172.20.5.9 is inside the RFC1918 private 172.16/12 range. Private addresses are valid, not invalid.",
  },
  {
    kind: "private",
    id: "public-dns",
    address: "8.8.8.8",
    hint: "Private ranges are 10/8, 172.16/12 and 192.168/16.",
    explanation:
      "8.8.8.8 is a public unicast address outside the private ranges. Not every non-private address is public; some ranges are reserved.",
  },
  {
    kind: "subnet",
    id: "subnet-same",
    a: "192.168.10.20",
    b: "192.168.10.200",
    hint: "For /24 (255.255.255.0), compare the first three octets.",
    explanation:
      "Both addresses start with 192.168.10, so they share the same /24 network. Only their host octets differ.",
  },
  {
    kind: "subnet",
    id: "subnet-different",
    a: "192.168.10.20",
    b: "192.168.11.20",
    hint: "The first 24 bits are the first three octets, not the last octet.",
    explanation:
      "The third octets differ (10 and 11), so the /24 network prefixes differ even though both host octets are 20.",
  },
];
