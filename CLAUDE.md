# Claude Code Instructions for Newsflash Frontend

This file contains project-specific instructions for Claude Code when working on this codebase.

## Temporary Files

**ALWAYS** use `.tmp/` for writing temporary files. **NEVER** use other folders for temporary files.

## Project Overview

This is a **Vite 8 + React 19 + TypeScript** single-page application (SPA). The project follows Bulletproof React architecture with strict module boundaries enforced via ESLint.

- **Build tool:** Vite 8
- **UI framework:** React 19
- **Language:** TypeScript (strict mode)
- **Package manager:** npm
- **Unit tests:** Vitest
- **E2E tests:** Playwright
- **Linting:** ESLint (flat config)
- **UI components:** shadcn/ui (in `src/components/ui/`)
- **Formatting:** Prettier

## Code Style and Standards

### TypeScript

- **Strict mode enabled** - All code must pass TypeScript strict checks
- **Type imports** - Use `import type` for type-only imports (enforced by ESLint)
- **Type definitions** - Prefer `interface` over `type` for object shapes
- **No explicit any** - Use proper types or `unknown` with type guards

```typescript
// Good
import type { ReactNode } from "react"
interface Props { children: ReactNode }

// Bad
import { ReactNode } from "react"
type Props = { children: ReactNode }
```

### Formatting

- **Indentation:** 2 spaces
- **Quotes:** Double quotes (except to avoid escaping)
- **Semicolons:** Never (no semicolons)
- **Line length:** Max 120 characters (warning)
- **Trailing commas:** Always in multiline

```typescript
// Good
const config = {
  name: "example",
  enabled: true,
}

// Bad
const config = {
  name: 'example',
  enabled: true
};
```

### Import Order

Imports are automatically sorted by ESLint. Order:
1. Node.js builtins (`node:*`)
2. External packages
3. Internal imports (`@/*`)
4. Parent imports (`../`)
5. Sibling imports (`./`)
6. Type imports

```typescript
import { useState } from "react"
import { cn } from "@/utils/css-utils"
import { Component } from "../component"
import { helper } from "./helper"
import type { Props } from "./types"
```

## Architecture Rules

### Module Boundaries (CRITICAL)

The project enforces strict architectural boundaries via ESLint `import/no-restricted-paths`:

```
app → features → shared modules
  ↓       ↓
  ✓       ✗  (features cannot import from app)
  ✓       ✓  (both can import from shared)
```

**Shared modules** (`components/`, `hooks/`, `lib/`, `types/`, `utils/`) must remain pure and cannot import from `features/` or `app/`.

**Before adding imports**, verify they don't violate these rules:
- Features importing from `app/` — FORBIDDEN
- Shared modules importing from `features/` or `app/` — FORBIDDEN
- App importing from anywhere — OK
- Features importing from shared modules — OK

### File Organization

- **Colocate tests** - Place `*.test.ts` files next to source files
- **Feature modules** - Group related functionality in `features/`
- **Shared components** - UI components in `components/ui/`
- **Utilities** - Pure functions in `utils/`, libraries in `lib/`

## React Components

### Component Guidelines

