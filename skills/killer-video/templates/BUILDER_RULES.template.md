# Builder rules (technical contract) — "<FILM TITLE>"   (template: fill every <...>)

ROOT = `<project folder>`. Read `ROOT/<BIBLE>.md` first (locked story, master clock, beat sheet,
seams, geometry, camera map, the register's hard no's), then `SCRIPT.md` and `BRAND.md`, then the
skill's `references/motion-language.md` (the film must MOVE; stagnant beats are rejected).

## Workspace
- You own ONLY `ROOT/dev/<your-agent>/compositions/<your file>.html`. Do not edit anything else
  (not ROOT/index.html, assets, kit, tools, other agents' folders).
- `ROOT/dev/<your-agent>/index.html` plays your layer at its REAL global time (0-<DUR> s) on top of the
  REAL root: background worlds, kinetic captions and the voice-over. Regenerated only by the director.
- Scratch files only in `ROOT/dev/<your-agent>/scratch/`.
- Reuse freely: `ROOT/reuse/` holds earlier films' finished layers and style frames (list them here:
  <layers>). Copy markup,
  CSS and motion patterns from them (re-prefix ids to your layer).

## File contract (HyperFrames sub-composition) — violations fail silently
1. Everything (style, markup, script) stays INSIDE `<template>`.
2. Root: `<div id="root" data-composition-id="<id>" data-width="<W>" data-height="<H>">`, styled only
   as `#root { position:absolute; inset:0; ... }`. Never style the root by class; no px size on it.
3. One `gsap.timeline({ paused: true })`, registered LAST: `window.__timelines["<id>"] = tl;`.
4. **Author in GLOBAL seconds** with the skeleton's `G0`/`g()`: `tl.to(el, {...}, g(21.02))`.
   Nothing outside your slot (bible section 3).
5. **Initial state lives in CSS** (`opacity:0` on anything that appears later). Every tween uses
   `immediateRender: false` (the kit helpers do). NEVER `tl.set(..., 0)` or default
   `from`/`fromTo` for initial state (render workers jump straight to frames).
6. Chained tweens on one property: each `fromTo` starts exactly where the previous ended; no overlap.
7. Never put a CSS `transform` on an element GSAP also transforms.
8. Determinism: no `Math.random` (use `<KIT>.rng(seed)`), no Date/performance.now, no rAF, no CSS
   animation/transition/@keyframes, no `repeat: -1`, no network. Changing text (typing, counters,
   clocks) is written in an `onUpdate` that is a pure function of progress (the kit helpers do this).
9. Unique ids across the film: prefix every id and class with your layer prefix (<prefixes>).
10. Keep the skeleton's `@font-face` block. Asset URLs are root-relative (`assets/...`, never `../`).
    The kit CSS (`assets/kit/kit.css`) and `window.<KIT>` are loaded globally by the host.
11. Icons: `<KIT>.icon(name, size, stroke)` or your own inline SVG. Brand mark:
    `<brand mark path and its named parts>`.
12. Plugins available: CustomEase, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, SplitText.
13. **The caption band <e.g. y 0-118 at 1080p, or 55-65% height in 9:16> stays clear** (the root draws
    captions there). No text smaller than <16px at 1080p; scale for other formats>.

## Motion (the film must MOVE: see the skill's references/motion-language.md)
- Your scene sits at its place in the world; the root camera travels to it. Inside your slot, something
  acts every 0.5-1 s (types, counts, fills, flips, streams, drags, clicks). No dead air while the voice talks.
- Things arrive and leave by TRAVELLING (rise, slide, fly from their source), never by fading in place;
  only text being written appears in place.
- Text speed rule (measured): any layer carrying text moves at >= 30 px/s on screen (prefer >= 60) or
  holds perfectly still. Slow text drifts (5-25 px/s) wobble. Shapes and backgrounds may drift slowly.
- Use close-ups: at least one element (a button, a number, a chip) shown large, not only whole windows.

## Lessons from earlier films (do not repeat these mistakes)
- When two windows hand off at the SAME rect, use a fade-through (outgoing gone by t, incoming from
  t+0.02), never an overlap of two dense UIs. Everywhere else, prefer travel transitions.
- Reuse one component style for repeated UI elements (status capsules, badges, tool rows).
- `snapshot` floors to a 30 fps grid: ask for t+0.02 to see the state at exactly t.

## Verify loop (from ROOT; one Chrome command at a time, the machine is low on RAM)
```bash
cd "<project folder>"
npx hyperframes lint dev/<your-agent>
npx hyperframes snapshot dev/<your-agent> --at 21.04,23.7,26.6 --no-end   # GLOBAL times
npx hyperframes check dev/<your-agent>
npx hyperframes render dev/<your-agent> -q draft -f 30 -w 1 -o dev/<your-agent>/scratch/check.mp4
```
- LOOK at your frames (Read tool). Check every locked moment, the first/last frames of your slot, and
  a frame just before each state change. Check captions (top band) never collide with your content.
- The draft render includes the voice-over: pull frames at the exact word times from
  `vo/final/words.json` and confirm each visual beat lands on its words.
- Be a demanding art director: composition, spacing, hierarchy, typography, rhythm, restraint.

## Deliverable + report
Final file in `dev/<your-agent>/compositions/`. Final message to the director (short): what you built,
the implemented time of every locked moment, deviations and why, the path of your final contact sheet.
