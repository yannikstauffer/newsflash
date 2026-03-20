## 1. Dead CSS Removal

- [ ] 1.1 Delete `src/App.css`
- [ ] 1.2 Search `src/` to confirm no remaining imports of `App.css`

## 2. Index CSS Cleanup

- [ ] 2.1 Remove Vite starter CSS variables from `:root` in `src/index.css` (`--text`, `--text-h`, `--bg`, `--code-bg`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`, and the `font`, `letter-spacing`, `color-scheme`, `color`, `background`, `font-synthesis`, `text-rendering`, `-webkit-font-smoothing`, `-moz-osx-font-smoothing` properties, and the `@media` font-size override)
- [ ] 2.2 Remove Vite starter dark-mode variable overrides (`@media (prefers-color-scheme: dark)` block with `--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow` and `#social .button-icon` rule)
- [ ] 2.3 Remove Vite starter element styles (`#root`, `body`, `h1`, `h2`, `p`, `code`, `.counter` rules)
- [ ] 2.4 Verify shadcn theme variables, `@theme inline` block, `.dark` class, and `@layer base` are preserved

## 3. Dependency Fixes

- [ ] 3.1 Move `shadcn` from `dependencies` to `devDependencies` in `package.json`
- [ ] 3.2 Remove `@typescript-eslint/eslint-plugin` from `devDependencies`
- [ ] 3.3 Remove `@typescript-eslint/parser` from `devDependencies`
- [ ] 3.4 Remove `eslint-config-prettier` from `devDependencies`
- [ ] 3.5 Run `npm install` to update `package-lock.json`

## 4. Vitest jest-dom Setup

- [ ] 4.1 Create `src/test/setup.ts` with `import "@testing-library/jest-dom/vitest"`
- [ ] 4.2 Add `setupFiles: ["./src/test/setup.ts"]` to the `test` config in `vitest.config.ts`

## 5. Git Hygiene

- [ ] 5.1 Verify `dist` is listed in `.gitignore`
- [ ] 5.2 Verify `dist/` has no tracked files via `git ls-files dist/`

## 6. Validation

- [ ] 6.1 Run `npm run lint` and confirm no new errors
- [ ] 6.2 Run `npm run test` and confirm all tests pass
- [ ] 6.3 Run `npm run build` and confirm successful build
