// Score VO takes: section timings from the alignment, energy + pitch per section (emotional arc), pauses.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
// Sections come from <project>/vo/marks.json: [["hook", "first words of the hook"], ..., ["turn", "..."], ["twist", "..."], ...]
// (each phrase must appear verbatim in the TTS text). The arc score compares the "turn" (low point) with the "twist" (high point).
const DIR = path.resolve(import.meta.dirname, "../vo/takes"), SR = 16000;
const MARKS = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../vo/marks.json"), "utf8"));
function pcm(f) { const b = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 28 }); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }
function stats(x, t0, t1) {
  let e = 0, n = 0; const f0 = [];
  for (let s = Math.round(t0 * SR); s + 1100 < Math.min(x.length, t1 * SR); s += 160) {
    let fe = 0; for (let i = 0; i < 640; i++) fe += x[s + i] ** 2; e += fe; n += 640;
    if (fe / 640 < 2e-4) continue;
    let run = 0; const c = new Float64Array(231);
    for (let tau = 1; tau <= 230; tau++) { let acc = 0; for (let i = 0; i < 640; i++) { const q = x[s + i] - x[s + i + tau]; acc += q * q; } run += acc; c[tau] = acc * tau / (run || 1); }
    for (let tau = 40; tau <= 230; tau++) if (c[tau] < 0.1) { while (tau < 230 && c[tau + 1] < c[tau]) tau++; f0.push(SR / tau); break; }
  }
  f0.sort((a, b) => a - b);
  return { db: 10 * Math.log10(e / Math.max(1, n) + 1e-12), f0: f0[Math.floor(f0.length / 2)] || 0 };
}
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".mp3")).sort()) {
  const a = JSON.parse(fs.readFileSync(path.join(DIR, f.replace(".mp3", ".json")), "utf8"));
  const text = a.characters.join("");
  const t = MARKS.map(([k, s]) => [k, a.character_start_times_seconds[text.indexOf(s)]]);
  const end = a.character_end_times_seconds.at(-1);
  const x = pcm(path.join(DIR, f));
  const sec = t.map(([k, s], i) => [k, s, i + 1 < t.length ? t[i + 1][1] : end]).map(([k, s, e]) => ({ k, s, e, ...stats(x, s, e) }));
  const get = (k) => sec.find((q) => q.k === k);
  const arc = (get("twist").db - get("turn").db).toFixed(1), lift = (get("twist").f0 - get("turn").f0).toFixed(0);
  console.log(`${f.replace(".mp3", "").padEnd(10)} ${end.toFixed(1)}s | turn->twist energy +${arc} dB, pitch ${lift >= 0 ? "+" : ""}${lift} Hz | ` +
    sec.map((q) => `${q.k} ${q.s.toFixed(1)}s ${q.db.toFixed(0)}dB/${Math.round(q.f0)}Hz`).join(" · "));
}
