// Motion audit: is a video MOVING or STAGNANT? Measures, per frame, how much of the picture changes.
// Usage: node motion-audit.mjs <video.mp4> [--max-still 1.0] [--from 0] [--to END]
// Reports still time, every still stretch, the longest still stretch and a per-second motion strip.
// Exit code 1 when a still stretch exceeds --max-still (use it as a QA gate before delivery).
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const file = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i > 0 ? Number(args[i + 1]) : d; };
if (!file) { console.error("usage: node motion-audit.mjs <video> [--max-still 1.0] [--from s] [--to s]"); process.exit(2); }
const MAX_STILL = opt("--max-still", 1.0), FROM = opt("--from", 0), TO = opt("--to", Infinity);
const W = 192, H = 108, FPS = 30, PX = W * H;
const DIFF = 10;       // a pixel "moved" if its grey level changed by more than this (above codec noise)
const STILL = 0.0015;  // a frame is still if under 0.15% of pixels moved (a blinking caret stays "still")

const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `fps=${FPS},scale=${W}:${H}:flags=area,format=gray`,
  "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
const n = Math.floor(raw.length / PX);
const frac = [];
for (let f = 1; f < n; f++) {
  const a = (f - 1) * PX, b = f * PX; let moved = 0;
  for (let i = 0; i < PX; i++) if (Math.abs(raw[b + i] - raw[a + i]) > DIFF) moved++;
  frac.push(moved / PX);
}
const t0 = (i) => (i + 1) / FPS; // frac[i] = change into frame i+1
const idx = frac.map((_, i) => i).filter((i) => t0(i) >= FROM && t0(i) <= TO);

// Still stretches
const runs = []; let start = -1;
for (const i of [...idx, -1]) {
  const still = i >= 0 && frac[i] < STILL;
  if (still && start < 0) start = i;
  if (!still && start >= 0) { runs.push([t0(start) - 1 / FPS, t0(i >= 0 ? i - 1 : idx.at(-1))]); start = -1; }
}
const long = runs.filter(([a, b]) => b - a >= 0.5);
const stillFrac = idx.filter((i) => frac[i] < STILL).length / idx.length;
const big = idx.filter((i) => frac[i] > 0.05).length / idx.length;
const worst = runs.reduce((m, r) => (r[1] - r[0] > m[1] - m[0] ? r : m), [0, 0]);
const median = [...idx.map((i) => frac[i])].sort((x, y) => x - y)[Math.floor(idx.length / 2)];

// Per-second strip: share of frames in that second that move (the rhythm at a glance)
const blocks = " ▁▂▃▄▅▆▇█", secs = Math.ceil(idx.length / FPS); let strip = "";
for (let s = 0; s < secs; s++) {
  const w = idx.slice(s * FPS, (s + 1) * FPS); if (!w.length) break;
  strip += blocks[Math.round((w.filter((i) => frac[i] >= STILL).length / w.length) * 8)];
}
const f2 = (x) => x.toFixed(2);
console.log(`${file}\n  ${f2(idx.length / FPS)} s analysed at ${FPS} fps`);
console.log(`  moving ${(100 - stillFrac * 100).toFixed(0)}% of the time · big moves (>5% of frame) ${(big * 100).toFixed(0)}% · median area changing ${(median * 100).toFixed(2)}%`);
console.log(`  longest still stretch ${f2(worst[1] - worst[0])} s (${f2(worst[0])}-${f2(worst[1])}) · still stretches >=0.5 s: ${long.length}` +
  (long.length ? ` (${f2(long.reduce((s, [a, b]) => s + b - a, 0))} s total)` : ""));
for (const [a, b] of long.filter(([a, b]) => b - a >= MAX_STILL)) console.log(`    STILL ${f2(a)}-${f2(b)} s (${f2(b - a)} s)`);
console.log(`  motion per second (share of frames moving):\n  |${strip}|`);
process.exit(long.some(([a, b]) => b - a > MAX_STILL) ? 1 : 0);
