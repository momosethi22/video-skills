// Record several full-script takes per voice (ElevenLabs v3, character timestamps).
// Usage: node tools/takes.mjs <script.txt> <outDir> <Name:voiceId> [...more]   (stabilities per take below)
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
// Key: ELEVENLABS_API_KEY from the environment, else from <project>/.env. Never print it.
const KEY = process.env.ELEVENLABS_API_KEY || fs.readFileSync(path.join(ROOT, ".env"), "utf8").match(/ELEVENLABS_API_KEY=(\S+)/)[1];
const STABILITY = [0.5, 0.5, 0.0]; // natural, natural (another performance), creative
const [scriptFile, outDir, ...voices] = process.argv.slice(2);
const TEXT = fs.readFileSync(path.resolve(ROOT, scriptFile), "utf8").replace(/\s*\n\s*/g, " ").trim();
const out = path.resolve(ROOT, outDir);
fs.mkdirSync(out, { recursive: true });
const jobs = voices.flatMap((v) => { const [name, id] = v.split(":"); return STABILITY.map((s, k) => ({ name, id, s, k })); });
await Promise.all(jobs.map(async ({ name, id, s, k }) => {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: TEXT, model_id: "eleven_v3", voice_settings: { stability: s } }),
  });
  const j = await res.json();
  if (!res.ok) { console.log(`${name} take ${k + 1}: ERROR ${res.status} ${JSON.stringify(j.detail || j).slice(0, 160)}`); return; }
  const base = path.join(out, `${name}-${k + 1}`);
  fs.writeFileSync(base + ".mp3", Buffer.from(j.audio_base64, "base64"));
  fs.writeFileSync(base + ".json", JSON.stringify(j.alignment));
  console.log(`${name} take ${k + 1} (stability ${s}): ${j.alignment.character_end_times_seconds.at(-1).toFixed(1)}s`);
}));
