import { Check, Lightbulb, Monitor, Network, RefreshCw, RotateCcw, Send, Server, WifiOff, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  findLink,
  getAvailableNextHops,
  getLinkCost,
  getReassembledPacketCount,
  NETWORK_ROUNDS,
} from '../utils/networking.js';
import GlossaryPanel from './GlossaryPanel.jsx';
import PageHeading from './PageHeading.jsx';
import { markGameComplete } from '../utils/progress.js';

const GLOSSARY_TERMS = [
  { term: 'Latency', definition: 'The total delay cost added up along a route. Lower is faster.' },
  { term: 'Congested link', definition: 'A slower connection that costs more latency to cross than a clear one.' },
  { term: 'Broken link', definition: 'A connection that cannot be used at all - pick a different route.' },
  { term: 'Hop', definition: 'Moving from one device or router to another one it is directly connected to.' },
];

const LINK_STYLES = {
  clear: 'stroke-[#32f584]/65',
  congested: 'stroke-[#f5c15b]/85',
  broken: 'stroke-[#ff8278]/70',
};

function getShortenedLine(from, to) {
  const nodeGap = 6;
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) {
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }

  const unitX = deltaX / distance;
  const unitY = deltaY / distance;

  return {
    x1: from.x + unitX * nodeGap,
    y1: from.y + unitY * nodeGap,
    x2: to.x - unitX * nodeGap,
    y2: to.y - unitY * nodeGap,
  };
}

