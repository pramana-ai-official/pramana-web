"use client";

import { useEffect, useRef } from "react";

/**
 * A dense city skyline in speckled graphite on the graph-paper grid.
 *
 * The city is five rows deep. Four rows of towers are generated behind a hand-drawn
 * street front, each row taller and fainter than the one before it. Every building is a
 * solid shape with a light wash of tone, palest at the back, so buildings stand behind
 * buildings. The city rises at both edges of the sheet, so it frames whatever is written
 * above it, and the sun sits in a gap between two clusters of towers.
 *
 * Loose graphite lies along the ground line. A survey line crosses the sheet, and as it
 * passes, the specks lift into buildings. Brackets mark where a value is read, and
 * dimension lines measure two towers. Then the city stays alive, quietly: a bus runs
 * along the street, birds cross the sky, the crane's hook travels, beacons blink, and
 * every few seconds a window is read and shaded in. The pointer smudges the graphite.
 * It starts when it scrolls into view.
 *
 * The drawing keeps clear of the words. Anything marked `data-clear` inside the sheet is
 * measured: a building standing under it is drawn lower so it fits, and no speck is ever
 * placed on it.
 *
 * It is used twice. In the hero it spans the sheet. With `close`, at the foot of the
 * pilot band, it is a small city in the corner with one building bracketed: the one
 * corporation a pilot starts with.
 *
 * Decoration (aria-hidden): the page reads the same without it. The ground line is the
 * bottom edge of the element marked `data-plot`, so CSS decides where the city stands.
 * Colours come from CSS variables on the sheet (--speck, --speck-far, --mark, --paper).
 *
 * It is drawn on three stacked canvases, so that only what moves is ever repainted:
 *   wash  the buildings' solid shapes. Painted while the city rises, then left alone.
 *   city  every speck that has landed, and the finished checker's marks. A speck is
 *         painted here once. Only the patch under the pointer is repainted later.
 *   live  whatever is moving: specks in flight and the survey line, then the bus, the
 *         birds, the hook, the beacons and the windows being read.
 */

type Tone = "main" | "mid" | "soft";
type Pt = [number, number];
type Stroke = { pts: Pt[]; tone: Tone; dashed?: boolean; closed?: boolean };
type Circle = { c: Pt; r: number; tone: Tone; fill: number; arc?: [number, number] };
type Box = { x: number; w: number; h: number };
/** A window on the street front that can be read and shaded in. */
type Pane = { x: number; y: number; w: number; h: number; group: number };
/**
 * One building, or one loose thing in the sky. Row 0 is the street front; rows 1 to 4
 * stand behind it, 4 the farthest; row 5 is the sun, behind everything.
 */
type Group = {
  row: number;
  sky: boolean; // floats: nothing hides it, and it is not lowered to fit
  bus: boolean; // drawn on its own, because it moves
  x0: number;
  x1: number;
  top: number;
  strokes: Stroke[];
  circles: Circle[];
  solids: Box[]; // what this group hides behind it
  shades: Box[]; // faces that get graphite shading
};

// The city is described on a board 1000 wide. y is the height above the ground line.
const BOARD = 1000;
const FOCUS = 660; // the board x kept in view when the sheet is narrower than the city
const CIVIC = 405; // the domed civic building: what the closing city centres on
const TALLEST = 440; // the tallest building
const SKY = 520; // room above the ground for roofs, masts and birds
const BUS_HOME = 618;

// The city's outline: how tall its back row stands along the board. Tall at both edges,
// low under the hero's words, two clusters of towers on the right with a gap for the sun.
const PROFILE: Pt[] = [
  [-30, 356],
  [46, 348],
  [74, 226],
  [102, 150],
  [128, 132],
  [362, 132],
  [402, 154],
  [470, 206],
  [520, 264],
  [575, 330],
  [632, 358],
  [658, 300],
  [678, 196],
  [732, 196],
  [754, 330],
  [792, 440],
  [842, 440],
  [884, 412],
  [932, 384],
  [1030, 404],
];

// The rows behind the street front, back to front: tower widths, the share of the
// outline's height they reach, and how far each tower overlaps the next. Where the
// outline is low (under the hero's words) there is only room for two rows: `low` is
// their share there, and the two farthest rows are left out.
const LOW = 170;
const ROWS = [
  { row: 4, w: [14, 26], h: [0.82, 1], low: null, lap: 0.7 },
  { row: 3, w: [18, 32], h: [0.68, 0.9], low: null, lap: 0.76 },
  { row: 2, w: [22, 38], h: [0.54, 0.76], low: [0.84, 0.96], lap: 0.82 },
  { row: 1, w: [26, 44], h: [0.42, 0.62], low: [0.64, 0.8], lap: 0.88 },
];
// When buildings are lowered to fit under the words, each row keeps this much height
// (in pixels) over the row in front, so the rows never flatten into one band.
const RISE = 14;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (p: number) => 1 - Math.pow(1 - p, 5);
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
/** How far through the sweep (0 to 1) the survey line reaches a given share of the width. */
const sweepAt = (share: number) => (share < 0.5 ? Math.sqrt(share / 2) : 1 - Math.sqrt((1 - share) / 2));

const profile = (x: number) => {
  let i = 1;
  while (i < PROFILE.length - 1 && PROFILE[i][0] < x) i++;
  const [x0, h0] = PROFILE[i - 1];
  const [x1, h1] = PROFILE[i];
  return h0 + (h1 - h0) * clamp01((x - x0) / (x1 - x0));
};

