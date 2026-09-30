# video-skills

Claude Code skills for making brand videos. Current skill:

- **killer-video**: a brand-agnostic playbook for story-driven voice-over videos (promos, launches, explainers, demos, social ads) for any brand.
  - Covers brand intake, script, ElevenLabs voice, motion language (a measured "moving, never stagnant" gate), sound design, QA and delivery.
  - Built on HyperFrames (HTML + GSAP rendered to MP4).
  - Details: [`skills/killer-video/README.md`](skills/killer-video/README.md).

## Install (Claude Code)
**As a plugin (recommended; updates with one command).** In a terminal:
```bash
claude plugin marketplace add momosethi22/video-skills
claude plugin install video-skills@video-skills
```
Inside Claude Code, the same thing is `/plugin marketplace add momosethi22/video-skills`, then `/plugin install video-skills@video-skills`.

The repo is public, so no GitHub access or sign-in is needed.

**Get updates:**
```bash
claude plugin marketplace update video-skills
claude plugin update video-skills@video-skills
```

**Manual alternative:** copy `skills/killer-video` into `~/.claude/skills/` (Windows: `%USERPROFILE%\.claude\skills\`).

## Use
Ask Claude Code, for example:
> Use the killer-video skill to make a 60 s voice-over video for <brand>. Here's the website and a reference video I like: <...>

Installed as a plugin, the skill is listed as `video-skills:killer-video`.

Prerequisites (Node 20.11+, ffmpeg, HyperFrames, your own ElevenLabs key) are in the skill's README.

## Maintainers
1. Edit the skill in your local `~/.claude/skills/killer-video`, which is the source of truth.
2. Run `./publish.ps1`. It mirrors the skill into `skills/`, validates the plugin, and rebuilds the share zip on your Desktop.
3. Bump `version` in `.claude-plugin/plugin.json`, then commit and push.

Keep the skill brand-neutral: brand facts belong in each video project's `BRAND.md`, never in the skill.
