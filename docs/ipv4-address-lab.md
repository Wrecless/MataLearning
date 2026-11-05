# IPv4 Address Lab

Mode: Operate. This is a new lesson in the existing Networking topic, not a redesign.

## Direction contract

**Thesis:** teach pupils to inspect an IPv4 address rather than memorise a definition. One active challenge owns the screen; explicit checking and explanatory feedback replace timed guessing.

**Own-world:** inherit DESIGN.md, the terminal palette, Space Grotesk headings, numeric monospace and existing panel/control tokens. No new global styles or decorative assets.

**Story:** validate dotted-decimal addresses, build octets from eight binary place values, recognise private/public examples, then compare two devices using an explicitly stated /24 mask.

**First viewport:** left-aligned title and Reset, followed by the current address and two answer controls. The reference sits alongside on wide screens and below on mobile. Binary questions replace the address with an interactive eight-bit builder and live decimal total.

**Form:** local extension of the existing teaching-game shell. Use four binary columns on narrow screens and eight on wide screens. Completion is independent of other games; replay does not erase saved progress. No change to the established visual system.

**Finish:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. DESIGN.md is inherited unchanged; this lesson ships no raster assets.

## Teaching boundaries

- Use strict canonical dotted-decimal notation: four octets, 0–255, no leading zeros.
- Private ranges follow RFC 1918. The public-address example is an ordinary global-unicast address, not an assertion that every non-private range is public.
- Subnet questions explicitly use 255.255.255.0 (/24) and usable host examples. Do not generalise the first-three-octets rule to other masks.
- Ten challenges; no auto-advance; mistakes remain retryable. Store the independent completion ID `ipv4` only after the final correct check.
