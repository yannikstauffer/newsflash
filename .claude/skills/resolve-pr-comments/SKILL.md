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

**State**: Skipped decisions are persisted in `.tmp/resolve-pr-comments-<number>-skipped.json` (list of comment IDs or fingerprints) so subsequent runs remember what was previously declined.

**Steps**

1. **Fetch PR comments**

   ```bash
   gh pr view <number> --json comments,reviews,url --jq '.'
   ```

   Also fetch inline review comments:

   ```bash
   gh api repos/yannikstauffer/:repo/pulls/<number>/comments --jq '.[] | {path, line, body, user: .user.login}'
   ```

   And top-level review bodies:

   ```bash
   gh api repos/yannikstauffer/:repo/pulls/<number>/reviews --jq '.[] | select(.body != "") | {body, state, user: .user.login}'
   ```

2. **Read the referenced files**

   For each file mentioned in the comments, read the current version to understand context.

3. **Categorize each comment**

   Load previously skipped items from `.tmp/resolve-pr-comments-<number>-skipped.json` if it exists.

   Classify every comment into one of four categories:

   - **Functional**: Impacts correctness, runtime behavior, security, accessibility, data integrity, or causes bugs/crashes. These MUST be fixed.
   - **Non-functional (simple)**: Small, unambiguous improvements — a rename, a one-liner rewrite, a missing type annotation. Fix these without asking.
   - **Non-functional (complex)**: Structural suggestions, architectural trade-offs, debatable naming, or anything where multiple valid approaches exist. Present recommendations for these.
   - **Already skipped**: Comment was explicitly declined in a previous run (matched by comment ID or body fingerprint). Do not re-present these.

4. **Present the triage**

   Show a summary table:

   ```
   ## PR #<number> — Comment Triage

   ### Functional (will fix)
   - [ ] <file>:<line> — <summary of issue> (by @reviewer)

   ### Non-functional — fixing automatically (small/unambiguous)
   - <file>:<line> — <summary> (by @reviewer)

   ### Non-functional — needs your input (complex/trade-offs)
   - <file>:<line> — <summary> (by @reviewer)

   ### Already skipped (previous runs)
   - <file>:<line> — <summary> (by @reviewer)
   ```

   Omit the "Already skipped" section if empty.

   For each complex non-functional item, present a recommendation block:

   ```
   #### Issue 1: <file>:<line> — <issue title> (by @reviewer)

   <Brief explanation of what the reviewer suggested and why.>

   **Option A — <name>**
   - Pro: ...
   - Con: ...

   **Option B — <name>**
   - Pro: ...
   - Con: ...

   **Recommendation: Option N** — <one sentence rationale>
   ```

   After presenting all recommendations, ask:
   > Which options would you like to apply? (Accept recommendations / pick individually / skip all)

   **Wait for the user's response before proceeding.**

5. **Fix functional issues**

   Work through each functional item systematically:
   - Read the relevant code
   - Understand the reviewer's concern
   - Make the minimal fix that addresses the issue
   - Mark the item complete
   - If a fix is unclear or has multiple valid approaches, pause and ask

6. **Fix non-functional items**

   - Apply all simple non-functional fixes immediately (no approval needed).
   - Apply whichever complex options the user approved.
   - For any complex items the user skips, append their comment ID (or a body fingerprint if no ID is available) to `.tmp/resolve-pr-comments-<number>-skipped.json`. Create the file if it doesn't exist.

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
- Never silently fix a complex non-functional item without user approval
- If a comment is ambiguous (could be functional or non-functional), err on the side of asking
- Keep fixes minimal and scoped — don't refactor beyond what the comment asks for
- If fixing one comment conflicts with another, flag the conflict and ask
- If a comment references code that no longer exists (already changed), note it as resolved
