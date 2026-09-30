# killer-video: a Claude Code skill for story-driven brand videos

A brand-agnostic playbook Claude follows to make voice-over story videos (promos, launches, explainers, demos, social ads) for any brand:
- **Script and voice:** ElevenLabs voices, with a casting and take-scoring pipeline.
- **Animation:** HTML + GSAP, rendered to MP4 with HyperFrames.
- **Build:** parallel builder agents.
- **Sound:** ElevenLabs music and effects with a measured mix.
- **QA:** gates for motion ("moving, never stagnant"), loudness and sync.

## Install
Copy this `killer-video` folder to either:
- **Personal (all your projects):** `~/.claude/skills/killer-video/`. On Windows: `%USERPROFILE%\.claude\skills\killer-video\`.
- **One project (shared through that repo):** `<project>/.claude/skills/killer-video/`.

Claude Code picks it up automatically. Check with `/skills`, or just ask for a video.

## Prerequisites
- **Claude Code.** The skill runs local tools, so it isn't meant for chat-only apps.
- **Node.js 20.11+** and **ffmpeg / ffprobe** on your PATH.
- **HyperFrames**, per video project: `npm init -y && npm i hyperframes gsap`. The first render sets up its headless Chrome.
- **Your own ElevenLabs API key**, with text-to-speech, music and sound-effects access (plus speech-to-text and voices read if possible). Set `ELEVENLABS_API_KEY` in your environment or in the project's `.env`. Never commit it.
- **Optional:** HeyGen's HyperFrames reference skills, `npx hyperframes skills`.
- **Rough cost:** a 66 s film took about 2.5 min for a 30 fps draft and about 8 min for the 60 fps delivery render (2 workers). The sound agent took about 70 min.

## Quick start
Ask Claude Code something like:
> Use the killer-video skill to make a 60 s voice-over story video for <brand>. Here is the brand info / website / a reference video I like: <...>

Claude starts with the brand intake (`templates/BRAND.template.md` → `BRAND.md`), then script, voice, bible, build, sound, QA and delivery. It stops for your approval at the script and the voice.

## What's inside
| Path | What |
|---|---|
| `SKILL.md` | the method: stages, gates, key numbers |
| `references/motion-language.md` | how to make video MOVE: the eight moves, registers, camera speed rule, motion gate |
| `references/story-and-voice.md` | video types, story engine, script, ElevenLabs voice pipeline, captions |
| `references/sound.md` | music, sound effects, mix and loudness by register |
| `references/build-and-qa.md` | production bible, root layer, builder contract, integration, QA, delivery |
| `templates/` | `BRAND`, `BUILDER_RULES` and `SOUND_BRIEF` templates |
| `tools/` | copied into each video project:<br>• `build-root.mjs`: root and dev-host generator (fill its CONFIG)<br>• `motion-audit.mjs`: stagnation checker<br>• `sync-check.mjs`<br>• voice tools: `casting.mjs`, `takes.mjs`, `score-takes.mjs`, `voicestats.mjs`, `vo-words.mjs` |
| `tests/camera-ticking/` | the experiment behind the "text moves at 30 px/s or faster, or holds" rule |

## Improving it
- Brand details never go into the skill; they live in each project's `BRAND.md`.
- When a film teaches something that holds for any brand (a technique, a gate, a gotcha), add it to the matching reference file and share the updated folder.
- Keep client verdicts and motion-audit numbers in a team film log. They calibrate the targets.