/** A repeatable random number source, so the city is the same city on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function city() {
  const groups: Group[] = [];
  const panes: Pane[] = [];
  let g: Group;
  const begin = (row: number, sky = false, bus = false) => {
    g = { row, sky, bus, x0: Infinity, x1: -Infinity, top: 0, strokes: [], circles: [], solids: [], shades: [] };
    groups.push(g);
  };
  const reach = (x: number, y: number) => {
    g.x0 = Math.min(g.x0, x);
    g.x1 = Math.max(g.x1, x);
    g.top = Math.max(g.top, y);
  };
  const poly = (pts: Pt[], tone: Tone, closed = false, dashed = false) => {
    for (const [x, y] of pts) reach(x, y);
    g.strokes.push({ pts, tone, closed, dashed });
  };
  const line = (x1: number, y1: number, x2: number, y2: number, tone: Tone, dashed = false) =>
    poly(
      [
        [x1, y1],
        [x2, y2],
      ],
      tone,
      false,
      dashed,
    );
  const rect = (x: number, y: number, w: number, h: number, tone: Tone) =>
    poly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      tone,
      true,
    );
  const circle = (c: Pt, r: number, tone: Tone, fill = 0, arc?: [number, number]) => {
    reach(c[0] - r, c[1] + r);
    reach(c[0] + r, c[1] + r);
    g.circles.push({ c, r, tone, fill, arc });
  };
  /** Something solid from the ground up to `h`: it hides whatever stands behind it. */
  const hide = (x: number, w: number, h: number) => g.solids.push({ x, w, h });
  /** A building mass standing on the ground. */
  const mass = (x: number, w: number, h: number, tone: Tone = "main") => {
    // Rows behind leave their bottom edge open, so the ground line is not drawn twice.
    if (g.row)
      poly(
        [
          [x, 0],
          [x, h],
          [x + w, h],
          [x + w, 0],
        ],
        tone,
      );
    else rect(x, 0, w, h, tone);
    hide(x, w, h);
    if (!g.row) g.shades.push({ x, w, h });
  };
  /** A grid of windows filling the box from (x, y0) to (x + w, y1). */
  const windows = (x: number, w: number, y0: number, y1: number, cols: number, rows: number, tone: Tone = "mid") => {
    const cw = w / cols;
    const ch = (y1 - y0) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pane = { x: x + c * cw + cw * 0.22, y: y0 + r * ch + ch * 0.24, w: cw * 0.56, h: ch * 0.52 };
        rect(pane.x, pane.y, pane.w, pane.h, tone);
        if (!g.row) panes.push({ ...pane, group: groups.length - 1 });
      }
    }
  };
  const floors = (x: number, w: number, y0: number, step: number, n: number, tone: Tone = "soft") => {
    for (let i = 0; i < n; i++) line(x, y0 + i * step, x + w, y0 + i * step, tone);
  };
  const tank = (x: number, y: number) => {
    rect(x, y + 5, 14, 9, "mid");
    line(x + 2, y, x + 2, y + 5, "soft");
    line(x + 12, y, x + 12, y + 5, "soft");
  };
  const mast = (x: number, y: number, h: number) => {
    line(x, y, x, y + h, "mid");
    line(x - 3, y + h * 0.62, x + 3, y + h * 0.62, "soft");
  };
  const tree = (x: number, r: number) => {
    line(x, 0, x, r * 1.5, "mid");
    circle([x, r * 2.4], r, "mid", Math.round(r * 3));
  };
  const lamp = (x: number) => {
    line(x, 0, x, 26, "mid");
    line(x, 26, x + 6, 26, "mid");
    line(x + 6, 26, x + 6, 23.5, "mid");
  };

  // ---- the sun, low between two clusters of towers, behind everything ----
  begin(5);
  circle([704, 262], 30, "mid");
  circle([704, 262], 22, "soft");
  for (let a = 0; a < 12; a++) {
    const t = (a * Math.PI) / 6 + 0.26;
    line(704 + Math.cos(t) * 36, 262 + Math.sin(t) * 36, 704 + Math.cos(t) * 46, 262 + Math.sin(t) * 46, "mid");
  }

  // ---- four rows of towers behind the street front, farthest first ----
  const next = seeded(11);
  const between = (a: number, b: number) => a + next() * (b - a);
  for (const spec of ROWS) {
    let x = -14 - next() * 10;
    while (x < BOARD + 8) {
      const w = between(spec.w[0], spec.w[1]);
      const outline = profile(x + w / 2);
      const share = outline < LOW ? spec.low : spec.h;
      if (!share) {
        x += w * spec.lap;
        continue;
      }
      const h = outline * between(share[0], share[1]);
      const tone: Tone = spec.row === 4 ? "soft" : "mid";
      begin(spec.row);
      mass(x, w, h, tone);

      // The roof: a setback, a mast, a water tank, a sloped top, or plain.
      const roof = next();
      if (roof < 0.3 && w > 16) {
        const cw = w * 0.56;
        const ch = 6 + h * 0.06;
        rect(x + (w - cw) / 2, h, cw, ch, tone);
        hide(x + (w - cw) / 2, cw, h + ch);
        if (next() < 0.5) mast(x + w / 2, h + ch, between(10, 24));
      } else if (roof < 0.48) mast(x + w * between(0.3, 0.7), h, between(10, 28));
      else if (roof < 0.62 && spec.row < 4 && w > 20) tank(x + between(3, w - 17), h);
      else if (roof < 0.74 && spec.row === 1) {
        poly(
          [
            [x, h],
            [x, h + w * 0.4],
            [x + w, h],
          ],
          tone,
        );
        hide(x, w * 0.5, h + w * 0.2);
      }

      // The face: nothing on the farthest row, floor lines further forward, windows nearest.
      if (spec.row === 3) for (let y = 14; y < h - 6; y += 20) line(x + 4, y, x + w - 4, y, "soft", true);
      if (spec.row === 2) for (let y = 12; y < h - 6; y += 14) line(x + 3, y, x + w - 3, y, "mid", true);
      if (spec.row === 1)
        windows(x + 3, w - 6, 8, h - 6, w > 34 ? 3 : 2, Math.max(2, Math.round((h - 14) / 18)), "mid");

      x += w * spec.lap;
    }
  }

  // ---- the street front, left to right ----

  // A slim tower at the left edge. It runs off the sheet, so the city frames the page.
  begin(0);
  mass(-6, 34, 286);
  floors(-6, 34, 18, 17.6, 15);
  for (let f = 0; f < 15; f++) {
    rect(11, 22 + f * 17.6, 14, 5, "mid");
    rect(0, 22 + f * 17.6, 7, 9, "soft");
  }
  tank(-2, 286);
  mast(20, 286, 24);

  begin(0);
  mass(30, 24, 178);
  windows(32, 20, 12, 172, 2, 8);
  rect(37, 178, 10, 6, "mid");

  // A shop row with a hoarding on its roof.
  begin(0);
  mass(60, 52, 58);
  line(60, 31, 112, 31, "mid");
  rect(65, 4, 18, 22, "mid");
  rect(88, 4, 18, 22, "mid");
  for (let i = 0; i < 3; i++) rect(66 + i * 15, 39, 9, 11, "soft");
  rect(70, 66, 30, 14, "mid");
  line(76, 58, 76, 66, "soft");
  line(94, 58, 94, 66, "soft");

  // Apartments: four floors of balconies, a water tank on the roof.
  begin(0);
  mass(120, 86, 104);
  for (let f = 0; f < 4; f++) {
    const y = f * 26;
    if (f) line(120, y, 206, y, "soft");
    rect(126, y + 5, 32, 9, "mid");
    rect(164, y + 8, 13, 12, "mid");
    rect(184, y + 8, 13, 12, "mid");
  }
  tank(182, 104);
  rect(130, 104, 20, 11, "mid");

  begin(0);
  mass(208, 54, 82);
  windows(211, 48, 6, 78, 3, 3);
  tank(238, 82);

  // An old house with a pitched roof, kept between the blocks.
  begin(0);
  mass(266, 32, 44);
  poly(
    [
      [262, 44],
      [282, 64],
      [302, 44],
    ],
    "main",
  );
  hide(272, 20, 55);
  rect(278, 0, 8, 16, "mid");
  rect(270, 22, 8, 10, "mid");
  rect(286, 22, 8, 10, "mid");

  // A small office with strip windows.
  begin(0);
  mass(302, 40, 96);
  for (let i = 1; i < 6; i++) line(302 + i * 6.67, 10, 302 + i * 6.67, 90, "mid");
  floors(302, 40, 10, 20, 5);
  mast(330, 96, 16);

  // The civic building: columns, a dome and a flag.
  begin(0);
  mass(350, 110, 84);
  for (let i = 0; i < 6; i++) line(362 + i * 17.2, 8, 362 + i * 17.2, 62, "mid");
  line(354, 62, 456, 62, "mid");
  line(354, 67, 456, 67, "soft");
  rect(397, 0, 16, 24, "mid");
  rect(388, 84, 34, 11, "main");
  // Angles run anticlockwise from the right with y up, so this arc is the dome's top half.
  circle([405, 95], 22, "main", 0, [Math.PI, 2 * Math.PI]);
  line(405, 117, 405, 150, "mid");
  rect(405, 139, 15, 9, "mid");
  hide(383, 44, 118);

  // A mid-rise with solar panels on the roof.
  begin(0);
  mass(472, 74, 150);
  windows(477, 64, 18, 142, 4, 6);
  rect(502, 0, 14, 15, "mid");
  for (let i = 0; i < 2; i++) {
    const x = 480 + i * 24;
    poly(
      [
        [x, 150],
        [x + 17, 150],
        [x + 21, 160],
        [x + 4, 160],
      ],
      "mid",
      true,
    );
  }

  // Tower A: the measured one.
  begin(0);
  mass(560, 96, 228);
  windows(565, 86, 22, 220, 5, 9);
  line(560, 22, 656, 22, "mid");
  rect(598, 0, 20, 18, "mid");
  rect(584, 228, 26, 14, "mid");
  rect(624, 228, 16, 12, "mid");

  // A building going up: bare frame, cross-braced scaffold, a tower crane. Its hook is
  // drawn live (see `drawLife`).
  begin(0);
  rect(668, 0, 70, 176, "mid");
  hide(668, 70, 176);
  for (let i = 1; i < 3; i++) line(668 + i * 23.3, 0, 668 + i * 23.3, 176, "mid");
  floors(668, 70, 22, 22, 7, "mid");
  for (let i = 0; i < 4; i++) line(668 + i * 23.3, 176, 668 + i * 23.3, 187, "soft");
  for (let f = 0; f < 4; f++) {
    line(668, f * 22, 691.3, f * 22 + 22, "soft");
    line(691.3, f * 22, 668, f * 22 + 22, "soft");
  }
  line(748, 0, 748, 262, "mid");
  line(754, 0, 754, 262, "mid");
  for (let y = 0; y < 262; y += 12) line(748, y, 754, y + 12, "soft");
  rect(745, 262, 12, 10, "mid");
  line(751, 272, 751, 290, "mid");
  line(751, 276, 664, 276, "mid");
  line(751, 271, 670, 271, "soft");
  line(751, 290, 684, 276, "soft");
  line(751, 276, 768, 276, "mid");
  hide(744, 14, 262);

  // Tower B, the tallest on the street: a finned curtain wall with a stepped crown and a mast.
  begin(0);
  mass(772, 104, 300);
  for (let i = 1; i < 8; i++) line(772 + i * 13, 24, 772 + i * 13, 292, "soft");
  floors(772, 104, 24, 30, 10, "mid");
  rect(812, 0, 24, 20, "mid");
  rect(788, 300, 72, 18, "main");
  line(824, 318, 824, 348, "mid");
  hide(788, 72, 318);

  begin(0);
  mass(880, 22, 142);
  windows(882, 18, 10, 136, 1, 7);

  // A slim balcony tower.
  begin(0);
  mass(904, 52, 196);
  for (let f = 1; f < 9; f++) {
    line(904, f * 21.5, 956, f * 21.5, "soft");
    rect(936, f * 21.5 + 4, 20, 7, "mid");
    rect(912, f * 21.5 + 6, 12, 10, "mid");
  }

  // A stepped tower at the right edge, running off the sheet like the one on the left.
  begin(0);
  mass(958, 48, 240);
  rect(966, 240, 32, 36, "main");
  hide(966, 32, 276);
  floors(958, 48, 24, 18, 12);
  for (let i = 1; i < 4; i++) line(958 + i * 12, 24, 958 + i * 12, 236, "soft");
  mast(982, 276, 26);

  // ---- the kerb: trees and lamp posts in front of everything ----
  begin(0);
  for (const [x, r] of [
    [116, 8],
    [346, 8],
    [466, 7],
    [552, 6],
    [662, 8],
    [764, 7],
    [898, 6],
  ])
    tree(x, r);
  for (const x of [24, 190, 430, 742, 850]) lamp(x);

  // The bus. It is drawn on its own, because it drives along the street.
  begin(0, true, true);
  rect(BUS_HOME, 3, 38, 13, "main");
  for (let i = 0; i < 5; i++) rect(BUS_HOME + 3 + i * 6.6, 9, 4.6, 5, "mid");
  circle([BUS_HOME + 8, 3], 2.8, "main");
  circle([BUS_HOME + 30, 3], 2.8, "main");

  // Dashed rays from the sun to the solar roof and to Tower A: what an energy code measures.
  begin(0, true);
  line(672, 246, 522, 166, "mid", true);
  line(674, 262, 640, 214, "mid", true);

  return { groups, panes };
}

