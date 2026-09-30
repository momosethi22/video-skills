# Sound: music, effects, mix

The direction comes from `BRAND.md` (register, music taste, sound-effect density, loudness). Whatever the register, the voice is the star and the music follows the story's arc.

| Register | Music | Effects |
|---|---|---|
| **Calm-premium** | warm keys, pads, light percussion; think an Apple or top-SaaS launch film | soft UI clicks and ticks, gentle chimes; never impacts, sub drops, glitches, risers or whooshes on every cut |
| **Energetic** | punchy beat, bass, drops allowed on the reveal | bolder whooshes, hits on cuts, speed-ramp swooshes; still under the voice |
| **Playful** | plucks, marimba, ukulele, claps | pops, boings, cartoon-light foley |
| **Cinematic** | ambient beds, strings or piano, big dynamic range | sparse, textural (air, light, room tone) |

Lesson from a B2B client: a "trailer" treatment (impacts, flashes of sound on every cut, a loud master) read as over the top. Match the register, not the reference's volume.

## Music (ElevenLabs `POST /v1/music`, instrumental)
- **Sections follow the story acts:**
  - hook: light and curious;
  - grind: busier, not louder;
  - fallout: deflating, the rhythm falls apart;
  - turn: almost nothing (pad or single piano notes);
  - reveal: hopeful lift exactly on the pivot word;
  - twist: brighter groove;
  - payoff and end card: warm, resolving on a final chord, then ringing out to silence.
- **Single-pass generations ignore the arc.** Six 66 s tries with `composition_plan` sections all kept the groove through the quiet turn and never lifted at the reveal.
  - Generate the pain half and the product half separately, in compatible keys (D minor pad → D major), and join them on the reveal downbeat.
  - Edit on bar lines: 60 ms equal-power crossfades ending 3 ms before the downbeat, on the same chord or a V-I step.
- **Candidates:** generate 10-17 per part and pick by measured energy per section and onset timing. Pick the calmer candidate even if another is "bigger". Account limit: 2 concurrent music requests.
- **A built turn:** a frozen chord of the track itself makes a clean dark turn.
- **Bass build:** the bass may build across the film (the reference +13 dB; one of our films +15 dB below 120 Hz into the twist groove). Flag it to the client as an adjustable setting.

## Sound effects (`POST /v1/sound-generation`: `text`, `duration_seconds` >= 0.5, `prompt_influence`)
- **One family:**
  - Use one prompt suffix on every effect: `clean, soft and dry, modern premium app sound design, close and high quality, no music, no reverb`.
  - Generate 4 takes per prompt and keep the best.
  - One processing chain (high-pass 150 Hz, low-pass 14 kHz, edge fades) and one shared room.
- **Two worlds:**
  - **Pain:** dry and mechanical (clicks, clock ticks, toggles, typing, one soft two-note "uh-oh" for every error, a calm warning).
  - **Product:** tonal and tuned to the score's key. A soft tick climbs the pentatonic scale on each success wave; notification pings step up one scale; chime, connect tone and logo shimmer are all in key. The effects then read as part of the music.
  - The two worlds come from the story (before and after). Adapt the palette to the brand's register.
- **Prompt traps:**
  - "whoosh", "error" and "downward" come back as booms or hums. Say `mostly high frequencies, thin, no bass, no rumble, no impact`.
  - A downward swell = an airy take pitched down through a closing low-pass.
- **Density:** every cue sits on a visual hit. Skip cues that clutter.
  - The reference used about 8 in 68 s; one of our films used 120 tiny, quiet events. Set the density from `BRAND.md`.
  - Effects sit 16-20 LU under the voice; their peaks are 16-22 dB below the voice peaks.

## Mix and master
- **Voice:** high-pass 80 Hz, 3:1 peak compression above -14 dBFS (1 ms attack, 60 ms release) and a light de-esser. Keep the performance's arc; an RMS compressor flattened the turn.
- **Music ducking from the processed voice:**
  - detect speech above -45 dBFS;
  - bridge pauses up to 450 ms (no pumping);
  - 100 ms look-ahead, 40 ms attack, 250 ms release;
  - duck 8-11 dB, landing the music 11-13 LU under the voice (about 18 LU in the quiet turn).
- **Master target** (from `BRAND.md`):

  | Where it plays / register | Integrated loudness |
  |---|---|
  | Default (web, YouTube, LinkedIn: platforms normalize to about -14) | **-14 LUFS** |
  | Calm-premium brand film | -16 LUFS (a calm B2B client found -14 "loud") |
  | Cinematic | -16 to -18 LUFS |
  | Energetic social feed (no normalization, competes with loud posts) | -11 to -12 LUFS |

  Other specs:
  - true peak <= -1 dBTP;
  - exact film length;
  - 48 kHz stereo 16-bit;
  - silent last 20 ms.
  - Put the target in one `TARGET_LUFS` constant, so a re-master is a 15 s rebuild.
- **Build gate** (the sound build script ends with a pass/fail check):
  - length, LUFS +-0.1, true peak, no clipping, silent ending;
  - every cue within +-10 ms, measured on the residual (the mix minus the voice and music stems) by attack-envelope cross-correlation. Plain waveform correlation locks whole pitch periods off.
  - a negative test: shift the effects 5 ms and confirm the checker reads 5 ms.
- **Director check:** per-section stem loudness (`ffmpeg -ss A -t D -i stem.wav -af ebur128`) and low-end energy (`lowpass=f=120,lowpass=f=120,astats`). Also look at the waveform and spectrogram PNGs.

## Running the sound agent
- One Opus agent after the bible's cue sheet is locked, in parallel with the picture builders. A 66 s film took about 70 min and 133 tool calls (32 music candidates, 124 effect takes).
- **Deliverables:**
  - `assets/audio/soundtrack.wav`;
  - `audio-src/` holding `sources/` (chosen generations), `stems/` (voice, music, effects), a deterministic offline `build.mjs`, `build-report.json`, waveform and spectrogram PNGs.
- Subagents cannot write report `.md` files, so the numbers live in `build-report.json` and the report arrives in the agent's final message.
- **Credentials:** never print the key.
  - Tools read `ELEVENLABS_API_KEY` from the environment first, then `<project>/.env`.
  - If auto mode blocks writing the key into a project `.env`, the director generates the sources and the agent selects, places and mixes offline.
- **Re-mux without re-rendering the picture:**
  `ffmpeg -i video.mp4 -i soundtrack.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out.mp4`