- **Readonly props** - All props interface properties must use the `readonly` modifier (see [`docs/component-patterns.md`](docs/component-patterns.md#read-only-props-critical))
- **Minimize state** - Keep components focused and state minimal
- **Extract hooks** - Move complex logic into custom hooks
- **Composition over nesting** - Prefer composing small components

### Component Naming

- **PascalCase** for components: `UserProfile`, `ArticleCard`
- **camelCase** for utilities: `formatDate`, `calculateTotal`
- **kebab-case** for files: `user-profile.tsx`, `article-card.tsx`

## Detailed Guidelines (`docs/`)

The `docs/` folder contains comprehensive guidelines with code examples, checklists, and patterns. **ALWAYS consult the relevant doc before writing or reviewing code in that area.**

| File | Concern | Keywords |
|------|---------|----------|
| [`docs/mobile-first.md`](docs/mobile-first.md) | Mobile-first responsive design | Tailwind breakpoints, spacing, grids, typography, navigation, cards, forms, touch targets, component checklist, performance |
| [`docs/wcag-accessibility.md`](docs/wcag-accessibility.md) | WCAG 2.1 Level AA compliance | Alt text, keyboard a11y, focus indicators, form labels, semantic HTML, ARIA, color contrast, touch targets, axe-core, testing checklist |
| [`docs/owasp-security.md`](docs/owasp-security.md) | OWASP frontend security | Input validation, XSS prevention, DOMPurify, eval, localStorage, sensitive data logging, error messages, URL validation, open redirects, dependency audit |
| [`docs/component-patterns.md`](docs/component-patterns.md) | React component architecture | Lazy loading, code splitting, Suspense, composition, children, render props, compound components, custom hooks, module boundaries, React Compiler, bundle size |
| [`docs/testing-guidelines.md`](docs/testing-guidelines.md) | Testing standards and patterns | Vitest, Playwright, edge cases, parameterized tests, hook testing, component testing, mocking, coverage 80%+, E2E selectors, axe-core a11y audits |
| [`docs/error-handling.md`](docs/error-handling.md) | Error handling patterns | Try/catch, error boundaries, fetch API client, retry logic, loading/error state, generic user messages, console.error, error display hierarchy, never swallow errors |
| [`docs/react-ui.md`](docs/react-ui.md) | React UI state patterns | Loading states, empty states, button disabled during async, skeleton vs spinner, form submission, optimistic updates, anti-patterns checklist |

### How to use these docs

- **Before writing code:** Check which docs apply to your task (e.g., new component = component-patterns + mobile-first + wcag-accessibility)
- **Before reviewing code:** Verify against the relevant checklists
- **CRITICAL sections** (mobile-first, WCAG, OWASP) are non-negotiable requirements

## Keeping `docs/` Up to Date

See **Quality Gates > Documentation Currency** above. Stale docs are worse than no docs.

## Mobile-First Development (CRITICAL)

**Full guide:** [`docs/mobile-first.md`](docs/mobile-first.md)

All components MUST be designed mobile-first. Base Tailwind styles target mobile, then override with `md:`, `lg:`, etc. Touch targets minimum 44x44px. Test at 320px, 375px, 768px, 1024px, 1440px.

## WCAG Level AA Accessibility (CRITICAL)

**Full guide:** [`docs/wcag-accessibility.md`](docs/wcag-accessibility.md)

All images need alt text, all interactive elements need keyboard access + visible focus, all inputs need labels, use semantic HTML, contrast ratio >= 4.5:1. ESLint jsx-a11y enforces 30+ rules automatically.

## OWASP Security Standards (CRITICAL)

**Full guide:** [`docs/owasp-security.md`](docs/owasp-security.md)

Validate all input, never `dangerouslySetInnerHTML` without DOMPurify, never `eval()`, never store tokens in localStorage, never log sensitive data, use generic error messages, validate URLs. ESLint security + no-secrets plugins enforce on commit.

## Testing

**Full guide:** [`docs/testing-guidelines.md`](docs/testing-guidelines.md)

- **Coverage:** 80%+ for new code
- **Unit:** Vitest — colocate tests with source files
- **E2E:** Playwright — tests in `tests-e2e/`
- **What to test:** utilities, hooks, business logic, complex components
- **What NOT to test:** simple presentational components, third-party wrappers

## Environment Variables

- **Public variables** - Prefix with `VITE_` (exposed to client bundle)
- **Server-only variables** - No prefix (only available in Vite config / build scripts)
- **Local development** - Use `.env.local` (gitignored)

```bash
# Public (accessible in browser via import.meta.env)
VITE_API_URL=https://api.example.com
```

## Git and Commits

### Commit Message Format

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `chore`, `style`

**IMPORTANT:**
- **NO commit body/description** - Keep commits simple: type, scope (optional), subject only
- **NO Co-Authored-By** - Never add Co-Authored-By lines to commits

### Branch Strategy

- **main** - Production releases
- **develop** - Integration branch
- **feature/<description>** - Feature branches

## Git Hooks (Automated)

**Pre-commit:**
- ESLint (accessibility + security + style rules)
- TypeScript type checking (`tsc -b`)
- Unit tests (`npm test`)
- Blocks commit if fails

## Common Tasks

### Development

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Testing

```bash
npm run test  # Run Vitest
npm run test:e2e   # Run Playwright
```

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/new-feature`
2. Add code in `src/features/feature-name/`
3. Write tests (`*.test.ts`)
4. Run linting: `npm run lint`
5. Run tests: `npm run test`
6. Commit with conventional format

## Performance

### Bundle Size

- Keep client-side JavaScript minimal
- Lazy load heavy components: `const Heavy = lazy(() => import("./Heavy"))`
- Use responsive images with proper `width`/`height` attributes and `loading="lazy"`

## Quality Gates (CRITICAL)

**After creating or modifying any file**, run these checks before considering the work done:

### IDE Diagnostics

**Run once as a finishing task** — after all edits are complete, not after every individual edit. Run `mcp__jetbrains__get_file_problems` on each file that was created or changed. Review all reported errors and warnings:

1. **Fix genuine issues** before considering the task done
2. **For false positives**, do NOT suppress or ignore silently — **ASK the user** how they want to handle each one (suppress, configure, or accept)

No file should be committed without a clean diagnostics check.

### Documentation Currency

After completing any task, check whether anything learned should be captured in `docs/`:

1. Did you discover a new pattern, gotcha, or best practice relevant to an existing doc? **Update that doc.**
2. Did you work in an area not yet covered by any doc? **Create a new doc** and add it to the table above.
3. Did a guideline in a doc turn out to be wrong or outdated? **Fix or remove it.**

## When in Doubt

- **Check existing code** - Follow patterns already in the codebase
- **Run linting** - ESLint will catch most issues
- **Read the error** - TypeScript and ESLint errors are usually clear
- **Test your changes** - Write tests for new functionality
