---
name: killer-video
description: Brand-agnostic playbook for story-driven videos with voice-over for ANY brand or product, built with HyperFrames (HTML + GSAP rendered to MP4), ElevenLabs (voice, music, sound effects) and parallel builder agents. Use it to make or improve a promo, launch, explainer, product demo, social ad or brand story video, especially one modeled on a reference video. Also use it when a video feels stagnant, static or "just screens changing", too quick, too loud or off-brand, or needs its camera, motion, pacing, sound or delivery fixed. Starts from a brand intake (BRAND.md), so every brand specific lives in the project and never in the method. Prefer it over product-launch-video for voice-over story films.
---

# Killer video

A playbook to copy for any brand. The method below is brand-neutral. Everything specific (register, palette, fonts, voice, copy rules, loudness, format) comes from the project's `BRAND.md` (`templates/BRAND.template.md`).

A film is killer when three things hold. Each stage below has a gate that checks them.
1. **Voice-first story.** The script and voice are the spine, and every visual beat lands on a word. The structure comes from the video type (`references/story-and-voice.md`). Story films use: hook → pain with receipts → turn → pivot → reveal → product beats → twist → payoff that echoes the hook → CTA.
2. **MOVING, never stagnant.** The camera always travels, things arrive by travelling, every screen acts, and persistent objects carry the eye. This is what separated a film a client called "MOVING" from one they called "just stagnant, screens changing". It is measured, not guessed: `tools/motion-audit.mjs`.
3. **On-brand register.** Calm-premium, energetic, playful or cinematic, taken from `BRAND.md`. Every register moves continuously; registers differ in speed, easing, transitions and sound. Stillness is never the register.

## Read before starting
| When | Read |
|---|---|
| Always, before planning any visual | `references/motion-language.md` (the eight moves, registers, camera speed rule, beat-sheet columns, motion gate) |
| Video types, story, script, voice, captions | `references/story-and-voice.md` |
| Music, effects, mix, loudness | `references/sound.md` |
| Bible, root, builders, HyperFrames contract, integration, QA, delivery | `references/build-and-qa.md` |
| HyperFrames API and CLI details | HeyGen's `hyperframes-core`, `hyperframes-cli`, `hyperframes-animation` skills |
| Past films, client verdicts and measurements (examples, not defaults) | your team's film log, if you keep one (for example a shared `PLAYBOOK.md`) |

## Project setup (any brand)
1. **Create the project.** One folder per film: `npm init -y && npm i hyperframes gsap`.
   Copy `node_modules/gsap/dist/{gsap,CustomEase,DrawSVGPlugin,MorphSVGPlugin,MotionPathPlugin,SplitText}.min.js` into `assets/vendor/`.
2. **Brand assets.** Put the brand fonts in `assets/fonts/`, the logo in `assets/brand/`, and product screens (if any) in `assets/ui/`.
3. **Copy this skill's `tools/` into `<project>/tools/`** (paths resolve from the project root):
   - `build-root.mjs`: brand-neutral root generator; fill its CONFIG block;
   - `motion-audit.mjs`, `sync-check.mjs`;
   - voice: `casting.mjs`, `takes.mjs`, `score-takes.mjs`, `voicestats.mjs`, `vo-words.mjs`.
4. **Copy `templates/`:**
   - `BRAND.template.md` → `BRAND.md` (fill it first);
   - `BUILDER_RULES.template.md` → `BUILDER_RULES.md`;
   - `SOUND_BRIEF.template.md` → `SOUND_BRIEF.md`.
5. **ElevenLabs key:** `ELEVENLABS_API_KEY` in the environment, or `<project>/.env`. Never print it or paste it into shared files.

## Stages and gates
0. **Brand intake and reference teardown.** Fill `BRAND.md` with the client. For a reference video:
   - exact-time contact sheets and dense strips;
   - transcript and wpm;
   - loudness and spectrogram;
   - `motion-audit` to set the motion bar.
   Gate: `BRAND.md` is complete (register, format, loudness, copy rules, CTA).
