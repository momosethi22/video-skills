# Story, script and voice

## Pick the video type first (from `BRAND.md`)
| Type | Length | Structure | Voice |
|---|---|---|---|
| **Story (problem → solution)** | 45-90 s | the story engine below | first person, emotional arc |
| **Product demo / walkthrough** | 30-90 s | promise → 3-5 "watch it do X" beats in one continuous UI world → result → CTA | calm guide, second person |
| **Feature launch** | 20-45 s | old way (one beat) → "Now: X" → 2-3 proof beats → CTA | confident, brisk |
| **Explainer** | 60-120 s | question → why it's hard → how it works in 3 steps → what it means for you → CTA | warm teacher |
| **Social ad (9:16)** | 15-30 s | hook in the first 1.5 s → one pain → one reveal → CTA; captions carry it with the sound off | energetic, very short lines |
| **Brand manifesto** | 45-90 s | belief → the world today → what we do about it → who it's for → tagline | cinematic, slower |
| **Testimonial / case study** | 45-90 s | customer before → turning point → after, with numbers → CTA | the customer (or a voice reading their words) |

Every type follows the motion language: all of them MOVE.

## Story engine (for story films; adapt the beats for the other types)
1. **Hook.** In-medias-res first person, mid-task: "[a small, relatable goal], how hard can it be?" Examples:
   - "Monday. Forty tickets in the queue before coffee."
   - "Payday. Rent's paid, and I'm already short."
   - "Just one more bug before the launch."
2. **Pain with on-screen receipts.** Say the general, show the specific: a concrete alert, counter, messy spreadsheet or empty calendar. The receipt on screen is never read aloud. Use 3-5 escalating receipts.
3. **Turn or reframe** at the low point: dark world, big hero text. "[What I wanted.] Not [what I got stuck doing]."
4. **Pivot line.** "Then I found [Product]." or "So we built [Product]."
5. **Reveal, then the product in crisp beats**, each one answering a specific pain from step 2 (breadth of the product, not one gag).
6. **Twist or upgrade.** The thing the viewer didn't expect ("And the wild part? [It does X for me].").
7. **Payoff that echoes the hook**, then a CTA. The hook's goal comes back as achieved (the same email, now answered; the same calendar, now full).

Don't copy a reference's argument. Map its engine onto this brand's truth (from `BRAND.md`). Agree the angle with the client first; clients push back on stories that show only one small feature.

## Writing for the ear
- Fragments, not sentences. Lists of 2-4 word beats.
- About 130-140 wpm for story films (146 wpm plus dense visuals read as "too quick"). Fast on lists, slow on landings.
- 2-3 deliberate pauses where the picture carries the story.
- Apply the copy rules from `BRAND.md` (banned words and punctuation, spelling, product naming).
- Deliver `SCRIPT.md` (clean) plus a TTS version with emotion tags, for example `[exasperated, rapid-fire]`, `[sighs]`, `[quietly]`, `[warm]`, `[happy]`.

## Voice (ElevenLabs)
- **Model:** `POST /v1/text-to-speech/{voice_id}/with-timestamps` with `model_id: "eleven_v3"`. It returns `audio_base64` plus character alignment.
  - v3 ignores `voice_settings.speed`. Control pace with the text (punctuation, line breaks, tags) or time-stretch afterwards with ffmpeg `rubberband`.
- **Casting** (`tools/casting.mjs <script.txt> casting/ [Names]`):
  - 6-8 voices matching `BRAND.md` (gender, age, accent, character) read the same emotional arc.
  - Add the reference voice as `casting/0-Reference.mp3` for A/B.
  - Build a small HTML listening page and let the client pick; `tools/voicestats.mjs` shows pitch and pace.
  - If there is no client round, cast automatically: 3 voices x 3 takes, then score.
- **Premade voice ids** (edit the list in `casting.mjs` per brand):

  | Voice | Id |
  |---|---|
  | Laura (warm female, strongest arcs so far) | `FGY2WhTYpPnrIDTdsKH5` |
  | Matilda | `XrExE9yKIg1WjnnlVkGX` |
  | Jessica | `cgSgspJ2msm6clMCkdW9` |
  | Sarah | `EXAVITQu4vr4xnSDxMaL` |
  | Aria | `9BWtsMINqrJLrRacOk9x` |
  | River | `SAz9YHcvj6GT2YYXdXww` |
  | Chris | `iP95p4xoKVk53GoZ742B` |
  | Liam | `TX3LPaxmHKxFdv7VOQHJ` |

  A key without `voices_read` cannot list voices; with it, search the library for accents and characters.
- **Takes** (`tools/takes.mjs <script.txt> vo/takes Name:voiceId ...`): 3 per finalist, at stability 0.5, 0.5 and 0.0 (natural, natural, creative).
- **QA:** transcribe every take and diff it against the script. Aim for at least 94% word match; normalizations like "twenty"/"20" are benign.
  - ElevenLabs `POST /v1/speech-to-text` (`model_id: scribe_v1`, multipart `file`) is the fastest.
  - Alternative: `npx hyperframes transcribe take.wav --engine parakeet --json`. It writes `transcript.json` next to the input, so never redirect stdout onto that name.
- **Score** (`tools/score-takes.mjs`, sections from `vo/marks.json`: `[["hook", "first words"], ..., ["turn", "..."], ["twist", "..."]]`):
  - energy and pitch per act;
  - pick the take with the strongest arc: a deflated low point, then a lift into the twist (the best take so far: 165 Hz at the low point, then +4 dB into the twist);
  - check the length against the plan.
- **Master clock:**
  - Place the voice at an offset (for example +0.8 s). `tools/vo-words.mjs <take> <offset>` writes `vo/final/words.json` ({w, s, e} in film seconds) and prints each line with its times.
  - Everything is timed from `words.json`: bible, captions, beats, sound cues.
- **Alignment quirk:** a v3 character timestamp can run early (one word measured 0.26 s late in the audio). For a hit that must be exact, verify the onset in the audio.

## Captions
- Kinetic captions in 2-4 word chunks, revealed word by word; break at commas.
- Hero lines (big, stacked) only at the turn.
- Emphasis color on 3-5 words: pain words in the alert color, brand and solution words in the brand accent (`captions.emphasis` in `build-root.mjs`).
- Dump every chunk as text and read it before rendering. Hand-break punchlines so they stay whole (`captions.split`). For example "The invoice / pays itself." instead of "The invoice pays / itself.".
- **Position by format:**
  - 16:9: a reserved band at the top (y 0-118 at 1080p) or the lower third.
  - 9:16: centred around 55-65% of the height, clear of platform UI (top 10%, bottom 20%).
  - No builder draws in the caption band.
- **Sound-off platforms** (social feeds): captions carry the whole story, so every beat's meaning must be readable in them.
