// Median pitch (YIN) and speaking pace for each casting take, vs the reference voice.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const DIR = path.resolve(import.meta.dirname, "../casting"), SR = 16000;
function f0median(file, t1 = 999) {
  const b = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-t", String(t1), "-af", "highpass=f=60,lowpass=f=1000", "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4), pts = [];
  for (let s = 0; s + 1100 < x.length; s += 160) {
    let e = 0; for (let i = 0; i < 640; i++) e += x[s + i] ** 2; if (e / 640 < 2e-4) continue;
    let run = 0; const c = new Float64Array(231);
    for (let tau = 1; tau <= 230; tau++) { let acc = 0; for (let i = 0; i < 640; i++) { const q = x[s + i] - x[s + i + tau]; acc += q * q; } run += acc; c[tau] = acc * tau / (run || 1); }
    for (let tau = 40; tau <= 230; tau++) if (c[tau] < 0.1) { while (tau < 230 && c[tau + 1] < c[tau]) tau++; pts.push(SR / tau); break; }
  }
  pts.sort((a, b) => a - b);
  return pts[Math.floor(pts.length / 2)];
}
// Optional: casting/0-Reference.mp3 = the reference video's voice (145 = the measured wpm of the first reference; edit per reference).
const REF = path.join(DIR, "0-Reference.mp3");
const rows = fs.existsSync(REF) ? [["0-Reference", f0median(REF), 145]] : [];
for (const f of fs.readdirSync(DIR).filter((f) => /^\d-.*\.mp3$/.test(f) && !f.startsWith("0-")).sort()) {
  const a = JSON.parse(fs.readFileSync(path.join(DIR, f.replace(".mp3", ".json")), "utf8"));
  const spoken = a.characters.join("").replace(/\[[^\]]*\]/g, " ");
  const words = spoken.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
  const dur = a.character_end_times_seconds.at(-1) - a.character_start_times_seconds[0];
  rows.push([f.replace(".mp3", ""), f0median(path.join(DIR, f)), Math.round(words / (dur / 60))]);
}
for (const [n, f0, wpm] of rows) console.log(`${n.padEnd(12)} median pitch ${String(Math.round(f0)).padStart(3)} Hz · ${wpm} wpm`);
fs.writeFileSync(path.join(DIR, "stats.json"), JSON.stringify(rows));
