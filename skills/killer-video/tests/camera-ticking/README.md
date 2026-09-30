# Camera text-jitter test (2026-09-30, HyperFrames 0.8.96, 60 fps)

Question: can a calm, continuous camera move over UI text without the "1px ticking" seen in an earlier film?

- `test.mp4`: 16 px "Verified" and a 2 px bar panned at 12 px/s (+ a 1.00 → 1.03 push). Four variants:
  - GSAP default;
  - `will-change: transform`;
  - pan only;
  - `force3D:false`.

  Every text variant jittered (steps 60-75% noisy, some backwards) and every bar was smooth. That HTML was overwritten by the second test.
- `test2.mp4` / `index.html`: text panned at 0.5, 1 and 2 px/frame, plus text drawn into a canvas at 0.2 px/frame.

  | Target | Jitter |
  |---|---|
  | Text, 0.5 px/frame | 22% (acceptable) |
  | Text, 1 px/frame | 2% |
  | Text, 2 px/frame | 1% |
  | Canvas, 0.2 px/frame | 105% (snaps too) |

Rule (in the `killer-video` skill, references/motion-language.md): text moves at 30 px/s or faster (prefer 60), or holds still.

Rerun: `npx hyperframes render . -f 60 -q delivery -w 2 -o test2.mp4` from a folder with hyperframes installed, then track
the ink centroid of each lane per frame (steady steps = smooth; zero steps then 1 px jumps = ticking).
