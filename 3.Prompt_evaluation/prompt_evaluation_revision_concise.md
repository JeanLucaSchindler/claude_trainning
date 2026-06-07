# Prompt Evaluation — Revision Sheet

## 1. What & Why

A **prompt eval** measures how good a prompt is, objectively and repeatably.
Instead of eyeballing one output, you run the prompt over a **dataset** of tasks
and score every result. This lets you compare prompt versions and catch regressions.

```text
Dataset -> Run prompt -> Grade -> Average score
```

---

## 2. Setup

```python
from dotenv import load_dotenv
from anthropic import Anthropic
import re, ast, json

load_dotenv()
client = Anthropic()
model = "claude-haiku-4-5"   # fast + cheap — good for eval loops
tests = {}                   # store results per run
```

Reuse the `add_user_message` / `add_assistant_message` / `chat` helpers from the API basics.

---

## 3. The Eval Pipeline

Four building blocks:

| Step | Function | Job |
|---|---|---|
| Dataset | `generate_dataset` | Create test cases |
| Run | `run_prompt` | Run the prompt under test |
| Grade | `grade_syntax` + `grade_by_model` | Score the output |
| Orchestrate | `run_test_case` / `run_eval` | Tie it all together |

---

## 4. Generate the Dataset

Use the model itself to build test cases — each has a **task**, a **type**, and **solution criteria**.

```python
def generate_dataset():
    prompt = """
        Generate an evaluation dataset... array of JSON objects.
        Example:
        [{ "task": "...", "type": "Python|JSON|Regex", "solution_criteria": "..." }]
        Generate 3 objects.
    """
    messages = []
    add_user_message(messages, prompt)
    add_assistant_message(messages, "````json")          # prefill
    text = chat(messages, stop_sequences=["````"])        # stop at fence
    return json.loads(text)
```

Each test case:

```json
{
  "task": "Description of the task",
  "type": "Python" | "JSON" | "Regex",
  "solution_criteria": "What a good answer must do"
}
```

Save it so runs are reproducible:

```python
with open("dataset.json", "w") as f:
    json.dump(dataset, f, indent=2)
```

---

## 5. Run the Prompt Under Test

The prompt being evaluated. Prefill + stop sequence keep the output to raw code only.

```python
def run_prompt(test_case):
    prompt = f"""
Please solve the following task:
Respond with only the code, JSON, or regex. No explanations or comments.

{test_case["task"]}
"""
    messages = []
    add_user_message(messages, prompt)
    add_assistant_message(messages, "```code")   # prefill
    return chat(messages, stop_sequences=["```"]) # stop at fence
```

---

## 6. Grading — Two Layers

### A. Syntax grading (cheap, deterministic)

Does the output even parse? Returns `10` or `0`.

```python
def validate_json(text):   # json.loads
def validate_python(text): # ast.parse
def validate_regex(text):  # re.compile

def grade_syntax(task_type, response):
    if "Python" in task_type: return validate_python(response)
    elif "JSON" in task_type: return validate_json(response)
    elif "Regex" in task_type: return validate_regex(response)
```

### B. Model grading (LLM-as-judge)

A second model call judges quality against the `solution_criteria` and returns structured JSON.

```python
def grade_by_model(test_case, output):
    eval_prompt = f"""
    You are an expert code reviewer. Evaluate this solution.
    <task>{test_case["task"]}</task>
    <solution>{output}</solution>
    <criteria>{test_case["solution_criteria"]}</criteria>

    Return JSON with: strengths, weaknesses, reasoning, score (1-10)
    """
    messages = []
    add_user_message(messages, eval_prompt)
    add_assistant_message(messages, "```json")
    return json.loads(chat(messages, stop_sequences=["```"]))
```

**Why two layers:** syntax is a hard gate (broken code = 0); the model judges
the *quality* of code that is at least valid.

---

## 7. Combine & Run

```python
def run_test_case(test_case):
    output = run_prompt(test_case)
    model_eval   = grade_by_model(test_case, output)
    syntax_score = grade_syntax(test_case["type"], output)

    # Syntax is a gate: invalid output scores 0 regardless of model opinion
    score = 0 if syntax_score == 0 else model_eval.get("score")
    return {
        "output": output, "test_case": test_case,
        "score": score, "reasoning": model_eval.get("reasoning"),
        "pass_syntax": syntax_score > 0,
    }

def run_eval(dataset):
    results = [run_test_case(tc) for tc in dataset]
    average_score = sum(r["score"] for r in results) / len(results)
    print(f"Average Score: {average_score}")
    return {"average_score": average_score, "individual_results": results}
```

---

## 8. Track Runs

Name each run and store it so you can compare prompt versions over time.

```python
test_name = input("Enter a name for this test run: ")
tests[test_name] = run_eval(dataset)

for test in tests:
    print(f"{test}: {tests[test]['average_score']}")
# test #1: 6.67
# test #2: 7.67   <- improved prompt
```

---

## Quick Decision Guide

| Need | Use |
|---|---|
| Test cases | model-generated `dataset.json` |
| "Does it parse?" | `grade_syntax` (`ast` / `json` / `re`) |
| "Is it good?" | `grade_by_model` (LLM-as-judge) |
| Clean code output | prefill + `stop_sequences` |
| Compare prompt versions | named entries in `tests` |
| Fast/cheap eval loop | a small model (e.g. Haiku) |

---

## Essential Takeaway

Evaluate prompts the way you test code: a fixed dataset, a hard syntax gate, an
LLM judge for quality, and a single averaged score you can track across versions.

```text
Build a dataset -> run the prompt -> grade (syntax + model) -> average -> compare.
```
