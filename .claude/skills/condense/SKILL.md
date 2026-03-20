---
name: condense
description: Condense the current conversation into a structured plan file. This skill should be used when the user wants to capture decisions, discoveries, unfinished work, and context from a long session into a portable `.md` file in `.claude/plans/`. Useful before ending a session or switching context.
---

# Condense — Session Context Compactor

Extracts and structures important information from the current conversation into a reusable plan file.

## Workflow

### Step 1: Category Selection

Use AskUserQuestion (multiSelect: true) to ask which categories to extract:

- **Decisions & rationale** — Key choices made during this session and why
- **Code changes summary** — What was modified, added, or removed
- **Unfinished work & blockers** — Tasks started but not completed, and what's blocking them
- **Learned context** — Codebase/architecture discoveries that aren't obvious from the code
- **Open questions** — Unresolved questions that need follow-up

### Step 2: Item Extraction

For each selected category, review the full conversation and extract concrete items as bullet points. Be specific — include file paths, function names, ticket references, and exact decisions rather than vague summaries.

This extraction is an internal working draft — do not present it to the user yet. Proceed to Step 3 for interactive review.

### Step 3: Interactive Rating

For each selected category, present extracted items via AskUserQuestion (one category at a time). Use multiSelect: true so the user can select which items to keep. Option labels should be short summaries; descriptions should contain the full detail.

The AskUserQuestion tool automatically provides an "Other" option. If the user selects it, they want to add or modify items — prompt for details and incorporate their feedback.

### Step 4: Plan Name

Use AskUserQuestion to ask the user for a descriptive name for the plan file. Offer 2-3 auto-generated suggestions based on the conversation topic (e.g., `auth-middleware-refactor`, `api-pagination-setup`). The user can pick one or provide their own.

### Step 5: Plan Generation

Read the template from `references/plan-template.md` (relative to this SKILL.md).

Before filling in the selected sections, write a 1-2 sentence session summary for the `## Context` field, derived from the overall conversation goal. Always include this regardless of which categories were selected.

Write the final plan to `.claude/plans/<name>.md` where `<name>` is the chosen name. Fill in only the sections the user selected in Step 1. Omit unselected sections entirely (do not include empty sections).

If "Unfinished work & blockers" or "Open questions" were selected, derive a `## Next Steps` section that synthesizes prioritized actions from those items. Omit Next Steps if neither category was selected.

Use today's date for the date field. Be concrete and actionable — each item should give a future session enough context to pick up where this one left off.

### Step 6: Confirmation

Tell the user the file path and suggest they can reference it in a future session with:

```
Read .claude/plans/<name>.md and continue from where we left off.
```

## Guidelines

- **Be specific over general**: "Refactored `UserService.getById()` to use Optional instead of null check" beats "Made some refactoring changes"
- **Include file paths**: Always reference exact files and line ranges when summarizing code changes
- **Capture the WHY**: For decisions, always include the rationale — the decision alone isn't enough
- **Keep it actionable**: Unfinished work items should describe what's left to do, not just what was attempted
- **Respect scope**: Only extract information from the current conversation, not from memory or assumptions
