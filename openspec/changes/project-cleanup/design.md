## Context

The project was scaffolded with Vite's React-TS template, then shadcn/ui was added. Both left behind artifacts that are no longer needed: Vite's demo CSS, duplicate CSS variable scopes, misplaced dependencies, and unconfigured test utilities. This is a straightforward cleanup with no architectural decisions.

## Goals / Non-Goals

**Goals:**

- Remove all unused Vite starter template artifacts from the codebase
- Correct dependency classification in `package.json`
- Configure `@testing-library/jest-dom` so tests can use DOM matchers
- Ensure build output is excluded from version control

**Non-Goals:**

- Redesigning the CSS architecture or theme system
- Upgrading any dependencies
- Adding new features or capabilities
- Refactoring application code

## Decisions

1. **Delete `src/App.css` entirely** rather than selectively pruning it. No component imports this file, so every class in it is dead code.

2. **Remove Vite starter CSS variables and element styles from `src/index.css`** while keeping shadcn theme variables, the `@theme inline` block, `.dark` theme, and `@layer base`. The Vite starter defined its own `--text`, `--bg`, `--border`, etc. variables that conflict with shadcn's theme system. The shadcn variables (e.g., `--background`, `--foreground`, `--primary`) are the ones actively used by components.

3. **Move `shadcn` to devDependencies.** The `shadcn` package is a CLI tool that generates component source files into the project. It is never imported at runtime and should not be in production dependencies.

4. **Remove `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, and `eslint-config-prettier`.** The ESLint config (`eslint.config.mjs`) uses the `typescript-eslint` flat config package directly, which bundles its own parser and plugin. These legacy packages are not imported anywhere. `eslint-config-prettier` is also unused — the project uses `eslint-plugin-prettier` instead.

5. **Create `src/test/setup.ts`** that imports `@testing-library/jest-dom` and reference it via `setupFiles` in `vitest.config.ts`. This is the standard Vitest pattern for making jest-dom matchers available globally in tests.

## Risks / Trade-offs

- **CSS variable removal could break unseen usages** → Mitigated by searching the entire `src/` tree for references to Vite starter variable names before deletion. The shadcn theme provides equivalent semantic tokens.
- **Removing devDependencies could break CI** → Mitigated by verifying none are imported in `eslint.config.mjs` or any other config file. The `typescript-eslint` flat config package provides equivalent functionality.
