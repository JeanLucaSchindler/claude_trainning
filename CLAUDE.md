# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a training workspace. Individual projects live under `ClaudeCode101/`. Currently it contains one app:

- `ClaudeCode101/dino_run/` — a Chrome-dino-style browser game served by a minimal Flask app.

There is no repo-level build, test, or dependency tooling. Each project is self-contained — `cd` into the project directory before running its commands.

## dino_run

### Commands

Run from `ClaudeCode101/dino_run/`:

```bash
pip install -r requirements.txt   # installs Flask
python app.py                     # serves on http://localhost:5000 (debug=True)
```

There is no test suite, linter, or build step.

### Architecture

Flask serves a single page; **all game logic is client-side** in `static/game.js`. The server (`app.py`) only renders `templates/index.html` at `/` — there is no API, no state, and no persistence on the backend.

`static/game.js` is a vanilla-JS IIFE (`"use strict"`) driven by `requestAnimationFrame`:

- **State machine:** `running` → `gameover` / `won`.
- **Physics:** delta-time integration; the dino is a bottom-anchored rectangle that jumps only when grounded.
- **Win/lose:** AABB collision ends the game; surviving `WIN_TIME` (180 s) wins.
- **Replay:** wired via `data-action="replay"` buttons in the two overlay `<div>`s (`#overlay-gameover`, `#overlay-win`) in `index.html`. `reset()` cancels any prior animation frame so replays never stack loops.

Gameplay is tuned by named constants at the top of `game.js` (`WIN_TIME`, `GRAVITY`, `JUMP_VELOCITY`, `BASE_SPEED`, `SPEED_RAMP`, `MIN_SPAWN_MS`, `SPAWN_RANGE_MS`). To verify the **You Win!** screen without waiting 3 minutes, temporarily lower `WIN_TIME`, then restore it.

Everything on screen is drawn as canvas shapes — there are no image assets and no frontend build step.

### Known limitations

The README documents three unfixed issues from a prior code review: obstacle speed never caps (can cause collision tunneling since `dt` is clamped to 0.05 s), the survival timer follows frame time rather than wall-clock, and collision uses the full bounding box. See `ClaudeCode101/dino_run/README.md` for details before touching physics or collision.
