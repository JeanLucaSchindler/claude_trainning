# Prompt Engineering Cheat Sheet

## 1. Be Clear & Direct

- Start with an action verb: Generate, Create, Analyze, Summarize, Explain.
- Formula: Action + Task + Constraints.
- Example: `Generate a one-day meal plan for a vegetarian athlete under 2500 calories.`

## 2. Be Specific

### Output Requirements
- Define exactly what the answer must contain.
- Include constraints, format, metrics, and quality requirements.

### Process Steps
Use for complex tasks:
1. Brainstorm options
2. Select best option
3. Explain reasoning
4. Provide final answer

Rule:
- Simple tasks → Requirements
- Complex tasks → Requirements + Process Steps

## 3. Structure with XML Tags

Use tags to separate context.

```xml
<athlete_information>
Age: 28
Weight: 80kg
Goal: Build muscle
Diet: Vegetarian
</athlete_information>
```

Good tags:
- `<requirements>`
- `<context>`
- `<customer_data>`
- `<my_code>`
- `<documentation>`

Benefits:
- Clear structure
- Better reasoning
- Less ambiguity

## 4. Provide Examples (Few-Shot Prompting)

Show Claude what good output looks like.

```xml
<example_input>
Great game tonight!
</example_input>

<example_output>
Positive
</example_output>
```

Best for:
- Formatting
- Classification
- Edge cases
- Writing style

## Prompt Template

```xml
<Task>
Generate a meal plan.
</Task>

<Requirements>
- Vegetarian
- 2500 calories
- Include macros
</Requirements>

<Process>
1. Calculate calories
2. Create meals
3. Verify restrictions
</Process>

<Example_Output>
Breakfast: ...
</Example_Output>
```

# Golden Rules

1. Start directly.
2. Be specific.
3. Use XML for structure.
4. Show examples.
5. Combine all four techniques.
