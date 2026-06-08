# Claude API Features Cheat Sheet

## 1. Extended Thinking

Extended thinking gives Claude extra reasoning time before the final answer.

Use it for:

- Complex reasoning
- Hard analysis
- Multi-step problems
- Cases where prompt optimization is not enough

Trade-offs:

- Higher cost
- Higher latency
- More complex response handling

Enable it:

```python
params["thinking"] = {
    "type": "enabled",
    "budget": 1024
}
```

Rules:

- Minimum thinking budget: `1024`
- `max_tokens` must be greater than thinking budget
- Not compatible with some features like temperature and message prefill

Response may include:

- Thinking block
- Final answer block
- Redacted thinking block

Redacted thinking means Claude's reasoning was hidden for safety, but can still be passed back in future turns.

---

## 2. Image Support

Claude can analyze images.

Use for:

- Describing images
- Comparing images
- Counting objects
- Visual inspection
- Risk assessment
- Charts/screenshots

Limits:

- Up to 100 images per request
- Max 5MB per image
- One image: max 8000px per side
- Multiple images: max 2000px per side

Image block:

```python
{
    "type": "image",
    "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": image_bytes
    }
}
```

Best practice:

Use detailed visual analysis steps.

Bad:

```text
How many marbles are there?
```

Better:

```text
Count each marble one by one.
Verify by recounting row by row.
Return the final verified count.
```

---

## 3. PDF Support

Claude can read PDFs directly.

It can analyze:

- Text
- Tables
- Charts
- Images
- Layout
- Document structure

PDF block:

```python
{
    "type": "document",
    "source": {
        "type": "base64",
        "media_type": "application/pdf",
        "data": file_bytes
    }
}
```

Use for:

- Summaries
- Extraction
- Document Q&A
- Table analysis
- Report review

---

## 4. Citations

Citations let Claude show where information came from.

Use citations when:

- Users need verification
- Source transparency matters
- Working with authoritative documents
- Building research/document apps

Enable citations:

```python
{
    "type": "document",
    "source": {
        "type": "base64",
        "media_type": "application/pdf",
        "data": file_bytes
    },
    "title": "earth.pdf",
    "citations": {"enabled": True}
}
```

Citation output can include:

- Cited text
- Document title
- Document index
- Start page
- End page

For plain text, citations use character positions instead of page numbers.

---

## 5. Prompt Caching

Prompt caching reuses processing work from repeated content.

Benefits:

- Faster responses
- Lower cost
- Useful for repeated large prompts

Best for:

- Large system prompts
- Tool schemas
- Long documents
- Repeated conversation context

Limitations:

- Cache lasts around 1 hour
- Content must be identical
- Minimum cacheable content: 1024 tokens
- Small changes invalidate cache

---

## 6. Cache Breakpoints

Caching is not automatic.

You must add a cache breakpoint.

Example text block:

```python
{
    "type": "text",
    "text": system_prompt,
    "cache_control": {"type": "ephemeral"}
}
```

What gets cached:

```text
Everything before and including the breakpoint
```

Cache can be used on:

- Tools
- System prompts
- Messages
- Images
- Tool results

Limit:

```text
Up to 4 cache breakpoints
```

Processing order:

```text
Tools
↓
System prompt
↓
Messages
```

---

## 7. Prompt Caching in Practice

Cache tool schemas by adding cache control to the last tool.

```python
tools_clone = tools.copy()
last_tool = tools_clone[-1].copy()
last_tool["cache_control"] = {"type": "ephemeral"}
tools_clone[-1] = last_tool
params["tools"] = tools_clone
```

Cache system prompt:

```python
params["system"] = [{
    "type": "text",
    "text": system,
    "cache_control": {"type": "ephemeral"}
}]
```

Usage indicators:

```text
cache_creation_input_tokens = cache written
cache_read_input_tokens = cache reused
```

---

## 8. Files API

Files API lets you upload files once and reference them later.

Instead of sending raw base64 every time:

```text
Upload file
↓
Receive file_id
↓
Reference file_id in messages
```

Useful for:

- Reusing files
- Larger files
- Data analysis
- Document workflows

---

## 9. Code Execution

Claude can execute Python code in an isolated environment.

Characteristics:

- Runs in Docker container
- No network access
- Can execute code multiple times
- Can generate downloadable files

Tool schema:

```python
{
    "type": "code_execution_20250522",
    "name": "code_execution"
}
```

Use for:

- Data analysis
- Plot generation
- CSV analysis
- Mathematical modeling
- File transformation
- Report generation

---

## 10. Files API + Code Execution

Powerful workflow:

```text
Upload CSV/PDF/image
↓
Send file_id to Claude
↓
Claude writes code
↓
Claude executes code
↓
Claude analyzes results
↓
Claude generates final answer or file
```

Example message block:

```python
{
    "type": "container_upload",
    "file_id": file_metadata.id
}
```

Use case:

```text
Analyze churn drivers from a CSV and create a plot.
```

Claude can:

- Load the file
- Inspect data
- Run analysis
- Create charts
- Return generated file IDs

---

# Feature Decision Guide

| Need | Feature |
|---|---|
| Hard reasoning | Extended thinking |
| Analyze image | Image support |
| Analyze document | PDF support |
| Verify sources | Citations |
| Reduce repeated cost | Prompt caching |
| Reuse uploaded files | Files API |
| Run Python/data analysis | Code execution |
| Analyze files with code | Files API + Code Execution |

---

# Golden Rules

1. Use extended thinking only when standard prompting is not enough.
2. Use structured visual prompts for images.
3. Use PDFs directly when document layout matters.
4. Enable citations when trust and verification matter.
5. Cache stable repeated content.
6. Use Files API for reusable or large files.
7. Use code execution for computation, analysis, and generated outputs.
