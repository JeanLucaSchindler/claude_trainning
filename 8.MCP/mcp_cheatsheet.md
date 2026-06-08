# MCP Cheat Sheet

## What is MCP?

Model Context Protocol (MCP) is a standard way to connect Claude to external systems.

Without MCP:
- You build tool schemas
- You build tool implementations
- You maintain integrations

With MCP:
- MCP servers provide tools, resources, and prompts
- Your application consumes them

---

## Architecture

```text
User
↓
App
↓
MCP Client
↓
MCP Server
↓
External System
```

Examples:
- GitHub
- Databases
- Internal APIs
- Documentation systems

---

## MCP Components

### MCP Client
Connects to MCP servers.

Responsibilities:
- List tools
- Call tools
- Read resources
- Load prompts

### MCP Server
Provides:
- Tools
- Resources
- Prompts

---

## MCP vs Tool Use

Tool Use:
```text
You write the tools.
```

MCP:
```text
Someone already wrote the tools.
```

---

## Core Requests

### List Tools

```text
ListToolsRequest
↓
ListToolsResult
```

### Call Tool

```text
CallToolRequest
↓
CallToolResult
```

### Read Resource

```text
ReadResourceRequest
↓
Resource Content
```

### Get Prompt

```text
GetPromptRequest
↓
Prompt Messages
```

---

## MCP Tools

Tools perform actions.

Example:

```python
@mcp.tool()
def read_doc(doc_id: str):
    return docs[doc_id]
```

Best practices:
- Clear names
- Good descriptions
- Input validation
- Helpful errors

---

## MCP Inspector

Run:

```bash
mcp dev mcp_server.py
```

Use it to:
- Test tools
- Test resources
- Test prompts
- Debug servers

---

## MCP Client Methods

```python
list_tools()
call_tool()
read_resource()
list_prompts()
get_prompt()
```

---

## Resources

Resources expose data.

Think:

```text
GET request
```

Examples:

```python
@mcp.resource("docs://documents")
```

```python
@mcp.resource("docs://documents/{doc_id}")
```

Use for:
- Documents
- JSON data
- Metadata

---

## Prompts

Prompts are reusable templates.

Example:

```python
@mcp.prompt()
```

Return:

```python
list[Message]
```

Benefits:
- Reusable
- Consistent
- Pre-tested

---

## Resources vs Tools vs Prompts

### Tools
Actions

Examples:
- Edit document
- Send email
- Execute workflow

### Resources
Data

Examples:
- Read document
- Fetch JSON
- Load metadata

### Prompts
Instructions

Examples:
- Summarize document
- Format markdown
- Analyze report

---

## Typical MCP Flow

```text
User Question
↓
Client gets tools
↓
Claude selects tool
↓
Client calls MCP server
↓
Server executes
↓
Result returned
↓
Claude answers
```

---

## Golden Rules

1. Tools = Actions
2. Resources = Data
3. Prompts = Instructions
4. MCP Client consumes services
5. MCP Server exposes services

## One-Line Definition

```text
MCP is the standard protocol for exposing tools, resources, and prompts to AI applications.
```
