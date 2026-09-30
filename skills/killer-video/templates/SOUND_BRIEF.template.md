# Sound brief: music, sound design and final mix ("<FILM TITLE>", <DUR> s)   (template: fill every <...>)

ROOT = `<project folder>`. First read `<BIBLE>.md` (story, master clock, beat sheet, sound cue sheet) and
`SCRIPT.md`, then the skill's `references/sound.md`, which holds the proven approach and its traps.

## Inputs
- Voice-over: `vo/final/vo.wav` (48 kHz stereo, <DUR> s, voice already placed at +<offset> s).
- Word times: `vo/final/words.json` ({w, s, e} in film seconds).
- ElevenLabs key: `ELEVENLABS_API_KEY` in the environment or `ROOT/.env`. Never print, log or copy it.
  - It can do text-to-speech, sound effects (`POST /v1/sound-generation`) and music (`POST /v1/music`).
  - Check the current API docs for parameters.
  - Credits are not a concern: generate several candidates and pick by analysis.
  - If the director has pre-generated the sources, work offline from `audio-src/sources/`.

## Client direction (copy from BRAND.md)
- **Register:** <calm-premium | energetic | playful | cinematic>; see the register table in `sound.md`.
- **Music taste:** <genres, reference tracks>
- **Sound-effect density:** <sparse | moderate | rich>
- **Hard no's:** <for example trailer impacts, sub drops, glitches, risers, "bomb" transitions>
- **Always:** voice-forward, with effects that make the picture feel real and never mask a word.

## Music (one continuous instrumental; sections follow the acts)
| Time | Section | Feel |
|---|---|---|
| <a-b> | Hook | light, curious |
| <a-b> | Pain / grind | busier, not louder |
| <a-b> | Fallout | deflating, rhythm falls apart |
| <a-b> | Turn | almost nothing, space for the voice |
| <a-b> | Reveal | hopeful lift exactly on "<pivot word>" at <t> |
| <a-b> | Twist | brighter groove |
| <a-b> | Payoff + end card | warm, resolving; final chord near <t>, silence by <DUR> |

Expect to generate the two halves separately and join them on the reveal downbeat (see `sound.md`).

## Sound effects
Every cue in the bible's cue sheet, placed sample-accurately by the transient.
- One family (a shared prompt suffix and processing).
- The pain world is dry and mechanical; the product world is tonal and in the score's key.
- Under the voice, never masking a word.

## Mix and master
- **Voice:** light cleanup (80 Hz high-pass, gentle peak compression, de-ess if needed).
- **Music:** ducked smoothly from the voice, landing 11-13 LU under it and breathing in the pauses.
- **Master:** `TARGET_LUFS = <from BRAND.md: -14 default | -16 calm-premium | -11 to -12 energetic social>` integrated, true peak <= -1.0 dBTP, no clipping.
- **Format:** exactly <DUR> s, 48 kHz stereo 16-bit, ending in silence.

## Deliverables
1. `ROOT/assets/audio/soundtrack.wav`.
2. `ROOT/audio-src/stems/`: `vo.wav`, `music.wav` and `sfx.wav` (same length and format).
3. `ROOT/audio-src/sources/` (the chosen generations) and a deterministic offline `build.mjs` that rebuilds the mix. It must end with a pass/fail gate:
   - length, LUFS +-0.1, true peak, clipping, silent end;
   - every cue within +-10 ms, measured in the delivered file;
   - a negative test for the checker.
4. `ROOT/audio-src/build-report.json` holding every number, plus `waveform.png` and `spectrogram.png`. Look at the images and fix anything suspicious.
5. Your final message is the report: the chosen music and why, the effect list, loudness, cue verification, deviations. Subagents cannot write report `.md` files.

Only create or modify files under `ROOT/audio-src/` and `ROOT/assets/audio/`. No git.
