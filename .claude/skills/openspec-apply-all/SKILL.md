---
name: openspec-apply-all
description: Apply all open OpenSpec changes — analyzes overlap, parallelizes independent changes via worktrees, and sequences overlapping ones.
license: MIT
compatibility: Requires openspec CLI and git.
metadata:
  author: openspec
  version: "1.0"
---

Apply all open OpenSpec changes that have pending tasks. Analyzes file overlap between changes to determine which can run in parallel (separate worktrees) and which must run sequentially.

**Input**: None required. Optionally specify change names to include (e.g., `auth-refactor, feed-cache`). If omitted, all open changes with pending tasks are included.

**Steps**

1. **Discover open changes with pending tasks**

   Run `openspec list --json` to get all active changes. For each change, run:
   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Filter to only changes where `state` is NOT `"all_done"` and NOT `"blocked"`. If the user specified change names, filter to those.

   If no changes have pending tasks, report "All changes are complete — nothing to apply." and stop.

2. **Analyze overlap between changes**

   For each change with pending tasks, read:
   - `proposal.md` — look at the **## Impact** section for files that will change
   - `tasks.md` — scan pending task descriptions for file paths and module references
   - `design.md` — check for shared components or dependencies mentioned

   Build a **file-overlap matrix**: for each pair of changes, estimate whether they touch the same files or tightly coupled modules.

   **Overlap classification:**
   - **No overlap**: Changes touch completely different files/modules → can run in parallel (worktree)
   - **Light overlap**: Changes touch the same directory but different files → can likely run in parallel (worktree), but flag for review
   - **Heavy overlap**: Changes modify the same files or tightly coupled modules → must run sequentially

   Present the analysis to the user:
   ```
   ## Change Overlap Analysis

   | Change | Pending | Overlaps With | Strategy |
   |--------|---------|---------------|----------|
   | feed-cache | 4/7 | (none) | parallel |
   | auth-refactor | 3/5 | error-handling | sequential |
   | error-handling | 2/9 | auth-refactor | sequential (after auth-refactor) |

   **Parallel group:** feed-cache (worktree)
   **Sequential group:** auth-refactor → error-handling
   ```

3. **Estimate workload and confirm execution plan**

   Count the total pending tasks across all changes. Present the workload estimate alongside the overlap analysis:

   ```
   **Workload:** ~15 pending tasks across 4 changes

   **Execution modes:**
   1. Full parallel — fastest, highest API usage (all independent changes concurrent)
   2. Capped parallel (max 2 concurrent) — balanced [recommended]
   3. Fully sequential — safest for low API limits
   ```

   Use the **AskUserQuestion tool** to confirm. The user can:
   - Select an execution mode (default: capped parallel)
   - Override: move a change from parallel to sequential or vice versa
   - Exclude specific changes
   - Reorder the sequential group

4. **Launch parallel changes (worktree agents)**

   For each change in the parallel group, launch an **Agent** with `isolation: "worktree"` using the **worktree agent prompt**:

   ```
   Agent(
     description: "Apply <change-name>",
     isolation: "worktree",
     prompt: <see worktree agent prompt template below>
   )
   ```

   **Concurrency cap:** Launch at most 2 worktree agents simultaneously (unless the user chose "full parallel"). Queue the rest and launch them as earlier agents complete.

   Use `run_in_background: true` so they run concurrently. You will be automatically notified when each background agent completes — do NOT poll, sleep, or proactively check on their progress.

   When a background agent completes, check if there are queued changes waiting. If so, launch the next queued agent before waiting for the remaining ones.

   **Handling agent failures:** If a background agent returns an error, empty result, or reports a rate-limit/timeout issue:
   1. Do NOT launch any more agents — stop the queue
   2. Check for orphaned worktrees: `git worktree list` and identify any created by this run
   3. For each orphaned worktree, check if it has checkpoint commits (partial progress) — report these
   4. Report the failure to the user and suggest: "Re-run `/openspec-apply-all` after the rate limit resets. Completed tasks are preserved."

   Wait for all launched agents to finish (or fail) before proceeding to step 5.

5. **Run sequential changes (in-place agents)**

   After all parallel agents complete (or if there are no parallel changes), run sequential changes one at a time in the main worktree:

   For each change in the sequential group, launch an **Agent** (no worktree isolation) using the **sequential agent prompt**:

   ```
   Agent(
     description: "Apply <change-name>",
     prompt: <see sequential agent prompt template below>
   )
   ```

   Wait for each agent to complete before starting the next one. After each agent completes, report its results before continuing.

6. **Aggregate and report results**

   After all agents complete, display a summary:

   ```
   ## Apply All — Results

   | Change | Result | Tasks Done | Commit |
   |--------|--------|------------|--------|
   | feed-cache | complete | 4/4 | feat(feed): add caching layer |
   | auth-refactor | complete | 3/3 | feat(auth): refactor middleware |
   | error-handling | paused | 1/2 | fix(errors): add boundary component |

   **3 changes processed:** 2 complete, 1 paused
   ```

   If any change paused with issues, display the issue details and suggest next steps.

