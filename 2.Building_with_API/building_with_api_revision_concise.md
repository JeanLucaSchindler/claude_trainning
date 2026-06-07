# Building with the Anthropic API — Revision Sheet

## 1. Setup

Load credentials and create a client.

```python
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()              # reads ANTHROPIC_API_KEY from .env
client = Anthropic()       # picks up the key automatically
model = "claude-sonnet-4-0"
```

Keep the API key in `.env`, never hardcoded.

---

## 2. Messages

The API is conversational: you send a list of `messages`, each with a `role` and `content`.

```python
def add_user_message(messages, text):
    messages.append({"role": "user", "content": text})

def add_assistant_message(messages, text):
    messages.append({"role": "assistant", "content": text})
```

### Rules

- Roles alternate: `user` -> `assistant` -> `user` ...
- Append each reply back into `messages` to keep conversation history.
- The model is stateless — **you** carry the history every request.

---

## 3. Basic Request

```python
messages = []
add_user_message(messages, "What is the population of Paris?")

response = chat(messages)
add_assistant_message(messages, response)   # persist for next turn
```

Multi-turn = repeat: add user message -> call -> add assistant reply.

---

## 4. System Prompt

Sets the model's role/behaviour. Passed separately, not as a message.

```python
system_prompt = """
You are a code generator.
Just provide the code requested, do not provide any explanations.
"""

response = chat(messages, system=system_prompt)
```

Use it for: persona, output format, constraints, tone.

---

## 5. Core `chat` Helper

A reusable wrapper around `client.messages.create`.

```python
def chat(messages, system=None, temperature=0.5, stop_sequences=None):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature,
        "stop_sequences": stop_sequences,
    }
    if system:
        params["system"] = system

    message = client.messages.create(**params)
    return message.content[0].text
```

### Key params

| Param | Purpose |
|---|---|
| `model` | Which Claude model to call |
| `max_tokens` | Cap on response length |
| `temperature` | Randomness: `0` = focused, higher = creative |
| `system` | System prompt (role/behaviour) |
| `stop_sequences` | Strings that halt generation |

Response text lives at `message.content[0].text`.

---

## 6. Temperature

Controls randomness of output.

- `0.0` — deterministic, focused (facts, code).
- `0.5` — balanced (default here).
- `~1.0` — creative, varied (brainstorming).

---

## 7. Streaming

Get tokens as they are generated instead of waiting for the full reply.

### Raw events

```python
event = client.messages.create(
    model=model, max_tokens=1000, messages=messages,
    temperature=0.5, stream=True
)
for chunk in event:
    print(chunk)
```

### Helper (cleaner)

```python
with client.messages.stream(
    model=model, max_tokens=1000, messages=messages, temperature=0.5
) as stream:
    for text in stream.text_stream:
        print(text, end="")

final = stream.get_final_message()   # full Message after streaming
```

Use streaming for responsive UIs and long responses.

---

## 8. Structured Data (JSON / code)

Force a specific output format with **prefill** + **stop sequences**.

```python
messages = []
add_user_message(messages, "Generate a very short event bridge as json")
add_assistant_message(messages, "```json")          # prefill the start

response = chat(messages, stop_sequences=["```"])    # stop at closing fence
response_json = response.strip("```").strip()
```

### Technique

- **Prefill**: seed the assistant turn (e.g. ` ```json `) so it continues in that format.
- **Stop sequence**: end generation at the closing ` ``` ` so you get only the payload.
- Strip the fences before parsing.

Works for any fenced format — JSON, `bash`, etc.

---

## Quick Decision Guide

| Need | Use |
|---|---|
| Set role / behaviour | `system` prompt |
| Keep conversation | append replies to `messages` |
| More / less creativity | `temperature` |
| Responsive output | `stream=True` / `client.messages.stream` |
| Clean JSON or code | prefill + `stop_sequences` |
| Limit response length | `max_tokens` |

---

## Essential Takeaway

The API is stateless and message-based: you own the history, the system prompt
shapes behaviour, temperature tunes randomness, streaming improves UX, and
prefill + stop sequences give you structured output.

```text
Build messages -> set system + params -> call -> persist reply.
```
