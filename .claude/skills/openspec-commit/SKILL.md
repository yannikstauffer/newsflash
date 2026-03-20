---
name: openspec-commit
description: Commit changes from an OpenSpec proposal or apply. Called automatically after openspec-propose and openspec-apply-change complete. Can also be invoked manually.
license: MIT
compatibility: Requires git.
metadata:
  author: openspec
  version: "1.0"
---

Commit changes made by an OpenSpec proposal or apply operation.

This skill is called **automatically** at the end of `openspec-propose` and `openspec-apply-change`. It can also be invoked manually via `/opsx:commit`.

---

**Input**: Requires two pieces of context (passed by the calling skill or inferred):
- `change-name`: The OpenSpec change name (kebab-case)
- `operation`: Either `"propose"` or `"apply"`

If invoked manually without context, infer from conversation history or ask.

**Steps**

1. **Determine what to commit**

   Run `git status` to see all changed files.

   Identify files relevant to the operation:

   - **For `propose`**: Files under `openspec/changes/<change-name>/` (proposal.md, design.md, tasks.md, .openspec.yaml, specs/, etc.)
   - **For `apply`**: All changed source files (`src/`, `tests-e2e/`, config files) AND the tasks file that was updated (`openspec/changes/<change-name>/tasks.md`)

   **IMPORTANT**: Only stage files that were part of this operation. Do NOT stage unrelated changes.

2. **Stage the relevant files**

   Use `git add` with explicit file paths. Never use `git add -A` or `git add .`.

3. **Generate the commit message**

   Follow the project's commit format: `<type>(<scope>): <subject>` — subject line only, no body.

   **For `propose`**:
   ```
   docs(<change-name>): add openspec proposal
   ```

   **For `apply`** — craft a message based on what was actually implemented:
   - Read the change's proposal.md to understand the purpose
   - Read the tasks.md to see which tasks were completed this session
   - Write a commit message that describes the implementation work done
   - Use appropriate type: `feat` for new features, `fix` for bug fixes, `refactor` for refactoring, etc.
   - Examples:
     - `feat(feed): add day-based pagination and lazy loading`
     - `fix(connectors): handle missing image URLs in atom feeds`
     - `refactor(filter): simplify filter bar state management`

   **IMPORTANT**: Keep the subject under 72 characters. No commit body. No Co-Authored-By.

4. **Create the commit**

   ```bash
   git commit -m "<message>"
   ```

5. **Verify and report**

   Run `git status` to confirm the commit succeeded.

   Display:
   ```
   Committed: <commit message>
   Files: <count> files changed
   ```

**Guardrails**
- Never use `git add -A` or `git add .` — always stage specific files
- Never add a commit body or Co-Authored-By line
- Never commit files that look unrelated to the current operation
- If there are no changes to commit, say so and skip — do not create empty commits
- If staging reveals sensitive files (.env, credentials), warn and exclude them
- Respect the project's commit message format strictly
- If unsure about the commit type for an apply, read the proposal to determine intent
