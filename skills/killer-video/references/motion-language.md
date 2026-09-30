# Motion language: MOVING, never stagnant

This is the difference between a killer video and a slideshow, and it holds for every brand and every register. Two client verdicts on films made with this pipeline:
- "It feels MOVING and not stagnant."
- "Just stagnant, screens changing, no moving parts."

## Calibration (measured with `tools/motion-audit.mjs`: share of frames where the picture visibly changes)
| Film | Verdict | Moving | Big moves (>5% of frame) | Median area changing | Longest still | Still stretches >= 0.5 s |
|---|---|---|---|---|---|---|
| Viral launch video (the reference) | killer | **84%** | 32% | 2.0% | 0.97 s | 6 (4 s total) |
| 66 s voice-over story, windows travel and stack | "moving" | 54% | 9% | 0.18% | 4.5 s (end card) | 18 (17 s) |
| 54 s voice-over story, one centered window | "stagnant" | 35% | 5% | 0.06% | 5.7 s (end card) | 22 (23 s) |
| 40 s calm product walkthrough | static | 30% | 4% | 0.05% | 3.0 s | 17 (25 s) |

The reference is almost never still. Its secret is not faster cuts: **the camera never stops.** Run `motion-audit` on each new reference and add it to this table.

## The stagnant signature (never ship this)
- One UI window (or one slide layout), the same size, centered, for a whole act. The camera never moves.
- The next view replaces the last one in place (tab switch, crossfade to another page at the same rect).
- Content fades in where it sits, and numbers change in place: nothing travels.
- Every shot has the same framing; there are no close-ups.
- Still holds while the voice keeps talking; a still first second; a long static end card.

## The eight moves of a moving film
1. **The camera always travels (one continuous world).**
   - Everything lives in one space: a desk, a canvas, a city map, a phone screen, a kitchen counter. The camera pans, pushes and follows the action from region to region.
   - Frame the region of action (crop in 1.3-2.5x), not the whole screen; wide shots only establish.
   - Between purposeful moves the camera keeps drifting at a readable speed (see the camera recipe below).
2. **Things arrive and leave by travelling.**
   - Panels rise or slide from an edge; objects fly from their source (a button, an inbox, a cart, a card reader); chips drop into place; scattered tools converge into one product.
   - Exits travel too. The only thing that may appear in place is text being written (typing, word reveals).
3. **Every screen acts.** Something happens every 0.5-1 s:
   - typing, counting up, filling a progress bar or chart, toggles flipping;
   - rows or cards streaming in, statuses flipping (Pending → Approved), an error popping;
   - dragging a file, the cursor or a finger clicking and tapping.
   A screen that only sits there while the voice talks is dead air.
4. **Persistent protagonists.** The cursor (or finger, or character), plus 1-2 continuity objects that evolve across scenes and carry the eye through transitions. Examples:
   - a goal note that unrolls into a checklist that ticks off;
   - a dock that collects app icons;
   - a clock or calendar that advances;
   - a shopping cart that fills;
   - an avatar that shrinks into a tag and flies into the next screen.
5. **Transitions travel.**
   - Dive through an element (zoom into a button until it fills the frame, emerge in the next scene).
   - Push through, iris open, converge or scatter.
   - Match-cut: the same object carries into the next scene.
   - Fade-through is only for two panels handing off at the same rect, and even then the camera keeps moving.
6. **Scale variety.** Alternate wide (establish), medium (a panel) and close (a button, a number, a face, a product detail at 30-60% of frame height). At least one close-up per act; the reference cuts wide ↔ close constantly.
7. **Depth.**
   - Stack panels (cascade, with the ones behind blurred and dimmed); foreground objects pass over; the background drifts slowly (parallax).
   - Shapes may drift slowly; text may not (see the camera recipe).
8. **The mood travels.** The world changes color and light by act (neutral → tense → low point → reveal light → brand color). The root owns it, so transitions between builders stay seamless. For example: a light iris opening out of a dark low point, rather than a flat fade through grey.

## Registers (from `BRAND.md`). Every register moves continuously.
| Register | Camera and easing | Transitions | Avoid | Sound (see `sound.md`) |
|---|---|---|---|---|
| **Calm-premium** (B2B, finance, health) | drift 30-80 px/s; pushes 0.8-1.5 s, power2/3 in-out | travel, dive-through, iris, converge, match-cut | flashes, shakes, whip pans, glitch, impacts | warm keys and pads, soft UI sounds, -16 LUFS |
| **Energetic** (consumer apps, social ads) | drift 80-200 px/s; snappy expo/back eases | whip pans, speed ramps, hard match cuts; flashes sparingly | long holds, slow fades | punchy beat, bolder effects, -14 to -11 LUFS |
| **Playful** (lifestyle, food, kids) | bouncy (small back or elastic), squash and pop | shape wipes, pops, character-led moves | cold corporate UI | plucks, marimba, whimsical effects |
| **Cinematic** (manifesto, luxury) | slow parallax on image and shape layers; text still or moving ≥ 30 px/s | light sweeps, fades to black at act breaks | busy UI montages | ambient, orchestral, -16 to -18 LUFS |

