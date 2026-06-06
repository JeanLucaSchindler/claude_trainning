#!/usr/bin/env python3
"""Re-capture the Dino Run UI reference screenshots.

Run this after any UI change and eyeball the PNGs in ./reference/ against
what this spec describes. Starts the Flask app, drives the three visual
states with headless Chromium (Playwright), and overwrites the references.

The win shot patches WIN_TIME down to 2s *in flight* (route interception);
game.js on disk is never modified.

Usage (from ClaudeCode101/dino_run/):
    python .claude/skills/dino-ui-spec/capture.py

Prereqs: pip install flask playwright && python -m playwright install chromium
"""
import os
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.abspath(os.path.join(SKILL_DIR, "..", "..", ".."))  # dino_run/
REF = os.path.join(SKILL_DIR, "reference")
URL = "http://127.0.0.1:5000/"


def wait_up(timeout=20):
    end = time.time() + timeout
    while time.time() < end:
        try:
            if urllib.request.urlopen(URL, timeout=1).status == 200:
                return True
        except Exception:
            time.sleep(0.25)
    return False


def main():
    os.makedirs(REF, exist_ok=True)
    proc = subprocess.Popen(
        [sys.executable, "app.py"], cwd=APP_DIR,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    )
    try:
        if not wait_up():
            raise SystemExit("Flask did not start on :5000")
        with sync_playwright() as p:
            b = p.chromium.launch()

            # 1. In-play: jump so the dino is airborne, capture before collision.
            pg = b.new_page(viewport={"width": 900, "height": 380})
            pg.goto(URL); pg.wait_for_selector("#game")
            pg.wait_for_timeout(300); pg.keyboard.press("Space"); pg.wait_for_timeout(250)
            assert pg.locator("#overlay-gameover").is_hidden()
            pg.screenshot(path=os.path.join(REF, "running.png")); print("running.png")
            pg.close()

            # 2. Game Over: never jump, an obstacle reaches the dino in a few s.
            pg = b.new_page(viewport={"width": 900, "height": 420})
            pg.goto(URL)
            pg.wait_for_selector("#overlay-gameover:not(.hidden)", timeout=15000)
            pg.screenshot(path=os.path.join(REF, "gameover.png"))
            print("gameover.png", pg.locator("#gameover-msg").inner_text())
            pg.close()

            # 3. You Win: shorten WIN_TIME to 2s in flight so the real win fires.
            pg = b.new_page(viewport={"width": 900, "height": 420})

            def patch(route):
                resp = route.fetch()
                body = resp.text().replace(
                    "const WIN_TIME = 180;", "const WIN_TIME = 2;")
                route.fulfill(response=resp, body=body)

            pg.route("**/game.js", patch)
            pg.goto(URL)
            pg.wait_for_selector("#overlay-win:not(.hidden)", timeout=15000)
            pg.screenshot(path=os.path.join(REF, "win.png")); print("win.png")
            pg.close()

            b.close()
        print("\nreferences written to", REF)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    main()
