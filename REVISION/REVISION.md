# Master Revision Sheet — Claude / Anthropic Training (Chapters 1–9)

A self-test study guide covering everything from the nine training folders. Each chapter lists the
**topics covered** and a set of **practice questions** with collapsible answers.

> **How to use:** Read the question, answer it in your head (or out loud), *then* expand **▶ Show answer**
> to check yourself. Answers are collapsed by default. The foldables render in GitHub, the VS Code markdown
> preview (`Ctrl+Shift+V`), and most markdown viewers. Question styles are mixed: 🧠 recall, 💡 conceptual
> (why/when), 🛠️ applied scenario.

---

## Table of Contents

1. [Claude Code](#1-claude-code)
2. [Building with the Anthropic API](#2-building-with-the-anthropic-api)
3. [Prompt Evaluation](#3-prompt-evaluation)
4. [Prompt Engineering](#4-prompt-engineering)
5. [Tool Use](#5-tool-use)
6. [RAG & Agentic Search](#6-rag--agentic-search)
7. [Features of Claude](#7-features-of-claude)
8. [MCP (Model Context Protocol)](#8-mcp-model-context-protocol)
9. [Agents vs Workflows](#9-agents-vs-workflows)
10. [Cumulative Cross-Chapter Quiz](#10-cumulative-cross-chapter-quiz)

---

## 1. Claude Code

**Topics covered:** core workflow (Explore → Plan → Code → Commit) · context management (`/context`,
`/compact`, `/clear`) · code review subagents · `CLAUDE.md` project memory · subagents · skills · MCP ·
hooks (events + exit codes) · the quick decision guide.

**Q1.** 🧠 What is the recommended core Claude Code workflow, and what does Plan Mode restrict?

<details><summary>▶ Show answer</summary>

**Explore → Plan → Code → Commit.** In Plan Mode, Claude can read and inspect files but **cannot edit**
them — so you review and correct the plan *before* any code is written.

</details>

**Q2.** 🧠 What do `/context`, `/compact`, and `/clear` each do, and when do you use each?

<details><summary>▶ Show answer</summary>

- `/context` — check current context usage; use when Claude seems overloaded or confused.
- `/compact` — summarize the session and free space; use when **continuing the same** feature/task.
- `/clear` — start fresh with no previous memory; use when **starting a new** task or feature.

</details>

**Q3.** 💡 Why use a subagent for research or code review instead of doing it in the main session?

<details><summary>▶ Show answer</summary>

A subagent is a separate Claude agent with its **own context window**. It keeps the main context clean by
returning only a **summary** of its investigation, rather than flooding the main session with every file and
intermediate result. Good for code review, codebase exploration, research, finding files/endpoints, and
large investigations. Create/manage them with `/agents`.

</details>

**Q4.** 🧠 What is `CLAUDE.md` for, what should it contain, and how do you generate one?

<details><summary>▶ Show answer</summary>

`CLAUDE.md` gives Claude **persistent project memory**. Put it in the project root. Include: project
overview, tech stack, commands, coding standards, important docs, and repeated corrections. Generate a
starter with `/init`.

</details>

**Q5.** 💡 Skills vs MCP vs Hooks vs `CLAUDE.md` — match each need to the right mechanism.

<details><summary>▶ Show answer</summary>

| Need | Use |
|---|---|
| Project memory | `CLAUDE.md` |
| Repeated task instructions (PR format, commit style, checklists) | **Skill** |
| External tools or data (GitHub, Linear, DBs) | **MCP** |
| Guaranteed automation that *always* runs | **Hook** |
| Separate investigation with its own context | **Subagent** |

Skills load only when relevant. Hooks are **deterministic** (unlike prompts, they always run).

</details>

**Q6.** 🧠 Where do personal vs project skills live, and what's the minimal skill structure?

<details><summary>▶ Show answer</summary>

- `~/.claude/skills` — personal skills
- `.claude/skills` — project skills

Structure: a markdown file with frontmatter (`name`, `description`) followed by the instructions.
Skills load only when relevant to the task.

</details>

**Q7.** 🛠️ You want auto-formatting after every file edit, and dangerous commands blocked before they run.
Which hook events, and what do the blocking exit codes mean?

<details><summary>▶ Show answer</summary>

- **Auto-format after edit** → `PostToolUse` (format/log after a tool runs).
- **Block dangerous action before it runs** → `PreToolUse` (block or validate before a tool runs).

Blocking hook exit codes: **0 = allow**, **2 = block**, **any other = warning only**. Configure with
`/hooks` or in `.claude/settings.json`. Other events: `UserPromptSubmit`, `Stop`, `Notification`.

</details>

**Q8.** 💡 Why disable MCP servers you aren't using?

<details><summary>▶ Show answer</summary>

MCP tools **consume context even when unused** — their schemas are loaded into Claude's working memory.
Disabling unneeded servers keeps context lean.

</details>

---

## 2. Building with the Anthropic API

**Topics covered:** client setup · `messages` (roles, alternation) · statelessness · system prompt ·
the `chat` helper & key params · temperature · streaming · structured output via prefill + stop sequences.

**Q1.** 💡 The API is "stateless." What does that mean for your code?

<details><summary>▶ Show answer</summary>

The model doesn't remember previous turns — **you** carry the entire conversation history every request.
After each call you append the assistant's reply back into `messages` so the next call has full context.
Roles alternate: `user → assistant → user → …`.

</details>

**Q2.** 🧠 How is the system prompt passed, and what is it used for?

<details><summary>▶ Show answer</summary>

It's passed **separately** (the `system` parameter), **not** as a message in the `messages` list. Use it to
set persona/role, output format, constraints, and tone.

</details>

**Q3.** 🧠 Name the key parameters of the `chat`/`messages.create` call and what each controls.

<details><summary>▶ Show answer</summary>

| Param | Purpose |
|---|---|
| `model` | Which Claude model to call |
| `max_tokens` | Cap on response length |
| `temperature` | Randomness: `0` = focused, higher = creative |
| `system` | System prompt (role/behaviour) |
| `stop_sequences` | Strings that halt generation |

The response text lives at `message.content[0].text`.

</details>

**Q4.** 🧠 What temperature would you pick for (a) factual/code output, (b) balanced, (c) brainstorming?

<details><summary>▶ Show answer</summary>

- `0.0` — deterministic/focused → facts, code.
- `0.5` — balanced (the course default).
- `~1.0` — creative/varied → brainstorming.

</details>

**Q5.** 💡 What does streaming give you, and how do the two approaches differ?

<details><summary>▶ Show answer</summary>

Streaming yields tokens **as they're generated** instead of waiting for the full reply — good for
responsive UIs and long responses. Two ways:

- **Raw events:** `client.messages.create(..., stream=True)` and iterate the chunks.
- **Helper (cleaner):** `with client.messages.stream(...) as stream:` then iterate `stream.text_stream`;
  call `stream.get_final_message()` for the full `Message` afterward.

</details>

**Q6.** 🛠️ You need Claude to return **only** a clean JSON payload with no prose. What technique do you use?

<details><summary>▶ Show answer</summary>

**Prefill + stop sequences.**
1. **Prefill** the assistant turn with the opening fence, e.g. `add_assistant_message(messages, "```json")`,
   so the model continues in that format.
2. Set `stop_sequences=["```"]` so generation **stops at the closing fence**.
3. Strip the fences before parsing (`response.strip("```").strip()`).

Works for any fenced format (JSON, bash, etc.).

</details>

---

## 3. Prompt Evaluation

**Topics covered:** what/why of prompt evals · the four pipeline blocks · dataset generation · running the
prompt under test · two-layer grading (syntax gate + LLM-as-judge) · combining/averaging scores · tracking
runs across versions · choosing a fast/cheap model.

**Q1.** 💡 What problem does a prompt eval solve, and what's the high-level loop?

<details><summary>▶ Show answer</summary>

It measures prompt quality **objectively and repeatably** instead of eyeballing one output. You run the
prompt over a **dataset** of tasks, score every result, and get an average you can compare across versions
(catching regressions). Loop: **Dataset → Run prompt → Grade → Average score.**

</details>

**Q2.** 🧠 What are the four building blocks of the eval pipeline?

<details><summary>▶ Show answer</summary>

| Step | Function | Job |
|---|---|---|
| Dataset | `generate_dataset` | Create test cases |
| Run | `run_prompt` | Run the prompt under test |
| Grade | `grade_syntax` + `grade_by_model` | Score the output |
| Orchestrate | `run_test_case` / `run_eval` | Tie it all together |

</details>

**Q3.** 🧠 What three fields does each generated test case contain?

<details><summary>▶ Show answer</summary>

`task` (description of the task), `type` (`Python` | `JSON` | `Regex`), and `solution_criteria`
(what a good answer must do). Save the dataset to `dataset.json` so runs are reproducible.

</details>

**Q4.** 💡 Describe the two grading layers and **why** both exist.

<details><summary>▶ Show answer</summary>

- **A. Syntax grading** (cheap, deterministic): does the output even parse? Returns `10` or `0` via
  `ast.parse` (Python), `json.loads` (JSON), or `re.compile` (Regex).
- **B. Model grading** (LLM-as-judge): a second model call scores **quality** against the
  `solution_criteria`, returning JSON with strengths, weaknesses, reasoning, and a score 1–10.

Why both: syntax is a **hard gate** — broken code scores 0 no matter what; the judge only assesses the
quality of output that is *at least valid*.

</details>

**Q5.** 🛠️ Model grading says 8/10 but the code fails to parse. What's the final score, and how is it computed?

<details><summary>▶ Show answer</summary>

Final score is **0**. The syntax score gates everything: `score = 0 if syntax_score == 0 else model_eval["score"]`.
Invalid output scores 0 regardless of the model's opinion.

</details>

**Q6.** 💡 Why use a small/fast model (e.g. Haiku) for eval loops, and how do you compare prompt versions?

<details><summary>▶ Show answer</summary>

A small model is **fast and cheap**, which matters because eval loops run the prompt many times. To compare
versions, name each run and store it (`tests[test_name] = run_eval(dataset)`), then print each run's
`average_score` — e.g. test #1 = 6.67 vs test #2 = 7.67 shows an improved prompt.

</details>

---

## 4. Prompt Engineering

**Topics covered:** be clear & direct (Action + Task + Constraints) · be specific (output requirements vs
process steps) · structure with XML tags · few-shot examples · the prompt template · the golden rules.

**Q1.** 🧠 What's the formula for a clear, direct prompt, and how should it start?

<details><summary>▶ Show answer</summary>

Start with an **action verb** (Generate, Create, Analyze, Summarize, Explain). Formula:
**Action + Task + Constraints.** E.g. *"Generate a one-day meal plan for a vegetarian athlete under
2500 calories."*

</details>

**Q2.** 💡 When do you add explicit "process steps" versus just stating output requirements?

<details><summary>▶ Show answer</summary>

- **Simple tasks → Requirements only** (define exactly what the answer must contain: constraints, format,
  metrics, quality).
- **Complex tasks → Requirements + Process Steps** (e.g. brainstorm options → select best → explain
  reasoning → final answer).

</details>

**Q3.** 💡 Why structure prompts with XML tags, and name a few useful tags.

<details><summary>▶ Show answer</summary>

Tags separate context, giving **clear structure, better reasoning, and less ambiguity**. Useful tags:
`<requirements>`, `<context>`, `<customer_data>`, `<my_code>`, `<documentation>`,
`<athlete_information>`.

</details>

**Q4.** 🛠️ You need consistent classification output (e.g. sentiment labels). Which technique fits best, and why?

<details><summary>▶ Show answer</summary>

**Few-shot prompting** — show Claude example input/output pairs (e.g. `<example_input>Great game tonight!</example_input>`
→ `<example_output>Positive</example_output>`). Best for formatting, classification, edge cases, and writing
style, because it demonstrates exactly what "good output" looks like.

</details>

**Q5.** 🧠 List the five golden rules of prompt engineering.

<details><summary>▶ Show answer</summary>

1. Start directly.
2. Be specific.
3. Use XML for structure.
4. Show examples.
5. Combine all four techniques.

</details>

---

## 5. Tool Use

**Topics covered:** what tool use is · the basic loop · tool functions & best practices · tool schemas ·
calling with `tools` · message blocks (`tool_use`/`tool_result`) · multiple tool calls · multi-turn loops
& `stop_reason` · the tool router · error handling (`is_error`) · `tool_choice` · built-in text editor &
web search tools · the mental model.

**Q1.** 💡 In one sentence, what is the division of labor between Claude and your app in tool use?

<details><summary>▶ Show answer</summary>

**Claude does not execute tools — it *requests* them.** Your application executes the tool and returns the
result; Claude then reasons over that result. (Tool function = actual code; tool schema = the description
Claude sees.)

</details>

**Q2.** 🧠 What three fields does every tool schema need?

<details><summary>▶ Show answer</summary>

`name`, `description`, and `input_schema`. Good descriptions explain what the tool does, when to use it,
what it returns, what each parameter means, and any limitations/caveats — because Claude never sees your
actual function, only the schema.

</details>

**Q3.** 🧠 Walk through the basic tool-use loop.

<details><summary>▶ Show answer</summary>

1. User asks a question.
2. Claude decides a tool is needed and returns a `tool_use` block.
3. Your app runs the actual function.
4. Your app sends back a `tool_result` block.
5. Claude uses the result to answer.

</details>

**Q4.** 🧠 What goes in a `tool_result` block, and what rules matter?

<details><summary>▶ Show answer</summary>

```python
{
  "type": "tool_result",
  "tool_use_id": tool_request.id,   # must match Claude's tool_use id
  "content": "...",                 # serialized as a string
  "is_error": False                 # True when execution fails
}
```

Also: include the tool schemas **again** in the next API call, and always preserve the full assistant
message (including its `tool_use` blocks) in history.

</details>

**Q5.** 🧠 Which `stop_reason` signals Claude wants a tool, and how does the multi-turn loop use it?

<details><summary>▶ Show answer</summary>

`response.stop_reason == "tool_use"`. The loop keeps running tools until the stop reason is **not**
`tool_use`:

```python
while True:
    response = chat(messages, tools=tools)
    add_assistant_message(messages, response)
    if response.stop_reason != "tool_use":
        break
    tool_results = run_tools(response)
    add_user_message(messages, tool_results)
```

</details>

**Q6.** 🛠️ Claude requests three tools in a single response. What must your app do?

<details><summary>▶ Show answer</summary>

1. Find **all** `tool_use` blocks.
2. Execute each tool.
3. Return **one `tool_result` per** tool call.
4. Match each result to its request via `tool_use_id`.

</details>

**Q7.** 💡 A tool throws an exception. What should you send back, and why?

<details><summary>▶ Show answer</summary>

Still return a `tool_result`, but with `is_error: True` and the error message as `content`
(e.g. `f"Error: {e}"`). Claude can use the error message to **retry or adjust** — silently dropping it
leaves Claude blind.

</details>

**Q8.** 🧠 What are the four `tool_choice` options, and what's the default?

<details><summary>▶ Show answer</summary>

| Option | Meaning |
|---|---|
| `auto` | Claude decides whether to use tools (**default**) |
| `any` | Claude must use one available tool |
| `tool` | Claude must use a specific named tool |
| `none` | Claude cannot use tools |

</details>

**Q9.** 💡 What's the steps to add a new tool, and what makes a *good* tool design?

<details><summary>▶ Show answer</summary>

Add a tool: (1) write the function, (2) write the schema, (3) add the schema to `tools`, (4) add the
function to the router. Good tools are clearly named, well-described, validated, safe to execute, focused
in output, and easy to route. Avoid vague descriptions, too many similar tools, huge noisy outputs, missing
validation, and unclear parameter names.

</details>

**Q10.** 🧠 Name two built-in Anthropic tools and one detail about each.

<details><summary>▶ Show answer</summary>

- **Text editor** — built-in schema for view files/dirs, replace text, create files, insert text, undo.
  Claude knows the schema, but **your app still implements the file operations**.
- **Web search** — `{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}`; can restrict with
  `allowed_domains` (e.g. `["nih.gov"]`). Use for current events, recent docs, research, fact-checking.

</details>

---

## 6. RAG & Agentic Search

**Topics covered:** what RAG is & why · chunking strategies · embeddings · semantic search · vector DBs ·
cosine similarity/distance · BM25 lexical search · hybrid search · multi-index · Reciprocal Rank Fusion ·
the production architecture · golden rules.

**Q1.** 💡 What is RAG and what three problems does it address?

<details><summary>▶ Show answer</summary>

**Retrieval-Augmented Generation:** retrieve relevant documents → add them as context to the prompt →
Claude answers. Purpose: use **private/company data**, **reduce hallucinations**, and **ground responses
in facts**.

</details>

**Q2.** 🧠 Name the chunking strategies and the rule of thumb for picking one.

<details><summary>▶ Show answer</summary>

- **Size-based** — fixed length, works everywhere, add overlap.
- **Structure-based** — split by headers/sections; best for Markdown/docs.
- **Sentence-based** — group sentences; good default.
- **Semantic** — group by meaning; highest quality, most expensive.

Rule: Docs → Structure; general text → Sentence; universal fallback → Size + overlap.

</details>

**Q3.** 💡 What do embeddings capture, and why is that better than keyword matching for semantic search?

<details><summary>▶ Show answer</summary>

Embeddings convert text into vectors that capture **meaning, not keywords**. This lets you find
**conceptually similar** content even when the exact words differ — the basis of semantic/similarity search
and retrieval.

</details>

**Q4.** 🧠 What does a vector database store, and name a few examples.

<details><summary>▶ Show answer</summary>

It stores the **embedding + the original text** together. Examples: Pinecone, Weaviate, Qdrant, Chroma,
pgvector. (Golden rule: always store the original text with the embedding.)

</details>

**Q5.** 🧠 Interpret cosine similarity values, and define cosine distance.

<details><summary>▶ Show answer</summary>

Cosine **similarity**: `1.0` = identical, `0.0` = unrelated, `-1.0` = opposite — higher = better match.
Cosine **distance** = `1 - cosine similarity` — lower = better match.

</details>

**Q6.** 🛠️ A user searches for ticket `INC-2023-Q4-011` and semantic search misses it. What do you add, and why?

<details><summary>▶ Show answer</summary>

Add **BM25 lexical search**, which focuses on **exact term matching**. It's best for IDs, ticket numbers,
product codes, and exact keywords — exactly the cases semantic search can miss.

</details>

**Q7.** 💡 What is hybrid search and why is it best practice?

<details><summary>▶ Show answer</summary>

Hybrid = **Semantic search + BM25**. Semantic captures *meaning*; BM25 captures *exact matches*. Together
they give better retrieval than either alone.

</details>

**Q8.** 🧠 What is Reciprocal Rank Fusion (RRF) and what's the formula?

<details><summary>▶ Show answer</summary>

RRF combines rankings from multiple search systems (e.g. a vector index and a BM25 index). Formula:
**RRF = Σ 1/(k + rank)**. Documents that rank well **across systems** rise to the top.

</details>

**Q9.** 🧠 Sketch the full production RAG architecture end to end.

<details><summary>▶ Show answer</summary>

Documents → Chunking → Embeddings → Vector DB → (Semantic Search **+** BM25 Search) → RRF Fusion →
Prompt Construction → Claude. Golden rules: chunk well, use overlap, store original text with embeddings,
use cosine similarity, add BM25, prefer hybrid retrieval, retrieve only the most relevant chunks.

</details>

---

## 7. Features of Claude

**Topics covered:** extended thinking · image support · PDF support · citations · prompt caching · cache
breakpoints · caching in practice (usage indicators) · Files API · code execution · Files API + code
execution workflow · the feature decision guide.

**Q1.** 🧠 When do you use extended thinking, and what are its rules/trade-offs?

<details><summary>▶ Show answer</summary>

Use for complex reasoning, hard analysis, multi-step problems — cases where prompt optimization alone isn't
enough. Enable with `params["thinking"] = {"type": "enabled", "budget": 1024}`. Rules: **minimum budget
1024**; `max_tokens` must be **greater than** the thinking budget; not compatible with some features like
temperature and message prefill. Trade-offs: higher cost, higher latency, more complex response handling.
Responses may include a thinking block, a final-answer block, or a **redacted** thinking block (reasoning
hidden for safety, still passable in future turns).

</details>

**Q2.** 🧠 What are the image limits, and what's the best-practice prompting style?

<details><summary>▶ Show answer</summary>

Limits: up to **100 images/request**, **max 5MB** each; single image up to **8000px/side**, multiple images
up to **2000px/side**. Best practice: use **detailed, step-by-step visual analysis** ("count each marble
one by one, recount row by row, return the verified count") rather than a vague "how many marbles?".

</details>

**Q3.** 💡 PDF support — what can Claude analyze, and what's it good for?

<details><summary>▶ Show answer</summary>

Claude reads PDFs directly and can analyze text, tables, charts, images, layout, and document structure.
Good for summaries, extraction, document Q&A, table analysis, and report review. The block is
`{"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": ...}}`.

</details>

**Q4.** 🛠️ You're building a research app where users must verify claims against source documents. Which feature, and how do you enable it?

<details><summary>▶ Show answer</summary>

**Citations.** Add `"citations": {"enabled": True}` (with a `title`) to the document block. Output can
include cited text, document title, document index, and start/end pages. For **plain text**, citations use
**character positions** instead of page numbers.

</details>

**Q5.** 🧠 What are the limits/conditions for prompt caching?

<details><summary>▶ Show answer</summary>

Cache lasts **~1 hour**; content must be **identical** (small changes invalidate it); **minimum cacheable
content is 1024 tokens**. Best for large system prompts, tool schemas, long documents, and repeated
conversation context. Benefits: faster responses, lower cost.

</details>

**Q6.** 💡 Caching isn't automatic. How do you turn it on, what gets cached, and what's the limit/order?

<details><summary>▶ Show answer</summary>

Add a **cache breakpoint** via `"cache_control": {"type": "ephemeral"}` on a block. **Everything before and
including the breakpoint** is cached. You can cache tools, system prompts, messages, images, and tool
results — up to **4 breakpoints**. Processing order: **Tools → System prompt → Messages**. Usage
indicators: `cache_creation_input_tokens` (written) and `cache_read_input_tokens` (reused).

</details>

**Q7.** 💡 What does the Files API give you over sending base64 each time?

<details><summary>▶ Show answer</summary>

Upload a file **once**, get a `file_id`, and **reference it** in later messages instead of resending raw
base64 every request. Useful for reusing files, larger files, data analysis, and document workflows.

</details>

**Q8.** 🧠 What are the characteristics of the code execution tool?

<details><summary>▶ Show answer</summary>

Claude runs Python in an **isolated Docker container** with **no network access**; it can execute code
multiple times and generate **downloadable files**. Schema: `{"type": "code_execution_20250522",
"name": "code_execution"}`. Use for data analysis, plots, CSV analysis, math modeling, file transformation,
report generation.

</details>

**Q9.** 🛠️ "Analyze churn drivers from this CSV and produce a plot." Which features combine, and what's the flow?

<details><summary>▶ Show answer</summary>

**Files API + Code Execution.** Upload the CSV → send its `file_id` (via a `container_upload` block) →
Claude writes code → executes it → analyzes results → returns the final answer or a generated file. Claude
can load the file, inspect data, run analysis, create charts, and return generated file IDs.

</details>

---

## 8. MCP (Model Context Protocol)

**Topics covered:** what MCP is & what it solves · architecture · MCP client vs server · MCP vs tool use ·
core requests · tools/resources/prompts (and how they differ) · MCP Inspector · client methods · typical
flow · golden rules.

**Q1.** 💡 What is MCP, and what does it change versus writing tools yourself?

<details><summary>▶ Show answer</summary>

**Model Context Protocol** — a standard way to connect Claude to external systems. Without MCP you build
the tool schemas, implementations, and integrations yourself. With MCP, **servers provide** tools,
resources, and prompts, and your application **consumes** them. In short: tool use = *you* write the tools;
MCP = *someone already wrote* the tools.

</details>

**Q2.** 🧠 Sketch the MCP architecture chain.

<details><summary>▶ Show answer</summary>

User → App → **MCP Client** → **MCP Server** → External System. Examples of external systems: GitHub,
databases, internal APIs, documentation systems.

</details>

**Q3.** 🧠 What are the responsibilities of the MCP client vs the MCP server?

<details><summary>▶ Show answer</summary>

- **Client** — connects to servers; lists tools, calls tools, reads resources, loads prompts. Methods:
  `list_tools()`, `call_tool()`, `read_resource()`, `list_prompts()`, `get_prompt()`.
- **Server** — provides/exposes tools, resources, and prompts.

</details>

**Q4.** 💡 Tools vs Resources vs Prompts — what is each, with an example?

<details><summary>▶ Show answer</summary>

- **Tools = Actions** (edit document, send email, execute workflow). `@mcp.tool()`.
- **Resources = Data** (read document, fetch JSON, load metadata) — think a **GET request**.
  `@mcp.resource("docs://documents/{doc_id}")`.
- **Prompts = Instructions** — reusable, consistent, pre-tested templates (summarize, format markdown,
  analyze report). `@mcp.prompt()` returns `list[Message]`.

</details>

**Q5.** 🧠 How do you launch the MCP Inspector and what's it for?

<details><summary>▶ Show answer</summary>

Run `mcp dev mcp_server.py`. Use it to test tools, resources, and prompts, and to **debug servers**.

</details>

**Q6.** 🧠 Describe the typical MCP request flow for answering a user question.

<details><summary>▶ Show answer</summary>

User question → client gets tools → Claude selects a tool → client calls the MCP server → server executes →
result returned → Claude answers. Golden rules: Tools = Actions, Resources = Data, Prompts = Instructions;
the client **consumes** services, the server **exposes** them.

</details>

---

## 9. Agents vs Workflows

**Topics covered:** the core difference & rule of thumb · the four workflow patterns (parallelization,
chaining, routing, evaluator-optimizer) · agents & composable tools · environment inspection · the
comparison table · when to use which · production guidance.

**Q1.** 💡 What's the rule of thumb for choosing a workflow vs an agent?

<details><summary>▶ Show answer</summary>

**If you know the steps → Workflow. If Claude must figure out the steps → Agent.** Prefer workflows when
possible; use agents only when flexibility is required. Workflows = predefined steps; agents = goal + tools,
Claude decides the steps.

</details>

**Q2.** 🧠 Name the four workflow patterns in one line each.

<details><summary>▶ Show answer</summary>

- **Parallelization** — split a task into independent subtasks, then aggregate.
- **Chaining** — sequential focused steps, one feeding the next.
- **Routing** — classify the input, then send it to a specialized pipeline.
- **Evaluator-Optimizer** — generate, grade, improve; repeat until accepted.

</details>

**Q3.** 🛠️ You must evaluate a part for metal, polymer, ceramic, and composite suitability, then pick the
best. Which pattern, and why?

<details><summary>▶ Show answer</summary>

**Parallelization** — run each material evaluation as an independent focused subtask, then aggregate the
best choice. Use it when multiple independent evaluations are needed, each subtask needs focused analysis,
and you want better reliability than one large prompt (and it's faster if run concurrently).

</details>

**Q4.** 🛠️ One big prompt keeps ignoring constraints (drop AI references, remove emojis, rewrite tone).
Which pattern fixes this?

<details><summary>▶ Show answer</summary>

**Chaining** — break it into sequential steps (1. draft → 2. remove AI references → 3. remove emojis →
4. rewrite in technical tone). Use when tasks build on each other, one large prompt fails, Claude ignores
constraints, or you need validation/revision between steps. Benefits: keeps Claude focused, easier
debugging, better constraint following.

</details>

**Q5.** 💡 What makes a good *agent* tool, and what should you avoid?

<details><summary>▶ Show answer</summary>

Good agent tools are **abstract and composable** — e.g. `read`, `write`, `edit`, `bash`, `grep`, `glob`.
Avoid overly specific tools like `refactor_code`, `install_dependencies`, `fix_bug`. Reason: Claude can
**combine simple tools** in flexible ways to handle many tasks.

</details>

**Q6.** 💡 What is "environment inspection" and why does it matter for agents?

<details><summary>▶ Show answer</summary>

Agents must **observe the result of their actions**: *read before writing, inspect after acting* — read a
file before editing, check the API response after a request, screenshot after a UI action, validate output,
inspect logs after running code. It matters because Claude works **blindly without feedback**; inspection
enables correction and prevents unsafe/incorrect changes.

</details>

**Q7.** 🧠 Compare workflows and agents across reliability, flexibility, testing, and cost.

<details><summary>▶ Show answer</summary>

| Category | Workflows | Agents |
|---|---|---|
| Steps | Predefined | Claude decides |
| Reliability | Higher | Lower |
| Flexibility | Lower | Higher |
| Testing | Easier | Harder |
| Best for | Known tasks | Unknown tasks |
| Cost/control | More controlled | Less predictable |

</details>

**Q8.** 💡 What's the production guidance on starting with workflows vs agents?

<details><summary>▶ Show answer</summary>

**Workflow first; agent only when needed.** Most production apps should start with workflows because users
care about reliability, workflows are easier to test, agents are harder to evaluate, and agents can be more
expensive.

</details>

---

## 10. Cumulative Cross-Chapter Quiz

Integration questions that span multiple chapters.

**Q1.** 💡 **Tool Use vs MCP** — when would you build a custom tool versus using MCP?

<details><summary>▶ Show answer</summary>

Build a **custom tool** (Ch5) when you need bespoke logic and own the implementation — you write the
function, schema, and routing. Use **MCP** (Ch8) when a server already exposes the tools/resources/prompts
you need (GitHub, databases, internal APIs) so you just **consume** them instead of building and maintaining
integrations yourself. Remember MCP tool schemas still consume context (Ch1).

</details>

**Q2.** 💡 **RAG vs Tool Use vs Extended Thinking** — a user asks a question your model can't answer from
training data. How do you decide the approach?

<details><summary>▶ Show answer</summary>

- Need **private/company knowledge** grounded in documents → **RAG** (Ch6): retrieve relevant chunks, add
  to the prompt.
- Need **live data or an action** (current weather, DB write, a calculation) → **Tool Use** (Ch5).
- The data's there but the problem is **hard multi-step reasoning** → **Extended thinking** (Ch7), only when
  standard prompting isn't enough.

</details>

**Q3.** 🛠️ You're shipping a production feature with known, fixed steps and you want to measure quality
before release. Which chapters combine, and how?

<details><summary>▶ Show answer</summary>

Use a **Workflow** (Ch9 — known steps → reliability, easy testing), apply **prompt engineering** (Ch4) to
each focused step, and build a **prompt eval** (Ch3) — dataset + syntax gate + LLM-judge + averaged score —
to measure quality and catch regressions across versions.

</details>

**Q4.** 💡 **Prefill + stop sequences** show up in two chapters. Where, and for what?

<details><summary>▶ Show answer</summary>

Ch2 (Building with the API) introduces prefill + `stop_sequences` to force clean structured output
(seed ` ```json `, stop at the closing fence). Ch3 (Prompt Evaluation) reuses the exact technique in both
`run_prompt` (raw code only) and `grade_by_model` (clean JSON judgment), so outputs parse reliably.

</details>

**Q5.** 💡 **Prompt caching vs the Files API** — both reduce repeated work. How are they different?

<details><summary>▶ Show answer</summary>

**Prompt caching** (Ch7) reuses the *processing* of identical repeated prompt content (system prompts, tool
schemas, long docs) — cache lasts ~1h, min 1024 tokens, up to 4 breakpoints. The **Files API** (Ch7) avoids
*re-uploading* a file's bytes: upload once, get a `file_id`, reference it later. Caching saves compute on
repeated text; Files API saves re-sending file data.

</details>

**Q6.** 💡 **Subagents (Claude Code) vs the Parallelization workflow** — both "split work." How do they differ?

<details><summary>▶ Show answer</summary>

A **subagent** (Ch1) is an isolated agent with its own context window that returns a **summary**, keeping
the main session's context clean (used for research, review, exploration). The **parallelization workflow**
(Ch9) is an API design pattern: split *one task* into independent subtasks (each a focused prompt), run them
concurrently, and **aggregate** the results for better reliability than one big prompt.

</details>

**Q7.** 🛠️ Your agent edits files but keeps making wrong changes. Which two principles (across chapters) help?

<details><summary>▶ Show answer</summary>

- **Environment inspection** (Ch9): *read before writing, inspect after acting* — read the file before
  editing and validate the result afterward so the agent isn't working blindly.
- **Give abstract, composable tools** (Ch9) like `read`/`edit`/`grep` rather than `fix_bug`, and ensure
  tool errors return `is_error: True` (Ch5) so Claude can self-correct.

</details>

**Q8.** 💡 **Hybrid search + RRF** vs a single semantic index — when is the extra complexity justified?

<details><summary>▶ Show answer</summary>

Justified when queries mix **conceptual meaning** *and* **exact tokens** (IDs, ticket/product codes).
Semantic search alone misses exact matches; BM25 alone misses meaning. Combine both (multi-index) and merge
with **RRF** (`Σ 1/(k + rank)`) so documents ranking well across both systems surface first (Ch6). For
purely conceptual search over uniform text, a single semantic index may be enough.

</details>

**Q9.** 💡 **Temperature, extended thinking, and prompt engineering** all affect output quality. Order them
as the knobs you'd reach for, cheapest first.

<details><summary>▶ Show answer</summary>

1. **Prompt engineering** (Ch4) — free: be clear/specific, add XML structure and examples.
2. **Temperature** (Ch2) — tune randomness (0 for facts/code, ~1 for brainstorming).
3. **Extended thinking** (Ch7) — only when standard prompting isn't enough, since it adds cost and latency.

</details>

**Q10.** 🛠️ Map each need to the right Claude Code mechanism: (a) team commit-message format, (b) connect to
the company's GitHub, (c) always run a formatter, (d) remember the tech stack.

<details><summary>▶ Show answer</summary>

(a) **Skill** · (b) **MCP** · (c) **Hook** (deterministic — always runs) · (d) **`CLAUDE.md`** project
memory. (All Ch1.)

</details>

---

*Generated from the nine chapter cheat sheets in this workspace. To regenerate or extend, re-read the source
`*.md` files under folders `1.ClaudeCode101` … `9.Agents_vs_Workflows`.*