7. **Squash and merge worktree branches**

   For each completed worktree agent that produced changes:

   1. **Squash checkpoint commits:** Before merging, squash all commits on the worktree branch into a single commit. In the worktree directory:
      ```bash
      # Find the merge-base (where the branch diverged)
      BASE=$(git merge-base HEAD <main-branch>)
      git reset --soft $BASE
      git commit -m "<final commit message from the agent's result>"
      ```
      This replaces the per-task checkpoint commits with one clean commit. Run lint and tests on the squashed result to validate.
   2. Attempt to merge the worktree branch into the current branch using `git merge <branch>`.
   3. **If the merge succeeds** (no conflicts): continue to the next branch. No user confirmation needed.
   4. **If the merge has conflicts**: abort the merge (`git merge --abort`), report the conflicting files, and use the **AskUserQuestion tool** to ask the user how to proceed (resolve manually, skip this change, etc.).

   After all worktree branches are processed, report which branches were merged and which were skipped.

   If there were no worktree agents (all changes ran sequentially), skip this step.

   **Cleanup:** After all merges (or skips), remove worktrees created by this run:
   ```bash
   git worktree remove <worktree-path>
   ```
   If removal fails (e.g., uncommitted changes from a failed agent), report the path and let the user decide.

8. **Archive completed changes and commit**

   After reporting results, archive every change that completed all its tasks (result = "complete" in the summary table).

   For each completed change, invoke the `openspec-archive-change` skill directly (in the main thread, NOT via subagents) with the change name as argument. Process each completed change sequentially.

   If archiving a change fails or encounters an issue, use the **AskUserQuestion tool** to ask the user for guidance before continuing.

   After all changes are archived, commit in a single commit:

   ```bash
   git add openspec/changes/
   git commit -m "docs: archive completed openspec changes"
   ```

   If no changes completed, skip this step entirely.

---

**Agent Prompt Templates**

Each subagent receives the appropriate prompt below (with values filled in).

**Worktree agent prompt** (for parallel changes):

```
You are applying OpenSpec change "<change-name>".

Use the Skill tool to invoke the `openspec-apply-change` skill with argument: "<change-name>"

The skill will:
1. Read the change context and tasks
2. Implement all pending tasks
3. Auto-commit via openspec-commit when done

CHECKPOINT COMMITS: After the openspec-apply-change skill completes (or pauses), verify that all completed work has been committed. The skill's auto-commit handles this via openspec-commit. These commits may be multiple (one per pause/completion cycle) — that is fine. The parent agent will squash them before merging.

Report your final status including:
- Change name
- How many tasks were completed vs total
- Whether you completed all tasks or paused (and why)
- The commit message used (if committed)
- Suggested final commit message for the squashed result (e.g., "feat(feed): add caching layer")

IMPORTANT: Do not ask the user questions — if you encounter a blocker, report it in your result and stop. The parent agent will handle user interaction.
```

**Sequential agent prompt** (for sequential changes, runs in main worktree):

```
You are applying OpenSpec change "<change-name>".

Use the Skill tool to invoke the `openspec-apply-change` skill with argument: "<change-name>"

The skill will:
1. Read the change context and tasks
2. Implement all pending tasks
3. Auto-commit via openspec-commit when done

Report your final status including:
- Change name
- How many tasks were completed vs total
- Whether you completed all tasks or paused (and why)
- The commit message used (if committed)

If you encounter ambiguity or a blocker, use the AskUserQuestion tool to ask the user directly. Do not continue based on assumptions.
```

---

**Guardrails**

- **Always analyze overlap before launching** — never blindly parallelize all changes
- **Worktree agents cannot interact with the user** — they must be autonomous. If blocked, they report back and the parent handles it
- **Sequential agents run in the main worktree** — no isolation needed since they run one at a time
- **Report progress at natural milestones** — after parallel group completes, after each sequential change completes
- **If a parallel agent fails or has merge issues**, report this clearly and suggest manual resolution
- **If a worktree merge conflicts after overlap analysis predicted "no overlap"**, report the conflicting files alongside the original overlap analysis so the user can see what was missed. Suggest re-running the conflicting change sequentially after the first one is merged
- **Worktree results need merging** — after all worktree agents complete, squash checkpoint commits and merge their branches automatically (step 7). If a merge has conflicts, abort and ask the user for guidance
- **Never force-push or force-merge** — use standard `git merge`, abort on conflicts, and let the user decide how to resolve
- **If only one change has pending tasks**, skip the overlap analysis and just invoke `openspec-apply-change` directly (no subagent needed)

**Rate-Limit Resilience**

- **Concurrency cap:** Default to max 2 concurrent worktree agents. Queue the rest. This limits peak API usage
- **Stop on failure:** If any agent returns an error or empty/timeout result, stop launching queued agents. Assume rate limit until proven otherwise
- **Checkpoint commits are safe to squash:** Worktree agents commit via `openspec-commit` after each apply cycle. The parent squashes these into one clean commit before merging (step 7)
- **Resumability:** Task checkboxes in `tasks.md` persist progress. If execution is interrupted, re-running `/openspec-apply-all` will only attempt remaining pending tasks
- **Worktree cleanup:** Always run `git worktree list` after all agents finish (success or failure). Remove worktrees created by this run. If a worktree has uncommitted changes, report it to the user before removing
- **Recovery prompt:** If the skill detects orphaned worktrees from a previous run (worktrees with branch names matching the `openspec-apply-all` pattern), ask the user: "Found worktrees from a previous run. Check for salvageable work, clean up, or ignore?"