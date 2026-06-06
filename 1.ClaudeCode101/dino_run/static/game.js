// Dino Run — vanilla JS HTML5 canvas game.
(function () {
    "use strict";

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const GROUND_Y = H - 40;          // y of the ground line
    const WIN_TIME = 180;             // seconds to survive to win (3 minutes)

    // --- Physics / tuning ---
    const GRAVITY = 2200;             // px / s^2
    const JUMP_VELOCITY = -780;       // px / s (negative = up)
    const BASE_SPEED = 360;           // obstacle scroll speed, px / s
    const SPEED_RAMP = 14;            // speed increase per second survived

    // Obstacle spawn gap: always >= 1000 ms, up to ~2200 ms.
    const MIN_SPAWN_MS = 1000;
    const SPAWN_RANGE_MS = 1200;

    const dino = {
        x: 60,
        y: GROUND_Y,
        w: 44,
        h: 47,
        vy: 0,
        grounded: true,
    };

    let obstacles = [];
    let state = "running";            // "running" | "gameover" | "won"
    let elapsed = 0;                  // seconds survived
    let spawnTimer = 0;               // ms until next spawn
    let lastTime = null;
    let rafId = null;

    const overlayGameOver = document.getElementById("overlay-gameover");
    const overlayWin = document.getElementById("overlay-win");
    const gameOverMsg = document.getElementById("gameover-msg");

    function randomSpawnGap() {
        return MIN_SPAWN_MS + Math.random() * SPAWN_RANGE_MS;
    }

    function reset() {
        obstacles = [];
        dino.y = GROUND_Y;
        dino.vy = 0;
        dino.grounded = true;
        elapsed = 0;
        spawnTimer = randomSpawnGap();
        lastTime = null;
        state = "running";
        overlayGameOver.classList.add("hidden");
        overlayWin.classList.add("hidden");
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(loop);
    }

    function jump() {
        if (state === "running" && dino.grounded) {
            dino.vy = JUMP_VELOCITY;
            dino.grounded = false;
        }
    }

    function spawnObstacle() {
        // Vary obstacle height a little for interest.
        const h = 28 + Math.floor(Math.random() * 24);
        const w = 18 + Math.floor(Math.random() * 16);
        obstacles.push({ x: W + 10, y: GROUND_Y, w: w, h: h });
    }

    function currentSpeed() {
        return BASE_SPEED + elapsed * SPEED_RAMP;
    }

    function collides(a, b) {
        // Axis-aligned bounding box; coords use bottom-anchored y.
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y - a.h < b.y &&
            a.y > b.y - b.h
        );
    }

    function update(dt) {
        elapsed += dt;

        // Dino physics.
        dino.vy += GRAVITY * dt;
        dino.y += dino.vy * dt;
        if (dino.y >= GROUND_Y) {
            dino.y = GROUND_Y;
            dino.vy = 0;
            dino.grounded = true;
        }

        // Spawn obstacles on a >= 1s random timer.
        spawnTimer -= dt * 1000;
        if (spawnTimer <= 0) {
            spawnObstacle();
            spawnTimer = randomSpawnGap();
        }

        // Move obstacles and cull off-screen ones.
        const speed = currentSpeed();
        for (const o of obstacles) {
            o.x -= speed * dt;
        }
        obstacles = obstacles.filter((o) => o.x + o.w > -5);

        // Collision check.
        for (const o of obstacles) {
            if (collides(dino, o)) {
                endGame("gameover");
                return;
            }
        }

        // Win check.
        if (elapsed >= WIN_TIME) {
            endGame("won");
        }
    }

    function endGame(result) {
        state = result;
        if (result === "gameover") {
            gameOverMsg.textContent =
                "You survived " + elapsed.toFixed(1) + "s. Try again!";
            overlayGameOver.classList.remove("hidden");
        } else {
            overlayWin.classList.remove("hidden");
        }
    }

    function formatTime(seconds) {
        const remaining = Math.max(0, WIN_TIME - seconds);
        const m = Math.floor(remaining / 60);
        const s = Math.floor(remaining % 60);
        return m + ":" + String(s).padStart(2, "0");
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Ground line.
        ctx.strokeStyle = "#535353";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 1);
        ctx.lineTo(W, GROUND_Y + 1);
        ctx.stroke();

        // Dino (bottom-anchored rectangle).
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(dino.x, dino.y - dino.h, dino.w, dino.h);
        // Simple eye.
        ctx.fillStyle = "#fff";
        ctx.fillRect(dino.x + dino.w - 14, dino.y - dino.h + 8, 6, 6);

        // Obstacles.
        ctx.fillStyle = "#c0392b";
        for (const o of obstacles) {
            ctx.fillRect(o.x, o.y - o.h, o.w, o.h);
        }

        // HUD: countdown to win.
        ctx.fillStyle = "#333";
        ctx.font = "16px monospace";
        ctx.textAlign = "right";
        ctx.fillText("Win in " + formatTime(elapsed), W - 12, 24);
        ctx.textAlign = "left";
        ctx.fillText("Time: " + elapsed.toFixed(1) + "s", 12, 24);
    }

    function loop(timestamp) {
        if (lastTime === null) {
            lastTime = timestamp;
        }
        // dt in seconds; clamp to avoid huge jumps after tab switches.
        let dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (dt > 0.05) dt = 0.05;

        if (state === "running") {
            update(dt);
        }
        draw();

        if (state === "running") {
            rafId = requestAnimationFrame(loop);
        }
    }

    // --- Input ---
    window.addEventListener("keydown", function (e) {
        if (e.code === "Space" || e.key === " ") {
            e.preventDefault();
            if (state === "running") {
                jump();
            } else {
                reset(); // Space also replays from a finished state.
            }
        }
    });

    document.querySelectorAll('[data-action="replay"]').forEach(function (btn) {
        btn.addEventListener("click", reset);
    });

    // Start.
    reset();
})();
