// Build the film's master clock from the chosen take: words (tags stripped) with FILM times (VO offset applied).
// Usage: node tools/vo-words.mjs <take name in vo/takes, e.g. Voice-2> <offset seconds where the voice starts in the film>
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const [take, offset] = [process.argv[2], +process.argv[3]];
if (!take || !Number.isFinite(offset)) { console.error("usage: node tools/vo-words.mjs <take> <offsetSeconds>"); process.exit(2); }
const a = JSON.parse(fs.readFileSync(path.join(ROOT, "vo/takes", take + ".json"), "utf8"));
const words = []; let cur = null, inTag = false;
a.characters.forEach((c, i) => {
  if (c === "[") { inTag = true; return; } if (c === "]") { inTag = false; return; } if (inTag) return;
  if (/\s/.test(c)) { if (cur) { words.push(cur); cur = null; } return; }
  const s = a.character_start_times_seconds[i] + offset, e = a.character_end_times_seconds[i] + offset;
  if (!cur) cur = { w: c, s, e }; else { cur.w += c; cur.e = e; }
});
if (cur) words.push(cur);
const r = (v) => Math.round(v * 1000) / 1000;
fs.writeFileSync(path.join(ROOT, "vo/final/words.json"), JSON.stringify(words.map((w) => ({ w: w.w, s: r(w.s), e: r(w.e) })), null, 0));
// print lines (split at sentence ends)
let line = [];
for (const w of words) { line.push(w); if (/[.?!]$/.test(w.w)) { console.log(`${line[0].s.toFixed(2).padStart(6)}-${w.e.toFixed(2).padStart(6)}  ${line.map((x) => x.w).join(" ")}`); line = []; } }
console.log(`words: ${words.length} · VO ${words[0].s.toFixed(2)}s to ${words.at(-1).e.toFixed(2)}s (offset ${offset}s)`);
