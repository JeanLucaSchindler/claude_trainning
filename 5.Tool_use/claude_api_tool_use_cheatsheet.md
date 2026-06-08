# Claude API Tool Use Cheat Sheet

## 1. What Tool Use Is

Tools let Claude access external information or perform actions.

Use tools when Claude needs:

- Current data
- API/database access
- Calculations
- File operations
- System actions

Without tools, Claude can only answer from its training data and prompt context.

---

## 2. Basic Tool Use Flow

```text
User asks question
Claude decides a tool is needed
Claude returns a tool_use block
Your app runs the actual function
Your app sends back a tool_result block
Claude uses the result to answer
```

Example:

```text
User: What is the weather in San Francisco?
Claude: Calls weather tool
App: Fetches weather from API
Claude: Responds with current weather
```

---

## 3. Tool Functions

A tool function is normal application code Claude can request.

```python
def get_current_datetime(date_format="%Y-%m-%d %H:%M:%S"):
    if not date_format:
        raise ValueError("date_format cannot be empty")
    return datetime.now().strftime(date_format)
```

Best practices:

- Use clear function names
- Use clear parameter names
- Validate inputs
- Return useful errors
- Keep outputs focused

---

## 4. Tool Schemas

Claude does not see your Python function directly.

It sees a JSON schema describing the tool.

Each tool needs:

```text
name
description
input_schema
```

Example:

```python
get_current_datetime_schema = {
    "name": "get_current_datetime",
    "description": "Returns the current date and time formatted according to the specified format.",
    "input_schema": {
        "type": "object",
        "properties": {
            "date_format": {
                "type": "string",
                "description": "Python strftime format string.",
                "default": "%Y-%m-%d %H:%M:%S"
            }
        },
        "required": []
    }
}
```

Good schema descriptions explain:

- What the tool does
- When to use it
- What it returns
- What each parameter means
- Limitations or caveats

---

## 5. Calling Claude with Tools

Pass schemas in the `tools` parameter.

```python
response = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    tools=[get_current_datetime_schema],
)
```

Claude can then decide whether to call the tool.

---

## 6. Message Blocks

With tools, Claude responses are not always plain text.

A response may contain:

- `text` block
- `tool_use` block

A `tool_use` block contains:

```text
id
name
input
type = tool_use
```

Always preserve the full assistant message in conversation history.

```python
messages.append({
    "role": "assistant",
    "content": response.content
})
```

---

## 7. Sending Tool Results

After Claude requests a tool, your app executes it and sends back a `tool_result`.

```python
messages.append({
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": tool_request.id,
        "content": "15:04:22",
        "is_error": False
    }]
})
```

Important:

- `tool_use_id` must match Claude's tool call ID.
- `content` should be serialized as a string.
- Use `is_error: True` when execution fails.
- Include tool schemas again in the next API call.

---

## 8. Multiple Tool Calls

Claude can request multiple tools in one response.

Your app should:

1. Find all `tool_use` blocks
2. Execute each tool
3. Return one `tool_result` for each tool call
4. Match results using `tool_use_id`

---

## 9. Multi-Turn Tool Conversations

Some tasks require several tool calls in sequence.

Example:

```text
User: What day is 103 days from today?
Claude calls get_current_datetime
App returns current date
Claude calls add_duration_to_datetime
App returns calculated date
Claude gives final answer
```

Use a loop until Claude stops requesting tools.

```python
def run_conversation(messages):
    while True:
        response = chat(messages, tools=tools)
        add_assistant_message(messages, response)

        if response.stop_reason != "tool_use":
            break

        tool_results = run_tools(response)
        add_user_message(messages, tool_results)

    return messages
```

Key signal:

```python
response.stop_reason == "tool_use"
```

means Claude wants a tool call.

---

## 10. Tool Router

Use a routing function to map tool names to implementations.

```python
def run_tool(tool_name, tool_input):
    if tool_name == "get_current_datetime":
        return get_current_datetime(**tool_input)
    elif tool_name == "add_duration_to_datetime":
        return add_duration_to_datetime(**tool_input)
    elif tool_name == "set_reminder":
        return set_reminder(**tool_input)
```

To add a new tool:

1. Write the function
2. Write the schema
3. Add schema to `tools`
4. Add function to router

---

## 11. Error Handling

If a tool fails, still return a tool result.

```python
try:
    output = run_tool(tool_request.name, tool_request.input)
    result = {
        "type": "tool_result",
        "tool_use_id": tool_request.id,
        "content": json.dumps(output),
        "is_error": False
    }
except Exception as e:
    result = {
        "type": "tool_result",
        "tool_use_id": tool_request.id,
        "content": f"Error: {e}",
        "is_error": True
    }
```

Claude can use the error message to retry or adjust.

---

## 12. Tool Choice

You can control tool usage with `tool_choice`.

| Option | Meaning |
|---|---|
| `auto` | Claude decides whether to use tools |
| `any` | Claude must use one available tool |
| `tool` | Claude must use a specific tool |
| `none` | Claude cannot use tools |

Default: `auto`

---

## 13. Built-In Text Editor Tool

Claude has a built-in text editor schema.

It can request operations such as:

- View files
- View directories
- Replace text
- Create files
- Insert text
- Undo edits

Important: Claude knows the schema, but your app still must implement the file operations.

Use cases:

- Coding agents
- File editing apps
- Automated refactoring
- Test generation

---

## 14. Built-In Web Search Tool

Claude can use a built-in web search tool for current information.

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5
}
```

Use for:

- Current events
- Recent documentation
- Specialized research
- Fact checking

You can restrict domains:

```python
web_search_schema = {
    "type": "web_search_20250305",
    "name": "web_search",
    "max_uses": 5,
    "allowed_domains": ["nih.gov"]
}
```

---

## 15. Tool Design Best Practices

Good tools are:

- Clearly named
- Well-described
- Validated
- Safe to execute
- Focused in output
- Easy to route

Avoid:

- Vague descriptions
- Too many similar tools
- Huge noisy outputs
- Missing validation
- Unclear parameter names

---

# Essential Mental Model

```text
Claude does not execute tools.
Claude requests tools.

Your application executes tools.
Your application returns results.

Claude then reasons over the results.
```

---

# Final Cheat Sheet

## Core Components

```text
Tool function = actual code
Tool schema = description Claude sees
tool_use block = Claude's request
tool_result block = your app's response
Conversation loop = keeps running until no more tools are needed
```

## Core Loop

```text
Send message + tools
Check for tool_use
Run requested tools
Send tool_result
Repeat
Return final answer
```

## Most Important Rule

Always preserve full conversation history, including:

- User message
- Assistant text blocks
- Assistant tool_use blocks
- User tool_result blocks