1. **Story and script.** Pick the video type and structure, map every pain to a product fix, show breadth rather than one gag, and lock `SCRIPT.md` plus a TTS version with emotion tags.
   Gate: the client approves the script; about 130-140 wpm when read at pace.
2. **Voice.**
   - Casting page, then 3 takes per finalist.
   - Transcription diff (94% or better) and arc score.
   - Place the take at an offset, then `vo-words.mjs <take> <offset>` → `vo/final/words.json` (the master clock).
   Gate: the client picks the voice, or the arc score picks it automatically.
3. **Bible.** Master clock, slots and seams, world and camera map, visual worlds per act, and the beat sheet with the columns Time · Words · Shot · Camera · Travel · Action · Continuity · Sound. Also the sound cue sheet.
   Gate: no beat row without camera, travel or action. Idea rate about one per 2-3 s; at most one montage (6-8 s or less).
4. **Design system from `BRAND.md`.** Kit (tokens, components, seek-safe motion helpers), 2-3 style frames, and recurring UIs as shared kit components.
   Gate: the style frames look on-brand at full size and at thumbnail size.
5. **Root layer** (director). `tools/build-root.mjs` generates the worlds, the root camera (a pure function of t), captions from `words.json` with punchline hand-breaks, persistent elements, audio, and the builder dev hosts.
6. **Parallel builders.** One agent per act (Opus for hero scenes), each in its own dev host at global time, working from `BUILDER_RULES` and the motion language. Each renders, looks and reports the implemented times of locked moments.
   **Sound agent** in parallel. It needs the locked cue sheet, and follows `SOUND_BRIEF` and `sound.md`.
7. **Integration and QA.**
   - Lint.
   - Seam strips.
   - Caption text dump.
   - 30 fps draft, then the **motion gate**: `node tools/motion-audit.mjs renders/draft.mp4 --max-still 1.0 --to <dur-1.5>`. It must show moving 70% or more, no stray STILL lines, and motion from frame 0.
   - Pacing against the voice.
   - Then the delivery render and QA: frame count, loudness, sync check, and the frames at every slot start.
8. **Delivery and review.**
   - Master plus a web copy, poster, storyboard and README; open the video for the client.
   - Collect timestamped notes and fix one layer or the mix at a time.
   - Log the film (client verdict, motion-audit numbers, what worked) in the team's film log, and fold only brand-neutral lessons back into this skill.

## Numbers that matter (brand-neutral)
| Check | Target | Evidence |
|---|---|---|
| Moving (motion audit) | ≥ 70%, aim 80%+ | killer reference 84%; a film the client called "moving" 54%; films called stagnant 30-35% |
| Longest still (excluding the last 1.5 s) | ≤ 1.0 s, except ≤ 2 deliberate pauses of ≤ 1.5 s | the reference's longest still was 0.97 s |
| Speed of anything carrying text | ≥ 30 px/s (prefer ≥ 60), or perfectly still | slower drifts wobble (measured); shapes are fine at any speed |
| Idea rate | ≈ 1 new idea per 2-3 s | 13 new screens in 14 s read as "too quick" |
| Voice pace | ≈ 130-140 wpm, 2-3 pauses | 146 wpm plus dense visuals read as quick |
| Master loudness | from `BRAND.md`: -14 LUFS default, -16 calm-premium, -11 to -12 energetic social; true peak ≤ -1 dBTP | a calm B2B client found -14 "loud" |
| Music under the voice | 11-13 LU (more in quiet moments) | voice-forward |
| Audio sync in the final MP4 | cues at 0.0 ms | re-mux never shifts the audio |

## Keep the method brand-neutral
- Brand facts, taste and copy rules go in the project's `BRAND.md`, never in this skill.
- A lesson enters this skill only if it holds for any brand, such as the text-speed rule, the motion gate or the seam technique.
- Client-specific preferences stay in that client's `BRAND.md` and in the team's film log.
