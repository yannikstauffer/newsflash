## Why

The project carries dead scaffolding from the Vite starter template and has dependency hygiene issues from initial setup. `src/App.css` (185 LOC) is unused Vite demo CSS not imported anywhere, `src/index.css` has duplicate CSS variable sets (Vite starter variables alongside shadcn theme variables), `shadcn` is incorrectly listed as a production dependency, three devDependencies are unused (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`), `@testing-library/jest-dom` is installed but never configured in Vitest, and `dist/` needs to be verified as excluded from git.

## What Changes

- **Delete** `src/App.css` — 185 lines of unused Vite starter CSS (counter, hero, next-steps, spacer, ticks classes) not imported by any component.
- **Clean up** `src/index.css` — Remove Vite starter CSS variables (`--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`) and their associated dark-mode overrides; remove starter element styles (`#root`, `h1`, `h2`, `p`, `code`, `.counter`, `#social`); keep shadcn theme variables, `@theme inline` block, `.dark` theme, and `@layer base`.
- **Move** `shadcn` from `dependencies` to `devDependencies` in `package.json` — it is a CLI code-generation tool, not a runtime dependency.
- **Remove** unused devDependencies: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier` — none are referenced in `eslint.config.mjs` (project uses `typescript-eslint` flat config instead).
- **Configure** `@testing-library/jest-dom` in Vitest by adding a setup file that imports it, and reference that setup file in `vitest.config.ts`.
- **Verify** `dist/` is in `.gitignore` and not tracked by git.

## Capabilities

### New Capabilities

- `project-cleanup`: Remove dead Vite starter scaffolding, fix dependency classification, configure testing utilities, and ensure build artifacts are excluded from version control.

### Modified Capabilities

(none)

## Impact

- `src/App.css` — deleted entirely
- `src/index.css` — Vite starter variables and element styles removed; shadcn theme preserved
- `package.json` — `shadcn` moved to devDependencies; `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier` removed from devDependencies
- `vitest.config.ts` — `setupFiles` property added pointing to test setup file
- `src/test/setup.ts` (new) — imports `@testing-library/jest-dom`
- `.gitignore` — verify `dist/` entry exists (already present)
