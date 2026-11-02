const RAIN_WORDS: Record<string, string[]> = {
  home: [
    "SORT",
    "SEARCH",
    "ROUTE",
    "BINARY",
    "MODULO",
    "DIVIDE",
    "BUILD",
    "LEARN",
  ],
  bubble: ["COMPARE", "SWAP", "KEEP", "PASS"],
  search: ["CHECK", "MIDDLE", "DISCARD", "FOUND"],
  selection: ["SCAN", "SELECT", "SWAP", "LOCK"],
  insertion: ["SHIFT", "INSERT", "COMPARE", "PLACE"],
  pathfinding: ["QUEUE", "VISIT", "EXPAND", "FRONTIER"],
  binary: ["PLACE VALUE", "0", "1", "SUM"],
  modulo: ["DIVIDE", "REMAINDER", "CYCLE", "MOD"],
  dividend: ["DIVISOR", "QUOTIENT", "REMAINDER"],
  "packet-routing": ["ROUTE", "HOP", "PACKET", "DELIVER"],
};

export function getRainContent(viewId: string): string {
  const words = RAIN_WORDS[viewId] ?? RAIN_WORDS.home;
  return Array.from({ length: 8 }, () => words.join(" ")).join(" ");
}
