## ADDED Requirements

### Requirement: Dead CSS removal
The project SHALL NOT contain `src/App.css`. All 185 lines of Vite starter CSS (`.counter`, `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, `.ticks` classes) SHALL be deleted.

#### Scenario: App.css does not exist
- **WHEN** the cleanup is complete
- **THEN** `src/App.css` SHALL NOT exist in the project

#### Scenario: No imports reference App.css
- **WHEN** searching the entire `src/` directory for `App.css` imports
- **THEN** zero matches SHALL be found

### Requirement: Index CSS contains only shadcn theme
The `src/index.css` file SHALL contain only shadcn/Tailwind configuration: the `@import` statements, `@custom-variant`, shadcn CSS variables (`:root` with `--background`, `--foreground`, `--primary`, etc.), `@theme inline` block, `.dark` theme overrides, and `@layer base` rules. All Vite starter CSS variables (`--text`, `--text-h`, `--bg`, `--code-bg`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`) and element styles (`#root`, `h1`, `h2`, `p`, `code`, `.counter`, `#social .button-icon`) SHALL be removed.

#### Scenario: Vite starter variables are absent
- **WHEN** inspecting `src/index.css`
- **THEN** none of the following CSS custom properties SHALL be present: `--text`, `--text-h`, `--bg`, `--code-bg`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`

#### Scenario: Vite starter element styles are absent
- **WHEN** inspecting `src/index.css`
- **THEN** no rule blocks for `#root`, `h1`, `h2`, `p`, `code`, `.counter`, or `#social` SHALL be present

#### Scenario: Shadcn theme variables are preserved
- **WHEN** inspecting `src/index.css`
- **THEN** the `:root` block SHALL contain shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--input`, `--ring`, `--border`, `--radius`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--chart-1` through `--chart-5`, `--sidebar` and sidebar variants)

### Requirement: Correct dependency classification
The `shadcn` package SHALL be listed under `devDependencies`, not `dependencies`, in `package.json`. It is a CLI code-generation tool not required at runtime.

#### Scenario: shadcn in devDependencies
- **WHEN** inspecting `package.json`
- **THEN** `shadcn` SHALL appear in `devDependencies` and SHALL NOT appear in `dependencies`

### Requirement: Unused devDependencies removed
The following packages SHALL be removed from `devDependencies` in `package.json`: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`. These are not referenced in the ESLint flat config.

#### Scenario: Legacy TypeScript ESLint packages removed
- **WHEN** inspecting `package.json`
- **THEN** `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` SHALL NOT appear in any dependency section

#### Scenario: eslint-config-prettier removed
- **WHEN** inspecting `package.json`
- **THEN** `eslint-config-prettier` SHALL NOT appear in any dependency section

### Requirement: jest-dom configured in Vitest
The `@testing-library/jest-dom` matchers SHALL be available globally in all Vitest tests via a setup file.

#### Scenario: Setup file exists and imports jest-dom
- **WHEN** inspecting `src/test/setup.ts`
- **THEN** the file SHALL contain an import of `@testing-library/jest-dom/vitest`

#### Scenario: Vitest config references setup file
- **WHEN** inspecting `vitest.config.ts`
- **THEN** the `test.setupFiles` property SHALL include the path to the jest-dom setup file

### Requirement: Build artifacts excluded from git
The `dist/` directory SHALL be listed in `.gitignore` and SHALL NOT be tracked by git.

#### Scenario: dist in gitignore
- **WHEN** inspecting `.gitignore`
- **THEN** an entry for `dist` SHALL be present

#### Scenario: dist not tracked
- **WHEN** running `git ls-files dist/`
- **THEN** the output SHALL be empty (no tracked files)
