# Agents and Workflows Cheat Sheet

## 1. Core Difference

### Workflows

Use when the steps are known in advance.

```text
Predefined steps
↓
Claude handles each step
↓
Final output
```

Best for:

- Predictable tasks
- Known inputs
- Reliable production systems
- Easy testing and evaluation

---

### Agents

Use when the task or steps are not known in advance.

```text
Goal
+
Tools
↓
Claude decides the steps
↓
Claude completes the task
```

Best for:

- Open-ended tasks
- Unknown user requests
- Flexible tool use
- Dynamic problem solving

---

## 2. Rule of Thumb

```text
If you know the steps → Workflow
If Claude must figure out the steps → Agent
```

Prefer workflows when possible.

Use agents only when flexibility is required.

---

# 3. Workflow Patterns

## A. Parallelization Workflow

Split one task into independent subtasks.

```text
Input
↓
Task A     Task B     Task C
↓          ↓          ↓
Result A   Result B   Result C
↓
Aggregate final answer
```

Use when:

- Multiple independent evaluations are needed
- Each subtask needs focused analysis
- You want better reliability than one large prompt

Example:

```text
Evaluate a part for:
- Metal
- Polymer
- Ceramic
- Composite
Then aggregate the best material choice.
```

Benefits:

- Focused prompts
- Easier optimization
- Better reliability
- Faster if run concurrently

---

## B. Chaining Workflow

Break a task into sequential steps.

```text
Step 1
↓
Step 2
↓
Step 3
↓
Final output
```

Use when:

- Tasks build on each other
- One large prompt fails
- Claude ignores constraints
- You need validation or revision between steps

Example:

```text
1. Draft article
2. Remove AI references
3. Remove emojis
4. Rewrite in technical tone
```

Benefits:

- Keeps Claude focused
- Easier debugging
- Better constraint following

---

## C. Routing Workflow

Classify input, then send it to the right specialized pipeline.

```text
User Input
↓
Router
↓
Specialized Workflow
↓
Output
```

Use when:

- Request types need different handling
- Categories are clear
- Specialized prompts improve quality

Example:

```text
Topic: Python functions
↓
Router: Educational
↓
Educational script prompt
```

Benefits:

- Better specialization
- Cleaner prompts
- More reliable outputs

---

## D. Evaluator-Optimizer Workflow

Generate output, evaluate it, then improve it.

```text
Producer creates output
↓
Evaluator grades output
↓
If bad: send feedback
↓
Producer improves output
↓
Repeat until accepted
```

Use when:

- Quality matters
- Output can be evaluated
- Iteration improves result

Example:

```text
Image → CAD model → render → compare to image → improve model
```

Benefits:

- Built-in quality loop
- Better final results
- Useful for generation tasks

---

# 4. Agents and Tools

Agents work by combining tools.

Good agent tools are abstract and composable.

Examples:

```text
read
write
edit
bash
grep
glob
```

Avoid overly specific tools like:

```text
refactor_code
install_dependencies
fix_bug
```

Reason:

Claude can combine simple tools in flexible ways.

---

## Example Agent Tool Set

For reminders:

```text
get_current_datetime
add_duration_to_datetime
set_reminder
```

Claude can combine them to handle:

- What time is it?
- What day is it in 11 days?
- Remind me next Wednesday.

---

# 5. Environment Inspection

Agents need to observe the result of their actions.

Key principle:

```text
Read before writing.
Inspect after acting.
```

Examples:

- Read file before editing
- Check API response after request
- Take screenshot after UI action
- Validate generated output
- Inspect logs after running code

Why it matters:

- Claude works blindly without feedback
- Inspection enables correction
- Prevents unsafe or incorrect changes

---

# 6. Workflows vs Agents

| Category | Workflows | Agents |
|---|---|---|
| Steps | Predefined | Claude decides |
| Reliability | Higher | Lower |
| Flexibility | Lower | Higher |
| Testing | Easier | Harder |
| Best for | Known tasks | Unknown tasks |
| Cost/control | More controlled | Less predictable |

---

# 7. When to Use What

## Use Workflows When

- You know the steps
- You need reliability
- You need easy evaluation
- The UX is constrained
- The task is repeatable

## Use Agents When

- Requests are unpredictable
- Claude must choose tools
- User goals vary widely
- Flexibility matters more than predictability

---

# 8. Production Guidance

Most production apps should start with workflows.

```text
Workflow first.
Agent only when needed.
```

Reason:

- Users care about reliability
- Workflows are easier to test
- Agents are harder to evaluate
- Agents can be more expensive

---

# Final Cheat Sheet

## Main Patterns

```text
Parallelization = split independent tasks
Chaining = sequential focused steps
Routing = classify then specialize
Evaluator-Optimizer = generate, grade, improve
Agent = goal + tools + Claude plans
```

## Golden Rules

1. Use workflows for known processes.
2. Use agents for open-ended tasks.
3. Keep workflow steps focused.
4. Give agents abstract, composable tools.
5. Let agents inspect their environment.
6. Prefer reliability over flexibility in production.