/**
 * Red dimension lines, drawn crisp over the graphite: [x1, y1, x2, y2, tower].
 * `tower` is a board x inside the building the line measures. `drop` turns a distance in
 * screen pixels into board units, so the width line sits the same way at any scale.
 */
function dimensions(drop: (px: number) => number): number[][] {
  const d: number[][] = [];
  // Tower A's height, floor by floor, on its left.
  d.push([557, 228, 546, 228, 600], [551, 0, 551, 228, 600]);
  for (const y of [0, 22, 44, 66, 88, 110, 132, 154, 176, 198, 228]) d.push([548.6, y - 2.4, 553.4, y + 2.4, 600]);
  // Tower B's width, under the ground line.
  d.push(
    [772, -drop(5), 772, -drop(27), 820],
    [876, -drop(5), 876, -drop(27), 820],
    [772, -drop(20), 876, -drop(20), 820],
  );
  for (let i = 0; i <= 8; i++) d.push([772 + i * 13 - 2.4, -drop(20) - 2.4, 772 + i * 13 + 2.4, -drop(20) + 2.4, 820]);
  return d;
}

/** Where the survey line reads a value: [x1, y1, x2, y2]. */
const READ_MARKS: number[][] = [
  [123, 54, 161, 69],
  [380, 92, 430, 121],
  [476, 147, 529, 163],
  [599, 133, 617, 153],
  [794, 146, 854, 182],
];
/** The closing city brackets one whole building: the civic one. */
const CLOSE_MARKS: number[][] = [[344, -3, 466, 154]];

/** Blinking beacons on the tallest masts: [x, y, the building they stand on]. */
const BEACONS: number[][] = [
  [824, 348, 820],
  [751, 290, 700],
  [982, 302, 980],
  [20, 310, 10],
];
const FLOCK_FROM = 570;
/** The birds of one flock: [how far behind the leader, height, wing phase]. */
const BIRDS: number[][] = [
  [0, 322, 0],
  [15, 331, 1.3],
  [27, 316, 2.1],
  [43, 336, 0.7],
  [56, 325, 3],
];

