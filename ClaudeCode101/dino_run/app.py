"""Dino Run — a tiny Flask server that serves the dinosaur runner game.

Requirements: Flask  (pip install flask)

Run:
    python app.py
Then open http://localhost:5000 in your browser.
"""

from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    print("Dino Run is starting...")
    print("Open http://localhost:5000 in your browser to play!")
    app.run(debug=True, port=5000)
