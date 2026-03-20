---
name: "OPSX: Commit"
description: Commit changes from the latest OpenSpec operation (propose or apply)
category: Workflow
tags: [workflow, git, experimental]
---

Commit changes from an OpenSpec operation.

This is usually called automatically after `/opsx:propose` or `/opsx:apply`. You can also run it manually.

**Input**: Optionally specify a change name and operation (e.g., `/opsx:commit add-auth apply`). If omitted, infer from conversation context.

Use the **openspec-commit** skill to perform the commit.