const TONES: Record<Tone, { step: number; jitter: number; alpha: [number, number]; size: [number, number] }> = {
  main: { step: 1.5, jitter: 0.6, alpha: [0.7, 1], size: [1, 1.9] },
  mid: { step: 2.1, jitter: 0.5, alpha: [0.5, 0.9], size: [0.9, 1.5] },
  soft: { step: 3, jitter: 0.45, alpha: [0.3, 0.6], size: [0.8, 1.3] },
};
// How strongly each row's lines are drawn, front to back (index = row), how sparsely,
// and how deep its wash of tone is. The street front is left as bare paper.
const STRENGTH = [1, 0.86, 0.7, 1, 0.8, 0.9];
const SPARSE = [1, 1, 1.1, 1.15, 1.3, 1];
const WASH = [0, 0.44, 0.32, 0.22, 0.13, 0];
const SHADING = 0.42;
// Specks are drawn in batches of equal strength, so the canvas changes state rarely.
const LEVELS = [0.14, 0.22, 0.32, 0.44, 0.58, 0.74, 0.92];
const level = (a: number) =>
  LEVELS.reduce((best, l, i) => (Math.abs(l - a) < Math.abs(LEVELS[best] - a) ? i : best), 0);

// Timeline, in milliseconds. The drawing holds at SWEEP_START until it scrolls into
// view, then runs from there. In the hero, the stamp and the first chain station are
// timed in CSS (globals.css, "motion") to land just after the dimension lines; their
// clock starts at the same moment, when the sheet gets `data-drawing`.
const SWEEP_START = 350;
const SWEEP_END = 2500;
const DIMS_START = 2350;
const DIMS_END = 3000;
const SETTLED = 4300;
// After that the city is alive. A window is read every READ_EVERY; at most LIT stay shaded.
const READ_EVERY = 2400;
const LIT = 16;

// The pointer pushes specks within REACH pixels up to PUSH pixels away.
const REACH = 84;
const PUSH = 16;
// Specks are indexed by where they rest, in square cells this many pixels wide.
const CELL = 96;

