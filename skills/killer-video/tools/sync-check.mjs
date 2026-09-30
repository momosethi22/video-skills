// Compare transient times near cues: source WAV vs the audio track muxed into the MP4.
import { execFileSync } from "node:child_process";
const pcm = (f) => { const b = execFileSync("ffmpeg", ["-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], { maxBuffer: 1 << 28 }); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };
const onset = (x, t) => { const sr = 48000, w = 48, rms = (a, n) => { let e = 0; for (let i = a; i < a + n; i++) e += x[i] * x[i]; return Math.sqrt(e / n) + 1e-9; };
  for (let i = Math.round((t - 0.03) * sr); i < (t + 0.06) * sr; i += w) if (rms(i, w) > 1.6 * rms(i - 960, 960) && rms(i, w) > 0.004) return i / sr; return NaN; };
const [wav, mp4] = [pcm(process.argv[2]), pcm(process.argv[3])];
let worst = 0;
for (const t of process.argv.slice(4).map(Number)) { const a = onset(wav, t), b = onset(mp4, t), d = (b - a) * 1000; worst = Math.max(worst, Math.abs(d) || 0);
  console.log(`cue ${t.toFixed(3)}  wav ${a.toFixed(4)}  mp4 ${b.toFixed(4)}  delta ${d.toFixed(1)} ms`); }
console.log("worst delta", worst.toFixed(1), "ms");
