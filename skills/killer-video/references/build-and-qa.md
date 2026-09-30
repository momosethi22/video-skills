# Build, integrate, QA, deliver

## Production bible (`<PROJECT>_BIBLE.md`, locked before builders start)
1. **Story and tone:** the register and hard no's, copied from `BRAND.md`.
2. **Master clock:** every line's start and end in film seconds, from `vo/final/words.json`.
3. **Layers and slots:**
   - one sub-composition per act or builder, with `[start, duration, z]`;
   - slots overlap at seams by 0.3-0.5 s;
   - geometry: the format (16:9, 9:16...), the reserved caption band (see "Captions" in `story-and-voice.md`), the world and camera map (see `motion-language.md`).
4. **Visual worlds per act:** palette, light and mood (the root owns them).
5. **Beat sheet with locked moments:** Time · Words · Shot · Camera · Travel · Action · Continuity · Sound. No stagnant rows.
6. **Seam contracts:** what the outgoing layer leaves on screen and what the incoming layer picks up (object style, position, timing).
7. **Sound cue sheet:** time, event, sound, window.

## Root layer (director-owned; `tools/build-root.mjs`, fill its CONFIG block)
- Generates `index.html` plus a dev host per builder from one template, so every builder works on top of the REAL root: background worlds, captions, camera, persistent elements, voice.
- Brand values (font, colors, caption position, emphasis words) come from `BRAND.md`.
- The kit, the plugins and the grain load only if the project has those files.
- Everything procedural is one pure `render(t)` driven by a single timeline tween (seek-safe).
- The root picks `assets/audio/soundtrack.wav` when it exists, otherwise the voice alone.

## Design system (before any builder starts)
- **Kit:** `assets/kit/kit.css` (tokens and components) plus `window.<KIT>` motion helpers: enter, leave, type, caret, stream, count, fill, spin, draw, rng, icon. Every helper is seek-safe.
- **Style frames:** 2-3 stills of the key looks. Builders match the stills; that's how 4-5 parallel builders look like one designer.
- **Shared worlds as kit components:** a UI that recurs across layers (an app frame, a phone, a dashboard) gets a fixed CSS component and on-screen rect. One film: 3 builders, one identical window.
- **From `BRAND.md`:** register, palette tokens, the brand font, logo rules, and real product screens when available.
- **Product UI:** if the client has no screens, recreate UI in the brand's style. It must never show features the product lacks.

## Builders (parallel Opus agents; Sonnet only for tightly specified work)
Each builder gets:
- the bible and the builder rules (from `templates/BUILDER_RULES.template.md`), plus `BRAND.md`;
- the kit, the style frames and earlier films' layers to reuse;
- its own `dev/<agent>/` host;
- global-time authoring: `G0`, `g(t)`;
- a required render-and-look loop, and a final report listing the implemented time of every locked moment.

**Sub-composition contract** (violations fail silently):
1. **Structure:** everything inside `<template>`, root `<div id="root" data-composition-id=...>`, one `gsap.timeline({paused:true})` registered LAST in `window.__timelines[id]`.
2. **Initial state in CSS** (`opacity:0`), and `immediateRender:false` on every tween. `tl.set(..., 0)` and default `from`/`fromTo` break on cold seeks.
3. **Ids:** unique film-wide ids, prefixed per layer. CSS and GSAP selectors are scoped per sub-composition.
4. **Assets:** asset URLs are root-relative (`assets/...`; lint rejects `../`). Each sub-composition needs its own `@font-face`.
5. **Transforms:** never put a CSS transform and a GSAP transform on the same element.
6. **Determinism:**
   - no `Math.random` (use a seeded rng), no Date, rAF, CSS animations or `repeat:-1`;
   - changing text (typing, counters, clocks) comes from a pure function of progress.
7. **Motion:** follow `motion-language.md`:
   - text moves at 30 px/s or faster, or holds;
   - things arrive by travelling;
   - every screen acts;
   - fade-through only for same-rect handoffs (out by t, in from t+0.02).

**Other rules:**
- **RAM and commands:** low RAM, so one Chrome command at a time per agent; render with `-w 2` (`-w 1` inside agents).
- **Snapshot timing:** `snapshot` floors to a 30 fps grid; ask for t+0.02 to see exactly t.

## Integration (director)
1. Copy each finished layer into `compositions/`, then `npx hyperframes lint .`.
2. Check each seam with snapshots, then render the full draft: `npx hyperframes render . -f 30 -q draft -w 2 -o renders/draft.mp4` (66 s took 2.5 min).
3. Review the draft:
   - **Exact-time contact sheets:** `select='not(mod(n\,30))'` with `-vsync vfr`. `fps=1` shows the frame about 0.47 s AFTER each label and makes in-sync captions look early.
   - **Seam strips every 0.2 s:** `select='between(n\,A\,B)*not(mod(n-A\,6))',tile=4x3`.
   - **Captions:** dump them as text and read every chunk.
   - **Motion audit:** `node tools/motion-audit.mjs renders/draft.mp4 --max-still 1.0 --to <dur-1.5>` and fix every STILL.
   - **Pacing:** watch it against the voice.
4. Final render: `npx hyperframes render . -f 60 -q delivery -w 2 -o renders/<Name>.mp4` (66 s took 8 min, 208 MB).
5. Final QA:
   - `ffprobe`: frames = fps × duration;
   - `ebur128`: the target LUFS;
   - `node tools/sync-check.mjs soundtrack.wav final.mp4 <cue times>`: most cues read 0.0 ms. An isolated 10-40 ms reading where an effect overlaps the voice is the detector, not a shift; a real shift moves every cue.
   - the 60 fps frames at each slot start (F-1, F, F+1), plus the first and last frames.

## Delivery
- **Master:** `renders/<Name>.mp4` (1080p60, about 26 Mbps).
- **Share copy:** `ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a copy -movflags +faststart <Name>-web.mp4` (208 MB → 34 MB).
- **Poster:** `-ss <strong moment> -frames:v 1 poster.png`.
- **Storyboard:** a 4x6 exact-time tile.
- **README.md:** layers, commands, sources.
- Open the video for the client, and log lessons in the team's film log.

## Agent budget reference (a 66 s, four-act film)
- Picture: 4 Opus builders in parallel (grind, fallout + turn, app, AI chat + payoff + end card).
- Sound: 1 Opus agent, 71 min and 133 tool calls.
- Director: bible, root, integration and QA.
- Record the builder durations on the next film.