export function Skyline({ close = false }: { close?: boolean }) {
  const washRef = useRef<HTMLCanvasElement>(null);
  const cityRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layers = [washRef.current, cityRef.current, liveRef.current];
    const contexts = layers.map((c) => c?.getContext("2d"));
    const sheet = cityRef.current?.parentElement;
    const plot = sheet?.querySelector<HTMLElement>("[data-plot]");
    if (!sheet || !plot || layers.some((c) => !c) || contexts.some((c) => !c)) return;
    const [washCanvas, cityCanvas, liveCanvas] = layers as HTMLCanvasElement[];
    const [wash, ink, live] = contexts as CanvasRenderingContext2D[];

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    const { groups, panes } = city();
    // Fewer specks on phones and on modest machines; the back rows thin out first.
    const budget = narrow ? 26000 : (navigator.hardwareConcurrency ?? 8) <= 4 ? 40000 : 60000;

    // The drawing starts when it scrolls into view (see `onStart` below). `t0` is the
    // clock's zero; on a fast page it can be a moment before the page itself began.
    let started = false;
    let t0 = 0;

    let width = 0;
    let scale = 1;
    let originX = 0;
    let groundY = 0;
    // The canvases cover only the band of the sheet the city stands in.
    let bandTop = 0;
    let bandHeight = 0;
    // The specks, sorted into batches of one colour and strength.
    let count = 0;
    let tx = new Float32Array(0);
    let ty = new Float32Array(0);
    let sx = new Float32Array(0);
    let sy = new Float32Array(0);
    let delay = new Float32Array(0);
    let dur = new Float32Array(0);
    let size = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let dusty = new Uint8Array(0); // lies on the ground as dust before it rises
    let landed = new Uint8Array(0); // already painted on the city layer
    let landedCount = 0;
    let batchOf = new Uint8Array(0);
    let batches: { from: number; to: number; far: boolean; alpha: number }[] = [];
    // Which specks rest in which cell: the specks of cell c are cellItems[cellStart[c] .. cellStart[c + 1]].
    let cols = 1;
    let rows = 1;
    let cellStart = new Uint32Array(2);
    let cellItems = new Uint32Array(0);
    // The solid shape of every building, back to front: [x, y, w, h, depth of tone, when it starts to show].
    let washes: number[][] = [];
    let washEnd = 0;
    let washDone = false;
    // The bus: its own specks, placed where it is parked.
    let bus: { x: number; y: number; s: number; a: number }[] = [];
    let fit: number[] = [];
    let hookFit = 1;
    let dims: number[][] = []; // in sheet pixels: [x1, y1, x2, y2]
    let marks: number[][] = []; // in sheet pixels: [left, top, right, bottom]
    let panesPx: number[][] = []; // the windows that can be read: [x, y, w, h]
    let beacons: Pt[] = [];
    let colours = { speck: "#232b21", far: "#728e6d", mark: "#852e30", paper: "#f9f2e2" };
    // What is alive in the city.
    let reading: { pane: number; at: number } | null = null;
    let nextRead = SETTLED + 400;
    let lit: { pane: number; at: number; off: number }[] = [];
    const lastLive: number[][] = []; // what the live layer drew last time, to wipe before the next

    let pointerX = -9999;
    let pointerY = -9999;
    let pointerAt = 0;
    let hot: number[] | null = null; // the box around the specks the pointer has pushed out of place
    let settled = false;
    let frame = 0;
    let lastLife = 0;
    let running = false;
    let visible = true;

    const toPx = (x: number, y: number): Pt => [originX + x * scale, groundY - y * scale];
    const lift = (y: number, f: number) => (y > 0 ? y * f : y);
    /** The fit of the building standing at board x, for the marks drawn over it. */
    const fitAt = (x: number) => {
      const i = groups.findIndex(
        (g) => !g.row && !g.sky && g.solids.some((s) => s.h > 40 && x >= s.x && x <= s.x + s.w),
      );
      return i < 0 ? 1 : fit[i];
    };
    const style = (c: CanvasRenderingContext2D, batch: number) => {
      c.fillStyle = batches[batch].far ? colours.far : colours.speck;
      c.globalAlpha = batches[batch].alpha;
    };
    const wipe = (c: CanvasRenderingContext2D) => c.clearRect(0, bandTop, width, bandHeight);

    function layout() {
      const sheetBox = sheet!.getBoundingClientRect();
      const plotBox = plot!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = sheetBox.width;

      const css = getComputedStyle(sheet!);
      const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      colours = {
        speck: read("--speck", colours.speck),
        far: read("--speck-far", colours.far),
        mark: read("--mark", colours.mark),
        paper: read("--paper", colours.paper),
      };

      groundY = plotBox.bottom - sheetBox.top;
      const keepInView = (focus: number, cityWidth: number) =>
        Math.min(0, Math.max(width / 2 - focus * scale, width - cityWidth));
      if (close) {
        // A small city that fits the plot's height, at the right end of the content.
        scale = Math.min(0.62, (plotBox.height - 8) / TALLEST);
        const cityWidth = BOARD * scale;
        originX = width >= cityWidth + 40 ? plotBox.right - sheetBox.left - cityWidth : keepInView(CIVIC, cityWidth);
      } else {
        // The city spans the sheet. On a narrow sheet it keeps a readable size and shows
        // the part around the towers; on a short one it shrinks to stay inside.
        scale = Math.min(Math.max(width / BOARD, 0.74), 2.2, (groundY - 24) / TALLEST);
        const cityWidth = BOARD * scale;
        originX = width >= cityWidth ? (width - cityWidth) / 2 : keepInView(FOCUS, cityWidth);
        // The stamp is placed in board units from these (globals.css, `.hero-skyline .stamp`).
        sheet!.style.setProperty("--sky-scale", String(scale));
        sheet!.style.setProperty("--sky-x", `${originX}px`);
      }

      // Size the three canvases to the band the city stands in: from above its tallest
      // mast to just under the ground line. The wash layer needs no extra sharpness.
      bandTop = Math.max(0, Math.floor(groundY - SKY * scale));
      bandHeight = Math.min(sheetBox.height, Math.ceil(groundY + 34)) - bandTop;
      [washCanvas, cityCanvas, liveCanvas].forEach((canvas, i) => {
        const sharp = i ? dpr : 1;
        canvas.style.top = `${bandTop}px`;
        canvas.style.height = `${bandHeight}px`;
        canvas.width = Math.round(width * sharp);
        canvas.height = Math.round(bandHeight * sharp);
        [wash, ink, live][i].setTransform(sharp, 0, 0, sharp, 0, -bandTop * sharp);
      });

      // The words the drawing keeps clear of, line by line, in sheet pixels, with a little
      // air around them. `data-clear="box"` takes the element's whole box instead, and
      // `data-air` sets how many pixels to leave under it (14 if not given).
      const clear = Array.from(sheet!.querySelectorAll<HTMLElement>("[data-clear]"))
        .flatMap((el) => {
          const air = Number(el.dataset.air) || 14;
          const range = document.createRange();
          range.selectNodeContents(el);
          const boxes = el.dataset.clear === "box" ? [el.getBoundingClientRect()] : Array.from(range.getClientRects());
          return boxes.map((r) => ({
            x0: r.left - sheetBox.left - 12,
            x1: r.right - sheetBox.left + 12,
            y0: r.top - sheetBox.top - 6,
            y1: r.bottom - sheetBox.top + air,
          }));
        })
        .filter((r) => r.y1 < groundY);
      const onWords = (x: number, y: number) => clear.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1);

      // How much each group is lowered to fit under the words above it (1 = not at all).
      fit = groups.map((g) => {
        if (g.sky) return 1;
        const left = originX + g.x0 * scale;
        const right = originX + g.x1 * scale;
        let ceiling = 0;
        for (const r of clear) if (r.x1 > left && r.x0 < right) ceiling = Math.max(ceiling, r.y1);
        const room = groundY - ceiling - Math.max(0, 2 - g.row) * RISE;
        return ceiling && g.top * scale > room ? Math.max(0.3, room / (g.top * scale)) : 1;
      });
      hookFit = fitAt(700);
      // The closing city starts low: the tall cluster that frames the hero's left edge is left out.
      const drawn = groups.map((g) => !(close && g.x1 < 112));
      const reachedAt = (x: number) => SWEEP_START + sweepAt(clamp01(x / width)) * (SWEEP_END - SWEEP_START);

      washes = groups.flatMap((g, gi) =>
        g.sky || g.row === 5 || !drawn[gi]
          ? []
          : g.solids.map((s) => {
              const [x, y] = toPx(s.x, s.h * fit[gi]);
              return [x, y, s.w * scale, groundY - y, WASH[g.row], reachedAt(x + (s.w * scale) / 2) + g.row * 70 + 260];
            }),
      );
      washEnd = Math.max(0, ...washes.map((w) => w[5])) + 700;
      washDone = false;

      type Target = { x: number; y: number; tone: Tone; row: number; shade: boolean };
      const targets: Target[] = [];
      const busTargets: Target[] = [];

      groups.forEach((g, gi) => {
        if (!drawn[gi]) return;
        const f = fit[gi];
        const into = g.bus ? busTargets : targets;
        const put = (x: number, y: number, tone: Tone, shade = false) => {
          if (x < -24 || x > width + 24 || (!g.bus && onWords(x, y))) return;
          into.push({ x, y, tone, row: g.row, shade });
        };
        // Everything drawn later stands in front, and hides this group where it overlaps.
        const cover: { x0: number; x1: number; h: number }[] = [];
        if (!g.sky) {
          for (let j = gi + 1; j < groups.length; j++) {
            if (groups[j].sky || !drawn[j]) continue;
            for (const s of groups[j].solids) {
              if (s.x < g.x1 && s.x + s.w > g.x0) cover.push({ x0: s.x, x1: s.x + s.w, h: s.h * fit[j] });
            }
          }
        }
        const hidden = (x: number, y: number) => cover.some((c) => x > c.x0 && x < c.x1 && y < c.h);
        const thin = SPARSE[g.row];

        for (const s of g.strokes) {
          const pts = s.closed ? [...s.pts, s.pts[0]] : s.pts;
          const { step, jitter } = TONES[s.tone];
          for (let i = 0; i < pts.length - 1; i++) {
            const ax = pts[i][0];
            const ay = lift(pts[i][1], f);
            const bx = pts[i + 1][0];
            const by = lift(pts[i + 1][1], f);
            const units = Math.hypot(bx - ax, by - ay) || 1;
            const len = units * scale;
            const nx = -(by - ay) / units;
            const ny = (bx - ax) / units;
            for (let d = 0; d <= len; d += step * thin) {
              if (s.dashed && Math.floor(d / 5) % 2) continue;
              const p = clamp01((d + rand(-0.5, 0.5) * step) / len);
              const ux = ax + (bx - ax) * p;
              const uy = ay + (by - ay) * p;
              if (hidden(ux, uy)) continue;
              const j = (rand(-1, 1) * jitter) / scale;
              const [x, y] = toPx(ux + nx * j, uy + ny * j);
              put(x, y, s.tone);
            }
          }
        }
        for (const { c, r, tone, fill, arc } of g.circles) {
          const cy = lift(c[1], f);
          const [from, to] = arc ?? [0, Math.PI * 2];
          const around = Math.max(10, Math.round(((to - from) * r * scale) / TONES[tone].step));
          for (let i = 0; i < around; i++) {
            const t = from + ((to - from) * i) / around;
            const rr = r + (rand(-1, 1) * TONES[tone].jitter) / scale;
            const ux = c[0] + Math.cos(t) * rr;
            const uy = cy - Math.sin(t) * rr;
            if (hidden(ux, uy)) continue;
            const [x, y] = toPx(ux, uy);
            put(x, y, tone);
          }
          for (let i = 0; i < fill; i++) {
            const t = rand(0, Math.PI * 2);
            const rr = r * Math.sqrt(Math.random()) * 0.92;
            const [x, y] = toPx(c[0] + Math.cos(t) * rr, cy + Math.sin(t) * rr);
            put(x, y, "soft");
          }
        }
        // Graphite shading: each face is speckled, densest along its right edge.
        for (const b of g.shades) {
          const specks = Math.round((b.w * b.h * f * scale * scale) / 95);
          for (let i = 0; i < specks; i++) {
            const ux = b.x + b.w * (1 - Math.pow(Math.random(), 2.2) * 0.9);
            const uy = rand(0, b.h * f);
            if (hidden(ux, uy)) continue;
            const [x, y] = toPx(ux, uy);
            put(x, y, "soft", true);
          }
        }
      });
      // The ground line, and loose graphite along it.
      for (let x = 0; x <= width; x += 1.5)
        targets.push({ x: x + rand(-0.5, 0.5), y: groundY + rand(-0.6, 0.6), tone: "main", row: 0, shade: false });
      for (let i = 0; i < width / 2.4; i++)
        targets.push({ x: rand(0, width), y: groundY + rand(2, 16), tone: "soft", row: 0, shade: true });

      // Keep to the budget: the street front stays whole, the rows behind and the shading thin out.
      const front = targets.filter((t) => !t.row && !t.shade).length;
      const keep = Math.min(1, (budget - front) / Math.max(1, targets.length - front));
      const kept = keep < 1 ? targets.filter((t) => (!t.row && !t.shade) || Math.random() < keep) : targets;

      // Sort the specks into batches of one colour and strength.
      const specks = kept
        .map((t) => {
          const tone = TONES[t.tone];
          const a = rand(tone.alpha[0], tone.alpha[1]) * (t.shade ? SHADING : STRENGTH[t.row]);
          return { ...t, far: t.row === 3 || t.row === 4, lv: level(a), look: tone };
        })
        .sort((a, b) => Number(a.far) - Number(b.far) || a.lv - b.lv);

      count = specks.length;
      tx = new Float32Array(count);
      ty = new Float32Array(count);
      sx = new Float32Array(count);
      sy = new Float32Array(count);
      delay = new Float32Array(count);
      dur = new Float32Array(count);
      size = new Float32Array(count);
      ox = new Float32Array(count);
      oy = new Float32Array(count);
      dusty = new Uint8Array(count);
      landed = new Uint8Array(count);
      landedCount = 0;
      batchOf = new Uint8Array(count);
      batches = [];
      cols = Math.ceil((width + 48) / CELL);
      rows = Math.ceil(bandHeight / CELL);
      const cellOf = new Uint32Array(count);
      cellStart = new Uint32Array(cols * rows + 1);
      specks.forEach((t, i) => {
        tx[i] = t.x;
        ty[i] = t.y;
        // Every speck starts as loose dust on the ground, close to where it will rise.
        sx[i] = t.x + rand(-34, 34);
        sy[i] = groundY + rand(-5, 18);
        // The street front rises first; each row behind follows a beat later; shading last.
        delay[i] = reachedAt(t.x) + rand(0, 240) + (t.shade ? 320 : t.row * 70);
        dur[i] = rand(700, 1100);
        size[i] = rand(t.look.size[0], t.look.size[1]);
        dusty[i] = !t.row && !t.shade ? 1 : 0;
        const last = batches[batches.length - 1];
        if (last && last.far === t.far && last.alpha === LEVELS[t.lv]) last.to = i + 1;
        else batches.push({ from: i, to: i + 1, far: t.far, alpha: LEVELS[t.lv] });
        batchOf[i] = batches.length - 1;
        cellOf[i] = cellAt(t.x, t.y);
        cellStart[cellOf[i] + 1]++;
      });
      for (let c = 0; c < cols * rows; c++) cellStart[c + 1] += cellStart[c];
      cellItems = new Uint32Array(count);
      const next = cellStart.slice(0, cols * rows);
      for (let i = 0; i < count; i++) cellItems[next[cellOf[i]]++] = i;

      bus = busTargets.map((t) => ({
        x: t.x,
        y: t.y,
        s: rand(TONES[t.tone].size[0], TONES[t.tone].size[1]),
        a: rand(TONES[t.tone].alpha[0], TONES[t.tone].alpha[1]),
      }));

      // The checker's marks, placed over the buildings they belong to.
      const drop = (px: number) => px / scale;
      dims = (close ? [] : dimensions(drop)).map(([x1, y1, x2, y2, tower]) => {
        const f = fitAt(tower);
        return [...toPx(x1, lift(y1, f)), ...toPx(x2, lift(y2, f))];
      });
      marks = (close ? CLOSE_MARKS : READ_MARKS).map(([x1, y1, x2, y2]) => {
        const f = fitAt((x1 + x2) / 2);
        const [left, bottom] = toPx(x1, lift(y1, f));
        const [right, top] = toPx(x2, lift(y2, f));
        return [left, top, right, bottom];
      });
      panesPx = panes
        .filter((p) => drawn[p.group])
        .map((p) => {
          const f = fit[p.group];
          const [x, y] = toPx(p.x, (p.y + p.h) * f);
          return [x, y, p.w * scale, p.h * f * scale];
        })
        .filter(([x, y, w]) => x > 8 && x + w < width - 8 && !onWords(x, y));
      beacons = BEACONS.filter(([x]) => !close || x > 112)
        .map(([x, y, on]) => toPx(x, y * fitAt(on)))
        .filter(([x]) => x > 0 && x < width);
      lit = [];
      reading = null;
      hot = null;
      settled = false;
      lastLive.length = 0;
    }

    /** The cell a point rests in. */
    function cellAt(x: number, y: number) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor((x + 24) / CELL)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor((y - bandTop) / CELL)));
      return cy * cols + cx;
    }

    /** The buildings' solid shapes, back to front: each covers what stands behind it with paper, then takes its tone. */
    function paintWashes(t: number) {
      wipe(wash);
      for (const [x, y, w, h, tone, start] of washes) {
        const p = clamp01((t - start) / 700);
        if (p <= 0) continue;
        wash.globalAlpha = p;
        wash.fillStyle = colours.paper;
        wash.fillRect(x, y, w, h);
        if (tone) {
          wash.globalAlpha = tone * p;
          wash.fillStyle = colours.far;
          wash.fillRect(x, y, w, h);
        }
      }
      wash.globalAlpha = 1;
      washDone = t > washEnd;
    }

    /** While the city rises: paint each speck that has landed onto the city layer, once, and draw the ones in flight. */
    function paintRising(t: number) {
      // Before the survey line arrives, the street front lies on the ground as faint dust.
      live.fillStyle = colours.speck;
      live.globalAlpha = 0.2 * clamp01(t / 400);
      for (let i = 0; i < count; i++) if (dusty[i] && t < delay[i]) live.fillRect(sx[i], sy[i], size[i], size[i]);
      batches.forEach((b, bi) => {
        style(live, bi);
        style(ink, bi);
        for (let i = b.from; i < b.to; i++) {
          if (landed[i]) continue;
          const since = t - delay[i];
          if (since < 0) continue;
          if (since >= dur[i]) {
            ink.fillRect(tx[i], ty[i], size[i], size[i]);
            landed[i] = 1;
            landedCount++;
          } else {
            const p = easeOut(since / dur[i]);
            live.fillRect(sx[i] + (tx[i] - sx[i]) * p, sy[i] + (ty[i] - sy[i]) * p, size[i], size[i]);
          }
        }
      });
      live.globalAlpha = ink.globalAlpha = 1;
    }

    /**
     * The pointer smudges the graphite, and it settles back. Only the patch around the
     * pointer, and around specks still out of place, is wiped and repainted.
     * Returns false when there is nothing to do.
     */
    function paintSmudge() {
      const near = pointerX > -9000;
      if (!near && !hot) return false;
      const air = PUSH + 4;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      if (near)
        [x0, y0, x1, y1] = [
          pointerX - REACH - PUSH,
          pointerY - REACH - PUSH,
          pointerX + REACH + PUSH,
          pointerY + REACH + PUSH,
        ];
      if (hot)
        [x0, y0, x1, y1] = [Math.min(x0, hot[0]), Math.min(y0, hot[1]), Math.max(x1, hot[2]), Math.max(y1, hot[3])];
      [x0, y0, x1, y1] = [Math.floor(x0 - air), Math.floor(y0 - air), Math.ceil(x1 + air), Math.ceil(y1 + air)];

      ink.save();
      ink.beginPath();
      ink.rect(x0, y0, x1 - x0, y1 - y0);
      ink.clip();
      ink.clearRect(x0, y0, x1 - x0, y1 - y0);
      let moved: number[] | null = null;
      let batch = -1;
      const from = cellAt(x0 - 3, y0 - 3);
      const to = cellAt(x1 + 3, y1 + 3);
      for (let cy = Math.floor(from / cols); cy <= Math.floor(to / cols); cy++) {
        for (let cx = from % cols; cx <= to % cols; cx++) {
          const cell = cy * cols + cx;
          for (let k = cellStart[cell]; k < cellStart[cell + 1]; k++) {
            const i = cellItems[k];
            let pushX = 0;
            let pushY = 0;
            if (near) {
              const dx = tx[i] + ox[i] - pointerX;
              const dy = ty[i] + oy[i] - pointerY;
              const dist = Math.hypot(dx, dy);
              if (dist && dist < REACH) {
                const push = (Math.pow(1 - dist / REACH, 2) * PUSH) / dist;
                pushX = dx * push;
                pushY = dy * push;
              }
            }
            ox[i] += (pushX - ox[i]) * 0.16;
            oy[i] += (pushY - oy[i]) * 0.16;
            if (Math.abs(ox[i]) + Math.abs(oy[i]) > 0.05) {
              moved = moved
                ? [
                    Math.min(moved[0], tx[i]),
                    Math.min(moved[1], ty[i]),
                    Math.max(moved[2], tx[i]),
                    Math.max(moved[3], ty[i]),
                  ]
                : [tx[i], ty[i], tx[i], ty[i]];
            } else ox[i] = oy[i] = 0;
            if (batchOf[i] !== batch) style(ink, (batch = batchOf[i]));
            ink.fillRect(tx[i] + ox[i], ty[i] + oy[i], size[i], size[i]);
          }
        }
      }
      ink.globalAlpha = 1;
      paintMarks(ink, Infinity);
      ink.restore();
      hot = moved;
      return true;
    }

    /** Corner brackets around a box, in the checker's colour. `open` (0 to 1) snaps them in. */
    function bracket(c: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, open: number) {
      const grow = (1 - open) * 7;
      const l = Math.max(3, Math.min(bx - ax, by - ay) * 0.3);
      c.globalAlpha = open;
      c.beginPath();
      for (const [cx, cy, hx, hy] of [
        [ax - grow, ay - grow, 1, 1],
        [bx + grow, ay - grow, -1, 1],
        [bx + grow, by + grow, -1, -1],
        [ax - grow, by + grow, 1, -1],
      ]) {
        c.moveTo(cx + hx * l, cy);
        c.lineTo(cx, cy);
        c.lineTo(cx, cy + hy * l);
      }
      c.stroke();
    }

    /** The survey line, the dimension lines and the read brackets, as they stand at time `t`. */
    function paintMarks(c: CanvasRenderingContext2D, t: number) {
      const span = TALLEST * scale + 30;
      const sweepP = clamp01((t - SWEEP_START) / (SWEEP_END - SWEEP_START));
      const sweepX = easeInOut(sweepP) * width;
      if (sweepP > 0 && sweepP < 1) {
        const fade = Math.sin(sweepP * Math.PI);
        const trail = c.createLinearGradient(sweepX - 60, 0, sweepX, 0);
        trail.addColorStop(0, "transparent");
        trail.addColorStop(1, colours.mark);
        c.globalAlpha = 0.1 * fade;
        c.fillStyle = trail;
        c.fillRect(sweepX - 60, groundY - span, 60, span + 18);
        c.globalAlpha = 0.85 * fade;
        c.fillStyle = colours.mark;
        c.fillRect(sweepX, groundY - span, 1.25, span + 18);
        c.fillRect(sweepX - 4, groundY - span, 9.25, 1.25);
      }

      c.strokeStyle = colours.mark;
      // Dimension lines draw in one after another.
      const dimP = clamp01((t - DIMS_START) / (DIMS_END - DIMS_START));
      if (dimP > 0) {
        c.lineWidth = 1;
        c.globalAlpha = 0.95;
        c.beginPath();
        dims.forEach(([ax, ay, bx, by], i) => {
          const p = easeOut(clamp01(dimP * 2.2 - (i / dims.length) * 1.2));
          if (p <= 0) return;
          c.moveTo(ax, ay);
          c.lineTo(ax + (bx - ax) * p, ay + (by - ay) * p);
        });
        c.stroke();
      }
      // Corner brackets snap onto each place a value is read, as the survey line passes.
      c.lineWidth = 1.25;
      for (const [ax, ay, bx, by] of marks) {
        const p = easeOut(
          clamp01((t - SWEEP_START - sweepAt(clamp01((ax + bx) / 2 / width)) * (SWEEP_END - SWEEP_START) - 120) / 420),
        );
        if (p > 0) bracket(c, ax, ay, bx, by, p);
      }
      c.globalAlpha = 1;
    }

    /**
     * The live details: shaded windows, the window being read, the bus, the hook, the
     * beacons and the birds. Each wipes only what it drew last time.
     */
    function paintLife(t: number) {
      for (const [x, y, w, h] of lastLive) live.clearRect(x - 2, y - 2, w + 4, h + 4);
      lastLive.length = 0;
      const alive = t - SETTLED;

      // Windows that have been read stay shaded in for a while.
      live.fillStyle = colours.speck;
      lit = lit.filter((w) => t < w.off + 600);
      for (const w of lit) {
        const [x, y, pw, ph] = panesPx[w.pane];
        live.globalAlpha = 0.34 * clamp01((t - w.at) / 500) * (1 - clamp01((t - w.off) / 600));
        live.fillRect(x, y, pw, ph);
        lastLive.push([x, y, pw, ph]);
      }

      // The bus: parked while the city rises, then driving along the street.
      const home = originX + BUS_HOME * scale;
      const shown = clamp01((t - SWEEP_START - sweepAt(clamp01(home / width)) * (SWEEP_END - SWEEP_START) - 500) / 500);
      if (shown > 0 && bus.length) {
        const run = BOARD + 120;
        const at = ((((BUS_HOME - Math.max(0, alive) * 0.012 + 70) % run) + run) % run) - 70;
        const dx = (at - BUS_HOME) * scale;
        if (home + dx > -60 * scale && home + dx < width + 10) {
          live.globalAlpha = shown;
          live.fillStyle = colours.paper;
          live.fillRect(home + dx, groundY - 16 * scale, 38 * scale, 13 * scale);
          live.fillStyle = colours.speck;
          for (const s of bus) {
            live.globalAlpha = s.a * shown;
            live.fillRect(s.x + dx, s.y, s.s, s.s);
          }
          lastLive.push([home + dx - 2, groundY - 18 * scale, 42 * scale, 20 * scale]);
        }
      }

      live.strokeStyle = colours.speck;
      live.fillStyle = colours.speck;
      live.lineWidth = 1;

      // The crane's hook travels along the jib and up and down.
      const hooked = clamp01((t - SWEEP_END) / 600);
      if (hooked > 0) {
        const [hx, top] = toPx(707 + Math.sin(alive * 0.00035) * 28, 276 * hookFit);
        const [, hy] = toPx(0, (236 + Math.sin(alive * 0.00023 + 1) * 24) * hookFit);
        live.globalAlpha = 0.6 * hooked;
        live.beginPath();
        live.moveTo(hx, top);
        live.lineTo(hx, hy);
        live.stroke();
        live.strokeRect(hx - 3 * scale, hy, 6 * scale, 6 * scale);
        lastLive.push([hx - 3 * scale - 1, top, 6 * scale + 2, hy - top + 6 * scale + 2]);
      }

      if (alive > 0) {
        // Beacons blink on the tallest masts, out of step with each other.
        beacons.forEach(([x, y], i) => {
          live.globalAlpha = 0.2 + 0.8 * Math.pow(Math.max(0, Math.sin(alive * 0.0031 + i * 1.9)), 6);
          live.fillRect(x - 1.5, y - 1.5, 3, 3);
          lastLive.push([x - 1.5, y - 1.5, 3, 3]);
        });

        // A flock crosses the sky above the towers, wings beating, then comes round again.
        // It starts at FLOCK_FROM, to the right of the hero's words, so it never flies over them.
        if (!close) {
          const lead = FLOCK_FROM + ((alive * 0.014) % (1140 - FLOCK_FROM));
          live.lineWidth = 1.1;
          live.globalAlpha = 0.75 * clamp01((lead - FLOCK_FROM) / 30);
          live.beginPath();
          for (const [back, high, phase] of BIRDS) {
            const bx = lead - back;
            const wing = 1.9 + 1.5 * Math.sin(alive * 0.011 + phase);
            const [x, y] = toPx(bx, high + Math.sin(alive * 0.0012 + phase) * 4);
            if (bx < FLOCK_FROM || x > width) continue;
            live.moveTo(x - 3.6 * scale, y - wing * scale);
            live.lineTo(x, y);
            live.lineTo(x + 3.6 * scale, y - wing * scale);
            lastLive.push([x - 4 * scale, y - 4 * scale, 8 * scale, 5 * scale]);
          }
          live.stroke();
        }

        // Every few seconds one window is read: a bracket snaps on, and the window is shaded in.
        if (t >= nextRead && panesPx.length) {
          reading = { pane: Math.floor(Math.random() * panesPx.length), at: t };
          nextRead = t + READ_EVERY;
        }
        if (reading) {
          const age = t - reading.at;
          const pane = reading.pane;
          const [x, y, pw, ph] = panesPx[pane];
          if (age > 650 && !lit.some((w) => w.pane === pane)) {
            lit.push({ pane, at: t, off: Infinity });
            const oldest = lit.find((w) => w.off === Infinity);
            if (lit.length > LIT && oldest) oldest.off = t;
          }
          if (age < 1900) {
            live.strokeStyle = colours.mark;
            live.lineWidth = 1.25;
            bracket(
              live,
              x - 3,
              y - 3,
              x + pw + 3,
              y + ph + 3,
              age < 1500 ? easeOut(clamp01(age / 320)) : 1 - (age - 1500) / 400,
            );
            lastLive.push([x - 12, y - 12, pw + 24, ph + 24]);
          } else reading = null;
        }
      }
      live.globalAlpha = 1;
    }

    /** With reduced motion: the finished drawing, painted once. */
    function paintFinished() {
      wipe(ink);
      wipe(live);
      paintWashes(Infinity);
      batches.forEach((b, bi) => {
        style(ink, bi);
        for (let i = b.from; i < b.to; i++) ink.fillRect(tx[i], ty[i], size[i], size[i]);
      });
      ink.fillStyle = colours.speck;
      for (const s of bus) {
        ink.globalAlpha = s.a;
        ink.fillRect(s.x, s.y, s.s, s.s);
      }
      ink.globalAlpha = 1;
      paintMarks(ink, Infinity);
    }

    /** Before the drawing starts: loose graphite on the ground. */
    function paintWaiting() {
      wipe(live);
      live.fillStyle = colours.speck;
      live.globalAlpha = 0.175;
      for (let i = 0; i < count; i++) if (dusty[i]) live.fillRect(sx[i], sy[i], size[i], size[i]);
      live.globalAlpha = 1;
    }

    function loop(now: number) {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(loop);
      const t = now - t0;

      // While the city rises, everything on the live layer is redrawn each frame.
      if (t < SETTLED || landedCount < count) {
        if (!washDone) paintWashes(t);
        wipe(live);
        lastLive.length = 0;
        paintRising(t);
        paintLife(t);
        paintMarks(live, t);
        return;
      }
      // The first frame at rest: the marks move onto the city layer, for good.
      if (!settled) {
        if (!washDone) paintWashes(t);
        paintMarks(ink, Infinity);
        wipe(live);
        settled = true;
        lastLife = 0;
      }
      // The graphite settles back once the pointer has rested for a moment.
      if (pointerX > -9000 && now - pointerAt > 1400) pointerX = pointerY = -9999;
      paintSmudge();
      // Twenty-five frames a second is plenty for a bus and a few birds.
      if (now - lastLife >= 38) {
        lastLife = now;
        paintLife(t);
      }
    }
    function wake() {
      if (running || still || !started || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }
    function redraw() {
      layout();
      if (still) paintFinished();
      else if (!started) paintWaiting();
      else wake();
    }

    redraw();
    const onResize = new ResizeObserver(redraw);
    onResize.observe(sheet);

    // Start once, when the drawing is on screen. On a phone the city has its own strip,
    // so wait until nearly all of it, ground line included, has scrolled in. On a
    // desktop the towers already stand above the plot, so a fifth of it is enough.
    const onStart = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || still) return;
        onStart.disconnect();
        // The words are measured with their real font, so wait for it.
        document.fonts.ready.then(() => {
          layout();
          started = true;
          t0 = performance.now() - SWEEP_START;
          sheet.dataset.drawing = "";
          wake();
        });
      },
      { threshold: narrow ? 0.9 : 0.2 },
    );
    onStart.observe(plot);

    const onView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    onView.observe(sheet);

    const onMove = (e: PointerEvent) => {
      const b = sheet.getBoundingClientRect();
      pointerX = e.clientX - b.left;
      pointerY = e.clientY - b.top;
      pointerAt = performance.now();
    };
    const onLeave = () => {
      pointerX = pointerY = -9999;
    };
    if (!still) {
      sheet.addEventListener("pointermove", onMove);
      sheet.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", wake);
    }

    return () => {
      cancelAnimationFrame(frame);
      onResize.disconnect();
      onStart.disconnect();
      onView.disconnect();
      sheet.removeEventListener("pointermove", onMove);
      sheet.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [close]);

  return (
    <>
      <canvas ref={washRef} className="skyline-canvas" aria-hidden="true" />
      <canvas ref={cityRef} className="skyline-canvas" aria-hidden="true" />
      <canvas ref={liveRef} className="skyline-canvas" aria-hidden="true" />
    </>
  );
}
