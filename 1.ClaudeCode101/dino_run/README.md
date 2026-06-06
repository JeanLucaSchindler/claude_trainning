# 🦖 Dino Run

A nice browser-based "dinosaur runner" game (Chrome-dino style) served by a small
Flask web server. An auto-running dino must jump over obstacles. Survive
**3 minutes** to win; hit an obstacle and it's game over.

---

## Quick start

From this folder (`ClaudeCode101/dino_run/`):

```bash
pip install -r requirements.txt   # installs Flask
python app.py
```

Then open **http://localhost:5000** in your browser.

> The server runs with `debug=True` on port `5000` — for local development only.

---

## How to play

- Press **Space** to make the dino jump.
- Obstacles scroll in from the right at a random rate (always **≥ 1 second**
  apart). The game speeds up the longer you survive.
- Touch an obstacle → **Game Over** (shows how long you lasted).
- Survive **180 seconds (3 minutes)** → **You Win!**
- On either end screen, click **Replay** or press **Space** to restart.
- The HUD shows elapsed time (top-left) and a countdown to the win (top-right).

---

## Project structure

```
dino_run/
├── app.py              # Flask server — the entry point you run
├── requirements.txt    # Python dependencies (just: flask)
├── templates/
│   └── index.html      # Page shell: canvas + Game Over / Win overlays
├── static/
│   ├── style.css       # Layout, canvas border, overlay & button styling
│   └── game.js         # All game logic (vanilla JS)
└── README.md           # This file
```

### `app.py`
A minimal Flask app with a single route `/` that renders `index.html`. On
startup it prints a reminder to open `http://localhost:5000`.

### `templates/index.html`
The page shell. Contains an `800×260` `<canvas id="game">`, plus two overlay
`<div>`s (`#overlay-gameover` and `#overlay-win`), hidden by default and toggled
by JS. Each overlay has a **Replay** button marked with `data-action="replay"`.
Static assets are referenced through Flask's `url_for('static', ...)`.

### `static/game.js`
All gameplay, written as a vanilla-JS IIFE in `"use strict"` mode and driven by
`requestAnimationFrame`. Key pieces:

- **State machine:** `running` → `gameover` / `won`.
- **Physics:** delta-time integration. Gravity `2200 px/s²`, jump impulse
  `-780 px/s`. The dino is a bottom-anchored rectangle; jumps only fire when
  grounded.
- **Obstacles:** spawned on a timer of `1000 + random·1200` ms, so the gap is
  **always at least 1 second** (≈ 1–2.2 s). They scroll left at
  `BASE_SPEED (360) + elapsed · SPEED_RAMP (14)` px/s and are culled off-screen.
- **Collision:** axis-aligned bounding-box (AABB) test, bottom-anchored.
- **Win/lose:** colliding ends the game; reaching `WIN_TIME = 180` s wins.
- **Input:** Space jumps while running, or replays from an end screen
  (`preventDefault` stops page scroll). Replay buttons are wired by their
  `data-action="replay"` attribute.
- **Loop guarding:** `reset()` cancels any prior animation frame so replays
  never stack multiple loops. `dt` is clamped to `0.05` s to avoid huge jumps
  after a tab switch.

### `static/style.css`
Centered page layout, a bordered canvas, the translucent overlay cards, and the
Replay button styling.

---

## Tuning constants (in `static/game.js`)

| Constant         | Value | Meaning                                   |
|------------------|-------|-------------------------------------------|
| `WIN_TIME`       | 180   | Seconds to survive to win (3 min)         |
| `GRAVITY`        | 2200  | Downward acceleration (px/s²)             |
| `JUMP_VELOCITY`  | -780  | Initial jump speed (negative = up)        |
| `BASE_SPEED`     | 360   | Starting obstacle scroll speed (px/s)     |
| `SPEED_RAMP`     | 14    | Speed added per second survived           |
| `MIN_SPAWN_MS`   | 1000  | Minimum gap between obstacles (ms)        |
| `SPAWN_RANGE_MS` | 1200  | Extra random spawn delay on top of min    |

To verify the **You Win!** screen without waiting 3 minutes, temporarily lower
`WIN_TIME`, then restore it.

---

## Known limitations / ideas for improvement

These came out of a code review and are **not yet fixed**:

1. **Speed never caps.** With `SPEED_RAMP = 14` and no upper bound, obstacles
   get very fast near the 3-minute mark — the win is hard to reach, and because
   `dt` is clamped to `0.05` s, fast obstacles can "tunnel" through the dino in
   a single frame. Consider capping `currentSpeed()` and/or sub-stepping the
   collision check.
2. **Survival timer follows frame time, not wall-clock.** Because elapsed time
   accumulates from `requestAnimationFrame` deltas (and `dt` is clamped),
   backgrounding the tab pauses progress toward the win instead of using real
   elapsed time.
3. **Collision uses the full bounding box,** which can feel unfair on near
   misses. A few-pixel hitbox inset would feel more forgiving.

---

## Tech

- **Backend:** Flask (Python).
- **Frontend:** HTML5 Canvas 2D + vanilla JavaScript (no build step, no image
  assets — everything is drawn as shapes).