The text-speed rule below applies to every register.

## Moving ≠ fast (pacing)
A film can move all the time and still feel calm. It also feels "too quick" when ideas arrive faster than the viewer can read them. That verdict came on a film whose pain act showed 13 new screens in about 14 s under a 146 wpm voice.
- **Slow the idea rate, not the motion.** Aim for about one new idea (screen, number, reveal) every 2-3 s. The camera and in-screen action keep the frame alive between ideas.
- **Montage:** rapid-fire lists (under 1.5 s per item) at most once per film and for at most about 6-8 s. Stage it in ONE place the camera travels across, not as a stack of separate screens.
- **Breathing room:** after each act, give one beat (1-1.5 s) for a landing line; the picture keeps drifting.
- **Voice:** about 130-140 wpm, with 2-3 deliberate pauses where the picture takes over. When the story needs more breadth, extend the runtime or cut list items; don't compress.
- Energetic registers can run faster ideas, but still one readable idea at a time.

## Camera recipe (verified 2026-09-30, HyperFrames 0.8.96, 60 fps)
Test project: this skill's `tests/camera-ticking/` (README there explains how to rerun it). Isolated 16 px text and a 2 px bar were panned at different speeds, and the ink centroid was tracked per frame:

| What moves | Speed | Result |
|---|---|---|
| Text (DOM) | 0.2-0.25 px/frame (12-15 px/s) | wobbles: steps jitter 60-75%, some frames step BACKWARDS, some freeze |
| Text (DOM) | 0.5 px/frame (30 px/s) | acceptable: jitter 22%, no backward steps |
| Text (DOM) | 1-2 px/frame (60-120 px/s) | perfectly smooth (jitter 1-2%) |
| Div shape (bar/panel) | any speed, even 0.2 px/frame | perfectly smooth |
| Text drawn to a canvas | 0.2 px/frame | wobbles like text (it snaps too) |
| `will-change: transform`, `force3D:false` | slow | no improvement |

**Rules:**
- Any layer carrying text moves at ≥ 30 px/s in screen space (0.5 px/frame at 60 fps), preferably ≥ 60 px/s, or holds perfectly still.
- Never drift text slowly (5-25 px/s): it reads as "1px ticking".
- Ease tails are fine; they are brief.
- **Pushes (scale):** text near the zoom center moves slowest. Keep pushes brief (0.6-1.5 s, eased) or combine them with a pan so the focus text also moves ≥ 30 px/s.
- **Backgrounds, images, glows and non-text shapes** may drift at any speed.
- The camera "resting" between beats = a steady drift at 30-60 px/s, which still reads as calm (crossing the screen takes 30-60 s).

**Implementation:** `tools/build-root.mjs` has a root camera over all builder layers.
- `cam: [[t, x, y, scale, ease], ...]`: frame-centre point and zoom, a pure function of t.
- `"io"` for purposeful moves, `"lin"` for drifts (an eased drift crawls below the safe speed at both ends).
- Drift speed on screen = world distance × scale ÷ segment time.

**Who owns the camera:**
- The root camera moves the whole stage (pushes, pans, dives between acts).
- Builders own in-scene cameras: a `#cam` container inside their layer, for framing within the act.
- Both follow the speed rule. Captions stay outside the camera, in screen space.

## The beat sheet must force motion
Each beat row in the bible has these columns:

| Column | Content |
|---|---|
| **Time** | film seconds |
| **Words** | the voice-over words it lands on |
| **Shot** | wide, medium or close, on what |
| **Camera** | from → to, and px/s |
| **Travel** | what enters or exits, from where |
| **Action** | the verb (types, counts, fills, flips, drags, streams, taps) |
| **Continuity** | state of the persistent object |
| **Sound** | the sound cue |

A row with no camera, no travel and no action is a stagnant beat: rewrite it before any builder starts.

## QA gate (every draft and the final)
```bash
node tools/motion-audit.mjs renders/draft.mp4 --max-still 1.0 --to <duration minus 1.5>
```
**Targets** (from the calibration table; recalibrate as films are added):
- moving ≥ 70% of the time (aim 80%+);
- big moves ≥ 15%;
- median area changing ≥ 0.5%;
- no still stretch over 1.0 s, except at most 2 deliberate pauses of 1.5 s or less where the voice lands a line;
- motion from frame 0;
- an end-card hold of 2.5 s or less after the last word.

**Reading the result:**
- The per-second strip shows the rhythm. A stagnant film is spikes with gaps; a moving film is a continuous band.
- Fix every `STILL a-b` it lists: add camera drift, travel or action there.

**Caveat:** very soft gradients and glows (under 10 grey levels per frame) don't register. That's fine, because viewers barely see them either.
