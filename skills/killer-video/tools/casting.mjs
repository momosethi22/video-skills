// Casting: each candidate voice reads the same script with ElevenLabs v3 (+ character timestamps).
// Usage: node tools/casting.mjs <script.txt> <outDir> [Name,Name,...]
// Writes <outDir>/<n>-<Name>.mp3 + .json.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
// Key: ELEVENLABS_API_KEY from the environment, else from <project>/.env. Never print it.
const KEY = process.env.ELEVENLABS_API_KEY || fs.readFileSync(path.join(ROOT, ".env"), "utf8").match(/ELEVENLABS_API_KEY=(\S+)/)[1];
const VOICES = [
  ["Jessica", "cgSgspJ2msm6clMCkdW9"], ["Laura", "FGY2WhTYpPnrIDTdsKH5"], ["Sarah", "EXAVITQu4vr4xnSDxMaL"],
  ["Aria", "9BWtsMINqrJLrRacOk9x"], ["Matilda", "XrExE9yKIg1WjnnlVkGX"], ["River", "SAz9YHcvj6GT2YYXdXww"],
  ["Chris", "iP95p4xoKVk53GoZ742B"], ["Liam", "TX3LPaxmHKxFdv7VOQHJ"],
];
const [scriptFile, outDir, pick] = process.argv.slice(2);
const TEXT = fs.readFileSync(path.resolve(ROOT, scriptFile), "utf8").replace(/\s*\n\s*/g, " ").trim();
const out = path.resolve(ROOT, outDir);
fs.mkdirSync(out, { recursive: true });
const only = pick ? pick.split(",") : VOICES.map((v) => v[0]);
await Promise.all(VOICES.map(async ([name, id], i) => {
  if (!only.includes(name)) return;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: TEXT, model_id: "eleven_v3", voice_settings: { stability: 0.5 } }),
  });
  const j = await res.json();
  if (!res.ok) { console.log(`${name}: ERROR ${res.status} ${JSON.stringify(j.detail || j).slice(0, 160)}`); return; }
  const base = path.join(out, `${only.indexOf(name) + 1}-${name}`);
  fs.writeFileSync(base + ".mp3", Buffer.from(j.audio_base64, "base64"));
  fs.writeFileSync(base + ".json", JSON.stringify(j.alignment));
  console.log(`${name}: ok, ${j.alignment.character_end_times_seconds.at(-1).toFixed(1)}s`);
}));
