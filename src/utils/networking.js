export const NETWORK_ROUNDS = [
  {
    id: 'starter-lan',
    name: 'Stage 1: Starter LAN',
    description: 'Choose a clean route through a small network.',
    latencyBudget: 5,
    packets: [1, 2, 3],
    nodes: [
      { id: 'source', label: 'Laptop', type: 'source', x: 14, y: 50 },
      { id: 'r1', label: 'R1', type: 'router', x: 34, y: 28 },
      { id: 'r2', label: 'R2', type: 'router', x: 34, y: 72 },
      { id: 'r3', label: 'R3', type: 'router', x: 60, y: 50 },
      { id: 'server', label: 'Server', type: 'server', x: 84, y: 50 },
    ],
    links: [
      { from: 'source', to: 'r1', status: 'clear' },
      { from: 'source', to: 'r2', status: 'clear' },
      { from: 'r1', to: 'r3', status: 'clear' },
      { from: 'r2', to: 'r3', status: 'congested' },
      { from: 'r3', to: 'server', status: 'clear' },
    ],
  },
  {
    id: 'broken-core',
    name: 'Stage 2: Broken Core',
    description: 'More routers, more route choices, and one failed backbone link.',
    latencyBudget: 6,
    packets: [1, 2, 3, 4],
    nodes: [
      { id: 'source', label: 'Tablet', type: 'source', x: 12, y: 50 },
      { id: 'r1', label: 'R1', type: 'router', x: 30, y: 18 },
      { id: 'r2', label: 'R2', type: 'router', x: 31, y: 50 },
      { id: 'r3', label: 'R3', type: 'router', x: 30, y: 82 },
      { id: 'r4', label: 'R4', type: 'router', x: 58, y: 30 },
      { id: 'r5', label: 'R5', type: 'router', x: 60, y: 70 },
      { id: 'server', label: 'Server', type: 'server', x: 86, y: 50 },
    ],
    links: [
      { from: 'source', to: 'r1', status: 'clear' },
      { from: 'source', to: 'r2', status: 'congested' },
      { from: 'source', to: 'r3', status: 'clear' },
      { from: 'r1', to: 'r2', status: 'clear' },
      { from: 'r1', to: 'r4', status: 'broken' },
      { from: 'r2', to: 'r4', status: 'clear' },
      { from: 'r2', to: 'r5', status: 'congested' },
      { from: 'r3', to: 'r5', status: 'clear' },
      { from: 'r4', to: 'r5', status: 'clear' },
      { from: 'r4', to: 'server', status: 'clear' },
      { from: 'r5', to: 'server', status: 'clear' },
    ],
  },
  {
    id: 'reassembly-run',
    name: 'Stage 3: Reassembly Run',
    description: 'A denser network with out-of-order packets to rebuild at the server.',
    latencyBudget: 7,
    packets: [2, 1, 4, 3, 5],
    nodes: [
      { id: 'source', label: 'PC', type: 'source', x: 10, y: 50 },
      { id: 'r1', label: 'R1', type: 'router', x: 26, y: 16 },
      { id: 'r2', label: 'R2', type: 'router', x: 31, y: 48 },
      { id: 'r3', label: 'R3', type: 'router', x: 26, y: 76 },
      { id: 'r4', label: 'R4', type: 'router', x: 48, y: 22 },
      { id: 'r5', label: 'R5', type: 'router', x: 48, y: 52 },
      { id: 'r6', label: 'R6', type: 'router', x: 48, y: 82 },
      { id: 'r7', label: 'R7', type: 'router', x: 70, y: 32 },
      { id: 'r8', label: 'R8', type: 'router', x: 70, y: 68 },
      { id: 'server', label: 'Server', type: 'server', x: 86, y: 50 },
    ],
    links: [
      { from: 'source', to: 'r1', status: 'clear' },
      { from: 'source', to: 'r2', status: 'clear' },
      { from: 'source', to: 'r3', status: 'congested' },
      { from: 'r1', to: 'r4', status: 'clear' },
      { from: 'r1', to: 'r5', status: 'congested' },
      { from: 'r2', to: 'r4', status: 'clear' },
      { from: 'r2', to: 'r5', status: 'clear' },
      { from: 'r2', to: 'r6', status: 'broken' },
      { from: 'r3', to: 'r5', status: 'clear' },
      { from: 'r3', to: 'r6', status: 'clear' },
      { from: 'r4', to: 'r7', status: 'clear' },
      { from: 'r4', to: 'r8', status: 'congested' },
      { from: 'r5', to: 'r7', status: 'clear' },
      { from: 'r5', to: 'r8', status: 'clear' },
      { from: 'r6', to: 'r8', status: 'clear' },
      { from: 'r7', to: 'server', status: 'clear' },
      { from: 'r8', to: 'server', status: 'clear' },
      { from: 'r7', to: 'r8', status: 'broken' },
    ],
  },
];

export function findLink(links, firstNodeId, secondNodeId) {
  return links.find(
    (link) =>
      (link.from === firstNodeId && link.to === secondNodeId) ||
      (link.from === secondNodeId && link.to === firstNodeId),
  );
}

export function getLinkCost(link) {
  return link.status === 'congested' ? 3 : 1;
}

export function getReassembledPacketCount(deliveredPackets) {
  const delivered = new Set(deliveredPackets);
  let expected = 1;

  while (delivered.has(expected)) {
    expected += 1;
  }

  return expected - 1;
}

export function getAvailableNextHops(round, nodeId) {
  return round.links
    .filter((link) => link.status !== 'broken' && (link.from === nodeId || link.to === nodeId))
    .map((link) => ({
      link,
      nodeId: link.from === nodeId ? link.to : link.from,
    }));
}
