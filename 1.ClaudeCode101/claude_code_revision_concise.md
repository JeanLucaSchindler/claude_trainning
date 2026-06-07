# Claude Code Revision Sheet

## 1. Core Workflow

Use this workflow for most coding tasks:

```text
Explore -> Plan -> Code -> Commit
```

### Explore
Claude reads the codebase and gathers context before making changes.

### Plan
Use **Plan Mode** before coding. Claude can inspect files but cannot edit them. Review the plan and correct it early.

### Code
Approve the plan, then let Claude implement. Give clear success criteria and make sure tests exist.

### Commit
Before pushing, use a reviewer subagent. Then ask Claude to write a commit message or create the PR.

---

## 2. Context Management

Context is Claude's working memory. Files, prompts, commands, and tool results all consume context.

### Key Commands

```bash
/context   # Check context usage
/compact   # Summarize current session and free space
/clear     # Start fresh with no previous memory
```

### Use

- `/compact` when continuing the same feature.
- `/clear` when starting a new task or feature.
- `/context` when Claude seems overloaded or confused.

### Best Practices

- Be specific in prompts.
- Avoid loading unnecessary tools.
- Use subagents for research or exploration.

---

## 3. Code Review

Before pushing code, use a **code-reviewer subagent**.

The reviewer should be read-only and check for:

- Bugs
- Missing tests
- Bad architecture
- Security issues
- Code quality problems

Useful command:

```bash
claude --from-pr <PR_NUMBER>
```

Use it to continue work from an existing PR.

---

## 4. CLAUDE.md

`CLAUDE.md` gives Claude persistent project memory.

Put it in the project root:

```text
CLAUDE.md
```

Include:

- Project overview
- Tech stack
- Commands
- Coding standards
- Important docs
- Repeated corrections

Example:

```md
# Project
Next.js app using Tailwind and Drizzle.

# Commands
- pnpm dev
- pnpm test
- pnpm lint

# Code Style
- Use named exports
- Prefer server actions
- Use 2-space indentation
```

Use `/init` to generate one.

---

## 5. Subagents

Subagents are separate Claude agents with their own context window.

Use them for:

- Code review
- Codebase exploration
- Research
- Finding files or endpoints
- Large investigations

Create or manage them with:

```bash
/agents
```

Main benefit: they keep the main context clean by returning only a summary.

---

## 6. Skills

Skills are reusable instructions for repeated tasks.

Use skills when you often repeat the same instructions, such as:

- PR review format
- Commit message style
- Documentation templates
- Debugging checklist
- Team coding standards

Locations:

```text
~/.claude/skills        # Personal skills
.claude/skills          # Project skills
```

Skill structure:

```md
---
name: pr-review
description: Reviews pull requests for code quality.
---

Instructions go here.
```

Skills load only when relevant.

---

## 7. MCP

MCP connects Claude Code to external tools and data sources.

Examples:

- Linear
- GitHub
- Docs services
- Databases
- Internal tools

Add servers with:

```bash
claude mcp add
```

Manage them with:

```bash
/mcp
```

Important: MCP tools consume context, even when unused. Disable servers you do not need.

---

## 8. Hooks

Hooks run commands automatically at specific points in Claude Code.

Unlike prompts, hooks are deterministic: they always run.

Use hooks for:

- Auto-formatting
- Logging commands
- Blocking dangerous actions
- Notifications

Configure with:

```bash
/hooks
```

Or in:

```text
.claude/settings.json
```

Common hook events:

| Event | Use |
|---|---|
| PreToolUse | Block or validate before a tool runs |
| PostToolUse | Format or log after a tool runs |
| UserPromptSubmit | Run before Claude processes a prompt |
| Stop | Run when Claude finishes |
| Notification | Run on notifications |

Exit codes for blocking hooks:

| Code | Meaning |
|---|---|
| 0 | Allow |
| 2 | Block |
| Other | Warning only |

---

## Quick Decision Guide

| Need | Use |
|---|---|
| Project memory | `CLAUDE.md` |
| Repeated task instructions | Skill |
| External tools or data | MCP |
| Guaranteed automation | Hook |
| Separate investigation | Subagent |
| Clean start | `/clear` |
| Continue same task with less context | `/compact` |
| Check memory usage | `/context` |
| Create agents | `/agents` |
| Manage MCP servers | `/mcp` |
| Configure hooks | `/hooks` |

---

## Essential Takeaway

Use Claude Code effectively by giving it the right context, keeping that context clean, and automating repeated workflows.

```text
Explore first. Plan before coding. Review before committing.
```
