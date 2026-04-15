---
name: resolve-pr-comments
description: Review PR comments, fix functional issues systematically, and ask the user about non-functional feedback. Use when the user wants to address review feedback on a pull request.
license: MIT
metadata:
  author: custom
  version: "1.0"
---

Review and resolve PR comments systematically — fix what impacts functionality, ask about the rest.

**Input**: A PR number (e.g., `56`, `#56`). If omitted, ask the user.

**Steps**

1. **Fetch PR comments**

   ```bash
   gh pr view <number> --json comments,reviews,url --jq '.'
   ```

   Also fetch inline review comments:

   ```bash
   gh api repos/:owner/:repo/pulls/<number>/comments --jq '.[] | {path, line, body, user: .user.login}'
   ```

   And top-level review bodies:

   ```bash
   gh api repos/:owner/:repo/pulls/<number>/reviews --jq '.[] | select(.body != "") | {body, state, user: .user.login}'
   ```

2. **Read the referenced files**

   For each file mentioned in the comments, read the current version to understand context.

3. **Categorize each comment**

   Classify every comment into one of two categories:

   - **Functional**: Impacts correctness, runtime behavior, security, accessibility, data integrity, or causes bugs/crashes. These MUST be fixed.
   - **Non-functional**: Style preferences, naming opinions, structural suggestions, nice-to-haves, or debatable approaches that don't affect whether the app works properly.

4. **Present the triage**

   Show a summary table:

   ```
   ## PR #<number> — Comment Triage

   ### Functional (will fix)
   - [ ] <file>:<line> — <summary of issue> (by @reviewer)
   - [ ] ...

   ### Non-functional (needs your input)
   - <file>:<line> — <summary of suggestion> (by @reviewer)
   - ...
   ```

   For non-functional items, briefly explain what the reviewer suggested and ask:
   > How would you like to handle these? Fix all, skip all, or pick individually?

   **Wait for the user's response before proceeding.**

5. **Fix functional issues**

   Work through each functional item systematically:
   - Read the relevant code
   - Understand the reviewer's concern
   - Make the minimal fix that addresses the issue
   - Mark the item complete
   - If a fix is unclear or has multiple valid approaches, pause and ask

6. **Fix approved non-functional items**

   Apply whatever the user approved from the non-functional list.

7. **Run quality gates**

   After all fixes:
   - `npm run lint` — fix any issues
   - `npx tsc --noEmit` — fix type errors
   - `npm run test` — fix test failures
   - Run `mcp__jetbrains__get_file_problems` on each changed file

8. **Report**

   ```
   ## Resolved

   ### Fixed
   - <summary of each fix>

   ### Skipped (per user decision)
   - <summary of each skipped item>

   ### No action needed
   - <comments that were already addressed or informational>
   ```

   Commit changes.

**Guardrails**
- Never dismiss a functional concern without fixing it
- Never silently fix a non-functional item without user approval
- If a comment is ambiguous (could be functional or non-functional), err on the side of asking
- Keep fixes minimal and scoped — don't refactor beyond what the comment asks for
- If fixing one comment conflicts with another, flag the conflict and ask
- If a comment references code that no longer exists (already changed), note it as resolved