export default function PacketRoutingRaceGame() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [packetIndex, setPacketIndex] = useState(0);
  const [currentNodeId, setCurrentNodeId] = useState('source');
  const [path, setPath] = useState(['source']);
  const [latency, setLatency] = useState(0);
  const [deliveredPackets, setDeliveredPackets] = useState([]);
  const [droppedPackets, setDroppedPackets] = useState(0);
  const [message, setMessage] = useState('Click a connected router to start routing packet 1.');
  const [tone, setTone] = useState('neutral');

  const round = NETWORK_ROUNDS[roundIndex];
  const currentPacket = round.packets[packetIndex];
  const complete = deliveredPackets.length === round.packets.length;
  const reassembledCount = getReassembledPacketCount(deliveredPackets);

  useEffect(() => {
    if (!complete || roundIndex >= NETWORK_ROUNDS.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      resetRound(roundIndex + 1);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [complete, roundIndex]);

  useEffect(() => {
    if (complete && roundIndex >= NETWORK_ROUNDS.length - 1) {
      markGameComplete('packet-routing');
    }
  }, [complete, roundIndex]);

  function startPacket(nextPacketIndex = packetIndex, nextMessage = null) {
    setPacketIndex(nextPacketIndex);
    setCurrentNodeId('source');
    setPath(['source']);
    setLatency(0);
    setMessage(nextMessage || `Packet ${round.packets[nextPacketIndex]} is ready. Choose the next hop.`);
  }

  function resetRound(nextRoundIndex = roundIndex) {
    const nextRound = NETWORK_ROUNDS[nextRoundIndex];
    setRoundIndex(nextRoundIndex);
    setPacketIndex(0);
    setCurrentNodeId('source');
    setPath(['source']);
    setLatency(0);
    setDeliveredPackets([]);
    setDroppedPackets(0);
    setTone('neutral');
    setMessage(`Stage ${nextRoundIndex + 1}: route packet ${nextRound.packets[0]} from source to server.`);
  }

  function nextRound() {
    resetRound((roundIndex + 1) % NETWORK_ROUNDS.length);
  }

  function retryPacket(reason) {
    setDroppedPackets((current) => current + 1);
    setTone('error');
    startPacket(packetIndex, `${reason} Packet ${currentPacket} has been reset at the source.`);
  }

  function deliverPacket(nextLatency) {
    const nextDeliveredPackets = [...deliveredPackets, currentPacket];
    const nextPacketIndex = packetIndex + 1;
    const nextReassembledCount = getReassembledPacketCount(nextDeliveredPackets);
    setDeliveredPackets(nextDeliveredPackets);
    setTone('success');

    if (nextDeliveredPackets.length === round.packets.length) {
      const isFinalStage = roundIndex >= NETWORK_ROUNDS.length - 1;
      setCurrentNodeId('server');
      setLatency(nextLatency);
      setMessage(
        isFinalStage
          ? `All stages complete. The server reassembled ${nextReassembledCount} packets in order.`
          : `Stage ${roundIndex + 1} complete. Moving to stage ${roundIndex + 2}.`,
      );
      return;
    }

    startPacket(
      nextPacketIndex,
      `Packet ${currentPacket} delivered. Reassembled in order: ${nextReassembledCount}. Route packet ${round.packets[nextPacketIndex]} next.`,
    );
  }

  function handleNodeClick(nodeId) {
    if (complete || nodeId === currentNodeId) {
      return;
    }

    const link = findLink(round.links, currentNodeId, nodeId);

    if (!link) {
      setTone('error');
      setMessage('Those devices are not directly connected. Pick a linked next hop.');
      return;
    }

    if (link.status === 'broken') {
      setTone('error');
      setMessage('That link is broken. Choose a different route.');
      return;
    }

    const nextLatency = latency + getLinkCost(link);

    if (nextLatency > round.latencyBudget) {
      retryPacket(`Latency reached ${nextLatency}, above the round budget of ${round.latencyBudget}.`);
      return;
    }

    setPath((current) => [...current, nodeId]);
    setCurrentNodeId(nodeId);
    setLatency(nextLatency);

    if (nodeId === 'server') {
      deliverPacket(nextLatency);
      return;
    }

    setTone(link.status === 'congested' ? 'hint' : 'success');
    setMessage(
      link.status === 'congested'
        ? `Packet ${currentPacket} moved through congestion. Latency is now ${nextLatency}.`
        : `Packet ${currentPacket} reached ${nodeId.toUpperCase()}. Choose the next hop.`,
    );
  }

  function showHint() {
    if (complete) {
      setTone('success');
      setMessage('Stage complete. Move to the next stage for more complexity.');
      return;
    }

    const cleanHop = getAvailableNextHops(round, currentNodeId).find(
      ({ link, nodeId }) => link.status === 'clear' && !path.includes(nodeId),
    );
    const fallbackHop = getAvailableNextHops(round, currentNodeId).find(({ nodeId }) => !path.includes(nodeId));
    const hintHop = cleanHop || fallbackHop;

    setTone('hint');
    setMessage(
      hintHop
        ? `Hint: ${hintHop.nodeId.toUpperCase()} is a valid next hop from ${currentNodeId.toUpperCase()}.`
        : 'Hint: this route has looped back on itself. Reset the packet and choose a cleaner path.',
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="Packet routing race game">
      <PageHeading
        label="game://networking/packet-routing"
        title="Packet Routing Race"
        description="Route packets from a source device to a destination server while avoiding broken and congested links."
        actions={
          <>
            <button type="button" className="icon-button" onClick={nextRound}>
              <RefreshCw size={18} />
              <span>Next Stage</span>
            </button>
            <button type="button" className="icon-button" onClick={showHint}>
              <Lightbulb size={18} />
              <span>Hint</span>
            </button>
            <button type="button" className="icon-button" onClick={() => resetRound()}>
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel grid gap-5 p-5 lg:p-8">
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <StatusMessage tone={tone}>{message}</StatusMessage>
            <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-4">
              <span className="ui-label">Current stage</span>
              <strong className="block text-xl font-black text-[#f1fff6]">{round.name}</strong>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#a6c6b3]">{round.description}</p>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden rounded-lg border border-[#93ffc2]/20 bg-black/30 p-3 md:min-h-[500px]">
            <svg
              className="absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {round.links.map((link) => {
                const from = round.nodes.find((node) => node.id === link.from);
                const to = round.nodes.find((node) => node.id === link.to);
                const line = getShortenedLine(from, to);
                const selected = path.some((nodeId, index) => {
                  const nextNodeId = path[index + 1];
                  return (
                    nextNodeId &&
                    ((nodeId === link.from && nextNodeId === link.to) ||
                      (nodeId === link.to && nextNodeId === link.from))
                  );
                });

                return (
                  <line
                    className={`${LINK_STYLES[link.status]} ${selected ? 'stroke-[1.08]' : 'stroke-[0.68]'}`}
                    key={`${link.from}-${link.to}`}
                    strokeDasharray={link.status === 'broken' ? '2 2' : link.status === 'congested' ? '1 1.8' : '0'}
                    strokeLinecap="round"
                    x1={line.x1}
                    x2={line.x2}
                    y1={line.y1}
                    y2={line.y2}
                  />
                );
              })}
            </svg>

            {round.nodes.map((node) => (
              <NetworkNode
                active={node.id === currentNodeId}
                delivered={node.id === 'server' && complete}
                key={node.id}
                node={node}
                onClick={() => handleNodeClick(node.id)}
                visited={path.includes(node.id)}
              />
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <LegendItem icon={Network} label="Clear link" value="Cost 1" tone="clear" />
            <LegendItem icon={Zap} label="Congested link" value="Cost 3" tone="congested" />
            <LegendItem icon={WifiOff} label="Broken link" value="Blocked" tone="broken" />
          </div>
        </div>

        <aside className="panel p-6" aria-label="Packet console">
          <h2 className="flex items-center gap-2 text-xl font-black text-[#a8ffd0]">
            <Send size={20} />
            Packet Console
          </h2>

          <div className="mt-5 grid gap-3">
            <Metric label="Stage" value={`${roundIndex + 1}/${NETWORK_ROUNDS.length}`} />
            <Metric label="Packet" value={complete ? 'done' : `${packetIndex + 1}/${round.packets.length}`} />
            <Metric label="Sequence" value={complete ? 'complete' : currentPacket} />
            <Metric label="Latency" value={`${latency}/${round.latencyBudget}`} />
            <Metric label="Delivered" value={`${deliveredPackets.length}/${round.packets.length}`} />
            <Metric label="Reassembled" value={`${reassembledCount}/${round.packets.length}`} />
            <Metric label="Dropped" value={droppedPackets} />
          </div>

          <div className="mt-5 rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-4">
            <span className="ui-label">Server buffer</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...round.packets]
                .sort((first, second) => first - second)
                .map((packet) => (
                  <span
                    className={`grid size-10 place-items-center rounded-lg border font-mono text-sm font-black ${
                      deliveredPackets.includes(packet)
                        ? packet <= reassembledCount
                          ? 'border-[#32f584]/60 bg-[#32f584]/15 text-[#a8ffd0]'
                          : 'border-[#f5c15b]/60 bg-[#f5c15b]/10 text-[#ffe5a8]'
                        : 'border-[#93ffc2]/20 bg-black/30 text-[#6c8b78]'
                    }`}
                    key={packet}
                  >
                    {packet}
                  </span>
                ))}
            </div>
          </div>

          <ol className="pseudo-code">
            <li className="active">inspect the link status</li>
            <li>route through connected routers</li>
            <li>avoid broken and high-cost links</li>
            <li className={complete ? 'done active' : ''}>deliver and reassemble packets</li>
          </ol>

          <div className="mt-5">
            <GlossaryPanel terms={GLOSSARY_TERMS} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function NetworkNode({ active, delivered, node, onClick, visited }) {
  const Icon = node.type === 'server' ? Server : node.type === 'source' ? Monitor : Network;

  return (
    <button
      className={`absolute z-10 grid size-15 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border-2 font-black transition hover:-translate-y-[calc(50%+4px)] md:size-18 ${
        delivered
          ? 'border-[#32f584] bg-[#0d2b1a] text-[#a8ffd0] shadow-[0_0_34px_rgba(50,245,132,0.24)]'
          : active
            ? 'border-[#f5c15b] bg-[#1c1a0c] text-[#ffe5a8] shadow-[0_0_30px_rgba(245,193,91,0.2)]'
            : visited
              ? 'border-[#32f584]/65 bg-[#0b2116] text-[#a8ffd0]'
              : 'border-[#93ffc2]/25 bg-[#06130d] text-[#c9e9d5]'
      }`}
      onClick={onClick}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      type="button"
    >
      <Icon size={20} />
      <span className="text-[0.64rem] font-black uppercase md:text-xs">{node.label}</span>
    </button>
  );
}

function LegendItem({ icon: Icon, label, value, tone }) {
  const tones = {
    clear: 'border-[#32f584]/35 text-[#a8ffd0]',
    congested: 'border-[#f5c15b]/45 text-[#ffe5a8]',
    broken: 'border-[#ff8278]/45 text-[#ffd3cf]',
  };

  return (
    <div className={`flex items-center gap-3 rounded-lg border bg-[#effff6]/5 p-3 ${tones[tone]}`}>
      <Icon size={18} />
      <div>
        <strong className="block text-sm font-black">{label}</strong>
        <span className="text-xs font-bold text-[#a6c6b3]">{value}</span>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-[#93ffc2]/20 bg-[#effff6]/5 p-4">
      <span className="ui-label">{label}</span>
      <strong className="block break-words text-2xl font-black text-[#32f584]">{value}</strong>
    </div>
  );
}

function StatusMessage({ children, tone }) {
  const tones = {
    neutral: 'border-[#93ffc2]/20 bg-[#effff6]/5 text-[#d9f7e5]',
    success: 'border-[#32f584]/40 bg-[#32f584]/10 text-[#a8ffd0]',
    error: 'border-[#ff8278]/40 bg-[#f05f52]/10 text-[#ffd3cf]',
    hint: 'border-[#f5c15b]/45 bg-[#f5c15b]/10 text-[#ffe5a8]',
  };

  return (
    <div className={`rounded-lg border px-4 py-3.5 font-extrabold leading-relaxed ${tones[tone]}`} role="status">
      <Check className="mr-2 inline" size={18} />
      {children}
    </div>
  );
}
